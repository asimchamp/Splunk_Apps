import re,time
import splunk.mining.FieldLearning as fl
import splunk.search as se
import splunk.searchhelp.next as next
import splunk.searchhelp.utils as parseutils
import splunk.auth as sa
import traceback

MAX_SEARCH_DATA = 100000
MAX_SEARCH_LEN = 1000

def addMsg(targs, level, text):
    targs['messages'][level].append(str(text))
    if level == 'error':
        addMsg(targs, 'warn', 'Stacktrace: %s' % traceback.format_exc())


def getSearches(targs, namespace, allusers, owner, sessionKey, qstr):

    if qstr == '':
        q = None
    else:
        q = qstr
        if not q.startswith("|") and not q.startswith("search "):
            q = "search %s | head %s | where len(search)<%s " % (q, MAX_SEARCH_DATA, MAX_SEARCH_LEN)

    if q == None:
        if not allusers:
            # get user's history of searches, ignoring those that didn't return any results
            q = "|history | search event_count>0 OR result_count>0 | head %s | where len(search)<%s | top 1000 showperc=false search" % (MAX_SEARCH_DATA, MAX_SEARCH_LEN)
        else:
            q = 'search index=_audit action=search search=* search_id!=*scheduler* user!=splunk-system-user | head %s | where len(search)<%s | top 1000 showperc=false search' % (MAX_SEARCH_DATA, MAX_SEARCH_LEN)

    results = se.searchAll(q, sessionKey=sessionKey, namespace=namespace, owner=owner) #, spawn_process=False)
    # just getting searches and ignoring everything else.  for now
    searches = [str(search['search']) for search in results  if 'search' in search]
    return searches

MINCOUNT = 5


def tuneup(targs, namespace, allusers, owner, sessionKey, qstr):

    results = []
    searches = []

    try:
        searches = getSearches(targs, namespace, allusers, owner, sessionKey, qstr)
        savedsearches = parseutils.getStanzas("savedsearches", sessionKey, owner, namespace)
        sq = [str(savedsearches[s]['search']) for s in savedsearches]
        searches.extend(sq)
    except Exception, e:
        addMsg(targs, 'warn', 'Unable to get searches: %s' % e)
        addMsg(targs, 'warn', 'Stacktrace: %s' % traceback.format_exc())

    ## TAGS
    try:
        typetags = suggestTags(owner, sessionKey, namespace)
        for tagtype,tags in typetags.items():
            for tag, vals in tags.items():
                tag = {'type':'tag', 'tag': tag, 'values':  vals }
                results.append(tag)
    except Exception, e:
        addMsg(targs, 'warn', 'Unable to suggest tags: %s' % e)

    ## EVENTTYPES
    try:
        vals = suggestEventtypes(searches, owner, sessionKey, namespace, MINCOUNT)
        for search in vals:
            eventtype = { 'type':'eventtype','search': search }
            results.append(eventtype)
    except Exception, e:
        addMsg(targs, 'warn', 'Unable to suggest eventtypes: %s' % e)

    ## MACROS
    try:
        vals = suggestMacros(searches, owner, sessionKey, namespace, 1000, MINCOUNT)
        for snippet,count in vals:
            macro = { 'type': 'macro',  'definition': snippet } #, 'count': count }
            results.append(macro)
    except Exception, e:
        addMsg(targs, 'warn', 'Unable to suggest macros: %s' % e)

    ## REGEXES
    try:
        rexes = suggestExtractions(searches, owner, sessionKey, namespace, MINCOUNT)
        for rex in rexes:
            result = { 'type': 'rex', 'regex': rex }
            results.append(result)
    except Exception, e:
        addMsg(targs, 'warn', 'Unable to suggest extractions: %s' % e)

    ## SAVEDSEARCHES
    try:
        searches = suggestSavedSearches(searches, owner, sessionKey, namespace, MINCOUNT)
        for search in searches:
            result = { 'type': 'savedsearch', 'search': search }
            results.append(result)
    except Exception, e:
        addMsg(targs, 'warn', 'Unable to suggest savedsearches: %s' % e)

    return results


#----------------------


def normalize(srch):
    srch = srch.lower().strip().replace('"', '')
    srch = re.sub("[ ]+", " ", srch)
    return srch


