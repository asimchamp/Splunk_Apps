# -*- coding: utf-8 -*-
import cherrypy
import splunk.appserver.mrsparkle.controllers as controllers
from splunk.appserver.mrsparkle.lib.decorators import expose_page
from splunk.appserver.mrsparkle.lib.routes import route
import splunk.search as se
import splunk.util
import re, time, logging
from splunk.util import safeURLQuote

logger = logging.getLogger('related')

requiredFields = ["sid", "offset"]

MAX_EVENT_WINDOW = 100

COMMON_THRESHOLD = 100
MAX_TO_CONSIDER = 20
MAX_TERMS = 3

MIN_PERCENT_REDUCTION_FOR_ADDING_QUERY_TERM = 0.80

def llog(msg):
    return
    f = open("/tmp/debug.txt", "a")
    f.write(msg + "\n")
    f.close()

def manual_make_url(url, _qs):
    qargs = '?' + '&'.join([ '%s=%s' % (safeURLQuote(unicode(k), safe=''), safeURLQuote(unicode(v), safe='')) for k, v in _qs])
    return url + qargs

class RelatedController(controllers.BaseController):
    """/related"""

    @route('/')
    @expose_page(must_login=True, methods=['GET', 'POST'])
    def index(self, **kwargs):

        username   = cherrypy.session['user']['name']
        sessionKey = cherrypy.session['sessionKey']
        namespace  = kwargs.get('namespace','search')
        sid        = kwargs.get('sid','')
        soffset    = int(kwargs.get('offset','0'))
        matchtype  = kwargs.get('type','punct')
        url = '/'
        args = []

        url, args = getSearch(sid, soffset, matchtype, namespace, username, sessionKey)

        # if don't need splunk logic, just make the url ourselves,
        # which avoids the issue of pre-6.0 versions not have an
        # encode=False flag, causing http://google.com to become
        # http://localhost:8000/http://google.com!!
        if not url.startswith('/'):
            redirect_url = manual_make_url(url, args)
        else:
            try:
                redirect_url = self.make_url(url, _qs=args, encode=False) # bubbles
            except:
                redirect_url = self.make_url(url, _qs=args) # pre-bubbles

        raise cherrypy.HTTPRedirect(redirect_url)


### - alert on events like this! compares event to events around it and what makes it unique.
### - annotate event. (make specific eventtype and renderer as "annotated"
### - make "search booster" app that uses default.meta's export=system to 
### - add workflow actions to search.  related/similar. adds search commands.
### - timewrap search command.  add lots of cool features that get fit into search app.
### - lookup ips, phone numbers, zip codes, etc.
### - look up event at google with option to anonymize it.
### - tag _time with name of even so you can search after and before, and have all tag::_time show up in flashtimeline


def getSearch(sid, soffset, matchtype, namespace, user, sessionKey):

    try:
        job = se.getJob(sid)
        event = job.events[soffset]
    except:
        raise Exception("Unable to get job")

    index = str(event.get('index',''))
    if index == '' or index == "main":
        index = ''
    else:
        index = 'index="%s" ' % index

    if matchtype == "google":
        query = getQueryTerms(job, soffset)

        #url = 'https://www.google.com/#output=search' # 'http://www.google.com/webhp'
        url = 'http://www.google.com/search'
        #args = [('tab','ww#hl=en'), ('hl','en'), ('output','search'),('q',query), ('oq',query)]
        #args = [('q',query)]
        args = [('ie','UTF-8'),('oe','utf-8'), ('q', query)]
        return url, args

    if matchtype == "mail":
        url = "mailto:someone"
        source = event.get('source', 'my search')
        body = str(event['_raw'])
        sortedkeys = event.keys()
        sortedkeys.sort()
        myattrs = [k for k in sortedkeys if not isBoringField(k)]
        body += "\n\n\t • " + "\n\t • ".join(['%s="%s"' % (k,str(event[k])) for k in myattrs])
        args = [('subject','Look at this event from %s' % source), ('body', body)]
        return url, args

    if matchtype == "punct":
        punct = str(event.get('punct', ""))
        query = '%spunct="%s"' % (index, punct.replace('"','\\"'))
    elif matchtype == "identifying_terms":
        raw = event.raw.getRaw()
        #tokens = list(set(re.findall("([^\W_]+)", raw)))
        tokens = list(set(re.findall("([\w_.]+)", raw)))
        rare_tokens = getRareTokens(index, tokens, namespace, user, sessionKey)
        query = index + ' '.join(rare_tokens)
    elif matchtype == "identifying_values":
        query = index + ' '.join(['%s="%s"' % (k,v) for k,v in identifyingFieldValues(job, soffset, False).items()])
    elif matchtype == "alert_values":
        query = index + ' '.join(['%s="%s"' % (k,v) for k,v in identifyingFieldValues(job, soffset, True).items()])
    elif matchtype in ['2s','1m']:
        event_time = int(splunk.util.dt2epoch(splunk.util.parseISO(str(event['_time']))))
        if matchtype == '2s':
            earliest = event_time-2
            latest   = event_time+2
        elif matchtype == '1m':
            earliest = event_time-1*60
            latest   = event_time+1*60
        query = index + 'earliest=%s latest=%s' % (earliest, latest)


    searchpage = 'search'
    major_release = splunk.getReleaseVersion().split(".",1)[0]
    if major_release == '5' or major_release == '4':
        searchpage = 'flashtimeline'

    url = '/app/%s/%s' % (namespace, searchpage)
    args = [('q', query)]
    return url, args



