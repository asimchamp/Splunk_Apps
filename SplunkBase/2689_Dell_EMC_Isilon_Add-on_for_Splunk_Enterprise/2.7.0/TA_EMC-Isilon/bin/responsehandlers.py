from __future__ import print_function
#add your custom response handler class to this module
from builtins import str
from builtins import range
from builtins import object
import json
import datetime
import isilon_logger_manager as log
import re
import sys


#set up logging
logger = log.setup_logging('emc_isilon')

class IsilonEventResponseHandler(object):

    def __init__(self):
        pass
    
    def __call__(self,raw_response_output,response_type,node,endpoint):
        if response_type == "json":        
            output = json.loads(raw_response_output)
            json_type = type(output)
            if json_type == list:
                output =self._parse_json_list(node,endpoint,output)
            if json_type == dict:
                output =self._parse_json_dict(node,endpoint,output)
        else:
            print_xml_stream(raw_response_output)
    
    # Parse JSON Response - Dictionary objects
    def _parse_json_dict(self, node,path,response_json):
        listdataKeys=list(response_json.keys())
        response_dict = {}
        
        currentTime= datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S%z')
        for j in range(len(listdataKeys)):
            if listdataKeys[j]=='eventlists':
                for element in response_json[listdataKeys[j]]:
                    event_element = element.get('events',None)
                    response_event_json={}
                    for event in event_element:
                       response_event_json={'events': event,"timestamp":currentTime,"node":node,"namespace":"event"}
                       print_xml_stream(json.dumps(response_event_json))

class IsilonResponseHandler(object):

    def __init__(self):
        pass
        
    def __call__(self,raw_response_output,response_type,node,endpoint):
        namespace=self._get_namespace(endpoint)
        if response_type == "json": 
            output = json.loads(raw_response_output)
            json_type = type(output)
            if json_type == list:
                output =self._parse_json_list(node,endpoint,output,namespace)
            if json_type == dict:
                output =self._parse_json_dict(node,endpoint,output,namespace)
        else:
            print_xml_stream(raw_response_output)

        
    # Gets namespace from the path / uri
    def _get_namespace(self, path):
        regex_obj = re.search("\/platform\/\d+\/(\w+)(\/\w+)?", path, re.I)
        namespace = None
        if regex_obj:
            namespace = regex_obj.group(1)
        else:
            logger.error("Dell Isilon Error: Not able to get namespace for path=" + str(path))
        return namespace
    
    
    # Parse JSON Response -  List
    def _parse_json_list(self, node, path, response_json,namespace):
        currentTime = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S%z')
        path=path.split("/platform")
        path = '/platform'+path[1] if path and len(path)>0 else None
        if path == '/platform/1/cluster/external-ips':
            array_length = len(response_json)
            for j in range(array_length):
                response_dict = {"timestamp":currentTime, "devId":j+1,"ipAddress":response_json[j], "node":node, "namespace":namespace}
                print_xml_stream(json.dumps(response_dict))
        else:
            print_xml_stream(json.dumps(response_json))

    # Parse JSON Response - Dictionary objects
    def _parse_json_dict(self, node,path,response_json,namespace):
        dataKeys=list(response_json.keys())
        response_dict = {}
        currentTime= datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S%z')
        if namespace in ["statistics", "shares", "storagepool", "protocols", "zones", "event", "license", "auth"]:
            for i in range(len(dataKeys)):
                if dataKeys[i]!='resume':
                    key = response_json[dataKeys[i]]
                    check_type = type(key)
                    if check_type != list:
                        response_dict = {"timestamp":currentTime,dataKeys[i]:(response_json[dataKeys[i]]),"node":node,"namespace":namespace}
                        print_xml_stream(json.dumps(response_dict))
                    if check_type == list:
                        array_length = len(response_json[dataKeys[i]])
                        for j in range(array_length):
                            response_dict = {"timestamp":currentTime,dataKeys[i]:(response_json[dataKeys[i]])[j],"node":node,"namespace":namespace}
                            print_xml_stream(json.dumps(response_dict))
        else:
            response_json['timestamp'] = currentTime
            response_json['node'] = node
            response_json['namespace'] = namespace
            print_xml_stream(json.dumps(response_json))

#HELPER FUNCTIONS
    
# prints XML stream
def print_xml_stream(s):
    print("<stream><event unbroken=\"1\"><data>%s</data><done/></event></stream>" % encodeXMLText(s))



def encodeXMLText(text):
    text = text.replace("&", "&amp;")
    text = text.replace("\"", "&quot;")
    text = text.replace("'", "&apos;")
    text = text.replace("<", "&lt;")
    text = text.replace(">", "&gt;")
    text = text.replace("\n", "")
    return text


def _decode_list(data):
    rv = []
    for item in data:
        if isinstance(item, str) and sys.version_info[0] < 3:
            item = item.encode('utf-8')
        elif isinstance(item, list):
            item = _decode_list(item)
        elif isinstance(item, dict):
            item = _decode_dict(item)
        rv.append(item)
    return rv


def _decode_dict(data):
    rv = {}
    for key, value in data.items():
        if isinstance(key, str) and sys.version_info[0] < 3:
            key = key.encode('utf-8')
        if isinstance(value, str) and sys.version_info[0] < 3:
            value = value.encode('utf-8')
        elif isinstance(value, list):
            value = _decode_list(value)
        elif isinstance(value, dict):
            value = _decode_dict(value)
        rv[key] = value
    return rv