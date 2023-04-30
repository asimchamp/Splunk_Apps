import sys
import csv, gzip
import os
import splunk.entity as en
import urllib
import time

def openany(p):
    if p.endswith(".gz"):
        return gzip.open(p)
    else:
        return open(p)

def postMessage(text):
    msg = en.getEntity('/admin/messages','_new', sessionKey=sessionKey)
    msg["name"] = 'whosthere_' + str(time.time()).replace('.','')
    msg["value"] = text
    msg.owner = '-'
    msg.namespace = '-'
    en.setEntity(msg, sessionKey=sessionKey)
        
if __name__ == '__main__':
    try:
        sessionKey = urllib.unquote(sys.stdin.readline().split('=')[1])
        event_count = int(sys.argv[1])  # number of events returned.
        results_file = sys.argv[8]      # file with search results

        if event_count > 0:
            users = csv.DictReader(openany(results_file))
            for row in users:
                user = row['user']
                clientip = row['clientip']
                timeAccessed = row['epochTimeAccessed']
                
                text = 'User %s has logged in from %s [[/app/whosthere/user_activity?earliest=%s&latest=now&form.username=%s|See details]]' % (user, clientip, timeAccessed, user)
                
                postMessage(text)
            

    except Exception, e:
        import traceback
        stack =  traceback.format_exc()
        si.generateErrorResults("Error '%s'" % e)
        
