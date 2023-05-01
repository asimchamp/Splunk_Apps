#!/usr/bin/python
# -*- coding: utf-8 -*-
# Author: Vincent Alquier <v.alquier@itrust.fr>
# Copyrights (c) 2015 by ITrust

"""Base model class and properties used by the IT-tude REST API.
"""

from calendar import timegm
from datetime import date, datetime
from itrust.common import typename, PY2, PY3
from itt.common import server_timezone
from six import b, integer_types, string_types, text_type, u
from time import mktime, strptime
from .storage import expr as aer
from logging import getLogger


LOGGER = getLogger(__name__)


def _find_name(attr, owner):
    """Find the name of the property attr in the owner class.
    """
    assert issubclass(owner, Model)
    try:
        return vars(attr)['__name__']
    except KeyError:
        pass
    ret = None
    for cls in owner.mro()[:-1]:  # We exclude builtins.object
        for name, prop in vars(cls).items():
            if isinstance(prop, Property):
                vars(prop).setdefault('__name__', name)
            if prop is attr:
                ret = name
    if ret:
        return ret
    #else:
    raise RuntimeError("Illegal operation on '%s'" % owner.__name__)


class ValidationRule(object):

    _DefMessage = "Illegal value for '{0}'"

    def __init__(self, message=None):
        self.message = message or self._DefMessage

    def validate(self, value):
        return True

    def __call__(self, value, name):
        if not self.validate(value):
            raise ValueError(self._format_message(name))

    def _format_message(self, name):
        return self.message.format(name)


class MinValue(ValidationRule):
    _DefMessage = "Value is lower than minimum for '{0}' (minimum is {1})"

    def __init__(self, min_value, message=None):
        self.min_value = min_value
        self.message = message or _DefMessage

    def validate(self, value):
        return value >= self.min_value

    def _format_message(self, name):
        return self.message.format(name, self.min_value)


class MaxValue(ValidationRule):
    _DefMessage = "Value is higher than maximum '{0}' (maximum is {1})"

    def __init__(self, max_value, message=None):
        self.max_value = max_value
        self.message = message or _DefMessage

    def validate(self, value):
        return len(value) <= self.max_value

    def _format_message(self, name):
        return self.message.format(name, self.max_value)


class MinLen(ValidationRule):
    _DefMessage = "Value is too short for '{0}' (minimum length is {1})"

    def __init__(self, min_len, message=None):
        self.min_len = min_len
        self.message = message or _DefMessage

    def validate(self, value):
        return len(value) >= self.min_len

    def _format_message(self, name):
        return self.message.format(name, self.min_len)


class MaxLen(ValidationRule):
    _DefMessage = "Value is too long for '{0}' (maximum length is {1})"

    def __init__(self, max_len, message=None):
        self.max_len = max_len
        self.message = message or _DefMessage

    def validate(self, value):
        return len(value) <= self.max_len

    def _format_message(self, name):
        return self.message.format(name, self.max_len)


class Property(object):
    """Base class of all model properties. Property is implemented as a
    descriptor. Because this property is not typed, you probably want to
    subclass it before using it.
    """

    def __init__(self, allow_none=True, default=None, read_only=False):
        """Used to specify basic validation rules.
        """
        if not allow_none and default is None:
            raise ValueError("Illegal default value")
        #else
        self._validation_rules = []
        self._allow_none = allow_none
        self._default = default
        self._read_only = bool(read_only)

    @property
    def read_only(self):
        return self._read_only

    @read_only.setter
    def read_only(self, value):
        self._read_only = bool(value)

    @read_only.deleter
    def read_only(self):
        self._read_only = False

    def __get__(self, instance, owner):
        name = _find_name(self, owner)
        if instance is None:
            return self
        #else
        return vars(instance).setdefault(name, self._default)

    def __set__(self, instance, value):
        name = _find_name(self, type(instance))
        if self._read_only:
            raise AttributeError("'{0}' is read-only".format(name))
        #else
        value = self.adapt(value, name)
        self.validate(value, name)
        vars(instance)[name] = value

    def __delete__(self, instance):
        name = _find_name(self, type(instance))
        if self._read_only:
            raise AttributeError("'{0}' is read-only".format(name))
        #else
        try:
            del vars(instance)[name]
        except KeyError:
            raise AttributeError("'{0}' object has no attribute '{1}'".format(
                typename(instance), name
                ))
        if self._default is not None:
            vars(instance)[name] = self._default

    def set_default(self, instance, owner):
        if self._default is not None:
            name = _find_name(self, owner)
            vars(instance)[name] = self._default

    def _adapt(self, value, name=None):
        assert value is not None
        return value

    def adapt(self, value, name=None):
        if value is None:
            return value
        #else
        return self._adapt(value, name)

    def _validate(self, value, name=None):
        assert value is not None

    def validate(self, value, name=None):
        if value is None:
            if not self._allow_none:
                raise ValueError("Illegal default value")
        else:
            self._validate(value, name)
            for validator in self._validation_rules:
                validator(value, name)

    def get_name(self):
        #FIXME: VERY DANGEROUS... Depending on how this method is called,
        # __name__ may not have been set here...
        return self.__name__

    def __eq__(self, other):
        prop = aer.Prop(self.get_name())
        adapted = self.adapt(other)
        return aer.Equal(prop, aer.Const(adapted))

    def __le__(self, other):
        prop = aer.Prop(self.get_name())
        adapted = self.adapt(other)
        return aer.Le(prop, aer.Const(adapted))

    def __lt__(self, other):
        prop = aer.Prop(self.get_name())
        adapted = self.adapt(other)
        return aer.Lt(prop, aer.Const(adapted))

    def __ge__(self, other):
        prop = aer.Prop(self.get_name())
        adapted = self.adapt(other)
        return aer.Ge(prop, aer.Const(adapted))

    def __gt__(self, other):
        prop = aer.Prop(self.get_name())
        adapted = self.adapt(other)
        return aer.Gt(prop, aer.Const(adapted))

