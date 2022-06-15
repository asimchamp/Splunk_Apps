#!/usr/bin/python
from DDItemsClass import *
from LogManager import *
import time
import sys
import os
import re
import stat

# Version 2 - cleaned up major problems with file iteration

def parse_results(results,dd):
    write_to_log("parse_results(results,dd)",2)
    found_item_list = []
        # given a re match object containing a search string, find the items
        # return a list of items that were found in the search string
    for r in results:
        searchString = r.group('search')
        for i in dd:
            if i.match(searchString):
                found_item_list.append(i)
    return found_item_list

def walk_dirs_for_XML(pathToWalk,sep,dd):
    #write_to_log("walk_dirs_for_XML(pathToWalk,sep,dd)",2)
    for root, dirs, files in os.walk(pathToWalk):
        write_to_log("walk_dirs_for_XML(pathToWalk,sep): Processing directory: " + root + " sep=" + sep, 2)
        for f in files:
            if f.lower().endswith(".xml") and root.lower().endswith("views"):
                path = root + sep + f
                mode = os.stat(path).st_mode
                if stat.S_ISLNK(mode):
                    pass   #always skip symbolic links
                else:
                    write_to_log("walk_dirs_for_XML(pathToWalk,sep): Processing file: " + path, 2)
                    x = XML_File('not yet known',f,path,'xml')
                    x.process_file(dd,sep)

def walk_and_process_XML_files(sep,dd):
    write_to_log("gwalk_and_process_XML_files(sep)",2)
    dirstr = os.path.abspath(sys.argv[0])
    dirs = dirstr.split(sep)
    # drop the last 3 parts of the path (/apps/appname/bin) to get back to etc
    splunk_etc=sep.join(str(a) if a else '' for a in dirs[0:len(dirs)-4])
    for name in ['system', 'apps', 'users']:
        dirToWalk = splunk_etc + sep + name
        write_to_log("walk_and_process_XML_files Calling walk_dirs_for_XML(dirToWalk,sep,dd) dirToWalk=" + dirToWalk, 2)
        walk_dirs_for_XML(dirToWalk, sep, dd)

    return

##############  XML_File Definition #################

