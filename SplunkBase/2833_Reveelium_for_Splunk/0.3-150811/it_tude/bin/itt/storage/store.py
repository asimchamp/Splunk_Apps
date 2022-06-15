#!/usr/bin/python
# -*- coding: utf-8 -*-
# Author: Vincent Alquier <v.alquier@itrust.fr>
# Copyrights (c) 2015 by ITrust

"""Tools used to serialize/store models.

Here is the common store exceptions hierarchy:

    StoreError:
     +-- StoreAuthenticationError
     +-- StoreConnectionError
     +-- StoreDataValidationError
     +-- StoreInternalError
     +-- StorePermissionError
     +-- StoreTimeout

"""

from six import string_types
from .expr import Asc, Compiler, Desc, SortExpr
from ..model import expr, properties, Property
from logging import getLogger
import re


LOGGER = getLogger(__name__)
_MODEL_NAME_RE = re.compile(r'^[a-zA-Z][0-9a-zA-Z_]*$')


#FIXME: add error handling


def storable_model(name):
    """Decorator to set the name of a model. This name is later used to
    identify the type of the model when stored. A model name should be plural
    as collection name. Use this decorator on a model cls only if you plan to
    store that model data.
    """
    if not isinstance(name, string_types):
        raise ValueError("'{0!r}' is not a valid model name".format(name))
    #else:
    if _MODEL_NAME_RE.match(name) is None:
        raise ValueError("'{0!r}' is not a valid model name".format(name))
    #else:

    def decorator(model_cls):
        if not issubclass(model_cls, object):
            raise RuntimeError(
                "'{0!r}' is not storable".format(model_cls)
                )
        #else:
        model_cls.__model_name__ = name
        return model_cls

    return decorator


def storable_name(model):
    """Return the name used to identify the type of the model. Model must be a
    model instance or class.
    """
    try:
        return model.__model_name__
    except AttributeError:
        RuntimeError("{0!r} is not a storable model".format(model))


def storable(model):
    """Return true if argument is an instance of a storable type.
    """
    try:
        type(model).__model_name__
    except AttributeError:
        return False
    #else:
    return True


class StoreError(Exception):

    @property
    def reason(self):
        try:
            return self.args[0]
        except IndexError:
            return None


class StoreAuthenticationError(StoreError):
    pass


class StoreConnectionError(StoreError):
    pass


class StoreDataValidationError(StoreError):
    pass


class StoreInternalError(StoreError):
    pass


class StorePermissionError(StoreError):
    pass


class StoreTimeout(StoreError):
    pass


#class Collection(object):
#    """Proxy class to easily manipulate objects of the same type in a store.
#    """
#
#    def __init__(self, model_cls, store):
#        self.model_cls = model_cls
#        self.model_name = storable_name(model_cls)
#        self.store = store


class SearchQuery(object):

    def __init__(self, store, model_cls, criteria, sort):
        self._store = store
        self._model_cls = model_cls
        self._criteria = criteria
        self._sort = sort
        self._maximum = 50

    @property
    def model_cls(self):
        return self._model_cls

    @property
    def model_name(self):
        return storable_name(self._model_cls)

    def load(self, offset=0, limit=49):
        if offset < 0:
            raise ValueError("offset can't be negative")
        if limit < 0:
            raise ValueError("limit can't be negative")
        if offset > limit:
            offset, limit = limit, offset
        if limit + 1 - offset > self._maximum:
            LOGGER.warning(
                "SearchQuery is requesting more objects than allowed")
        res = self._store._find(
            self._model_cls, self._criteria, self._sort, offset, limit)
        self._maximum = res.get("maximum", self._maximum)
        return ResultSet(self, **res)


class ResultSet(object):

    def __init__(self, query, data=None, offset=0, limit=0, count=0,
                 maximum=50, **kwargs):
        self._query = query
        self._offset = offset
        self._limit = limit
        self._count = count
        self._maximum = maximum
        if data is None:
            self._data = kwargs[self.model_name]
        else:
            self._data = data

    def is_partial(self):
        """True if the Resultset does not contains all results.
        """
        nb_results = self._limit - self._offset + 1
        return self._offset != 0 or nb_results != self._count

    @property
    def model_name(self):
        return storable_name(self._query._model_cls)

    @property
    def count(self):
        return self._count

    @property
    def offset(self):
        return self._offset

    @property
    def limit(self):
        return self._limit

    @property
    def maximum(self):
        return self._maximum

    def _instanciate_model(self, data):
        model_cls = self._query._model_cls
        return self._query._store._instantiate(model_cls, data)

    def __iter__(self):
        for model_data in self._data:
            yield self._instanciate_model(model_data)

    def load_next_results(self):
        offset = self._limit + 1
        if offset >= self._count:
            return None
        #else:
        nb = min(self._limit - self._offset, self._maximum)
        limit = min(offset + nb, self._count - 1)
        return self._query.load(offset, limit)

    def to_dict(self):
        model_name = self._query.model_name
        return {"offset": self._offset,
                "limit": self._limit,
                "count": self._count,
                "maximum": self._maximum,
                model_name: iter(self)
                }


