#!/usr/bin/python
# -*- coding: utf-8 -*-
# Author: Vincent Alquier <v.alquier@itrust.fr>
# Author: Julien Chakra-Breil <j.chakra-breil@itrust.fr>
# Copyrights (c) 2015 by ITrust

"""Test implementation of the Store class.
"""

from copy import deepcopy
from six import text_type
from uuid import uuid4
from .store import storable_name, Store
from .expr import Compiler
from logging import getLogger


LOGGER = getLogger(__name__)


class TempCompiler(Compiler):
    """
    """
    def compile(self, expr):
        """
        """
        def filter_list(x):
            """
            """
            return self._compile(expr)(x)

        return filter_list

    def _do_and_impl(self, *exprs):
        """
        """
        def evaluate(x):
            for func in exprs:
                if not func(x):
                    return False
            return True
        return evaluate

    def _do_equal_impl(self, oper0, oper1):
        """
        """
        def evaluate(x):
            return x[oper0] == oper1
        return evaluate

    def _do_lt_impl(self, oper0, oper1):
        """
        """
        def evaluate(x):
            return x[oper0] < oper1
        return evaluate

    def _do_gt_impl(self, oper0, oper1):
        """
        """
        def evaluate(x):
            return x[oper0] > oper1
        return evaluate

    def _do_le_impl(self, oper0, oper1):
        """
        """
        def evaluate(x):
            return x[oper0] <= oper1
        return evaluate

    def _do_ge_impl(self, oper0, oper1):
        """
        """
        def evaluate(x):
            return x[oper0] >= oper1
        return evaluate

    def _do_in_impl(self, oper0, oper1):
        """
        """
        def evaluate(x):
            return oper1(x[oper0])
        return evaluate

    def _do_like_impl(self, oper0, oper1):
        """
        """
        def evaluate(x):
            return oper1(x[oper0])
        return evaluate

    def _do_or_impl(self, *exprs):
        """
        """
        def evaluate(x):
            for func in exprs:
                if func(x):
                    return True
            return False
        return evaluate

    def _do_concat_impl(self, *exprs):
        """
        """
        return exprs

    def _do_prop_impl(self, prop):
        """
        """
        return prop.evaluate()

    def _do_const_impl(self, const):
        """
        """
        return const.evaluate()

    def _do_likeoperand_impl(self, list_concat):
        """
        """
        def evaluate(x):
            if list_concat.count('*') == 1:
                if list_concat.index('*') == 0:
                    return x.endswith(list_concat[1])
                elif list_concat.index('*') == 1:
                    return x.startswith(list_concat[0])
            return list_concat[0] in x
        return evaluate

    def _do_likeoperator_impl(self, operator):
        """
        """
        #return operator.evaluate()
        return '*'

    def _do_dateoperand_impl(self, operand):
        """
        """
        return operand.evaluate()

    def _do_list_impl(self, exprs):
        """
        """
        def evaluate(x):
            return x in exprs
        return evaluate

    def _do_range_impl(self, oper0, oper1):
        """
        """
        def evaluate(x):
            return oper0 <= x <= oper1
        return evaluate


class TempStore(Store):
    """Memory only (no persistence) store.
    """

    _MAX_RES = 10

    def __init__(self):
        Store.__init__(self, TempCompiler())
        self._cache = dict()

    def _load_one(self, model_name, model_id):
        """Load a model data from the store (using model_id as identifier to
        retrieve it).
        return None if the model is not found
        """
        collection = self._cache.setdefault(model_name, {})
        return deepcopy(collection.get(model_id))

    def _save_one(self, model):
        """Save one model to the store. Add the model in case of a first time
        save or update it otherwise.
        """
        model_name = storable_name(model)
        collection = self._cache.setdefault(model_name, {})
        inst_vars = vars(model)
        inst_id = inst_vars.setdefault("_id", text_type(uuid4()))
        if inst_id is None:
            inst_id = inst_vars["_id"] = text_type(uuid4())
        collection[inst_id] = deepcopy(inst_vars)

    def _search(self, model_name, criteria, offset=0, limit=9):
        """This implementation does not care of specified criteria

        Return a dict containing the following keys:
         * offset: index of the first object returned
         * limit: index of the last element returned
         * count: total number of objects in the collection
         * data: an iterable on the objects data
         * maximum: the maximum number of objects to query at once
        """
        collection = self._cache.setdefault(model_name, {})
        count = len(collection)
        if offset < 0:
            raise IndexError("offset out of range")
        if offset >= count:
            data = []
            limit = count - 1
        else:
            limit = min(limit, offset + self._MAX_RES - 1, count - 1)
            data = deepcopy(list(collection.values())[offset:limit + 1])
            if criteria is not None:
                func = self._compiler.compile(criteria)
                data = list(filter(func, data))
                count = len(data)
        if limit < 0:
            limit = 0
        return {"count": count,
                "offset": offset,
                "limit": limit,
                "maximum": self._MAX_RES,
                "data": data
                }

    def _remove_one(self, model):
        """Remove the given model from the store.
        """
        model_name = storable_name(model)
        try:
            model_id = model._id
        except AttributeError:
            return
        #else:
        collection = self._cache.setdefault(model_name, {})
        try:
            del collection[model_id]
        except KeyError:
            pass

    def _remove_one_by_id(self, model_name, model_id):
        """Remove a model from the store, using model_name to identify the type
        and model_id to identify the model.
        """
        collection = self._cache.setdefault(model_name, {})
        try:
            del collection[model_id]
        except KeyError:
            pass
