
# encoding = utf-8

import os
import sys
import time
import datetime
import json


MINIMAL_INTERVAL = 30

def validate_input(helper, definition):
    # log response
    DEBUG(helper, 'validate_input')
    
    interval = int(definition.parameters.get('interval')) 
    if interval < MINIMAL_INTERVAL:
        raise ValueError("Interval must be at least {} seconds".format(MINIMAL_INTERVAL))

    start_time = definition.parameters.get('start_time')
    get_start_time(start_time)


def collect_events(helper, ew):
    DEBUG(helper, 'collect_events called')
    
    has_more = True
    while(has_more):
        # call Dropbox API
        cursor = get_cursor(helper)
        #access_token = helper.get_arg('access_token')
        global_account = helper.get_arg("account")
        access_token = global_account["password"]
        start_time = helper.get_arg('start_time')
        category = helper.get_arg('category')
        
        response = send_http_request(helper, cursor, access_token, start_time, category)
        
        # log response
        DEBUG(helper, response)

        # check status code
        if response.status_code != 200:
            ERROR(helper, "%s %s" % (response.status_code, response._content))
            break

        # parse response
        r_json = response.json()
        dropbox_events = r_json['events']
        has_more = r_json['has_more']
        new_cursor = r_json['cursor']
    
        # log num of events
        INFO(helper, "Got {} events. Has more: {}".format(len(dropbox_events), has_more))
    
        # convert all Dropbox-events to Splunk-events
        input_name = helper.get_input_stanza_names()
        index=helper.get_output_index()
        source_type=helper.get_sourcetype()
        for dropbox_event in dropbox_events:
            data = json.dumps(dropbox_event)
            splunk_event = helper.new_event(
                source=input_name, 
                index=index, 
                sourcetype=source_type, 
                data=data,
            )
            ew.write_event(splunk_event)
            
        # update checkpoint
        save_cursor(helper, new_cursor)


def send_http_request(helper, cursor, access_token, start_time, category):
    # fetch configuration params or latest cursor
    url, headers, payload = get_http_request_params(helper, cursor, access_token, start_time, category)

    # call Dropbox API
    response = helper.send_http_request(url, 
                                        'POST', 
                                        parameters=None, 
                                        payload=payload,
                                        headers=headers, 
                                        cookies=None, 
                                        verify=True, 
                                        cert=None,
                                        timeout=30, 
                                        use_proxy=False,
                                        )

    # return response
    return response

def get_http_request_params(helper, cursor, access_token, start_time, category):
    # build url and payload
    
    # if cursor is stored 
    payload = {}
    if cursor:
        dropbox_get_events_url = 'https://api.dropboxapi.com/2/team_log/get_events/continue'
        payload["cursor"] = cursor
    else:
        dropbox_get_events_url = 'https://api.dropboxapi.com/2/team_log/get_events'
        
        # set start time
        start_time_formatted = get_start_time(start_time)
        payload['time']={"start_time": start_time_formatted}

        # set other filters
        if category:
            payload['category'] = category
 
    # set up the Dropbox auth header
    dropbox_headers = {}
    dropbox_headers["Authorization"] = "Bearer " + access_token
    dropbox_headers["Content-Type"] = "application/json"
    
    # return
    return dropbox_get_events_url, dropbox_headers, json.dumps(payload)

def get_cursor(helper):
    cursor_key = _get_checkpoint_key(helper, 'cursor')
    return helper.get_check_point(cursor_key)

def save_cursor(helper, new_cursor):
    cursor_key = _get_checkpoint_key(helper, 'cursor')
    helper.save_check_point(key=cursor_key, state=new_cursor)


def _get_checkpoint_key(helper, key):
    input_name = helper.get_input_stanza_names()
    checkpoint_key = "{}_{}".format(input_name, key)
    return checkpoint_key

def get_start_time(start_time_str):
    if start_time_str:
        try:
            dt = datetime.datetime.strptime(start_time_str, '%Y-%m-%d')
        except ValueError:
            raise ValueError("Incorrect Start Time format. Should be YYYY-MM-DD")
    else:
        dt = datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) - datetime.timedelta(days=90)

    return datetime.datetime.strftime(dt, '%Y-%m-%dT%H:%M:%SZ')

def DEBUG(helper, msg):
    helper.log_debug(log_message(helper, msg))

def INFO(helper, msg):
    helper.log_info(log_message(helper, msg))

def ERROR(helper, msg):
    helper.log_error(log_message(helper, msg))

def log_message(helper, msg):
    input_name = helper.get_input_stanza_names()
    message = "%s %s" % (input_name, str(msg))
    return message


