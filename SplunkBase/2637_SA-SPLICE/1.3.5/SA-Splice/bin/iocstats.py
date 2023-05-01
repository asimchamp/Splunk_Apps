#!/usr/bin/env python

"""
| iocstats stat=number_of_indicators_per_type
	value_type,type,count
	ipv4-addr,value,74
	ipv4-addr,regex,2
	domain,value,35
	...

| iocstats stat=number_of_iocs
	number_of_iocs
	732

| iocstats stat=ioc_sharing_indicators
	indicator_id,number_of_ioc_refering_it
	ab1234,3
	cf234,2

> schedule those commands to run hourly for example => have nice timechart then.

"""

import re
import sys
import time

from splice.ioc      import IOC
from splice.config   import Config
from splice.database import DB

from splunklib.searchcommands import \
    dispatch, GeneratingCommand, Configuration, Option, validators, Validator

@Configuration()

class IOCStatsCommand(GeneratingCommand):
    stat = Option(name='stat', require=True, validate=validators.Fieldname())

    # create function with the same name and the calls will be automatic.
    # those functions should return valid Splunk events ({..})
    statistics = [
	'number_of_iocs', 
	'number_of_iocs_having_parsing_issues', 
	'number_of_indicators_per_type',
	'list_iocs_sharing_indicators'
    ]

    splice_conf       = Config()
    db_connection_uri = splice_conf.get_mongo_connection_uri()

    spldb = DB(db_connection_uri)
    spldb.connect()

    def __init__(self):
	super(GeneratingCommand, self).__init__()

    def number_of_iocs(self):
	nIOCs = self.spldb.get_number_of_iocs()
	return [{'_time': time.time(), '_raw':nIOCs, 'number_of_iocs':nIOCs}]

    def number_of_indicators_per_type(self):
	ret = []
	res = self.spldb.get_number_of_indicators_per_type()
	for r in res:
		r['_time'] = time.time()
		ret.append( r )
	return ret

    def number_of_iocs_having_parsing_issues(self):
	res = self.spldb.get_number_of_iocs_having_parsing_issues()
	return [{'_time': time.time(), '_raw':res, 'number_of_iocs_having_parsing_issues':res}]

    def list_iocs_sharing_indicators(self):
	return self.spldb.get_list_iocs_sharing_indicators()


    def generate(self):

	if self.stat == "list":
		for s in self.statistics:
			yield {'_time': time.time(), '_raw': s}

	elif not self.stat in self.statistics:
		yield {'_time': time.time(), '_raw': 'unrocognized stat command "%s"' % self.stat }

	else:
		result = getattr(self, self.stat)()
		for r in result:
			if not '_time' in r:
				r['_time'] = time.time()
			if not '_raw' in r:
				r['_raw'] = str(r)
			yield r	

dispatch(IOCStatsCommand, sys.argv, sys.stdin, sys.stdout, __name__)

