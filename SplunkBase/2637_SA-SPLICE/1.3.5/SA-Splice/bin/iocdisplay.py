#!/usr/bin/env python

"""
| iocdisplay indicator_id="example:Address-7e3827ad-9019-494a-b8ae-2c24c3749442,example:Object-1980ce43-8e03-490b-863a-ea404d12242e"
| iocdisplay indicator_raw_id="542b716feaa76eb49c7be3e6"
| iocdisplay ioc_id="opensource:Package-c6afaad1-92e7-4c01-b18f-eb3fdca0247d"
| iocdisplay raw_id="542b716feaa76eb49c7be3e6"

Display the raw IOCs based on the provided id list (comma separated).
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

class IOCDisplayCommand(GeneratingCommand):
    indicator_raw_id = Option(name='indicator_raw_id', require=False, default="-")
    indicator_id = Option(name='indicator_id', require=False, default="-")
    ioc_id = Option(name='ioc_id', require=False, default="-")
    raw_id = Option(name='raw_id', require=False, default="-")

    splice_conf = Config()
    db_connection_uri = splice_conf.get_mongo_connection_uri()

    spldb = DB(db_connection_uri)
    spldb.connect()

    def __init__(self):
	super(GeneratingCommand, self).__init__()

    def generate(self):

	# the dash is a special keywords used by the dashboards
	if self.raw_id == "-" :
		self.raw_id = "None"
	if self.ioc_id == "-" :
		self.ioc_id = "None"
	if self.indicator_id == "-" :
		self.indicator_id = "None"
	if self.indicator_raw_id == "-" :
		self.indicator_raw_id = "None"

	if (self.raw_id == "None") and (self.ioc_id == "None") and (self.indicator_id == "None") and (self.indicator_raw_id == "None"):
		raise ValueError("specify either (ioc_id|raw_id|indicator_id|indicator_raw_id)=\"<id list, comma separated>\" ")

	ioc_raw_id_list = []

	# retrive all IOCs
	if self.ioc_id == "*" or self.indicator_id == "*" or self.raw_id == "*" or self.indicator_raw_id == "*":
		ioc_raw_id_list = self.spldb.get_all_raw_ids()

	else:
		# retrieve one or more IOC by their IDs
		if self.ioc_id != "None" :    
			tmp = self.ioc_id.split(",")
			ioc_raw_id_list += self.spldb.get_raw_id_list_by_ioc_id_list(tmp)

		# retrieve one or more IOC by their Indicator IDs
		if self.indicator_id != "None" : 
			tmp = self.indicator_id.split(",")
			ioc_raw_id_list += self.spldb.get_raw_id_list_by_indicator_id_list(tmp)
	
		if self.raw_id != "None" :
			tmp = self.raw_id.split(",")
			ioc_raw_id_list += self.spldb.get_raw_id_list_by_raw_id_string_list(tmp)

		if self.indicator_raw_id != "None" :
			tmp = self.indicator_raw_id.split(",")
			ioc_raw_id_list += self.spldb.get_raw_id_list_by_indicator_raw_id_list(tmp)


	ioc_raw_id_list = list(set( ioc_raw_id_list )) # remove possible duplicates

	number_of_iocs = len(ioc_raw_id_list)
	for id in ioc_raw_id_list:
	
		ioc = self.spldb.get_ioc_by_raw_id(id)
			
		ret = {}
		ret['_time'] = time.time()
		ret['_raw']  = "ioc_id=\"%s\" raw_id=\"%s\"" % (ioc['ioc_id'], ioc['raw_id'])
		ret['number_of_iocs'] = number_of_iocs

		# all keys must be known in advanced and present in every events.
		keys = [
			'path', 'type', 'revision', 'path_size', 
			'creation_time', 'modification_time', 'path_mtime', 
			'content', 'stanza_name', 
			'parse_flag', 'parsing_failed', 'parsing_error',
			'ioc_id', 'raw_id'
		]

		for k in keys:
			ret[ k ] = None

		for (k,v) in ioc.iteritems():
			if not k in keys: # just skipping this (new|unknown) key
				continue
			ret[ k ] = v
		yield ret
		
dispatch(IOCDisplayCommand, sys.argv, sys.stdin, sys.stdout, __name__)

