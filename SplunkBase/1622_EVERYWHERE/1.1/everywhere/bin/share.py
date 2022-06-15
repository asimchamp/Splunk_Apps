#!/usr/bin/env python
# Copyright 2013 Splunk, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# -*- coding: utf-8 -*-

import httplib, urllib, urllib2, sys, json, csv, StringIO

import splunk.Intersplunk as si
import splunk.entity as entity
import splunk.util, datetime

def llog(level, msg):
   pass

MYAPP = 'everywhere'
HOST = 'jiminiserver.herokuapp.com'
MAX_VALUE_SIZE = 1000

def create_channel(host, publisher, password, channel):
   try:
      # in creating a channel there's the unique id and the label for it. just set them to the same
      params = urllib.urlencode({'provider': publisher, 'password': password, 'id': channel, 'label':channel, 'unit':'', 'tags':''})
      headers = {"Content-type": "application/x-www-form-urlencoded"}
      connection = httplib.HTTPSConnection(host)
      connection.request('POST', '/channels', params, headers)
      response = connection.getresponse()
   except Exception, e:
      llog("Error in creating channel: %s" % e)

def getAuthToken(host, publisher, password, user=None):
   pdict = {"provider":publisher, "password": password}
   if user!=None:
      pdict["user"] = user
   params = urllib.urlencode(pdict)
   headers = {"Content-type": "application/x-www-form-urlencoded"}
   conn = httplib.HTTPSConnection(host)
   conn.request("POST", "/users/auth", params, headers)
   response = conn.getresponse()
   data = response.read()
   conn.close()
   dd = json.loads(data)
   apitoken = dd['token']
   return apitoken



# access the credentials in /servicesNS/nobody/<MyApp>/storage/passwords
# return a list of tuples (publishername, password)
def getCredentials(sessionKey):
   try:
      # list all credentials
      entities = entity.getEntities(['storage', 'passwords'], namespace=MYAPP, owner='nobody', sessionKey=sessionKey)
   except Exception, e:
      raise Exception("Could not get %s credentials from splunk. Error: %s" % (MYAPP, e))
   credentials = []
   for c in entities.values():
      publisher = c['username']
      password = c['clear_password']
      credentials.append((publisher, password))
   if len(credentials) == 0:
      raise Exception("No credentials have been found")  
   return credentials

def send_data(sessionKey, channel, results, chart_info, alarm=False):
   credentials = getCredentials(sessionKey)
   # try each publisher credential, in case there is more than one (the setup.xml script allows creation of more)
   for (publisher, password) in credentials:
      try:
         create_channel(HOST, publisher, password, channel)
         params = urllib.urlencode({'provider': publisher, 'password': password, 'channel':channel, 'type':'alarm' if alarm==True else 'status', 'value':json.dumps([chart_info,results]), 'info': 'New results for %s' % channel})
         headers = {"Content-type": "application/x-www-form-urlencoded"}
         connection = httplib.HTTPSConnection(HOST)
         connection.request('POST', '/alerts', params, headers)
         response = connection.getresponse()
         return response
      except Exception, e:
         pass
   raise Exception('Unable to send data')



g_boring_fields = ['timeendpos', 'timestartpos', 'linecount', 'punct', 'timestamp', 'earliest', 'latest', 'app', 'splunk_server']
def isBoringField(field):
    return field.startswith('_') or field.startswith('date_') or field in g_boring_fields


def isContinuous(results, field):
   try:
      seen = set()
      vals = [float(result[field]) for result in results[:1000] if field in result]
      if len(vals) > 10:
         return True
   except Exception, e:
      pass
   return False
      

def suggestOutput(results, ordered_fields):

   # x axis is first column
   x = ordered_fields[0]
   # other columns are series, ignoring boring fields
   series = [f for f in ordered_fields[1:] if not isBoringField(f)]
   # default type
   type = 'column'

   # if it has percent or count columns, assume it's a top chart.  pick pie or bar   
   if 'count' in ordered_fields or 'percent' in ordered_fields:
      type = 'pie' if len(results) <= 10 else 'bar'

   # if first column is time, use timechart
   elif '_time' in ordered_fields:
      type = 'line'
      x = '_time'
      series = [f for f in ordered_fields if not isBoringField(f)]

   elif isContinuous(results, x):
      type = 'line'

   return {'chart_type':type, 'x-axis':x, 'series':series}


