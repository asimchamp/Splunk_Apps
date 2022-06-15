import os
import platform
import sys
import re
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from splunkdj.decorators.render import render_to
from splunkdj.setup import create_setup_view_context
from django.contrib import messages

from .forms import SetupForm
from .forms import LogsForm
from .forms import SourcetypesForm
import utils


@render_to('it_tude:itt_gui.html')
@login_required
def itt_gui(request):
    __debug("itt_gui\n")
    conf = __load_config_file("it_tude.conf")
    apiurl = conf.get('urlapi', 'http://127.0.0.1') if conf else 'http://127.0.0.1'
    
    return {
        "message": "{$theme$}",
        "app_name": "it_tude",
        "apiurl": apiurl,
    }


@render_to('it_tude:api_settings.html')
@login_required
def api_settings(request):
    ret = create_setup_view_context(
        request,
        SetupForm,
        reverse('it_tude:api_settings')
    )
    service = request.service

    try:
        app_config = service.confs['it_tude']['config']
    except KeyError:
        app_config = service.confs['it_tude'].create('config')

    try:
        user = app_config['user']
        password = app_config['password']
        apiurl = app_config['urlapi']
    except:
        user = None
        password = None
        apiurl = None

    if not isinstance(ret, HttpResponseRedirect):
        try:
            ret['form'].fields['user'].value = user
            ret['form'].fields['password'].value = password
            ret['form'].fields['urlapi'].value = apiurl
        except:
            ret['form'].fields['user'].value = None
            ret['form'].fields['password'].value = None
            ret['form'].fields['urlapi'].value = None
    else:
        form = SetupForm(request.POST)
        if form.is_valid():
            messages.success(request, u"Configuration Saved.")
        else:
            messages.error(request, u"Error validating Form.")
    return ret


@render_to('it_tude:logs_settings.html')
@login_required
def logs_settings(request):
    __debug("logs_settings")
    ret = create_setup_view_context(
        request,
        SourcetypesForm,
        reverse('it_tude:logs_settings')
    )
    return ret


