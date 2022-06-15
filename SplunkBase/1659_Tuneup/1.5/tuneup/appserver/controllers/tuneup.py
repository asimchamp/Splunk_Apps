import re, sys, logging, traceback
import cherrypy
import splunk.auth
import splunk.appserver.mrsparkle as mrsparkle
import splunk.appserver.mrsparkle.controllers as controllers
from splunk.appserver.mrsparkle.lib.decorators import expose_page
from splunk.appserver.mrsparkle.lib.routes import route
from splunk.appserver.mrsparkle.lib import util

import tuner


logger = logging.getLogger('tuneup')


def addMsg(targs, level, text):
    targs['messages'][level].append(str(text))
    if level == 'error':
        addMsg(targs, 'warn', 'Stacktrace: %s' % traceback.format_exc())



class TuneupController(controllers.BaseController):
    '''/tuneup'''

    @route('/')
    @expose_page(must_login=True, methods=['GET', 'POST'])
    def index(self, **kwargs):

        cherrypy.response.headers['content-type'] = mrsparkle.MIME_HTML
        targs = { 'messages': {'error':[], 'warn':[], 'info':[]}}

        self._sessionKey = kwargs['sessionKey'] = cherrypy.session['sessionKey']
        self._namespace  = kwargs.get('namespace',None)
        self._owner = cherrypy.session['user']['name']

        if not splunk.auth.ping(sessionKey=self._sessionKey):
            return self.redirect_to_url('/account/login', _qs=[ ('return_to', util.current_url_path())])

        try:
            self.tuneupPage(targs,**kwargs)
            return self.render_template('tuneup:/templates/tuneup/tuneup.html', targs)
        except Exception, e:
            return self.outputError(targs, 'Exception: %s.' % e)

    def outputError(self, targs, msg):
        addMsg(targs, 'error', msg)
        return self.render_template('tuneup:/templates/tuneup/error.html', targs)

    def tuneupPage(self, targs,**kwargs):

        app = kwargs.get('app', None)
        apps = splunk.entity.getEntities('apps/local', search='visible=1 AND disabled=0', namespace=None, owner=self._owner, count=-1).keys()

        qstr = kwargs.get('customsearch', '').strip()

        allusers = 'allusers' in kwargs
        targs['allusers'] = allusers
        targs['customsearch'] = qstr
        targs['app'] = app
        targs['apps'] = apps
        targs['allusers'] = allusers
        #raise Exception("%s, %s, %s, %s, %s" % (app, apps, allusers, self._owner, self._sessionKey))
        targs['tuneup'] = tuner.tuneup(targs, app, allusers, self._owner, self._sessionKey, qstr)

        

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

    tuneuper = TuneupController()

    argc = len(sys.argv)

    out = tuneuper.index()
    print out


if __name__ == '__main__':
    unit_test()