#   Seems that  we can't return something else than True or False
#
#    def __contains__(self, key):
#        prop = aer.Prop(self.get_name())
#        adapted = self.adapt(key)
#        if type(self) is String:
#            concats = [aer.LikeOperator(), adapted, aer.LikeOperator()]
#            return aer.Like(prop, aer.LikeOperand(aer.Concat(*concats)))


class Boolean(Property):
    """Boolean property descriptor.
    """

    def _adapt(self, value, name=None):
        return bool(value)

    def _validate(self, value, name=None):
        assert value is not None
        if type(value) is not bool:
            raise ValueError("Invalid value for '{0}'".format(name))


class Date(Property):
    """Date property descriptor with optionnal minimum and maximum values.
    """

    FORMAT = "%Y-%m-%d"
    MinErrMsg = "Value of '{0}' must be after {1}"
    MaxErrMsg = "Value of '{0}' must be before {1}"

    def __init__(self, min_value=None, max_value=None,
                 allow_none=True, default=None, read_only=False):
        Property.__init__(self, allow_none, default, read_only)
        if min_value is not None:
            self._validation_rules.append(MinValue(min_value, self.MinErrMsg))
        if max_value is not None:
            self._validation_rules.append(MaxValue(max_value, self.MaxErrMsg))
        try:
            self.validate(self._default)
        except ValueError:
            raise ValueError("Illegal default value")

    def _adapt(self, value, name=None):
        if type(value) is date:
            return value
        #else:
        if isinstance(value, integer_types):
            return date.fromtimestamp(value)
        #else:
        try:
            s_time = strptime(value, self.FORMAT)
        except (TypeError, ValueError):
            raise ValueError("Invalid value for '{0}'".format(name))
        else:
            return date.fromtimestamp(mktime(s_time))

    def _validate(self, value, name=None):
        assert value is not None
        if type(value) is not date:
            raise ValueError("Invalid value for '{0}'".format(name))

    def __eq__(self, other):
        prop = aer.Prop(self.get_name())
        adapted = self.adapt(other)
        return aer.Equal(prop, aer.DateOperand(adapted))

    def __le__(self, other):
        prop = aer.Prop(self.get_name())
        adapted = self.adapt(other)
        return aer.Le(prop, aer.DateOperand(adapted))

    def __lt__(self, other):
        prop = aer.Prop(self.get_name())
        adapted = self.adapt(other)
        return aer.Lt(prop, aer.Const(adapted))

    def __ge__(self, other):
        prop = aer.Prop(self.get_name())
        adapted = self.adapt(other)
        return aer.Ge(prop, aer.Const(adapted))

    def __gt__(self, other):
        prop = aer.Prop(self.get_name())
        adapted = self.adapt(other)
        return aer.Gt(prop, aer.Const(adapted))


