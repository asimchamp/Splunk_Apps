import controllers.module as module
import splunk, splunk.search, splunk.util, splunk.entity
import lib.util as util
import lib.i18n as i18n
import logging, logging.handlers
import os
import ConfigParser
import json
import ast
import math
import cgi

#----------------------------------------------------------------------

CHASSIS_CONF_FILE_NAME = 'chassis.conf'
CHASSIS_CONF_FILE = os.path.join(os.environ['SPLUNK_HOME'],'etc','apps','anue_app','default',CHASSIS_CONF_FILE_NAME)

CONFIG_KEY_TOOL_PORTS = "tool_ports"
CONFIG_KEY_NETWORK_PORTS = "network_ports"
CONFIG_KEY_BIDIRECTIONAL_PORTS = "bidirectional_ports"
CONFIG_KEY_DYNAMIC_FILTERS = "dynamic_filters"

TARGET_TOOL_PORTS = "TOOL"
TARGET_NETWORK_PORTS = "NETWORK"
TARGET_DYNAMIC_FILTERS = "DYNAMIC_FILTERS"

LOG_FILE = os.path.join(os.environ['SPLUNK_HOME'],'var','log','splunk','AnueIdSelector.log')

CHASSIS_PARAM = 'chassis'
TARGET_PARAM = 'statisticsTarget'
KEY_DICT_IDS = 'ports'
KEY_DICT_OBJ = 'obj'


#----------------------------------------------------------------------
def initLogger():
    # Setup logging
    logger = logging.getLogger('AnueIdSelector')
    logger.propagate = False # Prevent the log messages from being duplicated in the python.log file
    logger.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    fileHandler = logging.handlers.RotatingFileHandler(LOG_FILE, maxBytes=25000000, backupCount=5)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    fileHandler.setFormatter(formatter)
    logger.addHandler(fileHandler)
    return logger

logger = initLogger()

class IdSelector(module.ModuleHandler):

	def generateResults(self, host_app, client_app, **kargs):
		logger.info("---> enter generateResults()")
		
		chassis = kargs.get(CHASSIS_PARAM)
		mode = kargs.get(TARGET_PARAM)
		
		idList = list()
		obj = None
		if(str(mode) == TARGET_TOOL_PORTS):		
			idList = self.readChassisSetting(chassis,CONFIG_KEY_TOOL_PORTS) + self.readChassisSetting(chassis,CONFIG_KEY_BIDIRECTIONAL_PORTS)
			obj = "Tool Ports :"
		if(str(mode) == TARGET_NETWORK_PORTS):		
			idList = self.readChassisSetting(chassis,CONFIG_KEY_NETWORK_PORTS) + self.readChassisSetting(chassis,CONFIG_KEY_BIDIRECTIONAL_PORTS)
			obj = "Network Ports :"
		if(str(mode) == TARGET_DYNAMIC_FILTERS):
			idList = self.readChassisSetting(chassis,CONFIG_KEY_DYNAMIC_FILTERS)
			obj = "Dynamic Filters :"
		
		toMakoDict = {KEY_DICT_IDS : idList , KEY_DICT_OBJ : obj}
		
		logger.info("<--- exit getAvailableChassisFromConfig()")
		return self.controller.render_template('IdSelector/IdSelector.html', toMakoDict)
		
		
		
	def readChassisSetting(self, chassis, setting):
		optionsList = list()
		try:
			parser = ConfigParser.SafeConfigParser()
			parser.read(CHASSIS_CONF_FILE)
		
			for section_name in parser.sections():
				if(section_name == chassis):
					if parser.has_option(section_name, setting):
						optionsString = parser.get(section_name,setting)
						self.parsePollSetting(optionsString, optionsList)
		except  Exception as e:
			logger.exception(str(e))
		return optionsList
		
	
	def parsePollSetting(self,setting, addToList):
		jdata = json.loads(setting)
		for port in jdata:
			addToList.append(port)

		
		
		