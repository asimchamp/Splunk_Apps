#!/usr/bin/env python

# Splunk for XenServer
# Gets all RRD logging data sources in the pool

import time
import XenAPI
import xsUtils

try:
    datasources = xsUtils.xsSession.xenapi.data_source.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)
    
    for ds in datasources:
        dsRecord = xsUtils.xsSession.xenapi.data_source.get_record(ds)

        out = '%s - enabled="%s" max="%s" min="%s" name_description="%s" name_label="%s" pool_uuid="%s" standard="%s" units="%s" value="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    dsRecord["enabled"],
                    dsRecord["max"],
                    dsRecord["min"],
                    dsRecord["name_description"],
                    dsRecord["name_label"],
                    poolUuid,
                    dsRecord["standard"],
                    dsRecord["units"],
                    dsRecord["value"]
                  )

        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
