#!/usr/bin/env python
"""
custom SVN command implementations

this module was mainly written because I was not able to compile the 
pysvn module  on my Solaris 11 machine. So this modules basically 
implements general svn commands 

@author: Mathias Herzog, <mathu at gmx dot ch>

@license:
Copyright 2014 by mathias herzog, <mathu at gmx dot ch>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

import os
import commands
from lxml import etree
import utils

class CustomSvn:

  def __init__(self, cfg, logger=None):
    self.logger = logger
    if logger:
      logger.debug("initializing svn custom commands") 

    # svn commands
    self.cmd_list = "%s list" % (cfg.svn_cmd)
    self.cmd_log = "%s log" % (cfg.svn_cmd)
    self.cmd_diff = "%s diff" % (cfg.svn_cmd)
    self.cmd_info = "%s info" % (cfg.svn_cmd)
    self.cmd_cat = "%s cat" % (cfg.svn_cmd)
    self.cmd_status = "%s status" % (cfg.svn_cmd)
    self.cmd_commit = "%s commit" % (cfg.svn_cmd)
    self.cmd_add = "%s add" % (cfg.svn_cmd)
    self.cmd_rm = "%s rm" % (cfg.svn_cmd)
    self.cmd_update = "%s update" % (cfg.svn_cmd)
    self.cmd_remote_diff = "%s diff" % (cfg.svn_cmd)

    # unix local commands
    self.cmd_ls = "/usr/bin/ls"

    self.svn_trust = "--trust-server-cert --non-interactive --username %s --password %s" % (cfg.svn_user, cfg.svn_pwd)
    self.svn_xml = "--xml"

  def get_cmd_commit(self, dir_or_file, message):
    return "%s %s -m \"%s\" %s" % (self.cmd_commit, dir_or_file, message, self.svn_trust)

  def get_cmd_update(self, dir_or_file):
    return "%s %s %s" % (self.cmd_update, dir_or_file, self.svn_trust )

  def get_cmd_status(self, dir_or_file):
    return "%s %s %s" % (self.cmd_status, dir_or_file, self.svn_xml)

  def get_cmd_add(self, dir_or_file):
    return "%s %s %s" % (self.cmd_add, dir_or_file, self.svn_trust)

  def get_cmd_rm(self, dir_or_file):
    return "%s %s %s" % (self.cmd_rm, dir_or_file, self.svn_trust)

  def get_cmd_list(self, dir_or_file, rev=0):
    if rev > 0:
      return "%s -r %s %s %s %s" % (self.cmd_list, rev, dir_or_file, self.svn_trust, self.svn_xml)
    else:
      return "%s %s %s %s" % (self.cmd_list, dir_or_file, self.svn_trust, self.svn_xml)


  def get_cmd_log(self,  dir_or_file, rev=0):
    if rev > 0:
      return "%s -r %s %s %s %s" % (self.cmd_log, rev, dir_or_file, self.svn_trust, self.svn_xml)
    else:
      return "%s  %s %s %s" % (self.cmd_log, dir_or_file, self.svn_trust, self.svn_xml)

  def get_cmd_info(self, dir_or_file, rev=0):
    if rev > 0:
      return "%s -r %s %s %s " % (self.cmd_info, rev, dir_or_file, self.svn_trust)
    else:
      return "%s %s %s " % (self.cmd_info, dir_or_file, self.svn_trust)

  def get_cmd_info_xml(self, dir_or_file):
    return "%s %s %s" % (self.cmd_info, dir_or_file, self.svn_xml)

  def get_cmd_diff(self, dir_or_file):
    return "%s %s" % (self.cmd_diff, dir_or_file)

  def get_cmd_remote_cat(self, file, rev=0):
    if rev > 0:
      return "%s -r %s %s %s" % (self.cmd_cat, rev, file, self.svn_trust)
    else:
      return "%s %s %s" % (self.cmd_cat, file, self.svn_trust)

  def get_cmd_remote_diff(self, dir_or_file, rev=0):
    if rev > 0:
      return "%s -r %s %s %s" % (self.cmd_remote_diff, rev, dir_or_file, self.svn_trust)
    else:
      return "%s -r HEAD %s %s" % (self.cmd_remote_diff, dir_or_file, self.svn_trust)

  def parse_status_xml(self, xml_string, results, dir_or_file=""):
    """map svn status output to splunk fields"""
    if self.logger:
      self.logger.debug("parsing status xml string")
    tree = etree.fromstring(xml_string)
    c = len(list(tree.iter(tag='entry')))
    for elem in  tree.iter(tag='entry'):
      fields = {}
      path = elem.attrib['path']
      item = elem.find('wc-status').attrib['item']
      try:
        revision = elem.find('wc-status').attrib['revision']
      except:
        revision = "n/a"

      # create field values for splunk
      fields["type"] = "status"
      fields["path"] = path
      fields["item"] = item
      fields["revision"] = revision

      fields["svn_action"] = "none"
      if item == "unversioned":
        fields["svn_action"] = "add"
      if item == "missing":
        fields["svn_action"] = "remove"
      if item == "modified" or item == "added":
        fields["svn_action"] = "commit"
      results.append(fields)
    return results

  def parse_log_xml(self, xml_string, results, dir_or_file=""):
    """ map svn log output to splunk fields """
    if self.logger:
      self.logger.debug("parsing log xml string")
    tree = etree.fromstring(xml_string)
    for entry in tree.iter(tag='logentry'):
      fields = {}
      rev = entry.attrib['revision']
      try:
        author = entry.find('author').text
      except AttributeError:
        author = "n/a"
      try:
        date = entry.find('date').text
      except AttributeError:
        date = "n/a"
      try:
        msg = entry.find('msg').text
      except AttributeError:
        msg = "n/a"
      fields["type"] = "log"
      fields["author"] = author
      fields["revision"] = rev
      fields["date"] = date
      fields["msg"] = msg
      results.append(fields)

  def parse_list_xml(self, xml_string, results, dir_or_file="", isfile=False):
    """map svn list output to splunk fields"""
    if self.logger:
      self.logger.debug("parsing list xml string")
    tree = etree.fromstring(xml_string)
    path = tree.find('list').attrib['path']
    c = len(list(tree.iter(tag='entry')))
    for elem in  tree.iter(tag='entry'):
      fields = {}
      kind = elem.attrib['kind']
      name = elem.find('name').text

      if isfile:
        full_path = path
      else:
        full_path = "%s/%s" % (path, name)


      revision = elem.find('commit').attrib['revision']
      try:
        author = elem.find('commit').find('author').text
      except AttributeError:
        author = "n/a"
      try:
        size = elem.find('size').text
      except AttributeError:
        size = "n/a"

      # create field values for splunk
      fields["type"] = "list"
      fields["dir"] = full_path
      fields["kind"] = kind
      fields["revision"] = revision
      fields["author"] = author

      # if only one result, get additional info, such as svn info or svn cat
      if c == 1:
        self.remote_cat(results, revision, dir_or_file)

      results.append(fields)
    return results

  def get_revisions(self, results, dir_or_file):
    """ get svn revsisions and map them to splunk fields """
    svn_cmd = self.get_cmd_log(dir_or_file)
    if self.logger:
      self.logger.debug("executing command=%s" % (utils.password_strip(svn_cmd)))
    (status, output) = commands.getstatusoutput(svn_cmd)
    if self.logger:
      self.logger.debug("command return_code=%s" % (status))
    fields = {}
    if status == 0:
      tree = etree.fromstring(output)
      for elem in  tree.iter(tag='logentry'):
        fields = {}
        fields["type"] = "revision"
        fields["revision"] = elem.attrib['revision']
        results.append(fields)
    else:
      fields["type"] = "message"
      fields["message"] = "cold not get svn log, reason=%s" % (output)
    results.append(fields)
    self.logger.debug(results)
    

  def commit(self, results, dir_or_file, user, message="general commit"):
    """svn commit of specific directory or file"""
    message = "%s: %s" % (user, message)
    svn_cmd = self.get_cmd_commit(dir_or_file, message)
    if self.logger:
      self.logger.debug("executing command=%s" % (utils.password_strip(svn_cmd)))
    fields = {}
    (status, output) = commands.getstatusoutput(svn_cmd)
    if self.logger:
      self.logger.debug("command return_code=%s" % (status))
    if status == 0:
      fields["type"] = "message"
      fields["message"] = "successfully commited %s" % (dir_or_file)
    else:
      fields["type"] = "message"
      fields["message"] = "commit failed, reason=%s" % (output)
    results.append(fields)

  def update(self, results, dir_or_file):
    """ svn update """
    svn_cmd = self.get_cmd_update(dir_or_file)
    if self.logger:
      self.logger.debug("executing command=%s" % (utils.password_strip(svn_cmd)))
    fields = {}
    (status, output) = commands.getstatusoutput(svn_cmd)
    if self.logger:
      self.logger.debug("command return_code=%s" % (status))
    if status == 0:
      fields["type"] = "message"
      fields["message"] = "update on  %s successful" % (dir_or_file)
    else:
      fields["type"] = "message"
      fields["message"] = "update failed, reason=%s" % (output)
    results.append(fields)


  def add_single_file_or_dir(self, results, dir_or_file):
    """svn add a single file"""
    svn_cmd = self.get_cmd_add(dir_or_file)
    if self.logger:
      self.logger.debug("executing command=%s" % (utils.password_strip(svn_cmd)))
    (status, output) = commands.getstatusoutput(svn_cmd)
    if self.logger:
      self.logger.debug("command return_code=%s" % (status))
    return status

  def remove_single_file_or_dir(self, results, dir_or_file):
    """svn add a single file"""
    svn_cmd = self.get_cmd_rm(dir_or_file)
    if self.logger:
      self.logger.debug("executing command=%s" % (utils.password_strip(svn_cmd)))
    (status, output) = commands.getstatusoutput(svn_cmd)
    if self.logger:
      self.logger.debug("command return_code=%s" % (status))
    return status

  def add(self, results, dir_or_file):
    """svn add one or more files or directories"""
    if self.logger:
      self.logger.debug("adding files of directory=%s" % (dir_or_file))
    svn_cmd = self.get_cmd_status(dir_or_file)
    if self.logger:
      self.logger.debug("executing command=%s" % (utils.password_strip(svn_cmd)))
    (status, output) = commands.getstatusoutput(svn_cmd)
    if self.logger:
      self.logger.debug("command return_code=%s" % (status))
    fields={}
    message = "following files added: "
    if status == 0:
      if self.logger:
        self.logger.debug("parsing status xml string")
      tree = etree.fromstring(output)
      c = len(list(tree.iter(tag='entry')))
      for elem in  tree.iter(tag='entry'):
        fields = {}
        item = elem.find('wc-status').attrib['item']
        if item == "unversioned":
          path = elem.attrib['path']
          res = self.add_single_file_or_dir(results, path)
          if res == 0:
            message = "%s %s" % (message, path)
      fields["type"] = "message"
      fields["message"] = message
      results.append(fields)
    else:
      if self.logger:
        self.logger.error(output)
      fields = {}
      fields["type"] = "message"
      fields["message"] = "add failed, reason=%s" % (output)
      results.append(fields)

  def remove(self, results, dir_or_file):
    """svn remove one or more files or directories
    only files with status=missing will be removed"""
    if self.logger:
      self.logger.debug("removing files of directory=%s" % (dir_or_file))
    svn_cmd = self.get_cmd_status(dir_or_file)
    if self.logger:
      self.logger.debug("executing command=%s" % (utils.password_strip(svn_cmd)))
    (status, output) = commands.getstatusoutput(svn_cmd)
    if self.logger:
      self.logger.debug("command return_code=%s" % (status))
    fields={}
    message = "following files removed: "
    if status == 0:
      if self.logger:
        self.logger.debug("parsing status xml string")
      tree = etree.fromstring(output)
      c = len(list(tree.iter(tag='entry')))
      for elem in  tree.iter(tag='entry'):
        fields = {}
        item = elem.find('wc-status').attrib['item']
        if item == "missing":
          path = elem.attrib['path']
          res = self.remove_single_file_or_dir(results, path)
          if res == 0:
            message = "%s %s" % (message, path)
      fields["type"] = "message"
      fields["message"] = message
      results.append(fields)
    else:
      if self.logger:
        self.logger.error(output)
      fields = {}
      fields["type"] = "message"
      fields["message"] = "add failed, reason=%s" % (output)
      results.append(fields)

  def status(self, results, dir_or_file=""):
    """generate svn status for specific local directory"""
    svn_cmd = self.get_cmd_status(dir_or_file)
    if self.logger:
      self.logger.debug("executing command=%s" % (utils.password_strip(svn_cmd)))
    (status, output) = commands.getstatusoutput(svn_cmd)
    if self.logger:
      self.logger.debug("command return_code=%s" % (status))
    if status == 0:
      return self.parse_status_xml(output, results, dir_or_file)
    else:
      if self.logger:
        self.logger.error(output)
      fields = {}
      fields["message"] = output
      results.append(fields)
      return results

  def info(self, results, rev, dir_or_file):
    """get svn info for specific local directory or file"""
    svn_cmd = self.get_cmd_info(dir_or_file, rev)
    if self.logger:
      self.logger.debug("executing command=%s" % (utils.password_strip(svn_cmd)))
    (status, output) = commands.getstatusoutput(svn_cmd)
    if self.logger:
      self.logger.debug("command return_code=%s" % (status))
    out = utils.format_html(output)
    fields = {}
    fields["type"] = "info"
    if status == 0:
      fields["info"] = out
    else:
      fields["info"] = "n/a"
      fields["type"] = "message"
      fields["message"] = output 
    results.append(fields)

  def diff(self, results, dir_or_file):
    """svn diff for specific local directory or file"""
    svn_cmd = self.get_cmd_diff(dir_or_file)
    if self.logger:
      self.logger.debug("executing command=%s" % (utils.password_strip(svn_cmd)))
    (status, output) = commands.getstatusoutput(svn_cmd)
    if self.logger:
      self.logger.debug("command return_code=%s" % (status))
    out = utils.format_html(output)
    fields = {}
    fields["type"] = "diff"
    if status == 0:
      fields["diff"] = out
    else:
      fields["diff"] = "n/a"
    results.append(fields)

  def remote_diff(self, results, rev, dir_or_file):
    """svn remote diff for specific local directory or file"""
    svn_cmd = self.get_cmd_remote_diff(dir_or_file, rev)
    self.logger.debug("here") 
    if self.logger:
      self.logger.debug("executing command=%s" % (utils.password_strip(svn_cmd)))
    (status, output) = commands.getstatusoutput(svn_cmd)
    if self.logger:
      self.logger.debug("command return_code=%s" % (status))
    out = utils.format_html(output)
    fields = {}
    fields["type"] = "diff_remote"
    if status == 0:
      fields["diff_remote"] = out
    else:
      fields["diff_remote"] = "n/a"
    results.append(fields)

  def ls(self, results, dir_or_file=""):
    """just issue a local ls command for a specific directory"""
    if self.logger:
      self.logger.debug("traversing directory=%s" % (dir_or_file))
    if not os.path.exists(dir_or_file):
      fields = {}
      # useful after svn remove operation
      fields["type"] = "message"
      fields["message"] = "file %s does not exists, presenting root path in the local file browser" % (dir_or_file)
      results.append(fields)
      dir_or_file = "."
    if os.path.isfile(dir_or_file):
      fields = {}
      if self.logger:
        self.logger.debug("found file=%s" % (dir_or_file))
      fields["type"] = "list"
      fields["dir"] = dir_or_file
      results.append(fields)
      self.local_cat(results, dir_or_file)
      return
    else:
      if self.logger:
        self.logger.debug("found directory=%s" % (dir_or_file))
      for f in os.listdir(dir_or_file):
        fields = {}
        fields["type"] = "list"
        fields["dir"] = "%s/%s" % (dir_or_file, f)
        results.append(fields)

  def local_cat(self, results, file=""):
    """just issue a local cat command for a specific file"""
    if self.logger:
      self.logger.debug("reading file=%s" % (file))
    fields = {}
    with open(file, 'r') as f:
      out = utils.format_html(f.read())
      fields["type"] = "cat"
      fields["cat"] = out
      results.append(fields)

  def remote_cat(self, results, rev, file=""):
    """svn cat for specific remote file"""
    svn_cmd = self.get_cmd_remote_cat(file, rev)
    if self.logger:
      self.logger.debug("executing command=%s" % (utils.password_strip(svn_cmd)))
    (status, output) = commands.getstatusoutput(svn_cmd)
    fields = {}
    if self.logger:
      self.logger.debug("command return_code==%s" % (status))
    if status == 0:
      fields["type"] = "cat"
      fields["cat"] = utils.format_html(output)
    else:
      if self.logger:
        self.logger.error(output)
      fields["type"] = "message"
      fields["message"] = output
    results.append(fields)

  def remote_isfile(self, path):
    """ check if a specific remote path is a file or directory """
    svn_cmd = self.get_cmd_info_xml(path)
    if self.logger:
      self.logger.debug("executing command=%s" % (svn_cmd))
    (status, output) = commands.getstatusoutput(svn_cmd)
    if self.logger:
      self.logger.debug("command return_code=%s" % (status))

    tree = etree.fromstring(output)
    kind = tree.find("entry").attrib['kind']
    if kind == "file":
      return True
    else:
      return False

  def log(self, results, rev, dir_or_file=""):
    """generate svn log for specific directory"""
    self.logger.info("here")
    svn_cmd = self.get_cmd_log(dir_or_file, rev)
    if self.logger:
      self.logger.debug("executing command=%s" % (utils.password_strip(svn_cmd)))
    (status, output) = commands.getstatusoutput(svn_cmd)
    if self.logger:
      self.logger.debug("command return_code=%s" % (status))
    if status == 0:
      self.parse_log_xml(output, results, dir_or_file)
    else:
      if self.logger:
        self.logger.error(output)
      fields = {}
      fields["type"] = "message"
      fields["message"] = output
      results.append(fields)

  def list(self, results, rev, dir_or_file=""):
    """generate svn list for specific local directory"""
    svn_cmd = self.get_cmd_list(dir_or_file, rev)
    if self.logger:
      self.logger.debug("executing command=%s" % (utils.password_strip(svn_cmd)))
    (status, output) = commands.getstatusoutput(svn_cmd)
    if self.logger:
      self.logger.debug("command return_code=%s" % (status))
    if status == 0:
      if self.remote_isfile(dir_or_file):
        return self.parse_list_xml(output, results, dir_or_file, isfile=True)
      else:
        return self.parse_list_xml(output, results, dir_or_file, isfile=False)
    else:
      if self.logger:
        self.logger.error(output)
      fields = {}
      fields["type"] = "message"
      fields["message"] = output
      results.append(fields)
      return results

