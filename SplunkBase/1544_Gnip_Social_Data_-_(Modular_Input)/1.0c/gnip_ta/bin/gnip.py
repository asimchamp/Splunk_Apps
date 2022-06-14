'''
Modular Input Script

Copyright (C) 2012 Splunk, Inc.
All Rights Reserved

'''

import sys,logging
import xml.dom.minidom, xml.sax.saxutils
import base64
from getpass import getpass
import json
import sys
import time
import traceback
import logging
import os
SPLUNK_HOME = os.environ.get("SPLUNK_HOME")
sys.path.append(SPLUNK_HOME + "/etc/apps/gnip_ta/bin/requests-1.2.3-py2.7.egg")
sys.path.append(SPLUNK_HOME + "/etc/apps/gnip_ta/bin/uuid-1.30")
sys.path.append(SPLUNK_HOME + "/etc/apps/gnip_ta/bin/certifi")
import uuid
import requests
#import certifi
#cert_path = SPLUNK_HOME + "/etc/auth/cacert.pem"
#print "certpath is :" , cert_path
#set up logging
logging.root
logging.root.setLevel(logging.ERROR)
formatter = logging.Formatter('%(levelname)s %(message)s')
#with zero args , should go to STD ERR
handler = logging.StreamHandler()
handler.setFormatter(formatter)
logging.root.addHandler(handler)

DEFAULT_CHUNK_SIZE = 10 * 1024
DEFAULT_TERMINATOR = "\r\n"
verbose = 1

SCHEME = """<scheme>
    <title>Gnip Social Data</title>
    <description>Consume a social data stream from Gnip</description>
    <use_external_validation>true</use_external_validation>
    <streaming_mode>simple</streaming_mode>
    <name>Gnip Social Data Source</name>
    <use_single_instance>false</use_single_instance>
    <endpoint>
        <args>
            <arg name="name">
                <title>Gnip Data Source Name</title>
                <description>Give it a name, so you know what its for.</description>
            </arg> 
            <arg name="gnip_url">
                <title>Gnip Data Source URL</title>
                <description>Enter the URL of your Gnip Data Source, you can find this in the console</description>
            </arg>

            <arg name="gnip_username">
                <title>Gnip Login</title>
                <description>Your Gnip Login Credentials</description>
            </arg>
            <arg name="gnip_password">
                <title>Gnip Password</title>
                <description>Your Gnip password</description>
            </arg>
        </args>
    </endpoint>
</scheme>
"""

#parsing defaults
CHUNK_SIZE = 10 * 1024
DEFAULT_TERMINATOR = "\r\n"

#retry logic defaults
MAX_RECONNECTIONS = 10
INITIAL_DELAY = 3
BACKOFF_POWER = 2
def retry(ExceptionToCheck, tries=MAX_RECONNECTIONS, delay=INITIAL_DELAY, backoff=BACKOFF_POWER):
    """Retry decorator
    original from http://wiki.python.org/moin/PythonDecoratorLibrary#Retry
    """
    def deco_retry(f):
        def f_retry(*args, **kwargs):
            mtries, mdelay = tries, delay
            try_one_last_time = True
            while mtries > 1:
                try:
                    return f(*args, **kwargs)
                    try_one_last_time = False
                    break
                except ExceptionToCheck, e:
                    sys.stderr.write("%s, Retrying in %d seconds..." % (str(e), mdelay))
                    time.sleep(mdelay)
                    mtries -= 1
                    mdelay *= backoff
            if try_one_last_time:
                return f(*args, **kwargs)
            return
        return f_retry # true decorator
    return deco_retry


class StreamingHttp:
    def __init__(self, gnip_username, gnip_password, gnip_url, terminator, chunk_size):
        self.buffer = ""
        self.gnip_username = gnip_username
        self.gnip_password = gnip_password
        self.gnip_url = gnip_url
        self.chunk_size = chunk_size
        
    

    def connect(self):
        # Login using basic auth
        gnip_token = self.gnip_username + ":" + self.gnip_password
        auth_token = "Basic " + str.strip(base64.encodestring(gnip_token))

        headers = { 'Content-Length': "0",
        'Authorization': auth_token,
        'Host': 'stream.gnip.com',
        'User-Agent': "Splunk Enterprise Modular Input/0.1",
        'Accept': "*/*",
        'Accept-Encoding': 
        '*,gzip',
        'Connection': 
        'Keep-Alive'
        }

        r = requests.get(self.gnip_url, headers=headers,stream=True,verify=False)
        try:
            r.raise_for_status()      
            for line in r.iter_lines():
                if line: 
                    print line
        
        except Exception:
            output = r.status_code
            
            if output == 401:
                print_validation_error("Your Gnip Username or Password appear to be incorrect, check and resubmit please.")
                validationFailed = True

            elif output == 404:
                raise Exception, "The URL of your Gnip Data Source incorrect or does not exist, check and resubmit please."
                logging.error("Incorrect Gnip URL of %s" % (gnip_url))
            sys.exit(2)
            



def listen(gnip_username, gnip_password, gnip_url, terminator, chunk_size):
    #print "we are in listen"
    streaming_http = StreamingHttp(gnip_username, gnip_password, gnip_url, terminator, chunk_size)
    stream = streaming_http.connect()

    buffer = ""
    tries = 0        



