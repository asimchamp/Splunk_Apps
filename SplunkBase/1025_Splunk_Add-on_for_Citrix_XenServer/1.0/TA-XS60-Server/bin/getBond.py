#!/usr/bin/env python

# Splunk for XenServer
# Gets all Bonds in the pool

import time
import XenAPI
import xsUtils

try:
    bonds = xsUtils.xsSession.xenapi.Bond.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for bond in bonds:
        bondRecord = xsUtils.xsSession.xenapi.Bond.get_record(bond)

        out = '%s - other_config="%s" bond_uuid="%s" pool_uuid="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    bondRecord["other_config"],
                    bondRecord["uuid"],
                    poolUuid
                  )

        if(bondRecord["master"] != "OpaqueRef:NULL"):
            out += ' master_uuid="%s"' % (xsUtils.xsSession.xenapi.PIF.get_uuid(bondRecord["master"]))

        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
