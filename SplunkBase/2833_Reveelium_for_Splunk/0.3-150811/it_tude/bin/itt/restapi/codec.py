#!/usr/bin/python
# -*- coding: utf-8 -*-
# Author: Vincent Alquier <v.alquier@itrust.fr>
# Copyrights (c) 2015 by ITrust

"""Tools to encode/decode content depending on specified Content-Type.
"""

from datetime import date, datetime
from itrust.common import PY2, PY3, singleton
from itt.common import server_timezone
import json
from six import binary_type, string_types, text_type


def _decode_text(value, encoding="utf-8"):
    if type(value) is binary_type:
        return value.decode(encoding)
    #else:
    return value


def _encode_text(value, encoding="utf-8"):
    return text_type(value).encode(encoding)


if PY2:
    def _fp_read_text(fp, encoding="utf-8"):
        return _decode_text(text_type(fp.read(), encoding), encoding)

    def _fp_write_text(value, fp, encoding="utf-8"):
        fp.write(text_type(value).encode(encoding))

else:
    def _fp_read_text(fp, encoding="utf-8"):
        return _decode_text(fp.read(), encoding)

    def _fp_write_text(value, fp, encoding="utf-8"):
        fp.write(text_type(value))


@singleton
class CodecDB(dict):
    """The database of all known codecs.
    """

    def find(self, content_type):
        """Return a list of all the codecs matching the givent content_type.
        content_type must use one these 3 formats: */*, type/*, type/subtype
        Examples: */*, text/*, application/*, text/plain, application/json
        """
        try:
            return [self[content_type]]
        except KeyError:
            pass
        if content_type == "*/*":
            return self.values()
        #else:
        ctype, csubtype = content_type.split("/", 1)
        if csubtype == "*":
            return [c for k, c in self.items() if k.startswith(ctype + "/")]
        #else:
        return []


class Codec(object):
    """Base class of any codec.
    """

    def get_content_type(self):
        """Return the prefered MIME Content-Type of this decoder.
        """
        pass

    def decode(self, fp, encoding="utf-8"):
        """Read data from fp (a file-like object), decode (=deserialize) and
        return the result.
        Using python3, the encoding argument should have no effects
        If this method is not is not overriden, then it is assume that the
        codec can't decode.
        """
        raise RuntimeError("Don't know how to decode '{0!s}'".format(
            self.get_content_type()
            ))

    def encode(self, data, fp, encoding="utf-8"):
        """Encode (=Serialize) the given data to the given stream fp (a
        file-like object).
        Using python3, the encoding argument should have no effects
        If this method is not is not overriden, then it is assume that the
        codec can't encode.
        """
        raise RuntimeError("Don't know how to encode '{0!s}'".format(
            self.get_content_type()
            ))

    def encodes(self, data, encoding="utf-8"):
        """Encode (=Serialize) the given data and return the result.
        Using python3, the encoding argument should have no effects.
        """
        raise RuntimeError("Don't know how to encode '{0!s}'".format(
            self.get_content_type()
            ))

    def can_decode(self):
        return not type(self).decode is Codec.decode

    def can_encode(self):
        return not type(self).encode is Codec.encode


def register_codec(*content_types):
    """Conveniance decorator to register a codec in the codec database, for a
    specified list of content_types.
    """
    def decorator(codecCls):
        codec = codecCls()
        for content_type in content_types:
            content_type = text_type(content_type).lower()
            CodecDB()[content_type] = codec
        return codecCls
    return decorator


@register_codec("text/plain")
class PlainTextCodec(Codec):
    """Codec for text/plain Content-Type.
    """

    def get_content_type(self):
        return "text/plain"

    def decode(self, fp, encoding="utf-8"):
        return _fp_read_text(fp, encoding)

    def encode(self, data, fp, encoding="utf-8"):
        _fp_write_text(data, fp, encoding)

    def encodes(self, data, encoding="utf-8"):
        if isinstance(data, string_types):
            return _encode_text(data, encoding)
        #else:
        ret = []
        for value in data:
            ret.append(_encode_text(value, encoding))
        return ret


class _IttJSONEncoder(json.JSONEncoder):
    """Encoder used to automatically convert objects and iterables.
    """

    def default(self, o):
        """Any object having a to_dict function or being iterable can be
        converted.
        """
        if isinstance(o, datetime):
            if o.tzinfo is None:
                o = server_timezone().localize(o)
            return o.strftime("%Y-%m-%dT%H:%M:%S%z")
        #else:
        if isinstance(o, date):
            return o.strftime("%Y-%m-%d")
        #else:
        try:
            return o.to_dict()
        except AttributeError:
            pass
        try:
            return list(o)
        except TypeError:
            pass
        # I think this is a bit dangereous as the encoded result is supposed
        # to be directly sent... uncomment if I change my mind
        #try:
        #    return vars(o)
        #except TypeError:
        #    pass
        return json.JSONEncoder.default(self, o)


@register_codec("application/json")
class JsonCodec(Codec):
    """Codec for application/json Content-Type.
    """

    def get_content_type(self):
        return "application/json"

    def decode(self, fp, encoding="utf-8"):
        text = _fp_read_text(fp, encoding)
        if text:
            return json.loads(text)
        #else:
        return None

    def encode(self, data, fp, encoding="utf-8"):
        json.dump(data, fp, encoding=encoding, cls=_IttJSONEncoder)

    def encodes(self, data, encoding="utf-8"):
        return json.dumps(data, cls=_IttJSONEncoder).encode(encoding)
