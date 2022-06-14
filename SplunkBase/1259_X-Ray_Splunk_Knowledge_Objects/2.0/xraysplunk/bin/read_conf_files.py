#!/usr/bin/python
from ConfFilesClass import *
from DDItemsClass import *
from XMLFilesClass import *
from LogManager import *
import time
from datetime import datetime
import sys
import os
import re
from platform import system
import stat
import ntpath


# script to collect the "Data Dictionary" of a splunk instance
# The DD is written to a .CSV that can be used as a lookup for dashbaords, etc

# Two passes
#   1 - Identify all item definitions from .conf files
#   2 - Find all uses of items
#   3 - process XML files (forms, views and dashboards)

# Version 2 - cleaned up major problems with file iteration
#             added lookups (excluding automatic lookups)

conf_files=[]    # a list of the conf file objects to examine
dd = []          # list of items

files_to_process = [ 'macros.conf', 'savedsearches.conf',
                    'tags.conf', 'eventtypes.conf', 'transforms.conf']
types_of_items = ['macro','search', 'tag', 'eventtype', 'lookup']
files_to_skip = [ '/etc/system/default/', '/etc/apps/xraysplunk', '/etc/users/splunk-system-user' ]

recur_depth = 0  # depth of recursion - for debugging

################## Functions  ######################

def skip_file(path,name,sep):
    n = path + sep + name
    #write_to_log("skip_file(path,name,sep): n=" + n + " sep=" + sep, 2)
    for f in files_to_skip:
        if f in n:
            return True
    return False

def create_objects(path,f,sep):
    # reads and parses .conf files
    write_to_log("create_objects(f): f=" + f + " sep=" + sep, 2)

    #based on type of file, creates approp file object
    if f == 'macros.conf':
        fileObj = Macros_Conf(f,path)
        item_type='macro'
        write_to_log("create_objects: created fileObj for macro: path=" + path,1)
    else:
        if f == 'savedsearches.conf':
            fileObj = Savedsearches_Conf(f,path)
            item_type='search'
            write_to_log("create_objects: created fileObj for search: path=" + path,1)
        else:
            if f == 'tags.conf':
                fileObj = Tags_Conf(f,path)
                item_type='tag'
                write_to_log("create_objects: created fileObj for tag: path=" + path,1)
            else:
                if f == 'eventtypes.conf':
                    fileObj = Eventtypes_Conf(f,path)
                    item_type='eventtype'
                    write_to_log("create_objects: created fileObj for eventtype: path=" + path,1)
                else:
                    if f == 'transforms.conf':
                        fileObj = Transforms_Conf(f,path)
                        item_type='lookup'
                        write_to_log("create_objects: created fileObj for transforms: path=" + path,1)
                    else:
                        fileObj = Conf_File(f,path)
                        item_type=''
                        write_to_log("create_objects: created fileObj for unknown item type:" + path,1)
    # Add the .conf file to the list
    conf_files.append(fileObj)

    # collect the stanza info from the new .conf file object
    stanza_list = fileObj.get_all_item_definitions()
    if stanza_list == None:
        return

    # for each item in the stanza list, create the appropriate type of object
    for s in stanza_list:
        if item_type=='search':
            i = DD_Item(s, item_type, fileObj.name, fileObj.path, sep)
            write_to_log("create_objects: DD_Item created for search, name=" + s, 1)
        else:
            if item_type=='tag':
                i = Tag_Item(s, item_type, fileObj.name, fileObj.path, sep)
                write_to_log("create_objects: Tag_Item created, name=" + s, 1)
            else:
                if item_type=='macro':
                    i = Macro_Item(s, item_type, fileObj.name, fileObj.path, sep)
                    write_to_log("create_objects: Macro_Item created, name=" + s, 1)
                else:
                    if item_type=='eventtype':
                        i = Eventtype_Item(s, item_type, fileObj.name, fileObj.path, sep)
                        write_to_log("create_objects: Eventtype_Item created, name=" + s, 1)
                    else:
                        if item_type=='lookup':
                            i = Lookup_Item(s, item_type, fileObj.name, fileObj.path, sep)
                            write_to_log("create_objects: Lookup_Item created, name=" + s, 1)
                        else:
                            i = DD_Item(s, item_type, fileObj.name, fileObj.path, sep)
                            write_to_log("create_objects: DD_Item created, name=" + s, 1)
        dd.append(i)
    fileObj.shrink()

def walk_dirs(pathToWalk,sep):
    write_to_log("walk_dirs " + " pathToWalk=" + pathToWalk, 2)
    for root, dirs, files in os.walk(pathToWalk):
        write_to_log("walk_dirs Processing directory: " + root, 2)
        for f in files:
            if skip_file(root,f,sep):
                pass
            else:
                path = root + sep + f
                mode = os.stat(path).st_mode
                if stat.S_ISLNK(mode):
                    pass   #always skip symbolic links
                else:
                    if f in files_to_process:
                        create_objects(path,f,sep)

def get_files_and_stanzas(sep):
    write_to_log("get_files_and_stanzas()",2)
    # should create an object for each file, based on its type

    dirstr = os.path.abspath(sys.argv[0])
    dirs = dirstr.split(sep)
    # drop the last 3 parts of the path (/apps/appname/bin) to get back to etc
    splunk_etc=sep.join(str(a) if a else '' for a in dirs[0:len(dirs)-4])
    write_to_log("  Starting at directory: " + splunk_etc,4)
    for name in ['system', 'apps', 'users']:
        write_to_log("  Processing subdirectory: " + name ,4)
        dirToWalk = splunk_etc + sep + name
        walk_dirs(dirToWalk, sep)
    return

def remove_existing_lookps(dir,sep):
    write_to_log("remove_existing_lookups(dir): dir=" + dir,2)
    dir = dir + sep + 'lookups'
    for root, dirs, files in os.walk(dir):
        for f in files:
            if f.endswith(".csv") or f.endswith(".csv.index"):
                file_to_remove = dir + sep + f
                os.remove(file_to_remove)
                write_to_log("remove_existing_lookups(dir): deleted file=" + file_to_remove,1)

################## Main ######################

if system() == 'Windows':
    sep = '\\'
else:
    sep = '/'

output_dir=set_logfile_name(sep)

write_to_log("Pass 1 - Identify entities\n",5)
get_files_and_stanzas(sep)

write_to_log("Pass 2 - Identify usage\n",5)
for conf_file in conf_files:
    conf_file.extract_usage(dd)

write_to_log("Pass 3 - Process XML files (dashboards and forms)\n",5)
walk_and_process_XML_files(sep,dd)

write_to_log("Cleaning directory - " + output_dir + "\n",5)
remove_existing_lookps(output_dir,sep)

output_file=output_dir + sep + "lookups" + sep + "ko_dd.csv"

write_to_log("Writing CSV file - " + output_file + "\n",5)

oFile = open(output_file,"w")
first_line=True
for itemObj in dd:
    if first_line:
        first_line=False
        itemObj.write_csv_header(oFile)
    itemObj.write_csv(oFile)
oFile.close()

output_file=output_dir + sep + "lookups" + sep + "ko_dd_mapping.csv"

write_to_log("Writing CSV file - " + output_file + "\n",5)

oFile = open(output_file,"w")
first_line=True
for itemObj in dd:
    if first_line:
        first_line=False
        itemObj.write_csv_header_map(oFile)
    itemObj.write_csv_map(oFile)
oFile.close()

write_to_log("Finished",5)
