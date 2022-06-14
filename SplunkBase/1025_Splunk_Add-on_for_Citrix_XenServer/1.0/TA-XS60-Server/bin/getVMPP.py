#!/usr/bin/env python

# Splunk for XenServer
# Gets all the VMPPs (VM Protection Policies) in the pool

import time
import XenAPI
import xsUtils

try:
    vmPPs = xsUtils.xsSession.xenapi.VMPP.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for vmPP in vmPPs:
        vmPPRecord = xsUtils.xsSession.xenapi.VMPP.get_record(vmPP)
                
        out = '%s - alarm_config="%s" archive_frequency="%s" archive_last_run_time="%s" archive_schedule="%s" archive_target_config="%s" archive_target_type="%s" backup_frequency="%s" backup_last_run_time="%s" \
backup_retention_value="%s" backup_schedule="%s" backup_type="%s" is_alarm_enabled="%s" is_archive_running="%s" is_backup_running="%s" is_policy_enabled="%s" name_description="%s" name_label=%s" recent_alerts="%s \
vmpp_uuid="%s"" pool_uuid="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    vmPPRecord["alarm_config"],
                    vmPPRecord["archive_frequency"],
                    vmPPRecord["archive_last_run"],
                    vmPPRecord["archive_schedule"],
                    vmPPRecord["archive_target_config"],
                    vmPPRecord["archive_target_type"],
                    vmPPRecord["backup_frequency"],
                    vmPPRecord["backup_last_run_time"],
                    vmPPRecord["backup_retention_value"],
                    vmPPRecord["backup_schedule"],
                    vmPPRecord["backup_type"],
                    vmPPRecord["is_alarm_enabled"],
                    vmPPRecord["is_archive_running"],
                    vmPPRecord["is_backup_running"],
                    vmPPRecord["is_policy_enabled"],
                    vmPPRecord["name_description"],
                    vmPPRecord["namme_label"],
                    vmPPRecord["recent_alerts"],
                    vmPPRecord["uuid"],
                    poolUuid
                  )

        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
