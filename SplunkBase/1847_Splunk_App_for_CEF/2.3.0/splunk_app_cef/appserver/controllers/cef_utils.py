import cherrypy
import csv
import json
import logging
import os
import re
import splunk.appserver.mrsparkle.controllers as controllers
import splunk.rest
import sys
import time

try:
    from urllib.request import quote
except ImportError:
    from urllib import quote

from splunk import AuthenticationFailed, AuthorizationFailed
from splunk.appserver.mrsparkle.lib import jsonresponse
from splunk.appserver.mrsparkle.lib.routes import route
from splunk.appserver.mrsparkle.lib.decorators import expose_page
from splunk.clilib.bundle_paths import make_splunkhome_path

sys.path.append(make_splunkhome_path(["etc", "apps", "splunk_app_cef", "lib"]))
from splunk_app_cef_cim_models import DataModels

# Import the appmaker code
sys.path.append(make_splunkhome_path(["etc", "apps", "splunk_app_cef", "bin"]))
from cef_app_maker.base import AppMakerBase
from cef_app_maker.make_cefout_ta import make_cefout_ta


# set the maximum allowable CSV field size
#
# The default of the csv module is 128KB; upping to 10MB. See SPL-12117 for
# the background on issues surrounding field sizes.
# (this method is new in python 2.5)
csv.field_size_limit(10485760)


logger = logging.getLogger(
    'splunk.appserver.splunk_app_cef.controllers.cef_utils')


class InvalidDatamodel(Exception):
    pass


class InvalidDatamodelObject(Exception):
    pass


