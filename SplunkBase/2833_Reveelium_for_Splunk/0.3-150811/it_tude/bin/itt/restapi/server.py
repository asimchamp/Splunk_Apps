#!/usr/bin/python
# -*- coding: utf-8 -*-
# Author: Vincent Alquier <v.alquier@itrust.fr>
# Copyrights (c) 2015 by ITrust

"""Server side tools and utilities of the IT-tude REST API.
"""


from cgi import escape, FieldStorage
from .codec import CodecDB
from .httpstatus import *
from itrust.common import singleton, typename
from logging import getLogger
from six import b, string_types, text_type
from ..storage.store import ResultSet, StoreAuthenticationError
from ..storage.expr import *
from ..model import (
    Date, Datetime, Dictionnary, Enum, Integer, List,
    Model, properties, properties_as_items, Set, String
    )
from ..models.auth import Session  # FIXME: shouldn't depend on auth
import json
try:
    from urllib import unquote
except ImportError:
    from urllib.parse import unquote


LOGGER = getLogger(__name__)


class RequestPath(text_type):

    PREFIX = "/api/"

    def __new__(cls, path_info):
        if not path_info.startswith(cls.PREFIX):
            raise ValueError("Requested URL should starts with '{0}'".format(
                cls.PREFIX
                ))
        return text_type.__new__(cls, path_info)

    def __init__(self, path_info):
        self.version = None
        self.resource = None
        self.resource_id = None
        self.extra_path = None
        path_info = self[len(self.PREFIX):]
        parts = path_info.split("/", 3)
        try:
            self.version = parts.pop(0) or None
            self.resource = parts.pop(0) or None
            self.resource_id = parts.pop(0) or None
            self.extra_path = parts.pop(0) or None
        except IndexError:
            pass


class Request(object):

    def __init__(self, env):
        self.env = env
        self.path = RequestPath(env.get("PATH_INFO", ""))
        self.query_string = env.get("QUERY_STRING", "")

    @property
    def accept(self):
        try:
            return self._accept
        except AttributeError:
            accept = list()
            parts = self.env.get("ACCEPT", "").split(",")
            for mediarange in parts:
                if mediarange.strip() != "":
                    mediaparts = mediarange.split(";")
                    mediatype = mediaparts.pop(0).strip()
                    q = 1
                    for param in mediaparts:
                        param = param.strip()
                        if param.startswith("q="):
                            q = float(param[2:])
                        else:
                            mediatype += ";" + param
                    accept.append((mediatype, q))
        self._accept = list(sorted(accept, key=lambda x: x[1], reverse=True))
        return self._accept

    @property
    def charset(self):
        try:
            return self._charset
        except AttributeError:
            self.content_type  # charset is defined with the Content-Type
        return self._charset

    @property
    def content_type(self):
        try:
            return self._content_type
        except AttributeError:
            parts = self.env.get("CONTENT_TYPE", "").split(";")
            self._content_type = parts[0]
            charset = None
            if len(parts) > 1:
                parts = parts[1].split("=", 1)
                if len(parts) == 2 and parts[0].strip().lower() == "charset":
                    charset = parts[1].strip()
            self._charset = charset or "utf-8"
        return self._content_type

    @property
    def cookie(self):
        try:
            return self._cookie
        except AttributeError:
            self._cookie = SimpleCookie(self.env.get("HTTP_COOKIE", ""))
        return self._cookie

    @property
    def get(self):
        try:
            return self._get
        except AttributeError:
            get_env = {"QUERY_STRING": self.env.get("QUERY_STRING", "")}
            fields = FieldStorage(environ=get_env, keep_blank_values=True)
            self._get = {}
            for key in fields.keys():
                self._get[key] = fields.getvalue(key)
        return self._get

    @property
    def method(self):
        try:
            return self._method
        except AttributeError:
            self._method = self.env.get("REQUEST_METHOD", "")
        return self._method

    @property
    def post(self):
        try:
            return self._post
        except AttributeError:
            pass
        try:
            post_env = self.env.copy()
            post_env["QUERY_STRING"] = ""
            self._post = FieldStorage(
                fp=self.env.get('wsgi.input'),
                environ=post_env,
                keep_blank_values=True
                )
        except:
            LOGGER.exception("Unable to read post parameters")
            raise HTTPBadRequest("Unable to read post parameters")
        #else:
        return self._post

    @property
    def remote_addr(self):
        try:
            return self._remote_addr
        except AttributeError:
            self._remote_addr = self.env.get("REMOTE_ADDR")
        return self._remote_addr

    @property
    def remote_port(self):
        try:
            return self._remote_port
        except AttributeError:
            self._remote_port = self.env.get("REMOTE_PORT")
        return self._remote_port

    @property
    def request_uri(self):
        try:
            return self._request_uri
        except AttributeError:
            self._request_uri = self.env.get("REQUEST_URI")
        return self._request_uri

    @property
    def session(self):
        try:
            return self._session
        except AttributeError:
            encoded_session = self.env.get("SESSION") or None
            if isinstance(encoded_session, text_type):
                encoded_session = b(encoded_session)
        if encoded_session is None or encoded_session == b"none":
            self._session = None
            return self._session
        #else:
        try:
            self._session = Session.unserialize(encoded_session)
        except (TypeError, ValueError):
            LOGGER.exception("Unable to unserialize session")
            self._session = None
        return self._session

    @property
    def user_agent(self):
        try:
            return self._user_agent
        except AttributeError:
            self._user_agent = self.env.get("HTTP_USER_AGENT")
        return self._user_agent

    def get_content(self):
        codec = self.get_codec()
        if codec is None:
            raise HTTPUnsupportedMediaType()
        charset = self._charset
        return codec.decode(self.env.get('wsgi.input'), encoding=charset)

    def get_codec(self):
        content_type = self.content_type
        if content_type:
            return CodecDB().get(self.content_type)
        #else:
        return CodecDB()["application/json"]

    def __str__(self):
        return ("{self.method!r} request on {self.request_uri!r} "
                "from '{self.remote_addr!s}:{self.remote_port!s}'"
                ).format(self=self)


