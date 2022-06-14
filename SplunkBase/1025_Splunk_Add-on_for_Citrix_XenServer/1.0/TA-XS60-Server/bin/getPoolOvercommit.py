#!/usr/bin/env python

# Splunk for XenServer
# Polls pool to see if it is overcommited

import time
import XenAPI
import xsUtils

try:
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolRecord = xsUtils.xsSession.xenapi.pool.get_record(pool)

    out = '%s - ha_allow_overcommit="%s" ha_enabled="%s" ha_overcommitted="%s" pool_uuid="%s"' % \
              (
                time.strftime("%Y-%m-%d %H:%M:%S"),
                poolRecord["ha_allow_overcommit"],
                poolRecord["ha_enabled"],
                poolRecord["ha_overcommitted"],
                poolRecord["uuid"]
              )

    if(poolRecord["ha_overcommitted"]):
        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
