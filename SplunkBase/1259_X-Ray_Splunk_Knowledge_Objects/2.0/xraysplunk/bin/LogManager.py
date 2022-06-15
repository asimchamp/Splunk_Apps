#!/usr/bin/python
import time
from datetime import datetime
import os
import sys

log_file_name=''
# Log levels
#    null = all
#    2 = function call trace
#    3 = warnings
#    4 = errors
#    5 = always
min_log_level = 3

# append or clear log file?
logAppend = False

def write_to_log(logLine, logLevel=''):
    if logLevel == '' or logLevel >= min_log_level:
        logFile = open(log_file_name, "a")
        if logLevel==5:
            logFile.write("\n")  # to put a blank line in front of important stuff
        logFile.write(str(datetime.now()) + " " + logLine + "\n")
        logFile.close()

def set_logfile_name(sep):
    global log_file_name
    cur_dir=os.path.abspath(sys.argv[0])
    dirs = cur_dir.split(sep)
    output_dir=sep.join(str(a) if a else '' for a in dirs[0:len(dirs)-2])
    log_file_name=output_dir + sep + "logs" + sep + "read_conf_files.log"

    if not logAppend:
        #clear the log file
        logFile = open(log_file_name, "w")
        logFile.close()

    return output_dir
