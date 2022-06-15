#!/usr/bin/python
# -*- coding: utf-8 -*-
# Author: Vincent Alquier <v.alquier@itrust.fr>
# Copyrights (c) 2015 by ITrust

"""List of commonly used HTTP Status. For the status code definitions, see
http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html

HTTPStatus is the top level class. All other status inherits from it. It should
never be instantiated directly.

HTTPInformation, HTTPSuccess, HTTPRedirect, HTTPClientError and HTTPServerError
are parents of "real" http status. They are not intended to be instantiated
directly.

StatusList provides a dict containing all instantiable http status (keys are
status codes and values are status classes).

Here is the hierarchy of the defined status:

    HTTPStatus:
     +-- HTTPInformation
     +-- HTTPSuccess
          +-- HTTPOK
          +-- HTTPCreated
          +-- HTTPAccepted
          +-- HTTPNoContent
          +-- HTTPPartialContent
     +-- HTTPRedirect
          +-- HTTPMovedPermanently
          +-- HTTPSeeOther
     +-- HTTPClientError
          +-- HTTPBadRequest
          +-- HTTPUnauthorized
          +-- HTTPForbidden
          +-- HTTPNotFound
          +-- HTTPMethodNotAllowed
          +-- HTTPNotAcceptable
          +-- HTTPGone
          +-- HTTPLengthRequired
          +-- HTTPUnsupportedMediaType
     +-- HTTPServerError
          +-- HTTPInternalServerError
          +-- HTTPNotImplemented
"""


from itrust.common import with_metaclass


# StatusList provides a dict containing all instantiable http status (keys are
# status codes and values are status classes).
StatusList = dict()


class _MetaStatus(type):

    def __new__(mcls, name, bases, namespace):
        """Add the HTTPStatus subclass to StatusList."""
        cls = type.__new__(mcls, name, bases, namespace)
        try:
            code = int(cls.__doc__[:3])
        except (AttributeError, TypeError, ValueError):
            pass
        else:
            StatusList[code] = cls
        return cls


class HTTPStatus(with_metaclass(_MetaStatus, Exception)):
    """Parent class of all HTTP Status.
    This class is not supposed to be instantiated.
    """

    def __init__(self, headers={}, body=None):
        """Status can define additionnal headers expected to be found in a
        server response.
        """
        Exception.__init__(self, self.__doc__)
        self.headers = headers
        self.body = body

    @property
    def code(self):
        """The status code. Response must be None if the current instance is
        not a "real" status.
        """
        try:
            return self._code
        except AttributeError:
            pass
        try:
            self._code = int(self.__doc__[:3])
        except (TypeError, ValueError):
            self._code = None
        return self._code

    @classmethod
    def is_information(cls, code):
        return 100 <= code <= 199

    @classmethod
    def is_success(cls, code):
        return 200 <= code <= 299

    @classmethod
    def is_redirect(cls, code):
        return 300 <= code <= 399

    @classmethod
    def is_error(cls, code):
        return 400 <= code <= 599

    @classmethod
    def is_client_error(cls, code):
        return 400 <= code <= 499

    @classmethod
    def is_server_error(cls, code):
        return 500 <= code <= 599

    def __str__(self):
        return self.__doc__


# Informational

class HTTPInformation(HTTPStatus):
    """1XX Information
    Parent class of all informational http status.
    This class is not supposed to be instantiated.
    """


# Success

class HTTPSuccess(HTTPStatus):
    """2XX Success
    Parent class of all status related successful request.
    This class is not supposed to be instantiated.
    """


class HTTPOK(HTTPSuccess):
    """200 OK"""


class HTTPCreated(HTTPSuccess):
    """201 Created"""


class HTTPAccepted(HTTPSuccess):
    """202 Accepted"""


class HTTPNoContent(HTTPSuccess):
    """204 No Content"""


class HTTPPartialContent(HTTPSuccess):
    """206 Partial Content"""

    def __init__(self, headers, body=None):
        """headers must define the "Content-Range" key. Raises KeyError if it
        is not defined.
        """
        headers["Content-Range"]
        HTTPStatus.__init__(self, headers, body)


# Redirections

class HTTPRedirect(HTTPStatus):
    """3XX Redirect
    Parent class of all redirections.
    This class is not supposed to be instantiated.
    """

    def __init__(self, headers, body=None):
        """headers must define the "Location" key. Raises KeyError if it is
        not defined.
        """
        headers["Location"]
        HTTPStatus.__init__(self, headers, body)


class HTTPMovedPermanently(HTTPRedirect):
    """301 Moved Permanently"""


class HTTPSeeOther(HTTPRedirect):
    """303 See Other"""


# Client Errors

class HTTPClientError(HTTPStatus):
    """4XX Client Error
    Parent class of all errors related to wrong behaviour of the client.
    This class is not supposed to be instantiated.
    """


class HTTPBadRequest(HTTPClientError):
    """400 Bad Request"""


class HTTPUnauthorized(HTTPClientError):
    """401 Unauthorized"""

    def __init__(self, headers, body=None):
        """headers must define the "WWW-Authenticate" key. Raises KeyError if
        it is not defined.
        """
        headers["WWW-Authenticate"]
        HTTPStatus.__init__(self, headers, body)


class HTTPForbidden(HTTPClientError):
    """403 Forbidden"""


class HTTPNotFound(HTTPClientError):
    """404 Not Found"""


class HTTPMethodNotAllowed(HTTPClientError):
    """405 Method Not Allowed"""

    def __init__(self, headers, body=None):
        """headers must define the "Allow" key. Raises KeyError if it is
        not defined.
        """
        headers["Allow"]
        HTTPStatus.__init__(self, headers, body)


class HTTPNotAcceptable(HTTPClientError):
    """406 Not Acceptable"""


class HTTPGone(HTTPClientError):
    """410 Gone"""


class HTTPLengthRequired(HTTPClientError):
    """415 Length Required"""


class HTTPUnsupportedMediaType(HTTPClientError):
    """415 Unsupported Media Type"""


# Server Errors

class HTTPServerError(HTTPStatus):
    """5XX Server Error
    Parent class of all server side errors.
    This class is not supposed to be instantiated.
    """


class HTTPInternalServerError(HTTPServerError):
    """500 Internal Server Error"""


class HTTPNotImplemented(HTTPServerError):
    """501 Not Implemented"""
