#!/usr/bin/env python

# Splunk for XenServer
# Gets the pool

import time
import XenAPI
import xsUtils

try:
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolRecord = xsUtils.xsSession.xenapi.pool.get_record(pool)

    out = '%s - name_description="%s" name_label="%s" pool_uuid="%s"' % \
              (
                time.strftime("%Y-%m-%d %H:%M:%S"),
                poolRecord["name_description"],
                poolRecord["name_label"],
                poolRecord["uuid"],
              )

    if(poolRecord["master"] != "OpaqueRef:NULL"):
        out += ' master_uuid="%s"' % (xsUtils.xsSession.xenapi.host.get_uuid(poolRecord["master"]))
        out += ' master_hostname="%s"' % (xsUtils.xsSession.xenapi.host.get_hostname(poolRecord["master"]))

    print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
