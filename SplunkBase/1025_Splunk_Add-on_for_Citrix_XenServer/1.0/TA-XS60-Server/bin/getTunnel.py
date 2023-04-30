#!/usr/bin/env python

# Splunk for XenServer
# Gets the Tunnels (network traffic tunnels) in the pool

import time
import XenAPI
import xsUtils

try:
    tunnels = xsUtils.xsSession.xenapi.tunnel.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for tunnel in tunnels:
        tunnelRecord = xsUtils.xsSession.xenapi.tunnel.get_record(tunnel)

        out = '%s - other_config=-"%s" status="%s" tunnel_uuid="%s" pool_uuid="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    tunnelRecord["other_config"],
                    tunnelRecord["status"],
                    tunnelRecord["uuid"],
                    poolUuid
                  )

        if(tunnelRecord["access_PIF"] != "OpaqueRef:NULL"):
            out += ' access_PIF_uuid="%s"' % (xsUtils.xsSession.xenapi.PIF.get_uuid(tunnelRecord["access_PIF"]))

        if(tunnelRecord["transport_PIF"] != "OpaqueRef:NULL"):
            out += ' transport_PIF_uuid="%s"' % (xsUtils.xsSession.xenapi.PIF.get_uuid(tunnelRecord["transport_PIF"]))

        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
