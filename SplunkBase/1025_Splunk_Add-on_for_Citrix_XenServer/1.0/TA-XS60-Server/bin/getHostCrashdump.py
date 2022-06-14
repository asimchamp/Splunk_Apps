#!/usr/bin/env python

# Splunk for XenServer
# Gets all host crashdumps in the pool

import time
import XenAPI
import xsUtils

try:
    hostCrashdumps = xsUtils.xsSession.xenapi.host_crashdump.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for crashdump in hostCrashdumps:
        crashdumpRecord = xsUtils.xsSession.xenapi.host_crashdump.get_record(crashdump)

        out = '%s - other_config="%s" size="%s" timestamp="%s" host_crashdump_uuid="%s" pool_uuid="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    crashdumpRecord["other_config"],
                    crashdumpRecord["size"],
                    crashdumpRecord["timestamp"],
                    crashdumpRecord["uuid"],
                    poolUuid
                  )

        if(crashdumpRecord["host"] != "OpaqueRef:NULL"):
            out += ' host_uuid="%s"' % (xsUtils.xsSession.xenapi.host.get_uuid(crashdumpRecord["host"]))
            out += ' hostname="%s"' % (xsUtils.xsSession.xenapi.host.get_hostname(crashdumpRecord["host"]))

        print out
        

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
