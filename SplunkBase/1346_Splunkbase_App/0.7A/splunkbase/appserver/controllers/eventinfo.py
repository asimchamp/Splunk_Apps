import re,json,os

import splunk.util

def loadInfo():
    #cwp = os.path.abspath(__file__)
    #datapath = os.path.abspath(os.path.join(os.path.abspath(cwp), "..", "..", "..", "bin", "appinfo.json"))

    try:
        from urllib2 import urlopen
        data = urlopen("http://innovato.com/splunkbase/appinfo.json").read()
        appinfo = json.loads(data)
        return appinfo
    except:
        pass

    home = os.environ['SPLUNK_HOME']
    datapath = os.path.join(home, "etc","apps","splunkbase","bin","appinfo.json")

    f = open(datapath,"r")
    appinfo = json.load(f)
    f.close()
    return appinfo

g_boring_fields = ['timeendpos','timestartpos','linecount', 'source', 'sourcetype', 'host', 'eventtype', 'punct', 'timestamp']

def isBoringField(field):
    return field.startswith('_') or field.startswith('date_') or field in g_boring_fields

def toRegex(pattern):
    newpattern = ""
    p = -1
    plen = len(pattern)
    while (p < plen-1):
        p += 1
        # '*' means match anything but a dir separator
        if pattern[p] == '*':
            newpattern += "[^/]*"
            
        elif pattern[p] == '.':
            # "..." matches anything including separators
            if pattern[p:].startswith("..."):
                newpattern += ".*"
                p += 2;
            else:
                newpattern += "\\."
        else:
            newpattern += pattern[p]
    return newpattern;

def badSourcePattern(pattern):
    return re.match(pattern, "somejunk/etc/somecrap.zzzz") != None


# copied from suggestapp()
def suggestByEventDetails(appinfo, event):
    output = {}
    badregexes = set()
    for app, appdict in appinfo.items():
        output[app] = [0, set()]
        # check if app and event have fields and field-values in common
        for field in appdict.get("_fields", []):
            if not isBoringField(field) and field in event:
                output[app][0] += 2
                output[app][1].add("shares field %s" % field)
                appvalues = appdict.get("_fieldvalues", {}).get(field, [])
                for appval in appvalues:
                    if appval in event[field]:
                        output[app][0] += 10
                        output[app][1].add('has fieldvalue %s="%s"' % (field, appval))
        # check if app and event have sources in common
        eventsrc = str(event.get("source", "")) 
        for source in appdict.get("_sources", ""): 
            srcpattern = toRegex(source) + "$"
            # if this pattern doesn't match a junk path and it does match a source
            if not badSourcePattern(srcpattern) and  re.match(srcpattern, eventsrc): 
                #print "ASDF", eventsrc, source
                output[app][0] += 20
                output[app][1].add('has source "%s"' % (source))
                        
        # check if app and event have sources in common
        for sourcetype in appdict.get("_sourcetypes", []):
            if sourcetype in str(event.get("sourcetype", "")): 
                output[app][0] += 20
                output[app][1].add('has sourcetype "%s"' % (sourcetype))
        # check if app regexes match on event
        #   assumes _raw and not another field
        raw = None
        try:
            raw = event.raw.getRaw() 
        except:
            if '_raw' in event:
                raw = str(event["_raw"])
        if raw != None:
            for regex in appdict.get("_regexes", []):
                try:
                    if regex in badregexes:
                        continue
                    oregex = regex
                    regex = regex.replace("(?<", "(?P<")
                    m = re.match(regex, "123 junk text that should not match 123.345 or random 12/12/12 or 5 or 11:22:33 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 \"\" 1")
                    if m: 
                        #print "crap regex in app (%s): %s" % (app, regex)
                        badregexes.add(oregex)
                        continue
                    m = re.match(regex, raw)
                    if m:
                        values = m.groupdict()
                        goodvals = False
                        for a, v in values.items():
                            # if the field has a name and the length is between 1 and 39 (we've seen bad regex that match too much. most regex match small amounts)
                            # and doesn't start with a space character which means we're generally way off base
                            if len(a) > 0 and 40 > len(v) > 0 and not v[0].isspace():
                                output[app][1].add('extracts %s="%s"' % (a, v))
                                goodvals = True
                        if goodvals:
                            output[app][0] += 5
    
                except Exception, e:
                    pass #print "'%s' -- %s" % (regex, e)

        # ignoring _eventtypes for now
        if output[app][0] == 0:
            del output[app]

    ordered = output.items()
    ordered.sort(lambda x, y: cmp(y[1][0], x[1][0]))

    lastscore = 0
    bestApps = []
    for app, score in ordered:
        # if score of this app is less than half of the next better scoring app, stop returning apps. the previous are so much better. or if less than 10.
        if score*2 < lastscore or score < 10:
            break
        bestApps.append([app, output[app][0], output[app][1]])
        lastscore = score
    return bestApps



if __name__ == '__main__':
    import sys
    if len(sys.argv) == 2:
        raw = sys.argv[1]
    else:
        raw = "elvis was 10.0.0.11 with 123.123.123.123"
        print 'usage: "<raw event text>"'
        print "using: raw=", raw
    appinfo = loadInfo()
    apps = suggestByEventDetails(appinfo, {'_raw': raw, 'sourcetype':'syslog'})
    for app in apps:
        print app



                
