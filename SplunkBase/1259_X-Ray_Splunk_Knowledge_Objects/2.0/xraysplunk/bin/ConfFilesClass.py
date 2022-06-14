#!/usr/bin/python
from DDItemsClass import *
from LogManager import *
import time
import sys
import os
import re

def parse_line(line):
    if '=' in line:
        pos = line.find('=')
        attrib = line[:pos].strip()
        val = line[pos+1:].strip()
        return (attrib,val)
    else:
        return ('','')

def parse_search_string(search,dd):
    write_to_log("parse_search_string(search,dd) search=" + search,2)
    found_item_list = []
    for i in dd:
        if i.match(search):
            found_item_list.append(i)
    return found_item_list

##############  Conf_File Definition #################

class Conf_File(object):
    """Represents a generic .conf file"""
    #name = "file name"
    #path = "full path to file"
    #fd = None # the currently open file descriptor (if any) for the Conf_File
    #file_lines = []  # the actual contents of the file
    #current_line=-1

    def __init__(self,n='',p=''):
        super(Conf_File, self).__init__()
        self.name=n
        self.path=p
        self.fd=None
        self.file_lines = []
        self.current_line=-1

    def get_all_item_definitions(self):
        write_to_log("get_all_item_definitions(self) self.path=" + self.path, 2)
        self.load_data()
        stanzas = set()   # use a set to ensure uniqueness
        x = self.get_stanza_name()
        while x!=None:
            stanzas.add(x)
            x = self.get_stanza_name()
        return stanzas

    def get_stanza_name(self):
        # read the next stanza in the file
        # return None if no more stanzas
        # return a new item object if possible
        write_to_log("Conf_File:get_stanza_name(self): current_line=" + str(self.current_line) + " total lines=" + str(len(self.file_lines)),2)
        line = self.read_line()
        while line!=None:
            line = line.strip()
            if line!=None and line!='' and line[0]=='[':
                endPos=line.find(']')
                if endPos < 0:
                    write_to_log("Conf_File:get_stanza_name(self): Warning - missing ] on line: " + line + " in file: " + self.path,3)
                    break
                # beginning of new stanza
                stanza = line[1:endPos]
                write_to_log("Conf_File.get_stanza(self): Found stanza: " + stanza,1)
                return stanza
            line = self.read_line()
        write_to_log("Conf_File.get_stanza(self): No stanza found, last line read=" + str(self.current_line),1)
        return None

    def get_next_stanza(self):
        # gets stanza name and definition
        stanza_data = []
        stanzaFound = self.get_stanza_name()
        if stanzaFound == None:
            return (stanzaFound, stanza_data)
        line = stanzaFound      # we are on the stanza line
        while line!=None:
            line = self.read_line()
            if line!=None:
                line = line.strip()
                if line!='':
                    if line[0]=='[':
                        # beginning of new stanza, time to stop
                        self.back_up_a_line() # so that we will start with stanza next time
                        break
                    else:
                        if line[0]!="#":
                            stanza_data.append(line)
        return (stanzaFound, stanza_data)

    def load_data(self):
        # reads in the entire file and deals with line continuation
        write_to_log("load_data(self): self.path=" + self.path, 2)
        if self.current_line < 0:
            self.fd = open(self.path,"r")
            last_line=""
            for line in self.fd:
                line = line.strip()
                if len(last_line) > 0 and last_line[-1]=="\\":
                    self.file_lines[-1] =self.file_lines[-1] + " " + line
                else:
                    self.file_lines.append(line)
                last_line=line
            self.fd.close()
            self.fd = None
            self.current_line = 0

    def read_line(self):
        # if no data, then load it
        if self.current_line < 0:
            self.load_data()
        # if past the end of the file, return nothing
        if self.current_line >= len(self.file_lines):
            write_to_log("Conf_File.read_line(self): after reading, current_line=" + str(self.current_line) + " at end of file",1)
            return None
        # read the current line
        line = self.file_lines[self.current_line]
        # move pointer to next line
        self.current_line = self.current_line + 1
        write_to_log("Conf_File.read_line(self): after reading, current_line=" + str(self.current_line) + " line=" + line, 1)
        return line

    def back_up_a_line(self):
        if self.current_line > 0:
            self.current_line = self.current_line - 1

    def reset_to_beginning(self):
        if self.current_line < 0:
            self.load_data()
        self.current_line = 0

    def shrink(self):
        write_to_log("Conf_File.shrink(self) self.path=" + self.path,2)
        del self.file_lines[:]
        self.fd = None
        self.current_line = -1

    def write(self, logLevel=''):
        write_to_log("Name:    " + self.name, logLevel)
        write_to_log("Path:    " + self.path, logLevel)
        write_to_log("current_line:        " + str(self.current_line), logLevel)
        write_to_log("Number of lines:     " + str(len(self.file_lines)), logLevel)

    def write_contents(self, logLevel=''):
        if self.file_lines > 0:
            for line in self.file_lines:
                write_to_log(line,logLevel)
        else:
            write_to_log("Nothing in File",logLevel)

    def write_all(self, logLevel=''):
        self.write(logLevel)
        self.write_contents(logLevel)

