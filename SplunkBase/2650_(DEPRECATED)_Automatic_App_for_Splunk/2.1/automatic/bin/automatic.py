#####
# automatic.py
# Author: Burch
# burch@splunk.com
# Credits: Damien Dallimore for providing the examples, support, and a shoulder to cry on.
#####

import sys, os, re
import xml.dom.minidom, xml.sax.saxutils
import logging
import requests, json, time
#from splunklib.client import connect
#from splunklib.client import Service
import splunklib.client as client


###
#Logging
###
# Requests/http deep 
try:
    import http.client as http_client
except ImportError:
    # Python 2
    import httplib as http_client
http_client.HTTPConnection.debuglevel = 0

# You must initialize logging, otherwise you'll not see debug output.
#logging.basicConfig() 
#logging.getLogger().setLevel(logging.DEBUG)
requests_log = logging.getLogger("requests.packages.urllib3")
requests_log.setLevel(logging.INFO)
requests_log.propagate = True

# set up logging suitable for splunkd consumption
logging.root
logging.root.setLevel(logging.INFO)
formatter = logging.Formatter('%(levelname)s %(message)s')
handler = logging.StreamHandler(stream=sys.stderr)
handler.setFormatter(formatter)
logging.root.addHandler(handler)


###
#Static Variables
###
URL_API = "https://api.automatic.com/"
URI_DEVICE = "device"
URI_TRIP = "trip"
URI_USER = "user/me"
URI_VEHICLE = "vehicle"
AUTH_PREFIX = "bearer "
PARAMS = "limit=250"
global config
time_format = "%Y-%m-%dT%H:%M:%S.%fZ" #Example: "2014-08-16T00:37:32.120000Z"
time_format_regex = "\:\d{2}\.\d{6}Z$"


####
# Scheme Definition
###
SCHEME = """<scheme>
    <title>Automatic Car Data</title>
    <description>Automatic API input</description>
    <streaming_mode>xml</streaming_mode>
    <use_external_validation>true</use_external_validation> 
    <endpoint>
        <args>    
            <arg name="name">
                <title>Name</title>
                <description>Name your Automatic API input. Tip: Use the application name from https://developer.automatic.com/my-apps</description>
                <required_on_edit>true</required_on_edit>
                <required_on_create>true</required_on_create>
            </arg>
            <arg name="access_token">
                <title>Access Token</title>
                <description>Insert the access_token provided by http://automatic-oauth-example-nodejs.herokuapp.com</description>
                <required_on_edit>false</required_on_edit>
                <required_on_create>true</required_on_create>
            </arg>
            <arg name="start_seed_epoch">
                <title>Starting Epoch Time</title>
                <description>An epoch time from which this input should start pulling data from. Default of 0 pulls data from all time. [Changing this is uncommon]</description>
                <required_on_edit>false</required_on_edit>
                <required_on_create>true</required_on_create>
            </arg>
        </args>
    </endpoint>
</scheme>
"""

###
# Checkpoint Class
###
#Copied from GVoice app - thank you!
class Checkpoint(object):
    def __init__(self, cpFile):
        self.cpFile = cpFile
        return

    def loadCheckpoint(self):
        if not os.path.exists(self.cpFile):
            return "0"
        with file(self.cpFile, 'r') as f:
            return int(f.readline())

    def saveCheckpoint(self, cp):
        cp = str(cp)
        with file(self.cpFile, 'w') as f:
            f.write(cp)
        return


###
# Function/Method Definition
###
# Create base URL
def create_base_url(object):
    logging.debug("create_base_url: Entered")
    URL = URL_API + object + "/?" + "&" + PARAMS
    if object == URI_TRIP:
        URL = URL + "&ended_at__gte=" + str(get_start_epoch())
    return URL

# Create header sring
def create_header():
    logging.debug("create_header: Entered")
    return {'Authorization': AUTH_PREFIX + config["access_token"]}

# Introspection scheme print to stdout
def do_scheme():
    logging.debug("do_scheme: Entered")
    print SCHEME
    logging.debug("do_scheme: Exited")

# Validation of configuration keys
def validate_conf_key(key):
    logging.debug("validate_conf_key: Entered")
    if key not in config:
        raise Exception, "Invalid configuration received from Splunk: key '%s' is missing." % key
    logging.debug("validate_conf_key: Exited")

