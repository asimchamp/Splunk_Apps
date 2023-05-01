#!/usr/bin/env python

"""
| iocfilter regex="word"

Display the atomic indicators that match the provided regex.
"""

import re
import sys
import time

from splice.ioc      import IOC
from splice.config   import Config
from splice.database import DB

from splunklib.searchcommands import \
    dispatch, GeneratingCommand, Configuration, Option, validators

@Configuration()
class IOCFilterCommand(GeneratingCommand):
    regex = Option(name='regex', require=True)
    ignoreCase = Option(name='ignorecase', require=False, default=False, validate=validators.Boolean())
    displayDisabled = Option(name='displaydisabled', require=False, default=False, validate=validators.Boolean())
    addTime = Option(name='addTime', require=False, default=False, validate=validators.Boolean())

    splice_conf = Config()
    db_connection_uri = splice_conf.get_mongo_connection_uri()
    
    spldb = DB(db_connection_uri)
    spldb.connect()

    def __init__(self):
	super(GeneratingCommand, self).__init__()

    def generate(self):

	res = self.spldb.get_indicators_that_match_regex(self.regex, self.ignoreCase, self.displayDisabled)

	for r in res:

		# adding creation time 
		if self.addTime :
			r['creation_time'] = self.spldb.get_creation_time(r['raw_id'])

		r['_time'] = time.time()
		r['_raw']  = ' '.join(['%s="%s"' % (k,v) for k,v in r.iteritems()])
		
		# moving None to 'None' or Splunk will ignore them
		for (k,v) in r.iteritems():
			if v == None :
				r[k] = "None"
		yield r

dispatch(IOCFilterCommand, sys.argv, sys.stdin, sys.stdout, __name__)

