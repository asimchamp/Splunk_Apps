import os
import shutil
import cherrypy
import logging
import splunk
import controllers
import splunk.appserver.mrsparkle.lib


try:
	SPLUNK_HOME = os.environ['SPLUNK_HOME']
except:
	# something is very wrong
	raise

# the global logger
logger = logging.getLogger('splunk.module.SaveConfiguredDevices')
logger.setLevel(logging.DEBUG)
logfile = os.path.join(SPLUNK_HOME, 'var', 'log', 'splunk', 'extrahop_metrics.log')
handler = logging.handlers.RotatingFileHandler(logfile, 
											   maxBytes=5240000,
											   backupCount=5)
g = logging.Formatter("%(asctime)s - %(message)s")
handler.setFormatter(g)
handler.setLevel(logging.INFO)
logger.addHandler(handler)

class SaveConfiguredDevices(controllers.module.ModuleHandler):
	def generateResults(self, host_app=None, client_app=None, hasIgnored=None):
		return_val = ''
		try:
			token = cherrypy.session.get('sessionKey') 
			lookup_base = os.path.join(splunk.appserver.mrsparkle.lib.util.get_apps_dir(), 'extrahop_metrics','lookups')
			local_base = os.path.join(splunk.appserver.mrsparkle.lib.util.get_apps_dir(), 'extrahop_metrics','local') 
			files = os.listdir(lookup_base)
			for file in files:
				if file.startswith('ehm_'):
					try:
						if os.stat(os.path.join(lookup_base, file)).st_size > 0:
							source_file = os.path.join(lookup_base, file)
							target_file = os.path.join(local_base, file)
							shutil.copy2(source_file,target_file)
							logger.info('copied file = %s to %s.' % (source_file, target_file))

					except (IOError,OSError), e:
					#	logger.info('ERROR : Could not copy file = %s to %s. Please check file permissions or perform the operation manually.' % (source_file, target_file))
						logger.info('Exception : %s' % e)

		except Exception, ex:
			raise
