import time
import datetime
import json
import urllib
import urllib2
import ConfigParser
import sys
import os

import logging as logger
from logging import handlers

import logging.config
logging.config.fileConfig(os.path.join(os.path.dirname(os.path.realpath(__file__)), "..", "..", "default", "log.ini"))
logger = logging.getLogger('deepdiscovery')

class ProductRegis:
    def __init__(self, filepath, ACSection):
        me = os.path.dirname(os.path.realpath(__file__))
        sys.path.append(os.path.join(me, "..", "..", "bin"))
        from ReadConf import ReadConf
        self.readconf = ReadConf(filepath, ACSection)
        self.urlpost = None
        self.json_result = None
        self.status = None
        self.result = None

    def urlPostRequest(self, url, values):    
        #me = os.path.dirname(os.path.realpath(__file__))
        #sys.path.append(os.path.join(me, "..", "..", "bin"))
        from UrlPostRequest import UrlPostRequest
        self.urlpost = UrlPostRequest(url, values)
        try:
            self.json_result = json.loads(self.urlpost.request())
        except Exception as e:
            logger.info('ProductRegis.urlPostRequest: {0}'.format(e))
            raise
        self.json_result.update(values)        

    def checkStatus(self):
        try:
            dt = datetime.datetime(*(time.strptime(self.readconf.expired_date, "%a %b %d %H:%M:%S %Z %Y")[:6])) - datetime.datetime.now()

            if dt.days < 0 :
                self.status = "Expired"
            elif dt.days > 0 and dt.days <= 60 :
                self.status = "Expiring in " + str(dt.days) + " days"
            elif dt.days == 0:
                self.status = "Expired (today)"
            else:
                self.status = "Activated"    

        except Exception, e:
            self.readconf.expired_date = None


    def checkResults(self):
        if (self.json_result['ret'] == 0):
            self.readconf.setACConf(self.json_result)
            self.result = "Activation code update successful!"
        elif (self.json_result['ret'] == 1610678563):
            self.result = "Activation code update successful!"
        else:
            self.result = "Invalid Activation Code. Specify a valid Deep Discovery Activation Code to update the license."

