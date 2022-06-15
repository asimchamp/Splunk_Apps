
# encoding = utf-8

import ipaddress
import time
import json
from functools import lru_cache
import requests

def is_ip_address(candidate):
    try:
        ipaddress.ip_address(candidate)
    except Exception as e:
        return False
    return True

@lru_cache()
def query_api(helper, url, api_key):

    response = helper.send_http_request(url, "get", headers={"Authorization": api_key})
    response.raise_for_status()
    res_json = response.json()
    return res_json

def process_event(helper, *args, **kwargs):
    helper.log_info("Retrieving API Key")

    api_key = helper.get_global_setting("api_key")
    
    helper.log_info("Retrieved API Key from settings")
    
    api_url = "https://api.emergingthreats.net/v1"
    
    query_type = "ips"
    query_endpoints = ["reputation", "samples", "domains", "events"]

    events = helper.get_events()

    for event in events:
        field_to_check = helper.get_param("object")
        object_to_check = event[field_to_check]
        helper.log_info("retrieved object")
        
        if not is_ip_address(object_to_check):
            helper.log_info("Object is not IP address, performing domain lookup")
            query_type = "domains"
            query_endpoints = ["reputation", "samples", "ips", "events"]
    
    
        results = {}
        for endpoint in query_endpoints:
            url = "{}/{}/{}/{}".format(api_url, query_type, object_to_check, endpoint)
            
            res_json = query_api(helper, url, api_key)

            if res_json.get("success"):
                results.update({'query_value': object_to_check})
                results.update({'_time': time.strftime('%Y-%m-%dT%H:%M:%S')})
                # limit results
                results.update({endpoint: res_json['response'][:50]})
    
    
        sourcetype = "proofpoint:checket:ar"
        helper.addevent(json.dumps(results), sourcetype=sourcetype)
        helper.writeevents(index="main", host="localhost", source="localhost")


    """
    # IMPORTANT
    # Do not remove the anchor macro:start and macro:end lines.
    # These lines are used to generate sample code. If they are
    # removed, the sample code will not be updated when configurations
    # are updated.

    [sample_code_macro:start]

    # The following example gets and sets the log level
    helper.set_log_level(helper.log_level)

    # The following example gets the setup parameters and prints them to the log
    api_key = helper.get_global_setting("api_key")
    helper.log_info("api_key={}".format(api_key))
    authorization_code = helper.get_global_setting("authorization_code")
    helper.log_info("authorization_code={}".format(authorization_code))

    # The following example gets the alert action parameters and prints them to the log
    object = helper.get_param("object")
    helper.log_info("object={}".format(object))


    # The following example adds two sample events ("hello", "world")
    # and writes them to Splunk
    # NOTE: Call helper.writeevents() only once after all events
    # have been added
    helper.addevent("hello", sourcetype="sample_sourcetype")
    helper.addevent("world", sourcetype="sample_sourcetype")
    helper.writeevents(index="summary", host="localhost", source="localhost")

    # The following example gets the events that trigger the alert
    events = helper.get_events()
    for event in events:
        helper.log_info("event={}".format(event))

    # helper.settings is a dict that includes environment configuration
    # Example usage: helper.settings["server_uri"]
    helper.log_info("server_uri={}".format(helper.settings["server_uri"]))
    [sample_code_macro:end]
    """
    return 0