def getQueryTerms(job, soffset):
    raw = str(job.events[soffset]['_raw'])
    # any A-Z terms
    return ' '.join(list(re.findall("\W([a-zA-Z]+)", raw)))
                                            



g_boring_fields = ['timeendpos', 'timestartpos', 'linecount', 'eventtype', 'punct', 'timestamp', 'earliest', 'latest', 'app', 'splunk_server'] # 'source', 'sourcetype', 'host', 

def isBoringField(field):
    return field.startswith('_') or field.startswith('date_') or field in g_boring_fields

# consider only enumerating to +5 and -5 neighbors of event
def identifyingFieldValues(job, soffset, forAlerts):
    events = job.events

    # if not for alerting, we're more liberal and only compare against a window of results, rather than all results
    if not forAlerts:
        min_index = max(0, soffset - MAX_EVENT_WINDOW)
        max_index = soffset + MAX_EVENT_WINDOW # min
        # only look in a window of events around the event in question
        events = events[min_index:max_index]


    myevent = events[soffset]
    myattrs = set([k for k in myevent.keys() if not isBoringField(k)])
    myvals  = set([(k,str(myevent[k])) for k in myattrs])


    attr_counts = {}
    value_counts = {}

    # for each result, get count of attribute-value pairs, that are in myevent
    for i, event in enumerate(events):
        for k in myattrs:
            if k not in event: 
                # print "%s not in event" % k
                continue
            key = (k, str(event[k]))
            # let's only keep stats on key-values that are on the event we're interested in
            if key not in myvals:
                #print "no ", key, myevent[k]
                continue
            #print "has", key

            if key not in value_counts:
                value_counts[key] = 0
            value_counts[key] += 1
            if k not in attr_counts:
                attr_counts[k] = 0
            attr_counts[k] += 1
    llog("MY ATTRS: %s" % myattrs)
    llog("MY VALS: %s" % myvals)
    llog("ACOUNTS: %s" % attr_counts)
    llog("VCOUNTS: %s" % value_counts)

    # get ordering of most desirable attr=val -- those that are most
    # rare and on unpopular attr.  so "name=carasso" is good if it's
    # "name=carasso" is rare and "name" is a common attribute, but
    # "root=carasso" is better if it's just as rare but the field
    # 'root' is rarer. in describing an event as rare, if there are
    # unique/rare fields for it, that fact is relevant.

    # the counter to this is that we don't want guid=2343243242343243243
    # for the search.  so it seems you want rare fields-values that occur more than once,
    # and then combine values unit the event is unique for at least 10(?) events arount the event.
    #!!!!

    ordered_values = value_counts.items()
    ordered_values.sort(lambda y, x: cmp((y[1] * attr_counts[y[0][0]]), (x[1] * attr_counts[x[0][0]])))
    llog("ORDERED_VALUES: %s" % ordered_values)
    query = {}
    result_count = old_result_count = float('inf')
    # for each value on the event we're trying to make a query from
    for (k,v),count in ordered_values:
        llog("%s, %s, %s" % (k,v,count))
        #v = str(event[k])
        key = (k, v)
        count = value_counts[key]
        # if the key-value is in only this event, ignore it as too specific (e.g., guid=343243243432) , unless we're alerting
        if count == 1 and not forAlerts : continue
        # add this k-v to the query we're building
        query[k] = v
        # see how many events have all the attributes of the query
        result_count = getResultCount(events, query)
        llog("COUNT: %s, %s" % (result_count, query))
        # if it didn't helped reduce the number of results
        reduction = float(result_count) / old_result_count
        # enough to justify it's inclusion in the query -- 
        if reduction > MIN_PERCENT_REDUCTION_FOR_ADDING_QUERY_TERM:
            del query[k]
        old_result_count = result_count
    llog("QUERY: %s" % query)
    if len(query) == 0:
        # if no query found, just copy the fields of the event
        for k in myattrs:
            query[k] = myevent[k]
    return query