def redundant(search):
  """ returns true if search consists of just an eventtype (e.g. 'eventtype=foo' or 'eventtype="foo bar") """
  return re.match('^eventtype=(?:"[^"]*")|(?:[^"][^ ]*)$', search) != None

def suggestEventtypes(searches, owner, sessionKey=None, namespace=None, mincount=1):

    # get set of known eventtypes
    knownEventtypes = set(['*'])
    eventtypeStanzas = parseutils.getStanzas("eventtypes", sessionKey, owner, namespace)
    for name in eventtypeStanzas:
        knownEventtypes.add(normalize(eventtypeStanzas[name].get('search', '')))

    # keep count of all args 'search' command
    eventtypes = {}
    for search in searches:
        #print "SEARCH: '%s' %s" % (search, type(search))
        commandPipelines = parseutils.getCommands(search, None)
        for commands in commandPipelines:
            for command, arg in commands:
                if command == "search":
                    arg = arg.strip()
                    norm = normalize(arg)
                    # ignore searches that are already in known eventtypes.
                    # and ignore searches that contain macros.
                    if norm in knownEventtypes or '`' in arg:
                        continue
                    if norm in eventtypes:
                        eventtypes[norm] = (eventtypes[norm][0] + 1, arg)
                    else:
                        eventtypes[norm] = (1, arg)

    searchesAndCounts = eventtypes.items()
    searchesAndCounts.sort(lambda x, y: 10*cmp(y[1][0], x[1][0]) + cmp(x[1][1], y[1][1]))
    # return most common searches, that have a count >= mincount
    return [sc[1] for norm, sc in searchesAndCounts if sc[0] >= mincount and not redundant(sc[1])]
    




######################