class Datetime(Property):
    """Datetime property descriptor with optionnal minimum and maximum values.
    When setting the value, if the input value is a string, then the expected
    format is : yyyy-mm-ddThh:mm:ss
    optionnaly with the utc offset appended : +HHMM or -HHMM
    examples of valid formats:
    2015-05-04T13:40:35
    2015-05-04T13:40:35+0200

    If utc offset is not specified, the given datetime is expected to be in
    the server local time.
    """

    FORMAT = "%Y-%m-%dT%H:%M:%S"
    MinErrMsg = "Value of '{0}' must be after {1}"
    MaxErrMsg = "Value of '{0}' must be before {1}"

    def __init__(self, min_value=None, max_value=None,
                 allow_none=True, default=None, read_only=False):
        Property.__init__(self, allow_none, default, read_only)
        if min_value is not None:
            self._validation_rules.append(MinValue(min_value, self.MinErrMsg))
        if max_value is not None:
            self._validation_rules.append(MaxValue(max_value, self.MaxErrMsg))
        try:
            self.validate(self._default)
        except ValueError:
            raise ValueError("Illegal default value")

    def _adapt(self, value, name=None):
        if not isinstance(value, datetime):
            if isinstance(value, integer_types):
                value = datetime.fromtimestamp(value)
            else:
                try:
                    mktime_func = mktime
                    utcoffset = 0
                    if value[-5] in "+-":
                        mktime_func = timegm
                        offst = value[-5:]
                        sign = offst[0] == "+" and -1 or 1
                        hours = int(offst[1:3])
                        minutes = int(offst[3:5])
                        utcoffset = sign * (hours * 60 + minutes) * 60
                        value = value[:-5]
                    elif value[-1] == "Z":
                        mktime_func = timegm
                        value = value[:-1]
                    s_time = strptime(value, self.FORMAT)
                except (TypeError, ValueError):
                    raise ValueError("Invalid value for '{0}'".format(name))
                else:
                    value = datetime.fromtimestamp(
                        mktime_func(s_time) + utcoffset)

        server_tz = server_timezone()
        if value.tzinfo is None:
            return server_tz.localize(value)
        elif value.tzinfo.zone != server_tz.zone:
            return server_tz.normalize(value)
        #else:
        return value

    def _validate(self, value, name=None):
        assert value is not None
        if type(value) is not datetime:
            raise ValueError("Invalid value for '{0}'".format(name))

    def __eq__(self, other):
        prop = aer.Prop(self.get_name())
        adapted = self.adapt(other)
        return aer.Equal(prop, aer.DateOperand(adapted))

    def __le__(self, other):
        prop = aer.Prop(self.get_name())
        adapted = self.adapt(other)
        return aer.Le(prop, aer.DateOperand(adapted))

    def __lt__(self, other):
        prop = aer.Prop(self.get_name())
        adapted = self.adapt(other)
        return aer.Lt(prop, aer.Const(adapted))

    def __ge__(self, other):
        prop = aer.Prop(self.get_name())
        adapted = self.adapt(other)
        return aer.Ge(prop, aer.Const(adapted))

    def __gt__(self, other):
        prop = aer.Prop(self.get_name())
        adapted = self.adapt(other)
        return aer.Gt(prop, aer.Const(adapted))


class Integer(Property):
    """Integer property descriptor with optionnal minimum and maximum values.
    """

    def __init__(self, min_value=None, max_value=None,
                 allow_none=True, default=None, read_only=False):
        Property.__init__(self, allow_none, default, read_only)
        if min_value is not None:
            self._validation_rules.append(MinValue(min_value))
        if max_value is not None:
            self._validation_rules.append(MaxValue(max_value))
        try:
            self.validate(self._default)
        except ValueError:
            raise ValueError("Illegal default value")

    def _adapt(self, value, name=None):
        return int(value)

    def _validate(self, value, name=None):
        assert value is not None
        if type(value) is not int:
            raise ValueError("Invalid value for '{0}'".format(name))


