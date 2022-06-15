#define token functions for substitution in endpoint URL
#/someurl/foo/$sometoken$/goo -> /someurl/foo/zoo/goo

# functions can return a scalar or a list
# if a scalar is returned , then a single URL request will be made
# if a list is returned , then (n) URL requests will be made , where (n) is the 
# length of the list
# multiple requests will get executed in parallel threads

from builtins import str
from builtins import range
import datetime
import requests_wrapper.requests as requests
requests.urllib3.disable_warnings(requests.urllib3.exceptions.InsecureRequestWarning)
import json
import responsehandlers
import isilon_logger_manager as log
import sys
import re
import isilon_utilities as utilities
from pytz import timezone


#set up logging
logger = log.setup_logging('emc_isilon')

def _get_count_from_endpoint(path, cookie, req_args, node):
    csrf = cookie.get('isicsrf')
    sessid = cookie.get('isisessid')
    if csrf:
        headers = {'X-CSRF-Token': str(csrf), 'Cookie': "isisessid=" + str(sessid), 'Referer': 'https://'+ str(node) + ':8080'}
        response = requests.get(path,headers=headers,**req_args)
    else:
        response = requests.get(path,cookies=cookie,**req_args)
    response.raise_for_status()
    response_json = json.loads(response.text, object_hook = responsehandlers._decode_dict)
    count = max([ stat_rec['value'] for stat_rec in response_json['stats']])
    return count

def get_count(path, cookie, node, req_args):
    try:        
        count_endpoint = path.rsplit('.',2)[0]
        actual_endpoint = path.split('$',1)[0] 
        url_params = path.rsplit('&',1)[1] if '&' in path else None
        endpoint_list = []
        count_endpoint = count_endpoint+'.count'
        count =_get_count_from_endpoint(count_endpoint, cookie, req_args, node)
        for y in range(int(count)):
            end_point = actual_endpoint + str(y)
            if url_params != None:
                end_point = end_point + "&" + url_params
            endpoint_list.append(end_point)
        return endpoint_list
    except Exception as e:
        e = sys.exc_info()[1]
        logger.error("Dell Isilon Error: Looks like an error while getting count for endpoint %s : %s" % (str(e), path))
        return []

def get_version(path, cookie, req_args, node):
    try:
        csrf = cookie.get('isicsrf')
        sessid = cookie.get('isisessid')
        if csrf:
            headers = {'X-CSRF-Token': str(csrf), 'Cookie': "isisessid=" + str(sessid), 'Referer': 'https://'+ str(node) + ':8080'}
            response = requests.get(path,headers=headers,**req_args)
        else:
            response = requests.get(path,cookies=cookie,**req_args)
        response_json = json.loads(response.text, object_hook = responsehandlers._decode_dict)
        version =response_json['onefs_version']['release']
        timezone = response_json['timezone']['path']
        result = {'version': version, 'timezone': timezone}
        return result
    except Exception as e:
        logger.error("Dell Isilon Error: Error while getting version from request call. %s %s" % (str(e), path))
        raise

def get_events_from_version(path, cookie, node, req_args):
    version_check_path = path.split('/platform')[0] + '/platform/1/cluster/config'
    result = get_version(version_check_path, cookie, req_args, node)
    version = re.findall('[0-9]+', result.get('version'))
    if version and version[0]=='7':
        path = path.split('/platform')[0] +'/platform/2/event/events?begin={TIME}'
    elif version and version[0]=='8':
        path = path.split('/platform')[0] +'/platform/3/event/eventlists?begin={TIME}'
    
    timezone= result.get('timezone','')   
    path = _replace_token_time(path, node, req_args, timezone)
    return [path]
    
# Replaces {TIME} token with respective value
def _replace_token_time(path, node, req_args, time_zone):
    file_data = None
    auth = req_args.get('auth')
    try:
        filename = "last_call_info.pos"
        tzone = _get_timezone(node, auth, time_zone, filename)
        tz = timezone(tzone)
        now = datetime.datetime.now(tz = tz)
        epoch = datetime.datetime(1970, 1, 1, tzinfo = tz)
        ts_now = int((now - epoch).total_seconds())
        file_data = utilities._read_meta_info(filename)
        if file_data != -1:
            if file_data.get('LAST_CALL_TIME') != None:
                if file_data.get('LAST_CALL_TIME').get(node) != None:
                    path = path.format(TIME = file_data.get('LAST_CALL_TIME').get(node))
                    file_data['LAST_CALL_TIME'][str(node)] = ts_now
                    utilities._write_meta_info(file_data, filename)
                else:
                    file_data['LAST_CALL_TIME'][str(node)] = ts_now
                    utilities._write_meta_info(file_data, filename)
                    path = path.format(TIME = ts_now)
            else:
                file_data['LAST_CALL_TIME'] = {}
                file_data['LAST_CALL_TIME'][str(node)] = ts_now
                utilities._write_meta_info(file_data, filename)
                path = path.format(TIME = ts_now)
        else:
            file_data = _read_meta_info()
            if file_data == -1: 
                file_data = {}
            file_data['LAST_CALL_TIME'] = {}
            file_data['LAST_CALL_TIME'][str(node)] = ts_now
            utilities._write_meta_info(file_data, filename)
            path = path.format(TIME = ts_now)
        return path
    except Exception as e:
        logger.error("Dell Isilon Error: Error reading last call time. %s" % str(e))
        raise
    
    
# Get timezone from node
def _get_timezone(node, auth, time_zone, filename):
    try:
        tzone = ""
        file_data = utilities._read_meta_info(filename)
        if file_data != -1:
            if file_data.get('TZ') != None:
                if file_data.get('TZ').get(str(node)) != None:
                    tzone = file_data.get('TZ').get(str(node))
                else:
                    tzone = file_data['TZ'][str(node)] = time_zone
                    utilities._write_meta_info(file_data, filename)
            else:
                file_data['TZ'] = {}
                tzone = file_data['TZ'][str(node)] = time_zone
                utilities._write_meta_info(file_data, filename)
        else:
            tzone = time_zone
            file_data = {}
            file_data['TZ'] = {}
            file_data['TZ'][str(node)] = tzone
            utilities._write_meta_info(file_data, filename)
        return tzone
    except Exception as e:
        logger.error("Dell Isilon Error: Error while getting timezone : %s from node %s" % (str(e), node))
        raise

def get_ad_domains(path, cookie, node, req_args):
    endpoint_list = []
    try:
        get_ad_path = path.split('/platform')[0] + '/platform/1/auth/providers/ads'
        csrf = cookie.get('isicsrf')
        sessid = cookie.get('isisessid')
        if csrf:
            headers = {'X-CSRF-Token': str(csrf), 'Cookie': "isisessid=" + str(sessid), 'Referer': 'https://'+ str(node) + ':8080'}
            response = requests.get(get_ad_path,headers=headers,**req_args)
        else:
            response = requests.get(get_ad_path,cookies=cookie,**req_args)
        response_json = json.loads(response.text, object_hook = responsehandlers._decode_dict)
        for _,value in response_json.items():
            for valuelist in value:
                ad_name = valuelist.get('id')
                endpoint = path.replace("$get_ad_domains$", str(ad_name))
                endpoint_list.append(endpoint)
        return endpoint_list
    except Exception as e:
        e = sys.exc_info()[1]
        logger.error("Dell Isilon Error: Looks like an error while getting list of Active directory domains %s : %s" % (str(e), path))
        return []