@render_to('it_tude:add_sourcetype.html')
@login_required
def add_sourcetype(request):
    __debug("add_sourcetype\n")
    ret = create_setup_view_context(
        request,
        LogsForm,
        reverse('it_tude:logs_settings')
    )
    service = request.service

    if not isinstance(ret, HttpResponseRedirect):
        # get indexes from splunk, no need to prefill form ... new entry
        indexes = [(x.name, x.name) for x in request.service.indexes]
        ret['form'].fields['index'].choices = indexes
        ret['form'].fields['proxy_index'].choices = indexes
        return ret

    # the form was submitted,  but we need to do some gruntwork ... check and save to config file with right index.
    form = LogsForm(request.POST)
    if not form.is_valid():
        # it shouldn't happen, because the same form is validated in create_setup_view_context()
        return {
            'form': form,
            'configured': False,
        }

    conf = __load_config_file("it_tude.conf")
    sourcetypes_list_str = conf.get('sourcetypes_list', '')

    sourcetype_proxy = form.cleaned_data['sourcetype_proxy']
    if sourcetype_proxy:
        # get data from form:
        proxy_index = form.cleaned_data['proxy_index']
        proxy_autoincrement = conf.get('proxy_autoincrement', "1")
        conf["index_%s_proxy" % proxy_autoincrement] = proxy_index
        conf["sourcetype_%s_proxy" % proxy_autoincrement] = sourcetype_proxy
        conf["proxy_%s_c_ip" % proxy_autoincrement] = form.cleaned_data['custom_field_proxy_c_ip']
        conf["proxy_%s_cs_user" % proxy_autoincrement] = form.cleaned_data['custom_field_proxy_cs_user']
        conf["proxy_%s_cs_uri" % proxy_autoincrement] = form.cleaned_data['custom_field_proxy_cs_uri']
        conf["proxy_%s_referer" % proxy_autoincrement] = form.cleaned_data['custom_field_proxy_referer']
        conf["proxy_%s_user_agent" % proxy_autoincrement] = form.cleaned_data['custom_field_proxy_user_agent']
        conf["proxy_%s_cs_bytes" % proxy_autoincrement] = form.cleaned_data['custom_field_proxy_cs_bytes']
        conf["proxy_%s_sc_status" % proxy_autoincrement] = form.cleaned_data['custom_field_proxy_sc_status']
        conf["proxy_%s_sc_bytes" % proxy_autoincrement] = form.cleaned_data['custom_field_proxy_sc_bytes']
        conf["proxy_%s_cim" % proxy_autoincrement] = form.cleaned_data['custom_proxy_cim_compliant']
        sourcetypes_list_str += "**%s*3" % proxy_autoincrement
        sourcetypes_list_str += "*%s" % sourcetype_proxy
        conf["proxy_autoincrement"] = int(proxy_autoincrement) + 1

    sourcetype_bind = form.cleaned_data['sourcetype_bind']
    if sourcetype_bind:
        dns_index = form.cleaned_data['index']
        bind_dns_autoincrement = conf.get('bind_dns_autoincrement', "1")
        conf["index_%s_bind" % bind_dns_autoincrement] = dns_index
        conf["sourcetype_%s_bind" % bind_dns_autoincrement] = sourcetype_bind
        sourcetypes_list_str += "**%s*0" % bind_dns_autoincrement
        sourcetypes_list_str += "*%s" % sourcetype_bind
        conf["bind_dns_autoincrement"] = int(bind_dns_autoincrement) + 1

    sourcetype_msdns = form.cleaned_data['sourcetype_msdns']
    if sourcetype_msdns:
        dns_index = form.cleaned_data['index']
        ms_dns_autoincrement = conf.get('ms_dns_autoincrement', "1")
        conf["index_%s_ms" % ms_dns_autoincrement] = dns_index
        conf["sourcetype_%s_ms" % ms_dns_autoincrement] = sourcetype_msdns
        sourcetypes_list_str += "**%s*1" % ms_dns_autoincrement
        sourcetypes_list_str += "*%s" % sourcetype_msdns
        conf["ms_dns_autoincrement"] = int(ms_dns_autoincrement) + 1

    sourcetype_custom = form.cleaned_data['sourcetype_custom']
    if sourcetype_custom:
        dns_index = form.cleaned_data['index']
        custom_dns_autoincrement = conf.get('custom_dns_autoincrement', "1")
        conf["index_%s_custom" % custom_dns_autoincrement] = dns_index
        conf["sourcetype_%s_custom" % custom_dns_autoincrement] = sourcetype_custom
        conf["custom_dns_%s_cim" % custom_dns_autoincrement] = form.cleaned_data['custom_field_cim_compliant']
        conf["custom_dns_%s_dnstype" % custom_dns_autoincrement] = form.cleaned_data['custom_field_dnstype']
        conf["custom_dns_%s_fqdn" % custom_dns_autoincrement] = form.cleaned_data['custom_field_fqdn']
        conf["custom_dns_%s_srcip" % custom_dns_autoincrement] = form.cleaned_data['custom_field_srcip']
        sourcetypes_list_str += "**%s*2" % custom_dns_autoincrement
        sourcetypes_list_str += "*%s" % sourcetype_custom
        conf["custom_dns_autoincrement"] = int(custom_dns_autoincrement) + 1

    # update conf
    conf["sourcetypes_list"] = sourcetypes_list_str
    __save_config_file("it_tude.conf", conf)
    __generate_props()

    # SEB: TODO to be move
    # on Windows, paths in input.conf should have backslashes, not slashes
    if platform.system() == "Windows":
        app_path = utils.get_app_path()
        inputs_fname = os.path.join(app_path, "default", "inputs.conf")
        inputs_content = open(inputs_fname, "rt").readlines()

        f = open(os.path.join(app_path, "local", "inputs.conf"), "wt")
        for line in inputs_content:
            if line.startswith("[script://"):
                line = line[:10] + line[10:].replace("/", "\\")
            f.write(line)
        f.close()
    ####

    __reload_apps(service)
    return ret