@retry(Exception)
def start(gnip_username, gnip_password, gnip_url, terminator, chunk_size):

    if verbose > 0: 
        pass
        #print "Listening.."
    try: 
        listen(gnip_username, gnip_password, gnip_url, terminator, chunk_size)
    except KeyboardInterrupt:
        pass
    except Exception as e:
        traceback.print_exc(file=sys.stderr)
        sys.stderr.flush()
        raise Exception()





def do_validate():
    config = get_validation_config()
    gnip_username = config['gnip_username']
    gnip_url = config['gnip_url']
    gnip_password = config ['gnip_password']
    gnip_token = gnip_username + ":" + gnip_password
    auth_token = "Basic " + str.strip(base64.encodestring(gnip_token))
    
    headers = { 'Content-Length': "0",
    'Authorization': auth_token,
    'Host': 'stream.gnip.com',
    'User-Agent': "Splunk Enterprise Modular Input/0.1",
    'Accept': "*/*",
    'Accept-Encoding': 
    '*,gzip',
    'Connection': 
    'Keep-Alive'
    }

    r = requests.get(gnip_url, headers=headers,stream=True, verify=False)

    try:
        r = requests.get(gnip_url, headers=headers, stream=True,  verify=False)
        r.raise_for_status()

    except Exception:
        output = r.status_code
        #print_validation_error(str(output))

        if output == 401:
            print_validation_error("Your Gnip Username or Password appear to be incorrect, check and resubmit please.")
            validationFailed = True

        elif output == 404:
            print_validation_error("The URL of your Gnip Data Source incorrect or does not exist, check and resubmit please.")
            validationFailed = True        
        raise
    #TODO
    #if error , print_validation_error & sys.exit(2) 
    
def do_run():
    config = get_input_config()  
    #TODO , poll for data and print output to STD OUT
    #if error , logger.error & sys.exit(2)
    gnip_username = config['gnip_username']
    gnip_url = config['gnip_url']
    gnip_password = config ['gnip_password']
    terminator = DEFAULT_TERMINATOR
    chunk_size = DEFAULT_CHUNK_SIZE

    start(gnip_username, gnip_password, gnip_url, terminator, chunk_size)


# prints validation error data to be consumed by Splunk
def print_validation_error(s):
    print "<error><message>%s</message></error>" % xml.sax.saxutils.escape(s)
    
# prints XML stream
def print_xml_single_instance_mode(s):
    print "<stream><event><data>%s</data></event></stream>" % xml.sax.saxutils.escape(s)
    
# prints XML stream
def print_xml_multi_instance_mode(s,stanza):
    print "<stream><event stanza=""%s""><data>%s</data></event></stream>" % stanza,xml.sax.saxutils.escape(s)
    
# prints simple stream
def print_simple(s):
    print "%s\n" % s
    
def usage():
    print "usage: %s [--scheme|--validate-arguments]"
    logging.error("Incorrect Program usage")
    sys.exit(2)

def do_scheme():
    print SCHEME

#read XML configuration passed from splunkd, need to refactor to support single instance mode
def get_input_config():
    config = {}

    try:
        # read everything from stdin
        config_str = sys.stdin.read()

        # parse the config XML
        doc = xml.dom.minidom.parseString(config_str)
        root = doc.documentElement
        conf_node = root.getElementsByTagName("configuration")[0]
        if conf_node:
            logging.debug("XML: found configuration")
            stanza = conf_node.getElementsByTagName("stanza")[0]
            if stanza:
                stanza_name = stanza.getAttribute("name")
                if stanza_name:
                    logging.debug("XML: found stanza " + stanza_name)
                    config["name"] = stanza_name

                    params = stanza.getElementsByTagName("param")
                    for param in params:
                        param_name = param.getAttribute("name")
                        logging.debug("XML: found param '%s'" % param_name)
                        if param_name and param.firstChild and \
                           param.firstChild.nodeType == param.firstChild.TEXT_NODE:
                            data = param.firstChild.data
                            config[param_name] = data
                            logging.debug("XML: '%s' -> '%s'" % (param_name, data))

        checkpnt_node = root.getElementsByTagName("checkpoint_dir")[0]
        if checkpnt_node and checkpnt_node.firstChild and \
           checkpnt_node.firstChild.nodeType == checkpnt_node.firstChild.TEXT_NODE:
            config["checkpoint_dir"] = checkpnt_node.firstChild.data

        if not config:
            raise Exception, "Invalid configuration received from Splunk."

        
    except Exception, e:
        raise Exception, "Error getting Splunk configuration via STDIN: %s" % str(e)

    
    return config



#read XML configuration passed from splunkd, need to refactor to support single instance mode
def get_validation_config():
    val_data = {}

    # read everything from stdin
    val_str = sys.stdin.read()

    # parse the validation XML
    doc = xml.dom.minidom.parseString(val_str)
    root = doc.documentElement

    logging.debug("XML: found items")
    item_node = root.getElementsByTagName("item")[0]
    if item_node:
        logging.debug("XML: found item")

        name = item_node.getAttribute("name")
        val_data["stanza"] = name

        params_node = item_node.getElementsByTagName("param")
        for param in params_node:
            name = param.getAttribute("name")
            logging.debug("Found param %s" % name)
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