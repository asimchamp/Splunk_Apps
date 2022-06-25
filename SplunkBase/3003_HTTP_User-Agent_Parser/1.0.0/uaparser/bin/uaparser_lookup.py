#!/usr/bin/env python
import sys
import csv
import json

from rfc7231 import parse_user_agent

header  = ['http_user_agent', 'http_user_agent_parts']

csv_in  = csv.DictReader(sys.stdin) # automatically use the first line as header
csv_out = csv.DictWriter(sys.stdout, header)
csv_out.writerow(dict(zip(header,header))) # write header

for row in csv_in:

	try:
		ret = parse_user_agent( row['http_user_agent'] )
		row['http_user_agent_parts'] = json.dumps(ret)
	except Exception, e:
		row['http_user_agent_parts'] = json.dumps({"ERROR": str(e)})
		#raise e

	# return row to Splunk
	csv_out.writerow(row)

