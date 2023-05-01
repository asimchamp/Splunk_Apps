# Author: Anthony Tellez
import sys,splunk.Intersplunk
import string
import urllib2

emailfield="email"

if len(sys.argv)>1 and len(sys.argv) != 4:
    print "Usage |pwned email as <local-field> (or have email field name in data)"
    sys.exit()
elif len(sys.argv) == 4:
    emailfield=sys.argv[3]

results = []

try:

    results,dummyresults,settings = splunk.Intersplunk.getOrganizedResults()
    
    for r in results:
        if "_raw" in r:
            if emailfield in r:
                try:
                    eachuser=r[emailfield]
                    response = urllib2.urlopen('https://haveibeenpwned.com/api/v2/breachedaccount/' + eachuser)
                    data = response.read()
                    response.close()
                    r["isleaked"] = data
                except:
                    r["isleaked"] = ""

except:
    import traceback
    stack =  traceback.format_exc()
    results = splunk.Intersplunk.generateErrorResults("Error : Traceback: " + str(stack))

splunk.Intersplunk.outputResults( results )
