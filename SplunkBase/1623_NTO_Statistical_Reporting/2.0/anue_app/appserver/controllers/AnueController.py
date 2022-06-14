import logging, logging.handlers
import ConfigParser
import os
import sys
import cherrypy
import pprint
import splunk
import json
import ast
import httplib2
import socket
import base64
import types
import splunk.bundle as bundle
import splunk.appserver.mrsparkle.controllers as controllers
import splunk.appserver.mrsparkle.lib.util as util
from splunk.appserver.mrsparkle.lib.decorators import expose_page

#----------------------------------------------------------------------
CHASSIS_CONF_FILE_NAME = 'chassis.conf'
CHASSIS_CONF_TEMP_FILE_NAME = 'chassis.conf.temp'

CHASSIS_CONF_FILE = os.path.join(os.environ['SPLUNK_HOME'],'etc','apps','anue_app','default',CHASSIS_CONF_FILE_NAME)
LOG_FILE = os.path.join(os.environ['SPLUNK_HOME'],'var','log','splunk','AnueController.log')

#----------------------------------------------------------------------
FORM_PARAM_HOST = "host"
FORM_PARAM_WEB_API_PORT = "webapi_port"
FORM_PARAM_STATISTICS_PORT = "statistics_port"
FORM_PARAM_USERNAME = "username"
FORM_PARAM_PASSWORD = "password"
FORM_CHASSIS_ID = "ch_id"

FORM_SELECTED_TOOL_PORTS = "selectedToolPorts"
FORM_SELECTED_NETWORK_PORTS = "selectedNetworkPorts"
FORM_SELECTED_BIDIRECTIONAL_PORTS = "selectedBidirectionalPorts"
FORM_SELECTED_DYNAMIC_FILTERS = "selectedDynamicFilters"


CONFIG_KEY_USERNAME = "username"
CONFIG_KEY_PASSWORD = "password"
CONFIG_KEY_WEB_API_PORT = "webapi_port"
CONFIG_KEY_HOST = "host"
CONFIG_KEY_TOOL_PORTS = "tool_ports"
CONFIG_KEY_NETWORK_PORTS = "network_ports"
CONFIG_KEY_BIDIRECTIONAL_PORTS = "bidirectional_ports"
CONFIG_KEY_DYNAMIC_FILTERS = "dynamic_filters"


TOOL_PORTS_FLAG = "TOOL"
NETWORK_PORTS_FLAG = "NETWORK"
BIDIRECTIONAL_PORTS_FLAG = "BIDIRECTIONAL"

DEFINITION = "definition"

PROTOCOL = "https://"
PORTS_ENDPOINT_URL = "/api/ports/search"
DYNAMIC_FILTERS_ENDPOINT_URL = "/api/filters"

#----------------------------------------------------------------------
def initLogger():
    # Setup logging
    logger = logging.getLogger('AnueController')
    logger.propagate = False # Prevent the log messages from being duplicated in the python.log file
    logger.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    fileHandler = logging.handlers.RotatingFileHandler(LOG_FILE, maxBytes=25000000, backupCount=5)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    fileHandler.setFormatter(formatter)
    logger.addHandler(fileHandler)
    return logger

logger = initLogger()





