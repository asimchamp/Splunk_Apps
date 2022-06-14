import sys, os, re, json
import splunk.Intersplunk as si

def usage():
    raise Exception("Usage: train <modelname> from <field>")
    #si.generateErrorResults(msg)                
    #exit(0)


def getParameters():

    # syntax = train <string:model> FROM <field:learned_field>

    argcount = len(sys.argv)
    if argcount < 3:
        usage()
    args = ' '.join(sys.argv[1:])
    match = re.match("(?i)^\s*(?P<model>[a-z0-9_]+)\s+from\s+(?P<field>[a-z0-9_]+)$", args)
    if match == None:
        usage()

    argdict = match.groupdict()
    modelname = argdict.get('model', None)
    fieldname = argdict.get('field', None)
    return modelname, fieldname

MAJOR_TOKENIZER = re.compile("[][<>(){}|!;,'\"*\n\r\s\t&?=]+")           # 'added = to prevent foo=bar as a value

def generateInstance(result, predicted_field, tolower=True, dedup=True):
    values = []
    for k,v in result.items():
        if k != predicted_field:
            if tolower: v = v.lower()
            majortokens = set(re.split(MAJOR_TOKENIZER, v))
            if dedup: majortokens = set(majortokens)
            for tok in majortokens:
                if len(tok) > 0:
                    values.append("%s::%s" % (k, tok))
    return (result.get(predicted_field, None), values)


if __name__ == '__main__':

    try:
        messages = {}
        modelname, predicted_field = getParameters()



        instances = []

        corpusfile = os.path.abspath(os.path.join(__file__, "..", "..", "local","%s-corpus.json" % modelname))
        if os.path.exists(corpusfile):
            f = open(corpusfile, "r")
            try:
                instances = json.load(f)
            except:
                try:
                    if os.path.exists(corpusfile):
                        os.remove(corpusfile)
                except Exception, e:
                    raise Exception("Unable to load previous model.  Use the 'reset' command to clear out the model and start over: %s" % e)
                raise Exception("Unable to load previous model which has now been deleted")

            f.close()

        f = open(corpusfile, "w")
        results,dummyresults,settings = si.getOrganizedResults()
        for result in results:
            instances.append(generateInstance(result, predicted_field))
        json.dump(instances, f)
        f.close()
        #si.addWarnMessage(messages, "Added training instances to %s model" % modelname)
        si.outputResults(results, messages )
    except Exception, e:
        si.generateErrorResults(e)
