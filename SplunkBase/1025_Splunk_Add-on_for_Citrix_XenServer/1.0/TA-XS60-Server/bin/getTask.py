#!/usr/bin/env python

# Splunk for XenServer
# Gets the Tasks (log-running asynchronous tasks) in the pool

import time
import XenAPI
import xsUtils

try:
    tasks = xsUtils.xsSession.xenapi.task.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for task in tasks:
        taskRecord = xsUtils.xsSession.xenapi.task.get_record(task)

        out = '%s - allowed_operations="%s" created="%s" current_operations="%s" error_info="%s" finished="%s" name_description="%s" name_label="%s" other_config="%s" pool_uuid="%s" progress="%s" result="%s" status="%s" \
type="%s" task_uuid="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    taskRecord["allowed_operations"],
                    taskRecord["created"],
                    taskRecord["current_operations"],
                    taskRecord["error_info"],
                    taskRecord["finished"],
                    taskRecord["name_description"],
                    taskRecord["name_label"],
                    taskRecord["other_config"],
                    poolUuid,
                    taskRecord["progress"],
                    taskRecord["result"],
                    taskRecord["status"],
                    taskRecord["type"],
                    taskRecord["uuid"]
                  )

        if(taskRecord["resident_on"] != "OpaqueRef:NULL"):
            out += ' resident_on_uuid="%s"' % (xsUtils.xsSession.xenapi.host.get_uuid(taskRecord["resident_on"]))
            out += ' resident_on_hostname="%s"' % (xsUtils.xsSession.xenapi.host.get_hostname(taskRecord["resident_on"]))

        if(taskRecord["subtask_of"] != "OpaqueRef:NULL"):
            out += ' subtask_of_uuid="%s"' % (xsUtils.xsSession.xenapi.task.get_uuid(taskRecord["subtask_of"]))

        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