class Enum(Property):
    """Enum property descriptor.
    """

    def __init__(self, accept, case_sensitive=True,
                 allow_none=True, default=None, read_only=False):
        """accept is the list of accepted values for the enum. All values in
        accept must be unicode strings (unicode in python2 or str in python3).
        If case_sensitive is set to False, when setting the value, it will
        be replaced (if found in accepted values) by the matching one e.g.:

        >>> class Game(Model):
        ...     category = Enum(["RTS", "FPS", "RPG"], case_sensitive=False)
        >>> quake = Game(category="fps")
        >>> quake.category
        FPS

        >>> class Game(Model):
        ...     category = Enum(["RTS", "FPS", "RPG"], case_sensitive=True)
        >>> quake = Game(category="fps")
        ValueError: Invalid value for 'category'
        """
        Property.__init__(self, allow_none, default, read_only)
        if case_sensitive:
            self._case_sensitive = True
            self._accept = set(map(text_type, accept))
        else:
            self._case_sensitive = False
            self._accept = dict()
            for value in accept:
                value = text_type(value)
                self._accept[value.lower()] = value
        try:
            self.validate(self._default)
        except ValueError:
            raise ValueError("Illegal default value")

    def __set__(self, instance, value):
        name = _find_name(self, type(instance))
        if self._read_only:
            raise AttributeError("'{0}' is read-only".format(name))
        #else:
        value = self.adapt(value, name)
        vars(instance)[name] = value

    def _adapt(self, value, name=None):
        value = text_type(value)
        if self._case_sensitive:
            if value in self._accept:
                return value
        else:
            try:
                return self._accept[value.lower()]
            except KeyError:
                pass
        #else:
        raise ValueError("Invalid value for '{0}' (accepts: {1})".format(
            name, ", ".join(self._accept)))

    def _validate(self, value, name=None):
        assert value is not None
        if isinstance(value, string_types):
            if not self._case_sensitive:
                value = value.lower()
            if value in self._accept:
                return
        #else:
        raise ValueError("Invalid value for '{0}' (accepts: {1})".format(
            name, ", ".join(self._accept)))


class String(Property):
    """String property descriptor with optionnal minimum and maximum length.
    """

    def __init__(self, min_len=None, max_len=None,
                 allow_none=True, default=None, read_only=False):
        Property.__init__(self, allow_none, default, read_only)
        if min_len is not None:
            self._validation_rules.append(MinLen(min_len))
        if max_len is not None:
            self._validation_rules.append(MaxLen(max_len))
        try:
            self.validate(self._default)
        except ValueError:
            raise ValueError("Illegal default value")

    def _adapt(self, value, name=None):
        return text_type(value)

    def _validate(self, value, name=None):
        assert value is not None
        if type(value) is not text_type:
            raise ValueError("Invalid value for '{0}'".format(name))


class Password(Property):
    """Password property descriptor with optionnal minimum and maximum length.
    This property is write-only, meaning that __get__ won't return the value.
    """

    def __init__(self, min_len=None, max_len=None,
                 allow_none=True, default=None, read_only=False):
        Property.__init__(self, allow_none, default, read_only)
        if min_len is not None:
            self._validation_rules.append(MinLen(min_len))
        if max_len is not None:
            self._validation_rules.append(MaxLen(max_len))
        try:
            self.validate(self._default)
        except ValueError:
            raise ValueError("Illegal default value")

    def __get__(self, instance, owner):
        name = _find_name(self, owner)
        if instance is None:
            return self
        #else
        raise AttributeError("'{0}' is write-only".format(name))

    def _adapt(self, value, name=None):
        return text_type(value)

    def _validate(self, value, name=None):
        assert value is not None
        if type(value) is not text_type:
            raise ValueError("Invalid value for '{0}'".format(name))


class Dictionnary(Property):
    """Dictionnary property descriptor.
    """

    def _adapt(self, value, name=None):
        return dict(value)

    def _validate(self, value, name=None):
        assert value is not None
        if type(value) is not dict:
            raise ValueError("Invalid value for '{0}'".format(name))


class List(Property):
    """List property descriptor.
    """

    def _adapt(self, value, name=None):
        return list(value)

    def _validate(self, value, name=None):
        assert value is not None
        if type(value) is not list:
            raise ValueError("Invalid value for '{0}'".format(name))


class Set(Property):
    """Set property descriptor.
    """

    def _adapt(self, value, name=None):
        return set(value)

    def _validate(self, value, name=None):
        assert value is not None
        if type(value) is not set:
            raise ValueError("Invalid value for '{0}'".format(name))


