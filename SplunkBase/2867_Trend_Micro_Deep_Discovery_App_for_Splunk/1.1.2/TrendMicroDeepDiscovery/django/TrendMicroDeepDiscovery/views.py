from django.contrib.auth.decorators import login_required
from splunkdj.decorators.render import render_to
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

from django.contrib import messages
import os
from sys import platform as _platform
from ProductRegis import ProductRegis
from CNCList import CNCList
import datetime
import xml.etree.ElementTree as XMLps
from libs.Global_conf import Global_conf
from libs.Local_conf import Local_conf
from libs.Watchlist_conf import Watchlist_conf
from django.shortcuts import render
import json
from django.http import HttpResponse
from django.utils import simplejson

import logging as logger
from logging import handlers

import logging.config
logging.config.fileConfig(os.path.join(os.path.dirname(os.path.realpath(__file__)), "..", "..", "default", "log.ini"))
logger = logging.getLogger('deepdiscovery')

import urllib2
import traceback

me = os.path.dirname(os.path.realpath(__file__))

def queryAPIServer(url, values, PR, cnc):
    try:
        PR.urlPostRequest(url, values)
        logger.info(str(PR.json_result))
        PR.checkResults()
        PR.checkStatus()
        if "successful" in PR.result:
            cnc.downloadCNC()      
    except Exception as e:
        logger.info('queryAPIServer: {0}'.format(e))
        raise

@login_required
def licensing(request):
    try:
        me = os.path.dirname(os.path.realpath(__file__))
        PR = ProductRegis(os.path.join(me, "..", "..","..","TrendMicroDeepDiscovery", "default", "ADS-base.conf"), ['ADS-base', 'APIServer'])
        cnc = CNCList(os.path.join(me, "..", "..","lookups", "CCList"), os.path.join(me, "..", "..", "bin"))

        if request.method == 'POST':
            if request.POST.get('ac_key'):
                if PR.readconf.ackey != request.POST.get('ac_key'):
                    ackey = request.POST.get('ac_key')
                    url = "http://{HOST}:{PORT}/retroapiserver/license_activate.php".format(HOST = PR.readconf.host, PORT = PR.readconf.port)
                    values = {'ackey' : ackey}
                    queryAPIServer(url, values, PR, cnc)
                elif PR.readconf.ackey == request.POST.get('ac_key'):
                    url = "http://{HOST}:{PORT}/retroapiserver/license_update.php".format(HOST = PR.readconf.host, PORT = PR.readconf.port)
                    values = {'ackey' : PR.readconf.ackey}
                    queryAPIServer(url, values, PR, cnc)
            else:
                if PR.readconf.expired_date:
                    PR.checkStatus()
        else:
            if PR.readconf.expired_date:
                PR.checkStatus()

    except Exception as e:
        stack =  traceback.format_exc()
        logger.info('licensing: {0}, Traceback {1}'.format(e, stack))
        PR.result = str(e).replace('<','').replace('>','')

    finally:
        expired_date,cnc_ftime = None,None
        if PR.readconf.expired_date:
            expired_date = str(datetime.datetime.strptime(PR.readconf.expired_date , "%a %b %d %H:%M:%S %Z %Y").strftime("%Y-%m-%d"))
        if cnc.cncFileTime:
            cnc_ftime = str(datetime.datetime.strptime(cnc.cncFileTime , "%a %b %d %H:%M:%S %Y").strftime("%Y-%m-%d"))

        messages = {"ackey" : PR.readconf.ackey,
                    "expired_date" : expired_date if expired_date else 'N/A',
                    "grace_period" : PR.readconf.grace_period,
                    "cnc_db" : cnc_ftime,
                    "status" : PR.status if PR.status else 'Not activated',
                    "action" : PR.result}
        logger.info('licensing finally - message: {0}'.format(messages))
        return render_to_response(
            'licensing.html',
            {'messages':messages},
            context_instance=RequestContext(request)
            )


