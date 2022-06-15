'''
Modular Input Script

Copyright (C) 2012 Splunk, Inc.
All Rights Reserved

'''
from __future__ import print_function
import os 
import sys
import requests_wrapper.requests as requests
requests.urllib3.disable_warnings(requests.urllib3.exceptions.InsecureRequestWarning)

SPLUNK_HOME = os.environ.get("SPLUNK_HOME")
sys.path.append(os.path.join(SPLUNK_HOME, "etc", "apps", "TA_EMC-Isilon", "bin", "lib"))
from builtins import str
from future.utils import raise_
import time, re
import tokens
import json
import splunk.entity as entity
import splunk.rest as rest

from defusedxml import minidom
import isilon_logger_manager as log
from responsehandlers import IsilonResponseHandler, IsilonEventResponseHandler
from authhandlers import TokenAuth


logger = log.setup_logging('emc_isilon')


SCHEME = """<scheme>
    <title>Isilon Rest Modular Input</title>
    <description>REST API input for polling data from ISILON endpoints</description>
    <use_external_validation>true</use_external_validation>
    <streaming_mode>xml</streaming_mode>
    <use_single_instance>false</use_single_instance>

    <endpoint>
        <args>    
            <arg name="name">
                <title>REST input name</title>
                <description>Name of this REST input</description>
            </arg>                   
            <arg name="endpoint">
                <title>Endpoint URL</title>
                <description>URL to send the HTTP GET request to</description>
                <required_on_edit>false</required_on_edit>
                <required_on_create>true</required_on_create>
            </arg>
            <arg name="http_method">
                <title>HTTP Method</title>
                <description>HTTP method to use.Defaults to GET. POST and PUT are not really RESTful for requesting data from the API, but useful to have the option for target APIs that are "REST like"</description>
                <required_on_edit>false</required_on_edit>
                <required_on_create>false</required_on_create>
            </arg>
            <arg name="response_handler">
                <title>Response Handler</title>
                <description>Python classname of custom response handler. Default handler is IsilonResponseHandler</description>
                <required_on_edit>false</required_on_edit>
                <required_on_create>false</required_on_create>
            </arg>
        </args>
    </endpoint>
</scheme>
"""
            
def do_validate():
    config = get_validation_config()
    isilon_url = config.get("endpoint", "")
    http_method = config.get("http_method", "")
    if not bool(re.search('^(https://)\S+', isilon_url)):
        logger.error("Only secure URLs are supported so endpoint must begin with 'https://'")
        sys.exit(2)
    if http_method and http_method not in ('GET', 'POST', 'PUT'):
        logger.error("http_method must be contains value from (GET, POST, PUT). You can update it by creating/updating local/inputs.conf")
        sys.exit(2)
    return

def requestEndpoint(http_method, endpoint, cookie, req_args, node):
    csrf = cookie.get('isicsrf')
    sessid = cookie.get('isisessid')
    if csrf:
        headers = {'X-CSRF-Token': str(csrf), 'Cookie': "isisessid=" + str(sessid), 'Referer': 'https://'+ str(node) + ':8080'}
        if http_method == "GET":
           r = requests.get(endpoint,headers=headers,**req_args)
        elif http_method == "POST":
           r = requests.post(endpoint,headers=headers,**req_args)
        elif http_method == "PUT":
           r = requests.put(endpoint,headers=headers,**req_args)
    else:
        if http_method == "GET":
            r = requests.get(endpoint, cookies=cookie, **req_args)
        elif http_method == "POST":
            r = requests.post(endpoint, cookies=cookie, **req_args)
        elif http_method == "PUT":
            r = requests.put(endpoint, cookies=cookie, **req_args)
    return r

def pagination(http_method, endpoint, r, cookie, req_args, node):
    responses = []
    while True:
        try:
            r_json = json.loads(r.text)
            if 'resume' in r_json and r_json['resume']:
                endpoint = endpoint.split('?')[0] + '?' + 'resume=' + r_json['resume']
                r = requestEndpoint(http_method, endpoint, cookie, req_args, node)
                responses.append(r)
            else:
                break
        except requests.exceptions.Timeout as e:
            logger.error("Dell Isilon Error: HTTP Request Timeout error : %s for endpoint %s" % (str(e), endpoint))
            time.sleep(float(backoff_time))
        except Exception as e:
            logger.error("Dell Isilon Error: Exception performing request: %s for endpoint %s" % (str(e), endpoint))
            time.sleep(float(backoff_time))
    return responses

