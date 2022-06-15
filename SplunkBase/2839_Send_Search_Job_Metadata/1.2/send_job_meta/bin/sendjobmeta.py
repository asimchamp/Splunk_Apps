import splunk.Intersplunk as si
import splunk.mining.dcutils as dcu

import json
import socket
import csv

import sys
import splunk.search as search
import splunk.entity as entity
from splunk.rest import simpleRequest

DEFAULT_IP = "fwd1.parallelpiper.splunkcloud.com"
DEFAULT_PORT = 9997
        
def sendData(results, settings):
    keywords, argvals = si.getKeywordsAndOptions()

    namespace       = settings['namespace']
    owner           = settings['owner']
    sessionKey      = settings['sessionKey']
    sid             = settings['sid']

    server_ip = DEFAULT_IP
    server_port = DEFAULT_PORT

    if argvals.get('ip'):
        server_ip = argvals.get('ip')
    if argvals.get('port'):
        try:
            server_port = int(argvals.get('port'))
        except Exception, e:            
            si.generateErrorResults('Invalid value for port')
            sys.exit(-1)
            
    jobResponseHeaders = {} 
    jobResponseBody = { 
        'entry': [
            {
                'content': {}
            }
        ]
    }
    if sid: 
        uriToJob = entity.buildEndpoint(
            [
                'search', 
                'jobs', 
                sid
            ], 
            namespace=namespace, 
            owner=owner
        )
        jobResponseHeaders, jobResponseBody = simpleRequest(uriToJob, method='GET', getargs={'output_mode':'json'}, sessionKey=sessionKey)
    
    searchJob         = json.loads(jobResponseBody)
    jobContent        = searchJob['entry'][0]['content']

    # add results into jobContent object
    jobContent['results'] = []
    for rwt in results:
        jobContent['results'].append(dict(rwt)) # need to convert or else json.dumps doesn't work

    # send to tcp port
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((server_ip, server_port))
        s.send(json.dumps(jobContent))
        s.close()
    except Exception, e:
        si.generateErrorResults('%s while sending data to %s:%d' % (str(e), server_ip, server_port))
        sys.exit(-1)

    return results

settings = {}

results = si.readResults(None, settings)

try:
    results = sendData(results, settings)
except Exception, e:
    si.generateErrorResults(str(e))
    sys.exit(-1)
    
si.outputResults(results)
