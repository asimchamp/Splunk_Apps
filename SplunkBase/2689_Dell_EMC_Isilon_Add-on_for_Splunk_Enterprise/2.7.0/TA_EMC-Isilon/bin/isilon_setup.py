import sys
import os
APP_NAME = os.path.abspath(__file__).split(os.sep)[-3]
SPLUNK_HOME = os.environ.get("SPLUNK_HOME")
sys.path.insert(0, os.path.join(SPLUNK_HOME, "etc", "apps", APP_NAME, "bin"))
sys.path.append(os.path.join(SPLUNK_HOME, "etc", "apps", APP_NAME, "bin", "lib"))
from future import standard_library
standard_library.install_aliases()
from builtins import str
import splunk
import splunk.admin as admin
import splunk.entity as en

import configparser
import isilon_logger_manager as log
import requests_wrapper.requests as requests
requests.urllib3.disable_warnings(requests.urllib3.exceptions.InsecureRequestWarning)
import json
import re
import splunk.rest as rest
import isilon_utilities as utils

if sys.version_info[0] < 3:
    from urllib import unquote
else:
    from urllib.parse import unquote 

logger = log.setup_logging('emc_isilon')
ISILON_PORT = 8080

class ConfigApp(rest.BaseRestHandler):

    def get_release_version(self, host, cookies, cert_verify):
        csrf = cookies.get('isicsrf')
        sessid = cookies.get('isisessid')
        self.url= "https://"+host+":"+str(ISILON_PORT)+'/platform/1/cluster/config'
        try:
            if csrf:
                headers = {'X-CSRF-Token': str(csrf), 'Cookie': "isisessid=" + str(sessid), 'Referer': 'https://'+ str(host) + ':8080'}
                r = requests.get(verify=cert_verify, url= self.url, headers=headers)
                return r.json().get('onefs_version', None).get('release', None)
            else:
                r = requests.get(verify=cert_verify, url= self.url, cookies=cookies)
                return r.json().get('onefs_version', None).get('release', None)
        except Exception as e:
            logger.error("Dell Isilon Error: HTTP Request error for endpoint : %s" % (str(e)))
            raise Exception("Error occurred while getting the release version")
            sys.exit()

    
    def get_cookie(self, host, username, password, cert_verify):
        try:
            self.url= "https://"+host+":"+str(ISILON_PORT)+'/session/1/session'
            headers={'Content-Type':'application/json'}
            
            body=json.dumps({'username':username, 'password': password, 'services': ('platform','namespace')})
            r = requests.post(verify=cert_verify, url= self.url, headers=headers, data=body)
            r.raise_for_status()
            return dict(r.cookies)
        except Exception as e:
            logger.error("Dell Isilon Error: HTTP Request error for endpoint : %s" % (str(e)))
            raise Exception("Error occurred while fetching the cookie info")
            sys.exit()
    
    def check_authentication(self, host, username, password, sessionKey, cert_verify):
        try:
            self.url= "https://"+host+":"+str(ISILON_PORT)+'/session/1/session'
            headers={'Content-Type':'application/json'}
            
            body=json.dumps({'username':username, 'password': password, 'services': ('platform','namespace')})
            r = requests.post(verify=cert_verify, url= self.url, headers=headers, data=body)
            r.raise_for_status()
            try:
                storage_password_id=host+':'+username+':'
                password_entity_result = en.getEntity('storage/passwords',  storage_password_id, sessionKey=sessionKey)
                if password_entity_result:
                    rest.simpleRequest(
                        "/servicesNS/nobody/" + self.appName + '/storage/passwords/' + storage_password_id + '?output_mode=json',
                        sessionKey=sessionKey, postargs={'password': password}, method="POST")
                    return True
            except splunk.ResourceNotFound as e:
                logger.info("Dell Isilon INFO: Password Entity Not found for given host and given user in splunk, so creating new entity")
                return False
        except Exception as e:
            logger.error("Dell Isilon Error: HTTP Request error for endpoint : %s" % (str(e)))
            raise Exception("Error occurred while authenticating to server")
            sys.exit()

    def handle_POST(self):
        inputConfParser = configparser.ConfigParser()
        inputConf = os.path.join(SPLUNK_HOME, "etc", "apps", APP_NAME, "local", "inputs.conf")

        try:
            values = self.request.get('payload').split("&")
            host = unquote(values[0].split("=")[1])
            username = unquote(values[1].split("=")[1])
            password = unquote(values[2].split("=")[1])
            if len(values) == 4:
                index = values[3].split("=")
                if len(index) == 2:
                    index = unquote(index[1])
            if (not (username and password and host)) or (username.strip()=="" or password.strip()=="" or host.strip()==""):
                raise
        except Exception as e:
            logger.error("Dell Isilon Error: IP Address or Username or Password is blank. " + str(e))
            raise Exception("Please fill out required fields")
        if sys.version_info[0] < 3:
            host, username, password  = host.decode('utf-8'), username.decode('utf-8'), password.decode('utf-8')
            if index:
                index = index.decode('utf-8')

        if bool(re.search('^(?:https|http)://\S+', host)):
            logger.error("Dell Isilon Error: IP Address must not contain protocol. Please remove the http(s) scheme from IP Address.")
            raise Exception("IP Address must not contain protocol. Please remove the http(s) scheme from IP Address.")

        verify, cert_verify = utils.validation_of_ssl_certification()

        sessionKey = self.sessionKey
        self.appName = APP_NAME

        try:
            rest.simpleRequest("/servicesNS/nobody/" + self.appName + '/properties/isilonappsetup', method='POST',
                               postargs={'__stanza': host}, sessionKey=sessionKey, raiseAllErrors=True)
        except Exception as e:
            logger.error("Dell Isilon Error: %s" % str(e))

        try:
            rest.simpleRequest("/servicesNS/nobody/" + self.appName + '/properties/isilonappsetup/' + host,
                               method='POST',
                               postargs={'verify': verify, 'cert_path': cert_verify}, sessionKey=sessionKey,
                               raiseAllErrors=True)
        except Exception as e:
            logger.error("Dell Isilon Error: while updating isilonappsetup.conf: %s" % str(e))
            raise Exception("Error occurred while updating isilonappsetup.conf")

        if (not index) or index.strip()=="":
            index = "isilon"
        else:
            index = index.strip()

        indexes = en.getEntities(['data', 'indexes'], count=-1, sessionKey=sessionKey)
        if not index in list(indexes.keys()):
            logger.error("Dell Isilon Error: index %s does not exist" % index)
            raise Exception("Index %s does not exist" % index)

        if cert_verify.strip() != '' and verify:
            cert_verify = cert_verify
        else:
            cert_verify = verify

        authenticated=self.check_authentication(host, username, password, sessionKey, cert_verify)
        cookies = self.get_cookie(host, username, password, cert_verify)
        
        release_version = self.get_release_version(host, cookies, cert_verify)
        major_version = release_version.split('v')[1].split('.')[0]
        logger.info("Dell Isilon: Onefs version: %s", str(major_version))
        bin_path = os.path.join(SPLUNK_HOME, "etc", "apps", APP_NAME, "bin")
        if int(major_version) >= 8:
        	input_calls_file = open(os.path.join(bin_path, 'inputs_v8_above.txt'), 'r')
        else:
        	input_calls_file = open(os.path.join(bin_path, 'inputs_v7_below.txt'), 'r')
        pathList = input_calls_file.readlines()
        owner = "nobody"
        namespace = self.appName
        if not authenticated:
            try:   
                password_entity = en.getEntity('storage/passwords', '_new', sessionKey=sessionKey)           
                password_entity["name"] = username
                password_entity["password"] = password
                password_entity["realm"] = host
                password_entity.namespace = namespace
                password_entity.owner = owner
                en.setEntity(password_entity, sessionKey=sessionKey)
                inpFlag = False
                try:
                    inp = en.getEntity('data/inputs/isilon', '_new', sessionKey=sessionKey)
                    for entity_path in pathList:
                        entity_path_list = entity_path.strip().split('::')
                        if not len(entity_path_list)==2:
                            logger.error("Dell Isilon Error: Path must be defined with polling interval, separated with double colon in inputs.txt file : %s!" % entity_path)
                        else:
                            if inpFlag:
                                name = "isilon://" + host + '::' + entity_path_list[0]
                                inputConfParser.add_section(name)
                                endpoint = "https://"+host+":"+str(ISILON_PORT)+entity_path_list[0]
                                inputConfParser.set(name, 'endpoint', endpoint)
                                inputConfParser.set(name, 'sourcetype', "emc:isilon:rest")
                                inputConfParser.set(name, 'interval', entity_path_list[1])
                                inputConfParser.set(name, 'index', index)
                                inputConfParser.set(name, 'response_handler', 'IsilonResponseHandler')         
                                inputConfParser.set(name, 'python.version', 'python3')
                            else:
                                inp["name"] = host + '::' + entity_path_list[0]
                                endpoint = "https://"+host+":"+str(ISILON_PORT)+entity_path_list[0]
                                inp["endpoint"] = endpoint
                                inp["sourcetype"] = "emc:isilon:rest"
                                inp["interval"] = int(entity_path_list[1])
                                inp["index"] = index
                                inp["response_handler"] = 'IsilonResponseHandler'
                                inp.namespace = namespace
                                inp.owner = owner
                                inpFlag = True             
                    with open(inputConf, 'a+') as inputConfig:
                        inputConfParser.write(inputConfig)
                    en.setEntity(inp, sessionKey=sessionKey)
                    
                except requests.exceptions.HTTPError as e:
                    logger.error("Dell Isilon Error: HTTP Request error: %s" % str(e))
                    raise Exception("HTTP Request error: %s" % str(e))
            except Exception as e:
                logger.error("Dell Isilon Error: Exception: %s" % str(e))
                raise Exception("Exception: %s" % str(e))

        # Update app.conf
        try:
            rest.simpleRequest("/servicesNS/nobody/" + self.appName + '/configs/conf-app/install/',
                               method='POST',
                               postargs={'is_configured': 'true'}, sessionKey=sessionKey,
                               raiseAllErrors=True)
            rest.simpleRequest("/servicesNS/nobody/system/apps/local/" + self.appName + "/_reload",
                               method='POST',
                               postargs=None, sessionKey=sessionKey,
                               raiseAllErrors=True)
        except Exception as e:
            logger.error("Dell Isilon Error: while updating app.conf: %s" % str(e))
            raise Exception("Error occurred while updating app.conf")
    # handle verbs, otherwise Splunk will throw an error
    handle_GET = handle_POST
