#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import logging, logging.handlers

"""
Requires SPLUNK_HOME to be set as environment variable.
"""

class GSBLogger(object):

    def setup_logger(self):
	logger = logging.getLogger('GoogleSafeBrowsing')
	logger.setLevel(logging.DEBUG)

	file_handler = logging.handlers.RotatingFileHandler(os.environ['SPLUNK_HOME'] + '/var/log/splunk/google_safe_browsing.log' )
	formatter    = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
	file_handler.setFormatter(formatter)

	logger.addHandler(file_handler)

	return logger

    def write(self, severity, message):
	"""
	wrapper needed because Splunk SDK uses logger.log(<str>, <message>) and python uses
	logger.log(<int>, <message>).
	"""
	A = {
	"INFO"  : logging.INFO,
	"WARN"  : logging.WARN,
	"ERROR" : logging.ERROR,
	"DEBUG" : logging.DEBUG,
	}

	s = severity
	if self.PYTHON_LOGGER :
		try:
			s = A[severity]
		except:
			s = A["ERROR"]
	
	self.logger.log(s, message )


    def __init__(self, logger=None):
	"""
	if the logger==None then it's Splunk SDK logger (ew.log), otherwise its python's logger
	"""	
	self.logger        = logger
	self.PYTHON_LOGGER = False

	if logger == None :
		self.logger        = self.setup_logger()
		self.PYTHON_LOGGER = True


