"""
Splunk SVN configuration module

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

from splunk.clilib import cli_common as cli

class SvnConfig:
  """ get svn.conf items and generate svn command srings"""
  def __init__(self, logger=None, conf="svn", stanza="default"):
    self.logger = logger
    if logger:
      logger.debug("reading configs")
    cfg = cli.getConfStanza(conf, stanza)
    self.svn_cmd = cfg.get('svn_cmd')
    self.svn_root = cfg.get('svn_root')
    self.svn_user = cfg.get('svn_user')
    self.svn_pwd = cfg.get('svn_pwd')
    self.svn_repo = cfg.get('svn_repo')

  def check_config(self):
    """ check if there are missing config values
        return 0 for success"""
    err = 0
    if not self.svn_cmd:
      err += 1
    if self.svn_root == 'None':
      err += 1
    if self.svn_user == 'None':
      err += 1
    if self.svn_pwd == 'None':
      err += 1
    if self.svn_repo == 'None':
      err += 1
    if self.logger:
      self.logger.debug("config check returned value=%s" % (err)) 
    return err