class XML_File(object):
    """Represents a simple XML file - view, dashboard or form """
    #name = "file name"
    #path = "full path to file"
    #fd = None # the currently open file descriptor (if any) for the Conf_File
    #file_lines = []  # the actual contents of the file
    #current_line=-1
    #viewtype = dashboard, form or view - can't be determined until file is read

    def __init__(self,n='',f='',p='',t=''):
        super(XML_File, self).__init__()
        self.name=n
        self.path=p
        self.fd=None
        self.file_lines = []
        self.current_line=-1
        self.file_type=t
        self.file=f
        self.viewtype=''

    def find_pattern(self,regexString,startAtBeginning=False):
        if startAtBeginning:
            self.reset_to_beginning()
        pattern=re.compile(regexString)
        line = self.read_line()
        while line!=None:
            result = pattern.search(line)
            if result:
                return result
            line = self.read_line()
        return None

    def find_multiline_patterns(self,regexString):
        write_to_log("find_multiline_patterns(self,regexString): regexString=" + regexString, 2)
        str=''
        for i in self.file_lines:
            str = str + " " + i
        matches=[]
        pattern=re.compile(regexString)
        for m in pattern.finditer(str):
            matches.append(m)
        return matches

    def get_name_and_type(self):
        # find the kind of file (dashboard or form or view) and the label
        self.viewtype=None
        name=None
        write_to_log("get_name_and_type(self) self.path=" + self.path, 2)
        self.load_data()
        # find kind of file
        dashPattern=r"\<dashboard.*?\>"
        dashMatch=re.compile(dashPattern)
        formPattern=r"\<form.*?\>"
        formMatch=re.compile(formPattern)
        viewPattern=r"\<view.*?\>"
        viewMatch=re.compile(viewPattern)

        line = self.read_line()
        while line!=None:
            if dashMatch.search(line):
                self.viewtype = 'dashboard'
                break
            else:
                if formMatch.search(line):
                    self.viewtype = 'form'
                    break
                else:
                    if viewMatch.search(line):
                        self.viewtype = 'view'
                        break
            line = self.read_line()
        if line==None:
            return name
        # find label
        labelPattern=r"(?m)\<label.*?\>(?P<name>.*?)\</label\>"
        result=self.find_pattern(labelPattern, False)
        if result:      # it matched
            name=result.group('name')
            name = name.strip()
            if name=="":    # no real label found
                name=None
                self.viewtype=None
        else:
            write_to_log("get_name_and_type: Warning - No label found in file=" + self.path, 3)
            name=None
            self.viewtype=None
        return name

    def get_saved_searches(self,dd,itemObj):
        write_to_log("XML_File:get_saved_searches(self,dd,itemObj)", 2)
        # for dashboards
        # look for a searchName and save as a use of (one or more) saved searches
        sPattern=r"(?m)\<searchName.*?\>(?P<search>.*?)\</searchName\>"
        results=self.find_multiline_patterns(sPattern)
        for r in results:
            name=r.group('search')
            items_found=find_item(name,dd,'search')
            itemObj.add_use_of(items_found)

    def get_search_strings(self,dd,itemObj):
        write_to_log("XML_File:get_search_strings(self,dd,itemObj)", 2)
        # for dashboards
        # look for a searchString and parse to components (fields, macros, etc)
        # then add uses for each of the found items
        sPattern=r"(?m)\<searchString.*?\>(?P<search>.*?)\</searchString\>"
        results=self.find_multiline_patterns(sPattern)
        items_found = parse_results(results,dd)
        itemObj.add_use_of(items_found)

    def get_search_templates(self,dd,itemObj):
        write_to_log("XML_File:get_search_templates(self,dd,itemObj)", 2)
        # for forms
        # look for a searchTemplate and parse to components, etc.
        sPattern=r"(?m)\<searchTemplate.*?\>(?P<search>.*?)\</searchTemplate\>"
        results=self.find_multiline_patterns(sPattern)
        items_found = parse_results(results,dd)
        itemObj.add_use_of(items_found)

    def get_search_params(self,dd,itemObj):
        write_to_log("XML_File:get_search_params(self,dd,itemObj)", 2)
        # for views
        # look for a param named search and parse to components, etc.
        sPattern=r"(?m)\<param\s*name\s*=\s*\"search\">(?P<search>.*?)\</param\>"
        results=self.find_multiline_patterns(sPattern)
        items_found = parse_results(results,dd)
        itemObj.add_use_of(items_found)
        # look for a param named savedSearch and save as a use of (one or more) saved searches
        sPattern=r"(?m)\<param\s*name\s*=\s*\"savedSearch\">(?P<search>.*?)\</param\>"
        results=self.find_multiline_patterns(sPattern)
        for r in results:
            name=r.group('search')
            items_found=find_item(name,dd,'search')
            itemObj.add_use_of(items_found)

    def get_populating_searches(self,dd,itemObj):
        write_to_log("XML_File:get_populating_searches(self,dd,itemObj)", 2)
        # for forms
        # look for a populatingSearch and parse to components, etc.
        sPattern=r"(?m)\<populatingSearch.*?\>(?P<search>.*?)\</populatingSearch\>"
        results=self.find_multiline_patterns(sPattern)
        items_found = parse_results(results,dd)
        itemObj.add_use_of(items_found)

    def get_populating_saved_searches(self,dd,itemObj):
        write_to_log("XML_File:get_populating_saved_searches(self,dd,itemObj)", 2)
        # for forms
        # look for a populatingSavedSearch and parse to components, etc.
        sPattern=r"(?m)\<populatingSavedSearch.*?\>(?P<search>.*?)\</populatingSavedSearch\>"
        results=self.find_multiline_patterns(sPattern)
        for r in results:
            name=r.group('search')
            items_found=find_item(name,dd,'search')
            itemObj.add_use_of(items_found)

    def process_file(self,dd,sep):
        write_to_log("XML_File:process_file(self,dd)", 2)
        self.load_data()
        name = self.get_name_and_type()
        if name==None or name=='':
            self.shrink()
            return
        write_to_log("XML_File:process_file(self,dd): found name=" + name + " viewtype=" + self.viewtype, 2)
        self.name=name
        itemObj = find_exact_item(self.name, self.path, dd, self.viewtype)
        if itemObj!=None:
            write_to_log("XML_File.process_file(self,dd): self.path=" + self.path + " WARNING Item is not unique:" + self.name, 4)
            itemObj.write()
        else:
            itemObj = DD_Item(self.name,self.viewtype,self.file,self.path,sep)
            dd.append(itemObj)
            write_to_log("XML_File:process_file(self,dd): created itemObj with name=" + self.name + " type=" + self.viewtype, 2)
        if self.viewtype=="dashboard":
            self.get_search_strings(dd,itemObj)
            self.get_saved_searches(dd,itemObj)
        else:
            if self.viewtype=="form":
                self.get_search_templates(dd,itemObj)
                self.get_populating_searches(dd,itemObj)
                self.get_populating_saved_searches(dd,itemObj)
            else:
                if self.viewtype=="view":
                    self.get_search_params(dd,itemObj)
                else:
                    write_to_log("XML_File:process_file(self): ERROR - invalid file type: " + self.viewtype, 4)
        self.shrink()

    def load_data(self):
        write_to_log("XML_File.load_data(self): self.path=" + self.path, 2)
        if self.current_line < 0:
            self.fd = open(self.path,"r")
            for line in self.fd:
                self.file_lines.append(line.strip())
            self.fd.close()
            self.fd = None
            self.current_line = 0

    def read_line(self):
        # if no data, then load it
        if self.current_line < 0:
            self.load_data()
        # if past the end of the file, return nothing
        if self.current_line >= len(self.file_lines):
            write_to_log("XML_File.read_line(self): after reading, current_line=" + str(self.current_line) + " at end of file",1)
            return None
        # read the current line
        line = self.file_lines[self.current_line]
        # move pointer to next line
        self.current_line = self.current_line + 1
        write_to_log("XML_File.read_line(self): after reading, current_line=" + str(self.current_line) + " line=" + line, 1)
        return line

    def back_up_a_line(self):
        if self.current_line > 0:
            self.current_line = self.current_line - 1

    def reset_to_beginning(self):
        if self.current_line < 0:
            self.load_data()
        self.current_line = 0

    def shrink(self):
        write_to_log("XML_File.shrink(self) self.path=" + self.path,2)
        del self.file_lines[:]
        self.fd = None
        self.current_line = -1

    def write(self, logLevel=''):
        write_to_log("Name:    " + self.name, logLevel)
        write_to_log("Path:    " + self.path, logLevel)
        write_to_log("Type:    " + self.viewtype, logLevel)
        write_to_log("current_line:        " + str(self.current_line), logLevel)
        write_to_log("Number of lines:     " + str(len(self.file_lines)), logLevel)