class Response(object):

    DEFAULT_HEADERS = {
        }

    def __init__(self, start_response):
        self.status = HTTPOK()
        self.headers = self.DEFAULT_HEADERS.copy()
        self._headers_sent = False
        self._start_response = start_response
        self._codec = None

    @property
    def headers_sent(self):
        return self._headers_sent

    def set_headers(self, headers={}):
        if self._headers_sent:
            LOGGER.warn("Update headers but they are already sent")
        self.headers.update(headers)

    def set_status(self, status):
        if self._headers_sent:
            LOGGER.warn("Change status but headers are already sent")
        self.status = status
        self.headers.update(status.headers)

    def set_codec(self, codec):
        if self._headers_sent:
            LOGGER.warn("Change codec but headers are already sent")
        else:
            self.set_headers({
                "Content-Type": codec.get_content_type() + "; charset=utf-8"
                })
        self._codec = codec

    def send_headers(self, status=None, headers={}):
        if status is not None:
            self.headers.update(status.headers)
        else:
            status = self.status
        self.headers.update(headers)
        if self._headers_sent:
            LOGGER.critical("Try to send headers but headers are already sent")
            return False
        #else:
        self._headers_sent = True
        LOGGER.info("Start response: {0}".format(status))
        try:
            LOGGER.debug(self.headers)
            self._start_response(
                str(status),
                [(key, value) for key, value in self.headers.items()]
                )
        except:
            LOGGER.exception("Unable to send HTTP response headers")
            return False
        #else:
        return True

    def send(self, body=[], status=None):
        if status and not isinstance(status, HTTPStatus):
            #FIXME: add support for numeric status
            LOGGER.error("Invalid status %r for method send" % status)
            status = HTTPInternalServerError()

        tmp = None
        try:
            tmp = len(body)
        except:
            pass
        if body is None or tmp == 0:
            body = []
        elif self._codec is not None:
            try:
                body = self._codec.encodes(body)
            except Exception:
                LOGGER.exception(
                    "Unable to encode response using selected codec")
                status = HTTPInternalServerError()
                body = []
        del tmp

        if isinstance(body, string_types):
            body = [body]

        if len(body) == 0 and not self._headers_sent:
            if "Content-Type" in self.headers:
                del self.headers["Content-Type"]

        self.send_headers(status)
        if status is None:
            status = self.status
        if HTTPStatus.is_success(status.code):
            return body
        elif HTTPStatus.is_error(status.code):
            return []
        elif HTTPStatus.is_redirect(status.code):
            return []
        #else:
        #FIXME: other cases


