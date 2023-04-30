"""
This module implements genereal helper functions

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
import re
import os

class cd:
  """Context manager for changing the current working directory"""
  def __init__(self, new_path):
    self.new_path = new_path

  def __enter__(self):
    self.savedPath = os.getcwd()
    os.chdir(self.new_path)

  def __exit__(self, etype, value, traceback):
    os.chdir(self.savedPath)


def password_strip(str_in, repl="XXX"):
  """ replace the password in svn commads """
  return re.sub("--password\s\S+", "--password XXX", str_in)


def format_html(html_text):
  """re-format a html output so that it will be presented nicely in the splunk GUI"""
  out = html_text
  out = out.replace('<', '&lt;')
  out = out.replace(' ', '&nbsp;')
  out = out.replace('\n', '<br />')
  out = out.replace('\t', '&nbsp;')
  return out

def get_apps(app_path, results, logger):
  """ get splunk apps """
  for f in os.listdir(app_path):
    fields = {}
    filepath="%s/%s" % (app_path,f)
    if not os.path.isfile(filepath):
      fields["app"] = f  
      results.append(fields)
  return results
  

