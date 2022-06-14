'''
Apius SSHFS Modular Input Script

Copyright (C) 2014 APIUS Technologies

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.


'''

from distutils.version import LooseVersion
import logging
import os
import sys
import time
import subprocess
import tempfile
import hashlib
import cherrypy

import splunk
import splunk.entity as entity
import splunk.appserver.mrsparkle.controllers as controllers
import splunk.appserver.mrsparkle.lib.util as util
from splunk.appserver.mrsparkle.lib.decorators import expose_page
from splunk.appserver.mrsparkle.lib.routes import route

import urllib
import xml.sax.saxutils as xmlutils
import xml.dom.minidom as xml

def host_app(fn):
    def decorator(self, *args, **kwargs):
        kwargs.update({'host_app' : cherrypy.request.path_info.split('/')[3]})
        return fn(self, *args, **kwargs)

    return decorator

APPNAME = 'sshfs'
logger = logging.getLogger('splunk.' + APPNAME)
STOREDSIGNATURE = "<stored>"

dir = os.path.join(util.get_apps_dir(), __file__.split('.')[-2], 'bin')
if not dir in sys.path:
    sys.path.append(dir)

class sshSetup(controllers.BaseController):
    '''ssh Setup Controller'''
    @route('/:app/:action=list')
    @expose_page(must_login=True, methods=['GET', 'POST']) 
    @host_app
    def list(self, app, action, host_app=None, **kwargs):
        # iterate over all ssh inputs
        response, content = splunk.rest.simpleRequest('/servicesNS/nobody/' + APPNAME + '/data/inputs/' + APPNAME, sessionKey=cherrypy.session['sessionKey'], method='GET')
        if response.status >= 400:
                return self.render_template('/'+ APPNAME + ':/templates/err.html',
                                            dict(err="Could not get input list!", app=app))
        xmlroot = xml.parseString(content)
        inputs = []
        for entry in xmlroot.getElementsByTagName('entry'):
            k = {}
            k['name'] = str(entry.getElementsByTagName('title')[0].childNodes[0].nodeValue)
            for key in entry.getElementsByTagName('s:key'):
                k[str(key.getAttribute("name"))] = str(key.childNodes[0].nodeValue) if key.childNodes else ''
            inputs.append(k)
        mountpath = os.environ['SPLUNK_HOME'] + '/etc/apps/' + APPNAME + '/mountpoints/'
        # print saved inputs
        return self.render_template('/' + APPNAME + ':/templates/list.html',
                                    dict(inputs=inputs, app=app, mountpath=mountpath))
    @route('/:app/:action=query')
    @expose_page(must_login=True, methods=['POST'])
    @host_app
    def query(self, app, action, host_app=None, **params):
        env = os.environ
        try:
            del env['LD_LIBRARY_PATH']
        except:
            pass
        name = params.get('name')
        port = params.get('port')
        root = params.get('root')
        port = port if port and port.isdigit() else '22'
        if not root:
            root = '/'
        if not params.get('privkey') and not params.get('password'):
        # query public keys on this server and get password/privkey
            u_a = params.get('user_address').split('@')
            username = ''.join(u_a[:-1])
            if not username:
                username = 'root'
            address = u_a[-1]
            out, err = subprocess.Popen(['ssh-keyscan', '-p', port, '-trsa,dsa,ecdsa', address], shell=False, stderr=subprocess.PIPE, stdout=subprocess.PIPE, env=env).communicate()
            handle, fname = tempfile.mkstemp()
            os.write(handle, out)
            os.close(handle)
            keyscan = hashlib.sha1(''.join(sorted(out.split('\n')))).hexdigest()
            # have public keys, get fingerprint
            out, err = subprocess.Popen(['ssh-keygen', '-l', '-f', fname], shell=False, stderr=subprocess.PIPE, stdout=subprocess.PIPE, env=env).communicate()
            os.unlink(fname)
            # parse fingerprints
            fprint = []
            for line in out.split('\n'):
                if not line:
                    continue
                data = line.split(' ')
                if not data[0].isdigit():
                    continue
                fprint.append({'fprint':data[1], 'keylen':data[0], 'type':data[3][1:-1]})
            if not len(fprint):
                return self.render_template('/'+ APPNAME + ':/templates/err.html', dict(app=app, err="Could not connect to remote host"))
            # and send data
            return self.render_template('/'+ APPNAME + ':/templates/add.html',
                                        dict(fprint=fprint, app=app, username = username, address = address, name=name, port=port, root=root, keyscan=keyscan))
        else:
            # we have all data - save input, and save credentials
            user = params.get('user')
            address = params.get('address')
            auth = params.get('auth')
            privkey = params.get('privkey')
            password = params.get('password')
            out, err = subprocess.Popen(['ssh-keyscan', '-p', port, '-trsa,dsa,ecdsa', address], shell=False, stderr=subprocess.PIPE, stdout=subprocess.PIPE, env=env).communicate()
            if params.get('keyscan')!=hashlib.sha1(''.join(sorted(out.split('\n')))).hexdigest():
                return self.render_template('/'+ APPNAME + ':/templates/err.html',
                                            dict(err="public key was changed. Possible MITM attack!", app=app))
            # accept public key
            cmd = ['ssh', '%s@%s' % (user, address), '-p', port, '-o', 'NumberOfPasswordPrompts=0', '-o', 'StrictHostKeyChecking=no', 'exit' ]
            p = subprocess.Popen(cmd, shell=False, stderr=subprocess.PIPE, stdout=subprocess.PIPE, stdin=subprocess.PIPE, env=env)
            p.communicate(input='yes\n')
            # accepted - save input
            if (privkey and password):
                return self.render_template('/'+ APPNAME + ':/templates/err.html',
                                            dict(err="Please provide either password or private key", app=app))
            response, content = splunk.rest.simpleRequest('/servicesNS/nobody/' + APPNAME + '/data/inputs/' + APPNAME + '/:' + name + ':', sessionKey=cherrypy.session['sessionKey'], postargs={'name': name, 'user': user, 'address': address, 'dir': root, 'port': port, 'auth': auth, 'privkey': privkey, 'password': password}, method='POST')
            if response.status >= 400:
                return self.render_template('/'+ APPNAME + ':/templates/err.html',
                                            dict(err="Could not save new input!", app=app))
            # done!
            raise cherrypy.HTTPRedirect(self._redirect(host_app, app, 'list'))

    @route('/:app/:action=delete')
    @expose_page(must_login=True, methods=['POST'])
    @host_app
    def delete(self, app, action, host_app=None, **params):
        # delete input and destroy credentials
        name = params['remove']
        response, content = splunk.rest.simpleRequest('/servicesNS/nobody/' + APPNAME + '/data/inputs/' + APPNAME + '/' + name, sessionKey=cherrypy.session['sessionKey'], method='DELETE')
        if response.status >= 400:
            return self.render_template('/'+ APPNAME + ':/templates/err.html',
            dict(err="Could not delete input!", app=app))
        # redirect
        raise cherrypy.HTTPRedirect(self._redirect(host_app, app, 'list'))

    def _redirect(self, host_app, app, endpoint):
        return self.make_url(['custom', host_app, APPNAME, app, endpoint])

    def _get_version(self):
        try:
            return LooseVersion(entity.getEntity('server/info', 'server-info')['version'])
        except:
            return LooseVersion('0.0')