knownSearchLanguageTerms = set([
'abs', 'abstract', 'accum', 'action', 'add', 'addinfo', 'addtime', 'addtotals', 'af', 'agg', 'allnum', 'allowempty', 'allrequired', 'and', 'annotate', 'anomalies', 'anomalousvalue', 'append', 'appendcols', 'as', 'associate', 'attr', 'attribute', 'attrn', 'audit', 'auto', 'autoregress', 'avg', 'bcc', 'bins', 'blacklist', 'blacklistthreshold', 'bottom', 'bucket', 'buffer_span', 'by', 'c', 'case', 'cb', 'cc', 'cfield', 'chart', 'cidrmatch', 'cityblock', 'classfield', 'clean_keys', 'cluster', 'coalesce', 'cocur', 'col', 'collapse', 'collect', 'commands', 'concurrency', 'connected', 'consecutive', 'cont', 'context', 'contingency', 'convert', 'copyattrs', 'correlate', 'cos', 'cosine', 'count', 'counterexamples', 'countfield', 'crawl', 'createinapp', 'cs', 'csv', 'ctime', 'current', 'd', 'day', 'days', 'daysago', 'dbinspect', 'dc', 'dd', 'dedup', 'default', 'delete', 'delim', 'delims', 'delta', 'desc', 'dest', 'dictionary', 'diff', 'discard', 'distinct-count', 'distinct_count', 'ds', 'dt', 'dur2sec', 'duration', 'earlier', 'ema', 'end', 'enddaysago', 'endhoursago', 'endminutesago', 'endmonthsago', 'endswith', 'endtime', 'erex', 'eval', 'eventcount', 'events', 'eventstats', 'eventtype', 'eventtypetag', 'exact', 'examples', 'exp', 'extract', 'false', 'field', 'fieldname', 'fields', 'file', 'fillnull', 'filter', 'findtypes', 'first', 'floor', 'folderize', 'forceheader', 'form', 'format', 'from', 'fromfield', 'gentimes', 'global', 'graceful', 'h', 'head', 'header', 'hh', 'high', 'highest', 'highlight', 'hilite', 'host', 'hosts', 'hosttag', 'hour', 'hours', 'hoursago', 'hr', 'hrs', 'html', 'iconify', 'if', 'ifnull', 'improv', 'in', 'increment', 'index', 'inline', 'inner', 'input', 'inputcsv', 'inputlookup', 'intersect', 'ip', 'iplocation', 'iqr', 'isbool', 'isint', 'isnotnull', 'isnull', 'isnum', 'isstr', 'join', 'k', 'keepempty', 'keepevents', 'keepevicted', 'keeplast', 'keepsingle', 'kmeans', 'kvform', 'l1', 'l1norm', 'l2', 'l2norm', 'label', 'labelfield', 'labelonly', 'last', 'left', 'len', 'like', 'limit', 'list', 'ln', 'loadjob', 'local', 'localize', 'localop', 'log', 'logchange', 'lookup', 'low', 'lower', 'lowest', 'ltrim', 'm', 'makecontinuous', 'makemv', 'map', 'marker', 'match', 'max', 'max_buffer_size', 'max_match', 'max_time', 'maxchars', 'maxcols', 'maxevents', 'maxfolders', 'maxinputs', 'maxiters', 'maxlen', 'maxlines', 'maxopenevents', 'maxopentxn', 'maxout', 'maxpause', 'maxresolution', 'maxrows', 'maxsearches', 'maxspan', 'maxterms', 'maxtime', 'maxtrainers', 'maxvalues', 'md5', 'mean', 'median', 'memk', 'metadata', 'min', 'mincolcover', 'minfolders', 'minrowcover', 'mins', 'minute', 'minutes', 'minutesago', 'mktime', 'mm', 'mode', 'mon', 'month', 'months', 'monthsago', 'ms', 'mstime', 'multikv', 'multitable', 'mv_add', 'mvappend', 'mvcombine', 'mvcount', 'mvexpand', 'mvfilter', 'mvindex', 'mvjoin', 'mvlist', 'name', 'name-terms', 'ngramset', 'noheader', 'nomv', 'none', 'normalize', 'nosubstitution', 'not', 'notcovered', 'notin', 'now', 'null', 'nullif', 'nullstr', 'num', 'optimize', 'or', 'otherstr', 'outer', 'outfield', 'outlier', 'output', 'outputcsv', 'outputlookup', 'outputtext', 'overlap', 'override', 'overwrite', 'p', 'param', 'partial', 'perc', 'percentfield', 'percint', 'perl', 'pi', 'position1', 'position2', 'pow', 'prefix', 'priority', 'private-terms', 'pthresh', 'public-terms', 'python', 'random', 'range', 'rangemap', 'rare', 'raw', 'regex', 'relative_time', 'relevancy', 'reload', 'remove', 'rename', 'replace', 'reps', 'rescan', 'reverse', 'rex', 'rm', 'rmcomma', 'rmorig', 'rmunit', 'roll', 'round', 'row', 'rtorder', 'rtrim', 's', 'savedsearch', 'savedsplunk', 'script', 'scrub', 'search', 'searchmatch', 'searchtimespandays', 'searchtimespanhours', 'searchtimespanminutes', 'searchtimespanmonths', 'sec', 'second', 'seconds', 'secs', 'sed', 'segment', 'selfjoin', 'sendemail', 'sep', 'server', 'set', 'setsv', 'shape', 'showcount', 'showlabel', 'showperc', 'sichart', 'sid', 'singlefile', 'sirare', 'sistats', 'sitimechart', 'sitop', 'size', 'sleep', 'sma', 'sort', 'sortby', 'source', 'sources', 'sourcetype', 'sourcetypes', 'span', 'split', 'spool', 'sq', 'sqeuclidean', 'sqrt', 'ss', 'start', 'startdaysago', 'starthoursago', 'startminutesago', 'startmonthsago', 'startswith', 'starttime', 'starttimeu', 'stats', 'stdev', 'stdevp', 'str', 'strcat', 'streamstats', 'strftime', 'strptime', 'substr', 'sum', 'summary', 'sumsq', 'supcnt', 'supfreq', 'sync', 't', 'table', 'tail', 'termlist', 'termset', 'testmode', 'text', 'tf', 'threshold', 'time', 'timeafter', 'timebefore', 'timechart', 'timeconfig', 'timeformat', 'timeout', 'to', 'tokenizer', 'tol', 'top', 'tostring', 'totalstr', 'transaction', 'transform', 'trendline', 'trim', 'true', 'type', 'typeahead', 'typeof', 'typer', 'union', 'uniq', 'untable', 'upper', 'urldecode', 'us', 'uselower', 'usenull', 'useother', 'useraw', 'usetime', 'usetotal', 'usexml', 'validate', 'value', 'values', 'var', 'varp', 'where', 'window', 'with', 'wma', 'xmlkv', 'xmlunescape', 'xor', 'xpath', 'xyseries', 'yy'
])





