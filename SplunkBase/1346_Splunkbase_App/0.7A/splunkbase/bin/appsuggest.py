
import sys, csv, re, os, json,urllib
import splunk.Intersplunk as si


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
                p += 2
            else:
                newpattern += "\\."
        else:
            newpattern += pattern[p]
    return newpattern


def badSourcePattern(pattern):
    return re.match(pattern, "somejunk/etc/somecrap.zzzz") != None



def loadSources(fname):
    f = open(fname, "r")
    lines = f.readlines()
    f.close()
    patterns = []
    for line in lines:
        line = line.strip()
        if line == "": break
        pattern, app = line.split('\t')
        pattern = toRegex(pattern) + "$"
        tokens = re.split("\\W+", pattern)
        if badSourcePattern(pattern):
            continue

        vals = (app, re.compile(pattern), tokens)
        patterns.append(vals)
    return patterns


def loadAppClusters(fname):
    clusters = []
    with open(fname, 'rb') as csvfile:
        reader = csv.reader(csvfile)
        # for each csv row
        for row in reader:
            # skip header
            if row[0] == "app": continue
            # read first value (apps)
            apps = set(row[0].split())
            clusters.append(apps)
    return clusters


def loadAppURLs():
    f = open("appurls.json", "r")
    appURLs = json.load(f)
    f.close()
    return appURLs

banned_apps = set(['pdfserver'])
g_appURLs = loadAppURLs()

def suggestAppsByClusters(results):
    clusters = loadAppClusters("appclusters.csv")
    # label, title
    namemap = {}
    myapps = []
    for result in results:
        if 'title' in result:
            myapps.append(result['title'])
            namemap[result['title']] = result['label']
    myapps = set(myapps)
    bestapps = {}
    # for each set of apps
    for cluster in clusters:
        # score by number in common / total
        score = int(100 * float(len(cluster.intersection(myapps))) / len(cluster.union(myapps)))
        # what new apps are there in this cluster
        additional_apps = cluster.difference(myapps)
        # for each new app of this group, increase it's score by the similarity of the group to the users install
        for app in additional_apps:
            bestapps[app] = bestapps.get(app, 0) + score
    results = []
    for app, score in bestapps.items():
        if score > 0 and app not in banned_apps:
            name = getAppNames(app)
            results.append({'app':name, 'score':str(score), 'label':namemap.get(app, app)}) # , 'appurl': getAppURL(app)})

    return results

### def matchComplexity(pattern, value):
###     try:
###         newpattern = re.sub("([a-zA-Z0-9]+)", "(\\1)", pattern)
###         m = re.match(newpattern, value)
###         groups = m.groups()
###         literal_len = len(''.join([literal for literal in groups if literal != None]))
###         return literal_len
###     
### ##         match_len = m.end(0) - m.start(0)
### ##         print "GROUPS:", groups, match_len
### ##         percent_literal = 100.0 * literal_len / match_len
### ##         print "literal_len: %s match_len: %s percent: %s" % (literal_len, match_len, percent_literal)
### ##         return percent_literal
###     except Exception, e:
###         pass  #print e, pattern, value
###     return 99
### 
### # boring = set(['log', 'splunk',])

def removeSmallTokens(tokens):
    return [tok for tok in tokens if len(tok)>2]


def suggestBySource(patterns, result):
    if 'source' not in result:
        return []
    source = result['source']
    mytokens = re.split("\\W+", source)
    mytokens = removeSmallTokens(mytokens)
    #print "MYTOKENS:", mytokens
    matches = {}
    for app, regex, tokens in patterns:
        if regex.match(source):
            matches[app] = matches.get(app, 0) + 100
        # print "===============",app, regex.pattern, source
        # print "COMPLEXITY:", matchComplexity(regex.pattern, source)
        # tokens = removeSmallTokens(tokens)
        # for mytok in mytokens:
        #    if mytok in tokens and mytok not in boring:
        #        matches[app] = matches.get(app, 0) + 1
        #        print "APP: %s TOKENS: %s" % (app, tokens)
        #        print "match:", mytok

    ordered = matches.items()
    ordered.sort(lambda x, y: cmp(y[1], x[1]))
    lastscore = 0
    bestApps = []
    for app, score in ordered:
        # if score of this app is less than half of the next better scoring app, stop returning apps. the previous are so much better.
        if score*2 < lastscore:
            break
        bestApps.append(app)
        lastscore = score

    return bestApps


