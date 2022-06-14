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
    cpu_out = '%s - pool_uuid="%s" host_uuid="%s" hostname="%s" name_label="%s" object="Processor" ' % (time.strftime("%Y-%m-%d %H:%M:%S"), poolUuid, host_uuid, hostname, hostname)
    mem_out = '%s - pool_uuid="%s" host_uuid="%s" hostname="%s" name_label="%s" object="Memory" ' % (time.strftime("%Y-%m-%d %H:%M:%S"), poolUuid, host_uuid, hostname, hostname)
    pif_out = '%s - pool_uuid="%s" host_uuid="%s" hostname="%s" name_label="%s" object="Network Interface" ' % (time.strftime("%Y-%m-%d %H:%M:%S"), poolUuid, host_uuid, hostname, hostname)
    pbd_out = '%s - pool_uuid="%s" host_uuid="%s" hostname="%s" name_label="%s" object="LogicalDisk" ' % (time.strftime("%Y-%m-%d %H:%M:%S"), poolUuid, host_uuid, hostname, hostname)
    
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
                    
            if param.startswith("cpu"):
                #cpu_out += param + "=" + data + ", "
                cpuCount = cpuCount + 1
                cpuSum = cpuSum + float(dv)
                #cpu_out += "%s_pct=%f, " % (param, float(dv)*100)
                out = '%s - pool_uuid="%s" host_uuid"%s" hostname="%s" name_label="%s" instance="%s" Value=%f counter="%% Processor Time" object="Processor"' % \
                      (time.strftime("%Y-%m-%d %H:%M:%S"), poolUuid, host_uuid, hostname, hostname, param[3:], float(dv)*100)
                print out
                
            if param.startswith("memory"):
                mem_out += param + "=" + data + ", "
                if param.startswith("memory_free_kib"):
                    out = '%s - pool_uuid=%s host_uuid=%s name_label=%s hostname=%s object="Memory" counter="Available Bytes" Value=%f' % \
                          (time.strftime("%Y-%m-%d %H:%M:%S"), poolUuid, host_uuid, hostname, hostname, float(dv)*1024)
                    print out
                    
                if param.startswith("memory_total_kib"):
                    out = '%s - pool_uuid=%s host_uuid=%s name_label=%s hostname=%s object="Memory" counter="Total Bytes" Value=%f' % \
                          (time.strftime("%Y-%m-%d %H:%M:%S"), poolUuid, host_uuid, hostname, hostname, float(dv)*1024)
                    print out
                
            if param.startswith("pif_eth"):
                #pif_out += param + "=" + data + ", "
                pifCount = pifCount + 1
                pifSum = pifSum + float(dv)
                
                counter = ""
                if param.endswith("_tx"):
                    counter="Bytes Sent/sec"
                
                if param.endswith("_rx"):
                    counter="Bytes Received/sec"
                    
                out = '%s - pool_uuid="%s" host_uuid"%s" hostname="%s" name_label="%s" instance="%s" Value=%f counter="%s" object="Network Interface"' % \
                      (time.strftime("%Y-%m-%d %H:%M:%S"), poolUuid, host_uuid, hostname, hostname, param, float(dv)*100, counter)
                print out
                
            if param.startswith("pbd"):
                pbd_out += param + "=" + data + ", "

    cpu_out += 'cpu_count=%i, cpu_sum=%f, counter="%% Processor Time", instance="_Total" Value=%f' % (cpuCount, cpuSum, cpuSum)
    pif_out += 'pif_count=%i, pif_sum=%f, counter="Bytes Total/sec", Value=%f  object="Network Interface"' % (pifCount, pifSum, pifSum)
    
    print cpu_out
    #print mem_out
    print pif_out
    print pbd_out

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
        try:
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
        
        except Exception, ex:
            import sys, traceback
            exc_type, exc_value, exc_traceback = sys.exc_info()
            xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
    
except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))