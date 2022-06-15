#!/usr/bin/python

##  SPLUNK FOR AUTOMATION TESTING | SYNTHETIC TRANSACTIONS
##
##  Author:	 Ron Naken (ron@splunk.com)
##  Version:	0.01a
##
##  Copyright (c) 2011 Splunk Inc.  All rights reserved.
##
##  This program was written to allow Splunk to perform
##  web-based automation testing.

import mechanize, cookielib
import sys, os, time, uuid, re
import xml.dom.minidom

_APP_ = 'automation'
_TIME_FORMAT_ = '%m-%d-%Y %H:%M:%S %Z'
_DEFAULT_INTERVAL_ = 600                # 10 minutes

_timeout_ = 2
_pages_ = {}
_sessions_ = {}
_certs_ = ''                            # path to client-side certs
_cert_ = ''                             # session's client-side cert
_errors_ = 0
_page_count_ = 0
_user_agent_ = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:19.0) Gecko/20100101 Firefox/19.0'

_UUID_ = uuid.uuid4()
_PAGE_PARAMS_ = [ 'url', 'content', 'links', 'form', 'form_fields', 'show_form_fields', 'timeout' ]
_SESSION_PARAMS_ = [ 'pages', 'user_agent', 'timeout', 'cert', 'proxy' ]

br = ''                     # browser global
cj = ''                     # cookie jar global

SCHEME = """<scheme>
    <title>Automation Testing | Synthetic Transactions</title>
    <description>Perform web automation and synthetic transactions on web pages.</description>
    <use_external_validation>true</use_external_validation>
    <streaming_mode>simple</streaming_mode>
    <use_single_instance>false</use_single_instance>
    <endpoint>
        <args>
            <arg name="name">
                <title>Session ID</title>
                <description>This is the ID of a session defined in _sessions_.conf</description>
            </arg>
            <arg name="session_interval">
                <title>Interval</title>
                <description>Determines how often (in seconds) to invoke this session.</description>
            </arg>
        </args>
    </endpoint>
</scheme>
"""

def validate_conf(config, key):
    if key not in config:
        raise Exception, 'Invalid configuration received from Splunk: key "%s" is missing.' % (key)

def get_config():
    config = {}
    try:
        config_str = sys.stdin.read()
        doc = xml.dom.minidom.parseString(config_str)
        root = doc.documentElement
        conf_node = root.getElementsByTagName("configuration")[0]
        if conf_node:
            stanza = conf_node.getElementsByTagName("stanza")[0]
            if stanza:
                stanza_name = stanza.getAttribute("name")
                if stanza_name:
                    config["name"] = stanza_name

                    params = stanza.getElementsByTagName("param")
                    for param in params:
                        param_name = param.getAttribute("name")
                        if param_name and param.firstChild and \
                           param.firstChild.nodeType == param.firstChild.TEXT_NODE:
                            data = param.firstChild.data
                            config[param_name] = data
        if not config:
            raise Exception, 'Invalid configuration received from Splunk.'

        validate_conf(config, "name")
        validate_conf(config, "session_interval")
    except Exception, e:
        raise Exception, 'Error getting Splunk configuration via STDIN.'

    return config

def log_error(l):
    print time.strftime(_TIME_FORMAT_, time.localtime(time.time())) + ' ' + l
    sys.stdout.flush()

def load_conf(fil, _ar_, keys):
    try:
        path = os.environ['SPLUNK_HOME']  
        path = os.path.join(path, 'etc', 'apps', _APP_, 'local', fil)
        fp = open(path, 'r')
        stanza = ''
        for l in fp.readlines():
            l = l.strip()
            if l.startswith('[') and l.endswith(']'):
                stanza = l[1:-1]
                _ar_[stanza] = {}
                continue
            if stanza == '': continue
            pos = l.find('=')
            key = l[:pos].strip().lower()
            val = l[pos + 1:].strip()
            if key in keys:
                _ar_[stanza].update({ key: str(val) })
        fp.close()
    except Exception, e:
#        log_error('ERROR loading CONF files.  err="%s"' % (e))
        pass

def get_conf():
    global _pages_, _sessions_, _certs_
    load_conf('_sessions_.conf', _sessions_, _SESSION_PARAMS_)
    load_conf('_pages_.conf', _pages_, _PAGE_PARAMS_)
    _certs_ = os.path.join(os.environ['SPLUNK_HOME'], 'etc', 'apps', _APP_, 'certs', '')

def show_conf():
    print "----- SESSIONS -----"
    for k, v in _sessions_.iteritems():
        print k, v
    print "----- PAGES -----"
    for k, v in _pages_.iteritems():
        print k, v

def do_scan():
    try:
        url = sys.argv[2]
    except Exception, e:
            log_error('summary=WARN err="URL not specified for SCAN."')
            exit(1)

    make_session()
    try:
        r = br.open(url)
    except Exception, e:
        l = 'summary=SCAN url=%s err="%s"' % (url, e)
        log_error(l)

    print '----- FORMS -----'
    c = 0
    for f in br.forms():
        print 'FORM_ID [' + str(c) + ']: ' + str(f)
        c += 1