#----------------------------------------------------------------------
'''Anue Controller'''
class AnueController(controllers.BaseController):

	#Presents the general chassis menu
    def showChassisMenu(self):
        logger.info("---> enter showChassisMenu()")
        logger.info("<--- exit showChassisMenu()")
        return self.render_template('/anue_app:/templates/chassisMenu.html',self.getAvailableChassisFromConfig())

    #Call to render the chassis menu
    @expose_page(must_login=True, methods=['GET']) 
    def controllersSetup(self, **kwargs):
        logger.info("---> enter controllersSetup()")
        logger.info("<--- exit controllersSetup()")
        return self.showChassisMenu()
		
	# Redirects to the add chassis menu
    @expose_page(must_login=True, methods=['POST']) 	
    def addChassis(self, **kwargs):
        logger.info("---> enter addChassis()")
        logger.info("<--- exit addChassis()")	
        return self.render_template('/anue_app:/templates/setChassis.html')

		
	#Receives chassis params and attempts to persist them
    @expose_page(must_login=True, trim_spaces=True, methods=['POST']) 
    def addChassisExecutor(self, **params):
        logger.info("---> enter addChassisExecutor()")
        try:
			# Extract params from form
            host = params[FORM_PARAM_HOST]
            username = params[FORM_PARAM_USERNAME]
            password = params[FORM_PARAM_PASSWORD]
            webApiPort = params[FORM_PARAM_WEB_API_PORT]
			
			# Validate Inputs
            v1,m1 = Validation.validateHost(host)
            if (not v1):
                return self.render_template('/anue_app:/templates/error.html',{'message':m1})
				
            v2,m2 = Validation.validateWebApiPort(webApiPort)
            if (not v2):
                return self.render_template('/anue_app:/templates/error.html',{'message':m2})
		
            if (not username):
                return self.render_template('/anue_app:/templates/error.html',{'message':'No username provided'})
	
            if (not password):
                return self.render_template('/anue_app:/templates/error.html',{'message':'No password provided'})
			
            result,errorMessage = self.addChassisToConfFile( host, username, password,webApiPort)
            if(not result):
                message = "Could not add chassis"
                if(errorMessage != None):
                    message = errorMessage
                raise Exception(message)
            
            return self.showChassisMenu()
			
        except Exception as e:
            logger.exception("Exception while trying to add a chassis")
            logger.info("<--- exit addChassisExecutor()")
            return self.render_template('/anue_app:/templates/error.html',{'message':str(e)})
		
	# Prepares for UI the available tool/network/bidirectional ports and dynamic filters.
	# The ones for which poll is enabled are checked.
    def fromJsonToOptionsLIst(self,enabledOptions, content):
        logger.info("---> enter fromJsonToOptionsLIst()")
        portList = list()
        try:
            logger.info("content: "+str(content))
            jdata = json.loads(content)
			
            for port in jdata:
                statPortId = str(port.get('id'))		
                statPortName = str(port.get('name'))
                tempDict={}
                tempDict['id'] = statPortId
                tempDict['name'] = statPortName
				
                if(statPortId in enabledOptions):
                    tempDict['state'] = "checked"
                else:
                    tempDict['state'] = " "
				
                portList.append(tempDict)
        except Exception as e:
            logger.exception("Could not process information about chassis tool ports")
			
        logger.info("<--- exit fromJsonToOptionsLIst()")     
        return portList
	
	# Writes chassis configuration parameters to chassis.conf
    def addChassisToConfFile(self, host, username, password,webApiPort="8000"):
        logger.info("---> enter addChassisToConfFile()")
        writeSuccesfull = True
        errorMessage = None
        try:
            encryptedPassword = base64.b64encode(password)
			
            parser = ConfigParser.SafeConfigParser()
			        
            parser.read(CHASSIS_CONF_FILE)
			
            section = str(host)
            if(parser.has_section(section)):
                errorMessage = "Attempt to add duplicate Chassis"
                raise Exception(errorMessage)
           
            parser.add_section(section)
            parser.set(section, FORM_PARAM_HOST, host)
            parser.set(section, FORM_PARAM_USERNAME, username)
            parser.set(section, FORM_PARAM_PASSWORD, encryptedPassword)	
            parser.set(section, FORM_PARAM_WEB_API_PORT, webApiPort)
			
            with open(CHASSIS_CONF_FILE, 'wb') as configfile:
                parser.write(configfile)
        except Exception as e:
            writeSuccesfull = False
            logger.exception("Exception adding chassis to chassis.conf")
		
        logger.info("<--- exit addChassisToConfFile()")
        return writeSuccesfull,errorMessage		
	
    # Deletes the indicated chassis from the chassis.conf	
    def deleteChassisFromConfFile(self,chassis):
        logger.info("---> enter deleteChassisFromConfFile()")
		
        writeSuccesfull = True
        try:
            parser = ConfigParser.SafeConfigParser()
			        
            parser.read(CHASSIS_CONF_FILE)
			
            if(parser.has_section(chassis)):
			    parser.remove_section(chassis)
				
            with open(CHASSIS_CONF_FILE, 'wb') as configfile:
                parser.write(configfile)
				
			# Atempt best effort to delete the associated log file	
            self.deleteLogFile(chassis)
        except Exception as e:
            writeSuccesfull = False
            logger.exception("Exception removing chassis from chassis.conf")
			
        logger.info("<--- exit deleteChassisFromConfFile()")
        return writeSuccesfull
		
	# When deleting a chassis from the conf file also attempt to delete it's generated log file	
    def deleteLogFile(self, chassis):
        logger.info("---> enter deleteLogFile()")
        log_file_name = "Anue-"+str(chassis)+".log"
        try:
            log_file = os.path.join(os.environ['SPLUNK_HOME'],'var','log','splunk',log_file_name)
            os.remove(str(log_file))
        except Exception as e:
            logger.exception("Exception removing chassis log file : "+log_file_name)
        logger.info("<--- exit deleteLogFile()")
	
	# Reads the chassis.conf file and returns a list of all existing chassis
    def getAvailableChassisFromConfig(self):
        logger.info("---> enter getAvailableChassisFromConfig()")
		
        chList = list()
        try:
            parser = ConfigParser.SafeConfigParser()
            parser.read(CHASSIS_CONF_FILE)
       
            for section_name in parser.sections():
                chList.append(section_name)
        except Exception as e:
            logger.exception("Exception while reading available chassis")
			
        chDict={'availableChassis':chList}		
	
        logger.info("<--- exit getAvailableChassisFromConfig()")
        return chDict

	#Receives a chassis name and reads settings with this device from chassis.conf file
    def getChassisConfig(self, chassis):
        logger.info("---> enter getChassisConfig()")
		
        try:
            parser = ConfigParser.SafeConfigParser()
            parser.read(CHASSIS_CONF_FILE)
		
            for section_name in parser.sections():
                if(section_name == chassis):
                    if parser.has_option(chassis, CONFIG_KEY_USERNAME):
                        username = parser.get(chassis, CONFIG_KEY_USERNAME)
                    if parser.has_option(chassis, CONFIG_KEY_PASSWORD):
                        password = parser.get(chassis, CONFIG_KEY_PASSWORD)
                    if parser.has_option(chassis, CONFIG_KEY_WEB_API_PORT):
                        webApiPort = parser.get(chassis, CONFIG_KEY_WEB_API_PORT)
                    return Utility.sectionToDictionary(chassis,username,password,webApiPort)
		
        except Exception as e: 
            logger.exception("Exception when reading configuration for device : "+str(chassis))		
	
        logger.info("<--- exit getChassisConfig()")
        return None
		
	#Writes an option for a chassis. Used to write/edit tool/network/bidirectional/dynamic filters
    def writeChassisOption(self, chassis, option, value):
        logger.info("---> enter writeChassisOption()")
		
        succes = False
        try:
            parser = ConfigParser.SafeConfigParser()
            parser.read(CHASSIS_CONF_FILE)

            for section_name in parser.sections():
                if(section_name == chassis):
                    parser.set(chassis, option, value)
                    with open(CHASSIS_CONF_FILE, 'wb') as configfile:
                        parser.write(configfile)
						
                    succes = True
			
        except Exception as e:
            logger.exception("Exception when writing option : " + str(option) + " for device : "+str(chassis))		
		
        logger.info("<--- exit writeChassisOption()")
        return succes
	
	
    # Reads and returns the indicated options for the indicated chassis
    def readChassisOption(self,chassis,option):
        logger.info("---> enter readChassisOption()")
		
        toRet = set()
		
        try:
            parser = ConfigParser.SafeConfigParser()
            parser.read(CHASSIS_CONF_FILE)
			
            for section_name in parser.sections():
                if(section_name == chassis):
                    if parser.has_option(chassis, option):
                        optionString = parser.get(chassis,option)
                        jdata = json.loads(optionString)
                        for p in jdata:
                            id = p.get('id')
                            if(id != None):
                                toRet.add(id)
        except Exception as e:
            logger.exception(" Exception while reading chassis configuration")
		
        logger.info("<--- exit readChassisOption()")
        return toRet
		
	# Dictionaries coming from UI forms have an extra unnecessary key. Here it is removed.	
    def handleFormUnicodeItem(self, item, listWhereToAdd):
        logger.info("---> enter handleFormUnicodeItem()")
        try:
            pDict = ast.literal_eval(item)
            if ('state' in pDict):
                del pDict['state']

            listWhereToAdd.append(pDict)
        except Exception as e:
            logger.exception("Exception : "+str(e))
		
        logger.info("<--- exit handleFormUnicodeItem()")
	
    # Controller hook to initiate a chassis deletition. Called from UI.	
    @expose_page(must_login=True, trim_spaces=True, methods=['POST'])	
    def deleteChassis(self, **kwargs):
        logger.info("---> enter deleteChassis()")
        logger.info(str(kwargs))
        try:
            chId =kwargs[FORM_CHASSIS_ID]
            if(not chId):
                logger.info("<--- exit deleteChassis()")
                return self.render_template('/anue_app:/templates/error.html',{'message':'Could not extract valid chassis'})
		
            res = self.deleteChassisFromConfFile(chId)

            logger.info("<--- exit deleteChassis()")
            if(res):
			    return self.showChassisMenu()
            else:
                return self.render_template('/anue_app:/templates/error.html',{'message':'Could not remove chassis : '+str(chId)})
		
        except Exception as e:
            logger.exception("Exception : "+str(e))
            logger.info("<--- exit deleteChassis()")
            return self.render_template('/anue_app:/templates/error.html',{'message':str(e)})
		
        logger.info("<--- exit deleteChassis()")
		
	# Presents in UI the available dynamic filters existing on a particular chassis.	
    @expose_page(must_login=True, trim_spaces=True, methods=['POST'])
    def getDynamicFilters(self, **kwargs):
        logger.info("---> enter getDynamicFilters()")		
        try:
            logger.info(str(kwargs))
		
            chId =kwargs[FORM_CHASSIS_ID]
            if(not chId):
                logger.info("<--- exit getDynamicFilters()")
                return self.render_template('/anue_app:/templates/error.html',{'message':'Could not extract valid chassis'})
			
            chDict = self.getChassisConfig(chId)
            if(chDict == None):
                logger.info("<--- exit getDynamicFilters()")
                return self.render_template('/anue_app:/templates/error.html',{'message':'Could not extract chassis settings'})
			
            host = chDict[CONFIG_KEY_HOST]
            username = chDict[CONFIG_KEY_USERNAME]
            password = base64.b64decode(chDict[CONFIG_KEY_PASSWORD])
            webApiPort = chDict[CONFIG_KEY_WEB_API_PORT]
		
            #JSON response containing dynamic filters on  the chassis
            respStatus, content = NetworkOperations.getChassisDynamicFilters(host, username ,password ,webApiPort)
            if(respStatus != 200):
                return self.render_template('/anue_app:/templates/error.html', Utility.getQueryPortsErrorMessage(respStatus))
			
            # Get already enable dynamic filters
            enabledDynamicFilters = self.readChassisOption(chId,CONFIG_KEY_DYNAMIC_FILTERS)
			
            #Make a list of dynamic filters
            portList = self.fromJsonToOptionsLIst(enabledDynamicFilters, content)
			
		    #Pass through a dictionary params.
            d = Utility.toDictionary(portList,host)
            logger.info("<--- exit getDynamicFilters()")
            return self.render_template('/anue_app:/templates/setDynamicFilters.html',d)		
        except Exception as e:
            logger.exception("Exception : "+str(e))
            logger.info("<--- exit getDynamicFilters()")
            return self.render_template('/anue_app:/templates/error.html',{'message':str(e)})
		
	

	# Reads the user selected dynamic filters and attempts to write them to the chassis.conf file
    @expose_page(must_login=True, trim_spaces=True, methods=['POST'])
    def setDynamicFilters(self, **kwargs):
        logger.info("---> enter setDynamicFilters()")
		
        try:
            dynamicFiltersList = list()
            
            host = kwargs.get(FORM_PARAM_HOST)
            selectedDynamicFilters = kwargs.get(FORM_SELECTED_DYNAMIC_FILTERS)
			
            isList = isinstance(selectedDynamicFilters, list)
			
            if(selectedDynamicFilters != None):
			    #several dynamic filters selected
                if(isList):            
                    for item in selectedDynamicFilters:
                        self.handleFormUnicodeItem(item,dynamicFiltersList)
                else:
				# a single dynamic filter was selected  
                    self.handleFormUnicodeItem(selectedDynamicFilters,dynamicFiltersList)
				
            df = json.dumps(dynamicFiltersList)
			
            correctlyWritten = self.writeChassisOption(host,CONFIG_KEY_DYNAMIC_FILTERS,df)
			
            logger.info("<--- exit setDynamicFilters()")
            if(correctlyWritten):
			    return self.showChassisMenu()
            else:
                return self.render_template('/anue_app:/templates/error.html',{'message':'Could not write to config Dynamic Filters for chassis : '+str(host)})			
		
        except Exception as e:
            logger.exception("Exception : "+str(e))
            logger.info("<--- exit setDynamicFilters()")
            return self.render_template('/anue_app:/templates/error.html',{'message':str(e)})
		
	
	# Presents in UI the available bidirectional ports existing on a particular chassis.
    @expose_page(must_login=True, trim_spaces=True, methods=['POST'])	
    def getBidirectionalPorts(self, **kwargs):
        logger.info("---> enter getBidirectionalPorts()")
        try:
            logger.info(str(kwargs))
		
            chId =kwargs[FORM_CHASSIS_ID]
            if(not chId):
                logger.info("<--- exit getBidirectionalPorts()")
                return self.render_template('/anue_app:/templates/error.html',{'message':'Could not extract valid chassis'})
			
            chDict = self.getChassisConfig(chId)
            if(chDict == None):
                logger.info("<--- exit getBidirectionalPorts()")
                return self.render_template('/anue_app:/templates/error.html',{'message':'Could not extract chassis settings'})
			
            host = chDict[CONFIG_KEY_HOST]
            username = chDict[CONFIG_KEY_USERNAME]
            password = base64.b64decode(chDict[CONFIG_KEY_PASSWORD])
            webApiPort = chDict[CONFIG_KEY_WEB_API_PORT]
		
            #JSON response containing network ports on  the chassis
            respStatus, content = NetworkOperations.getChassisPorts(host, username ,password ,BIDIRECTIONAL_PORTS_FLAG ,webApiPort)
            if(respStatus != 200):
                return self.render_template('/anue_app:/templates/error.html', Utility.getQueryPortsErrorMessage(respStatus))
			
            # Get already enable tool ports
            enabledBidirectionalPorts = self.readChassisOption(chId,CONFIG_KEY_BIDIRECTIONAL_PORTS)
			
            #Make a list of ports
            portList = self.fromJsonToOptionsLIst(enabledBidirectionalPorts, content)
			
		    #Pass through a dictionary params.
            d = Utility.toDictionary(portList,host)
            logger.info("<--- exit getBidirectionalPorts()")
            return self.render_template('/anue_app:/templates/setBidirectionalPorts.html',d)		
        except Exception as e:
            logger.exception("Exception : "+str(e))
            logger.info("<--- exit getBidirectionalPorts()")
            return self.render_template('/anue_app:/templates/error.html',{'message':str(e)})
			
	
	# Reads the user selected bidirectional ports and attempts to write them to the chassis.conf file
    @expose_page(must_login=True, trim_spaces=True, methods=['POST'])
    def setBidirectionalPorts(self, **kwargs):
        logger.info("---> enter setBidirectionalPorts()")
        try:
            bidirectionalPortList = list()
            
            host = kwargs.get(FORM_PARAM_HOST)
            selectedBidirectionalPorts = kwargs.get(FORM_SELECTED_BIDIRECTIONAL_PORTS)
			
            isList = isinstance(selectedBidirectionalPorts, list)
			
            if(selectedBidirectionalPorts != None):
			    #several tool ports selected
                if(isList):            
                    for item in selectedBidirectionalPorts:
						self.handleFormUnicodeItem(item,bidirectionalPortList)
                else:
				# a single port was selected
                   self.handleFormUnicodeItem(selectedBidirectionalPorts,bidirectionalPortList)
				
            logger.info(str(bidirectionalPortList))
			
            bp = json.dumps(bidirectionalPortList)
			
            correctlyWritten = self.writeChassisOption(host,CONFIG_KEY_BIDIRECTIONAL_PORTS,bp)
			
            logger.info("<--- exit setBidirectionalPorts()")
            if(correctlyWritten):
			    return self.showChassisMenu()
            else:
                return self.render_template('/anue_app:/templates/error.html',{'message':'Could not write to config Tool Ports for chassis : '+str(host)})			
		
        except Exception as e:
            logger.exception("Exception : "+str(e))
            logger.info("<--- exit setBidirectionalPorts()")
            return self.render_template('/anue_app:/templates/error.html',{'message':str(e)})
	
	# Presents in UI the available network ports existing on a particular chassis.
    @expose_page(must_login=True, trim_spaces=True, methods=['POST'])
    def getNetworkPorts(self, **kwargs):
        logger.info("---> enter getNetworkPorts()")
        try:
            logger.info(str(kwargs))
		
            chId =kwargs[FORM_CHASSIS_ID]
            if(not chId):
                logger.info("<--- exit getNetworkPorts()")
                return self.render_template('/anue_app:/templates/error.html',{'message':'Could not extract valid chassis'})
			
            chDict = self.getChassisConfig(chId)
            if(chDict == None):
                logger.info("<--- exit getNetworkPorts()")
                return self.render_template('/anue_app:/templates/error.html',{'message':'Could not extract chassis settings'})
			
            host = chDict[CONFIG_KEY_HOST]
            username = chDict[CONFIG_KEY_USERNAME]
            password = base64.b64decode(chDict[CONFIG_KEY_PASSWORD])
            webApiPort = chDict[CONFIG_KEY_WEB_API_PORT]
		
            #JSON response containing network ports on  the chassis
            respStatus, content = NetworkOperations.getChassisPorts(host, username ,password ,NETWORK_PORTS_FLAG ,webApiPort)
            if(respStatus != 200):
                return self.render_template('/anue_app:/templates/error.html', Utility.getQueryPortsErrorMessage(respStatus))
			
            # Get already enable tool ports
            enabledNetworkPorts = self.readChassisOption(chId,CONFIG_KEY_NETWORK_PORTS)
			
            #Make a list of ports
            portList = self.fromJsonToOptionsLIst(enabledNetworkPorts, content)
			
		    #Pass through a dictionary params.
            d = Utility.toDictionary(portList,host)
            logger.info("<--- exit getNetworkPorts()")
            return self.render_template('/anue_app:/templates/setNetworkPorts.html',d)		
        except Exception as e:
            logger.exception("Exception : "+str(e))
            logger.info("<--- exit getNetworkPorts()")
            return self.render_template('/anue_app:/templates/error.html',{'message':str(e)})
			
			
	# Reads the user selected network ports and attempts to write them to the chassis.conf file		
    @expose_page(must_login=True, trim_spaces=True, methods=['POST'])
    def setNetworkPorts(self, **kwargs):
        logger.info("---> enter setNetworkPorts()")
        try:
            networkPortList = list()
            
            host = kwargs.get(FORM_PARAM_HOST)
            selectedNetworkPorts = kwargs.get(FORM_SELECTED_NETWORK_PORTS)
			
            isList = isinstance(selectedNetworkPorts, list)
			
            if(selectedNetworkPorts != None):
			    #several tool ports selected
                if(isList):            
                    for item in selectedNetworkPorts:
                        self.handleFormUnicodeItem(item,networkPortList)
                else:
				# a single port was selected
                    self.handleFormUnicodeItem(selectedNetworkPorts,networkPortList)
				
            logger.info(str(networkPortList))
			
            tp = json.dumps(networkPortList)
			
            correctlyWritten = self.writeChassisOption(host,CONFIG_KEY_NETWORK_PORTS,tp)
			
            logger.info("<--- exit setNetworkPorts()")
            if(correctlyWritten):
			    return self.showChassisMenu()
            else:
                return self.render_template('/anue_app:/templates/error.html',{'message':'Could not write to config Tool Ports for chassis : '+str(host)})			
		
        except Exception as e:
            logger.exception("Exception : "+str(e))
            logger.info("<--- exit setNetworkPorts()")
            return self.render_template('/anue_app:/templates/error.html',{'message':str(e)})
			
        
	# Presents in UI the available tool ports existing on a particular chassis.
    @expose_page(must_login=True, trim_spaces=True, methods=['POST'])
    def getToolPorts(self, **kwargs):
        logger.info("---> enter getToolPorts()")	
        
        try:
            logger.info(str(kwargs))
		
            chId =kwargs[FORM_CHASSIS_ID]
            if(not chId):
                logger.info("<--- exit getToolPorts()")
                return self.render_template('/anue_app:/templates/error.html',{'message':'Could not extract valid chassis'})
			
		
            chDict = self.getChassisConfig(chId)
            if(chDict == None):
                logger.info("<--- exit getToolPorts()")
                return self.render_template('/anue_app:/templates/error.html',{'message':'Could not extract chassis settings'})
		
            
            host = chDict[CONFIG_KEY_HOST]
            username = chDict[CONFIG_KEY_USERNAME]
            password = base64.b64decode(chDict[CONFIG_KEY_PASSWORD])
            webApiPort = chDict[CONFIG_KEY_WEB_API_PORT]
			
			#JSON response containing tool ports on  the chassis
            respStatus, content = NetworkOperations.getChassisPorts(host ,username ,password ,TOOL_PORTS_FLAG ,webApiPort)
            if(respStatus != 200):
                return self.render_template('/anue_app:/templates/error.html', Utility.getQueryPortsErrorMessage(respStatus))
			
			# Get already enable tool ports
            enabledToolPorts = self.readChassisOption(chId,CONFIG_KEY_TOOL_PORTS)
            logger.info("obtained set already tool ports : "+str(enabledToolPorts))
			
            #Make a list of ports
            portList = self.fromJsonToOptionsLIst(enabledToolPorts, content)
			
		    #Pass through a dictionary params.
            d = Utility.toDictionary(portList, host)
            logger.info("<--- exit getToolPorts()")
            return self.render_template('/anue_app:/templates/setToolPorts.html',d)
        except Exception as e:
            logger.exception("Exception : "+str(e))
            logger.info("<--- exit getToolPorts()")
            return self.render_template('/anue_app:/templates/error.html',{'message':str(e)})
			
			
	# Reads the user selected tool ports and attempts to write them to the chassis.conf file		
    @expose_page(must_login=True, trim_spaces=True, methods=['POST'])
    def setToolPorts(self, **kwargs):
        logger.info("---> enter setToolPorts()")
        try:
            toolPortList = list()
            
            host = kwargs.get(FORM_PARAM_HOST)
            selectedToolPorts = kwargs.get(FORM_SELECTED_TOOL_PORTS)
			
            isList = isinstance(selectedToolPorts, list)
			
            if(selectedToolPorts != None):
			    #several tool ports selected
                if(isList):            
                    for item in selectedToolPorts:
                        self.handleFormUnicodeItem(item,toolPortList)
                else:
				# a single port was selected
                    self.handleFormUnicodeItem(selectedToolPorts,toolPortList)
				
            logger.info(str(toolPortList))
			
            tp = json.dumps(toolPortList)
			
            correctlyWritten = self.writeChassisOption(host,CONFIG_KEY_TOOL_PORTS,tp)
			
            if(correctlyWritten):
			    return self.showChassisMenu()
            else:
                return self.render_template('/anue_app:/templates/error.html',{'message':'Could not write to config Tool Ports for chassis : '+str(host)})			
		
        except Exception as e:
            logger.exception("Exception : "+str(e))
            logger.info("<--- exit setToolPorts()")
            return self.render_template('/anue_app:/templates/error.html',{'message':str(e)})
		
	
      
		