#--------------------------------------------------------------------------------------------------
# COPIED AND MODIFIED THIS SECTION FROM INTERSPLUNK BECAUSE WE NEED TO GET COLUMN ORDERS

MV_ENABLED = True

def readResults(input_buf = None, settings = None, has_header = True):
    '''
    Converts an Intersplunk-formatted file object into a dict
    representation of the contained events.
    '''
    
    if input_buf == None:
        input_buf = sys.stdin

    results = []

    if settings == None:
        settings = {} # dummy

    if has_header:
        # until we get a blank line, read "attr:val" lines, setting the values in 'settings'
        attr = last_attr = None
        while True:
            line = input_buf.readline()
            line = line[:-1] # remove lastcharacter(newline)
            if len(line) == 0:
                break

            colon = line.find(':')
            if colon < 0:
                if last_attr:
                   settings[attr] = settings[attr] + '\n' + urllib.unquote(line)
                else:
                   continue

            # extract it and set value in settings
            last_attr = attr = line[:colon]
            val  = urllib.unquote(line[colon+1:])
            settings[attr] = val

    csvr = csv.reader(input_buf)
    header = []
    first = True
    mv_fields = []
    for line in csvr:
        if first:
            header = line
            first = False
            # Check which fields are multivalued (for a field 'foo', '__mv_foo' also exists)
            if MV_ENABLED:
                for field in header:
                    if "__mv_" + field in header:
                        mv_fields.append(field)
            continue

        # need to maintain field order
        result = splunk.util.OrderedDict()
        i = 0
        for val in line:
            result[header[i]] = val
            i = i+1

        for key in mv_fields:
            mv_key = "__mv_" + key
            if key in result and mv_key in result:
                # Expand the value of __mv_[key] to a list, store it in key, and delete __mv_[key]
                vals = []
                if decodeMV(result[mv_key], vals):
                    result[key] = copy.deepcopy(vals)
                    if len(result[key]) == 1:
                        result[key] = result[key][0]
                    del result[mv_key]

        results.append(result)

    return results, header


def getOrganizedResults(input_str = None):
    '''
    Converts an Intersplunk-formatted file object into a dict
    representation of the contained events, and returns a tuple of:
    
        (results, dummyresults, settings)
        
    "dummyresults" is always an empty list, and "settings" is always
    an empty dict, since the change to csv stopped sending the
    searchinfo.  It has not been updated to store the auth token.
    '''

    settings = {}
    dummyresults = []

    results, fields = readResults(input_str, settings)

    return results, dummyresults, settings, fields

#--------------------------------------------------------------------------------------------------


# only return the first 1000 results to everywhere
PREOP_SEARCH = 'head 1000'

if __name__ == '__main__':
    try:
        (isgetinfo, sys.argv) = si.isGetInfo(sys.argv)
        keywords, options = si.getKeywordsAndOptions()
        if len(keywords) != 1:
            si.generateErrorResults("'channel' argument required.")
            exit(0)
        if isgetinfo:
            #  outputInfo(streaming, generating, retevs, reqsop, preop)
            si.outputInfo(False,      False,      False,   True,   PREOP_SEARCH)
            results = []
        else:
            results, dummyresults, settings, ordered_fields = getOrganizedResults()
            # cast all values to str(). ignore empty values.  seems to prevent problem in sending json
            newresults = []
            for result in results:
               r = {}
               for k,v in result.items():
                  if k == '_time':
                     try:
                        v = splunk.util.getISOTime(datetime.datetime.fromtimestamp(float(v), splunk.util.localTZ))
                     except:
                        pass
                  if v != '' and v != None:
                     r[str(k)] = str(v)[:MAX_VALUE_SIZE]
               newresults.append(r)
            results = newresults
            if len(results) == 0:
               si.generateErrorResults("No search results")
               exit(1)
            chart_info = suggestOutput(results, ordered_fields)
            chart_info = json.dumps(chart_info)

            sessionKey = settings.get("sessionKey", None)
            if sessionKey == None: 
               raise Exception('Could not authenticate to Splunk')
               #import splunk.auth sessionKey = splunk.auth.getSessionKey('admin', 'changeme')

            channel = keywords[0]
            isAlarm = options.get("alert", "true").lower()[0:1] in ["1","y","t"]
            response = send_data(sessionKey, channel, results, chart_info, isAlarm)
            results = [{'response': 'successful'}]
        # output empty/response results
        si.outputResults(results, {})

    except Exception, e:
       raise 
       si.generateErrorResults(e)




