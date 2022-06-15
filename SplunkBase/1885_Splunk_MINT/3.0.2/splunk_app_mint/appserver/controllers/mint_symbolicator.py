from . import utils
import os
import re
import sys
import time
import json
import cherrypy
from . import six
import splunk
import splunk.rest
import splunk.admin as admin
import splunk.appserver.mrsparkle.controllers as controllers
import splunk.appserver.mrsparkle.lib.util as util
import splunk.entity as en

from splunk.appserver.mrsparkle.lib.decorators import expose_page
from splunk.appserver.mrsparkle.lib.routes import route

# dir = os.path.join(util.get_apps_dir(), __file__.split('.')[-2], 'bin')
# if not dir in sys.path:
#     sys.path.append(dir)

import requests

logger = utils.logger

# Commenting for now. This string will be dynamically updated once grunt replace task is working.
#SYMBOLICATE_ENDPOINT = "https://ios.splkmobile.com/api/v1/symbolicate?source=splunk"
SYMBOLICATE_ENDPOINT = "https://ios.splkmobile.com/api/v1/symbolicate?source=splunk"

REQUIRED_FIELDS = ['errorHash', 'stacktrace', 'buildUuid', 'architecture', 'packageName',
                   'osVersion', 'apiKey', 'where']

OPTIONAL_FIELDS = ['threadCrashed'] # default to '0'


