#!/usr/bin/env python

# Splunk for XenServer
# Gets all host patches in the pool

import time
import XenAPI
import xsUtils

try:
    hostPatches = xsUtils.xsSession.xenapi.host_patch.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for patch in hostPatches:
        patchRecord = xsUtils.xsSession.xenapi.host_patch.get_record(patch)

        out = '%s - applied="%s" filename="%s" name_description="%s" name_label="%s" other_config="%s" size="%s" timestamp_applied="%s" host_patch_uuid="%s" version="%s" pool_uuid="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    patchRecord["applied"],
                    patchRecord["filename"],
                    patchRecord["name_description"],
                    patchRecord["name_label"],
                    patchRecord["other_config"],
                    patchRecord["size"],
                    patchRecord["timestamp_applied"],
                    patchRecord["uuid"],
                    patchRecord["version"],
                    poolUuid
                  )

        if(patchRecord["host"] != "OpaqueRef:NULL"):
            out += ' host_uuid="%s"' % (xsUtils.xsSession.xenapi.host.get_uuid(patchRecord["host"]))
            out += ' hostname="%s"' % (xsUtils.xsSession.xenapi.host.get_hostname(patchRecord["host"]))

        if(patchRecord["pool_patch"] != "OpaqueRef:NULL"):
            out += ' pool_patch_uuid="%s"' % (xsUtils.xsSession.xenapi.pool_patch.get_uuid(patchRecord["pool_patch"]))

        print out
        

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