def parse_range(range_str):
    """Return a tuple (offset, limit), or raises a ValueError in case of
    invalid range_str format. Valid format is "{offset}-{limit}".
    """
    tmp = range_str.split("-", 1)
    if len(tmp) != 2:
        raise ValueError("Invalid range format")
    #else:
    try:
        return tuple(map(int, tmp))
    except ValueError:
        raise ValueError("Invalid range format")


class SortConverter(object):
    """Convert the sort condition of the query string to an internal abstract
    representation (using itt.storage.expr.SortExpr)
    """

    def convert(self, model_cls, sort_str):
        props = dict(properties_as_items(model_cls))
        tmp = sort_str.split(",")
        tmp = map(lambda x: x.strip(), tmp)
        tmp = filter(lambda x: len(x) > 0, tmp)
        tmp = map(lambda x: self.parse_cond(props, x), tmp)
        return SortExpr(*tmp)

    def parse_cond(self, properties, cond_str):
        expr_cls = Asc
        if cond_str[0] == "-":
            cond_str = cond_str[1:]
            expr_cls = Desc
        elif cond_str[0] == "+":
            cond_str = cond_str[1:]
        try:
            properties[cond_str]
        except KeyError:
            raise ValueError("Unknown propertie " + cond_str)
        #else:
        return expr_cls(Prop(cond_str))


