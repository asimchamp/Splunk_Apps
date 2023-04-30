#!/usr/bin/env python

# Splunk for XenServer
# Gets all the VMs in the pool

import time
import XenAPI
import xsUtils

def logError():
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
    

try:
    vms = xsUtils.xsSession.xenapi.VM.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for vm in vms:
        vmRecord = xsUtils.xsSession.xenapi.VM.get_record(vm)
        if not(vmRecord["is_control_domain"]) and not(vmRecord["is_a_snapshot"]) and not (vmRecord["is_a_template"]):
                
            out = '%s - name_description="%s" name_label="%s" platform="%s" power_state="%s" vm_uuid="%s" vcpus_at_startup="%s" vcpus_max="%s" pool_uuid="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    vmRecord["name_description"],
                    vmRecord["name_label"],
                    vmRecord["platform"],
                    vmRecord["power_state"],
                    vmRecord["uuid"],
                    vmRecord["VCPUs_at_startup"],
                    vmRecord["VCPUs_max"],
                    poolUuid
                  )

            try:
                if(vmRecord["guest_metrics"] != "OpaqueRef:NULL"):
                    out += ' vm_guest_metrics_uuid="%s"' % ( xsUtils.xsSession.xenapi.VM_guest_metrics.get_uuid(vmRecord["guest_metrics"]) )
                    out += ' os_version="%s"' % (xsUtils.xsSession.xenapi.VM_guest_metrics.get_os_version(vmRecord["guest_metrics"]) )
                    pv_drivers_version = xsUtils.xsSession.xenapi.VM_guest_metrics.get_PV_drivers_version(vmRecord["guest_metrics"])
                    pv_drv = pv_drivers_version['major'] + "." + pv_drivers_version['minor'] + "." + pv_drivers_version['build']
                    out += ' pv_drivers_version="%s"' % ( pv_drv )
            except Exception, ex:
                logError()
    
            try:
                if(vmRecord["metrics"] != "OpaqueRef:NULL"):
                    out += ' vm_metrics_uuid="%s"' % ( xsUtils.xsSession.xenapi.VM_metrics.get_uuid(vmRecord["metrics"]) )
            except Exception, ex:
                logError()
    
            try:
                if(vmRecord["resident_on"] != "OpaqueRef:NULL"):
                    out += ' resident_on_uuid="%s"' % ( xsUtils.xsSession.xenapi.host.get_uuid(vmRecord["resident_on"]) )
                    out += ' resident_on_hostname="%s"' % ( xsUtils.xsSession.xenapi.host.get_hostname(vmRecord["resident_on"]) )
            except Exception, ex:
                logError()
    
            print out

except Exception, ex:
    logError()
