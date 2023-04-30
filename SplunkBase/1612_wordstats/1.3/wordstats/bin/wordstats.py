#!/usr/bin/env python
import re
import csv
import sys
import math

#######
# TIP #
#######
# Consider using the dedup or stats command _before_ calling wordstats
# to avoid counting multiple times the same words

# Calculate the shannon's entropy
def shannon(occurrences, word_length):
	entropy = 0.0

	for o in occurrences:
		p = float( occurrences[ o ] ) / float(word_length)
		entropy -= p * math.log(p, 2) # Log base 2
    
	return entropy
# eof shannon()

def identify_suite(word, pattern):
        max   = 0
        parts = re.findall(r"([%s]+)" % pattern, word.lower())
        for p in parts:
                l = len(p)
                if l > max:
                        max = l
        return max
# eof identify_suite()


if( len(sys.argv) != 2 ):
	print "search .. | lookup wordstats word as <field name>"
	sys.exit(0)

header  = ['word',
	'ws_nbVowel', 'ws_nbPunctuation', 'ws_nbConsonant', 'ws_nbNumeric', 
	'ws_nbDot', 'ws_nbDash', 'ws_nbUnderscore', 'ws_nbElse', 
	'ws_usePunnyCode', 'ws_isIPv4', 'ws_entropy', 'ws_length',
	'ws_containsIPv4', 'ws_nbTypography', 'ws_nbUppercase', 'ws_nbLowercase',
	'ws_nbAlphaNum', 'ws_nbAlpha', 'ws_nbOf', 'ws_suiteConsonant', 
	'ws_suiteVowel', 'ws_suiteNumeric'
]

csv_in  = csv.DictReader(sys.stdin) # automatically use the first line as header
csv_out = csv.DictWriter(sys.stdout, header)

# write header
csv_out.writerow(dict(zip(header,header)))

for row in csv_in:
	word = row['word'].strip()

	# counters init
	row['ws_nbVowel']       = 0
	row['ws_nbPunctuation'] = 0
	row['ws_nbTypography']  = 0
	row['ws_nbConsonant']   = 0
	row['ws_nbNumeric']     = 0
	row['ws_nbDot']         = 0
	row['ws_nbDash']        = 0
	row['ws_nbUnderscore']  = 0
	row['ws_nbElse']        = 0
	row['ws_usePunnyCode']  = 0
	row['ws_containsIPv4'] =  0 
	row['ws_isIPv4']        = 0
	row['ws_entropy']       = 0
	row['ws_length']        = len(word)
	row['ws_nbUppercase']   = 0
	row['ws_nbLowercase']   = 0
	row['ws_nbAlpha']       = 0
	row['ws_nbAlphaNum']    = 0
	row['ws_nbOf']          = ""
	row['ws_suiteConsonant']= 0
	row['ws_suiteVowel']    = 0
	row['ws_suiteNumeric']  = 0

	# use 'xn--' ?
	if( re.search('xn--', word) ):
		row['ws_usePunnyCode'] = 1

	# IPV4: not accurate because can match 99.99.99.99 for example. 
	if( re.search('\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', word) ):
		row['ws_containsIPv4'] = 1
		if( re.search('^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', word) ):
			row['ws_isIPv4'] = 1

	# count every chars / no upper/lower case distinction
	occurs = {}
	for c in word:
		if( c in occurs ):
			occurs[ c ] += 1
		else:
			occurs[ c ] = 1
	row['ws_entropy'] = shannon(occurs, row['ws_length'])

	# ... | lookup wordstats word as cs_uri | spath input=ws_nbOf | table ws_nbOf*
	json = "{ \"ws_nbOf\" : {"
	for c in occurs:
		if( (c<'0') or (c>'z') or ((c>'9') and (c<'A')) or ((c>'Z') and (c<'a')) ):
			json += "\"%X\": \"%s\"," % (ord(c), occurs[c])
		else:
			json += "\"%s\": \"%s\"," % (c, occurs[c])
	json = re.sub(',$','',json) # remove the last useless comma
	json += "}}"
	row['ws_nbOf'] =  json
	
	# There is a higher probality to
	# have a consonant than anything else
	for c in occurs:

		if( (c >= 'A') and (c <= 'Z') ):
			row['ws_nbUppercase'] += occurs[c]
		elif( (c >= 'a') and (c <= 'z') ):
			row['ws_nbLowercase'] += occurs[c]

		# now, work in lowercase
		occ = occurs[c]
		c   = c.lower()

		if( c in ['b','c','d','f','g','h','j','k','l','m','n','p','q','r','s','t','v','w','x','z'] ):
			row['ws_nbConsonant'] += occ
			continue

		if( c in ['a','e', 'i', 'o', 'u', 'y'] ):
			row['ws_nbVowel'] += occ
			continue

		if( c in ['0','1', '2', '3', '4', '5', '6', '7', '8', '9'] ):
			row['ws_nbNumeric'] += occ
			continue

		# Punctuation -- http://en.wikipedia.org/wiki/Punctuation
		if( c in ['\'', '"', '[',']','(',')','{','}','<','>',':',',','-','!','.', '?',';','/'] ):
			row['ws_nbPunctuation'] += occ

			# dns valid punctuation
			if( c == '.' ):
				row['ws_nbDot'] += occ
				continue
			if( c == '-' ):
				row['ws_nbDash'] += occ
				continue
			continue

		# Typography -- http://en.wikipedia.org/wiki/Punctuation
		if( c in ['&', '*', '@', '\\',  '^',  '#',  '%',  '~',  '_',  '|'] ):
			row['ws_nbTypography'] += occ
			
			if( c == '_' ):
				row['ws_nbUnderscore'] += occ
				continue
			continue

		row['ws_nbElse'] += occ

	# identify suites
	row['ws_suiteConsonant']= identify_suite(word, "bcdfghjklmnpqrstvwxz")
	row['ws_suiteVowel']    = identify_suite(word, "aeiouy")
	row['ws_suiteNumeric']  = identify_suite(word, "0123456789")

	# Aggregate few counters for usuability
	row['ws_nbAlpha']    = row['ws_nbConsonant']  + row['ws_nbVowel']
	row['ws_nbAlphaNum'] = row['ws_nbAlpha'] + row['ws_nbNumeric']

	# return row to Splunk
	csv_out.writerow(row)

