import sys
import csv
import socket

# simple and naive script to resolv domain names to ip address

header  = ['domain', 'ip']

csv_in  = csv.DictReader(sys.stdin) # automatically use the first line as header
csv_out = csv.DictWriter(sys.stdout, header)
csv_out.writerow(dict(zip(header,header))) # write header

for row in csv_in:

	domain = row['domain'].strip()

	try:
		ipv4_str = socket.gethostbyname(domain)
	except:
		ipv4_str = "None"

	row['ip'] = ipv4_str

	csv_out.writerow(row)

