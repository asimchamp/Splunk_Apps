#!/usr/bin/python
import sys
import splunk.Intersplunk
import re
import os
from platform import system
import stat

# accepts a regular expression as a command line argument
# lists all the files (and the line numbers in each) where
# the regular expression occurs

# limits its search to #SPLUNK_HOME/etc and files *.conf *.xml
# by default

# DOES NOT FOLLOW symbolic links to other directories

files_to_process = [ r'\.conf$', r'\.xml$'] # the files to search
rex=' '  # the regular expression to search for
results=[]

################## Functions  ######################

def get_rex():
    rex = ''

def examine_file(path):
    fd = open(path,"r")
    lcount = 0
    for line in fd:
        lcount = lcount + 1
        if re.search(rex,line):
            results.append({'file_path' : path , 'line_count' : lcount , 'line_text' : line})

def file_match(fname):
    for f in files_to_process:
        if re.search(f,fname):
            return True
    return False

def walk_dirs(pathToWalk,sep):
    for root, dirs, files in os.walk(pathToWalk):
        for f in files:
            if file_match(f):
                path = root + sep + f
                mode = os.stat(path).st_mode
                if stat.S_ISLNK(mode):
                    pass   #always skip symbolic links
                else:
                    examine_file(path)
        for d in dirs:
            path = root + sep + d
            mode = os.stat(path).st_mode
            if stat.S_ISLNK(mode):
                pass  #always skip symbolic links
            else:
                walk_dirs(d,sep)

################## Main ######################
if __name__ == '__main__':
    try:

        (isgetinfo, sys.argv) = splunk.Intersplunk.isGetInfo(sys.argv)
        args, kwargs = splunk.Intersplunk.getKeywordsAndOptions()

        if isgetinfo:
            # streaming, generating, retevs, reqsop, preop
            splunk.Intersplunk.outputInfo(False, True, False, False, None)

        rex = kwargs.get('rex')

        if rex == None or rex=="":
            si.generateErrorResults("'rex' argument required")
            exit(0)

        if system() == 'Windows':
            sep = '\\'
        else:
            sep = '/'

        # figure out where etc directory starts
        dirstr = os.path.abspath(sys.argv[0])
        dirs = dirstr.split(sep)
        # drop the last 3 parts of the path (/apps/appname/bin) to get back to etc
        splunk_etc=sep.join(str(a) if a else '' for a in dirs[0:len(dirs)-4])

        walk_dirs(splunk_etc, sep)
        splunk.Intersplunk.outputResults(results)

    except Exception, e:
            import traceback
            stack =  traceback.format_exc()
            splunk.Intersplunk.generateErrorResults("Error '%s'. %s" % (e, stack))
