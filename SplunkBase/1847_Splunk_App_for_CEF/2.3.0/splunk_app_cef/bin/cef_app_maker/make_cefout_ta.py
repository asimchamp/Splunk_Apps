import json
import os
import splunk.rest as rest
import splunk.util as util
import tarfile
import textwrap
try:
    from urllib.request import quote
except ImportError:
    from urllib import quote

from .base import AppMakerBase
from splunk.clilib.bundle_paths import make_splunkhome_path

# Globals
FILE_INPUTS_CONF = 'inputs.conf'
FILE_OUTPUTS_CONF = 'outputs.conf'
REQUIRED_KEYS = ['_key', 'output_type', 'server']
DEFAULT_SYSLOG_TYPE = 'tcp'
VALID_SYSLOG_TYPES = [DEFAULT_SYSLOG_TYPE, 'udp']

# SSL Globals
REQUIRED_SSL_KEYS = ['_key', 'output_type', 'server', 'client_cert_filename']
CLIENT_CERT_STD_PATH = '$SPLUNK_HOME/etc/apps/Splunk_TA_cefout/auth/{0}'
# Apps deployed with Index Cluster Master (ICM) will reside at slave-apps
CLIENT_CERT_ICM_PATH = '$SPLUNK_HOME/etc/slave-apps/Splunk_TA_cefout/auth/{0}'
LOCAL_CERT_DIR = make_splunkhome_path(['etc', 'apps', 'splunk_app_cef', 'auth'])

# props.conf template
PROPS_TEMPLATE = textwrap.dedent(r'''
    [stash_cef]
    TRUNCATE                  = 0
    # only look for ***SPLUNK*** on the first line
    HEADER_MODE               = firstline
    # we can summary index past data, but rarely future data
    MAX_DAYS_HENCE            = 2
    MAX_DAYS_AGO              = 10000
    # 5 years difference between two events
    MAX_DIFF_SECS_AGO         = 155520000
    MAX_DIFF_SECS_HENCE       = 155520000
    MAX_TIMESTAMP_LOOKAHEAD   = 64
    LEARN_MODEL               = false
    # break .stash_new custom format into events
    SHOULD_LINEMERGE          = false
    BREAK_ONLY_BEFORE_DATE    = false
    LINE_BREAKER              = (\r?\n==##~~##~~  1E8N3D4E6V5E7N2T9 ~~##~~##==\r?\n)
    # change sourcetype to stash before indexing/forwarding this data (these events
    # are feed to the stashparsing pipeline)
    TRANSFORMS-sourcetype4cef = set_sourcetype_to_stash''')

# indexes.conf template
INDEXES_TEMPLATE = textwrap.dedent('''
    [cef]
    coldPath   = $SPLUNK_DB/cef/colddb
    homePath   = $SPLUNK_DB/cef/db
    thawedPath = $SPLUNK_DB/cef/thaweddb
    isReadOnly = true
    ## SPL-144824
    repFactor  = 0''')

# inputs.conf template for tcp/syslog output
# {0} - routing group name
# {1} - tcp routing group name...or
# {2} - syslog routing group name
INPUT_TEMPLATE = textwrap.dedent('''
    [batch://$SPLUNK_HOME/var/spool/splunk/...stash_cef_{0}]
    queue           = stashparsing
    sourcetype      = stash_cef
    move_policy     = sinkhole
    crcSalt         = <SOURCE>
    _TCP_ROUTING    = {1}
    _SYSLOG_ROUTING = {2}

    [batch://$SPLUNK_HOME\\var\\spool\\splunk\\...stash_cef_{0}]
    queue           = stashparsing
    sourcetype      = stash_cef
    move_policy     = sinkhole
    crcSalt         = <SOURCE>
    _TCP_ROUTING    = {1}
    _SYSLOG_ROUTING = {2}\n''')

