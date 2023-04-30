#!/usr/bin/env python

# Splunk for XenServer
# Gets the SMs (Storage Manager plugins) in the pool

import time
import XenAPI
import xsUtils

try:
    sms = xsUtils.xsSession.xenapi.SM.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for sm in sms:
        smRecord = xsUtils.xsSession.xenapi.SM.get_record(sm)

        out = '%s - capabilities="%s" configuration="%s" copyright="%s" driver_filename="%s" name_description="%s" name_label="%s" other_config="%s" pool_uuid="%s" required_api_version="%s" type="%s" sm_uuid="%s" \
vendor="%s" version="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    smRecord["capabilities"],
                    smRecord["configuration"],
                    smRecord["copyright"],
                    smRecord["driver_filename"],
                    smRecord["name_description"],
                    smRecord["name_label"],
                    smRecord["other_config"],
                    poolUuid,
                    smRecord["required_api_version"],
                    smRecord["type"],
                    smRecord["uuid"],
                    smRecord["vendor"],
                    smRecord["version"]
                  )

        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
