
# Author: Vincent Alquier <v.alquier@itrust.fr>
# Copyrights (c) 2013 by ITrust

"""Easy to use data validation library.
"""

from collections import Mapping
from numbers import Number
import six
from .common import PY2, PY3, typename, with_metaclass


SMART_ADAPTORS = dict()


if PY2:
    def bool_adaptor(value):
        if isinstance(value, Number):
            return value != 0
        if isinstance(value, unicode):
            value = value.encode("utf8")
        value = str(value).strip().lower()
        return value not in (
            "", "0", "off", "no", "false", "none", "wrong", "not ok", "nok",
            )
else:
    def bool_adaptor(value):
        if isinstance(value, Number):
            return value != 0
        value = str(value).strip().lower()
        return value not in (
            "", "0", "off", "no", "false", "none", "wrong", "not ok", "nok",
            )
SMART_ADAPTORS[bool] = bool_adaptor


def int_adaptor(value):
    if isinstance(value, six.string_types):
        try:
            value = eval(value, {}, {})
        except:
            pass
    if not isinstance(value, Number):
        try:
            return int(value)
        except:
            value = float(value)
    return int(round(value))
SMART_ADAPTORS[int] = int_adaptor


if PY2:
    def str_adaptor(value):
        if isinstance(value, unicode):
            return value.encode("utf8")
        #else:
        return str(value)
else:
    str_adaptor = str
SMART_ADAPTORS[str] = str_adaptor


if PY2:
    def long_adaptor(value):
        if isinstance(value, six.string_types):
            try:
                value = eval(value, {}, {})
            except:
                pass
        if not isinstance(value, Number):
            try:
                return long(value)
            except:
                value = float(value)
        return long(round(value))
    SMART_ADAPTORS[long] = long_adaptor

    def unicode_adaptor(value):
        if isinstance(value, str):
            return unicode(value, "utf8")
        #else:
        return unicode(value)
    SMART_ADAPTORS[unicode] = unicode_adaptor


def get_smart_adaptor(vtype):
    return SMART_ADAPTORS.get(vtype, vtype)


class Attr(object):

    def __init__(self, vtype=str, validator=None, required=False,
                 default=None, smart=False):
        if not isinstance(vtype, type):
            raise TypeError("vtype must be a type, not %s" % typename(vtype))
        #else
        self._vtype = vtype
        self.validator = validator
        self.required = required
        self.default = default
        self.smart = smart

    @property
    def vtype(self):
        return self._vtype

    @vtype.setter
    def vtype(self, value):
        raise AttributeError(
            "Can't set vtype, create new %s instead" % typename(self)
            )

    @property
    def validator(self):
        return self._validator

    @validator.setter
    def validator(self, value):
        if value is not None and not callable(value):
            raise TypeError("validator must be callable")
        #else
        if value is None:
            del self.validator
        else:
            self._validator = value

    @validator.deleter
    def validator(self):
        try:
            getattr(type(self), "_validator")
        except AttributeError:
            self._validator = None
        else:
            try:
                del self._validator
            except AttributeError:
                pass

    @property
    def required(self):
        return self._required

    @required.setter
    def required(self, value):
        try:
            value = bool(value)
        except:
            raise TypeError("required must be a bool")
        #else
        self._required = value

    @required.deleter
    def required(self):
        self._required = False

    @property
    def smart(self):
        return self._smart

    @smart.setter
    def smart(self, value):
        try:
            value = bool(value)
        except:
            raise TypeError("smart must be a bool")
        #else
        self._smart = value

    @smart.deleter
    def smart(self):
        self._smart = False

    @property
    def default(self):
        return self._default

    @default.setter
    def default(self, value):
        if value is not None and not isinstance(value, self._vtype):
            raise TypeError("default must be a %s" % self._vtype.__name__)
        #else
        self._default = value

    @default.deleter
    def default(self):
        self._default = None

    def __call__(self, value, adaptor=None):
        if value is None:
            if self.default is None and self.required:
                raise LookupError("Missing value")
            #else
            return self.default
        #else
        if not isinstance(value, self.vtype):
            if adaptor is None:
                if self.smart:
                    adaptor = get_smart_adaptor(self.vtype)
                else:
                    adaptor = self.vtype
            try:
                value = adaptor(value)
            except:
                raise TypeError(
                    "Unable to convert to %s" % self._vtype.__name__)

        return self._validate(value)

    def _validate(self, value):
        if self.validator and not self.validator(value):
            raise ValueError(self.validator.__doc__ or "Invalid value")
        #else
        return value

    def changes(self, value, original, adaptor=None):
        if value is None:
            return self.default

        if not isinstance(value, self.vtype):
            if adaptor is None:
                if self.smart:
                    adaptor = get_smart_adaptor(self.vtype)
                else:
                    adaptor = self.vtype
            try:
                value = adaptor(value)
            except:
                raise TypeError(
                    "Unable to convert to %s" % self._vtype.__name__)

        return self._validatechanges(value, original)

    def _validatechanges(self, value, original):
        if self.validator and not self.validator(value, original):
            raise ValueError(self.validator.__doc__ or "Invalid value")
        #else
        return value


MappingMeta = type(Mapping)


class SchemaMeta(MappingMeta):

    def __new__(mcls, name, bases, namespace):
        v8_keys = set(key
                      for key, attr in namespace.items()
                      if isinstance(attr, Attr)
                      )
        namespace["_v8_keys"] = v8_keys
        cls = MappingMeta.__new__(mcls, name, bases, namespace)
        return cls

    def __setattr__(cls, key, attr):
        if isinstance(attr, Attr):
            cls._v8_keys.add(key)
        else:
            cls._v8_keys.discard(key)
        MappingMeta.__setattr__(cls, key, attr)

    def __delattr__(cls, key):
        cls._v8_keys.discard(key)
        MappingMeta.__delattr__(cls, key)


class Schema(with_metaclass(SchemaMeta, Attr, Mapping)):

    def __init__(self, validator=None, required=False,
                 default=None, smart=False):
        Attr.__init__(self, Mapping, validator, required, default, smart)

    def __contains__(self, key):
        return key in type(self)._v8_keys

    def __getitem__(self, key):
        if key in type(self)._v8_keys:
            return getattr(type(self), key)
        #else
        raise KeyError(repr(key))

    def __iter__(self):
        return iter(type(self)._v8_keys)

    def __len__(self):
        return len(type(self)._v8_keys)

    def _validate(self, data):
        valid = dict()
        for key, attr in self.items():
            value = data.get(key)
            adaptor = None
            if self.smart:
                adaptor = get_smart_adaptor(attr.vtype)
            try:
                valid[key] = attr(value, adaptor)
            except (LookupError, TypeError, ValueError) as err:
                raise type(err)("%s: %s" % (key, str(err)))

        if self.validator and not self.validator(valid):
            raise ValueError(self.validator.__doc__ or "Invalid value")
        #else
        return valid

    def _validatechanges(self, data, original):
        if isinstance(original, self.vtype):
            get_original_value = original.get
        else:
            def get_original_value(key, default=None):
                return getattr(original, key, default)

        valid = dict()
        for key, attr in self.items():
            if key in data:
                value = data.get(key)
                adaptor = None
                if self.smart:
                    adaptor = get_smart_adaptor(attr.vtype)
                try:
                    value = attr(value, adaptor)
                    if get_original_value(key) != value:
                        valid[key] = value
                except (LookupError, TypeError, ValueError) as err:
                    raise type(err)("%s: %s" % (key, str(err)))

        if self.validator and not self.validator(valid, original):
            raise ValueError(self.validator.__doc__ or "Invalid value")
        #else
        return valid
