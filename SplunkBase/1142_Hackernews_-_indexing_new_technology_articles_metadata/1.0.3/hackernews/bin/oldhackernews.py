# Author: Nimish Doshi                                                         
# This program uses hacker news API to retrieve new news in JSON format.

import urllib
import sys
import datetime
import time
import traceback

def unescape(s):
        s = s.replace("&lt;", "<")
        s = s.replace("&gt;", ">")
        s = s.replace("&apos;", "'")
	s = s.replace("&quot;", "\"")
        # this has to be last:
        s = s.replace("&amp;", "&")
        return s



LOCATION_URL="http://api.ihackernews.com/page"

response = urllib.urlopen(LOCATION_URL)
lines = response.readlines()
# Build the output from the web query as a string
for line in lines:
	print line

#except:
#	traceback.print_exc(file=sys.stdout)

