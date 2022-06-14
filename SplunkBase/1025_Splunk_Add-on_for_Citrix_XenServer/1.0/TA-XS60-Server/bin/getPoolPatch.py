#!/usr/bin/env python

# Splunk for XenServer
# Gets the Pool Patches

import time
import XenAPI
import xsUtils

try:
    poolPatches = xsUtils.xsSession.xenapi.pool_patch.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for poolPatch in poolPatches:
        patchRecord = xsUtils.xsSession.xenapi.pool_patch.get_record(poolPatch)

        out = '%s - after_apply_guidance="%s" filename="%s" name_description="%s" name_label="%s" other_config="%s" pool_uuid="%s" pool_applied="%s" size="%s" pool_patch_uuid="%s" version="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    patchRecord["after_apply_guidance"],
                    patchRecord["filename"],
                    patchRecord["name_description"],
                    patchRecord["name_label"],
                    patchRecord["othr_config"],
                    poolUuid,
                    patchRecord["pool_applied"],
                    patchRecord["size"],
                    patchRecord["uuid"],
                    patchRecord["version"]
                  )

        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
