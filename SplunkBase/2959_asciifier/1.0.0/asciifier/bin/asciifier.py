#!/usr/bin/env python
#
# Written by Sebastien Tricaud
#

import sys
import csv

def asciify(word):
    asciified = 0
    for c in word:
        asciified += ord(c)
    return asciified

header = ['word', 'asciified']

csv_in  = csv.DictReader(sys.stdin)
csv_out = csv.DictWriter(sys.stdout, header)
csv_out.writerow(dict(zip(header,header)))

for row in csv_in:
	word = row['word'].strip()
	row['asciified'] = asciify(word)
	csv_out.writerow(row)

        
        
