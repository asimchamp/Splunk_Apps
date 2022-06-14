#!/usr/bin/env python

# Splunk for XenServer
# Gets all host CPUs in the pool

import time
import XenAPI
import xsUtils

try:
    hostCPUs = xsUtils.xsSession.xenapi.host_cpu.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for cpu in hostCPUs:
        cpuRecord = xsUtils.xsSession.xenapi.host_cpu.get_record(cpu)

        out = '%s - family="%s" features="%s" flags="%s" model="%s" modelname="%s" number="%s" other_config="%s" speed="%s" stepping="%s" utilisation="%s" host_cpu_uuid="%s" vendor="%s" pool_uuid="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    cpuRecord["family"],
                    cpuRecord["features"],
                    cpuRecord["flags"],
                    cpuRecord["model"],
                    cpuRecord["modelname"],
                    cpuRecord["number"],
                    cpuRecord["other_config"],
                    cpuRecord["speed"],
                    cpuRecord["stepping"],
                    cpuRecord["utilisation"],
                    cpuRecord["uuid"],
                    cpuRecord["vendor"],
                    poolUuid
                  )

        if(cpuRecord["host"] != "OpaqueRef:NULL"):
            out += ' host_uuid="%s"' % (xsUtils.xsSession.xenapi.host.get_uuid(cpuRecord["host"]))
            out += ' hostname="%s"' % (xsUtils.xsSession.xenapi.host.get_hostname(cpuRecord["host"]))

        print out
        

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
