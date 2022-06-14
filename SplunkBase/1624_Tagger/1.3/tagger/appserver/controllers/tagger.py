import re, sys, logging, traceback
import cherrypy
import splunk.appserver.mrsparkle as mrsparkle
import splunk.appserver.mrsparkle.controllers as controllers
from splunk.appserver.mrsparkle.lib.decorators import expose_page
from splunk.appserver.mrsparkle.lib.routes import route
from splunk.appserver.mrsparkle.lib import util
import splunk.util
import splunk.search as se

import mgr

logger = logging.getLogger('tagger')

manager = mgr.ModelManager()


def addMsg(targs, level, text):
    targs['messages'][level].append(str(text))
    if level == 'error':
        addMsg(targs, 'warn', 'Stacktrace: %s' % traceback.format_exc())


def getCookieStr():
    # get cookie string, specificly the session part of it.  it turns
    # out that the sessionKey in splunk is the same for the same user
    # logged into different browsers, so we use the cookie to
    # determine different 'sessions'.
    try:
        cookie = cherrypy.request.cookie
        for name in cookie.keys():
            val = cookie[name].value
            if 'session' in name.lower():
                return val
    except Exception, e:
        pass

    # Unable to get session cookie: using sessionKey.
    return cherrypy.session['sessionKey']        


class TaggerController(controllers.BaseController):
    '''/tagger'''

    @route('/')
    @expose_page(must_login=True, methods=['GET', 'POST'])
    def index(self, **kwargs):

        cherrypy.response.headers['content-type'] = mrsparkle.MIME_HTML
        targs = { 'messages': {'error':[], 'warn':[], 'info':[]}}

        sessionKey = kwargs['sessionKey'] = cherrypy.session['sessionKey']
        cookie = getCookieStr()

        if not splunk.auth.ping(sessionKey=sessionKey):
            return self.redirect_to_url('/account/login', _qs=[ ('return_to', util.current_url_path())])

        targs['hide_tagged_values'] = 'hide_tagged_values' in kwargs
        targs['make_tag_public'] = 'make_tag_public' in kwargs

        namespace  = kwargs.get('namespace',None)
        username = cherrypy.session['user']['name']

        model = manager.getModel(cookie, namespace, username, sessionKey)
        targs['model'] = model

        try:
            self.taggerPage(model, targs,**kwargs)
            return self.render_template('tagger:/templates/tagger/tagger.html', targs)
        except Exception, e:
            return self.outputError(targs, 'Exception: %s.' % e)
            #addMsg(targs, 'warn', 'Stacktrace: %s' % traceback.format_exc())


    def outputError(self, targs, msg):

        addMsg(targs, 'error', msg)
        return self.render_template('tagger:/templates/tagger/error.html', targs)

    def taggerPage(self, model, targs,**kwargs):

        model.setRestrictionSearch(kwargs.get('rsearch', ''))

        rtype = kwargs.get('restriction_type', None)
        if rtype!=None and not model.setRestrictionType(kwargs['restriction_type']):
            rval = kwargs.get('restriction_value', '')
            if len(rval) == 0:
                rval = None # userdidn't pick
            model.setRestrictionValue(rval)

        if 'source_field' in kwargs:
            model.setSourceField(kwargs['source_field'])
        if 'groupby' in kwargs:
            model.setGroupByType(kwargs['groupby'])

        if 'app' in kwargs:
            model.setCurrentApp(kwargs['app'])

        tagname = kwargs.get('tag_name', '')
        field = kwargs.get('source_field', '')
        values = kwargs.get('field_values', [])
        if isinstance(values, basestring):
            values = [values]
        if len(tagname) > 0 and len(field) > 0 and len(values) > 0:
            makePublic = 'make_tag_public' in kwargs
            if kwargs.get('tag','') == 'tag':
                model.tag(field, values, makePublic, tagname)
            elif kwargs.get('untag','') == 'untag':
                model.untag(field, values, makePublic, tagname)
    

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

    taggerer = TaggerController()

    argc = len(sys.argv)

    out = taggerer.index()
    print out


if __name__ == '__main__':
    unit_test()
