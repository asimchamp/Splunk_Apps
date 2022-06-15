#!/usr/bin/env python

"""
| ioctoggle indicator_id="example:Address-7e3827ad-9019-494a-b8ae-2c24c3749442,example:Object-1980ce43-8e03-490b-863a-ea404d12242e"
| ioctoggle indicator_raw_id="542b716feaa76eb49c7be3e6"
| ioctoggle ioc_id="opensource:Package-c6afaad1-92e7-4c01-b18f-eb3fdca0247d"
| ioctoggle raw_id="542b716feaa76eb49c7be3e6"

Change the state of the provided IOCs or Indicators. 
If state is enabled  then it becomes disabled.
If state is disabled then it becomes enabled.
id list (comma separated).
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

class IOCToggleCommand(GeneratingCommand):
    indicator_raw_id = Option(name='indicator_raw_id', require=False, default="-")
    indicator_id = Option(name='indicator_id', require=False, default="-")
    ioc_id = Option(name='ioc_id', require=False, default="-")
    raw_id = Option(name='raw_id', require=False, default="-")
    all    = Option(name='all', require=False, default="-")

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
	if self.all == "-" :
		self.all = "None"

	if (self.raw_id == "None") and (self.ioc_id == "None") and (self.indicator_id == "None") and (self.indicator_raw_id == "None"):
		raise ValueError("specify either (ioc_id|raw_id|indicator_id|indicator_raw_id)=\"<id list, comma separated>\" ")

	all = self.all.lower()
	if (all != "none") and (not all in ['enabled', 'disabled']) :
		raise ValueError("if set, the 'all' parameter should be either 'enabled' or either 'disabled'.")

	# TODO:
	# - add support for wildcard

	#if self.ioc_id == "*" or self.indicator_id == "*" or self.raw_id == "*" or self.indicator_raw_id == "*":
	#	ioc_raw_id_list = self.spldb.get_all_raw_ids()

	indicators_id = []
	indicators_raw_id = []
	raws_id = []
	iocs_id = []

	if self.ioc_id != "None" :
		iocs_id = self.ioc_id.split(",")
	if self.raw_id != "None" :
		raws_id = self.raw_id.split(",")
	if self.indicator_id != "None" :
		indicators_id = self.indicator_id.split(",")
	if self.indicator_raw_id != "None" :
		indicators_raw_id = self.indicator_raw_id.split(",")
	
	toggled_items = self.spldb.toggle_indicator_state(raws_id, iocs_id, indicators_id, indicators_raw_id, all)
	
	yield  {'result': 'Toggled %s indicators' % toggled_items}

dispatch(IOCToggleCommand, sys.argv, sys.stdin, sys.stdout, __name__)