def do_run():
    
    config = get_input_config()
    original_endpoint=config.get("endpoint") 
    stanza = config.get("name")
    session_token = config.get("session_key")
    node = stanza.split('::')[0].split('//')[1]
    
    #params    
    auth_type="basic"
    response_type="json" 
        
    request_timeout=120  #in seconds
    backoff_time=10
    
    http_method=config.get("http_method","GET")

    custom_auth_handler_args={"auth_type": auth_type, "session_key": session_token, "endpoint": original_endpoint, "node": node}
    custom_auth_handler_instance = TokenAuth(**custom_auth_handler_args)
    
    try:

        try:
            resp, resp_content = rest.simpleRequest(
                '/servicesNS/nobody/TA_EMC-Isilon/properties/isilonappsetup/' + node + '/verify',
                sessionKey=session_token, raiseAllErrors=True)
            verify = str(resp_content, 'utf-8').strip()
            resp, resp_content = rest.simpleRequest(
                '/servicesNS/nobody/TA_EMC-Isilon/properties/isilonappsetup/' + node + '/cert_path',
                sessionKey=session_token, raiseAllErrors=True)
            cert_path = str(resp_content, 'utf-8').strip()
        except Exception as e:
            logger.error("Dell Isilon Error: %s" % str(e))
            verify = True
            cert_path = ''
        if cert_path.strip() != '' and verify.lower() in ["true","yes","t","y","1"]:
            cert_verify = cert_path
        elif verify.lower() in ["false","no","f","n","0"]:
            cert_verify = False
        else:
            cert_verify = True

        req_args = {"verify" : cert_verify , "timeout" : float(request_timeout)}
        auth = None
        if custom_auth_handler_instance:
            auth = custom_auth_handler_instance
        if auth:
            cookie= auth(cert_verify)

        
        endpoint_list = replaceTokens(original_endpoint, cookie, node, req_args)

        for endpoint in endpoint_list:
            responses = []
            response_handler_instance = IsilonResponseHandler()
            if 'eventlists' in endpoint:
                response_handler_instance = IsilonEventResponseHandler()
            try:
                r = requestEndpoint(http_method, endpoint,cookie,req_args, node)
                responses.append(r)
            except requests.exceptions.Timeout as e:
                logger.error("Dell Isilon Error: HTTP Request Timeout error : %s for endpoint %s" % (str(e), endpoint))
                time.sleep(float(backoff_time))
                continue
            except Exception as e:
                logger.error("Dell Isilon Error: Exception performing request: %s for endpoint %s" % (str(e), endpoint))
                time.sleep(float(backoff_time))
                continue

            if "auth/providers/ads" in endpoint:
                responses = responses + pagination(http_method, endpoint, r, cookie, req_args, node)

            try:
                for res in responses:
                    res.raise_for_status()
                    handle_output(response_handler_instance, res.text,response_type,endpoint,node)
            except requests.exceptions.HTTPError as e:                
                logger.error("Dell Isilon Error: HTTP Request error: %s for endpoint %s" % (str(e), endpoint))                
                time.sleep(float(backoff_time))
                if res.status_code == 401:
                    logger.info("Dell Isilon INFO: Got authentication failure error, so getting new session cookie for endpoint %s" %endpoint)
                    cookie=auth(cert_verify, res.status_code)
                continue
            
    except RuntimeError as e:
        logger.error("Dell Isilon Error: Looks like an error: %s" % str(e))
        sys.exit(2) 
        
  
def replaceTokens(raw_string, cookie, node, req_args):
    endpoints =[raw_string]
    try:
        substitution_tokens = re.findall("\$(?:\w+)\$", str(raw_string))
        for token in substitution_tokens:
            endpoints = getattr(tokens, token[1:-1])(raw_string, cookie, node, req_args)
        return endpoints
    except Exception as e:
        logger.error("Dell Isilon Error: Looks like an error substituting tokens: %s for endpoint %s" % (str(e), raw_string))
        return []
                       
