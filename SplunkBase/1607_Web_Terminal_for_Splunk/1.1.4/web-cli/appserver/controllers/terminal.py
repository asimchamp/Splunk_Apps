import os
import cherrypy
import logging
import logging.handlers
import json
import subprocess
import shlex

import splunk, splunk.util
import splunk.appserver.mrsparkle.controllers as controllers
from splunk.appserver.mrsparkle.lib.decorators import expose_page
from splunk.appserver.mrsparkle.lib.routes import route
from splunk.appserver.mrsparkle.lib import jsonresponse, util, cached

def setup_logger(level):
    logger = logging.getLogger('webcli_app')
    logger.propagate = False # Prevent the log messages from being duplicated in the python.log file
    logger.setLevel(level)

    file_handler = logging.handlers.RotatingFileHandler(os.path.join(os.environ.get("SPLUNK_HOME"), 'var', 'log', 'splunk', 'webcli_app.log'), maxBytes=25000000, backupCount=5)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    file_handler.setFormatter(formatter)

    logger.addHandler(file_handler)

    return logger
    
logger = setup_logger(logging.INFO)

class TerminalController(controllers.BaseController):


    def render_template(self, template_path, template_args = {}):
        template_args['appList'] = self.get_app_manifest()
        return super(TerminalController, self).render_template(template_path, template_args)
    def get_app_manifest(self):
        output = cached.getEntities('apps/local', search=['disabled=false','visible=true'], count=-1)
        return output 
        
    @expose_page(must_login=True, methods=['GET'])
    @route('/', methods=['GET'])
    def view(self, **kwargs):
        
        app = cherrypy.request.path_info.split('/')[3]

        return self.render_template('/%s:/templates/terminal.html' % app, dict(app=app))

    
    @expose_page(must_login=True, methods=['POST'])
    @route('/', methods=['POST'])
    def process(self, **kwargs):
        user = cherrypy.session['user']['name']
        command = kwargs.get('command')
        splitCommand = shlex.split(command) if os.name == 'posix' else command.split(' ')
        isRestartCommand = False
        if not command:
            error = "No command"
            return self.render_json(dict(success=False, payload=error))
        
        logger.info('user='+str(user)+ ' command='+str(command))        
        if command.startswith('restart'):
            isRestartCommand = True
        if splitCommand[0] and splitCommand[0].lower() == 'cmd':
            if splitCommand[1] and not splitCommand[1].lower() in ['btool', 'splunkd', 'exporttool', 'btprobe', 'classify']:
                payload = 'For security purposes this command is disabled'
                return self.render_json(dict(success=False, payload=payload))    
        
        try:
            os.environ['SPLUNK_TOK'] = str(cherrypy.session['sessionKey'])
            splunkPath = os.path.join(os.environ['SPLUNK_HOME'],'bin','splunk')
            fullCommand = [splunkPath] + splitCommand
            p = subprocess.Popen(fullCommand, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            if isRestartCommand:
                payload = 'Restart is in progress, please wait...'
            else:
                stdout,stderr = p.communicate()
                if stderr:
                    return self.render_json(dict(success=False, payload=str(stderr)))
                
                payload = str(stdout)
            del os.environ['SPLUNK_TOK']
        except Exception, e:
            return self.render_json(dict(success=False, payload=str(e)))

        return self.render_json(dict(success=True, payload=payload))
    