DEFAULT_OUTPUTS = textwrap.dedent('''
    ## Since the defaultGroup is set to the non-existent group "noforward" (meaning that there is no defaultGroup),
    ## the forwarder only forwards data that has been routed to explicit target groups in inputs.conf.
    [tcpout]
    indexAndForward = true
    defaultGroup    = noSuchOutputGroup\n''')

# outputs.conf template for tcp output
# {0} - routing group name
# {1} - server0 (name:port),...,serverN (name:port)
TCP_OUT_TEMPLATE = textwrap.dedent('''
    [tcpout:{0}]
    server                = {1}
    blockOnCloning        = false
    dropEventsOnQueueFull = 5
    sendCookedData        = false\n''')

# outputs.conf template for ssl output
# {0} - routing group name
# {1} - server0 (name:port),...,serverN (name:port)
# {2} - ssl password
# {3} - client cert
# {4} - ssl cn
# {5} - ssl alt
SSL_OUT_TEMPLATE = textwrap.dedent('''
    [tcpout:{0}]
    server                = {1}
    blockOnCloning        = false
    dropEventsOnQueueFull = 5
    sendCookedData        = false
    sslPassword           = {2}
    sslRootCAPath         = {3}
    clientCert            = {3}
    sslVerifyServerCert   = 1
    sslCommonNameToCheck  = {4}
    sslAltNameToCheck     = {5}\n''')

# outputs.conf template for syslog output
# {0} - routing group name
# {1} - server (name:port)
# {2} - type (tcp/udp)
SYSLOG_OUT_TEMPLATE = textwrap.dedent('''
    [syslog:{0}]
    server                = {1}
    priority              = NO_PRI
    maxEventSize          = 2048
    syslogSourceType      = sourcetype::stash
    type                  = {2}\n''')


def get_ssl_password(key, session_key):
    clear_password = ''

    en = 'splunk_app_cef:{0}:'.format(key)
    uri = '/servicesNS/nobody/splunk_app_cef/storage/passwords/{0}'.format(
        quote(en, safe=''))

    try:
        unused_r, c = rest.simpleRequest(
            uri,
            sessionKey=session_key,
            getargs={'output_mode': 'json'},
            raiseAllErrors=True)

        clear_password = json.loads(c)['entry'][0]['content']['clear_password']

    except Exception:
        pass

    return clear_password


def get_client_cert_path(client_cert_filename, deploy_via_icm):
    client_cert_filename = os.path.basename(client_cert_filename)

    if util.normalizeBoolean(deploy_via_icm):
        return CLIENT_CERT_ICM_PATH.format(client_cert_filename), client_cert_filename

    return CLIENT_CERT_STD_PATH.format(client_cert_filename), client_cert_filename