def regexify(macroDef):
    macroDef = fl.safeRegexLiteral(macroDef)
    macroDef = re.sub("[\\\\][$][a-zA-Z0-9_-]+[\\\\][$]", ".*", macroDef)
    #safeDef = "(?i)" + macroDef
    #print "MACRODEF: %s\nSAFEDEF: %s" % (macroDef, safeDef)
    return re.compile(macroDef)


def subsumedByMacro(search, knownMacros):
    for regex, macro in knownMacros:
        #print "MACRO: ", macro
        #print "SEARCH:", search
        if re.search(regex, search): ############!! changed from match.  shouldn't be necessary
            #print macro, "\n", search,"\n\n"
            return macro
    return None


def suggestMacros(searches, owner, sessionKey=None, namespace=None, maxsearches=1000, mincount=1):

    # get set of known DEFINITION values from macros.conf
    knownMacros = set()
    macrosStanzas = parseutils.getStanzas("macros", sessionKey, owner, namespace)
    for name in macrosStanzas:
        for attr, val in macrosStanzas[name].items():
            if attr.startswith("definition"):
                knownMacros.add((regexify(val), val))

    learnedMacros = set()    

    nonmatchedSearches = set()
    searches.sort(lambda x, y: len(y) - len(x))
    # get list of searches that don't match exising macros
    for search in searches[:maxsearches]:
        matched = False
        if None == subsumedByMacro(search, learnedMacros):        
            nonmatchedSearches.add(normalize(search))
    nonmatchedSearches = list(nonmatchedSearches)
    sLen = len(nonmatchedSearches)
    macros = set()
    for i1 in range(0, sLen):
        s1 = nonmatchedSearches[i1]
        if None != subsumedByMacro(s1, learnedMacros):
            continue
        for i2 in range(i1+1, sLen):
            s2 = nonmatchedSearches[i2]
            #if None != subsumedByMacro(s2, learnedMacros):
            #     print "S2"
            #     continue            
            macro = getMacro(s1, s2)
            if macro != None and macro not in knownMacros:
                macros.add(macro)
                learnedMacros.add((regexify(macro), macro))
                break
    #print "done generating macros.  %s macros." % len(macros)
    #print "learned on the last %s searches." % maxsearches
    #print "searches count %s.  unique count %s" % (len(searches), len(set(searches)))
    macrocounts = {}
    #print len(macros), len(learnedMacros)
    #for m in macros:
    #    print m
    #for m in learnedMacros:
    #    print m
    for i, search in enumerate(searches):
        search = normalize(search)
        #print "search:", search,"\nnorm:  ", norm,"\n"

        for regex, macro in learnedMacros:
            if re.search(regex, search): 
                macrocounts[macro] = macrocounts.get(macro,0) + 1
                #print macro

    #print macrocounts
    macrosAndCounts = macrocounts.items()
    macrosAndCounts.sort(lambda x, y: y[1] - x[1])
    # return most common macros, that have a count >= mincount
    return [(macro,count) for macro, count in macrosAndCounts if count >= mincount]

def uneven(s):
    for ch in '"()[]{}':
        if s.count(ch) % 2 == 1:
            return True
    return False
    