@render_to('it_tude:delete_sourcetype.html')
@login_required
def delete_sourcetype(request, log_type, source_id):
    __debug("delete_sourcetype\n")
    try:
        __delete_from_sourcetypes_list(source_id, log_type)
        __generate_props()
        __reload_apps(request.service)
    except Exception as e:
        utils.write_log_exception(e)
    return {}


@render_to('it_tude:edit_sourcetype.html')
@login_required
def edit_sourcetype(request, log_type, source_id):
    __debug("edit_sourcetype\n")
    try:
        ret = create_setup_view_context(
            request,
            LogsForm,
            reverse('it_tude:logs_settings')
        )
        ret['text'] = log_type
        current_log_type_dict = {'ms': 'Microsoft DNS Logs', 'proxy': 'Proxy Logs', 'bind': 'ISC Bind Logs', 'custom': 'Custom DNS Logs'}
        ret['current_log_type'] = current_log_type_dict.get(log_type, '')

        service = request.service
        dvalues = __get_attrs_from_config(source_id, log_type)
        if not dvalues:
            ret['error'] = "error"
            return ret

        if not isinstance(ret, HttpResponseRedirect):
            # get indexes from splunk  and fill form with old values get from config file
            indexes = [(x.name, x.name) for x in service.indexes]
            ret['form'].fields['index'].choices = indexes
            ret['form'].fields['proxy_index'].choices = indexes
            ret['custom_cim'] = "false"
            ret['custom_proxy_cim'] = 0

            if log_type == "bind":
                ret['index'] = dvalues['index']
                ret['sourcetype_bind'] = dvalues['sourcetype']
            if log_type == "ms":
                ret['index'] = dvalues['index']
                ret['sourcetype_msdns'] = dvalues['sourcetype']
            if log_type == "custom":
                ret['index'] = dvalues['index']
                ret['sourcetype_custom'] = dvalues['sourcetype']
                ret['custom_dnstype'] = dvalues['dnstype']
                ret['custom_fqdn'] = dvalues['fqdn']
                ret['custom_srcip'] = dvalues['srcip']
                ret['custom_cim'] = dvalues['cim'].lower()
            if log_type == "proxy":
                ret['proxy_index'] = dvalues['index']
                ret['sourcetype_proxy'] = dvalues['sourcetype']
                ret['custom_proxy_c_ip'] = dvalues['c_ip']
                ret['custom_proxy_cs_user'] = dvalues['cs_user']
                ret['custom_proxy_cs_uri'] = dvalues['cs_uri']
                ret['custom_proxy_referer'] = dvalues['referer']
                ret['custom_proxy_user_agent'] = dvalues['user_agent']
                ret['custom_proxy_cs_bytes'] = dvalues['cs_bytes']
                ret['custom_proxy_sc_status'] = dvalues['sc_status']
                ret['custom_proxy_sc_bytes'] = dvalues['sc_bytes']
                ret['custom_proxy_cim'] = dvalues['cim']
            return ret

        # the form was submitted,  but we need to do some gruntwork ... check and replace in config file with right index.
        form = LogsForm(request.POST)
        if not form.is_valid():
            # it shouldn't happen, because the same form is validated in create_setup_view_context()
            return {
                'form': form,
                'configured': False,
            }

        conf = __load_config_file("it_tude.conf")
        sourcetypes_list_str = conf.get('sourcetypes_list', '')

        sourcetype_proxy = form.cleaned_data['sourcetype_proxy']
        if sourcetype_proxy:
            # get data from form:
            proxy_index = form.cleaned_data['proxy_index']
            conf["index_%s_proxy" % source_id] = proxy_index
            conf["sourcetype_%s_proxy" % source_id] = sourcetype_proxy
            conf["proxy_%s_c_ip" % source_id] = form.cleaned_data['custom_field_proxy_c_ip']
            conf["proxy_%s_cs_user" % source_id] = form.cleaned_data['custom_field_proxy_cs_user']
            conf["proxy_%s_cs_uri" % source_id] = form.cleaned_data['custom_field_proxy_cs_uri']
            conf["proxy_%s_referer" % source_id] = form.cleaned_data['custom_field_proxy_referer']
            conf["proxy_%s_user_agent" % source_id] = form.cleaned_data['custom_field_proxy_user_agent']
            conf["proxy_%s_cs_bytes" % source_id] = form.cleaned_data['custom_field_proxy_cs_bytes']
            conf["proxy_%s_sc_status" % source_id] = form.cleaned_data['custom_field_proxy_sc_status']
            conf["proxy_%s_sc_bytes" % source_id] = form.cleaned_data['custom_field_proxy_sc_bytes']
            conf["proxy_%s_cim" % source_id] = form.cleaned_data['custom_proxy_cim_compliant']
            conf["sourcetypes_list"] = __edit_name_from_sourcetypes_list(sourcetypes_list_str, source_id, "3", sourcetype_proxy)

        sourcetype_bind = form.cleaned_data['sourcetype_bind']
        if sourcetype_bind:
            dns_index = form.cleaned_data['index']
            conf["index_%s_bind" % source_id] = dns_index
            conf["sourcetype_%s_bind" % source_id] = sourcetype_bind
            conf["sourcetypes_list"] = __edit_name_from_sourcetypes_list(sourcetypes_list_str, source_id, "0", sourcetype_bind)

        sourcetype_msdns = form.cleaned_data['sourcetype_msdns']
        if sourcetype_msdns:
            dns_index = form.cleaned_data['index']
            conf["index_%s_ms" % source_id] = dns_index
            conf["sourcetype_%s_ms" % source_id] = sourcetype_msdns
            conf["sourcetypes_list"] = __edit_name_from_sourcetypes_list(sourcetypes_list_str, source_id, "1", sourcetype_msdns)

        sourcetype_custom = form.cleaned_data['sourcetype_custom']
        if sourcetype_custom:
            dns_index = form.cleaned_data['index']
            conf["index_%s_custom" % source_id] = dns_index
            conf["sourcetype_%s_custom" % source_id] = sourcetype_custom
            conf["custom_dns_%s_cim" % source_id] = form.cleaned_data['custom_field_cim_compliant']
            conf["custom_dns_%s_dnstype" % source_id] = form.cleaned_data['custom_field_dnstype']
            conf["custom_dns_%s_fqdn" % source_id] = form.cleaned_data['custom_field_fqdn']
            conf["custom_dns_%s_srcip" % source_id] = form.cleaned_data['custom_field_srcip']
            conf["sourcetypes_list"] = __edit_name_from_sourcetypes_list(sourcetypes_list_str, source_id, "2", sourcetype_custom)

        __save_config_file("it_tude.conf", conf)
        __generate_props()
        __reload_apps(service)
    except Exception as e:
        utils.write_log_exception(e)
    return ret


