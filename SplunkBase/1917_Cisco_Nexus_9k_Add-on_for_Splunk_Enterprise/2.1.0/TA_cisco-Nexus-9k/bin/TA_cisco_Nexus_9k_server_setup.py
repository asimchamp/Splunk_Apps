import splunk.entity as entity
import splunk.admin as admin
import re, sys, json, os, time
import requests
import logging
import xml.sax.saxutils as xss

logger = logging.getLogger()
logger.addHandler(logging.StreamHandler())
logger.setLevel("ERROR")

APPNAME = __file__.split(os.sep)[-3]

class ConfigApp(admin.MConfigHandler):
    def setup(self):
        if self.requestedAction == admin.ACTION_EDIT:
            for arg in ['cisco_Nexus_9k_host', 'cisco_Nexus_9k_username', 'password']:
                self.supportedArgs.addOptArg(arg)

    def handleList(self, confInfo):
        confDict = self.readConf("TA_cisco_Nexus_9k_server_setup")
        if None != confDict:
            for stanza, settings in list(confDict.items()):
                for key, val in list(settings.items()):
                    if key in ['cisco_Nexus_9k_host', 'cisco_Nexus_9k_username', 'password'] and val in [None, '']:
                        val = ''
                    confInfo[stanza].append(key, val)

    def handleEdit(self, confInfo):
        # INIT Input fields to empty string instead of null
        if self.callerArgs.data['cisco_Nexus_9k_host'][0] == None:
            cisco_Nexus_9k_host = ''
        else:
            cisco_Nexus_9k_host = xss.escape(self.callerArgs.data['cisco_Nexus_9k_host'][0])

        if self.callerArgs.data['cisco_Nexus_9k_username'][0] == None:
            cisco_Nexus_9k_username = ''
        else:
            cisco_Nexus_9k_username = xss.escape(self.callerArgs.data['cisco_Nexus_9k_username'][0])

        if self.callerArgs.data['password'][0] == None:
            password = ''
        else:
            password = self.callerArgs.data['password'][0]

        # INPUT VALIDATION
        #check whether input fields are empty or not
        if len(cisco_Nexus_9k_host)==0 or len(cisco_Nexus_9k_username)==0 or len(password)==0:
            raise admin.ArgValidationException("CISCO_NEXUS_9k_SETUP-INPUT_ERROR input fields cannot be empty.")

        containsHttpRegex = re.compile("^[http?].*[^\/]") #hostname should not start with http or https
        containsSlashRegex = re.compile(".*[\/\\\]$") #hostname should not end with /
        invalidHostnameHttp = re.search(containsHttpRegex, cisco_Nexus_9k_host)
        invalidHostnameSlash = re.search(containsSlashRegex, cisco_Nexus_9k_host)
        if invalidHostnameHttp or invalidHostnameSlash:
            raise admin.ArgValidationException("CISCO_NEXUS_9k_SETUP-INPUT_ERROR Invalid Hostname or IP address specified. Must be a valid IPv4 or IPv6 or Hostname.")

        # Username: make sure it is a string with no spaces
        containsSpaceRegex = re.compile("\s+")
        invalidUsername = re.search(containsSpaceRegex, cisco_Nexus_9k_username)
        if invalidUsername or len(cisco_Nexus_9k_username) < 1:
            raise admin.ArgValidationException("CISCO_NEXUS_9k_SETUP-INPUT_ERROR: Invalid Username specified. Must be a string without spaces.")
        
        sessionKey = self.getSessionKey()
        try:
            entities = entity.getEntities(['admin', 'passwords'], namespace=APPNAME,
                                            owner='nobody', sessionKey=sessionKey,search="realm=\"" + str(cisco_Nexus_9k_host)+ "\"")
            if cisco_Nexus_9k_host != xss.unescape(cisco_Nexus_9k_host):
                res = entity.getEntities(['admin', 'passwords'], namespace=APPNAME,
                                        owner='nobody', sessionKey=sessionKey,search="realm=\"" + str(xss.unescape(cisco_Nexus_9k_host))+ "\"")
                entities.update(res)
        except:
            raise admin.ArgValidationException("Failed to search for existing Cisco Nexus (k) credential in passwords.conf!")
        if len(list(entities.items())) != 0:
            raise admin.ArgValidationException("Cisco Nexus 9k server credential for " + xss.unescape(str(cisco_Nexus_9k_host)) + " already exists in passwords.conf. Remove it from local/passwords.conf, restart Splunk, and try again.")

        # # Create Encrypted Credential in passwords.conf via REST API for Nexus 9k
        try:
            creds = entity.getEntity('/storage/passwords/', '_new', sessionKey=sessionKey)
            creds["name"] = str(cisco_Nexus_9k_username)
            creds["password"] = password
            creds["realm"] = str(cisco_Nexus_9k_host)
            creds.namespace = APPNAME
            entity.setEntity(creds, sessionKey=sessionKey)
        except:
            raise admin.ArgValidationException("Failed to create credential!")

admin.init(ConfigApp, admin.CONTEXT_NONE)
