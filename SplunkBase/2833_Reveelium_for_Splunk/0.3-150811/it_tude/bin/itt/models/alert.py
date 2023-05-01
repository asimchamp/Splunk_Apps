#!/usr/bin/python
# -*- coding: utf-8 -*-
# Author: Julien Chakra-Breil <j.chakrabreil@itrust.fr>
# Copyrights (c) 2015 by ITrust

"""Alert related models
"""

from ..model import *
from ..storage.store import storable_model


@storable_model("alerts")
class Alert(Resource):
    #_id = String()           inherited from Resource
    #created_at = Datetime()  inherited from Resource
    #updated_at = Datetime()  inherited from Resource
    occurred_at = Datetime()
    family = String()
    score = Integer()
    description = Dictionnary()
    userfeedback = Dictionnary()
    references = List()


@storable_model("families")
class Family(Resource):
    #_id = String()           inherited from Resource
    #created_at = Datetime()  inherited from Resource
    #updated_at = Datetime()  inherited from Resource
    score = Integer()
    name = String()
    description = Dictionnary()
    userfeedback = Dictionnary()


class Sample(Model):
    #_id = String()           inherited from Model
    family_id = String()
    family_name = String()
    date = Datetime()
    segments = List()


#class Segment(Model):
#    #_id = String()           inherited from Model
#    date = Datetime()
#    duration = Integer()
#    alert_count = Integer()