def __debug(string):
    pass


def __load_config_file(fname):
    __debug("__load_config_file\n")
    try:
        app_path = utils.get_app_path()
        inputs_fname = os.path.join(app_path, "local", fname)
        fd = open(inputs_fname, 'r')
        conf = {}
        lines = fd.readlines()
        pattern = re.compile("(.+)\s*=\s*(.+)")
        for l in lines:
            try:
                l = l.replace(' ', '')
                if l[0] == '#' or len(l) == 0:
                    continue
                r = re.match(pattern, l)
                conf[r.group(1)] = r.group(2)
            except AttributeError:
                continue
            except IndexError:
                continue
        fd.close()
        return conf
    except IOError:
        return None


def __save_config_file(fname, conf):
    __debug("__save_config_file\n")
    app_path = utils.get_app_path()
    output_fname = os.path.join(app_path, "local", fname)
    try:
        with open(output_fname, 'w') as fd:
            fd.write('[config]\n')
            s = ''
            for k, v in conf.iteritems():
                s += "%s = %s\n" % (k, v)
            fd.write(s)
        return conf
    except IOError:
        return None


def __get_attrs_from_config(anId, aType):
    def __setKey(conf, entry, d, dest):
            val = conf.get(entry, None)
            if val:
                d[dest] = val

    __debug("__get_attrs_from_config %s %s \n" % (anId, aType))
    try:
        d = {}
        conf = __load_config_file("it_tude.conf")
        key = "%s_%s" % (anId, aType)
        if conf:
            __setKey(conf, 'sourcetype_%s' % key, d, 'sourcetype')
            __setKey(conf, 'index_%s' % key, d, 'index')
            if aType == "custom":
                __setKey(conf, 'custom_dns_%s_dnstype' % anId, d, 'dnstype')
                __setKey(conf, 'custom_dns_%s_fqdn' % anId, d, 'fqdn')
                __setKey(conf, 'custom_dns_%s_srcip' % anId, d, 'srcip')
                __setKey(conf, 'custom_dns_%s_cim' % anId, d, 'cim')
            elif aType == "proxy":
                __setKey(conf, 'proxy_%s_c_ip' % anId, d, 'c_ip')
                __setKey(conf, 'proxy_%s_cs_user' % anId, d, 'cs_user')
                __setKey(conf, 'proxy_%s_cs_uri' % anId, d, 'cs_uri')
                __setKey(conf, 'proxy_%s_referer' % anId, d, 'referer')
                __setKey(conf, 'proxy_%s_user_agent' % anId, d, 'user_agent')
                __setKey(conf, 'proxy_%s_cs_bytes' % anId, d, 'cs_bytes')
                __setKey(conf, 'proxy_%s_sc_status' % anId, d, 'sc_status')
                __setKey(conf, 'proxy_%s_sc_bytes' % anId, d, 'sc_bytes')
                __setKey(conf, 'proxy_%s_cim' % anId, d, 'cim')
        return d
    except IOError:
        return None


