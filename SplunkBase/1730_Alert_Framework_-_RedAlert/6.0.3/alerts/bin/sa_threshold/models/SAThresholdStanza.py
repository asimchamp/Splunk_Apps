#Copyright (C) 2005-2013 Splunk Inc. All Rights Reserved.
from splunk.models.base import SplunkAppObjModel
from splunk.models.field import Field, BoolField

'''
Provides object mapping for the different vmware stanzas
See sa_threshold.conf.spec for a list of stanza attributes that should be defined here
'''

class SAThresholdStanza(SplunkAppObjModel):

	resource = 'sa_alerts/sa_alerts_conf'

	disabled = BoolField()
	description = Field()
	command = Field()
	alid = Field()
	timeout = Field()
	iters = Field()
	entitytype = Field()
