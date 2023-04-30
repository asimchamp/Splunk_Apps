import sys, time, re, os, json

import splunk.auth
import splunk.search
import splunk.entity as en
import splunk.bundle as bundle
import splunk.rest as rest

import logging
logger = logging.getLogger('tagger')

VERSION_STRING = "1.1" # need to get out of app.conf
MAX_WILLING_TO_SHOW = 1000

def log(msg):
   return
   with open("/tmp/foo.txt", "a") as f:
        f.write("%s\n" % msg)

   
class ModelException(Exception):
   pass

class ModelManager:
    def __init__(self):
        self._cookieSessions = {}

    def getModel(self, cookie, namespace, owner, sessionKey):
        
        # if we have a new cookie
        if not cookie in self._cookieSessions:
            # delete old models
            self.cleanInvalidModels()
            # add new sessionKey->model mapping
            self._cookieSessions[cookie] = Model(namespace, owner, sessionKey)

        return self._cookieSessions[cookie]

    def cleanInvalidModels(self):
        # clean up old sessionKeys
        # for each cookie/model
        for cookie, model in self._cookieSessions.items():
            # delete if sessionKey is no longer valid (expired)           
            if not splunk.auth.ping(sessionKey=model._sessionKey):
               del self._cookieSessions[cookie]               
        