class CEFUtils(controllers.BaseController):
    '''Controller for assisting with handling CEF data in Splunk '''

    # Globals
    CEF_INVENTORY_PATH = make_splunkhome_path(
        ["etc", "apps", "splunk_app_cef", "lookups", "cef_inventory.csv"])
    NAMESPACE = "splunk_app_cef"

    def render_error_json(self, msg):
        """
        Render an error such that it can be returned to the client as JSON.

        Arguments:
        msg -- A message describing the problem (a string)
        """

        output = jsonresponse.JsonResponse()
        output.data = []
        output.success = False
        output.addError(msg)
        return self.render_json(output, set_mime='text/plain')

    @route('/:get_data_models=get_data_models')
    @expose_page(must_login=True, methods=['GET'])
    def getDataModelsAndObjects(self, **kwargs):
        session_key = cherrypy.session.get('sessionKey')
        namespace = kwargs.get('namespace') or self.NAMESPACE

        # This will contain all of the information about
        # the data-models and the associated objects
        data_models_info = []

        # Get the list of data-models
        for data_model in DataModels.getDatamodelList(
                session_key, namespace=namespace):
            try:
                data_models_info.append({
                    'name': data_model,
                    'objects': DataModels.getDatamodelObjectList(
                        data_model, session_key, namespace=namespace)})
            except Exception as e:
                logger.exception(e)
                pass

        return self.render_json(data_models_info)

    @route('/:get_available_fields=get_available_fields')
    @expose_page(must_login=True, methods=['GET'])
    def getAvailableFields(self, data_model, obj, **kwargs):
        session_key = cherrypy.session.get('sessionKey')
        namespace = kwargs.get('namespace') or self.NAMESPACE
        # Load the json
        model_json = DataModels.getDatamodelJson(
            data_model, session_key, namespace=namespace)
        # Return the attributes
        return self.render_json(
            DataModels.getAvailableFields(obj, model_json))

    @route('/:get_cef_fields=get_cef_fields')
    @expose_page(must_login=True, methods=['GET'])
    def getCEFFields(self, **kwargs):

        with open(CEFUtils.CEF_INVENTORY_PATH, 'rU') as csv_file:
            csv_reader = csv.DictReader(csv_file, dialect=csv.excel)
            return self.render_json([line for line in csv_reader])

    def removefilenametimestamp(self, filename):
        """
        Strip the timestamp from the filename
        """

        r = re.compile("[.0-9]*[_](.*)")
        m = r.match(filename)

        if m is None:
            return None
        else:
            return m.groups()[0]

    @route("/:maketaforindexers=maketaforindexers")
    @expose_page(must_login=True, methods=['GET', 'POST'])
    def maketaforindexers(self, **kwargs):
        """
        This call will generate the app for the indexers on disk and return
        the information necessary to download it.

        The created package will have a build number based on the time it
        was made (Unix epoch) and the version will be set to the same version
        as the CEF that made it.

        The version is set to be the same as the main CEF app so that we can
        track where it was generated in case there is a need to re-generate
        the TA and the customer wants to know which ones they may need to
        re-generate.
        """
        session_key = cherrypy.session.get('sessionKey')

        # Make up a build number from the time
        build_number = int(time.time())

        # Get the app version number and pass it through
        build_version = ""

        try:
            _, c = splunk.rest.simpleRequest(
                '/servicesNS/nobody/system/apps/local/splunk_app_cef',
                sessionKey=session_key,
                getargs={'output_mode': 'json'},
                raiseAllErrors=True)

            app_info = json.loads(c)
            build_version = app_info['entry'][0]['content']['version']

        except AuthenticationFailed as e:
            logger.exception(e)
            cherrypy.response.status = 403
            return self.render_json(_(str(e)))

        except Exception as e:
            logger.exception(e)
            cherrypy.response.status = 500
            return self.render_json(_('Error retrieving app and build info'))

        # Determine instance_type
        try:
            _, c = splunk.rest.simpleRequest(
                '/servicesNS/nobody/system/server/info/server-info',
                sessionKey=session_key,
                getargs={'output_mode': 'json'},
                raiseAllErrors=True)

            c = json.loads(c)['entry'][0]['content']
            instance_type = c.get('instance_type') or 'download'

        except AuthenticationFailed as e:
            logger.exception(e)
            cherrypy.response.status = 403
            return self.render_json(_(str(e)))

        except Exception as e:
            logger.exception(e)
            cherrypy.response.status = 500
            return self.render_json(_('Error retrieving instance type'))

        # Make the app
        try:
            app_info = '{"app": "Splunk_TA_cefout", "label": "Splunk Add-on for CEF Output", "version": "%s", "build": "%i"}' % (build_version, build_number)
            filepath = make_cefout_ta(
                app_info, session_key, instance_type=instance_type)

        except AuthorizationFailed as e:
            logger.exception(e)
            cherrypy.response.status = 403
            return self.render_json(_(str(e)))

        except Exception as e:
            logger.exception(e)
            cherrypy.response.status = 500
            return self.render_json(
                _('Error when attempting to create the CEF TA'))

        return self.render_json({
            'filename': os.path.basename(filepath),
            'namespace': 'splunk_app_cef'})

    @route("/:downloadapp=downloadapp")
    @expose_page(must_login=True, methods=['GET'])
    def downloadapp(self, filename, **kwargs):
        """
        This call will return the required package (the binary file).
        """

        # Make sure that the name doesn't include things like ".."
        # or sub-directory names that could be used to escape the
        # archive directory. No directory traversals here!
        filename = os.path.basename(filename)
        namespace = kwargs.get('namespace') or self.NAMESPACE
        filename_cleaned = self.removefilenametimestamp(filename)
        filepath = os.path.join(
            AppMakerBase.ARCHIVE_DIRPREFIX,
            namespace,
            AppMakerBase.ARCHIVE_DIRSUFFIX,
            filename)

        if not os.path.exists(filepath):
            cherrypy.response.status = 404
            return self.render_json("File path is not valid")

        # Tell the browser to download the app
        cherrypy.response.headers['Content-Disposition'] = 'attachment; filename="%s"' % filename_cleaned
        cherrypy.response.headers['Content-Type'] = 'application/x-gzip'

        # Open the file to send
        try:
            return cherrypy.lib.static.serve_file(
                filepath, disposition='attachment', name=filename_cleaned)
        except IOError as e:
            logger.exception(e)
            cherrypy.response.status = 404
            return self.render_json('File could not be found')

    @route('/:change_search=change_search')
    @expose_page(must_login=True, methods=['POST'])
    def change_search(self, operation, app, owner, name, **kwargs):
        # Get session key
        session_key = cherrypy.session.get('sessionKey')

        # Get the ruleUIDs
        args = {}

        if 'change_search' in kwargs:
            del kwargs['change_search']

        # jQuery may add "[]" to the arguments when an array of similar
        # argument names are provided, handle this case
        if 'operation' in kwargs:
            operation = kwargs['operation']
            del kwargs['operation']

        # Default to JSON since that is what Javascript usually wants
        if 'output_mode' not in args:
            args['output_mode'] = 'json'

        # Make the URL
        uri = '/servicesNS/{0}/{1}/saved/searches/{2}/{3}'.format(
            quote(owner, safe=''),
            quote(app, safe=''),
            quote(name, safe=''),
            quote(operation, safe=''))

        try:
            unused_r, c = splunk.rest.simpleRequest(
                uri, sessionKey=session_key, postargs=args)

        except AuthenticationFailed as e:
            logger.exception(e)
            return None

        except Exception as e:
            logger.exception('Error when changing search')

            c = json.dumps({
                'message': str(e),
                'success': False})

        cherrypy.response.headers['Content-Type'] = 'text/json'
        return c
