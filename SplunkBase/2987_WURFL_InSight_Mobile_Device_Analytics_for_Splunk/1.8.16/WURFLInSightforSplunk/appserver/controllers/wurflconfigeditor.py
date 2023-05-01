import logging
import os
import sys
import json
import cherrypy
import ConfigParser # read transforms.conf
import platform

import splunk.appserver.mrsparkle.controllers as controllers
import splunk.appserver.mrsparkle.lib.util as util
from splunk.appserver.mrsparkle.lib.util import make_splunkhome_path
from splunk.appserver.mrsparkle.lib.decorators import expose_page

bin_dir = os.path.join(util.get_apps_dir(), __file__.split('.')[-2], 'bin')

if not bin_dir in sys.path:
    sys.path.append(dir)


def setup_logger(level):
    """
    Setup a logger for the REST handler.
    """

    logger = logging.getLogger('splunk.appserver.WURFLInSightforSplunk.controllers.wurflconfigeditor')
    logger.propagate = False # Prevent the log messages from being duplicated in the python.log file
    logger.setLevel(level)

    file_handler = logging.handlers.RotatingFileHandler(make_splunkhome_path(['var', 'log', 'splunk', 'wurflconfigeditorcontroller.log']), maxBytes=25000000, backupCount=5)

    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    return logger

logger = setup_logger(logging.INFO)
"""
Represents an exception when the properties not found in the config.properties.
"""
class SupportingFieldsNotFoundException(Exception):
    pass
"""
Represents an exception when the config.properties is not updated.
"""
class ConfigUpdationFailedException(Exception):
    pass


class ConfigDisplay:

    #Class for sending response in object format
    #Constructor for ConfigDisplay class to intialize fields    
    def __init__(self, wurfldpath, wurfldclipath, wurfldconfigfilepath, serverip, serverport):
       self.wurfldpath = wurfldpath
       self.wurfldclipath = wurfldclipath
       self.wurfldconfigfilepath = wurfldconfigfilepath
       self.serverip = serverip
       self.serverport = serverport
    
