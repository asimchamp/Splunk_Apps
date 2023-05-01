#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
This script return the suffix/prefixes hashes
"""

import sys
import csv
import json
import hashlib

from gsfb.canonicalization import Canonicalization
from gsfb.logger           import GSBLogger

logger = GSBLogger()
Canon  = Canonicalization()

header = ['url', 'url_prefixes']

csv_in  = csv.DictReader(sys.stdin) # automatically use the first line as header
csv_out = csv.DictWriter(sys.stdout, header)
csv_out.writerow(dict(zip(header,header))) # write header

for row in csv_in:

	try:
		url = row['url'].strip()

		permutations = Canon.Suffix_Prefix_Expression_Lookup( url )
		prefixes = []
		#i = 0
		for p in permutations:
			hash   = hashlib.sha256(p).hexdigest()
			prefix = hash[0:8]

			prefixes.append( {'gsfb_hash':hash, 'gsfb_prefix':prefix, 'gsfb_expression': p} )
			#prefixes[ i ] = {'gsfb_hash':hash, 'gsfb_prefix':prefix, 'gsfb_expression': p}
			#i += 1
		row['url_prefixes'] = json.dumps(prefixes)
	except Exception, e:
		logger.write("ERROR", e)

	csv_out.writerow(row)

