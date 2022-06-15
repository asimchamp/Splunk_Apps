#Copyright (C) 2010-2019 Sideview LLC.  All Rights Reserved. 

import logging, cherrypy
import splunk.appserver.mrsparkle.controllers as controllers
from splunk.appserver.mrsparkle.lib.decorators import expose_page

logger = logging.getLogger('splunk.appserver.controllers.redirector')


# THIS CONTROLLER IS ONLY HERE TO WORKAROUND A BUG IN WORKFLOW ACTIONS

class redirector(controllers.BaseController):

    @expose_page(must_login=True, methods=['GET']) 
    def redirect(self, url, **kwargs):
        return self.redirect_to_url(url)
    
