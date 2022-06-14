#!/usr/bin/env python

# Splunk for XenServer
# Gets all the VM Guest Metrics in the pool

import time
import XenAPI
import xsUtils

try:
    vmGuestMetrics = xsUtils.xsSession.xenapi.VM_guest_metrics.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for vmGuestMetric in vmGuestMetrics:
        vmGuestMetricRecord = xsUtils.xsSession.xenapi.VM_guest_metrics.get_record(vmGuestMetric)
                
        out = '%s - disks="%s" last_updated="%s" live="%s" memory="%s" networks="%s" os_version="%s" other="%s" other_config="%s" pv_drivers_up_to_date="%s" pv_drivers_version="%s" vm_guest_metrics_uuid="%s" pool_uuid="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    vmGuestMetricRecord["disks"],
                    vmGuestMetricRecord["last_updated"],
                    vmGuestMetricRecord["live"],
                    vmGuestMetricRecord["memory"],
                    vmGuestMetricRecord["networks"],
                    vmGuestMetricRecord["os_version"],
                    vmGuestMetricRecord["other"],
                    vmGuestMetricRecord["other_config"],
                    vmGuestMetricRecord["PV_drivers_up_to_date"],
                    vmGuestMetricRecord["PV_drivers_version"],
                    vmGuestMetricRecord["uuid"],
                    poolUuid
                  )

        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