# Generate props.conf from it_tude.conf
def __generate_props():
    __debug("__generate_props\n")
    try:
        app_path = utils.get_app_path()
        # output to template -> props.conf
        output_fname = os.path.join(app_path, "local", "props.conf")
        f = open(output_fname, "wt")
        # input itt conf ->it_tude.conf
        conf = __load_config_file("it_tude.conf")

        sourcetypes_list = conf.get('sourcetypes_list', None)
        if sourcetypes_list is None or sourcetypes_list == "":
            return

        aTypeDict = {'0': 'bind', '1': 'ms', '2': 'custom', '3': 'proxy'}
        split = sourcetypes_list.split("**")
        for item in split:
            template = ""
            element = item.split("*")
            if len(element) <= 1:
                continue
            aType = aTypeDict.get(element[1], '')
            anId = element[0]
            __debug(('__get_attrs_from_config ==> %s %s \n') % (anId, aType))
            d = __get_attrs_from_config(anId, aType)

            template += "[%s]\n" % d['sourcetype']
            if aType == 'bind':
                template += open(os.path.join(app_path, "default", "props-bind.conf.template"), "rt").read()
                template += "\n"
            elif aType == 'ms':
                template += open(os.path.join(app_path, "default", "props-msdns.conf.template"), "rt").read()
                template += "\n"
            elif aType == 'custom':
                index = 'custom_dns_' + anId
                if conf[index + '_dnstype'] != "query_type":
                    template += "FIELDALIAS-query_type = %s AS query_type\n" % d['dnstype']
                if conf[index + '_fqdn'] != "dest_host":
                    template += "FIELDALIAS-dest_host = %s AS dest_host\n" % d['fqdn']
                if conf[index + '_srcip'] != "src_ip":
                    template += "FIELDALIAS-src_ip = %s AS src_ip\n" % d['srcip']
                template += "\n"
            elif aType == 'proxy':
                index = 'proxy_' + anId
                if conf[index + '_c_ip'] != 'c_ip':
                    template += "FIELDALIAS-src = %s AS src\n" % d['c_ip']
                if conf[index + '_cs_user'] != 'cs_user':
                    template += "FIELDALIAS-user = %s AS user\n" % d['cs_user']
                if conf[index + '_cs_uri'] != 'cs_uri':
                    template += "FIELDALIAS-query = %s AS query\n" % d['cs_uri']
                if conf[index + '_referer'] != 'cs_referer':
                    template += "FIELDALIAS-http_referer = %s AS http_referer\n" % d['referer']
                if conf[index + '_user_agent'] != 'cs_userAgent':
                    template += "FIELDALIAS-http_user_agent = %s AS http_user_agent\n" % d['user_agent']
                if conf[index + '_cs_bytes'] != 'cs_bytes':
                    template += "FIELDALIAS-bytes_in = %s AS bytes_in\n" % d['cs_bytes']
                if conf[index + '_sc_status'] != 'sc_status':
                    template += "FIELDALIAS-status = %s AS status\n" % d['sc_status']
                if conf[index + '_sc_bytes'] != 'sc_bytes':
                    template += "FIELDALIAS-bytes_out = %s AS bytes_out\n" % d['sc_bytes']
                template += "\n"
            f.write(template)
    except Exception as e:
        utils.write_log_exception(e)


