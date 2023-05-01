#!/usr/bin/python
'''
This script fetches user credentails from Splunk endpoints
Author:  Basant Kumar, GSLab
'''

#Import from standard libraries
import sys
import argparse
import requests
from authentication import *
from pprint import pprint
import json
import os

#Import from own classes
from dict_operations import *

class credential:
    def __init__(self, app_name, user_name):
        #Initialize class variables
        self.app_name = app_name
        self.user_name = user_name
        self.password = ""

    def getPassword(self, session_key):
        import splunk.entity as entity
        import urllib
	
        if len(session_key) == 0:
            raise Exception, "No session key provided"
        if len(self.app_name) == 0:
            raise Exception, "No app provided"
        try:
            entities = entity.getEntities(['admin', 'passwords'], namespace=self.app_name, owner='nobody', sessionKey=session_key)
        except Exception, e:
            raise Exception, "Could not get %s credentials from splunk. Error: %s" % (self.app_name, str(e))
        for i, c in entities.items():
            return c['username'], c['clear_password']
        raise Exception, "No credentials have been found"