#----------------------------------------------------------------------
'''Utility class'''
class Utility():
    @staticmethod
    def sectionToDictionary(host, username, password,webApiPort):
	    dictionary = {
                      CONFIG_KEY_HOST:host,
		              CONFIG_KEY_USERNAME:username,
					  CONFIG_KEY_PASSWORD:password,
					  CONFIG_KEY_WEB_API_PORT:webApiPort
					  }
	    return dictionary
		
    @staticmethod	
    def getQueryPortsErrorMessage(status):
        logger.info("---> enter getQueryPortsErrorMessage()")
            
        message = None
        if status == 202:
		    message="The request has been accepted for processing, but the processing has not been completed"
        elif status == 400:
            message = "User input is invalid or requested API version is unsupported"
        elif status == 401:
            message = "Authentication error"
        elif status == 403:
            message = "Not authorized to perform the operation"
        elif status == 404:
            message =="The entity referred by the URL does not exist"
        elif status == 500:
            message = "NTO stack raised an error while trying to perform the requested operation"
        else:
            message = "Generic error "+str(status)
			
        dict = {'message':message}
        logger.info("<--- exit getQueryPortsErrorMessage()")	
        return dict	
		
    @staticmethod	
    def toDictionary(portList,host):
        logger.info("---> enter toDictionary()")
        
        makoDict = {}
		
        if(portList == None):
		    portList = list()
			
        makoDict['chassisEntitiesList'] = portList
        makoDict['host'] = host
		
        logger.info("<--- exit toDictionary()")	
        return makoDict
		
		
