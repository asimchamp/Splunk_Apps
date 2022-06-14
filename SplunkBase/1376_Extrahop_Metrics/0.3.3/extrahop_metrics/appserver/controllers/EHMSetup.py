import sys
import os
#from tempfile import mkstemp
import base64
import subprocess
import shutil
import logging, logging.handlers
import splunk.bundle as bundle
import splunk.appserver.mrsparkle.controllers as controllers
from splunk.appserver.mrsparkle.lib.decorators import expose_page
import splunk.entity as entity
import splunk.util as util
import splunk.appserver.mrsparkle.lib

'''
Controller to handle various setup/configuration processes
'''
try:
	SPLUNK_HOME = os.environ['SPLUNK_HOME']
except:
	# something is very wrong
	raise

# the global logger
logger = logging.getLogger('splunk.module.EHMSetup')
logger.setLevel(logging.DEBUG)
logfile = os.path.join(SPLUNK_HOME, 'var', 'log', 'splunk', 'extrahop_metrics.log')
handler = logging.handlers.RotatingFileHandler(logfile, 
											   maxBytes=5240000,
											   backupCount=5)
g = logging.Formatter("%(asctime)s - %(message)s")
handler.setFormatter(g)
handler.setLevel(logging.INFO)
logger.addHandler(handler)


