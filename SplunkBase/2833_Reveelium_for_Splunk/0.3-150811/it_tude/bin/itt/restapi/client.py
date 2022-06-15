#!/usr/bin/python
# -*- coding: utf-8 -*-
# Author: Vincent Alquier <v.alquier@itrust.fr>
# Copyrights (c) 2015 by ITrust

"""Client side tools and utilities of the IT-tude REST API.
"""

from .codec import CodecDB
from ..storage.store import (
    storable_name, Store, StoreAuthenticationError, StoreConnectionError,
    StoreDataValidationError, StoreError, StoreInternalError, StoreTimeout,
    ResultSet
    )
from ..model import Property
from ..models.auth import Session
from ..storage import expr
from itrust.common import PY2, PY3
from logging import getLogger
from socket import timeout as socket_timeout
if PY2:
    from httplib import HTTPConnection, HTTPException
    from urlparse import urlparse
else:
    from http.client import HTTPConnection, HTTPException
    from urllib.parse import urlparse


LOGGER = getLogger(__name__)


def get_os_string():
    from os import uname
    return "{0} {4}".format(*uname())


#FIXME: implement https support
#FIXME: implement proxy support
#FIXME: implement search criteria support


class ClientAPICompiler(expr.Compiler):

    def compile(self, abstract_expr):
        """
        """
        if abstract_expr:
            return abstract_expr.to_url()
        #else:
        return ""


