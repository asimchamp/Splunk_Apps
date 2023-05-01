import os
import shutil

import splunk.appserver.mrsparkle.controllers as controllers
from splunk.appserver.mrsparkle.lib.decorators import expose_page

APPNAME="unique"

splunk_apps_path = os.path.join(os.environ['SPLUNK_HOME'], 'etc', 'apps')
local_var_path = splunk_apps_path + os.sep + APPNAME + os.sep + "var"

def execute_install():
    app_ok_file = os.path.join(splunk_apps_path, APPNAME, "default", "data", "ui", "nav", "OK-app.xml")
    default_file = os.path.join(splunk_apps_path, APPNAME, "default", "data", "ui", "nav", "default.xml")
    shutil.copyfile(app_ok_file, default_file)

def install_done():
    try:
        os.makedirs(local_var_path)
    except OSError: # If the path exists, then we are good
        pass

    fp = open(local_var_path + os.sep + "installed", "w")
    fp.write("OK")
    fp.close()

class SetupController(controllers.BaseController):
    @expose_page(must_login=True)
    def setup(self, **kwargs):
        install_done()
        execute_install()
        return "<meta HTTP-EQUIV=\"REFRESH\" content=\"0; url=../../../manager/launcher/control\">"
 