class EHMSetup(controllers.BaseController):
    '''Extrahop Metrics Setup Controller'''

    @expose_page(must_login=True, methods=['GET'])
    def show(self, **kwargs):
        '''get default configuration settings from default/app.conf or updated settings from local/app.conf''';
        form_content  = {}
        app = None
        app = bundle.getConf('app', namespace='extrahop_metrics', owner='nobody')
        required_keys = ['username', 'password', 'hostname', 'python_path']

        for key in required_keys:
            try:
                if key == 'password' and app['extrahop_metrics']['password'] not in [None, ''] :
                    form_content[key] = {'search' : base64.b64decode(app['extrahop_metrics']['password'])}
                elif app['extrahop_metrics'].has_key(key):
                    form_content[key] = {'search' : app['extrahop_metrics'][key]}
                else:
                    form_content[key] = {'search' :''}
            except:
                form_content[key] = {'search': ''}
        app = None


        return self.render_template('/extrahop_metrics:/templates/setup.html',
                                    dict(form_content=form_content))

    @expose_page(must_login=True, trim_spaces=True, methods=['POST'])
    def save(self, **params):

        # validate path that was entered for the external python executable
        python_exec = params['python_path']
        if not (os.path.isfile(python_exec) and os.access(python_exec, os.X_OK)):
            response = {'error':{'msg':'invalid path to python executable'}}
            return self.render_template('/extrahop_metrics:/templates/failure.html', dict(form_content=response))

        '''write out configuration settings to local/app.conf'''
        app = bundle.getConf('app', namespace='extrahop_metrics', owner='nobody',overwriteStanzas=False)
        app['install']['is_configured'] = 'true'
        for key,val in  params.iteritems():
            if key in ['username', 'hostname', 'python_path']:
                app['extrahop_metrics'][key] = val
            elif key == 'password' and val not in [None,'']:
                app['extrahop_metrics'][key] = base64.b64encode(val)
        logger.info('Save successful')

        # run the device scan once manually to get an initial list of Extrahop devices/nodes
        logger.info("starting device scan")
        import cherrypy
        #if 'win' in sys.platform: 
        args = [os.path.join(SPLUNK_HOME,'bin','splunk'), 'cmd', 'python',
            os.path.join(SPLUNK_HOME,'etc','apps','extrahop_metrics','bin','ehm_device_lookup_wrapper.py') ]
        #else:
        #    args = [os.path.join(SPLUNK_HOME,'bin','splunk'),os.path.join(SPLUNK_HOME,'bin','splunk'), 'cmd', 'python',
        #        os.path.join(SPLUNK_HOME,'etc','apps','extrahop_metrics','bin','ehm_device_lookup_wrapper.py') ]
        
        logger.info('args : %s'% args)
        child_proc = subprocess.Popen(args,stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        output = child_proc.communicate(input=cherrypy.session['sessionKey'])[0]

        logger.info('device_lookup_wrapper exit status %d'% child_proc.returncode)
        logger.info('output from script')
        logger.info(output)


        if  child_proc.returncode == 0:
            # only enable the collector scripts when we have a valid login to the Extrahop device
            # set the inputs to be enabled now that we have configuration set up
            app = None
            app = bundle.getConf('inputs',  namespace='extrahop_metrics', owner='nobody',overwriteStanzas=False)
            app.beginBatch()
            device_lookup_wrapper = 'script://'+os.path.join('.','bin','ehm_device_lookup_wrapper.py')
            get_exstats_wrapper = 'script://'+os.path.join('.','bin','ehm_get_exstats_wrapper.py')

            #setup scripted inputs
            app[device_lookup_wrapper]['disabled'] = 0
            app[device_lookup_wrapper]['index'] = 'extrahop_metrics'
            app[device_lookup_wrapper]['interval'] = '0 0 * * *'
            app[device_lookup_wrapper]['sourcetype'] = 'extrahop_metrics'
            app[device_lookup_wrapper]['passAuth'] = 'splunk-system-user'

            # TODO: should really move to this to application.js or somewhere, such that the script gets enabled
            # TODO: when a device/node/oid gets configured
            app[get_exstats_wrapper]['disabled'] = 0
            app[get_exstats_wrapper]['index'] = 'extrahop_metrics'
            app[get_exstats_wrapper]['interval'] = 300
            app[get_exstats_wrapper]['sourcetype'] = 'extrahop_metrics'
            app[get_exstats_wrapper]['passAuth'] = 'splunk-system-user'
            app.commitBatch()

            # reload monitor inputs
            entity.refreshEntities(['admin','script'])
            try:
                view_base = os.path.join(splunk.appserver.mrsparkle.lib.util.get_apps_dir(), 'extrahop_metrics','default', 'data', 'ui', 'views')
                nav_base = os.path.join(splunk.appserver.mrsparkle.lib.util.get_apps_dir(), 'extrahop_metrics','default', 'data', 'ui', 'nav')
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
                            #logger.info('ERROR : Could not rename file = %s to %s. Please check file permissions or perform the operation manually.' % (source_file, file[:-4]))
                            logger.info('Exception : %s' % e)
                            badfiles.append(file)
                
                if os.path.exists(os.path.join(nav_base, 'default.xml.bak')):
                    shutil.move(os.path.join(nav_base, 'default.xml.bak'), os.path.join(nav_base, 'default.xml'))
                    logger.info('Renamed file = %s to %s.' % (os.path.join(nav_base, 'default.xml.bak'), os.path.join(nav_base, 'default.xml')))
            except Exception as e:
                logger.info('ERROR : Could not rename file = %s to %s. Please check file permissions or perform the operation manually.' % (source_file, file[:-4]))
                logger.info('Exception : %s' % e)
            
            
            # check to see if there are ehm_* files in local and copy those back out to lookups/
            lookup_base = os.path.join(splunk.appserver.mrsparkle.lib.util.get_apps_dir(), 'extrahop_metrics','lookups')
            local_base = os.path.join(splunk.appserver.mrsparkle.lib.util.get_apps_dir(), 'extrahop_metrics','local') 
            files = os.listdir(local_base)
            for file in files:
                if file.startswith('ehm_'):
                    try:
                        source_file = os.path.join(local_base, file)
                        target_file = os.path.join(lookup_base, file)
                        shutil.copy2(source_file,target_file)
                        logger.info('copied file = %s to %s.' % (source_file, target_file))

                    except (IOError,OSError), e:
                            #logger.info('ERROR : Could not copy file = %s to %s. Please check file permissions or perform the operation manually.' % (source_file, target_file))
                            logger.info('Exception : %s' % e)

           
            try:
                entity.refreshEntities(['data','ui','views'])
                entity.refreshEntities(['data','ui','nav'])
            except Exception as e:
                logger.info('refresh failed: %s'%e)
            return self.render_template('/extrahop_metrics:/templates/success.html')
        else:
            response = {}
            response['error'] = {'msg':output}
            return self.render_template('/extrahop_metrics:/templates/failure.html', dict(form_content=response))
