from builtins import str
from requests.auth import AuthBase
import os
import requests_wrapper.requests as requests
requests.urllib3.disable_warnings(requests.urllib3.exceptions.InsecureRequestWarning)
import isilon_logger_manager as log
import json
import datetime
import sys
import isilon_utilities as utilities

import splunk.entity as entity


logger = log.setup_logging('emc_isilon')

SPLUNK_HOME = os.environ.get("SPLUNK_HOME")
myapp = "TA_EMC-Isilon"
file_path = os.path.join(SPLUNK_HOME, "etc", "apps", myapp, "local")

class TokenAuth(AuthBase):

    def __init__(self, **args):
        self.response_status = None
        self.node = args['node'] if 'node' in args else None 
        self.session_key = args["session_key"] if 'session_key' in args else None
        self.original_endpoint = args['endpoint'] if 'endpoint' in args else None
        self.filename = "last_session_call_info.pos"
     
    def __call__(self, cert_path, response_status=None):
        if response_status and response_status==401:
            self.response_status = response_status
        else:
            self.response_status=None
        self.getSessionvalidity(cert_path)
        return self.cookies

    def getCredentials(self, sessionKey):
        try:
            # list all credentials
            entities = entity.getEntities(['admin', 'passwords'], namespace=myapp, owner='nobody', sessionKey=sessionKey, count=-1, search=myapp)
        except Exception as e:
            logger.error("Dell Isilon Error: Could not get %s credentials from splunk. Error: %s" % (myapp, str(e)))
            raise Exception("Dell Isilon Error: Could not get %s credentials from splunk. Error: %s" % (myapp, str(e)))
    
        # return first set of credentials
        for i, c in list(entities.items()):
            if self.node == c['realm']:
                return c['username'], c['clear_password']
    
        logger.error("Dell Isilon Error: No credentials have been found")
    
    
    def _get_cookie_from_session(self, cert_path):
        headers={'Content-Type':'application/json'}
        self.username, self.password = self.getCredentials(self.session_key)
        body=json.dumps({'username':self.username, 'password': self.password, 'services': ('platform','namespace')})
        nodeList = self.original_endpoint.split(":8080")
        self.url= nodeList[0]+":8080"+'/session/1/session' if len(nodeList) > 0 else None
        r = requests.post(verify=cert_path, url= self.url, headers=headers, data=body)
        if r.status_code==201 and r.cookies:
            logger.info("Dell Isilon INFO: Got new session cookie for endpoint %s" %self.original_endpoint)
            self.cookies = dict(r.cookies)
            response_dict = json.loads(r.text)
            time_absolute = response_dict['timeout_absolute'] if 'timeout_absolute' in response_dict else 0
            call_validity = datetime.datetime.now()+datetime.timedelta(seconds=time_absolute-600)
            self.node_dict={'cookies': self.cookies, 'call_validity': call_validity.strftime('%Y-%m-%d %H:%M:%S')}
        else:
            self.cookies = None
            self.node_dict=None
            pass
    
    def getSessionvalidity(self, cert_path):
        try:
            file_data = utilities._read_meta_info(self.filename, file_path)
            if file_data!= -1:
                if str(self.node) in file_data and file_data.get(str(self.node)) != None \
                 and file_data.get(str(self.node)).get('call_validity') != None and self.response_status==None:
                    file_date_time= file_data[str(self.node)]['call_validity']
                    if datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S') <= file_date_time:
                        self.cookies = file_data[str(self.node)]['cookies']
                    else:
                        self._get_cookie_from_session(cert_path)
                        if self.node_dict != None:
                            file_data[str(self.node)] = self.node_dict
                            utilities._write_meta_info(file_data, self.filename, file_path)
                else:                 
                    self._get_cookie_from_session(cert_path)
                    if self.node_dict != None:
                        file_data[str(self.node)] = self.node_dict
                        utilities._write_meta_info(file_data, self.filename, file_path) 
            else:
                file_data = {}
                self._get_cookie_from_session(cert_path)
                if self.node_dict != None:
                    file_data[str(self.node)] = self.node_dict
                    utilities._write_meta_info(file_data, self.filename, file_path)
            
        except Exception as e:
            logger.error("Dell Isilon Error: Error while getting session validity for authentication. %s" % str(e))
            self.cookies =None
        