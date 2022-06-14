#!/usr/bin/env python

# Splunk for XenServer
# Gets the Subjects (user or group that can log in xapi) in the pool

import time
import XenAPI
import xsUtils

try:
    subjects = xsUtils.xsSession.xenapi.subject.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for subject in subjects:
        subjectRecord = xsUtils.xsSession.xenapi.subject.get_record(subject)

        out = '%s - other_config="%s" pool_uuid="%s" subject_identifier="%s" subject_uuid="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    subjectRecord["other_config"],
                    poolUuid,
                    subjectRecord["subject_identifier"],
                    subjectRecord["uuid"]
                  )

        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