def getMacro(s1, s2):
    MIN_COMMANDS = 2
    MIN_TOKENS = 10
    MIN_LEN = 140
    
    # ignore dups or not enough commands
    if s1 == s2 or s1[1:].count('|') < MIN_COMMANDS-1 or s2[1:].count('|') < MIN_COMMANDS-1:
        return None
    # simple case of one being a complete substring of the other
    if s2.startswith(s1):
        #print "s1"
        return s1 + " $suffix$"
    if s2.endswith(s1):
        #print "s2"
        return "$prefix$ " + s1
    if s1.startswith(s2):
        #print "s3"
        return s2 + " $suffix$"
    if s1.endswith(s2):
        #print "s4"
        return "$prefix$ " + s2
    if s1 in s2:
        return "$prefix$ " + s1 + " $suffix$"
    if s2 in s1:
        return "$prefix$ " + s2 + " $suffix$"

    c1 = s1.split('|')
    c2 = s2.split('|')
    #prefixLen = 0
    # if at least 2 commands at start are in common
    for i in range(len(c1)):
        if len(c2) == i:
            break
        #prefixLen += len(c1[i])
        if c2[i] != c1[i]:
            if i >= MIN_COMMANDS: # or prefixLen >= MIN_LEN:
                
                #print "s5", '|'.join(c1[:i]) + " $suffix$"
                return '|'.join(c1[:i]) + " $suffix$"
    # if at least 2 commands at end are in common
    #suffixLen = 0
    for i in range(1, len(c1)+1):
        if i > len(c2):
            break
        #suffixLen += len(c1[-1 * i])
        if c2[-1 * i] != c1[-1 * i]:
            if i > MIN_COMMANDS: # or suffixLen >= MIN_LEN:
                #print "s6", "$prefix$ " + '|'.join(c1[-1 * i+1:])            
                return "$prefix$ " + '|'.join(c1[-1 * i+1:])            
    
    t1 = set(s1.split())
    t2 = set(s2.split())
    if len(t1) < MIN_TOKENS or len(t2) < MIN_TOKENS:
        return None
    d1 = t1.difference(t2)
    d2 = t2.difference(t1)
    MAX_DIFF = len(t1) / 5
    #print MAX_DIFF
    #print len(d1), len(d2)

    
    if len(d1) == len(d2) and len(d1) <= MAX_DIFF:
        if len(d1) == 0:
            return None
            print "\t", s1
            print "\t", s2
            print "\t", d1
            print "\t", d2
            
        for i, d in enumerate(d1):
            # don't allow variables for common search language commands and args
            if d.lower() in knownSearchLanguageTerms:
                return None
            # don't allow uneven quotes/parens in variables
            if uneven(d):
                return None
            # if value that they differ by occurs more than once, too confusing, punt
            if s1.count(d) != 1:
                return None
            s1 = s1.replace(d, "$var%s$" % i)
            #print s1
        #print "s7", s1
        macro = s1
        # replace $var1$ $var2$  with $var1$
        while True:
            macro2 = re.sub('([$]var\d[$]) ([$]var\d[$])', '\\1', macro)
            if macro == macro2:
                break
            macro = macro2
        # remove unhelpful "| $var$"
        macro = re.sub('[|] ([$]var\d[$])$', '', macro)
        # make sure we still have a pipe.  don't allow macros with just one search command
        if '|' not in macro:
            return None
        if macro[1:].count('|') == 0:
            #print "GOT YOU!", macro
            return None
        return macro
    return None
            
        

    

#####################







def getRexArgs(arg):
    # takes from intersplunk that deals with sys.args
    kvs = {}

    # handle case where arg is surrounded by quotes
    # remove outer quotes and accept attr=<anything>
    if arg.startswith('"') and arg.endswith('"'):
        arg = arg[1:-1]
        matches = re.findall('(?:^|\s+)([a-zA-Z0-9_-]+)\\s*(::|==|=)\\s*(.*)', arg)
    else:
        matches = re.findall('(?:^|\s+)([a-zA-Z0-9_-]+)\\s*(::|==|=)\\s*((?:[^"\\s]+)|(?:"[^"]*"))', arg)

    arg = re.sub('(?:^|\s+)([a-zA-Z0-9_-]+)\\s*(::|==|=)\\s*((?:[^"\\s]+)|(?:"[^"]*"))', "", arg)
    arg = re.sub('(?:^|\s+)([a-zA-Z0-9_-]+)\\s*(::|==|=)\\s*(.*)', "", arg)
    keywords = arg.strip() #arg.split()
    # for each k=v match
    for match in matches:
        attr, eq, val = match
        # put arg in a match
        kvs[attr] = val
    return keywords, kvs