#----------------------------------------------------------------------

'''Validation class'''
class Validation():
    @staticmethod
    def validateWebApiPort(port):
        logger.info("---> enter validateWebApiPort()")
        logger.info("  web api port to validate : "+port)
		
        valid = True
        message = "OK"
		
        if (not port ):
            valid = False
            message = "No Web Api Port provided"
        else:
            try:
                val = int(port)
                if (val > 65535):
                    raise ValueError("value not allowed")
            except ValueError:
                logger.info("we have an exception for port value")
                valid = False
                message = str(port) +" is an invalid port number"
		
        logger.info("<--- exit validateWebApiPort()")
        return (valid,message)
		
    @staticmethod
    def validateHost(address):
        logger.info("---> enter validateHost()")
        logger.info("  host ip address to validate : "+address)
        
        valid = True
        message = "OK"
		
        if (not address ):
            valid = False
            message = "No host address provided"
        else:
            try:
                socket.inet_aton(address)
            except Exception as e:
                valid = False
                message = address + " is an invalid ip address"
			
        logger.info("<--- exit validateHost()")
        return (valid,message)

		
#----------------------------------------------------------------------
'''NetworkOperations class '''  
class NetworkOperations():
    @staticmethod
    def getChassisPorts(host, username, password, mode, webApiPort="8000"):
        logger.info("--> enter getChassisPorts()")
		
        url=PROTOCOL + host + ":" + webApiPort + PORTS_ENDPOINT_URL
        logger.info("  getting chassis ports from url : "+url)
		
        http = httplib2.Http(disable_ssl_certificate_validation=True)
        http.add_credentials(username, password)
        resp, content = http.request(url,
            method='POST',
            headers={'Content-Type': 'application/json', 'charset':'UTF-8','Connection':'close','Host':host}, 
			body=NetworkOperations.getRequestBody(mode))
	
        logger.info("  Ports retrieval operation response")
        logger.info(pprint.pformat(resp))
        logger.info(pprint.pformat(content))
		
        logger.info("<-- exit getChassisPorts()")
        return (resp.status, content)
		
    @staticmethod
    def getRequestBody(flag):
        logger.info("---> enter getParamForToolPorts()")
        dict={'mode':flag}
        logger.info("<--- exit getParamForToolPorts()")   
        return str(json.dumps(dict))
		
    @staticmethod
    def getChassisDynamicFilters(host, username, password, webApiPort="8000"):
        logger.info("--> enter getChassisDynamicFilters()")
		
        url=PROTOCOL + host + ":" + webApiPort + DYNAMIC_FILTERS_ENDPOINT_URL
        logger.info("  getting chassis dynamic filters from url : "+url)
		
        http = httplib2.Http(disable_ssl_certificate_validation=True)
        http.add_credentials(username, password)
        resp, content = http.request(url,
            method='GET',
            headers={'Content-Type': 'application/json', 'charset':'UTF-8','Connection':'close','Host':host})
	
        logger.info("  Dynamic Filters retrieval operation response")
        logger.info(pprint.pformat(resp))
        logger.info(pprint.pformat(content))
		
        logger.info("<-- exit getChassisDynamicFilters()")
        return (resp.status, content)


