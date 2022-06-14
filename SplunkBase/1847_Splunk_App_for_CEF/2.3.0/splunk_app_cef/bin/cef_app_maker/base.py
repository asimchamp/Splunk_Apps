"""
Copyright (C) 2005-2019 Splunk Inc. All Rights Reserved.
"""
import json
import logging
import logging.handlers
import os
import re
import splunk.rest as rest
import splunk.util as util
import string
import tarfile
import textwrap

from collections import OrderedDict
from io import BytesIO
from lxml import etree
from splunk import ResourceNotFound
from splunk.clilib.bundle_paths import make_splunkhome_path
from time import gmtime
try:
    from urllib.request import quote
except ImportError:
    from urllib import quote

# Python 2+3 basestring
try:
    basestring
except NameError:
    basestring = str

DEFAULT_FORMAT = '%(asctime)s %(levelname)s pid=%(process)d tid=%(threadName)s file=%(filename)s:%(funcName)s:%(lineno)d | %(message)s'
SHORT_FORMAT = '%(asctime)s %(levelname)s %(message)s'


def setup_logger(
        name,
        level=logging.WARNING,
        maxBytes=25000000,
        backupCount=5,
        fmt=DEFAULT_FORMAT):
    """
    Set up a default logger.

    @param name: The log file name.
    @param level: The logging level.
    @param maxBytes: The maximum log file size before rollover.
    @param backupCount: The number of log files to retain.
    """
    logfile = make_splunkhome_path(['var', 'log', 'splunk', name + '.log'])
    lgr = logging.getLogger(name)
    lgr.setLevel(level)
    # Prevent the log messages from being duplicated in the python.log file
    lgr.propagate = False

    # Prevent re-adding handlers to the logger object
    # which can cause duplicate log lines
    handler_exists = any(
        [True for h in lgr.handlers if h.baseFilename == logfile])
    if not handler_exists:
        file_handler = logging.handlers.RotatingFileHandler(
            logfile, maxBytes=maxBytes, backupCount=backupCount, delay=True)
        formatter = logging.Formatter(fmt)
        file_handler.setFormatter(formatter)
        lgr.addHandler(file_handler)

    return lgr


logger = setup_logger(
    'appmaker_base_class', level=logging.INFO, fmt=SHORT_FORMAT)


class AppNameUnspecified(Exception):
    pass


class FileNameUnspecified(Exception):
    pass


class CustomRESTExportFailed(Exception):
    pass


