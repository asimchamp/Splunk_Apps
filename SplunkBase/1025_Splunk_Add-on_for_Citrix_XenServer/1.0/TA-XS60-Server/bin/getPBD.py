#!/usr/bin/env python

# Splunk for XenServer
# Gets all PBDs (Physical Block Devices) in the pool

import time
import XenAPI
import xsUtils

try:
    pbds = xsUtils.xsSession.xenapi.PBD.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for pbd in pbds:
        pbdRecord = xsUtils.xsSession.xenapi.PBD.get_record(pbd)

        out = '%s - currently_attached="%s" device_config="%s" other_config="%s" pbd_uuid="%s" pool_uuid="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    pbdRecord["currently_attached"],
                    pbdRecord["device_config"],
                    pbdRecord["other_config"],
                    pbdRecord["uuid"],
                    poolUuid
                  )

        if(pbdRecord["host"] != "OpaqueRef:NULL"):
            out += ' host_uuid="%s"' % (xsUtils.xsSession.xenapi.host.get_uuid(pbdRecord["host"]))
            out += ' hostname="%s"' % (xsUtils.xsSession.xenapi.host.get_hostname(pbdRecord["host"]))

        if(pbdRecord["SR"] != "OpaqueRef:NULL"):
            out += ' sr_uuid="%s"' % (xsUtils.xsSession.xenapi.SR.get_uuid(pbdRecord["SR"]))

        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
