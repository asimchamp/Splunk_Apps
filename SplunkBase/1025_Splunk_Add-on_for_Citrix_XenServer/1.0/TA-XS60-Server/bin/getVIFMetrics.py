#!/usr/bin/env python

# Splunk for XenServer
# Gets all the VIF Metrics (Virtual Interface Metrics) in the pool

import time
import XenAPI
import xsUtils

try:
    vifMetrics = xsUtils.xsSession.xenapi.VIF_metrics.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for vifMetric in vifMetrics:
        metricRecord = xsUtils.xsSession.xenapi.VIF_metrics.get_record(vifMetric)
                
        out = '%s - io_read_kbs="%s" io_write_kbs="%s" last_updated="%s" other_config="%s" vif_metric_uuid="%s" pool_uuid="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    metricRecord["io_read_kbs"],
                    metricRecord["io_write_kbs"],
                    metricRecord["last_updated"],
                    metricRecord["other_config"],
                    metricRecord["uuid"],
                    poolUuid
                  )

        print out

except Exception, ex:
    xsUtils.xsLog.error(ex)
    print ex