def handle_output(response_handler_instance, output,type,endpoint,node):
    try:
        response_handler_instance(output,type,node,endpoint)
        sys.stdout.flush()               
    except RuntimeError as e:
        logger.error("Dell Isilon Error: Looks like an error while handling the response : %s for endpoint %s" % (str(e), endpoint))

  
def usage():
    print("usage: %s [--scheme|--validate-arguments]")
    logger.error("Dell Isilon Error: Incorrect Program Usage")
    sys.exit(2)

def do_scheme():
    print(SCHEME)

#read XML configuration passed from splunkd, need to refactor to support single instance mode
def get_input_config():
    config = {}

    try:
        # read everything from stdin
        config_str = sys.stdin.read()

        # parse the config XML
        doc = minidom.parseString(config_str)
        root = doc.documentElement
        
        session_key_node = root.getElementsByTagName("session_key")[0]
        if session_key_node and session_key_node.firstChild and session_key_node.firstChild.nodeType == session_key_node.firstChild.TEXT_NODE:
            data = session_key_node.firstChild.data
            config["session_key"] = data 
            
        server_uri_node = root.getElementsByTagName("server_uri")[0]
        if server_uri_node and server_uri_node.firstChild and server_uri_node.firstChild.nodeType == server_uri_node.firstChild.TEXT_NODE:
            data = server_uri_node.firstChild.data
            config["server_uri"] = data   
            
        conf_node = root.getElementsByTagName("configuration")[0]
        if conf_node:
            logger.debug("XML: found configuration")
            stanza = conf_node.getElementsByTagName("stanza")[0]
            if stanza:
                stanza_name = stanza.getAttribute("name")
                if stanza_name:
                    logger.debug("XML: found stanza " + stanza_name)
                    config["name"] = stanza_name

                    params = stanza.getElementsByTagName("param")
                    for param in params:
                        param_name = param.getAttribute("name")
                        logger.debug("XML: found param '%s'" % param_name)
                        if param_name and param.firstChild and \
                           param.firstChild.nodeType == param.firstChild.TEXT_NODE:
                            data = param.firstChild.data
                            config[param_name] = data
                            logger.debug("XML: '%s' -> '%s'" % (param_name, data))

        checkpnt_node = root.getElementsByTagName("checkpoint_dir")[0]
        if checkpnt_node and checkpnt_node.firstChild and \
           checkpnt_node.firstChild.nodeType == checkpnt_node.firstChild.TEXT_NODE:
            config["checkpoint_dir"] = checkpnt_node.firstChild.data

        if not config:
            raise Exception("Invalid configuration received from Splunk.")

        
    except Exception as e:
        raise_(Exception, "Error getting Splunk configuration via STDIN: %s" % str(e))
    return config


#read XML configuration passed from splunkd, need to refactor to support single instance mode
def get_validation_config():
    val_data = {}

    # read everything from stdin
    val_str = sys.stdin.read()

    # parse the validation XML
    doc = minidom.parseString(val_str)
    root = doc.documentElement

    logger.debug("Dell Isilon: XML: found items")
    item_node = root.getElementsByTagName("item")[0]
    if item_node:
        logger.debug("Dell Isilon: XML: found item")

        name = item_node.getAttribute("name")
        val_data["stanza"] = name

        params_node = item_node.getElementsByTagName("param")
        for param in params_node:
            name = param.getAttribute("name")
            logger.debug("Dell Isilon: Found param %s" % name)
            if name and param.firstChild and \
               param.firstChild.nodeType == param.firstChild.TEXT_NODE:
                val_data[name] = param.firstChild.data

    return val_data

if __name__ == '__main__': 
    if len(sys.argv) > 1:
        if sys.argv[1] == "--scheme":           
            do_scheme()
        elif sys.argv[1] == "--validate-arguments":
            do_validate()
        else:
            usage()
    else:
        do_run()
        
    sys.exit(0)