class QueryStringConverter(object):
    """Convert the arguments specified in the query string to an internal
    abstract criteria representation (see itt.storage.expr module).
    """

    Converters = dict()

    def convert(self, model_cls, criteria_tsl):
        """Convert a criteria dict created from url to an abstract expression
        """
        if len(criteria_tsl.keys()) == 0:
            return None

        exprs = list()
        props = dict(properties_as_items(model_cls))

        for key in criteria_tsl.keys():
            exprs.append(
                self._convert(type(props[key]), key, criteria_tsl.get(key)))

        if len(exprs) > 1:
            final_exp = And(*exprs)
        else:
            final_exp = exprs[0]

        return final_exp

    def _convert(self, attr_type, key, value):
        """Call the appropriate converter based on the model attribute type
        """
        if type(value) is list:
            exprs = list()
            for val in value:
                exprs.append(self.Converters[attr_type](
                    self, key, unquote(str(val))))
            return Or(*exprs)
        #else
        return self.Converters[attr_type](
            self, key, unquote(str(value)))

    def _interprete_int(self, key, value):
        """Transform an operation manupulating Intergers to abstract expression
        """
        prop = Prop(key)

        if value.find(',') != -1:
            values = list(map(
                lambda x: Const(Integer().adapt(x.strip())),
                value.split(',')
                ))
            return In(prop, ListExpr(*values))

        elif value.startswith('[') and value.endswith(']'):
            rg_val = RangeExpr(*list(map(
                lambda x: Const(Integer().adapt(x.strip())),
                value[1:-1].split(';')
                )))
            return In(prop, rg_val)

        elif value.startswith('lt(') and value.endswith(')'):
            value_parsed = value[3:-1]
            return Lt(prop, Const(Integer().adapt(value_parsed)))

        elif value.startswith('gt(') and value.endswith(')'):
            value_parsed = value[3:-1]
            return Gt(prop, Const(Integer().adapt(value_parsed)))

        elif value.startswith('le(') and value.endswith(')'):
            value_parsed = value[3:-1]
            return Le(prop, Const(Integer().adapt(value_parsed)))

        elif value.startswith('ge(') and value.endswith(')'):
            value_parsed = value[3:-1]
            return Ge(prop, Const(Integer().adapt(value_parsed)))

        #else
        return Equal(prop, Const(Integer().adapt(value)))

    Converters[Integer] = _interprete_int

    def _interprete_string(self, key, value):
        """Transform an operation manupulating Strings to abstract expression
        """
        prop = Prop(key)

        if value.startswith('none(') and value.endswith(')'):
            value = value[5:-1]
            values = list(map(
                lambda x: Const(String().adapt(x.strip())),
                value.split(',')
                ))
            return Nin(prop, ListExpr(*values))

        elif value.find(',') != -1:
            values = list(map(
                lambda x: Const(String().adapt(x.strip())),
                value.split(',')
                ))

            return In(prop, ListExpr(*values))

        elif value.find('*') != -1:
            value_splitted = value.split("*")
            exprs_concat = list()
            for val in value_splitted:
                if val == "":
                    exprs_concat.append(LikeOperator())
                else:
                    exprs_concat.append(Const(String().adapt(val)))

            return Like(prop, LikeOperand(Concat(*exprs_concat)))

        #else
        return Equal(prop, Const(String().adapt(value)))

    Converters[String] = _interprete_string
    Converters[Enum] = _interprete_string

    def _interprete_date(self, key, value):
        """Transform an operation manupulating Dates to abstract expression
        """
        prop = Prop(key)

        if value.startswith('[') and value.endswith(']'):
            rg_val = RangeExpr(*list(map(
                lambda x: DateOperand(Date().adapt(x.strip())),
                value[1:-1].split(';')
                )))
            return In(prop, rg_val)

        elif value.startswith('lt(') and value.endswith(')'):
            value_parsed = value[3:-1]
            return Lt(prop, DateOperand(Date().adapt(value_parsed)))

        elif value.startswith('gt(') and value.endswith(')'):
            value_parsed = value[3:-1]
            return Gt(prop, DateOperand(Date().adapt(value_parsed)))

        elif value.startswith('le(') and value.endswith(')'):
            value_parsed = value[3:-1]
            return Le(prop, DateOperand(Date().adapt(value_parsed)))

        elif value.startswith('ge(') and value.endswith(')'):
            value_parsed = value[3:-1]
            return Ge(prop, DateOperand(Date().adapt(value_parsed)))

        return Equal(prop, DateOperand(Date().adapt(value)))

    Converters[Date] = _interprete_date

    def _interprete_datetime(self, key, value):
        """Transform an operation manupulating Datetimes to abstract expression
        """
        prop = Prop(key)

        if value.startswith('[') and value.endswith(']'):
            rg_val = RangeExpr(*list(map(
                lambda x: DateOperand(Datetime().adapt(x.strip())),
                value[1:-1].split(';')
                )))
            return In(prop, rg_val)

        elif value.startswith('lt(') and value.endswith(')'):
            value_parsed = value[3:-1]
            return Lt(prop, DateOperand(Datetime().adapt(value_parsed)))

        elif value.startswith('gt(') and value.endswith(')'):
            value_parsed = value[3:-1]
            return Gt(prop, DateOperand(Datetime().adapt(value_parsed)))

        elif value.startswith('le(') and value.endswith(')'):
            value_parsed = value[3:-1]
            return Le(prop, DateOperand(Datetime().adapt(value_parsed)))

        elif value.startswith('ge(') and value.endswith(')'):
            value_parsed = value[3:-1]
            return Ge(prop, DateOperand(Datetime().adapt(value_parsed)))

        return Equal(prop, DateOperand(Datetime().adapt(value)))

    Converters[Datetime] = _interprete_datetime

    def _interprete_list(self, key, value):
        """Transform an operation manupulating Lists to an abstract expression
        """
        prop = Prop(key)

        if value.startswith('all(') and value.endswith(')'):
            value = value[4:-1]
            values = list(map(
                lambda x: Const(String().adapt(x.strip())),
                value.split(',')
                ))
            return Contains(prop, ListExpr(*values))

        if value.startswith('none(') and value.endswith(')'):
            value = value[5:-1]
            values = list(map(
                lambda x: Const(String().adapt(x.strip())),
                value.split(',')
                ))
            return Nin(prop, ListExpr(*values))

        elif value.find(',') != -1:
            values = list(map(
                lambda x: Const(String().adapt(x.strip())),
                value.split(',')
                ))
            return In(prop, ListExpr(*values))

        return Equal(prop, Const(String().adapt(value)))

    Converters[List] = _interprete_list
    Converters[Set] = _interprete_list