class MintSymbolicator(controllers.BaseController):
    ''' MINT Symbolicator Middleware '''

    @route('/:app/:action=symbolicate')
    @expose_page(must_login=True, trim_spaces=True, methods=['POST'])
    def symbolicate(self, app, action, **kwargs):
        ''' Proxy symbolicate request to MINT Symbolicator along with proper authentication '''
        logger.info('MINT: symbolicator handling user request')

        user = cherrypy.session['user']['name']
        host_app = cherrypy.request.path_info.split('/')[3]

        self.messages = []

        header_api_key = None
        header_auth_token = None

        # Read POST data of type application/json
        try:
            request = self.parse_json_payload()
        except Exception as e:
            return self.respond_client_error(str(e))
        #logger.debug("MINT: request %s" % str(request))

        # Input request validation
        for field in REQUIRED_FIELDS:
            if not field in request:
                return self.respond_client_error("Missing required field '%s' from payload" % field)

        # Set header since Symbolicator accepts apiKey as a header, not in the payload
        header_api_key = request['apiKey']
        del request['apiKey']

        org_stacktrace = request['stacktrace']
        thread_crashed = request.get('threadCrashed', '0')

        # Set header auth token from local MINT TA's tokens.conf
        # Note: this will be substituted as other authentication methods are supported
        session_key = cherrypy.session.get('sessionKey')
        try:
            header_auth_token = self.get_cds_token(user, session_key)
        except Exception as e:
            return self.respond_server_error("Failed to retrieve auth token: '%s'" % str(e))

        # logger.error('mint auth token =' + header_auth_token)
        headers = {
            'content-type': 'application/json; charset=utf-8',
            'x-splunk-mint-apikey': header_api_key,
            'x-splunk-mint-auth-token': header_auth_token
        }

        req_args = {
            "verify": True,
            "stream": False,
            "timeout": 30
        }

        ent = en.getEntity('configs/conf-ssl', 'proxy',
                           namespace='splunk_app_mint',
                           owner=user,
                           sessionKey=session_key)

        https_proxy = ent.get('https_proxy')

        if https_proxy:
            req_args["proxies"] = {"https": https_proxy }

        try:
            if not ('\r' in request['errorHash'] or '\n' in request['errorHash']):
                logger.error('MINT: symbolicating errorHash=%s' % request['errorHash'])
            start_time = time.time()
            r = requests.post(SYMBOLICATE_ENDPOINT, data=json.dumps(request), headers=headers, **req_args)
            end_time = time.time()
            duration = (end_time - start_time) * 1000
            logger.error('MINT: symbolicator response received status=%s, duration=%.2fms',
                        r.status_code, duration)
        except requests.exceptions.Timeout as e:
            return self.respond_server_error("Symbolicate request timeout: '%s'" % str(e))
        except Exception as e:
            return self.respond_server_error("Symbolicate request failed: '%s'" % str(e))

        try:
            response_sym = json.loads(r.text)
        except ValueError:
            response_sym = {}

        #logger.debug('MINT: symbolicator response =%s', response_sym)
        try:
            if r.status_code >= 200 and r.status_code < 300:
                sym_stacktrace = response_sym.get('stacktrace', {})
                sym_stacktrace_processed = {}
                affected_method = None
                # convert sym_stacktrace to dict if the symbolicator returns an array
                if isinstance(sym_stacktrace, list):
                    return self.respond_server_error("Symbolication request failed")


                for thread_idx, org_thread_stacktrace in six.iteritems(org_stacktrace):
                    # original stacktrace converted from string to list
                    org_thread_stacktrace_list = org_thread_stacktrace.splitlines()
                    # symbolicated stacktrace as dict with string keys
                    sym_thread_stacktrace = sym_stacktrace.get(thread_idx, {})
                    # build new symbolicated stacktrace in list format:
                    sym_thread_stacktrace_list = []
                    for i, line in enumerate(org_thread_stacktrace_list):
                        sym_thread_stacktrace_list.append(sym_thread_stacktrace.get(str(i), line))

                    # find the affected method
                    if thread_idx == thread_crashed:
                        affected_method = self.find_affected_method(org_thread_stacktrace_list, sym_thread_stacktrace, request['where'])

                    sym_stacktrace_processed[thread_idx] = sym_thread_stacktrace_list

                response = {
                    'stacktrace': sym_stacktrace_processed,
                    'thread_crashed': thread_crashed,
                    'affected_method': affected_method
                }

            else:
                message = response_sym.get('message', 'Symbolication failed')
                self.add_message('ERROR', message)
                response = {
                    'messages': self.messages
                }
        except Exception as e:
            logger.error("MINT: symbolicator handler server error: '%s'" % str(e))
            return self.respond_server_error("Symbolication request failed")

        cherrypy.response.status = r.status_code
        return self.render_json(response, 'application/json')

    '''
    *****************
    Helper Functions:
    *****************
    '''

    def parse_json_payload(self):
        ''' Read request payload and parse it as JSON '''

        if not cherrypy.request.body:
            raise Exception('No request payload')

        body = cherrypy.request.body.read()
        if not body:
            raise Exception('Request payload empty')

        # logger.debug(body)
        try:
            data = json.loads(body)
        except Exception as e:
            raise Exception('Could not parse JSON payload')

        return data

    def get_cds_token(self, userName, sessionKey):
        ''' Read CDS url and token from tokens.conf '''

        ent = en.getEntity('configs/conf-symbolicator',
                           'settings',
                           namespace='splunk_app_mint',
                           owner=userName,
                           sessionKey=sessionKey)

        token = ent.get('authentication_key')
        if not token:
            raise Exception, "Could not find Splunk MINT Data Collector token"

        return token

    def find_affected_method(self, org_stacktrace_list, sym_stacktrace, where):
        ''' Find the affected method based on the stacktrace '''

        affected_line = None
        line_number = None
        affected_method = None
        # find the line number that has the hex where value
        for i, line in enumerate(org_stacktrace_list):
            if where in line:
                line_number = str(i)

        # get the line from the new stacktrace
        affected_line = sym_stacktrace.get(line_number, '')
        # run the regex against the line to find the method
        match = re.match(r"^.*\[(.*)].*$", affected_line)

        if match:
            affected_method = match.group(1)
        else:
            affected_method = where

        return affected_method

    def add_message(self, level, message, **kw):
        kw.update({'type': splunk.util.toUTF8(level), 'text': splunk.util.toUTF8(message)})
        self.messages.append(kw)

    def partial_responce(self, message='Dsym not found'):
        logger.error("MINT: symbolicator handler client error: '%s'" % message)
        self.add_message('ERROR', message)
        cherrypy.response.status = 206
        return self.render_json({'messages': self.messages}, 'application/json')

    def respond_client_error(self, message):
        logger.error("MINT: symbolicator handler client error: '%s'" % message)
        self.add_message('ERROR', message)
        cherrypy.response.status = 400
        return self.render_json({'messages': self.messages}, 'application/json')

    def respond_server_error(self, message):
        logger.error("MINT: symbolicator handler server error: '%s'" % message)
        self.add_message('ERROR', message)
        cherrypy.response.status = 500
        return self.render_json({'messages': self.messages}, 'application/json')

    def _redirect(self, host_app, app, endpoint):
        ''' Convenience wrapper to make_url() '''

        return self.make_url(['custom', host_app, 'mint_symbolicator', app, endpoint])