#    print '----- LINKS -----'
#    c = 0
#    for f in br.links():
#        print 'LINK_ID [' + str(c) + ']: ' + str(f)
#        c += 1

def make_session():
    global br, cj, _errors_, _UUID_, _cert_
    
    br = mechanize.Browser()
    cj = cookielib.LWPCookieJar()
    br.set_cookiejar(cj)
    br.set_handle_equiv(True)
    br.set_handle_redirect(True)
    br.set_handle_referer(False)
    br.set_handle_robots(False)
    br.set_handle_refresh(mechanize._http.HTTPRefreshProcessor(), max_time=None, honor_time=False)
    br.addheaders = [('User-agent', _user_agent_)]
    _UUID_ = uuid.uuid4()
    _page_count_ = 0
    _errors_ = 0

def get_session(s):
    global _user_agent_, _timeout_, _cert_
    try:
        pages = _sessions_[s]['pages']
    except Exception, e:
        log_error('summary=WARN err="Session \'%s\' not found or no \'pages=<value>\' defined in _sessions_.conf."' % (s))
        return(1)
    try:
        _user_agent_ = _sessions_[s]['user_agent']
    except Exception, e:
        pass
    try:
        _timeout_ = think_int(_sessions_[s]['timeout'], 2)
    except Exception, e:
        pass
    try:
        _cert_ = ''
        _cert_ = _sessions_[s]['cert']
    except Exception, e:
        pass
    try:
        proxy = ''
        proxy = _sessions_[s]['proxy']
    except Exception, e:
        pass

    pages = pages.split(',')
    t = time.time()

    make_session()
    if proxy != '':
        try:
            br.set_proxies({ 'http': proxy, 'https': proxy})
        except Exception, e:
            print '%s summary=WARN session="%s" session_id=%s pages="%s" err="%s"' % (timestamp, s, _UUID_, _sessions_[s]['pages'], e)

    for p in pages:
        get_page(p.strip(), s)

    ms = str(round((time.time() - t) * 1000, 2))
    timestamp = time.strftime(_TIME_FORMAT_, time.localtime(t))
    l = '%s summary=SESSION session="%s" session_id=%s session_ms=%s page_count=%s err_count=%s pages="%s" timeout=%s' % (timestamp, s, _UUID_, ms, _page_count_, _errors_, _sessions_[s]['pages'], str(_timeout_) + '.0')
    print l
    sys.stdout.flush()

def page_param(p, param, dft):
    try:
        v = _pages_[p][param]
    except Exception, e:
        return dft
    return v

def think_bool(v):
    if type(v) == type(str()):
        if (v[:1] == 't') or (v[:1] == 'T') or (v[:1] == '1'):
            return True
    return False

def think_int(v, dft):
    try:
        v = int(v)
        return v
    except Exception, e:
        pass
    return int(dft)

def prettify(l):
    l = re.sub('[\n\r\v]+', ' ', str(l).replace('"', '\''))
    return str(re.sub('\s+', ' ', l)).strip()