#Gets session connection info 
def assign_session_input(root,item):
    logging.debug("assign_session_input: Entered")

    node = root.getElementsByTagName(item)[0]
    if node and node.firstChild and node.firstChild.nodeType == node.firstChild.TEXT_NODE:
        config[item] = node.firstChild.data
        logging.debug("assign_session_input: '%s' -> '%s'" % (item, node.firstChild.data))

    logging.debug("assign_session_input: Exited")

# Resolve the point in time to start from
def get_start_epoch():
    logging.debug("get_start_epoch: Entered")
    return max( Checkpoint( os.path.join(config["checkpoint_dir"], 'cp') + "_" + config["access_token"].split("://").pop() ).loadCheckpoint() , int(config["start_seed_epoch"]) )

#Update the checkpoint time
def set_checkpoint(checkpoint_epoch):
    #Instructions to clear checkpoint: http://docs.splunk.com/Documentation/Splunk/latest/AdvancedDev/ModInputsCheckpoint
    logging.debug("set_checkpoint: Entered to set time at: " + str(checkpoint_epoch))
    Checkpoint( os.path.join(config["checkpoint_dir"], 'cp') + "_" + config["access_token"].split("://").pop() ).saveCheckpoint(checkpoint_epoch)

#Translates human readable time to epoch
def convert_time_to_epoch(timestamp):
    logging.debug("convert_time_to_epoch: Entered with timestamp=" + timestamp)

    if not re.search( time_format_regex , timestamp ):
        logging.debug("convert_time_to_epoch: Modifying timestamp")
        timestamp = timestamp[:-1] + ".000000Z"
    return int(time.mktime(time.strptime(timestamp, time_format)))

## Update conf file with most recent end time
# NOT USED ANYMORE. Hanging onto code for now.
def update_checkpoint_vestigial():
    logging.debug("update_checkpoint: Entered")

    # builds some variables before getting into the action
    port = config["server_uri"].split(':').pop()
    #args = {'host':'localhost','port':port,'token':config["session_key"]}
    args = {'username':'admin','password':'changeme'}
    modinput_name = config["name"].split("://").pop()

    try:
        logging.debug("update_checkpoint: arguments for splunk service: " + str(args))
        service = client.connect(**args) #for cmd line debugging
        #service = connect(**args)
        #service = Service(host='localhost', port='8089', username='admin', password='changeme')
        #service = Service(**args)
        
        automatic_input = service.inputs.__getitem__(modinput_name)
        logging.debug("update_checkpoint: Object found: " + json.dumps(automatic_input.content)) 
        automatic_input.update(checkpoint_epoch="500")

        #service.logout()
    except RuntimeError,e:
        logging.error("Looks like an error updating the modular input parameter checkpoint_epoch: %s" % (str(e),))
    
    logging.debug("update_checkpoint: Exited")

# Validate configuration and if fail, exit with error code to stdout
def do_validate():
    logging.debug("do_validate: Entered")

    logging.debug("do_validate: Fetching config")

    # read everything from stdin
    val_str = sys.stdin.read()

    # parse the validation XML
    doc = xml.dom.minidom.parseString(val_str)
    root = doc.documentElement

    logging.debug("do_validate: found items")
    item_node = root.getElementsByTagName("item")[0]
    if item_node:
        logging.debug("do_validate: found item")

        name = item_node.getAttribute("name")
        config["stanza"] = name

        params_node = item_node.getElementsByTagName("param")
        for param in params_node:
            name = param.getAttribute("name")
            logging.debug("Found param %s" % name)
            if name and param.firstChild and \
               param.firstChild.nodeType == param.firstChild.TEXT_NODE:
                config[name] = param.firstChild.data

    logging.debug("do_validate: Exited")