##############  Eventtypes_Conf Definition  #################

class Eventtypes_Conf(Conf_File):

    def __init__(self,n='',p=''):
        super(Eventtypes_Conf, self).__init__(n,p)

    def extract_usage(self,dd):
        write_to_log("Eventtypes_Conf.extract_usage(self, dd)",2)
        self.load_data()
        (stanza, lines) = self.get_next_stanza()
        while stanza:
            itemObj = find_exact_item(stanza, self.path, dd, 'eventtype')
            if not itemObj:
                write_to_log("Eventtypes_Conf.extract_usage(self, dd): ERROR Eventtypes_Conf.extract_usage - Item not found for stanza: " + stanza + " " + self.path, 4)
            else:
                if len(lines) > 0:
                    # parse out the specific items for Eventtypes
                    for l in lines:
                        (attrib,val) = parse_line(l)
                        if attrib=='search':
                            items_found = parse_search_string(val,dd)
                            itemObj.add_use_of(items_found)
            (stanza, lines) = self.get_next_stanza()
        self.shrink()

##############  Tags_Conf Definition  #################

class Tags_Conf(Conf_File):

    def __init__(self,n='',p=''):
        super(Tags_Conf, self).__init__(n,p)
        self.tag_list = []

    def extract_tags(self,lines):
        tag_list = []
        for line in lines:
            (name,value)=parse_line(line)
            write_to_log("Tags_Conf.extract_tags(self,lines): tag name=" + name + " tag value=" + value, 1)
            if not name in tag_list:
                tag_list.append(name)
        return tag_list

    def get_all_item_definitions(self):
        write_to_log("Tags_Conf.get_all_item_definitions(): self.path=" + self.path, 2)
        self.load_data()
        lines=[]
        line = self.read_line()
        while line!=None:
            line = line.strip()
            if line!='':
                if line[0]!='#' and line[0]!='[':
                    lines.append(line)
            line = self.read_line()
        tag_list = self.extract_tags(lines)
        return tag_list

    def extract_usage(self,dd):
        write_to_log("Tags_Conf.extract_usage(dd)",2)
        self.load_data()
        (stanza, lines) = self.get_next_stanza()
        while stanza:
            (field,value)=parse_line(stanza)
            if field == "sourcetype" or field == "host" or field == "source":
                #don't create objects for these
                pass
            else:
                tag_list = self.extract_tags(lines)
                if field == "eventtype":        # an eventtype is a special kind of field
                    found_list=find_item(value,dd,'eventtype')
                    if len(found_list)==0:
                        write_to_log("Tags_Conf.extract_usage(dd): Warning - Missing eventtype: " + value,4)
                        eventType = Eventtype_Item(value, 'eventtype', '*Missing*', '*Missing*')
                        dd.append(eventType)
                        found_list.append(eventType)
                    for tag in tag_list:
                        #find the tag
                        tagObj = find_exact_item(tag, self.path, dd, 'tag')
                        if tagObj==None:
                            write_to_log("Tags_Conf.extract_usage(dd): Error - Missing tag:" + tag, 4)
                        else:
                            tagObj.add_use_of(found_list)
            (stanza, lines) = self.get_next_stanza()

        self.shrink()

##############  Savedsearches_Conf Definition #################