class APIStore(Store):
    """Store and retrieve models on a remote RESTful IT-tude API.
    """

    Codec = CodecDB()["application/json"]
    Headers = {
        "Accept": "application/json",
        "Accept-Charset": "utf-8",
        "User-Agent": "Reveelium/1.0 (" + get_os_string() + ") Python-httplib",
        }

    def __init__(self, api_url, username=None, password=None, session_id=None):
        if (username or password) and session_id:
            raise RuntimeError("You can't set both credentials and session_id")
        elif not ((username and password) or session_id):
            raise RuntimeError("You have to specify credentials or session_id")
        #else:
        Store.__init__(self, ClientAPICompiler())
        url = urlparse(api_url)
        self.headers = dict(self.Headers)
        host = url.hostname
        scheme = url.scheme
        if scheme == "http":
            port = url.port or 80
        elif scheme == "https":
            port = url.port or 443
        else:
            raise ValueError("Invalid URL scheme")

        self.autodisconnect = False
        self._base_path = url.path.rstrip("/")
        self._conn = HTTPConnection(host, port, timeout=10)
        self._session_meta = {}
        self._credentials = None
        if session_id:
            self.headers["Session-Id"] = session_id
        elif username and password:
            self._credentials = (username, password)

    @property
    def session(self):
        try:
            return self._session
        except AttributeError:
            session_id = self.headers.get("Session-Id", None)

        if session_id:
            try:
                session = self.load(Session, session_id)
            except:
                #FIXME: handle session retrieval errors
                raise

        elif self._credentials:
            try:
                session = Session()
                session.login, session.password = self._credentials
                self.save(session)
            except:
                #FIXME: handle connection errors
                raise
            else:
                del session.login, session.password

        else:
            raise RuntimeError("No session set")

        self._session = session
        self.headers["Session-Id"] = session._id
        return self._session

    def __enter__(self):
        if "Session-Id" in self.headers:
            self.autodisconnect = False
        else:
            self.autodisconnect = True
            self.session
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        if self.autodisconnect:
            self.disconnect()

    def disconnect(self):
        """Delete the currently used session.
        """
        session_id = self.headers.get("Session-Id", None)
        self.autodisconnect = False
        try:
            session = self._session
        except AttributeError:
            pass
        else:
            del self._session
            if session_id is None:
                #this shouldn't happend...
                session_id = session._id

        if session_id is not None:
            try:
                self.remove_by_id(Session, session_id)
            except:
                #FIXME: handle disconnection errors
                raise
            finally:
                #this can't be done before calling remote session removal
                self.headers.pop("Session-Id", None)

    def log_upload(self, fp, chunk):
        """Upload a logfile to the IT-tude server. fp is an open file object
        supporting fileno() and read() methods. chunk is an instance of the
        Chunk model (or an object with an _id attribute). Chunk must be saved
        before trying to upload the file.
        """
        if chunk._id is None:
            raise ValueError("You must save the chunk first")
        #else:
        if chunk.state != "new":
            raise ValueError("This chunk has already been uploaded")
        #else:
        method = "POST"
        path = "/uploads/{0}".format(chunk._id)
        headers = {}
        if "Session-Id" in self.headers:
            headers["Session-Id"] = self.headers["Session-Id"]
        if "User-Agent" in self.headers:
            headers["User-Agent"] = self.headers["User-Agent"]
        self._request(method, path, fp, headers)
        self.reload(chunk)

    def _encode_data(self, data):
        return self.Codec.encodes(data, encoding="utf-8")

    def _request(self, method, path, body=None, headers={}):
        try:
            LOGGER.debug("Requesting {0} {1}".format(method, path))
            self._conn.request(method, path, body=body, headers=headers)
        except OSError:
            self._conn.close()
            LOGGER.exception(
                "Socket connection error when requesting "
                "{0} {1}".format(method, path))
            raise StoreConnectionError("Socket connection error")
        #else:
        try:
            response = self._conn.getresponse()
        except socket_timeout:
            self._conn.close()
            LOGGER.exception(
                "Socket timeout error when requesting "
                "{0} {1}".format(method, path))
            raise StoreTimeout("Timeout on store request")
        except HTTPException:
            self._conn.close()
            LOGGER.exception(
                "HTTP connection error when requesting "
                "{0} {1}".format(method, path))
            raise StoreConnectionError("HTTP connection error")
        #else:
        if 500 <= response.status <= 599:
            # FIXME: Find a better way without comment it.
            #while not response.closed:
            #    response.read()
            LOGGER.error(
                "Requesting {0} {1} returned internal server error "
                "(status {2})".format(method, path, response.status))
            raise StoreInternalError("Store internal error")
        #else:
        if 400 <= response.status <= 499:
            try:
                ret_data = self.Codec.decode(response)
            except ValueError:
                reason = None
            else:
                try:
                    reason = ret_data["reason"]
                except (TypeError, KeyError, IndexError):
                    reason = str(ret_data)
            if response.status == 400:
                LOGGER.error(
                    "Requesting {0} {1} returned data validation error "
                    "(status {2})".format(method, path, response.status))
                raise StoreDataValidationError(reason)
            #else:
            if response.status == 401:
                LOGGER.error(
                    "Requesting {0} {1} returned authentication error "
                    "(status {2})".format(method, path, response.status))
                raise StoreAuthenticationError(reason)
            #else:
            if response.status == 404:
                LOGGER.error(
                    "Requesting {0} {1} returned object not found "
                    "(status {2})".format(method, path, response.status))
                return None
            #else:
            LOGGER.error("Store client error")
            raise StoreError(reason or "Store client error")
        #else:
        try:
            return self.Codec.decode(response)
        except ValueError:
            return None
        finally:
            LOGGER.debug("Requesting {0} {1} succeeded (status {2})".format(
                method, path, response.status))

    def _load_one(self, model_name, model_id):
        """Load a model data from the store (using model_id as identifier to
        retrieve it).
        return None if the model is not found
        """
        path = "/".join((self._base_path, model_name, model_id))
        return self._request("GET", path, headers=self.headers)

    def _save_one(self, model):
        """Save one model to the store. Add the model in case of a first time
        save or update it otherwise.
        """
        model_name = storable_name(model)
        if model._id is None:
            method = "POST"
            path = "/".join((self._base_path, model_name))
        else:
            method = "PUT"
            path = "/".join((self._base_path, model_name, model._id))
        headers = dict(self.headers)
        headers["Content-Type"] = "application/json; charset=utf-8"
        body = self._encode_data(model)
        data = self._request(method, path, body, headers)
        vars(model).update(data)
        return model

    def _search(self, model_name, criteria, sort=None, offset=0, limit=49):
        """Return a dict containing the following keys:
         * offset: index of the first object returned
         * limit: index of the last element returned
         * count: total number of objects in the collection
         * data: an iterable on the objects data
         * maximum: the maximum number of objects to query at once
        """
        path_info = "/".join((self._base_path, model_name))
        query_parts = []
        criteria_string = self._compiler.compile(criteria)
        if criteria_string:
            query_parts.append(criteria_string)
        sort_string = self._compiler.compile(sort)
        if sort_string:
            query_parts.append(sort_string)
        range_string = "range={0:d}-{1:d}".format(offset, limit)
        if range_string:
            query_parts.append(range_string)
        query_string = "&".join(query_parts)
        request_uri = path_info + "?" + query_string
        return self._request("GET", request_uri, headers=self.headers)

    def _remove_one(self, model):
        """Remove the given model from the store.
        """
        model_id = model._id
        if model_id is None:
            LOGGER.warning("This model has never been saved")
            return
        #else:
        model_name = storable_name(model)
        path = "/".join((self._base_path, model_name, model_id))
        return self._request("DELETE", path, headers=self.headers)

    def _remove_one_by_id(self, model_name, model_id):
        """Remove a model from the store, using model_name to identify the type
        and model_id to identify the model.
        """
        path = "/".join((self._base_path, model_name, model_id))
        return self._request("DELETE", path, headers=self.headers)