class Controller(object):

    DefaultCodec = CodecDB()["application/json"]
    AuthRequired = True

    def __init__(self, store, request, response):
        LOGGER.debug("Init a {0}".format(self))
        self.store = store
        self.request = request
        self.response = response

    def __call__(self):
        LOGGER.debug("{0} is handling the request".format(self))
        if self.is_auth_required():
            self.validate_auth()

        if self.request.path.extra_path is not None:
            #FIXME: does not support overlapping resources yet
            LOGGER.info("no support of overlapping resources yet")
            raise HTTPNotFound()
        #else:
        path = self.request.path
        method = self.request.method

        #Check invoked http method is allowed/supported
        #FIXME: add HEAD support ?
        allowed = self._get_allowed_methods()
        if path.resource_id is None:
            args = ()
        else:
            args = (path.resource_id, )

        if method not in allowed:
            raise HTTPMethodNotAllowed({"Allow": ", ".join(allowed)})
        #else:
        func_name = self._get_func_name(method)
        try:
            func = getattr(self, func_name)
        except AttributeError:
            LOGGER.critical("Controller has no '{0}' method".format(func_name))
            raise HTTPInternalServerError()
        #else:

        #Try to guess the best content type for the response
        codec = self._choose_response_codec()

        if codec is None:
            if len(self.request.accept) > 0:
                msg = "None of the specified media type is acceptable"
                LOGGER.error(msg)
                raise HTTPNotAcceptable()
            else:
                msg = "Unable to choose a Content-Type for the response"
                LOGGER.error(msg)
                raise HTTPBadRequest()

        self.response.set_codec(codec)

        #Execute the invoked method and return the result
        data = func(*args)
        return data

    def is_auth_required(self):
        return self.AuthRequired

    def validate_auth(self):
        if self.request.session is None:
            raise StoreAuthenticationError("Authentication is required")

    def _get_allowed_methods(self):
        #FIXME: add HEAD support ?
        if self.request.path.resource_id is None:
            return ("GET", "POST", "OPTIONS")
        #else:
        return ("GET", "PUT", "OPTIONS", "PATCH", "DELETE")

    def _get_func_name(self, method):
        return "do_{0}".format(method.lower())

    def _choose_response_codec(self):
        try:
            server_preference = []
            if self.DefaultCodec.can_encode():
                server_preference.append(self.DefaultCodec)
            req_codec = self.request.get_codec()
            if req_codec and req_codec.can_encode():
                server_preference.append(req_codec)
            for content_type, q in self.request.accept:
                possible_codecs = CodecDB().find(content_type)
                for prefered_codec in server_preference:
                    if prefered_codec in codecs:
                        return prefered_codec
                for c in possible_codecs:
                    if c.can_encode():
                        return c
        except:
            LOGGER.warn("Error when parsing the Accept header:\n{0}".format(
                self.request.env.get("ACCEPT", "")
                ))

        if len(self.request.accept) > 0:
            return None
        #else:
        try:
            return server_preference[0]
        except IndexError:
            return None

    def get_request_content(self):
        return self.request.get_content()

    def __str__(self):
        return "<{0}>".format(typename(self))


