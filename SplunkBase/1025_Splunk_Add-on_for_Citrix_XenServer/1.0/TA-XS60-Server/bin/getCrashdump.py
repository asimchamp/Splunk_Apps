#!/usr/bin/env python

# Splunk for XenServer
# Gets all Crashdumps in the pool

import time
import XenAPI
import xsUtils

try:
    crashdumps = xsUtils.xsSession.xenapi.crashdump.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for crashdump in crashdumps:
        crashdumpRecord = xsUtils.xsSession.xenapi.crashdump.get_record(crashdump)

        out = '%s - other_config="%s" crashdump_uuid="%s" pool_uuid="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    crashdumpRecord["other_config"],
                    crashdumpRecord["uuid"],
                    poolUuid
                  )

        if(crashdumpRecord["VDI"] != "OpaqueRef:NULL"):
            out += ' vdi_uuid="%s"' % (xsUtils.xsSession.xenapi.VDI.get_uuid(crashdumpRecord["VDI"]))

        if(crashdumpRecord["VM"] != "OpaqueRef:NULL"):
            out += ' vm_uuid="%s"' % (xsUtils.xsSession.xenapi.VM.get_uuid(crashdumpRecord["VM"]))

        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))

