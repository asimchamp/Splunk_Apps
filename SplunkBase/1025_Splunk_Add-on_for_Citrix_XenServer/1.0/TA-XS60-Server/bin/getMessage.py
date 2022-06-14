#!/usr/bin/env python

# Splunk for XenServer
# Gets all messages in the pool

import time
import XenAPI
import xsUtils
import xmlrpclib

try:
    # Get messages starting 5 minutes ago
    messages = xsUtils.xsSession.xenapi.message.get_since(xmlrpclib.DateTime(time.gmtime(time.time()-300)))
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)    

    for message in messages:
        messageRecord = xsUtils.xsSession.xenapi.message.get_record(message)

        out = '%s - body="%s" cls="%s" name="%s" obj_uuid="%s" pool_uuid="%s" priority="%s" timestamp="%s" message_uuid="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    messageRecord["body"],
                    messageRecord["cls"],
                    messageRecord["name"],
                    messageRecord["obj_uuid"],
                    poolUuid,
                    messageRecord["priority"],
                    messageRecord["timestamp"],
                    messageRecord["uuid"]
                  )

        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
    print ex
