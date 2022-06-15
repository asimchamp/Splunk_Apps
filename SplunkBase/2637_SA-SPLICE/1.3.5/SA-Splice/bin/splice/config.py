#!/usr/bin/env python

import os
import re
import time
import sys
import ConfigParser

class Config:

    def _load_conf_file(self, filename):
	"""
	Populate config using the provided filename (ex: local/splice.conf, default/splice.conf).
	retun config = {'splice': {'mongo_connection_uri': 'mongodb://localhost:27017/splice'} }
	"""
	Cfg = ConfigParser.ConfigParser()

	r = Cfg.read( filename )
	if len(r) == 0 :
		return {}

	config = {}
	for section in Cfg.sections():
		config[ section ] = {}

		for option in Cfg.options(section):
			try:
				config[ section ][ option ] = Cfg.get(section, option)
			except:
				config[ section ][ option ] = None
	return config

    def get_option_value(self, key):
	"""
	First check in the local options (user defined) and if not found try the defaults ones.
	Return None if not found at all.
	"""

	if key in self.config_local['splice']  :
		return self.config_local['splice'][ key ]
	if key in self.config_default['splice'] :
		return self.config_default['splice'][ key ]

	return None

    def __init__(self):
	# $SPLUNK_HOME
	try:
		self.splunk_home = os.environ['SPLUNK_HOME']
		self.splice_home = os.path.normpath(os.path.join(self.splunk_home , 'etc/apps/SA-Splice'))
	except Exception, e:
		raise ValueError(' SPLUNK_HOME is not defined: %s' % e)

	# $APP_HOME
	if not os.path.isdir(self.splice_home) :
		raise ValueError(' SPLICE home directory is not %s ?!' % self.splice_home)

	# $APP_HOME/local
	self.splice_local = os.path.normpath(os.path.join(self.splice_home, 'local'))
	if not os.path.isdir(self.splice_local) :
		try:
			os.makedirs(self.splice_local)
		except Except, e:
			raise ValueError(' Failed to create directory %s with error: %s' % (self.splice_local, e))
	
	# config files locations
	self.splice_conf_local   = os.path.normpath(os.path.join(self.splice_home , 'local/splice.conf'))
	self.splice_conf_default = os.path.normpath(os.path.join(self.splice_home , 'default/splice.conf'))

	# load the config. Splunk will only write config that differ from the defaults one so we need
	# to load both default/ and local/ options.
	self.config_local = self._load_conf_file(self.splice_conf_local)
	self.config_default = self._load_conf_file(self.splice_conf_default)

	# we create the 'splice' stanza if it doesn't exist to avoid extra check later.
	if not 'splice' in self.config_local:
		self.config_local['splice'] = {}

	if not 'splice' in self.config_default:
		self.config_default['splice'] = {}


    def get_mongo_connection_uri(self):
	"""
	Multiple mongodb connection uri is not a supported use case.
	"""
	uri = self.get_option_value('mongo_connection_uri')
	if uri == None :
		raise ValueError(' no mongo_connection_uri defined, please run the setup screen')
	return uri


