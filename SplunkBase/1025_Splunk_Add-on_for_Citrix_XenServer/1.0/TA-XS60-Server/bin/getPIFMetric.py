#!/usr/bin/env python

# Splunk for XenServer
# Gets all PIF Metrics (Physical Interfaces) in the pool

import time
import XenAPI
import xsUtils

try:
    pifMetrics = xsUtils.xsSession.xenapi.PIF_metrics.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for metric in pifMetrics:
        metricRecord = xsUtils.xsSession.xenapi.PIF_metrics.get_record(metric)

        out = '%s - carrier="%s" device_id="%s" device_name="%s" duplex="%s" io_read_kbs="%s" io_write_kbs="%s" last_updated="%s" other_config="%s" pci_bus_path="%s" speed="%s" pif_metric_uuid="%s" vendor_id="%s" vendor_name="%s" pool_uuid="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    metricRecord["carrier"],
                    metricRecord["device_id"],
                    metricRecord["device_name"],
                    metricRecord["duplex"],
                    metricRecord["io_read_kbs"],
                    metricRecord["io_write_kbs"],
                    metricRecord["last_updated"],
                    metricRecord["other_config"],
                    metricRecord["pci_bus_path"],
                    metricRecord["speed"],
                    metricRecord["uuid"],
                    metricRecord["vendor_id"],
                    metricRecord["vendor_name"],
                    poolUuid
                  )

        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
