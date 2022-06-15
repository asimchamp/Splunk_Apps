# Author: Nimish Doshi                                                         
# This program uses hacker news API to retrieve new news in JSON format.

import urllib
import sys
import traceback
import json





LOCATION_URL="http://api.ihackernews.com/page"

try:
	data = json.load(urllib.urlopen(LOCATION_URL))
# Build the output from the web query as a string

	item_date=data['cachedOnUTC']
	for item in data['items']:
		item['Date'] = item_date
		item=str(item)
		item=item.replace("{u'", "{'")
		item=item.replace(", u'", ", '")
		item=item.replace(": u'", ": '")
		item=item.replace("'", "\"")
		item=item.replace("\[", "")
		item=item.replace("\]", "")
		print item


except:
	print "Could not get JSON output from ihackernews.com"
	traceback.print_exc(file=sys.stdout)

