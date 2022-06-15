#!/usr/bin/python
# -*- coding: utf-8 -*-
# Author: Vincent Alquier <v.alquier@itrust.fr>
# Copyrights (c) 2015 by ITrust

"""Authentication, companies and users related models.
"""

import binascii
import pickle
from six import binary_type
from ..model import *
from ..storage.store import storable_model


USER_PROFILES = ("user", "admin")
SESSION_STATES = ("active", "expired")


@storable_model("companies")
class Company(Resource):

    #_id = String()           inherited from Resource
    #created_at = Datetime()  inherited from Resource
    #updated_at = Datetime()  inherited from Resource
    name = String()


@storable_model("users")
class User(Resource):

    #_id = String()           inherited from Resource
    #created_at = Datetime()  inherited from Resource
    #updated_at = Datetime()  inherited from Resource
    company_id = String()            # FIXME: Reference to Company._id
    profile = Enum(USER_PROFILES, case_sensitive=False)
    name = String()
    email = String()
    login = String()
    password = Password()


@storable_model("sessions")
class Session(Resource):

    user_id = String()               # FIXME: Reference to User._id
    state = Enum(SESSION_STATES)
    remote = List()                  # list of tuple ("ip:port", "user agent")

    def is_active(self):
        #FIXME: implement session expiration
        return True

    @classmethod
    def serialize(cls, inst=None):
        if inst is None:
            inst = cls
        if not isinstance(inst, Session):
            raise TypeError("Can't serialize type {0!r}".format(type(inst)))
        #else:
        try:
            return binascii.hexlify(pickle.dumps(inst))
        except (pickle.PicklingError, binascii.Error):
            raise ValueError("Unable to serialize {0!r}".format(inst))

    @classmethod
    def unserialize(cls, encoded):
        if not isinstance(encoded, binary_type):
            raise TypeError(
                "Can't unserialize type {0!r}".format(type(encoded)))
        #else:
        try:
            inst = pickle.loads(binascii.unhexlify(encoded))
        except (binascii.Error, pickle.UnpicklingError):
            raise ValueError(
                "Unable to unserialize session {0!r}".format(encoded))
        #else:
        if not isinstance(inst, Session):
            raise TypeError(
                "Invalid unserialized type {0!r}".format(type(inst)))
        #else:
        return inst
