import re, sys, logging, traceback
import cherrypy
import splunk.appserver.mrsparkle as mrsparkle
import splunk.appserver.mrsparkle.controllers as controllers
from splunk.appserver.mrsparkle.lib.decorators import expose_page
from splunk.appserver.mrsparkle.lib.routes import route
from splunk.appserver.mrsparkle.lib import util
import splunk.util
import splunk.search as se
import eventinfo

logger = logging.getLogger('splunkbase')

def addMsg(targs, level, text):
    targs['messages'][level].append(str(text))
    if level == 'error':
        addMsg(targs, 'warn', 'Stacktrace: %s' % traceback.format_exc())

class SBController(controllers.BaseController):
    '''/splunkbase'''

    @route('/')
    @expose_page(must_login=True, methods=['GET', 'POST'])
    def index(self, **kwargs):

        cherrypy.response.headers['content-type'] = mrsparkle.MIME_HTML
        targs = { 'messages': {'error':[], 'warn':[], 'info':[]} }
        sessionKey = kwargs['sessionKey'] = cherrypy.session['sessionKey']
        username = cherrypy.session['user']['name']

        namespace  = kwargs.get('namespace',None)
        sid        = kwargs.get('sid',None)
        soffset    = kwargs.get('offset',None)
        command    = kwargs.get('command',None)

        if command not in ['view', 'share', 'suggestapp']:
            command = None
        if not namespace or not sid or not soffset or not command:
            return self.outputError(targs, 'SID ("%s"), OFFSET ("%s"), NAMESPACE ("%s"), and COMMAND ("%s") are required to have values' % (sid, soffset, namespace, command))

        try:
            job = se.getJob(sid)
            event = job.events[int(soffset)]
            appinfo = eventinfo.loadInfo()
            targs['bestapps'] = eventinfo.suggestByEventDetails(appinfo, event)
            page = "bestapps"
        except Exception, e:
            return self.outputError(targs, 'Exception: %s.' % e)
        
        cherrypy.response.headers['content-type'] = mrsparkle.MIME_HTML
        return self.render_template('splunkbase:/templates/splunkbase/%s.html' % page, targs)

    def outputError(self, targs, msg):
        addMsg(targs, 'error', msg)
        return self.render_template('splunkbase:/templates/splunkbase/error.html', targs)


def getFieldValue(event, field, defaultVal):
    val = defaultVal
    if field == "_raw":
        val = event.raw.getRaw()
    elif field in event:
        fieldValues = event[field]
        if len(fieldValues) > 0:
            val = fieldValues[0].value
    return g_re_whitespaceCleaner.sub('\n', val.strip())


def unit_test():

    cherrypy.tools.sessions.on = True    
    class FakeSession(dict):
        def __init__(self):
            self.id = 5
            self.sessionKey = splunk.auth.getSessionKey('admin', 'changeme')
    cherrypy.session = FakeSession()
    cherrypy.session['sessionKey'] = splunk.auth.getSessionKey('admin', 'changeme')
    cherrypy.session['user'] = { 'name': 'admin' }
    cherrypy.session['id'] = 12345
    cherrypy.config['module_dir'] = '/'
    cherrypy.config['build_number'] = '123'
    cherrypy.request.lang = 'en-US'
    # roflcon
    class elvis:
        def ugettext(self, msg):
            return msg
    cherrypy.request.t = elvis()
    # END roflcon

    sb = SBController()

    argc = len(sys.argv)
    if argc == 2:
        command = sys.argv[1]
        out = sb.index(command=command)
        print out
    else:
        print 'Usage: %s command' % sys.argv[0]

if __name__ == '__main__':
    unit_test()
