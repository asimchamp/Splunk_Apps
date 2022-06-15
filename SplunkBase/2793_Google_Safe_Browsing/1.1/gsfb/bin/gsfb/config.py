#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import ConfigParser

class Config(object):

    # read description in function get_api_key_from_local_inputs_conf() to override it.
    API_KEY = None

    def get_api_key_from_local_inputs_conf(self):
	"""
	load the $APP_HOME/local/inputs.conf to get the API_KEY.
	If multiple keys are set, retun the first one.

	This can be overriden by setting the 'API_KEY' to an 
	actual key value.
	"""
	if self.API_KEY != None :
		return self.API_KEY

	try:
		f_local = os.path.join(os.environ['SPLUNK_HOME'], 'etc/apps/gsfb/local/inputs.conf')
		config = ConfigParser.ConfigParser()
		config.read(f_local)

		# parse all sections to get the api_key
		sections = config.sections()

		keys = []
		for se in sections:
			if config.has_option(se, 'api_key') :
				keys.append( config.get(se, 'api_key') )

		if len(keys) > 0 :
			return keys.pop(0)

	except Exception, e:
		raise e

	return None



