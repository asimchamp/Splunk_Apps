#!/usr/bin/env python
import csv
import sys
import subprocess

import platform

def main():

    if( len(sys.argv) != 4 ):
        print "Usage: python %s auto ar \"hello world\"" % sys.argv[0]
        sys.exit(0)
	
    # detect system architecture 'x86_64'
    phantomjs_binary = "phantomjs-1.9.2-linux-i686"
    if( platform.machine().endswith("64") ):
        phantomjs_binary = "phantomjs-1.9.2-linux-x86_64"

    header  = ['inlang', 'outlang', 'intext', 'outtext']
    csv_in  = csv.DictReader(sys.stdin) # automatically use the first line as header
    csv_out = csv.DictWriter(sys.stdout, header)

    # write header
    csv_out.writerow(dict(zip(header,header)))

    for row in csv_in:
	lang_in  = row['inlang']
	lang_out = row['outlang']
	text_in  = row['intext']

	cmd = "./%s ./gTranslate.js " % phantomjs_binary
	cmd += "%s " % lang_in
	cmd += "%s " % lang_out
	cmd += "\"%s\" " % text_in
	#cmd += " 2>/dev/null"

	try:
        	proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
		p_out, p_err = proc.communicate()

		row['outtext'] = p_out
		csv_out.writerow(row)
	except Exception, e:
		raise(str(e))

# MAIN 
main()