def suggestExtractions(searches, owner, sessionKey=None, namespace=None, mincount=1):

    # get set of known EXTRACT values from props
    knownExtractions = set(['*'])
    propsStanzas = parseutils.getStanzas("props", sessionKey, owner, namespace)
    for name in propsStanzas:
        for attr, val in propsStanzas[name].items():
            if attr.startswith("EXTRACT"):
                # slightly wrong. doesn't get IN fieldname
                knownExtractions.add(normalize(val))
    
    # go over user entered searches and saved searches
    # keep count of all args to 'rex' command
    extractions = {}
    for search in searches:
        commandPipelines = parseutils.getCommands(search, None)
        for commands in commandPipelines:
            for command, arg in commands:
                if command == "rex":
                    regex, options = getRexArgs(arg)
                    #print regex, options
                    # ignore sed formats
                    if 'mode' in options and options['mode'].lower() == "sed":
                        continue
                    # ignore if not exactly one regex
                    if len(regex) == 0:
                        continue
                    field = options.get('field', '_raw')
                    norm = normalize(arg)
                    # ignore rex that are already in known extractions
                    if norm in knownExtractions:
                        continue
                    if norm in extractions:
                        extractions[norm] = (extractions[norm][0] + 1, (regex, field))
                    else:
                        extractions[norm] = (1, (regex, field))

    searchesAndCounts = extractions.items()
    searchesAndCounts.sort(lambda x, y: y[1][0] - x[1][0])
    # return most common searches, that have a count >= mincount
    return [sc[1] for norm, sc in searchesAndCounts if sc[0] >= mincount]
    

    


#####



def suggestSavedSearches(searches, owner, sessionKey=None, namespace=None, mincount=1):

    # get set of known eventtypes
    knownSavedSearches = set(['*', '| metadata type=hosts', '| metadata type=sourcetypes', '| metadata type=sources'])
    savedSearchestanzas = parseutils.getStanzas("savedsearches", sessionKey, owner, namespace)
    for name in savedSearchestanzas:
        knownSavedSearches.add(normalize(savedSearchestanzas[name].get('search', '')))
    
    # go over user entered searches and saved searches
    savedSearches = {}
    for search in searches:
        search = search.strip()
        # ignore metadata and history
        if search.startswith("|"):
            first = search[1:].strip()
            if first.startswith("metadata") or first.startswith("history") or first.startswith("eventcount"):
                continue
        # ignore searches that don't have pipes.  those shold have been caught by eventtype suggestions
        if "|" not in search:
            continue

        if search.startswith("search "):
            search = search[7:]
        norm = normalize(search)
        # ignore searches that are already in known savedSearches
        if norm in knownSavedSearches:
            continue
        if norm in savedSearches:
            savedSearches[norm] = (savedSearches[norm][0] + 1, search)
        else:
            savedSearches[norm] = (1, search)
    searchesAndCounts = savedSearches.items()
    searchesAndCounts.sort(lambda x, y: 10*cmp(y[1][0], x[1][0]) + cmp(x[1][1], y[1][1]))

    # return most common searches, that have a count >= mincount
    return [sc[1] for norm, sc in searchesAndCounts if sc[0] >= mincount]
    

    


#####




def suggestTags(owner, sessionKey=None, namespace=None):
    tags = {}
    tags['host']       = suggestTagsBySourcetype(owner, 'host', sessionKey, namespace, '-1h')
    tags['eventtypes'] = suggestTagsBySourcetype(owner, 'eventtype', sessionKey, namespace, '-1h')
    return tags

def suggestTagsBySourcetype(owner, field, sessionKey, namespace, earliest):
    search = 'search %s="*" index=* | stats values(sourcetype) as sourcetypes by %s | slc field=sourcetypes labelonly=true | sort cluster_label | stats values(%s) as values by cluster_label' % (field, field, field)

    results = se.searchAll(search, sessionKey=sessionKey, status_buckets=1, earliest_time=earliest)
    if len(results) < 3:
        return {}

    taggedValues = {}
    for i,result in enumerate(results):
        vals = set([str(v) for v in result['values']])
        # don't try to tag single values
        if len(vals) < 2:
            continue
        tag = pickTag(vals)
        if tag in taggedValues:
            tag = '%s%s' % (tag, i)
        taggedValues[tag] = vals
    return taggedValues

def pickTag(values):
    """returns shortest value in values, when digits are removed.  that's the tag used."""
    import re
    vs = [ re.sub('(\d+)', 'N', v) for v in values ]
    m = vs[0]
    for v in vs:
        if len(v) < len(m):
            m = v
    return m
    
    

if __name__ == '__main__':
    targs = {}
    namespace = 'search'
    owner = 'admin'
    sessionKey = sa.getSessionKey(owner, 'changeme', 'localhost:9050')
    for allusers in [True, False]:
        print "ALLUSERS", allusers
        suggestions = tuneup(targs, namespace, allusers, owner, sessionKey, '')
        for sug in suggestions:
            for k,v in sug.items():
                print '%s: "%s"' % (k,v),
            print 

    
