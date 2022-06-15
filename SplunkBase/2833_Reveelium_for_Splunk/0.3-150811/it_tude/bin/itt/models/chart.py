#!/usr/bin/python
# -*- coding: utf-8 -*-
# Author: Julien Chakra-Breil <j.chakrabreil@itrust.fr>
# Copyrights (c) 2015 by ITrust

"""Chart related models
"""

from ..model import *


class Chart(Resource):
    name = String()
    type = String()
    filters = List()
    data = List()
