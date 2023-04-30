import sys, os, csv, re
import splunk.Intersplunk as si
import bayes
import train
import traceback


# TODO make a "test" mode

def usage():
    raise Exception("Usage: guess <modelname> [into <field>]")
    #si.generateErrorResults(msg)                
    #exit(0)


def getParameters():
    # syntax = guess <string:model> (INTO <field:target_field=guess>)?

    argcount = len(sys.argv)
    if argcount < 2:
        usage()
    args = ' '.join(sys.argv[1:])
    reset = False
    match = re.match("(?i)\s*(?P<model>[a-z0-9_]+)(?:\s+into\s+(?P<field>[a-z0-9_]+))?", args)
    if match == None:
        usage()

    argdict = match.groupdict()
    modelname = argdict.get('model', None)
    fieldname = argdict.get('field', None)
    if fieldname == None:
        fieldname = "guess"
    
    return modelname, fieldname


def generateInstance(result, predicted_field):
    return train.generateInstance(result, predicted_field)[1]


def predict(model, result, predicted_field):
    instance = generateInstance(result, predicted_field)
    result[predicted_field] = bayes.score(model, instance)

if __name__ == '__main__':

    try:
        messages = {}
        modelname, predicted_field = getParameters()

        modelfile = os.path.abspath(os.path.join(__file__, "..", "..", "local","%s-model.json" % modelname))
        corpusfile = os.path.abspath(os.path.join(__file__, "..", "..", "local","%s-corpus.json" % modelname))
        # if specified model doesn't exist, error
        if not os.path.exists(corpusfile) and not os.path.exists(modelfile):
            si.generateErrorResults('No "%s" model found.' % modelname)
            sys.exit()

        # if the corpus exists, but not the file, remove it
        if os.path.exists(corpusfile) and not os.path.exists(modelfile):
            bayes.buildModel(modelfile, corpusfile)
            #si.addInfoMessage(messages, "Build %s model" % modelname)

        # get results
        results,dummyresults,settings = si.getOrganizedResults()

        # if we're called with no results, don't bother expensive loading of the model
        if len(results) == 0:
            si.outputResults([], messages )
            sys.exit()

        model = bayes.loadModel(modelfile)
        for result in results:
            if predicted_field not in result or result[predicted_field] == '':
                predict(model, result, predicted_field)

        si.outputResults(results, messages )

    except Exception, e:
        e = Exception("Error in guessing: %s.  Stacktrace: %s" % (e, traceback.format_exc()))
        #raise
        si.generateErrorResults(e)


