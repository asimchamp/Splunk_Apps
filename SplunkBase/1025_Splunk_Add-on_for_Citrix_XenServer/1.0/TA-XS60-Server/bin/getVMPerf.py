#!/usr/bin/env python

# Splunk for XenServer
# Gets performance information from the RRDs (Round Robin Databases)

import time
import XenAPI
import parse_rrd
import xsUtils

def print_latest_vm_data(rrd_updates, uuid, poolUuid, hostname, vm_name):
    cpuCount=0
    cpuSum=0
    vifCount=0
    vifSum=0.0
    cpu_out = '%s - pool_uuid="%s" vm_uuid="%s" hostname="%s" name_label="%s" object="Processor" ' % (time.strftime("%Y-%m-%d %H:%M:%S"), poolUuid, uuid, hostname, vm_name)
    mem_out = '%s - pool_uuid="%s" vm_uuid="%s" hostname="%s" name_label="%s" object="Memory" ' % (time.strftime("%Y-%m-%d %H:%M:%S"), poolUuid, uuid, hostname, vm_name)
    vif_out = '%s - pool_uuid="%s" vm_uuid="%s" hostname="%s" name_label="%s" object="Network Interface" ' % (time.strftime("%Y-%m-%d %H:%M:%S"), poolUuid, uuid, hostname, vm_name)
    vbd_out = '%s - pool_uuid="%s" vm_uuid="%s" hostname="%s" name_label="%s" object="Virtual Storage Device" ' % (time.strftime("%Y-%m-%d %H:%M:%S"), poolUuid, uuid, hostname, vm_name)
    
    for param in rrd_updates.get_vm_param_list(uuid):

        if param != "":
            max_time=0
            data=""
            for row in range(rrd_updates.get_nrows()):
                epoch = rrd_updates.get_row_time(row)
                dv = str(rrd_updates.get_vm_data(uuid,param,row))
                if epoch > max_time:
                    max_time = epoch
                    data = dv
                    
            if param.startswith("cpu"):
                cpu_out += param + "=" + data + ", "
                cpuCount = cpuCount + 1
                cpuSum = cpuSum + float(dv)
                cpu_out += "%s_pct=%f, " % (param, float(dv)*100)
                out = '%s - pool_uuid="%s" vm_uuid="%s" vm_host="%s" name_label="%s" instance="%s:%s" object="Processor" counter="%% Total Run Time" Value=%f' % \
                      (time.strftime("%Y-%m-%d %H:%M:%S"), poolUuid, uuid, hostname, vm_name, vm_name, param, float(dv)*100)
                print out
                
            if param.startswith("memory"):
                mem_out += param + "=" + data + ", "
                if param == "memory_internal_free":
                    # Note: XenServer is reporting bits and not bytes, so we multiply the value by 1024
                    out = '%s - pool_uuid=%s vm_uuid=%s vm_host=%s name_label=%s object="Memory" counter="Available Bytes" Value=%f' % \
                          (time.strftime("%Y-%m-%d %H:%M:%S"), poolUuid, uuid, hostname, vm_name, float(dv)*1024)
                    print out
                
            if param.startswith("vif"):

                vifCount = vifCount + 1
                vifSum = vifSum + float(dv)
                
                counter = ""
                if param.endswith("_tx"):
                    counter="Bytes Sent/sec"
                
                if param.endswith("_rx"):
                    counter="Bytes Received/sec"
                    
                out = '%s - pool_uuid="%s" vm_uuid="%s" vm_host="%s" name_label="%s" instance="%s" Value=%f counter="%s" object="Network Interface"' % \
                      (time.strftime("%Y-%m-%d %H:%M:%S"), poolUuid, uuid, hostname, vm_name, param, float(dv), counter)
                print out
                
                vif_out += param + "=" + data + ", "
                
            if param.startswith("vbd"):
                
                counter = ""
                if(param.endswith("_read")):
                    counter="Read Bytes/sec"
                
                if(param.endswith("_write")):
                    counter="Write Bytes/sec"
                    
                out = '%s - pool_uuid="%s" vm_uuid="%s" vm_host="%s" name_label="%s" instance="%s" Value=%f counter="%s" object="Virtual Storage Device"' % \
                      (time.strftime("%Y-%m-%d %H:%M:%S"), poolUuid, uuid, hostname, vm_name, param, float(dv), counter)
                
                print out
                
                vbd_out += param + "=" + data + ", "
                

    cpu_out += 'cpu_count=%i, cpu_sum=%f instance="_Total" counter="%% Total Run Time" Value=%f' % (cpuCount, cpuSum, cpuSum)
    vif_out += 'vif_count=%i, vif_sum=%f, counter="Bytes/sec", Value=%f ' % (vifCount, vifSum, vifSum)
    
    # print cpu_out
    # print mem_out
    print vif_out
    # print vbd_out

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
            
            for uuid in rrd_updates.get_vm_list():
                vm = xsUtils.xsSession.xenapi.VM.get_by_uuid(uuid)
                vm_name = xsUtils.xsSession.xenapi.VM.get_name_label(vm)
                vm_is_control_domain = xsUtils.xsSession.xenapi.VM.get_is_control_domain(vm)

                if not vm_is_control_domain:
                    print_latest_vm_data(rrd_updates, uuid, poolUuid, hostname, vm_name)
        
        except Exception, ex:
            import sys, traceback
            exc_type, exc_value, exc_traceback = sys.exc_info()
            xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
        
except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))