import sys, json
import cherrypy
import logging
sys.path.append('./')
import splunk.Intersplunk
import splunklib.client as client


import splunk.appserver.mrsparkle.controllers as controllers
from splunk.appserver.mrsparkle.lib.decorators import expose_page
from splunk.appserver.mrsparkle.lib.routes import route

app_name = "FireEye_v3"
logger = logging.getLogger('splunk')


class TestController(controllers.BaseController):


    def create_new_role(self, session_key):
        try:
            splunkService = client.connect(token=session_key, app=app_name, owner="nobody")
            roles = splunkService.roles
            role_capability = "delete_by_keyword"

            for role in roles:
                if role.name == app_name.lower():
                    roles.delete(role.name)

            new_role = roles.create(app_name)
            new_role.grant(role_capability)
            new_role.refresh()
            return 1
        except Exception as e:
            return 0

    def delete_new_role(self, session_key):
        try:
            splunkService = client.connect(token=session_key, app=app_name, owner="nobody")
            roles = splunkService.roles
            for role in roles:
                if role.name == app_name.lower():
                    roles.delete(role.name)
                    role.refresh
            return 1
        except Exception as e:
            return 0

    def encrypt_password(self, username, password, session_key):
        try:
            args = {'token': session_key, 'app': app_name, 'owner': "nobody"}
            service = client.connect(**args)
            # If the credential already exists, delete it.
            for storage_password in service.storage_passwords:
                if storage_password.username == username:
                    service.storage_passwords.delete(username=storage_password.username)
                    break
            # Create the credential.
            service.storage_passwords.create(password, username)
        except Exception as e:
            logger.error("Exception while encrypting credential :", e)
            # self.delete_new_role(session_key)
            return e

    @expose_page(must_login=True)
    def encrypt_creds(self, **kwargs):
        try:
            session_key = cherrypy.session.get('sessionKey')
            # data = json.loads(kwargs['args'])
            data = cherrypy.request.headers
            if data:
                # user = cherrypy.session['user'].get('name')
                # self.manage_role_by_user(session_key, user)
                # self.create_new_role(session_key)
                api_keys = json.loads(data['Api-Keys'])
                for key, val in api_keys.items():
                    self.encrypt_password(key, val, session_key)
                # self.delete_new_role(session_key)
                return 1
            else:
                return 0

        except Exception as e:
            # self.delete_new_role(session_key)
            return 0

    # if __name__ == '__main__':

    #     results,dummyresults,settings = splunk.Intersplunk.getOrganizedResults()
    #     session_key = str(settings.get('sessionKey'))
    #     print(session_key)
    #     encrypt_password('abcdef', 'hello', session_key)
    #     list_storage_passwords(session_key)
