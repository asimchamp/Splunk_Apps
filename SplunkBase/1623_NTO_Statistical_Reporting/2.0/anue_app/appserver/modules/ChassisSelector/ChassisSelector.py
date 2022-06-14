import controllers.module as module
import splunk, splunk.search, splunk.util, splunk.entity
import lib.util as util
import lib.i18n as i18n
import logging, logging.handlers
import os
import cherrypy
import json
import time
import math
import cgi
import ConfigParser

#----------------------------------------------------------------------
CHASSIS_CONF_FILE_NAME = 'chassis.conf'
CHASSIS_CONF_FILE = os.path.join(os.environ['SPLUNK_HOME'],'etc','apps','anue_app','default',CHASSIS_CONF_FILE_NAME)
LOG_FILE = os.path.join(os.environ['SPLUNK_HOME'],'var','log','splunk','AnueChassisSelector.log')
KEY_DICT_CHASSIS = 'availableChassis'

#----------------------------------------------------------------------
# Setup logging
def initLogger():
    logger = logging.getLogger('AnueChassisSelector')
    logger.propagate = False # Prevent the log messages from being duplicated in the python.log file
    logger.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    fileHandler = logging.handlers.RotatingFileHandler(LOG_FILE, maxBytes=25000000, backupCount=5)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    fileHandler.setFormatter(formatter)
    logger.addHandler(fileHandler)
    return logger

logger = initLogger()


class ChassisSelector(module.ModuleHandler):    
	
	def generateResults(self, host_app, client_app, savedSearchName=None):
		chDict = self.getAvailableChassisFromConfig()
		return self.controller.render_template('ChassisSelector/ChassisSelector.html', chDict)
		
		
		
	def getAvailableChassisFromConfig(self):
		logger.info("---> enter getAvailableChassisFromConfig()")

		chDict = dict()
		chList = list()
		try:
			parser = ConfigParser.SafeConfigParser()
			parser.read(CHASSIS_CONF_FILE)
			
			for section_name in parser.sections():
				chList.append(section_name)

		except Exception as e:
			self.logger.exception("Exception while reading available chassis")

		logger.info("<--- exit getAvailableChassisFromConfig()")
		chDict={KEY_DICT_CHASSIS:chList}		
		return chDict
		

		
		
		
		
		