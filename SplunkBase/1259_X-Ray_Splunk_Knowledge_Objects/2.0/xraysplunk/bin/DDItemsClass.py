#!/usr/bin/python
from ConfFilesClass import *
from LogManager import *
import time
import sys
import os
import re

lastItemId=0

def find_item(name,item_list, item_type=''):
    write_to_log("find_item(name, item_list, item_type): name=" + name + " item_type=" + item_type,2)
    # first find anything with a matching name
    found_items = []
    for i in item_list:
        if i.name_match(name):
            found_items.append(i)
    # if item_type is supplied, reduce the matching list to only those of the proper type
    if item_type!='' and len(found_items) > 0:
        new_list = []
        for i in found_items:
            if i.item_type == item_type:
                new_list.append(i)
        del found_items[:]
        found_items = new_list
    write_to_log("find_item(name, item_list, item_type): num found_items=" + str(len(found_items)),1)
    return found_items

def find_id(id, item_list):
    for itemObj in item_list:
        if itemObj.id == id:
            return itemObj
    return None

def find_exact_item(name, path, item_list, item_type=''):
    write_to_log("find_exact_item(name, path, item_list, item_type=''): name=" + name + " path=" + path + " item_type=" + item_type,2)
    found_items = []
    first_list = find_item(name, item_list, item_type)
    write_to_log("find_exact_item(name, path, item_list, item_type=''): first found " + str(len(first_list)) + " items",1)
    if len(first_list) == 0:
        return None
    for i in first_list:
        if i.path == path:
            found_items.append(i)
    if len(found_items) > 1:
        write_to_log("find_exact_item(name, path, item_list): Error - multiple items found: name=" + name + " path=" + path, 4)
        return None
    if len(found_items) == 0:
        return None
    write_to_log("find_exact_item(name, path, item_list, item_type=''): returning=" + str(found_items[0]), 1)
    return found_items[0]

def get_dir(dir_type,path,sep):
    write_to_log("get_dir(dir_type,path,sep): dir_type=" + dir_type + "path=" + path + " sep=" + sep,1)

    if dir_type=="default or local":
        matchStr="/etc/.*/default/"
        if re.search(matchStr,path):
            return "default"
        else:
            return "local"

    if dir_type=="app":
        matchStr="/etc/apps/(.*?)/"
    else:  #if dir_type=="user":
        matchStr="/etc/users/(.*?)/"
    matchObj = re.compile(matchStr)
    result = matchObj.search(path)
    if result==None:
        write_to_log("get_dir(dir_type,path,sep): ERROR not found - dir_type=" + dir_type + "path=" + path + " sep=:" + sep,4)
        return 'not found'
    return result.group(1)

##############  DD_Item Class Definition  #################

class DD_Item(object):
    """Represents a single item"""
    # name = "item name"
    # item_type = "item type"
    # level = "item level" such as user, app, system
    # file = "full path to file"
    # match_string = "string to match when looking for uses of this item"
    # uses = []

    def __init__(self,n='',t='',f='',p='',sep=''):
        super(DD_Item, self).__init__()
        global lastItemId
        lastItemId = lastItemId + 1
        self.id = lastItemId
        self.name=n
        self.item_type=t
        self.file=f
        self.path=p
        self.uses=set()       #use a set to ensure uniqueness of contents
        self.match_string=''
        self.default = False
        if self.item_type == "field":  # we don't know where fields are defined
            self.level = '-'
        else:
            self.level = '*Undefined*'
            if '/etc/system/' in self.path:
                self.level = 'system'
            if '/etc/apps/' in self.path:
                self.level = 'app:' + get_dir('app',self.path,sep)
            if '/etc/users/' in self.path:
                self.level = 'user:' + get_dir('user',self.path,sep)
            if get_dir('default or local',self.path,sep)=='default':
                self.level = self.level + " (default)"
        self.last_update=time.time()
        if self.name==None or self.name=='':
            write_to_log("DD_Item.__init__(...): object name is=" + str(self.name) + " type=" + str(self.item_type) + " path=" + str(self.path) ,5)

    def add_use_of(self,uses_list):
        for item in uses_list:
            write_to_log("DD_Item.add_use_of(self,uses_list): self.name=" + self.name + " uses_list=" + str(uses_list), 1)
            self.uses.add(item)

    def name_match(self,string):
        s = string.strip()
        return s == self.name

    def match(self,string):
        if self.match_string == '':
            return False
        return re.search(self.match_string, string)

    def write(self,logLevel=''):
        write_to_log("Id:      " + str(self.id),logLevel)
        write_to_log("Name:    " + self.name,logLevel)
        write_to_log("Type:    " + self.item_type,logLevel)
        write_to_log("Level:   " + self.level,logLevel)
        write_to_log("Uses:",logLevel)
        for i in self.uses:
            write_to_log("         " + i.name + " - " + i.item_type,logLevel)
        write_to_log("Defined in:  " + self.path,logLevel)
        write_to_log("Updated:" + str(self.last_update),logLevel)

    def write_csv_header(self,fd):
        fd.write('id,')
        fd.write('name,')
        fd.write('type,')
        fd.write('level,')
        fd.write('path,')
        fd.write('lastUpdated')
        fd.write('\n')

    def write_csv(self,fd):
        fd.write(str(self.id) + ',')
        fd.write('"' + self.name + '",')
        fd.write(self.item_type + ',')
        fd.write('"' + self.level + '",')
        fd.write('"' + self.path + '",')
        fd.write(str(self.last_update))
        fd.write('\n')

    def write_csv_header_map(self,fd):
        fd.write('item_id,')
        fd.write('used_by_id')
        fd.write('\n')

    def write_csv_map(self,fd):
        for i in self.uses:
            fd.write(str(i.id) + ",")
            fd.write(str(self.id))
            fd.write("\n")

##############  Class Definition  #################

class Eventtype_Item(DD_Item):
    def __init__(self,n='',t='',f='',p='',sep=''):
        super(Eventtype_Item, self).__init__(n,t,f,p,sep)
        self.match_string=r"(?m)eventtype\s*=\s*\"{0,1}" + self.name

class Tag_Item(DD_Item):
    def __init__(self,n='',t='',f='',p='',sep=''):
        super(Tag_Item, self).__init__(n,t,f,p,sep)
        self.match_string=r"(?m)tag\s*=\s*\"{0,1}" + self.name

class Macro_Item(DD_Item):
    def __init__(self,n='',t='',f='',p='',sep=''):
        super(Macro_Item, self).__init__(n,t,f,p,sep)
        if '(' in self.name:
            temp = self.name[0:self.name.find('(')]
            self.match_string = "(?m)`" + temp + r"\(.*?\)`"
        else:
            self.match_string="`" + self.name + "`"

class Lookup_Item(DD_Item):
    def __init__(self,n='',t='',f='',p='',sep=''):
        super(Lookup_Item, self).__init__(n,t,f,p,sep)
        self.match_string=r"(?m)\|\s*lookup\s+" + self.name
