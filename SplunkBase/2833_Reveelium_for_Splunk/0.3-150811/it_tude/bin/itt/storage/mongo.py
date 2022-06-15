#!/usr/bin/python
# -*- coding: utf-8 -*-
# Author: Vincent Alquier <v.alquier@itrust.fr>
# Copyrights (c) 2015 by ITrust

"""MongoDB tools.
"""

from .expr import Compiler
from .store import Store, storable_name
from itrust.common import with_metaclass
from itt.common import server_timezone
from datetime import datetime
from logging import getLogger
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.son_manipulator import ObjectIdInjector, SONManipulator
from six import text_type
from uuid import uuid4


LOGGER = getLogger(__name__)


#FIXME: handles mongo/connection exceptions


class MongoCompiler(Compiler):
    """Convert search expressions from the internal (itt.storage specific)
    representation to the pymongo expected form.
    """

    def compile(self, expr):
        """Run the conversion of the given expression.
        expr is the internal (itt.storage specific) representation of search
        criteria. expr is expected to be an instance of expr.Expr (or one of it
        subclass).
        """
        if expr is None:
            return {}
        return self._compile(expr)

    def _do_sort_impl(self, *exprs):
        return list(exprs)

    def _do_asc_impl(self, oper):
        return (oper, ASCENDING)

    def _do_desc_impl(self, oper):
        return (oper, DESCENDING)

    def _do_and_impl(self, *exprs):
        res = {}
        for exp in exprs:
            res.update(exp)
        return res

    def _do_contains_impl(self, oper0, oper1):
        res = {}
        res[oper0] = {'$all': oper1}
        return res

    def _do_equal_impl(self, oper0, oper1):
        return {oper0: oper1}

    def _do_lt_impl(self, oper0, oper1):
        res = {}
        res[oper0] = {'$lt': oper1}
        return res

    def _do_gt_impl(self, oper0, oper1):
        res = {}
        res[oper0] = {'$gt': oper1}
        return res

    def _do_le_impl(self, oper0, oper1):
        res = {}
        res[oper0] = {'$lte': oper1}
        return res

    def _do_ge_impl(self, oper0, oper1):
        res = {}
        res[oper0] = {'$gte': oper1}
        return res

    def _do_in_impl(self, oper0, oper1):
        res = {}
        #FIXME: the purpose of intermediate repr is to avoid specific cases
        #FIXME: oper1 should always be an instance of ListExpr
        if type(oper1) is list:
            res[oper0] = {'$in': oper1}
        else:
            res[oper0] = oper1
        return res

    def _do_nin_impl(self, oper0, oper1):
        res = {}
        res[oper0] = {'$nin': oper1}
        return res

    def _do_like_impl(self, oper0, oper1):
        res = {}
        res[oper0] = {"$regex": oper1}
        return res

    def _do_or_impl(self, *exprs):
        res = {}
        l = list()
        for exp in exprs:
            l.append(exp)
        res['$or'] = l
        return res

    def _do_concat_impl(self, *exprs):
        return exprs

    def _do_prop_impl(self, prop):
        return prop.evaluate()

    def _do_const_impl(self, const):
        return const.evaluate()

    def _do_likeoperand_impl(self, list_concat):
        return ''.join(list_concat)

    def _do_likeoperator_impl(self, operator):
        return '.*'

    def _do_dateoperand_impl(self, operand):
        return operand.evaluate()

    def _do_list_impl(self, exprs):
        return exprs

    def _do_range_impl(self, oper0, oper1):
        res = {}
        res['$gte'] = oper0
        res['$lt'] = oper1
        return res


class ModelMetaInjector(ObjectIdInjector):
    """Non-coying son manipulator that automatically adds the _id, created_at
    and updated_at fields if missing.
    """

    def transform_incoming(self, son, collection):
        """Add an _id field if it is missing.
        """
        now = datetime.today()
        now.replace(microsecond=0)  # No need for precision bellow second
        if son.get("_id") is None:
            son["_id"] = text_type(uuid4())
            son["created_at"] = now
        elif not "created_at" in son:
            son["created_at"] = now
        son["updated_at"] = now

        server_tz = server_timezone()
        for key, value in son.items():
            if isinstance(value, datetime) and value.tzinfo is None:
                son[key] = server_tz.localize(value)

        return son


class ModelSONManipulator(SONManipulator):
    """Copying son manipultor used to convert a Model to it's document
    representation.
    """

    def transform_incoming(self, son, collection):
        model_name = collection.name
        son_copy = dict(son)
        #FIXME: this is a temporary fix, as we should recursively transform
        # values in all sub-collections and we just handle the 'set' specific
        # case
        for key, value in son.items():
            if isinstance(value, set):
                son_copy[key] = list(value)
        return son_copy

    def transform_outgoing(self, son, collection):
        storable_name = collection.name
        server_tz = server_timezone()
        for key, value in son.items():
            if isinstance(value, datetime):
                son[key] = server_tz.fromutc(value)
        return son

    def will_copy(self):
        return True


class MongoStore(Store):

    _MAX_RES = 50

    def __init__(self, uri, db_name):
        Store.__init__(self, compiler=MongoCompiler())
        self.conn = MongoClient(uri)
        self.db = self.conn[db_name]
        self.db.add_son_manipulator(ModelSONManipulator())
        self.db.add_son_manipulator(ModelMetaInjector())
        self._cache = dict()

    def _load_one(self, model_name, model_id):
        """Load a model data from the store (using model_id as identifier to
        retrieve it).
        return None if the model is not found
        """
        collection = self.db[model_name]
        return collection.find_one({"_id": model_id})

    def _save_one(self, model):
        """Save one model to the store. Add the model in case of a first time
        save or update it otherwise.
        """
        model_name = storable_name(model)
        collection = self.db[model_name]
        son = vars(model)
        collection.save(son)

    #def _save_all(self, models):
    #    """Save all given models to the store. All models must be of the same
    #    type. models is iterable.
    #    """
    #    assert len(models) > 0
    #    model_name = storable_name(models[0])
    #    models = map(vars, models)
    #    collection = self.db[model_name]
    #    collection.save(models)

    def _search(self, model_name, criteria, sort=None, offset=0, limit=49):
        """Return a dict containing the following keys:
         * offset: index of the first object returned
         * limit: index of the last element returned
         * count: total number of objects in the collection
         * data: an iterable on the objects data
         * maximum: the maximum number of objects to query at once
        """
        collection = self.db[model_name]
        filters = self._compiler.compile(criteria)
        sort_expr = sort is None and [] or self._compiler.compile(sort)
        if len(sort_expr) == 0:
            sort_expr = "_id"  # FIXME: what if no _id on model ?
        query = collection.find(filters)
        count = query.count()
        if offset >= count:
            data = []
            limit = count - 1
        else:
            limit = min(limit, offset + self._MAX_RES - 1, count - 1)
        if limit < 0:
            limit = 0
            data = []
        else:
            data = query.sort(sort_expr)[offset:limit + 1]
            count = data.count()
        return {"maximum": self._MAX_RES,
                "offset": offset,
                "limit": limit,
                "count": count,
                "data": data,
                }

    def _remove_one(self, model):
        """Remove the given model from the store.
        """
        model_name = storable_name(model)
        collection = self.db[model_name]
        if model._id is not None:
            collection.remove({"_id": model._id})

    def _remove_one_by_id(self, model_name, model_id):
        """Remove a model from the store, using model_name to identify the type
        and model_id to identify the model.
        """
        collection = self.db[model_name]
        collection.remove({"_id": model_id})