class Model:
 
    def __init__(self, namespace, owner, sessionKey):
        self._sessionKey = sessionKey
        self._owner = owner
        self._restrictionSearch = ''
        self._restrictionType = "sourcetype"
        self._restrictionValues = None
        self._restrictionValue = None
        self._events = []
        self._eventsDirty = True

        self._id = None

        self._apps = None
        self.getAppsList()
        self._app = 'system'
        self.setCurrentApp('system') #default

        self._getGroupByType = self.getGroupByTypes()[0]


        self._sourceField = "_raw"            
        self._sourceFields = [] 
        self._fieldValues = []
        self._fieldCoverage = {}


    def version(self):
        return VERSION_STRING

    def getRestrictionSearch(self):
       return self._restrictionSearch
       
    def setRestrictionSearch(self, q):
       if q != self._restrictionSearch:
          self._restrictionSearch = q
          self.resetEvents()


    def getRestrictionTypes(self):
        return ["sourcetype", "source", "host"]

    def getRestrictionType(self):
        return self._restrictionType

    # returns true if value changed
    def setRestrictionType(self, rtype, force=False):
        if rtype not in self.getRestrictionTypes():
            raise ModelException("Unknown restriction type: %s" % rtype)
        
        if not force and self._restrictionType == rtype:
            return False

        log("RESET EVENTS2")
        self.resetEvents()                   
        self._restrictionValue = None #not first -- self.getRestrictionValues(rtype)[0]
        self._restrictionType = rtype
        self._restrictionValues = None        
        return True
        
    def getRestrictionValues(self, rtype):
        if rtype not in self.getRestrictionTypes():
            raise ModelException("Unknown restriction type: %s" % rtype)

        # cached
        if self._restrictionValues != None:
           return self._restrictionValues

        rsearch = '|metadata type=%ss index=* | search NOT sourcetype="*too_small" | sort -lastTime | head 500 | table %s' % (rtype, rtype)
        log("getRestrictionValue: %s" % rsearch)
        results = splunk.search.searchAll(rsearch, sessionKey=self._sessionKey)
        if results == None:
            values = [None]
        else:
            values = [str(result[rtype]) for result in results]
        ##if self.getRestrictionValue() == "*":
        ##   self.setRestrictionValue(None) # not first -- values[0])
        if len(values) == 1:
            self.setRestrictionValue(values[0])
            
        self._restrictionValues = values
        return values


    # returns true if value changed
    def setRestrictionValue(self, val):
        if self._restrictionValue == val:
            return False
        log("RESET EVENTS3")        
        self.resetEvents()                   
        self._restrictionValue = val
        return True
    
    def getRestrictionValue(self):
        return self._restrictionValue



    ############################### APP SETTINGS #################
    def setCurrentApp(self, app):
        if app == self._app:
            return False
        if app not in self._apps:
             raise ModelException("Ignoring unknown app '%s'" % app)
        self._app = app
        return True

    def getCurrentApp(self):
        return self._app
        
    def getAppsList(self):
        if self._apps == None:
            self._apps = splunk.entity.getEntities('apps/local', search='visible=1 AND disabled=0', namespace=None, owner=self._owner, count=-1).keys()
            self._apps.insert(0,'system')
        return self._apps


    def getFieldCoverage(self):
       if len(self._fieldCoverage) == 0:
          self._sourceFields = []
          self.getSourceFields()
       return self._fieldCoverage


    #######################################################################################################
    def isBoringField(self, k):
       return k.startswith("_") or k.startswith('date_') or k in ['timeendpos', 'timestartpos', 'index', 'punct', 'splunk_server']

    # WHICH FIELD TO EXTRACT ON.  Used when writing out EXTRACT-foo = <regex> (in <sourcefield>)
    def getSourceFields(self):
       if len(self._sourceFields) > 0:
          return self._sourceFields
       events = self.getEvents()
       if events == None:
           self._sourceFields = []
           self._fieldCoverage = {}
           return self._sourceFields
           
       fieldCount = {}
       tagCount = {}
       # for each event, for each field, keep a running total of field's length and count
       for event in events:
          for k, v in event.items():
             if not isinstance(v, basestring): continue
             if self.isBoringField(k):
                continue
             if k.startswith("tag::"):
                tagfield = k[5:]
                tagCount[tagfield] = tagCount.get(tagfield,0) + 1
             else:
                fieldCount[k] = fieldCount.get(k,0) + 1

       fieldCoverage = {}
       for field,tagcount in tagCount.items():
          if field not in fieldCount: continue
          fieldcount = fieldCount[field]
          coverage = float(tagcount) / fieldcount
          fieldCoverage[field] = coverage
       self._fieldCoverage = fieldCoverage


       fieldsAndStats = fieldCount.items()
       # sort by most tagged, then most popular, and finally alphabetically
       fieldsAndStats.sort(lambda x,y: 10 * cmp(y[1], x[1]) + cmp(x[0], y[0]) + 100 * cmp(fieldCoverage.get(y[0],0), fieldCoverage.get(x[0],0)))
       self._sourceFields = [ fs[0] for fs in fieldsAndStats] # if not fs[0].startswith("tag::")]


       return self._sourceFields


    def getSourceField(self):
        return self._sourceField

    def setSourceField(self, fieldname):
        if self._sourceField == fieldname:
            return False
        self._sourceField = fieldname
        self._fieldValues = []
        return True


    #######################################################################################################
    def getGroupByTypes(self):
       return ['count', 'lexical', 'format']

    def getGroupByType(self):
       return self._getGroupByType

    def setGroupByType(self, val):
       if val in self.getGroupByTypes():
          self._getGroupByType = val
       else:
          raise ModelException("unknown grouptype: %s" % val)

    def getFieldValues(self):
       if len(self._fieldValues) > 0:
          return self._fieldValues
       events = self.getEvents()
       if events == None:
           self._fieldValues = []
           return self._fieldValues

       field = self._sourceField
       valueInfo = {}
       # for each event, for each field, keep a running total of field's length and count
       for event in events:
          if field not in event: continue
          v = event[field]   # + "field=" + field + "event: " + str(event)
          tag = event.get('tag::%s' % field, None)
          if v not in valueInfo:
             count = 1 # if tag == None else -1000
             tags = set()
          else:
             count, tags = valueInfo[v]
          
          if tag != None: 
             # tag might continue multiple tags via a list or a comma separator
             addvals = tag if isinstance(tag, list) else tag.split(',')
             for t in addvals:
                tags.add(t)
           
          valueInfo[v] = [count+1, tags]

       valInfoList = valueInfo.items()
       valInfoList.sort(lambda x,y: cmp(y[1][0], x[1][0]))
       self._fieldValues = valInfoList
       return self._fieldValues



    def getResultQuery(self):
        q = self._restrictionSearch
        if q == '':
           rtype = self.getRestrictionType()
           rval  = self.getRestrictionValue()
           if rtype == None or rval == None:
              return None
           q = '%s="%s"' % (rtype, rval)

        return 'search %s | head %s | fields - _raw ' % (q, MAX_WILLING_TO_SHOW)

    

    def resetEvents(self):
       log("RESET EVENTS")
       if len(self._events) > 0:
           import traceback
           log("WTF: %s" % traceback.format_exc())           

       self._sourceFields = []
       self._fieldValues  = []
       self._fieldCoverage = {}

       self._eventsDirty = True
       self._existingExtractionsDirty = True             


    #######################################################################################################
    # GET SAMPLE EVENTS BASED ON RESTRICTIONTYPE=RESTRICTIONVALUE
    def getEvents(self):
        log("DIRTY?: %s" % self._eventsDirty)
        if self._eventsDirty:
            self._sourceFields = [] # reset sourcefieldinfo
            self._fieldValues = []

            query = self.getResultQuery()
            if query == None:
                return []
        
            log("getEvents: %s" % query)           
            results = splunk.search.searchAll(query, sessionKey=self._sessionKey, status_buckets=1, required_field_list='*')

            self._events = []            
            for result in results:
               event = {}
               for k in result:
                  v = result[k]
                  if isinstance(v, list):
                     v = [str(x) for x in v]
                  else:
                     v = str(v)
                  event[str(k)] = v
               self._events.append(event)
            self._eventsDirty = False

        return self._events

    def updateEvents(self, field, values, tag, untag=False):
       events = self.getEvents()
       log("number of events %s\n" % len(events))
       for event in events:
          if field not in event: continue
          value = event[field]
          if value in values:
             tagfield = 'tag::%s' % field
             tagvalue = event.get(tagfield, None)
             log("\tvalue=%s tagfield=%s tagvalue=%s\n" % (value, tagfield, tagvalue))

             if untag:
                # if there is a tag value
                if tagvalue != None:
                   # if it's just a string value and it matches
                   if tagvalue == tag:
                      # remove the value and update the event
                      del event[tagfield]
                   else:
                      # if it's just a list value and it matches
                      if isinstance(tagvalue, list) and tag in tagvalue:
                         # remove the value and update the event
                         tagvalue.remove(tag)
                         event[tagfield] = tagvalue
             else:
                # if there is a tag value
                if tagvalue == None:
                      event[tagfield] = [tag]
                      log("\tupdated event: list %s\n" % (tagvalue))
                else:
                    # if it's a list, add it, if not there already
                    if isinstance(tagvalue, list):
                       if tag not in tagvalue:
                          tagvalue.append(tag)
                          event[tagfield] = tagvalue
                          log("\tupdated event: list %s\n" % (tagvalue))
                    else:
                       # if it's a string, and tag isnt already there
                       if isinstance(tagvalue, basestring) and tag != tagvalue:
                          # make it a list with new tag value
                          tagvalue = [tagvalue, tag]
                          event[tagfield] = tagvalue
                          log("\tupdated event: string %s\n" % (tagvalue))


    def tag(self, field, values, makePublic, tag, untag=False):
       # PERFORMANCE NOTE, I know that the tag field can be called just once with multiple tags.
       # CAN'T FIND DOCS ON JSON ARGS.  TEMP calling each time. shouldn't be a big hit

       # clear field values to be recalc'd
       self._fieldCoverage = {}
       self._sourceFields = []
       self._fieldValues = []

       namespace = self.getCurrentApp()
       if namespace == 'system': namespace = None
       owner = self._owner
       if namespace == None: owner = None
       if makePublic:
          owner = None
       
       # add each tag.  
       for value in values:
          command = 'add' if untag == False else 'delete'
          args = {'value': str(value), command: str(tag)}  #jargs = json.dumps(args)
          uri = splunk.entity.buildEndpoint('search/fields/%s/tags' % field, namespace=namespace, owner=owner)
          response, content = rest.simpleRequest(uri, sessionKey=self._sessionKey,  method='POST', postargs=args)
          if response.status != 200:
             msg = getMsg(content)
             raise ModelException('Unable to tag %s=%s with %s.  %s (%s)  Debug:  %s -- %s' % (field, value, tag, msg, response.status, content, args))
       self.updateEvents(field, values, tag, untag)
       return True

    def untag(self, field, values, makePublic, tag):
       return self.tag(field, values, makePublic, tag, True)


