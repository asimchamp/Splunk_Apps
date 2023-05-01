#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys

import splunklib.client  as client
import splunklib.results as results

from splunklib.modularinput import *
from gsfb.api   import GoogleSafeBrowsing
from gsfb.cache import Cache

class GoogleSafeBrowsingModularInput(Script):

    def get_scheme(self):
	"""
	Return the expected XML by Splunk Enterprise when it starts.
	"""

	scheme = Scheme("Google Safe Browsing")
	scheme.description = "Leverage Google Safe Browsing API in Splunk"

	# If single instance mode is enabled, each stanza defined in the script is run in the same instance. 
	# Otherwise, Splunk Enterprise launches a separate instance for each stanza.
	scheme.use_external_validation = False
	scheme.use_single_instance = False

	# Only available data types : 
	# data_type_boolean / data_type_boolean / data_type_number

	api_key = Argument("api_key")
	api_key.data_type = Argument.data_type_string
	api_key.description = "Your Google API key"
	api_key.required_on_create = True
	scheme.add_argument(api_key)

	fair_update = Argument("fair_update")
	fair_update.data_type = Argument.data_type_boolean
	fair_update.description = "If True, respect the update frequency set by the protocol. It is highly recommended to respect it."
	fair_update.required_on_create = True
	scheme.add_argument(fair_update)

	lists = Argument("lists")
	lists.data_type = Argument.data_type_string
	lists.description = "Retrieve and update the provided lists (ex: goog-malware-shavar). Comma separated list."
	lists.required_on_create = True
	scheme.add_argument(lists)

	kvuser = Argument('kvuser')
	kvuser.data_type   = Argument.data_type_string
	kvuser.description = "KVStore username"
	kvuser.required_on_create = True
	scheme.add_argument(kvuser)

	kvpass = Argument('kvpass')
	kvpass.data_type   = Argument.data_type_string
	kvpass.description = "KVStore password"
	kvpass.required_on_create = True
	scheme.add_argument(kvpass)

	kvhost = Argument('kvhost')
	kvhost.data_type   = Argument.data_type_string
	kvhost.description = "KVStore hostname or IP address"
	kvhost.required_on_create = True
	scheme.add_argument(kvhost)

	kvport = Argument('kvport')
	kvport.data_type   = Argument.data_type_number
	kvport.description = "KVStore rest-api port"
	kvport.required_on_create = True
	scheme.add_argument(kvport)

	# TODO: add proxy settings, required in some environments.

	return scheme

    def stream_events(self, inputs, ew):
        # Splunk Enterprise calls the modular input, 
        # streams XML describing the inputs to stdin,
        # and waits for XML on stdout describing events.

	# /opt/splunk/var/lib/splunk/modinputs/gsfb/
	checkpoint_dir = inputs.metadata['checkpoint_dir']

	for input_name, input_item in inputs.inputs.iteritems():
		stanza_name = input_name.split('/').pop() # gsfb://<NAME>

		try:
			api_key     = input_item['api_key']
			lists       = input_item['lists']
			fair_update = input_item['fair_update']
	
			kvuser = input_item['kvuser']
			kvpass = input_item['kvpass']
			kvhost = input_item['kvhost']
			kvport = input_item['kvport']

		except Exception, e:
			raise ValueError("key not set : %s" % e)

		try:
			_cache = Cache(checkpoint_dir=checkpoint_dir, fair_update=fair_update, logger=ew, user=kvuser, password=kvpass, host=kvhost, port=kvport)
			GSB   = GoogleSafeBrowsing(key=api_key, logger=ew)
		except Exception, e:
			raise ValueError(e)

		GSB.RequestLists(lists, True) 
		lists_str = ",".join(GSB._lists)

		# first message for dashboards
		event = Event()
		event.stanza = input_name
		event.data   = 'stanza="%s" action="update" lists="%s" ' % (stanza_name, lists_str)
		ew.write_event(event)

		# are we allowed to run?
		if not _cache.allowed_to_run() :
			ew.log("INFO", 'not allowed to run yet (stanza: %s, lists: %s)' % (stanza_name, lists_str))
			event = Event()
			event.stanza = input_name
			event.data   = 'stanza="%s" action="update-skipped" lists="%s" reason="not allowed to run yet"'%(stanza_name,lists_str)
			ew.write_event(event)
			continue
	
		# yes, update the lists
		req_body = _cache.getKnownChunksList(lists)
		data = GSB.RequestData(req_body)
		ret  = _cache.ProcessData(data)

		event = Event()
		event.stanza = input_name
		ew.log("INFO", '%s new chunks (stanza: %s, lists: %s)' % (ret, stanza_name, lists_str))
		event.data = 'stanza="%s" action="updated" lists="%s" reason="%s new chunks"' % (stanza_name, lists_str, ret)
		ew.write_event(event)

	# eof stream_events() / run()

if __name__ == "__main__":
	sys.exit(GoogleSafeBrowsingModularInput().run(sys.argv))

