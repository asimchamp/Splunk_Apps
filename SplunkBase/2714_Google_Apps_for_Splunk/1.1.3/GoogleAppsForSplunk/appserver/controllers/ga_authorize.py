import logging, os, sys, json, shutil, cherrypy, re, time, datetime, urllib

#from splunk import AuthorizationFailed as AuthorizationFailed
import splunk.appserver.mrsparkle.controllers as controllers
import splunk.appserver.mrsparkle.lib.util as util
import splunk.entity as entity
from splunk.appserver.mrsparkle.lib import jsonresponse
from splunk.appserver.mrsparkle.lib.util import make_splunkhome_path
from splunk.appserver.mrsparkle.lib.decorators import expose_page
from splunk.appserver.mrsparkle.lib.routes import route

#Google Stuff
import httplib2, json
from apiclient import errors
from apiclient.discovery import build
from datetime import datetime, timedelta
from oauth2client.client import OAuth2WebServerFlow

_APPNAME = 'GoogleAppsForSplunk'
dir = os.path.join(util.get_apps_dir(), _APPNAME, 'bin', 'lib')
if not dir in sys.path:
    sys.path.append(dir)    
httplib2.CA_CERTS = "%s/%s"%(os.path.join(util.get_apps_dir(), _APPNAME, 'bin'),"cacerts.txt")
_LOCALDIR = os.path.join(util.get_apps_dir(), _APPNAME, 'local')
if not os.path.exists(_LOCALDIR):
    os.makedirs(_LOCALDIR)

def setup_logger(level):
    """
    Setup a logger for the REST handler.
    """

    logger = logging.getLogger('splunk.appserver.%s.controllers.ga_authorize'%_APPNAME)
    logger.propagate = False # Prevent the log messages from being duplicated in the python.log file
    logger.setLevel(level)
    file_handler = logging.handlers.RotatingFileHandler(make_splunkhome_path(['var', 'log', 'splunk', 'ga_authorize_controller.log']), maxBytes=25000000, backupCount=5)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    return logger

logger = setup_logger(logging.DEBUG)

class ga_authorize(controllers.BaseController):

    ####### /custom/GoogleAppsForSplunk/ga_authorize/build
    @expose_page(must_login=False, methods=['GET']) 
    def build(self, **kwargsraw):
     try:
        logger.info("operation=build_url")
        logger.info("got these: %s"%kwargsraw)
	kwargs = kwargsraw
	logger.debug("setting domain")
	DOMAIN = kwargs['domain'].strip().lower()
	logger.debug("setting client id")
	CLIENT_ID = kwargs['clientid'].strip()
	logger.debug("setting clientsecret")
	CLIENT_SECRET = kwargs['clientsecret'].strip()
	logger.debug("setting authtoken")
	AUTHTOKEN = kwargs['authtoken'].strip()
	logger.debug("setting step")
	STEP = kwargs['step'].strip()
	logger.debug("setting scope")
	# Check https://developers.google.com/admin-sdk/reports/v1/guides/authorizing for all available scopes
	OAUTH_SCOPE = [ 'https://www.googleapis.com/auth/admin.reports.audit.readonly', #ADMIN SDK REPORTS
                'https://www.googleapis.com/auth/admin.reports.usage.readonly',#ADMIN SDK USAGE
                'https://www.googleapis.com/auth/drive.readonly', #RO GOOGLE DRIVE
                'https://www.googleapis.com/auth/calendar.readonly',#RO GOOGLE CALENDAR
                'https://www.googleapis.com/auth/admin.directory.user.readonly', #RO USER DIRECTORY
                'https://www.googleapis.com/auth/admin.directory.device.mobile.readonly', #RO Devices
                'https://www.googleapis.com/auth/admin.directory.group.readonly', #RO GRoups
                'https://www.googleapis.com/auth/admin.directory.orgunit.readonly', #RO Org Unit
                'https://www.googleapis.com/auth/tasks' #RW USER TASKS
                ]
	# Redirect URI for installed apps
	REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'#AUTO?
	# Run through the OAuth flow and retrieve credentials
	logger.debug("setting flow")
	logger.debug("using cacerts: %s"%httplib2.CA_CERTS)
	flow = OAuth2WebServerFlow(CLIENT_ID, CLIENT_SECRET, OAUTH_SCOPE, REDIRECT_URI)
	import pickle
	_FLOW = "%s/flowtmp"%_LOCALDIR
	logger.debug("setting flow location: %s"%_FLOW)
	if "one" == STEP:
		logger.debug("writing flow to flowtmp")
		f = open(_FLOW,"wb")
		pickle.dump(flow, f)
		f.close()
		logger.debug("returning")
		return json.dumps({ "step":"launch_url", "url": flow.step1_get_authorize_url() ,"msg":"Once you have authorized Splunk, enter the Authorization Token above, and click Submit again."})
	logger.debug("reading flow from flowtmp")
	f = open(_FLOW,"rb")
	sflow = pickle.load(f)
	f.close()
	credentials = sflow.step2_exchange(AUTHTOKEN)
	from oauth2client.file import Storage
	myCredFile = "%s/GoogleApps.%s.cred"%(_LOCALDIR,DOMAIN)
	storage = Storage(myCredFile)
	storage.put(credentials)
	logger.debug("deleting flowtmp")
        os.remove(_FLOW)
	return json.dumps({ "step": "end_of_discussion", "msg" : 'Credentials Written to "%s"'%myCredFile})
     except Exception, e:
	logger.error("Error: %s"%e)
	return json.dumps({ "msg":"%s"%e, "step":"end_of_discussion"})
