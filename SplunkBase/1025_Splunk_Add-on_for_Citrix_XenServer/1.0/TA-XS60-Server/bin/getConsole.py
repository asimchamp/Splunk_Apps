#!/usr/bin/env python

# Splunk for XenServer
# Gets all Consoles in the pool

import time
import XenAPI
import xsUtils

try:
    consoles = xsUtils.xsSession.xenapi.console.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for console in consoles:
        consoleRecord = xsUtils.xsSession.xenapi.console.get_record(console)

        out = '%s - location="%s" other_config="%s" protcol="%s" console_uuid="%s" pool_uuid="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    consoleRecord["location"],
                    consoleRecord["other_config"],
                    consoleRecord["protocol"],
                    consoleRecord["uuid"],
                    poolUuid
                  )

        if(consoleRecord["VM"] != "OpaqueRef:NULL"):
            out += ' vm_uuid="%s"' % (xsUtils.xsSession.xenapi.VM.get_uuid(consoleRecord["VM"]))

        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
