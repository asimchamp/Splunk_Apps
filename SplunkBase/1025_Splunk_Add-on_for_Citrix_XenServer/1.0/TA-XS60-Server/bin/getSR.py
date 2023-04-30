#!/usr/bin/env python

# Splunk for XenServer
# Gets the SRs (Storage Repositories) in the pool

import time
import XenAPI
import xsUtils

try:
    srs = xsUtils.xsSession.xenapi.SR.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for sr in srs:
        srRecord = xsUtils.xsSession.xenapi.SR.get_record(sr)

        out = '%s - content_type="%s" name_description="%s" name_label="%s" physical_size="%s" \
physical_utilisation="%s" pool_uuid="%s" shared="%s" sr_uuid="%s" virtual_allocation="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    srRecord["content_type"],
                    srRecord["name_description"],
                    srRecord["name_label"],
                    srRecord["physical_size"],
                    srRecord["physical_utilisation"],
                    poolUuid,
                    srRecord["shared"],
                    srRecord["uuid"],
                    srRecord["virtual_allocation"]
                  )
        
        if(srRecord["shared"] and srRecord["other_config"]["XenCenter.CustomFields.vol_name"]):
            out += " vol_name=%s" % (srRecord["other_config"]["XenCenter.CustomFields.vol_name"])

        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
