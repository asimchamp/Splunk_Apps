#!/usr/bin/env python

# Splunk for XenServer
# Gets all the VLANs in the pool

import time
import XenAPI
import xsUtils

try:
    vlans = xsUtils.xsSession.xenapi.VLAN.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for vlan in vlans:
        vlanRecord = xsUtils.xsSession.xenapi.VLAN.get_record(vlan)
                
        out = '%s - other_config="%s" tag="%s" vlan_uuid="%s" pool_uuid="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    vlanRecord["other_config"],
                    vlanRecord["tag"],
                    vlanRecord["uuid"],
                    poolUuid
                  )

        if(vlanRecord["tagged_PIF"] != "OpaqueRef:NULL"):
            out += ' tagged_PIF_uuid="%s"' % ( xsUtils.xsSession.xenapi.PIF.get_uuid(vlanRecord["tagged_PIF"]) )

        if(vlanRecord["untagged_PIF"] != "OpaqueRef:NULL"):
            out += ' untagged_PIF_uuid="%s"' % ( xsUtils.xsSession.xenapi.PIF.get_uuid(vlanRecord["untagged_PIF"]) )

        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
