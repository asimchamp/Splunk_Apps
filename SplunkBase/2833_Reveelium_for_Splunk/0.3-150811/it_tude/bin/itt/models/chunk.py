#!/usr/bin/python
# -*- coding: utf-8 -*-
# Author: Vincent Alquier <v.alquier@itrust.fr>
# Copyrights (c) 2015 by ITrust

"""Datasource and uploads related models.
"""

from ..model import *
from ..storage.store import storable_model


LOGTYPES = ("dns", "proxy")
CHUNKSTATES = ("new", "uploaded", "deleted")


@storable_model("chunks")
class Chunk(Resource):

    #_id = String()           inherited from Resource
    #created_at = Datetime()  inherited from Resource
    #updated_at = Datetime()  inherited from Resource
    owner = String(read_only=True)
    logtype = Enum(LOGTYPES, case_sensitive=False)
    state = Enum(CHUNKSTATES, case_sensitive=False,
                 read_only=True, default="new")
    source = String()
    started_at = Datetime()
    ended_at = Datetime()
    size = Integer(read_only=True)
    storage_path = String(read_only=True)
    pipelines = Set(read_only=True, allow_none=False, default=set())

    def __init__(self, **kwargs):
        #FIXME: use a proper validation mechanism
        if "logtype" not in kwargs:
            raise ValueError("'logtype' is required")
        #else:
        if kwargs["logtype"] not in LOGTYPES:
            raise ValueError(
                "Invalid value for 'logtype' (accepts: dns, proxy)")
        #else:
        if "started_at" not in kwargs:
            raise ValueError("'started_at' is required")
        #else:
        if "ended_at" not in kwargs:
            raise ValueError("'updated_at' is required")
        #else:
        Model.__init__(self, **kwargs)
