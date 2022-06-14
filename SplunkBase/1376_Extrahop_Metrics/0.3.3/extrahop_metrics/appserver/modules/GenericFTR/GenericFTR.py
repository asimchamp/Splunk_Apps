import cherrypy
import logging
import os
import shutil
import splunk
import controllers
import splunk.appserver.mrsparkle.lib


try:
	SPLUNK_HOME = os.environ['SPLUNK_HOME']
except:
	# something is very wrong
	raise

# the global logger
logger = logging.getLogger('splunk.module.GenericFTR')
logger.setLevel(logging.DEBUG)
logfile = os.path.join(SPLUNK_HOME, 'var', 'log', 'splunk', 'extrahop_metrics.log')
handler = logging.handlers.RotatingFileHandler(logfile, 
											   maxBytes=5240000,
											   backupCount=5)
g = logging.Formatter("%(asctime)s - %(message)s")
handler.setFormatter(g)
handler.setLevel(logging.INFO)
logger.addHandler(handler)

class GenericFTR(controllers.module.ModuleHandler):
	def generateResults(self, host_app=None, client_app=None, hasIgnored=None):
		return_val = ''
		try:
			token = cherrypy.session.get('sessionKey') 
			output = splunk.appserver.mrsparkle.lib.cached.getEntities('apps/local', search=['disabled=false','visible=true'], count=-1)
			if not 'sideview_utils' in output:
				logger.info('sideview utils is not installed')
				return_val= 'noSVU'
			
			else:
				try:
					app = splunk.bundle.getConf('app', namespace='extrahop_metrics', owner='nobody')
					try:
						username = app['extrahop_metrics']['username']
						return_val = "hasSVU isConfigured"
						view_base = os.path.join(splunk.appserver.mrsparkle.lib.util.get_apps_dir(), 'extrahop_metrics','default', 'data', 'ui', 'views') 
						files = os.listdir(view_base)
						badfiles = []
						for file in files:
							if file.endswith('.bak'):
								try:
									source_file = os.path.join(view_base, file)
									target_file = os.path.join(view_base, file[:-4])
									if os.path.exists(target_file):
										os.chmod(target_file,0644)
									shutil.move(source_file, target_file)
									logger.info('Renamed file = %s to %s.' % (source_file, file[:-4]))
			
								except (IOError,OSError), e:
									logger.info('ERROR : Could not rename file = %s to %s. Please check file permissions or perform the operation manually.' % (source_file, file[:-4]))
									logger.info('Exception : %s' % e)
									badfiles.append(file)
									
						if len(badfiles) != 0:
							logger.info('Failed to rename the following files in %s : %s' % (view_base, ", ".join(badfiles)))
						else:
							logger.info('All files renamed successfully!')
							
						# copy back over the configured devices csv from local
						lookup_base = os.path.join(splunk.appserver.mrsparkle.lib.util.get_apps_dir(), 'extrahop_metrics','local')
						local_base = os.path.join(splunk.appserver.mrsparkle.lib.util.get_apps_dir(), 'extrahop_metrics','lookups') 
						files = os.listdir(lookup_base)
						for file in files:
							if file.startswith('ehm_'):
								try:
									source_file = os.path.join(lookup_base, file)
									target_file = os.path.join(local_base, file)
									shutil.copy2(source_file,target_file)
									logger.info('copied file = %s to %s.' % (source_file, target_file))
			
								except (IOError,OSError), e:
									logger.info('ERROR : Could not copy file = %s to %s. Please check file permissions or perform the operation manually.' % (source_file, target_file))
									logger.info('Exception : %s' % e)
									
					except Exception as e:
						return_val =  "hasSUV notConfigured"
						
					try:
						source_file = os.path.join(splunk.appserver.mrsparkle.lib.util.get_apps_dir(), 'extrahop_metrics','default', 'data', 'ui', 'views','setup.xml.bak')
						target_file = source_file[:-4]
						if os.path.exists(target_file):
							os.chmod(target_file,0644)
						shutil.move(source_file, target_file)
						logger.info('Renamed file = %s to %s.' % (source_file, target_file))
					
					except (IOError,OSError), e:
						logger.info('ERROR : Could not rename file = %s to %s. Please check file permissions or perform the operation manually.' % (source_file, file[:-4]))
						logger.info('Exception : %s' % e)
					
					try:
						splunk.entity.refreshEntities(['data','ui','views'])
						splunk.entity.refreshEntities(['data','ui','nav'])
					except Exception as e:
						logger.info('refresh failed: %s'%e)
					
				
				except Exception, ex:
					raise
				
		except Exception, ex:
			raise
		
		return return_val