# Read XML Config from inputs.conf
def get_input_config():
    logging.debug("get_input_config: Entered")

    try:
        # read everything from stdin
        config_str = sys.stdin.read()
        logging.debug("get_input_config: input payload: " + config_str )

        # parse the config XML
        doc = xml.dom.minidom.parseString(config_str)
        root = doc.documentElement
        conf_node = root.getElementsByTagName("configuration")[0]
        if conf_node:
            logging.debug("get_input_config: found configuration")
            stanza = conf_node.getElementsByTagName("stanza")[0]
            if stanza:
                stanza_name = stanza.getAttribute("name")
                if stanza_name:
                    logging.debug("get_input_config: found stanza " + stanza_name)
                    config["name"] = stanza_name

                    params = stanza.getElementsByTagName("param")
                    for param in params:
                        param_name = param.getAttribute("name")
                        logging.debug("get_input_config: found param '%s'" % param_name)
                        if param_name and param.firstChild and \
                           param.firstChild.nodeType == param.firstChild.TEXT_NODE:
                            data = param.firstChild.data
                            config[param_name] = data
                            logging.debug("get_input_config: '%s' -> '%s'" % (param_name, data))

        for prop in {"server_host", "server_uri", "session_key", "checkpoint_dir"}:
            assign_session_input(root, prop)

        if not config:
            raise Exception, "Invalid configuration received from Splunk."

        # just some validation: make sure these keys are present (required)
        for prop in {"name", "access_token", "start_seed_epoch"}:
            validate_conf_key(prop)

    except Exception, e:
        raise Exception, "Error getting Splunk configuration via STDIN: %s" % str(e)

    logging.debug("get_input_config: Exited")

# Create result set
def create_result_set(url):
    # Recursive. If there's a URL value, then make the call. If not, then return an null set

    # Make http call and then use the results
    payload = make_http_request(url)
    next_page = [] #base case: empty list

    if payload['_metadata']['next']:
        next_page = create_result_set(payload['_metadata']['next'])

    return payload['results'] + next_page

# Make HTTP Request
def make_http_request(url):
    logging.debug("make_http_request: Entered")

    r = ""

    try:
        logging.debug("make_http_request: Forming request string")
    
        r = requests.get(url, headers=create_header())
        
        r.raise_for_status()        
   
    except Exception as e:
        logging.error("make_http_request: Exception performing request: %s" % str(e))

    
    logging.debug("make_http_request: Exited")
    return r.json()


# Process each event
def process_results(data):
    logging.debug("process_results: Entered with result_count="+str(len(data)))

    cp_end_time = get_start_epoch()
    logging.info("process_results: cp_end_time=" + str(cp_end_time) )

    #Trip data
    for event in reversed(data):
        if "ended_at" in event:
            logging.info("process_results: processing result=" + event["url"] )
            #Parse/transform some data
            recent_end_time = convert_time_to_epoch(event["ended_at"])
            vehicle = re.search('\/([^\/]+)\/?$' , str(event["vehicle"]) ).group(1)

            logging.debug("process_results: cp_end_time=" + str(cp_end_time) + " recent_end_time=" + str(recent_end_time) + " vehicle=" + str(vehicle))
            if ( int(recent_end_time) > int(cp_end_time) ):
                logging.debug("process_results: adding event " + event["url"])
                print "<stream><event><time>" + str(recent_end_time) + "</time><host>" + str(vehicle) + "</host><sourcetype>automatic_trip</sourcetype><data>" + json.dumps(event) + "</data><done/></event></stream>"
                cp_end_time = recent_end_time

    #Update trip checkpoint
    logging.debug("process_results: finishing cp_end_time=" + str(cp_end_time) )
    set_checkpoint(cp_end_time)

    #Vehicle data (doesn't need a checkpoint)
    for event in reversed(data):
        if "updated_at" in event:
            logging.info("process_results: processing result=" + event["url"] )
            logging.debug("process_results: adding event " + event["url"])
            print "<stream><event><time>" + str(convert_time_to_epoch(event["updated_at"])) + "</time><host>" + str(event["id"]) + "</host><sourcetype>automatic_vehicle</sourcetype><data>" + json.dumps(event) + "</data><done/></event></stream>"


    logging.debug("process_results: Exited")


# Routine to index data
def do_run():
    logging.debug("do_run: Entered")

    logging.debug("do_run: Loading config")
    get_input_config()

    #logging.debug("do_run: Update checkpoint")
    #update_checkpoint()

    logging.debug("do_run: Build data payload")
    data = create_result_set(create_base_url(URI_TRIP)) + create_result_set(create_base_url(URI_VEHICLE))

    logging.debug("do_run: Process and index data payload")
    process_results(data)

    logging.debug("do_run: Exited")
    
###
# Main
###
# Script must implement these args: scheme, validate-arguments
if __name__ == '__main__':
    config = {}

    if len(sys.argv) > 1:
        if sys.argv[1] == "--scheme":
            do_scheme()
        elif sys.argv[1] == "--validate-arguments":
            do_validate()
        else:
            pass
    else:
        do_run()

    sys.exit(0)
