import re
import sys
import csv
import json

import urllib2, base64

##########
# CONFIG #
##########
username = "<YOUR USERNAME>"
password = "<YOUR PASSWORD>"

########
# MAIN #
########
header  = ['cidr', 'circl_pssl'] 
    
preg_cidr  = re.compile("^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(/\d{1,2})?$")
preg_hexa  = re.compile("^[a-fA-F0-9]+$")
auth_basic = base64.encodestring('%s:%s' % (username, password)).replace('\n', '')

csv_in  = csv.DictReader(sys.stdin) # automatically use the first line as header
csv_out = csv.DictWriter(sys.stdout, header)
csv_out.writerow(dict(zip(header,header))) # write header

for row in csv_in:

	cidr = row['cidr'].strip()

	# check cidr format
	ret = preg_cidr.search(cidr) 
	if not ret :
		row['circl_pssl'] = json.dumps({'pssl_error' : 'input is not a valid CIDR notation - PyPSSL only support IPv4.'})
		csv_out.writerow(row)
		continue

	# check block size
	block = ret.group(1)
	if block == None :
		block = 32
	else: 
		block = int(block[1:])

		if block < 23 :
			row['circl_pssl'] = json.dumps({'pssl_error' : 'minimum CIDR block size authorized is /23'})
			csv_out.writerow(row)
			continue

	# query - ex https://www.circl.lu/pssl/query/172.228.24.0/28
	url  = "https://www.circl.lu/pssl/query/%s" % cidr

	try:
		request = urllib2.Request(url)
		request.add_header("Authorization", "Basic %s" % auth_basic)   
		result = urllib2.urlopen(request)

		row['circl_pssl'] = result.read()

	except Exception, e:
		raise

	# return row to Splunk
	csv_out.writerow(row)

