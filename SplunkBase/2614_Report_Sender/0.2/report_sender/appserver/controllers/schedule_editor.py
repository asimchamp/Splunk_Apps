import os
import cherrypy
from splunk.appserver.mrsparkle.controllers import BaseController
from splunk.appserver.mrsparkle.lib.decorators import expose_page
from splunk.appserver.mrsparkle.lib.util import get_apps_dir
from splunk import entity


cron_script = os.path.join(get_apps_dir(), 'report_sender', 'bin', 'manage_cron.sh')
mail_script = os.path.join(get_apps_dir(), 'report_sender', 'bin', 'send_report.sh')

class ScheduleEditor(BaseController):
    @expose_page(must_login=True, methods=['POST'])
    def manage_schedule(self, op, title='', attachment='', url='', email='', cron='', key='', **kwargs):
        if op == 'remove':
            cmd = ' '.join([cron_script, op, key])
            result = os.system(cmd)
            return self.render_json({'result': result, 'key': key})
        elif op == 'add':
            crontab = ' '.join([cron, mail_script, email, "'"+url+"'", "'"+title+"'", "'"+attachment+"'", '# ' + key])
            cmd = ' '.join([cron_script, op, '"' + crontab + '"'])
            result = os.system(cmd)
            return self.render_json({'result': result, 'script': cmd})
