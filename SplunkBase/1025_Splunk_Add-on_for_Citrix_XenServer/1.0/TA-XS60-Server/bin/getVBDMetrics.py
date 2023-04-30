#!/usr/bin/env python

# Splunk for XenServer
# Gets all the VBD Metrics (Virtual Block Device Metrics) in the pool

import time
import XenAPI
import xsUtils

try:
    vbdMetrics = xsUtils.xsSession.xenapi.VBD_metrics.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for vbdMetric in vbdMetrics:
        vbdMetricRecord = xsUtils.xsSession.xenapi.VBD_metrics.get_record(vbdMetric)
                
        out = '%s - io_read_kbs="%s" io_write_kbs="%s" last_updated="%s" other_config="%s" vbd_metrics_uuid="%s" pool_uuid="%s"' % \
            (
                time.strftime("%Y-%m-%d %H:%M:%S"),
                vbdMetricRecord["io_read_kbs"],
                vbdMetricRecord["io_write_kbs"],
                vbdMetricRecord["last_updated"],
                vbdMetricRecord["other_config"],
                vbdMetricRecord["uuid"],
                poolUuid
            )

        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