def getMsg(s):
   msgs = re.findall('<msg type="[^"]*">(.*)</msg>', s)
   if len(msgs) > 0:
      return ', '.join(msgs)
   return 'No details'

def test():
   mgr = ModelManager()
   cookie = "123"
   owner = "admin"
   namespace = "search"
   sessionKey = splunk.auth.getSessionKey(owner, "changeme")
   model = mgr.getModel(cookie, namespace, owner, sessionKey)

   
   print "restriction types:", model.getRestrictionTypes()
   print "restriction type: ", model.getRestrictionType()
   print "restriction values: ", model.getRestrictionValues(model.getRestrictionType())   
   print "restriction value: ", model.getRestrictionValue() 
   try:
      model.setRestrictionType("blah")
      print "accepted bogus model!"
   except:
      pass
   model.setRestrictionType("sourcetype")
   print "restriction type: ", model.getRestrictionType()   
   assert(model.getRestrictionType() == "sourcetype")

   for rtype in model.getRestrictionTypes():
      print "restriction values for %s: %s" % (rtype, model.getRestrictionValues(rtype))

   sampleVal = model.getRestrictionValues(model.getRestrictionType())[-1]
   model.setRestrictionValue(sampleVal)
   print "restriction %s=%s " % (model.getRestrictionType(), model.getRestrictionValue())
   assert(model.getRestrictionValue() == sampleVal)


   print "possible source fields to extract from:", model.getSourceFields()[:10]
   
   events = model.getEvents()
   print "event count: ", len(events)

   events = model.getEvents()



if __name__ == '__main__':
   test()

    
