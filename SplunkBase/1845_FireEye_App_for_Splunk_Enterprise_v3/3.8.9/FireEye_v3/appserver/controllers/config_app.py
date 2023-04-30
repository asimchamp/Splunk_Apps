import re
import os
import logging
import cherrypy
import requests
import configparser
from lxml import etree
import lxml.etree as ET
import xml.etree.cElementTree as et

import splunk.appserver.mrsparkle.controllers as controllers
from splunk.appserver.mrsparkle.lib.decorators import expose_page
from splunk.appserver.mrsparkle.lib.routes import route
from splunk.appserver.mrsparkle.lib.util import make_splunkhome_path



logger = logging.getLogger('splunk')

BASE_DIR = make_splunkhome_path(["etc", "apps", "FireEye_v3"])
CONF_FILE = os.path.join(BASE_DIR, 'local', 'fireeye.conf')

NAV_INPUT = os.path.join(BASE_DIR, 'default', 'data', 'ui', 'nav', 'default.xml')
NAV_OUTPUT = os.path.join(BASE_DIR, 'local', 'data', 'ui', 'nav', 'default.xml')

ANALYTICS_INPUT = os.path.join(BASE_DIR, 'default', 'data', 'ui', 'views', 'analytics.xml')
ANALYTICS_OUTPUT = os.path.join(BASE_DIR, 'local', 'data', 'ui', 'views', 'analytics.xml')
PRODUCTS = ['nx', 'ex', 'etp', 'ax', 'fx', 'hx', 'px', 'tap', 'dod']

class TestController(controllers.BaseController):
    """
  Test instantiation of a BaseController-style class
  """

    def parse_config_file(self):
        try:
            config = configparser.ConfigParser()
            if not os.path.exists(CONF_FILE):
                logger.error("Config file does not exist: ", CONF_FILE)
                return False

            config.read(CONF_FILE)
            sections = config.sections()
            if sections is None:
                logger.error("No sections found in the config file")
                return False

            conf_dict = {}
            for section in config.sections():
                section_data = dict(config.items(section))
                conf_dict[section] = section_data
            return conf_dict
        except Exception as err:
            logger.error("Exception while reading config file: ", err)
            return False


    def handle_edit(self):
        try:
            conf_dict = self.parse_config_file()
            if not conf_dict:
                logger.error("No data returned from config file: ")
                return False

            panels_status = self.edit_panels(conf_dict)
            dash_status = self.edit_dashboard(conf_dict)
            if panels_status and dash_status:
                return True
            else:
                return False
        except Exception as e:
            logger.error("Exception while writing to xml: ", e)
            return False


    @expose_page(must_login=True)
    def setup(self, **kwargs):
        try:
            status = self.handle_edit()
            if status:
                return 1
            else:
                return 0
            # raise cherrypy.HTTPRedirect('/app/FireEye_v3')

        except Exception as e:
            logger.err("Exception occured :", e)
            return 0


    def edit_panels(self, conf_dict):
        try:
            # tree = ET.parse(NAV_INPUT)
            parser = etree.ETCompatXMLParser()
            tree = etree.parse(NAV_INPUT, parser)
            root = tree.getroot()

            conf_data = conf_dict['setupentity']
            # print(conf_data)

            if '1' in conf_data.values() : 
                for arg in PRODUCTS:
                    if arg not in conf_data.keys() or int(conf_data[arg]) == 0:
                        for panels in root:
                            for dashboard in panels:
                                # logger.error("dashboard elements :", dashboard)
                                dash = dashboard.attrib
                                # logger.error("dashboard values :", dash.values())
                                for v in list(dash.values()):
                                    # logger.error("dashboard values :", v)
                                    if re.match('%s_*'%arg, v):
                                        panels.remove(dashboard)


            # make sure the dir is created if is not
            dir_path = os.path.dirname(NAV_OUTPUT)
            # code commented to avoid manual check for cloud compatibility
            if not os.path.exists(dir_path):
                os.makedirs(dir_path)

            tree.write(NAV_OUTPUT)
            return True
        except Exception as err:
            logger.error("Error while editing panel: ", err)
            return False


    def edit_dashboard(self, conf_dict):
        try:
            # tree = ET.parse(ANALYTICS_INPUT)
            parser = etree.ETCompatXMLParser()
            tree = etree.parse(ANALYTICS_INPUT, parser)
            root = tree.getroot()

            conf_data = conf_dict['setupentity']
            # print(conf_data)
            if '1' in conf_data.values(): 
                for arg in PRODUCTS:
                    if arg not in conf_data.keys() or int(conf_data[arg]) == 0:
                        for panels in root:
                            for dashboard in panels:
                                # logger.error("dashboard elements :", dashboard)
                                dash = dashboard.attrib
                                # logger.error("dashboard values :", dash.values())
                                for v in list(dash.values()):
                                    # logger.error("dashboard values :", v)
                                    if re.match('%s_stats*'%arg, v):
                                        panels.remove(dashboard)

            dir_path = os.path.dirname(ANALYTICS_OUTPUT)

            # code commented to avoid manual check for cloud compatibility
            if not os.path.exists(dir_path):
                os.makedirs(dir_path)

            tree.write(ANALYTICS_OUTPUT)
            return True
        except Exception as err:
            logger.error("Error while editing panel: ", err)
            return False


    # @route('/:path=routed')
    # @expose_page(must_login=True)
    # def request_echo(self, **kwargs):
    #     """
    #   Example handler that uses the @route() decorator to
    #   control the URI endpoint mapping
    #   """
    #     cherrypy.response.headers['Content-Type'] = 'text/plain'
    #     output = []
    #     for k, v in kwargs.items():
    #         output.append('%s: %s' % (k, v))
    #     output.append(CONF_FILE)
    #     return '\n'.join(output)

    # @expose_page(must_login=True)
    # def mako_template(self, **kwargs):
    #     # note the path syntax here: in order to reference templates
    #     # included in an app, use the modified path of the form:
    #     #     /<YOUR_APP_NAME>:/templates/<YOUR_TEMPLATE_NAME>
    #     return self.render_template('/network:/templates/controller_test.html', {'qs': kwargs})

