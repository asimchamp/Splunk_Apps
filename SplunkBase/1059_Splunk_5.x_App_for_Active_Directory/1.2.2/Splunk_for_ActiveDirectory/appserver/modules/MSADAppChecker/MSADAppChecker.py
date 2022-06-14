import logging
import os

import cherrypy
import splunk
import splunk.util as util
import controllers.module as module
from splunk.appserver.mrsparkle.lib import cached, util

try:
    SPLUNK_HOME = os.environ['SPLUNK_HOME']
except:
    # something is very wrong
    raise

# the global logger
logger = logging.getLogger('splunk.appserver.MSADAppChecker')
logger.setLevel(logging.DEBUG)
logfile = os.path.join(SPLUNK_HOME, 'var', 'log', 'splunk', 'MSADAppChecker.log')
handler = logging.handlers.RotatingFileHandler(logfile, 
                                               maxBytes=5240000,
                                               backupCount=5)
g = logging.Formatter("%(asctime)s - %(message)s")
handler.setFormatter(g)
handler.setLevel(logging.INFO)
logger.addHandler(handler)

class MSADAppChecker(module.ModuleHandler):

    def generateResults(self, host_app=None, client_app=None, appName=None):

        token = cherrypy.session.get('sessionKey') 
        output = cached.getEntities('apps/local', search=['disabled=false'], count=-1)
   
        if not appName in output: 
            return 'noAPP'
        else:
            return 'hasAPP'
