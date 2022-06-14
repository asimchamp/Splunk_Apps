#!/usr/bin/env python

# Splunk for XenServer
# Gets performance information from the RRDs (Round Robin Databases)

import time
import XenAPI
import parse_rrd
import xsUtils

def print_latest_host_data(rrd_updates, poolUuid, hostname):
    host_uuid = rrd_updates.get_host_uuid()
    cpuCount=0
    cpuSum=0
    pifCount=0
    pifSum=0.0
    out = '%s - pool_uuid="%s" host_uuid="%s" hostname="%s" ' % (time.strftime("%Y-%m-%d %H:%M:%S"), poolUuid, host_uuid, hostname)
    
    for param in rrd_updates.get_host_param_list():
        if param != "":
            max_time=0
            data=""
            for row in range(rrd_updates.get_nrows()):
                epoch = rrd_updates.get_row_time(row)
                dv = str(rrd_updates.get_host_data(param,row))
                if epoch > max_time:
                    max_time = epoch
                    data = dv
            out += param + "=" + data + ", "
            if param.startswith("cpu",0,5):
                cpuCount = cpuCount + 1
                cpuSum = cpuSum + float(dv)
            if param.startswith("pif"):
                pifCount = pifCount + 1
                pifSum = pifSum + float(dv)

    out += "cpu_count=%i, cpu_sum=%f, pif_count=%i, pif_sum=%f" % (cpuCount, cpuSum, pifCount, pifSum)
    print out

def print_latest_vm_data(rrd_updates, uuid, poolUuid, hostname):
    cpuCount=0
    cpuSum=0
    vifCount=0
    vifSum=0.0
    out = '%s - pool_uuid="%s" vm_uuid="%s" hostname="%s" ' % (time.strftime("%Y-%m-%d %H:%M:%S"), poolUuid, uuid, hostname)
    
    for param in rrd_updates.get_vm_param_list(uuid):
        isCpu=False
        if param != "":
            max_time=0
            data=""
            for row in range(rrd_updates.get_nrows()):
                epoch = rrd_updates.get_row_time(row)
                dv = str(rrd_updates.get_vm_data(uuid,param,row))
                if epoch > max_time:
                    max_time = epoch
                    data = dv
                    
            out += param + "=" + data + ", "
            if param.startswith("cpu",0,5):
                cpuCount = cpuCount + 1
                cpuSum = cpuSum + float(dv)
            if param.startswith("vif"):
                vifCount = vifCount + 1
                vifSum = vifSum + float(dv)

    out += "cpu_count=%i, cpu_sum=%f, vif_count=%i, vif_sum=%f" % (cpuCount, cpuSum, vifCount, vifSum)
    print out


try:
    params = {}
    params['cf'] = "MAX"
    params['start'] = int(time.time()) - 60
    params['interval'] = 1

    rrdUsername = xsUtils.xsConfig.get("XenServer Credentials", "username")
    rrdPassword = xsUtils.xsConfig.get("XenServer Credentials", "password")
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    hosts = xsUtils.xsSession.xenapi.host.get_all()
    for host in hosts:
        hostAddress = xsUtils.xsSession.xenapi.host.get_address(host)
        hostname = xsUtils.xsSession.xenapi.host.get_hostname(host)
        rrdURL = "http://%s:%s@%s" % (
            rrdUsername,
            rrdPassword,
            hostAddress
            )

        rrd_updates = parse_rrd.RRDUpdates()
        rrd_updates.refresh(rrdURL, params)

        print_latest_host_data(rrd_updates, poolUuid, hostname)
        
        for uuid in rrd_updates.get_vm_list():
            print_latest_vm_data(rrd_updates, uuid, poolUuid, hostname)
        
except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))