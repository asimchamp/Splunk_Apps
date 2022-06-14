#!/usr/bin/env python

# Splunk for XenServer
# Gets all the VM Metrics in the pool

import time
import XenAPI
import xsUtils

try:
    vmMetrics = xsUtils.xsSession.xenapi.VM_metrics.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for vmMetric in vmMetrics:
        vmMetricRecord = xsUtils.xsSession.xenapi.VM_metrics.get_record(vmMetric)
                
        out = '%s - install_time="%s" last_updated="%s" memory_actual="%s" other_config="%s" start_time"%s" state="%s" vm_metrics_uuid="%s" vcpus_cpu="%s" vcpus_flags="%s" vcpus_number="%s" vcpus_params="%s" \
vcpus_utilisation="%s" pool_uuid="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    vmMetricRecord["install_time"],
                    vmMetricRecord["last_updated"],
                    vmMetricRecord["memory_actual"],
                    vmMetricRecord["other_config"],
                    vmMetricRecord["start_time"],
                    vmMetricRecord["state"],
                    vmMetricRecord["uuid"],
                    vmMetricRecord["VCPUs_CPU"],
                    vmMetricRecord["VCPUs_flags"],
                    vmMetricRecord["VCPUs_number"],
                    vmMetricRecord["VCPUs_params"],
                    vmMetricRecord["VCPUs_utilisation"],
                    poolUuid
                  )

        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