@login_required
def filterpage(request):
    rr = 'rule1'
    if request.method == 'POST':
        rr = request.POST.get('selectedrule')

    me = os.path.dirname(os.path.realpath(__file__))
    tree = XMLps.parse(os.path.join(me, "xml_conf/filter_ads.xml"))
    root = tree.getroot()

    i_session = list()
    for c in root.findall("filter_ruleid"):
        if c.get('name') != None:
            i_session.append(c.get('name'))

    for c in root.findall("filter_ruleid/[@name='" + rr + "']"):
        rules = c.find("rules").text.split(",")
    return render_to_response(
             'filterpage.html',
             {'rules':rules,
              'selectedrule':rr,
              'i_session':i_session
             },
             context_instance=RequestContext(request)
           )

@login_required
def filter_conf(request):
    confs = Global_conf(os.path.join(me, 'xml_conf/global_conf.xml'))
    if request.method == 'POST':
        protocols = request.POST.get('protocols')
        logger.info("protocols:" + str(protocols))
        confs.set_val('protocols',protocols)
        ruleids = request.POST.get('ruleids')            
        logger.info("ruleids:" + str(ruleids))
        confs.set_val('ruleids',ruleids)
        confs.savexml()

    return render(
                    request,
                    'filter_conf.html',
                    { 
                       "protocols" : confs.get_val('protocols'),
                       "ruleids" : confs.get_val('ruleids') if confs.get_val('ruleids') else ''
                    },
                 )

@login_required
def watchlist_conf(request):
    wl = Watchlist_conf(os.path.join(me, "..", "..","lookups", "watch_list.csv"))
    alis = wl.get_list()
    now = datetime.datetime.now()
    today = now.strftime("%A, %b %d, %Y")
    if request.method == 'POST':
        alis = {}
        lbt_values = request.POST.getlist('lbt[]')
        lbj_values = request.POST.getlist('lbj[]')
        lbd_values = request.POST.getlist('lbd[]')

        _i = 1
        for index,item in enumerate(lbt_values):
            if (
                    lbt_values[index] is not None and lbt_values[index] != '' and 
                    lbj_values[index] is not None and lbj_values[index] != ''
                ):
                alis['t_' + str(_i)] = lbt_values[index]
                alis['j_' + str(_i)] = lbj_values[index]
                alis['d_' + str(_i)] = lbd_values[index]
                _i = ( _i + 1 )

        while _i <= 25:
            alis['t_' + str(_i)] = ''
            alis['j_' + str(_i)] = ''
            alis['d_' + str(_i)] = ''
            _i = ( _i + 1 )

        wl.save_list(alis, os.path.join(me, "..", "..","lookups", "watch_list.csv"))
        wl.save_list_src(alis, os.path.join(me, "..", "..","lookups", "watch_list_src.csv"))
        wl.save_list_dst(alis, os.path.join(me, "..", "..","lookups", "watch_list_dst.csv"))
        wl = Watchlist_conf(os.path.join(me, "..", "..","lookups", "watch_list.csv"))
        alis = wl.get_list()

    return render_to_response(
             'watchlist_conf.html',
             {
	          'today': today,
	          'alis': alis
             },
             context_instance=RequestContext(request)
           )

@login_required
def investigation(request):
    return render(
        request,
        'investigation.html',
        {
        },
        )
    

@login_required
def proxyLogCorrelation(request):
    confs = Local_conf(os.path.join(me, 'xml_conf/local_conf.xml'), 'hostIP', 'CnCAddr')
    hostIP = json.dumps(confs.get_val('hostIP').split(",")) if confs.get_val('hostIP') is not None else []
    CnCAddr = json.dumps(confs.get_val('CnCAddr').split(",")) if confs.get_val('CnCAddr') is not None else []

    return render(
        request,
        'proxy_log_correlation.html',
        {
            "hostIP" : hostIP,
            "CnCAddr" : CnCAddr,
            "UrlPath": request.get_full_path
            },
        )

@login_required
def setFilter(request):
    response_data = {}

    if request.is_ajax() and request.method == 'POST':
        json_data = simplejson.loads(request.body)
        logger.info(str(json_data))
        confs = Local_conf(os.path.join(me, 'xml_conf/local_conf.xml'), 'hostIP', 'CnCAddr')
        confs.set_val('hostIP', json_data['hostIP'])
        confs.set_val('CnCAddr', json_data['CnCAddr'])
        confs.savexml()
        response_data.update({'message':'successful'})
    else:
        response_data.update({'message':'failed'})
    return HttpResponse(json.dumps(response_data), content_type="application/json")