def make_cefout_ta(app_json, session_key, instance_type='download'):
    # 1 - Add cefout_ta configurations
    # a dictionary for maintaining desired output on a per config file basis
    cefout_conf = {
        AppMakerBase.FILE_INDEXES_CONF: INDEXES_TEMPLATE,
        AppMakerBase.FILE_PROPS_CONF: PROPS_TEMPLATE,
        FILE_INPUTS_CONF: '',
        FILE_OUTPUTS_CONF: ''}

    # 2 - require clientCert for cloud
    if instance_type == 'cloud':
        required_keys = REQUIRED_SSL_KEYS
    else:
        required_keys = REQUIRED_KEYS

    # 3 - Retrieve output groups
    uri = '/servicesNS/nobody/splunk_app_cef/storage/collections/data/cef_output_groups'
    getargs = {'output_mode': 'json'}
    unused_r, c = rest.simpleRequest(
        uri, sessionKey=session_key, getargs=getargs, raiseAllErrors=True)
    c = json.loads(c)

    # 4 - Iterate output groups
    tcpout_present = False
    ssl_client_certs = set()

    for output_group in c:
        # 4a - validate output groups
        discovered_keys = [
            x for x in required_keys if x in output_group and output_group[x]]

        # 4b - ignore anything that doesn't validate
        if required_keys != discovered_keys:
            continue

        # 4c - initialize templates
        input_template = None
        output_template = None

        _key = output_group['_key']
        server = output_group['server']
        output_type = output_group['output_type']
        client_cert_filename = output_group.get('client_cert_filename')

        # 4d - SSL output
        if client_cert_filename and output_type == 'tcpout':
            # get ssl password
            ssl_password = get_ssl_password(_key, session_key)

            # get client cert path
            client_cert, client_cert_filename = get_client_cert_path(
                client_cert_filename,
                output_group.get('deploy_via_icm', 0))

            # validate filename length
            if len(client_cert_filename) > 255:
                continue

            ssl_client_certs.add(client_cert_filename)

            input_template = INPUT_TEMPLATE.format(_key, _key, '')
            output_template = SSL_OUT_TEMPLATE.format(
                _key,
                server,
                ssl_password,
                client_cert,
                output_group.get('ssl_cn', ''),
                output_group.get('ssl_alt', ''))
            tcpout_present = True

        # 4e - TCP output
        elif output_type == 'tcpout':
            input_template = INPUT_TEMPLATE.format(_key, _key, '')
            output_template = TCP_OUT_TEMPLATE.format(_key, server)
            tcpout_present = True

        # 4f - Syslog output
        elif output_type == 'syslog' and not client_cert_filename:
            # determine syslog_type
            syslog_type = DEFAULT_SYSLOG_TYPE
            if output_group.get('syslog_type') in VALID_SYSLOG_TYPES:
                syslog_type = output_group['syslog_type']
            input_template = INPUT_TEMPLATE.format(_key, '', _key)
            output_template = SYSLOG_OUT_TEMPLATE.format(
                _key, server, syslog_type)

        # 4g - Write templates if they were built
        if input_template and output_template:
            cefout_conf[FILE_INPUTS_CONF] += input_template
            cefout_conf[FILE_OUTPUTS_CONF] += output_template

    # 5 - If we have tcp outputs, add the default tcpout block
    if tcpout_present and cefout_conf[FILE_OUTPUTS_CONF]:
        cefout_conf[FILE_OUTPUTS_CONF] = DEFAULT_OUTPUTS + cefout_conf[FILE_OUTPUTS_CONF]

    # 6 - Initialize cefout_ta
    cefout_ta = AppMakerBase(app_json, namespace='splunk_app_cef')

    try:
        # 7 - Initialize archive
        cefout_ta.initArchive()

        # 8 - Add auth directory
        ssl_client_cert_found = False
        for ssl_client_cert in ssl_client_certs:
            local_cert_path = os.path.join(LOCAL_CERT_DIR, ssl_client_cert)

            if os.path.exists(local_cert_path):
                with open(local_cert_path, 'rb') as local_cert_fh:
                    cefout_ta.fileToTarFile(
                        local_cert_fh,
                        os.path.join(
                            cefout_ta.app['app'],
                            'auth',
                            ssl_client_cert),
                        cefout_ta.archive_fh)

                ssl_client_cert_found = True

        # 8b - Add empty auth dir
        if not ssl_client_cert_found:
            auth_dir_info = tarfile.TarInfo(
                os.path.join(cefout_ta.app['app'], 'auth'))
            auth_dir_info.type = tarfile.DIRTYPE
            auth_dir_info.mode = 493
            auth_dir_info.mtime = cefout_ta.NOWTIME
            cefout_ta.archive_fh.addfile(auth_dir_info)

        # 9 - create files
        for filename, sdata in cefout_conf.items():
            if sdata:
                cefout_ta.stringToTarFile(
                    sdata,
                    os.path.join(cefout_ta.app['default_dir'], filename),
                    cefout_ta.archive_fh)
    except Exception:
        raise
    finally:
        # 10 - cleanup
        cefout_ta.closeArchive()

    return cefout_ta.archive