# how many events have all (ANDd)the attribute-values of the query
def getResultCount(events, query):
    count = 0
    for event in events:
        for k,v in query.items():
            if k not in event or v != str(event[k]):
                break
        else:
            count += 1
    return count



def getCount(index, terms, sessionKey, namespace, user):
    # returns count of events up until comment threshold
    result = se.searchOne("search %s %s | head %s | stats count" % (index, terms, COMMON_THRESHOLD+1),
                          sessionKey=sessionKey, namespace=namespace, owner=user,
                          auto_finalize_ec=COMMON_THRESHOLD+1, max_time=4)
    return int(str(result['count']))

def longerornum(x,y):
    bonus = 0
    xd = x[0].isdigit()
    yd = y[0].isdigit()
    if xd and not yd:
        bonus = -10
    elif yd and not xd:
        bonus = 10
    return len(y) - len(x) + bonus

def getRareTokens(index, tokens, namespace, user, sessionKey):
    """ returns tokens that are pretty unique to the event in
    question.  starts with longest terms and adds on terms until the
    resulting query occurs in less than (20) results"""

    ## uri = splunk.entity.buildEndpoint('search', 'typeahead', namespace=namespace, owner=user, sessionKey=sessionKey)
    rare = []
    # start from longest terms to shortest, giving a 10 point bonus to things that start with a number (e.g. 0x934343)
    tokens.sort(longerornum)#lambda x,y: 10 * cmp(len(y), len(x)))

    years = [str(x) for x in range(2001,1+int(time.strftime("%Y")))]
    
    for token in tokens:
        if len(rare) > MAX_TO_CONSIDER: break
        ## if (token.isdigit() len(token)<4) or len(token)==1: continue
        # require token be 4 characters or more
        if len(token)<4: continue
        if token in years: continue
        
        if True:
            rare.append((token, 1))
            continue
    ##  requestArgs = { 'output_mode': 'json', 'prefix': index + token, 'count': 1, 'max_time': 2.0 }
    ##  llog(requestArgs)
    ##  response, content = splunk.rest.simpleRequest(uri, getargs=requestArgs, raiseAllErrors=False)
    ##  if response != None and response.status == 200:
    ##      output = json.loads(content)
    ##      matchcount = len(output)
    ##      for item in output:
    ##          count = int(item['count'])
    ##          if 1 < count < 10000:
    ##              llog("%s\t%s" % (count, token))
    ##              rare.append((token, count))
    ##              break
    ##  rare.sort(lambda x,y: cmp(x[1],y[1]))
        
    rareterms = [r[0] for r in rare]
    rareterms = rareterms[:MAX_TERMS]
    for i in xrange(1, len(rare)):
        terms = ' '.join(rareterms[:i])
        count = getCount(index, terms, sessionKey, namespace, user)
        llog("%s QUERY: %s" % (count, terms))
        if count < COMMON_THRESHOLD:
            return rareterms[:i]
        
    llog("RAREST: %s" % rareterms)
    return rareterms




def unit_test():
    import time

    cherrypy.tools.sessions.on = True    
    class FakeSession(dict):
        def __init__(self):
            self.id = 5
            self.sessionKey = splunk.auth.getSessionKey('admin', 'changeme')
    cherrypy.session = FakeSession()
    cherrypy.session['sessionKey'] = splunk.auth.getSessionKey('admin', 'changeme')
    cherrypy.session['user'] = { 'name': 'admin' }
    cherrypy.session['id'] = 12345
    cherrypy.config['module_dir'] = '/'
    cherrypy.config['build_number'] = '123'
    cherrypy.request.lang = 'en-US'
    # roflcon
    class elvis:
        def ugettext(self, msg):
            return msg
    cherrypy.request.t = elvis()
    # END roflcon

    relater = RelatedController()

    argc = len(sys.argv)
    if argc == 1:
        print "python %s <sid>" % sys.argv[0]
        exit()
    for related_type in ['mail', 'google', 'punct', 'identifying_terms', 'identifying_values', '1m', '2s']:
        start = time.time()
        try:
            out = relater.index(type=related_type, sid=sys.argv[1], offset=0)
        except Exception, e:
            print time.time() - start,
            print related_type, e


if __name__ == '__main__':
    unit_test()