class AppMakerBase(object):
    ARCHIVE_DIRPREFIX = make_splunkhome_path(['etc', 'apps'])
    ARCHIVE_DIRSUFFIX = os.path.join('local', 'data', 'appmaker')
    ARCHIVE_VALIDCHARS = "-_.() %s%s" % (string.ascii_letters, string.digits)
    ARCHIVE_EXTENSION = '.spl'

    DIR_APPSERVER_STATIC = 'appserver/static'
    DIR_DEFAULT = 'default'
    DIR_METADATA = 'metadata'
    DIR_PANELS = 'data/ui/panels'
    DIR_VIEWS = {
        'html': {'DIR': 'data/ui/html', 'EXT': 'html'},
        'views': {'DIR': 'data/ui/views', 'EXT': 'xml'}
    }

    # Custom content export directory is also provided as a list for reference
    # by import processes, to avoid OS path separation issues.
    DIR_CUSTOM_EXPORT_PARTS = ['default', 'data', 'export']
    DIR_CUSTOM_EXPORT = '/'.join(DIR_CUSTOM_EXPORT_PARTS)

    FILE_APP_CONF = 'app.conf'
    FILE_DATAMODELS_CONF = 'datamodels.conf'
    FILE_DEFAULT_META = 'default.meta'
    FILE_GOVERNANCE_CONF = 'governance.conf'
    FILE_INDEXES_CONF = 'indexes.conf'
    FILE_MANAGED_CONF_CONF = 'managed_configurations.conf'
    FILE_PROPS_CONF = 'props.conf'
    FILE_SAVEDSEARCHES_CONF = 'savedsearches.conf'
    FILE_TRANSFORMS_CONF = 'transforms.conf'

    COLLECTIONS_REST_URL = '/servicesNS/nobody/search/storage/collections/config'

    PANELS_REST_URL = 'data/ui/panels'
    VIEWS_REST_URL = 'data/ui/views'
    VIEW_RESOURCES = ['script', 'stylesheet']

    GOVERNANCE_MAP = ['governance', 'control', 'tag']

    # order matters here (props->transforms)
    INDEXTIME_MAP = OrderedDict([
        ('/configs/conf-props', FILE_PROPS_CONF),  # noqa: X101
        ('/configs/conf-transforms', FILE_TRANSFORMS_CONF),  # noqa: X101
        ('/data/indexes', FILE_INDEXES_CONF)
    ])
    SEARCH_TIME_PROPS = [
        'REPORT-',
        'EXTRACT-',
        'lookup',
        'LOOKUP',
        'EVAL-',
        'FIELDALIAS-',
        'KV_MODE',
        'AUTO_KV_JSON',
        'KV_TRIM_SPACES'
    ]
    INDEXES_CONF_SETTINGS = ['homePath', 'coldPath', 'thawedPath']

    NOWTIME = util.mktimegm(gmtime())

    DEFAULT_META = textwrap.dedent('''
        ## shared Application-level permissions
        []
        access = read : [ * ], write : [ admin ]
        export = system
        ''')

    # app_json = {"app": "<app_name>", "label": "<app_label>", "version": "<app_version>", "build": "<app_build>"}
    def __init__(
            self, app_json, default_meta=DEFAULT_META, namespace='SA-Utils'):
        # archive directory
        self.ARCHIVE_DIRECTORY = os.path.join(
            AppMakerBase.ARCHIVE_DIRPREFIX,
            namespace,
            AppMakerBase.ARCHIVE_DIRSUFFIX)

        self.app = json.loads(app_json)
        if not (isinstance(self.app, dict) and self.app.get('app')):
            raise AppNameUnspecified

        if not self.app.get('label'):
            self.app['label'] = self.app['app']

        if not self.app.get('version'):
            self.app['version'] = '1.0.0'

        if not self.app.get('build'):
            self.app['build'] = '1'

        # Add version and build to app_name to compute candidate app filename
        app_filename = '%s-%s-%s' % (
            self.app['app'], self.app['version'], self.app['build'])
        # Sanitize app filename
        self.app['filename'] = ''.join(
            [c for c in app_filename if c in AppMakerBase.ARCHIVE_VALIDCHARS])

        # Get the app sub-directories
        self.app['appserver_static_dir'] = os.path.join(
            self.app['app'], AppMakerBase.DIR_APPSERVER_STATIC)
        self.app['default_dir'] = os.path.join(
            self.app['app'], AppMakerBase.DIR_DEFAULT)
        self.app['metadata_dir'] = os.path.join(
            self.app['app'], AppMakerBase.DIR_METADATA)
        self.app['custom_export_dir'] = os.path.join(
            self.app['app'], AppMakerBase.DIR_CUSTOM_EXPORT)

        self.app_conf = textwrap.dedent('''
            ## Splunk app configuration file
            [install]
            is_configured = true
            state = enabled
            build = %s

            [launcher]
            version = %s

            [ui]
            is_visible = false
            label = %s''' % (
            self.app['build'], self.app['version'], self.app['label']))

        self.default_meta = default_meta
        self.archive = None
        self.archive_fh = None

    def initArchive(self, include_app_conf=True):
        # 1 - Ensure Archive Directory exists
        if not os.path.exists(self.ARCHIVE_DIRECTORY):
            os.makedirs(self.ARCHIVE_DIRECTORY)

        # 2 - Get the archive file handler
        # Create fully qualified archive path
        # (adds epoch time prefix and extension suffix to app_filename)
        self.archive = os.path.join(
            self.ARCHIVE_DIRECTORY,
            '{0}_{1}{2}'.format(
                AppMakerBase.NOWTIME,
                self.app['filename'],
                AppMakerBase.ARCHIVE_EXTENSION))
        # Get archive file handler
        self.archive_fh = tarfile.open(self.archive, 'w:gz')

        # 3 - Add app.conf to archive
        if include_app_conf:
            app_conf_file = os.path.join(
                self.app['default_dir'], AppMakerBase.FILE_APP_CONF)
            AppMakerBase.stringToTarFile(
                self.app_conf, app_conf_file, self.archive_fh)

        # 4 - Add default.meta to archive
        default_meta_file = os.path.join(
            self.app['metadata_dir'], AppMakerBase.FILE_DEFAULT_META)
        AppMakerBase.stringToTarFile(
            self.default_meta, default_meta_file, self.archive_fh)

    def addConfsToArchive(
            self,
            endpoint,
            names,
            filename,
            session_key,
            raiseNotFound=True,
            settings_map=None,
            skip_new_checks=False):
        '''
        Add one or more stanzas from an endpoint
        to a configuration file in app archive.

        endpoint    - splunkd uri
        names       - list of entity names
        filename    - the filename
        session_key - splunkd session key

        returns list of configuration entries
        '''

        confs = []
        output = ''
        getargs = {'output_mode': 'json'}
        settings_map = settings_map or {}

        # skip new checks
        if not skip_new_checks:
            # get _new
            # if ResourceNotFound and raise, then raise
            # if ResourceNotFound and not-raise, then return
            uri_new = '%s/_new' % endpoint
            try:
                unused_nr, nc = rest.simpleRequest(
                    uri_new, sessionKey=session_key, getargs=getargs)
            except ResourceNotFound:
                if raiseNotFound:
                    raise
                else:
                    return
            new = json.loads(nc)['entry'][0]

            # handle wildcards
            wildcards = []
            if 'wildcard' in new['fields']:
                for wildcard in new['fields']['wildcard']:
                    try:
                        wildcardRE = re.compile(wildcard)
                        wildcards.append(wildcardRE)
                    except Exception:
                        pass

        for name in sorted(names):
            # get conf
            # if ResourceNotFound and raise, then raise
            # if ResourceNotFound and not-raise, then continue
            uri_conf = '%s/%s' % (endpoint, quote(name, safe=''))
            try:
                unused_cr, cc = rest.simpleRequest(
                    uri_conf, sessionKey=session_key, getargs=getargs)
            except ResourceNotFound:
                if raiseNotFound:
                    raise
                else:
                    continue

            conf = json.loads(cc)['entry'][0]
            confs.append(conf)

            # add stanza
            output += '\n[%s]\n' % name

            for key in sorted(conf['content']):
                new_key = key
                try:
                    val = conf['content'][key]
                    new_val = str(val).strip().replace('\n', '\\\n')
                    assert new_val
                except Exception:
                    continue
                # filters
                # 1. if key in not in new and not in wildcards; do nothing
                if (not skip_new_checks
                        and key not in new['content']
                        and not any([x.match(key) for x in wildcards])):
                    continue
                # 2. if key startswith eai; do nothing
                elif key.startswith('eai'):
                    continue
                # 3. if value is none or the same as the default; do nothing
                elif (not skip_new_checks
                        and key in new['content']
                        and val == new['content'][key]):
                    continue
                # 4. handle settings_map
                elif key in settings_map:
                    if settings_map[key] is None:
                        continue
                    if isinstance(settings_map[key], basestring):
                        new_key = settings_map[key]
                # 5. for governance.conf handle compliance settings
                elif (filename.endswith(AppMakerBase.FILE_GOVERNANCE_CONF)
                        and re.match(r'compliance\.\d+', key)):
                    for x in range(0, len(val[0:3])):
                        if val[x] is not None:
                            output += '{0}.{1} = {2}\n'.format(
                                key,
                                AppMakerBase.GOVERNANCE_MAP[x],
                                val[x])
                    continue

                output += '{0} = {1}\n'.format(new_key, new_val)

        if output:
            self.stringToTarFile(output, filename, self.archive_fh)

        return confs

    def addEAIDataToArchive(
            self, endpoint, entity, session_key, filename=None, trace_depends=False):
        '''
        Adds eai:data from the entity to the archive.
        If entity is a view we and trace_depends=True
        we will attempt to include the specified script
        and stylesheets.

        endpoint      - splunkd uri
        entity        - splunkd entity
        filename      - the filename
        session_key   - splunkd session key
        trace_depends - trace dependencies if entity is a view

        returns the entity
        '''

        uri = '%s/%s' % (endpoint, quote(entity, safe=''))
        unused_r, c = rest.simpleRequest(
            uri, sessionKey=session_key, getargs={'output_mode': 'json'})
        c = json.loads(c)['entry'][0]
        namespace = c['acl']['app']
        view_type = c['content'].get('eai:type', 'unknown')
        data = c['content'].get('eai:data', '')

        if data:
            # special handling for views which have a non-deterministic
            # filename; we also do dependency tracing
            if (endpoint == AppMakerBase.VIEWS_REST_URL
               and view_type in AppMakerBase.DIR_VIEWS):
                filename = os.path.join(
                    self.app['default_dir'],
                    AppMakerBase.DIR_VIEWS[view_type]['DIR'],
                    entity + '.' + AppMakerBase.DIR_VIEWS[view_type]['EXT'])

                self.stringToTarFile(data, filename, self.archive_fh)

                if trace_depends:
                    view_etree = etree.fromstring(data)
                    for key, vals in view_etree.attrib.items():
                        if key in AppMakerBase.VIEW_RESOURCES:
                            # handle multiple scripts and/or stylesheets
                            vals = vals.split(',')
                            for val in vals:
                                # Build location of view resource on disk
                                view_resource_path = make_splunkhome_path(
                                    ['etc', 'apps', namespace, 'appserver', 'static', val])
                                try:
                                    # read-binary usage intentional here
                                    with open(view_resource_path, 'rb') as view_resource_fh:
                                        AppMakerBase.fileToTarFile(
                                            view_resource_fh,
                                            os.path.join(
                                                self.app['appserver_static_dir'], val),
                                            self.archive_fh)
                                except Exception:
                                    pass
            else:
                if not filename:
                    raise FileNameUnspecified
                self.stringToTarFile(data, filename, self.archive_fh)

        return c

    def addRestOutputToArchive(self, endpoint, filename, session_key, ignore_404s=False):
        '''
        Add the output from the given REST endpoint.

        endpoint    - splunkd uri
        filename    - the filename
                      (should likely be a sub-directory of the export directory)
        session_key - splunkd session key
        ignore_404s - optionally ignore 404s
                      (which might just mean that there is nothing to export)

            returns None
        '''

        # get the glasstable info as a string
        try:
            response, data = rest.simpleRequest(endpoint, sessionKey=session_key)
            sdata = data.decode('utf-8')
            logger.info("AppMaker: Exporting endpoint '%s'", endpoint)
        except ResourceNotFound:
            if ignore_404s:
                logger.info(
                    "AppMaker: Unable to export endpoint '%s' since it didn't exist", endpoint)
                return None
            else:
                raise CustomRESTExportFailed(
                    "Unable to export '" + endpoint + "' since it could not be found (404)")

        if response.status != 200:
            logger.warn("AppMaker: Unable to export endpoint '%s'", endpoint)
            raise CustomRESTExportFailed(
                "Unable to export '%s', response=%i" % (endpoint, response.status))

        # output the data
        self.stringToTarFile(sdata, filename, self.archive_fh)

    def closeArchive(self):
        # 1 - Cleanup archive file handle
        self.archive_fh.close()

    @staticmethod
    def stringToTarFile(sdata, filepath, archive_fh):
        # SOLNESS-14038 - utf-8 encode sdata
        sdata = sdata.encode('utf-8')
        # reverse normalize filepath
        filepath = os.path.normpath(filepath).replace(os.path.sep, "/")
        info = tarfile.TarInfo(filepath)
        info.size = len(sdata)
        # permissions are in octal
        info.mode = 420
        try:
            info.gid = os.getgid()
        except Exception:
            info.gid = 0
        try:
            info.uid = os.getuid()
        except Exception:
            info.uid = 0
        info.gname = 'splunk'
        info.uname = 'splunk'
        info.mtime = AppMakerBase.NOWTIME

        archive_fh.addfile(info, BytesIO(sdata))

    @staticmethod
    def fileToTarFile(fileobj, filepath, archive_fh):
        # reverse normalize filepath
        filepath = os.path.normpath(filepath).replace(os.path.sep, "/")
        info = archive_fh.gettarinfo(fileobj=fileobj, arcname=filepath)
        info.mode = 420  # permissions are in octal
        try:
            info.gid = os.getgid()
        except Exception:
            info.gid = 0
        try:
            info.uid = os.getuid()
        except Exception:
            info.uid = 0
        info.gname = 'splunk'
        info.uname = 'splunk'
        info.mtime = AppMakerBase.NOWTIME

        archive_fh.addfile(info, fileobj=fileobj)
