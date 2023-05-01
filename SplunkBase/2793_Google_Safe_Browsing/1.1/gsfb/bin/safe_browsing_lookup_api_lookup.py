#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
This is the implementation of the Google Safe Browsing lookup API.
It's not linked to the Google Safe Browsing API (the protocol).
"""

import os
import sys
import csv

from gsfb.logger import GSBLogger
from gsfb.api    import GoogleSafeBrowsing
from gsfb.config import Config

########
# MAIN #
########
header = ['url', 'verdict']
logger = GSBLogger()

try:
	cfg = Config()
	api_key = cfg.get_api_key_from_local_inputs_conf()
	GSB     = GoogleSafeBrowsing(key=api_key)
except Exception, e:
	logger.write("ERROR", e)
	sys.exit(1)

csv_in  = csv.DictReader(sys.stdin) # automatically use the first line as header
csv_out = csv.DictWriter(sys.stdout, header)
csv_out.writerow(dict(zip(header,header))) # write header

for row in csv_in:

	try:
		url = row['url'].strip()

		ret = GSB.InlineLookupAPI( [url] )
		row['verdict'] = ret[0]['verdict']

	except Exception, e:
		logger.write("ERROR", e)

	csv_out.writerow(row)