############# TAKEN (DUPLICATE) WITH EVENTINFO.PY in APPSERVER!!
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
    datapath = os.path.join(home, "etc", "apps", "splunkbase", "bin", "appinfo.json")

    f = open(datapath, "r")
    appinfo = json.load(f)
    f.close()

    cleanRegexes(appinfo)
    return appinfo


# goes through each regex, compiles it, and removes those that match crap.
def cleanRegexes(appinfo):
    for app, appdict in appinfo.items():
        #print "-"*80, app
        good_regexes = []
        for regex in appdict.get("_regexes", []):
            try:
                regex = re.compile(regex.replace("(?<", "(?P<"))
                m = regex.match("123 junk text that should not match 123.345 or random 12/12/12 or 5 or 11:22:33 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 \"\" 1")
                if m == None: 
                    good_regexes.append(regex)
            except Exception, e:
                pass #print "bad regex:", regex, e
        appdict["_regexes"] = good_regexes


g_boring_fields = ['timeendpos', 'timestartpos', 'linecount', 'source', 'sourcetype', 'host', 'eventtype', 'punct', 'timestamp', 'earliest', 'latest', 'app']

def isBoringField(field):
    return field.startswith('_') or field.startswith('date_') or field in g_boring_fields

# copied from getInfo()
def suggestByEventDetails(appinfo, event):
    output = {}
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
            if not badSourcePattern(srcpattern) and re.match(srcpattern, eventsrc): 
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
        bestApps.append(app) #[app, output[app][0], output[app][1]])
        lastscore = score
    return bestApps


###################################################
# copied from Intersplunk
def getEncodedMV(vals):
    s = ""
    for val in vals:
        val = val.replace('$', '$$')
        if len(s):
            s += ';'
        s += '$' + val + '$'
    return s


def usage():
    raise Exception("Usage: appsuggest mode=[source|event|app]")

def getParameters():
    mode=None
    params = re.findall('(\\w+)\s*=\s*"?(\\w+)', " ".join(sys.argv))
    for k,v in params:
        v = v.lower()
        if k == "mode":
            mode = v
        else:
            usage()
    return mode

def getAppURL(app):
    if isinstance(app, list):
        return [g_appURLs.get(a, 'http://splunk-base.splunk.com/apps/search/?q=%s' % urllib.quote_plus(a)) for a in app]
    return g_appURLs.get(app, 'http://splunk-base.splunk.com/apps/search/?q=%s' % urllib.quote_plus(app))

def getAppNames(apps):
    names = []
    if not isinstance(apps, list):
        apps = [apps]
    for app in apps:
        url = g_appURLs.get(app, app)
        cleanurl = urllib.unquote_plus(url)
        last = cleanurl.rfind('/')
        name = cleanurl
        if last>=0:
            name = cleanurl[cleanurl.rfind('/')+1:]
        names.append(name)
    return names


if __name__ == '__main__':
    results = []
    messages = {}
    try:
        keywords,options = si.getKeywordsAndOptions()
        mode = options.get('mode', "")
        results,dummyresults,settings = si.getOrganizedResults()
        # used "startswith" to get app/apps, event/events, source/sources
        if mode.startswith("app"): 
            results = suggestAppsByClusters(results)
        elif mode.startswith("event"):
            if len(results) > 0:
                appinfo = loadInfo()
            for result in results:
                app = suggestByEventDetails(appinfo, result)[:3] # return upto the top 3 apps
                result['app'] = getAppNames(app)
                #result['appurl'] = getAppURL(app)

        elif mode.startswith("source"):
            patterns = loadSources("data.txt")
            # for each results
            for result in results:
                app = suggestBySource(patterns, result)
                result['app'] = getAppNames(app)
                #result['appurl'] = getAppURL(app)

        else:
            usage()
    except Exception, e:
        raise
        # si.addErrorMessage(messages, e)
        si.generateErrorResults(e)
        exit(-1)

    si.outputResults(results, messages)    