class ConfigEditor(controllers.BaseController):
    @expose_page(must_login=True, methods=['POST']) 
    def save(self, namespace, serverip, serverport, wurfldpath, wurfldclipath, wurfldconfigfilepath, serveripold,  serverportold, wurfldpathold, wurfldclipathold, wurfldconfigfilepathold):
        """
        Saves the configurations to the config.properies file 
        """
        logger.info("Saving config.properies with new Configurations...")
        # displaying the parameters received to logger
        logger.info("namespace: %s \n serverip: %s \n serverport: %s", namespace, serverip, serverport)
        # displaying the parameters received to logger
        logger.info("wurfldpath: %s \n wurfldclipath: %s \n wurfldconfigfilepath: %s\n ", wurfldpath, wurfldclipath, wurfldconfigfilepath)
        # Retrieving the Os of the machine
        os_section = ""
        osname = platform.system()
        if "Windows" == osname :
            os_section = "windows"
        elif "Linux" == osname :
            os_section = "linux"
        elif "Darwin" == osname:
            os_section = "mac"
        # for windows os modifying the path seperator
        if os_section == "windows" :
           wurfldpath = wurfldpath.replace("\\","/")
           wurfldclipath = wurfldclipath.replace("\\","/")
           wurfldconfigfilepath = wurfldconfigfilepath.replace("\\","/")
           wurfldpathold = wurfldpathold.replace("\\","/")
           wurfldclipathold = wurfldclipathold.replace("\\","/")
           wurfldconfigfilepathold = wurfldconfigfilepathold.replace("\\","/")
        user = cherrypy.session['user']['name']
        logger.info("user name... %s",user)
        config = None
        config_full_path = None
        try:
            # Validating the paths received from user
            if(os.path.exists(wurfldpath) and os.path.exists(wurfldclipath) and os.path.exists(wurfldconfigfilepath)) :
                wurfldFile = os.path.basename(wurfldpath)
                wurfldCliFile = os.path.basename(wurfldclipath)
                wurfldConfigFile = os.path.basename(wurfldconfigfilepath)
                # retrieving only filenames from the paths to validate filenames
                if not(((os_section == "windows") and (wurfldFile == "wurfld.exe")) or ((os_section == "linux") and (wurfldFile == "wurfld")) or ((os_section == "mac") and (wurfldFile == "wurfld"))) :
                   raise ConfigUpdationFailedException("Provide a valid wurfld file")				
                if not(((os_section == "windows") and (wurfldCliFile == "wurfld-cli.exe")) or ((os_section == "linux") and (wurfldCliFile == "wurfld-cli")) or ((os_section == "mac") and (wurfldCliFile == "wurfld-cli"))) :
                    raise ConfigUpdationFailedException("Provide a valid wurfld-cli file")
                if not(((os_section == "windows") and (wurfldConfigFile == "wurfld-test-windows.conf")) or ((os_section == "linux") and (wurfldConfigFile == "wurfld.conf")) or ((os_section == "mac") and (wurfldConfigFile == "wurfld.conf"))) :
                    raise ConfigUpdationFailedException("Provide a valid wurfld config file")
                logger.info("Paths provided and file-names are validated successfully")					
            else :
                raise ConfigUpdationFailedException("Invalid paths sepecified for WURFLD files")
            # Enclosing the spaced words in paths with double quotes
            wurfldpath = self.getEnclosedWithDoubleQuotes(wurfldpath)
            wurfldclipath = self.getEnclosedWithDoubleQuotes(wurfldclipath)
            wurfldconfigfilepath = self.getEnclosedWithDoubleQuotes(wurfldconfigfilepath)
            wurfldpathold = self.getEnclosedWithDoubleQuotes(wurfldpathold)
            wurfldclipathold = self.getEnclosedWithDoubleQuotes(wurfldclipathold)
            wurfldconfigfilepathold = self.getEnclosedWithDoubleQuotes(wurfldconfigfilepathold)
            #accessing properties from bin/config.properies
            config_full_path = make_splunkhome_path(['etc', 'apps', namespace, 'bin', 'config.properties'])
            logger.info("path for config file:\t %s",config_full_path)
            #checking whether bin/config.properties file is existing or not
            if os.path.exists(config_full_path) :
                # Parsing the configuration file 
                config = ConfigParser.ConfigParser()
                config.readfp(open(config_full_path))
                logger.info("config file is read ")
                #checking whether option and section are existing or not if exists then proceeding to read the configurations
                if config.has_option(os_section,"WurfldPath") and config.has_option(os_section,"WurfldcliPath") and config.has_option(os_section,"WurfldconfigFilePath") and config.has_option("server","ServerIP") and config.has_option("server","ServerPort"):
                    logger.info(" config has all options ")
                    # retrieving options under os_section and server section
                    wurfldpath1 = config.get(os_section,"WurfldPath")
                    wurfldclipath1 = config.get(os_section,"WurfldcliPath")
                    wurfldconfigfilepath1 = config.get(os_section,"WurfldconfigFilePath")
                    serverip1 = config.get("server","ServerIP")
                    serverport1 = config.get("server","ServerPort")
                    #logger.info("wurfldpath : %s \n", wurfldpath1)
                    #logger.info("wurfldclipath : %s \n", wurfldclipath1)
                    #logger.info("wurfldconfigfilepath : %s \n", wurfldconfigfilepath1)
                    #logger.info("serverip : %s \n", serverip1)
                    #logger.info("serverport : %s \n", serverport1)
                    # Checking the previous values with the hidden values from ui
                    if wurfldpath1 == wurfldpathold and wurfldclipath1 == wurfldclipathold and wurfldconfigfilepath1 == wurfldconfigfilepathold and serverip1 == serveripold and serverport1 == serverportold:
                       fieldsFound = True
                    else :
                       fieldsFound = False
                else :
                    fieldsFound = False
            else :
                fieldsFound = False
            logger.info(" fieldsFound %s ", fieldsFound)
            logger.info("wurfldpath : %s \n", wurfldpath)
            logger.info("wurfldclipath : %s \n", wurfldclipath)
            logger.info("wurfldconfigfilepath : %s \n", wurfldconfigfilepath)
            logger.info("serverip : %s \n", serverip)
            logger.info("serverport : %s \n", serverport)
            #Saving the new configurations to the config.properties file
            if fieldsFound is None or fieldsFound == False :
                raise SupportingFieldsNotFoundException("Error in accessing the fields from config.properties")
            if fieldsFound == True and not (config is None) and not(config_full_path is None):                
                # setting value to WurfldPath option under os section
                config.set(os_section,"WurfldPath",wurfldpath)
                # setting value to WurfldcliPath option under os section	
                config.set(os_section,"WurfldcliPath",wurfldclipath)
                # setting value to WurfldconfigFilePath option under os section
                config.set(os_section,"WurfldconfigFilePath",wurfldconfigfilepath)
                # setting value to ServerIP option under server section
                config.set("server","ServerIP",serverip)
                # setting value to ServerPort option under server section	
                config.set("server","ServerPort",serverport)
                # saving back the updated values to configuration file
                with open(config_full_path, 'wb') as configfile:
                     config.write(configfile)
                logger.info("Done writing to file\n")	
                return "Configurations are modified successfully"
            else :
                raise ConfigUpdationFailedException("Error in updating the config.properties file")
        except IOError:
            cherrypy.response.status = 404
            logger.error("Config.properties File not found")
            return "config.properties file is not Found"
        except SupportingFieldsNotFoundException:
            cherrypy.response.status = 405
            logger.error("SupportingFieldsNotFoundException")                
            return ""
        except ConfigUpdationFailedException as cufe:
            cherrypy.response.status = 406
            logger.error("ConfigUpdationFailedException")                
            return cufe.message
        except Exception as ae:
            logger.error("Error :: "+ae.message)
            cherrypy.response.status = 500
            return "Config.properties is not updated. Please Try Later"
	
        #return self.render_json(message, set_mime='application/json')

    def getConfig(self, namespace):
        """
        Get the contents of a Config.properties file
        """

        logger.info("Getting Config contents...")
        # Logging the present app namespace
        logger.info("namespace: %s", namespace)
        wurfldpath = ""
        wurfldclipath = ""
        wurfldconfigfilepath = ""
        serverip = ""
        serverport = ""
        osname = ""
        os_section = ""
        fieldsFound = None
        try:
            #accessing configurations from bin/config.properties
            config_full_path = make_splunkhome_path(['etc', 'apps', namespace, 'bin', 'config.properties'])
            logger.info("path for Config.properties file from bin:\t %s",config_full_path)
            # Retrieving the os of the machine
            osname = platform.system()
            if "Windows" == osname :
                os_section = "windows"
            elif "Linux" == osname :
                os_section = "linux"
            elif "Darwin" == osname:
                os_section = "mac"
            #checking whether bin/config.properties file is existing or not
            if os.path.exists(config_full_path) :
                logger.info(" File is existing at bin folder ")
                # Parsing the configuration file 
                config = ConfigParser.ConfigParser()
                config.readfp(open(config_full_path))
                logger.info(" connected to config and read ")	
                #checking whether options and sections are existing or not:
                if config.has_option(os_section,"WurfldPath") and config.has_option(os_section,"WurfldcliPath") and config.has_option(os_section,"WurfldconfigFilePath") and config.has_option("server","ServerIP") and config.has_option("server","ServerPort"):
                    logger.info(" config has all options ")
                    # retrieving values of WURFLD file paths under os_section and replacing the double quotes of spaced words with empty value
                    wurfldpath = config.get(os_section,"WurfldPath").replace("\"","")
                    wurfldclipath = config.get(os_section,"WurfldcliPath").replace("\"","")
                    wurfldconfigfilepath = config.get(os_section,"WurfldconfigFilePath").replace("\"","")
                    # replacing back the windows path seperator if os is of windows type
                    if os_section == "windows" :
                       wurfldpath = wurfldpath.replace("/","\\")
                       wurfldclipath = wurfldclipath.replace("/","\\")
                       wurfldconfigfilepath = wurfldconfigfilepath.replace("/","\\")
                    # retrieving values serverip and server port under server section
                    serverip = config.get("server","ServerIP")
                    serverport = config.get("server","ServerPort")
                    fieldsFound = True
                else :
                    fieldsFound = False
                    logger.info(" config has no option ")
            else :
                fieldsFound = False
            logger.info(" fieldsFound %s ", fieldsFound)
            logger.info("wurfldpath : %s \n", wurfldpath)
            logger.info("wurfldclipath : %s \n", wurfldclipath)
            logger.info("wurfldconfigfilepath : %s \n", wurfldconfigfilepath)
            logger.info("serverip : %s \n", serverip)
            logger.info("serverport : %s \n", serverport)
            logger.info("Done interacting with getConfig method\n")	
            if fieldsFound is None or fieldsFound == False :
                raise SupportingFieldsNotFoundException("Error in accessing the configurations from config.properies")
            else :
                configDisplay = ConfigDisplay(wurfldpath, wurfldclipath, wurfldconfigfilepath, serverip, serverport)
        except IOError:
            cherrypy.response.status = 404
            logger.error("config.properties not found")
            pass
        except SupportingFieldsNotFoundException:
            cherrypy.response.status = 405
            logger.error("SupportingFieldsNotFoundException")                
            pass
        except Exception as ae:
            cherrypy.response.status = 500
            logger.error("Error when attempting to retrieve fields from config.properies")
            pass
        return configDisplay

    def getEnclosedWithDoubleQuotes(self, toBeEnclosed):
        """
        Encloses the spaced words with double quotes in the path
        """
        logger.info("getenclosedwith double quotes start")
        individualFoldersInPath = toBeEnclosed.split("/")
        individualFoldersWithQuotes = []
        for folder in individualFoldersInPath:
            if (' ' in folder) :
                individualFoldersWithQuotes.append("\""+folder+"\"")
            else :
                individualFoldersWithQuotes.append(folder) # 
        enclosedWithDoubleQuotes = "/".join(individualFoldersWithQuotes) # converting list to comma seperated str
        logger.info("enclosedWithDoubleQuotes : %s ", enclosedWithDoubleQuotes)
        return enclosedWithDoubleQuotes

    @expose_page(must_login=True, methods=['POST']) 
    def getConfigDisplay(self, namespace):
        """
        Get the contents from lookup contents,wurfl_capabilities and display  
        """
        configDisplay_json = ""
        try:
            # get configurations from config.properties
            configDisplay = self.getConfig(namespace)
            # Serialize obj to a JSON formatted str
            configDisplay_json = json.dumps(configDisplay.__dict__)
            logger.info("json : %s \n data type: %s", configDisplay_json, type(configDisplay_json))
        except IOError:
            cherrypy.response.status = 404
            return ""
        except Exception as ae:
            cherrypy.response.status = 500
            logger.exception("Error when attempting to get the existing config fields \n"+ae)
            return ""
        return self.render_json(configDisplay_json, set_mime='application/json')

    @expose_page(must_login=True, methods=['POST']) 
    def restoreToDefaultPaths(self, namespace):
        """
        Get the contents from lookup contents,wurfl_capabilities and display  
        """
        configDisplay_json = ""
        try:
            # Retrieving the os of the machine
            osname = platform.system()
            os_section = ""
            wurfldpath = ""
            wurfldclipath = ""
            wurfldconfigfilepath = ""
            serverip = ""
            serverport = ""
            if "Windows" == osname :
                os_section = "windows"
            elif "Linux" == osname :
                os_section = "linux"
            elif "Darwin" == osname:
                os_section = "mac"
            #Setting Default paths
            if os_section == "windows" :
                wurfldpath = "C:\Program Files\Scientiamobile\wurfld\wurfld.exe"
                wurfldclipath = "C:\Program Files\Scientiamobile\wurfld\wurfld-cli.exe"
                wurfldconfigfilepath = "C:\Program Files\Scientiamobile\wurfld\wurfld-test-windows.conf"
            elif os_section == "linux" :
                wurfldpath = "/usr/local/bin/wurfld"
                wurfldclipath = "/usr/local/bin/wurfld-cli"
                wurfldconfigfilepath = "/etc/wurfld/wurfld.conf"
            elif os_section == "mac" :
                wurfldpath = "/usr/local/bin/wurfld"
                wurfldclipath = "/usr/local/bin/wurfld-cli"
                wurfldconfigfilepath = "/etc/wurfld/wurfld.conf"
            #Setting Default server ip and server port
            serverip = "127.0.0.1"
            serverport = "13827"
            #Object creation for configDisplay
            configDisplay = ConfigDisplay(wurfldpath, wurfldclipath, wurfldconfigfilepath, serverip, serverport)
            # Serialize obj to a JSON formatted str
            configDisplay_json = json.dumps(configDisplay.__dict__)
            logger.info("json : %s \n data type: %s", configDisplay_json, type(configDisplay_json))
        except IOError:
            cherrypy.response.status = 404
            return ""
        except Exception as ae:
            cherrypy.response.status = 500
            logger.exception("Error when attempting to get the existing config fields \n"+ae)
            return ""
        return self.render_json(configDisplay_json, set_mime='application/json')