def get_page(p, s):
    global _errors_, _page_count_
    try:
        url = _pages_[p]['url']
    except Exception, e:
        log_error('summary=WARN err="Page \'%s\' not found in _pages_.conf."' % (p))
        _errors_ += 1
        return(1)

    content = page_param(p, 'content', 'none')
    follow = page_param(p, 'links', 'follow')
    form = page_param(p, 'form', '')
    form_fields = page_param(p, 'form_fields', '')
    show_form_fields = think_bool(page_param(p, 'show_form_fields', 'false'))
    timeout = _timeout_
    try:
        timeout = think_int(page_param(p, 'timeout', _timeout_), _timeout_)
    except Exception, e:
        pass

    timeout = str(timeout) + '.0'

    if _cert_ != '':
        try:
            br.add_client_certificate(url, _certs_ + _cert_ + '.key', _certs_ + _cert_ + '.cer')
        except Exception, e:
            pass

    t = time.time()
    _page_count_ += 1
    try:
        r = eval('br.open(url, timeout=' + timeout + ')')
    except Exception, e:
        l = 'summary=PAGE page="%s" url=%s timeout=%s err="%s"' % (p, url, timeout, e)
        if s != '': l += ' session="%s" session_id=%s' % (s, _UUID_)
        if _cert_ != '': l += ' cert="%s"' % (_cert_)
        log_error(l)
        _errors_ += 1
        return(1)

    st = r.code
    ms = str(round((time.time() - t) * 1000, 2))

    timestamp = time.strftime(_TIME_FORMAT_, time.localtime(t))
    l = '%s summary=PAGE page="%s" url=%s ms=%s status=%s timeout=%s' % (timestamp, p, url, ms, st, timeout)
    if s != '': l += ' session="%s" session_id=%s' % (s, _UUID_)
    if _cert_ != '': l += ' cert="%s"' % (_cert_)
    if (content == 'headers'): l += ' headers="%s"' % prettify(r.info())
    if (content == 'full'): l+= ' html="%s"' % prettify(r.read())
    print l
    sys.stdout.flush()

    if follow == 'follow':

        # mechanize will crop the links without this
        try:
            for link in br.links():
                pass
        except Exception, e:
            pass

        for link in br.links():
            t = time.time()
            _page_count_ += 1
            try:
                request = br.click_link(link)
                response = br.follow_link(link)
            except Exception, e:
                l = 'summary=LINK page="%s" url=%s link_name="%s" link_url=%s err="%s"' % (p, url, link.text, link.url, e)
                if s != '': l += ' session="%s" session_id=%s' % (s, _UUID_)
                log_error(l)
                _errors_ += 1
                return(1)
            ms = str(round((time.time() - t) * 1000, 2))
            l = '%s summary=LINK page="%s" url=%s link_name="%s" link_url=%s ms=%s status=%s' % (timestamp, p, url, link.text, link.url, ms, response.code)
            if s != '': l += ' session="%s" session_id=%s' % (s, _UUID_)
            print l
            sys.stdout.flush()
    
    elif follow == 'form':
        try:
            eval('br.select_form(nr=' + str(form) + ')')
            br.form.set_all_readonly(False)
        except Exception, e:
            print '%s summary=WARN page="%s" url=%s err="Error selecting FORM."' % (timestamp, p, url)

        ar = form_fields.split('|')
        for kv in ar:
            pos = kv.find(':')
            try:
                br.form[kv[:pos].strip().lower()] = kv[pos + 1:].strip()
            except Exception, e:
                pass

        t = time.time()
        _page_count_ += 1
        try:
            r = br.submit()
        except Exception, e:
            l = 'summary=FORM page="%s" url=%s form_id=%s err="%s"' % (p, url, form, e)
            if s != '': l += ' session="%s" session_id=%s' % (s, _UUID_)
            if show_form_fields: l += ' form_fields="%s"' % (form_fields)
            log_error(l)
            _errors_ += 1
            return(1)
        ms = str(round((time.time() - t) * 1000, 2))
        l = '%s summary=FORM page="%s" url=%s form_id=%s ms=%s status=%s' % (timestamp, p, url, form, ms, r.code)
        if s != '': l += ' session="%s" session_id=%s' % (s, _UUID_)
        if show_form_fields: l += ' form_fields="%s"' % (form_fields)
        if (content == 'headers'): l += ' headers="%s"' % prettify(r.info())
        if (content == 'full'): l+= ' html="%s"' % prettify(r.read())
        print l
        sys.stdout.flush()

def get_validation_data():
    val_data = {}

    val_str = sys.stdin.read()

    doc = xml.dom.minidom.parseString(val_str)
    root = doc.documentElement

    item_node = root.getElementsByTagName("item")[0]
    if item_node:
        name = item_node.getAttribute("name")
        val_data["stanza"] = name

        params_node = item_node.getElementsByTagName("param")
        for param in params_node:
            name = param.getAttribute("name")
            if name and param.firstChild and \
               param.firstChild.nodeType == param.firstChild.TEXT_NODE:
                val_data[name] = param.firstChild.data

    return val_data

def validate_arguments():
    val_data = get_validation_data()
    try:
        s = val_data["stanza"]
        i = val_data["session_interval"]
    except Exception, e:
        log_error('Invalid configuration specified: %s' % str(e))
        exit(1)
    try:
        t = _sessions_[s]
    except Exception, e:
        log_error('Session "%s" not found in _sessions_.conf' % (s))
        exit(1)

def show_usage():
    print '  AUTOMATION.PY:  Modular Input for Splunk.'
    print '  --show : display session and page definitions.'
    print '  --scan <url> : scan a URL for form details. '
    print '  -p <page> : test a page (see _pages_.conf)'
    print '  -s <session> : test a session (see _sessions_.conf)'

def run():
    config = get_config()
    name = config["name"]
    name = name[name.find('//') + 2:]
    interval = _DEFAULT_INTERVAL_
    try:
        interval = int(config["session_interval"])
    except Exception, e:
        log_error('summary=ERR err="Invalid interval specified for data input."')

    while 1:
        try:
            get_session(name)
            sys.stdout.flush()
        except:
            pass
        time.sleep(interval)

if __name__ == '__main__':

    get_conf()
    if len(sys.argv) > 1:
        if sys.argv[1] == '--scheme':
            print SCHEME
        elif sys.argv[1] == '--validate-arguments':
            validate_arguments()
        elif sys.argv[1] == '--show':
            show_conf()
        elif sys.argv[1] == '--scan':
            do_scan()
        elif sys.argv[1] == '--help':
            show_usage()
        elif sys.argv[1] == '-p':
            make_session()        
            get_page(sys.argv[2], '')
        elif sys.argv[1] == '-s':
            get_session(sys.argv[2])
        else:
            log_error('summary=WARN err="Invalid command line arguments."')
    else:
        run()

sys.exit(0)