#FIXME: add store cache, so we only instantiate one instance of a same object


class Store(object):
    """Abstract base class of all object stores.
    Subclasses must override (and implement) these functions:
    _search, _load_one, _save_one, _search, _remove_one, _remove_one_by_id.
    For performance, subclasses should override also these functions:
    _save_all, _remove_all, _remove_all_by_id
    """

    def __init__(self, compiler):
        self._compiler = compiler

    def find(self, model_cls, criteria, sort=None):
        """
        """
        if not isinstance(sort, SortExpr):
            if isinstance(sort, Property):
                sort = expr.sort(expr.asc(sort))
            elif isinstance(sort, (Asc, Desc)):
                sort = expr.sort(sort)
            elif sort is not None:
                sort = expr.sort(*sort)
        return SearchQuery(self, model_cls, criteria, sort)

    def _find(self, model_cls, criteria, sort=None, offset=0, limit=49):
        """
        """
        model_name = storable_name(model_cls)
        return self._search(model_name, criteria, sort, offset, limit)

    def load(self, model_cls, model_id):
        """Load a model of type model_cls from the store (using model_id as
        identifier to retrieve it).
        """
        model_name = storable_name(model_cls)
        data = self._load_one(model_name, model_id)
        if data is not None:
            return self._instantiate(model_cls, data)
        #else:
        #FIXME: return None or raise Exception ?
        return None

    def reload(self, model):
        """Reload a model from the store.
        """
        if model._id is None:
            return None
        #else:
        model_name = storable_name(model)
        data = self._load_one(model_name, model._id)
        if data is not None:
            return self._update_instance(model, data)
        #else:
        #FIXME: return None or raise Exception ?
        return None

    def save(self, *args):
        """Store all given models. Accept 0 to n models as arguments.
        """
        if len(args) == 0:
            return
        #else:
        if len(args) == 1:
            return self._save_one(args[0])
        #else:
        cache = dict()
        for model in args:
            model_name = storable_name(model)
            model_cache = cache.setdefault(model_name, [])
            model_cache.append(model)
        for model_name, models in cache.items():
            self._save_all(models)

    def remove(self, *args):
        """Remove all specified models from the store. Accept 0 to n values as
        arguments.
        """
        if len(args) == 0:
            return
        #else:
        if len(args) == 1:
            self._remove_one(args[0])
            return
        #else:
        cache = dict()
        for model in args:
            model_name = storable_name(model)
            model_cache = cache.setdefault(model_name, [])
            model_cache.append(model)
        for model_name, models in cache.items():
            self._remove_all(models)

    def remove_by_id(self, model_cls, *args):
        """Remove all specified models from the store. Accept 0 to n ids as
        arguments.
        """
        if len(args) == 0:
            return
        #else:
        model_name = storable_name(model_cls)
        if len(args) == 1:
            self._remove_one_by_id(model_name, args[0])
        else:
            self._remove_all_by_id(model_name, args)

    def _instantiate(self, model_cls, data):
        """Instantiate the object
        """
        obj = model_cls.__new__(model_cls)
        for name, value in data.items():
            prop = getattr(model_cls, name, None)
            if prop is not None:
                value = prop.adapt(value)
            vars(obj)[name] = value
        return obj

    def _update_instance(self, obj, data):
        """Update an already instanciated object
        """
        vars(obj).clear()
        model_cls = type(obj)
        for prop in properties(model_cls):
            prop.set_default(obj, model_cls)
        for name, value in data.items():
            prop = getattr(model_cls, name, None)
            if prop is not None:
                value = prop.adapt(value)
            vars(obj)[name] = value
        return obj

    def _load_one(self, model_name, model_id):
        """Load a model data from the store (using model_id as identifier to
        retrieve it).
        return None if the model is not found
        """

    def _save_one(self, model):
        """Save one model to the store. Add the model in case of a first time
        save or update it otherwise.
        """

    def _save_all(self, models):
        """Save all given models to the store. All models must be of the same
        type. models is iterable.
        Override this method for performance purpose
        """
        for model in models:
            self._save_one(model)

    def _search(self, model_name, criteria, sort=None, offset=0, limit=49):
        """Return a dict containing the following keys:
         * offset: index of the first object returned
         * limit: index of the last element returned
         * count: total number of objects in the collection
         * data: an iterable on the objects data
         * maximum: the maximum number of objects to query at once
        """

    def _remove_one(self, model):
        """Remove the given model from the store.
        """

    def _remove_all(self, models):
        """Remove all the given models from the store. All models must be of
        the same type. models is iterable.
        Override this method for performance purpose
        """
        for model in models:
            self._remove_one(model)

    def _remove_one_by_id(self, model_name, model_id):
        """Remove a model from the store, using model_name to identify the type
        and model_id to identify the model.
        """

    def _remove_all_by_id(self, model_name, ids):
        """Remove the models of a given type having their id in ids. All models
        must be of the same type. ids is iterable.
        Override this method for performance purpose
        """
        for model_id in ids:
            self._remove_one_by_id(model_name, model_id)