def __delete_from_sourcetypes_list(anId, aType):
    __debug("__delete_from_sourcetypes_list\n")
    try:
        aType_ids = {"bind": (0, 'bind'), "ms": (1, 'ms'), "custom": (2, 'custom_dns'), "proxy": (3, 'proxy')}
        (aType_id, aType_it_tude) = aType_ids.get(aType, (-1, 'bad'))

        conf = __load_config_file("it_tude.conf")
        sourcetype_key = 'sourcetype_%s_%s' % (anId, aType)
        sourcetype_to_del = conf[sourcetype_key]
        sourcetypelist_to_del = "**"+anId+"*"+str(aType_id)+"*"+sourcetype_to_del
        key_to_del = aType_it_tude+"_"+anId+"_"

        # cleaning
        conf['sourcetypes_list'] = conf['sourcetypes_list'].replace(sourcetypelist_to_del, '')
        del conf["sourcetype_"+anId+"_"+aType]
        del conf["index_"+anId+"_"+aType]
        for k in conf.keys():
            if k.startswith(key_to_del):
                del conf[k]
        __save_config_file("it_tude.conf", conf)
    except Exception as e:
        utils.write_log_exception(e)


def __edit_name_from_sourcetypes_list(aSourcetype_list_src, anId, aType_id, aNew_name):
    __debug("__edit_name_from_sourcetypes_list\n")
    _result = aSourcetype_list_src
    try:
        _toFind = "**"+anId+"*"+aType_id+"*"
        _length = len(_toFind)
        _pos = aSourcetype_list_src.find(_toFind)
        if(_pos != -1):
            _posEnd = _pos + _length
            _result = aSourcetype_list_src[0:_pos]
            _t = (aSourcetype_list_src[_posEnd:])
            _posEnd = _t.find("**")
            if _posEnd != -1:
                _result += _toFind + aNew_name
                _result += _t[_posEnd:]
            elif _posEnd == -1:
                _result += _toFind + aNew_name
    except Exception as e:
        utils.write_log_exception(e)
    return _result


def __reload_apps(service):
    app_path = utils.get_app_path()
    bin_path = os.path.join(app_path, "bin")
    sys.path.append(bin_path)
    service.apps['it_tude'].reload()
