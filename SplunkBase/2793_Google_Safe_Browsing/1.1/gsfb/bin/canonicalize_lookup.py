#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
This script only return a canonicalized url
"""

import sys
import csv

from gsfb.canonicalization import Canonicalization
from gsfb.logger           import GSBLogger

logger = GSBLogger()
Canon  = Canonicalization()

header = ['url', 'url_canonicalized']

csv_in  = csv.DictReader(sys.stdin) # automatically use the first line as header
csv_out = csv.DictWriter(sys.stdout, header)
csv_out.writerow(dict(zip(header,header))) # write header

for row in csv_in:

	try:
		url = row['url'].strip()
		row['url_canonicalized'] = Canon.canonicalize(url)
	except Exception, e:
		logger.write("ERROR", e)

	csv_out.writerow(row)

