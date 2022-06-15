#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import csv

from gsfb.logger import GSBLogger
from gsfb.api    import GoogleSafeBrowsing
from gsfb.config import Config

########
# MAIN #
########
header = ['hash', 'prefix_length', 'confirmed_lists']
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
		hash = row['hash'].strip()
		prefix_length = int(row['prefix_length'].strip())

		ret = GSB.RequestFullLengthHashes(hash[0:prefix_length*2], prefix_length)

		lists = {}
		for r in ret :
			if r['hash'] == hash :
				lists[ r['list_name'] ] = 1

		row['confirmed_lists'] = ", ".join( lists.keys() )

	except Exception, e:
		logger.write("ERROR", e)

	csv_out.writerow(row)