class _Expr(object):

    def and_(self, *abs_exprs):
        """Create an and expression
        """
        return aer.And(*abs_exprs)

    def or_(self, *abs_exprs):
        """Create an or expression
        """
        return aer.Or(*abs_exprs)

    def sort(self, *exprs):
        absexprs = map(
            lambda x: isinstance(x, Property) and self.asc(x) or x,
            exprs
            )
        return aer.SortExpr(*absexprs)

    def asc(self, prop):
        """Create an ascending sort expression.
        """
        propabs = aer.Prop(prop.get_name())
        return aer.Asc(propabs)

    def desc(self, prop):
        """Create a descending sort expression.
        """
        propabs = aer.Prop(prop.get_name())
        return aer.Desc(propabs)

    def contains_all(self, prop, value):
        """Create an expression implying that prop contains none of the given
        values.
        Returns an Contains aer
        """
        propabs = aer.Prop(prop.get_name())
        if not isinstance(values, (list, tuple, set)):
            values = [values]

        values = map(aer.Const, values)
        return aer.Contains(propabs, aer.ListExpr(*values))

    def contains_none(self, prop, values):
        """Create an expression implying that prop contains none of the given
        values.
        Returns an Nin aer
        """
        propabs = aer.Prop(prop.get_name())
        if not isinstance(values, (list, tuple, set)):
            values = [values]

        values = map(aer.Const, values)
        return aer.Nin(propabs, aer.ListExpr(*values))

    def is_contained(self, prop, value):
        """Returns an In aer base on the given Property instance
        and the given value
        """

        propabs = aer.Prop(prop.get_name())
        if isinstance(value, (list, tuple, set)):
            values = list(map(lambda x: aer.Const(prop.adapt(x)), value))
            return aer.In(propabs, aer.ListExpr(*values))

        #FIXME: this seems incorrect (and range is not a type in python 2)
        elif type(value) is range:
            resource = None
            if type(prop) is Date or type(prop) is Datetime:
                resource = aer.DateOperand
            else:
                resource = aer.Const
            values = list(map(
                lambda x: resource(prop.adapt(x)), value
                ))
            return aer.In(propabs, aer.RangeExpr(*values))


expr = _Expr()
del _Expr
#
#
#class PaginatedList(object):
#
#    def __init__(self, data, count, offset=0, limit=49, maximum=50):
#        self._data = data
#        self._count = count
#        self._offset = offset
#        self._limit = limit
#        self._maximum = maximum
#
#    def __iter__(self):
#        for model in data:
#            yield model
#
#    def to_dict(self):
#        return {"offset": self._offset,
#                "limit": self._limit,
#                "count": self._count,
#                "maximum": self._maximum,
#                "data": list(self),
#                }


class Model(object):
    """Base class of your models. The Only mandatory field is the _id.
    """

    _id = String()

    def __new__(cls, **kwargs):
        inst = object.__new__(cls)
        for prop in properties(cls):
            prop.set_default(inst, cls)
        return inst

    def __init__(self, **kwargs):
        """Set the value of the properties passed by name.
        """
        cls = type(self)
        for attr, value in kwargs.items():
            prop = getattr(cls, attr, None)
            if isinstance(prop, Property):
                setattr(self, attr, value)

    def update(self, **kwargs):
        """Set from 0 to n properties of the model at the same time
        """
        backup = dict()
        try:
            cls = type(self)
            for attr, value in kwargs.items():
                prop = getattr(cls, attr, None)
                if isinstance(prop, Property):
                    backup[attr] = vars(self).get(attr)
                    setattr(self, attr, value)
        except:
            vars(self).update(backup)
            for attr, value in vars(self).items():
                if value is None:
                    del vars(self)[attr]
            raise

    def to_dict(self):
        """Dict representation of your model.
        Warning: Returned dict is not for update purposes. In some cases,
        updates could alter and corrupt the model data.
        """
        data = dict()
        model = type(self)
        for name, value in vars(self).items():
            prop = getattr(model, name, None)
            if not isinstance(prop, Password):
                data[name] = value
        return data

    def __repr__(self):
        return "<{0} _id={1!r}>".format(typename(self), vars(self).get("_id"))


class Resource(Model):
    """Base class of resources.
    Resources have 3 mandatory fields: _id, created_at and updated_at
    """

    #FIXME: automatically set created_at and updated_at
    created_at = Datetime(read_only=True)
    updated_at = Datetime(read_only=True)


def properties(model_cls):
    """Generator used to iter on all the properties of a model class.
    model_cls must be a subclass of Model.
    """
    assert issubclass(model_cls, Model)
    known = set()
    for cls in model_cls.mro()[:-1]:  # We exclude builtins.object
        for name, prop in vars(cls).items():
            if name not in known and isinstance(prop, Property):
                yield prop
                known.add(name)


def properties_as_items(model_cls):
    """Generator used to iter on all the properties of a model class.
    model_cls must be a subclass of Model.
    """
    assert issubclass(model_cls, Model)
    known = set()
    for cls in model_cls.mro()[:-1]:  # We exclude builtins.object
        for name, prop in vars(cls).items():
            if name not in known and isinstance(prop, Property):
                yield name, prop
                known.add(name)