class ResourceController(Controller):

    # This attribute has to be overridden !
    Resource = None

    def __init__(self, store, request, response):
        Controller.__init__(self, store, request, response)
        self._converter = QueryStringConverter()
        self._sort_converter = SortConverter()

    def do_get(self, resource_id=None):
        if resource_id is None:
            parameters = self.request.get
            sort_str = parameters.pop("sort", "")
            range_str = parameters.pop("range", None)

            criteria = self._converter.convert(self.Resource, parameters)
            #FIXME: parse the sort parameter
            sort = self._sort_converter.convert(self.Resource, sort_str)

            if range_str is not None:
                try:
                    offset, limit = parse_range(range_str)
                except ValueError as err:
                    self.response.set_status(HTTPBadRequest())
                    return {"reason": "Invalid 'range' parameter"}
                #else:
                res = self.find(criteria, sort, offset, limit)
            else:
                res = self.find(criteria, sort)

            if isinstance(res, ResultSet):
                content_range = "{0.offset}-{0.limit}/{0.count}".format(res)
                accept_range = "{0.model_name} {0.maximum}".format(res)
                range_headers = {
                    "Content-Range": content_range,
                    "Accept-Range": accept_range,
                    }
                if res.is_partial():
                    self.response.set_status(HTTPPartialContent(range_headers))
                else:
                    self.response.set_status(HTTPOK(range_headers))
            return res
        #else:
        resource = self.load(resource_id)
        if resource is None:
            raise HTTPNotFound()
        #else:
        self.response.set_status(HTTPOK())
        return resource

    def do_post(self):
        data = self.get_request_content()
        if not isinstance(data, dict):
            LOGGER.error("Invalid resource data type")
            raise HTTPBadRequest(body={"reason": "Invalid resource data type"})
        try:
            resource = self.create(data)
        except ValueError as err:
            LOGGER.exception("ValueError caught")
            self.response.set_status(HTTPBadRequest())
            return {"reason": err.args[0]}
        except HTTPStatus:
            raise
        except:
            LOGGER.exception("Unable to create resource")
            raise HTTPInternalServerError()
        #else:
        self.response.set_status(HTTPCreated())
        #FIXME: set Location header
        return resource

    def do_put(self, resource_id):
        resource = self.load(resource_id)
        data = self.get_request_content()
        if resource is None:
            try:
                resource = self.create(data, resource_id)
            except ValueError as err:
                self.response.set_status(HTTPBadRequest())
                return {"reason": err.args[0]}
            except HTTPStatus:
                raise
            except:
                LOGGER.exception("Unable to create resource 'id:{0}'".format(
                    resource_id
                    ))
                raise HTTPInternalServerError()
            #else:
            self.response.set_status(HTTPCreated())
        else:
            try:
                resource = self.replace(resource, data)
            except ValueError as err:
                self.response.set_status(HTTPBadRequest())
                return {"reason": err.args[0]}
            except HTTPStatus:
                raise
            except:
                LOGGER.exception("Unable to update resource '{0}'".format(
                    resource
                    ))
                raise HTTPInternalServerError()
            #else:
            self.response.set_status(HTTPOK())
        #FIXME: set Location header
        return resource

    def do_patch(self, resource_id):
        resource = self.load(resource_id)
        data = self.get_request_content()
        if resource is None:
            raise HTTPNotFound()
        #else:
        try:
            resource = self.update(resource, data)
        except ValueError as err:
            self.response.set_status(HTTPBadRequest())
            return {"reason": err.args[0]}
        except HTTPStatus:
            raise
        except:
            LOGGER.exception("Unable to update resource '{0}'".format(
                resource
                ))
            raise HTTPInternalServerError()
        #else:
        self.response.set_status(HTTPOK())
        return resource

    def do_delete(self, resource_id):
        resource = self.load(resource_id)
        if resource is None:
            raise HTTPNotFound()
        #else:
        try:
            self.delete(resource)
        except HTTPStatus:
            raise
        except:
            LOGGER.exception("Unable to delete resource '{0}'".format(
                resource
                ))
            raise HTTPInternalServerError()
        #else:
        self.response.set_status(HTTPNoContent())
        return None

    def do_options(self, resource_id=None):
        #FIXME: discard request body (if any)
        #FIXME: implement
        pass

    def load(self, resource_id):
        pass

    def find(self, criteria, sort=None, offset=0, limit=50):
        pass

    def create(self, data, resource_id=None):
        pass

    def update(self, resource, data):
        pass

    def replace(self, resource, data):
        pass

    def delete(self, resource):
        pass


@singleton
class Server(object):

    def __init__(self):
        self.store = None
        self.controllers = {}

    def set_store(self, store):
        self.store = store

    def register_controller(self, resource_name, controller):
        assert issubclass(controller, Controller)
        resource_name = self._adapt_resource_name(resource_name)
        self.controllers[resource_name] = controller

    def _adapt_resource_name(self, resource_name):
        if resource_name.startswith("/"):
            resource_name = resource_name[1:]
        return resource_name.lower()

    def __call__(self, env, start_response):
        LOGGER.debug("Request received")
        try:
            request = Request(env)
            LOGGER.info(text_type(request))
            response = Response(start_response)
            resource_name = request.path.resource
            try:
                controller_cls = self.controllers[resource_name]
            except KeyError:
                LOGGER.error("No controller for resource '{0}'".format(
                    resource_name
                    ))
                raise HTTPNotFound()

            controller = controller_cls(self.store, request, response)
            body = controller() or []
            return response.send(body)

        except HTTPStatus as status:
            return response.send([], status)

        except StoreAuthenticationError as err:
            headers = {"WWW-Authenticate": "Reveelium"}  # FIXME: valid realm?
            return response.send([b(str(err))], HTTPUnauthorized(headers))

        except Exception:
            LOGGER.exception("Unexpected exception")
            return response.send([], HTTPInternalServerError())


def register_controller(resource_name):
    """Conveniance decorator to register a controller against the server
    instance.
    """
    def decorator(controller):
        Server().register_controller(resource_name, controller)
        return controller
    return decorator
