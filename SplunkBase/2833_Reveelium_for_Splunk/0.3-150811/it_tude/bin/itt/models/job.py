#!/usr/bin/python
# -*- coding: utf-8 -*-
# Author: Vincent Alquier <v.alquier@itrust.fr>
# Copyrights (c) 2015 by ITrust

"""Jobs management related models.
"""

from ..model import *
from ..storage.store import storable_model


JOB_STATES = ("pending", "running", "done")


@storable_model("pipelines")
class Pipeline(Resource):

    #_id = String()           inherited from Resource
    #created_at = Datetime()  inherited from Resource
    #updated_at = Datetime()  inherited from Resource
    description = String()


@storable_model("jobs")
class Job(Resource):

    #_id = String()           inherited from Resource
    #created_at = Datetime()  inherited from Resource
    #updated_at = Datetime()  inherited from Resource
    company_id = String()            # FIXME: Reference to Company._id
    pipeline_id = String()           # FIXME: Reference to Pipeline._id
    chunks = Set()                   # FIXME: List of references to Chunk._id
    timeslot = Datetime()
    state = Enum(JOB_STATES, case_sensitive=False, default="pending")
