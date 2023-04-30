#!/usr/bin/env python

# Splunk for XenServer
# Gets all networks in the pool

import time
import XenAPI
import xsUtils

try:
    networks = xsUtils.xsSession.xenapi.network.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)    

    for network in networks:
        networkRecord = xsUtils.xsSession.xenapi.network.get_record(network)

        out = '%s - allowed_operations="%s" bridge="%s" current_operations="%s" mtu="%s" name_description="%s" name_label="%s" other_config="%s" pool_uuid="%s" tags="%s" network_uuid="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    networkRecord["allowed_operations"],
                    networkRecord["bridge"],
                    networkRecord["current_operations"],
                    networkRecord["MTU"],
                    networkRecord["name_description"],
                    networkRecord["name_label"],
                    networkRecord["other_config"],
                    poolUuid,
                    networkRecord["tags"],
                    networkRecord["uuid"]
                  )

        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