class Savedsearches_Conf(Conf_File):

    def __init__(self,n='',p=''):
        super(Savedsearches_Conf, self).__init__(n,p)

    def extract_usage(self,dd):
        write_to_log("Savedsearches_Conf.extract_usage(self, dd):",2)
        self.load_data()
        (stanza, lines) = self.get_next_stanza()
        while stanza:
            itemObj = find_exact_item(stanza, self.path, dd, 'search')
            if not itemObj:
                write_to_log("Savedsearches_Conf.extract_usage(self, dd): ERROR Item not found for stanza: " + stanza + " " + self.path, 4)
            else:
                write_to_log("Savedsearches_Conf.extract_usage(self, dd): itemObj=" + str(itemObj) ,1)
                if len(lines) > 0:
                    # parse out the specific items for Savedsearches
                    for l in lines:
                        (attrib,val) = parse_line(l)
                        if attrib=='search':
                            items_found = parse_search_string(val,dd)
                            itemObj.add_use_of(items_found)
            (stanza, lines) = self.get_next_stanza()
        self.shrink()


##############  Macros_Conf Definition  #################

class Macros_Conf(Conf_File):

    def __init__(self,n='',p=''):
        super(Macros_Conf, self).__init__(n,p)

    def extract_usage(self,dd):
        write_to_log("Macros_Conf.extract_usage(self, dd):", 2)
        self.load_data()
        (stanza, lines) = self.get_next_stanza()
        while stanza:
            itemObj = find_exact_item(stanza, self.path, dd, 'macro')
            if not itemObj:
                write_to_log("Macros_Conf.extract_usage(self, dd): ERROR Macros_Conf.extract_usage - Item not found for stanza: " + stanza + " " + self.path,4)
            else:
                write_to_log("Macros_Conf.extract_usage(self, dd): itemObj=" + str(itemObj), 1)
                if len(lines) > 0:
                    # parse out the specific items for macros
                    for l in lines:
                        (attrib,val) = parse_line(l)
                        if attrib=='definition':
                            items_found = parse_search_string(val,dd)
                            itemObj.add_use_of(items_found)
            (stanza, lines) = self.get_next_stanza()
        self.shrink()

##############  Transforms_Conf Definition  #################
#
#  Extracts lookup definitions only

class Transforms_Conf(Conf_File):

    def __init__(self,n='',p=''):
        super(Transforms_Conf, self).__init__(n,p)

    def stanza_is_lookup(self):
        write_to_log("Transforms_Conf:stanza_is_lookup(self)", 2)
        line='x' # just to initialize
        while line!=None:
            line = self.read_line()
            if line!=None:
                line = line.strip()
                if line!='':
                    if line[0]=='[':
                        # beginning of new stanza, time to stop
                        self.back_up_a_line() # so that we will start with stanza next time
                        return False
                    else:
                        (attrib,val) = parse_line(line)
                        if attrib=='filename' or attrib=='external_cmd':
                            return True
        return False

    def get_all_item_definitions(self):
        more=True

        write_to_log("Transforms_Conf:get_all_item_definitions(self) self.path=" + self.path, 2)
        self.load_data()
        stanzas = set()   # use a set to ensure uniqueness
        (x,more) = self.get_stanza_name()
        while more:
            if x!=None:
                stanzas.add(x)
            (x,more) = self.get_stanza_name()
        return stanzas

    def get_stanza_name(self):
        # read the next stanza in the file
        # return None if no more stanzas
        # return a new item object if possible
        # return boolean to indicate if more file remains
        write_to_log("Transforms_Conf:get_stanza_name(self): current_line=" + str(self.current_line) + " total lines=" + str(len(self.file_lines)),2)
        line = self.read_line()
        while line!=None:
            line = line.strip()
            if line!=None and line!='' and line[0]=='[':
                endPos=line.find(']')
                if endPos < 0:
                    write_to_log("Transforms_Confget_stanza_name(self): Warning - missing ] on line: " + line + " in file: " + self.path,3)
                    break
                # beginning of new stanza
                stanza = line[1:endPos]
                write_to_log("Transforms_Conf.get_stanza(self): Found stanza: " + stanza,1)
                # Is it a lookup?
                if self.stanza_is_lookup():
                    return (stanza, True)
                else:
                    return (None, True)
            line = self.read_line()
        write_to_log("Transforms_Conf.get_stanza(self): No stanza found, last line read=" + str(self.current_line),1)
        return (None, False)

    def extract_usage(self,dd):
        # there is no usage to find in the transforms.conf file
        write_to_log("Transforms_Conf.extract_usage(self, dd):", 2)
        pass
