import sys, os
import splunk.Intersplunk as si

if __name__ == '__main__':

    try:
        messages = {}

        argcount = len(sys.argv)
        if argcount < 2:
            raise Exception("Usage: reset <modelname>")
        modelname = ' '.join(sys.argv[1:]).strip()

        change = False
        for suffix in ['corpus','model']:
            filename = os.path.abspath(os.path.join(__file__, "..", "..", "local","%s-%s.json" % (modelname, suffix)))
            if os.path.exists(filename):
                os.remove(filename)
                change = True
        if change:
            si.addWarnMessage(messages, "Reset %s model" % modelname)
        si.outputResults([], messages )

    except Exception, e:
        si.generateErrorResults(e)
