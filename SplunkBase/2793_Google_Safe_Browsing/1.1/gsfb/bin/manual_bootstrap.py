#!/usr/bin/env python
# -*- coding: utf-8 -*-

welcome = """
------------------------------------------------------------------------------

This script helps to bootstrap the Google Safe Browsing app for Splunk. 
It grabs all the chunks _without_ respecting any delay between 2 requests.

Normally, the protocol tell the client when it is allowed to send another 
request (to avoid being overloaded). This script does not respect this delay
and ask for the next chunks as soon as the previous request is completed.

------------------------------------------------------------------------------
IMPORTANT: 
----------
	by using this script you undertand that your account can be 
	(momentarily) blocked by Google.

------------------------------------------------------------------------------
"""
import os
import sys
import time

from gsfb.api   import GoogleSafeBrowsing
from gsfb.cache import Cache

##########
# CONFIG #
##########

# Lists to retrieve
lists = ['goog-malware-shavar', 'googpub-phish-shavar', 'goog-unwanted-shavar']

# Google API key
api_key   = "<YOUR GOOGLE API KEY>"

# KVStore parameters - usually only the username and the password have to be adjusted.
user     = 'admin'
password = 'admin'
host = 'localhost' 
port = 8089

########
# MAIN #
########


print welcome + '\n'
resp = raw_input("Do you understand? Yes/No ?\n> ")
if resp.lower() != "yes" :
	print "ok, quitting."
	sys.exit(1)
print "\n"


GSB   = GoogleSafeBrowsing(key=api_key)
Cache = Cache(fair_update=False, user=user, password=password, host=host, port=port)

# set and check the lists names
GSB.RequestLists(",".join(lists), True)
print "retrieving the following lists: %s" % ",".join(GSB._lists)

# alright, loop baby !
new_chunks = 1
n_err = 0
while (new_chunks > 0) and (n_err < 3) :

	try:
		req_body = Cache.getKnownChunksList(lists)
		data = GSB.RequestData(req_body)
		new_chunks = Cache.ProcessData(data)
		print "%s new chunks" % new_chunks
		n_err = 0
	except Exception, e:
		n_err += 1
		print "EXCEPTION CAUGHT-"
		print e
		time.sleep(60*5)

		if n_err > 2 :
			print "%s consecutives errors, quiting." % n_err

