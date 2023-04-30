#!/usr/bin/env python

# Splunk for XenServer
# Gets all hosts in the pool

import time
import XenAPI
import xsUtils

try:
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool) 
    hosts = xsUtils.xsSession.xenapi.host.get_all()

    for host in hosts:
        hostRecord = xsUtils.xsSession.xenapi.host.get_record(host)

        out = '%s - address="%s" edition="%s" enabled="%s" \
 hostname="%s" memory_overhead="%s" name_description="%s" name_label="%s"\
 pool_uuid="%s" product="%s" product_version="%s" host_uuid="%s" vendor="Citrix"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    hostRecord["address"],
                    hostRecord["edition"],
                    hostRecord["enabled"],
                    hostRecord["hostname"],
                    hostRecord["memory_overhead"],
                    hostRecord["name_description"],
                    hostRecord["name_label"],
                    poolUuid,
                    hostRecord["software_version"]["product_brand"],
                    hostRecord["software_version"]["product_version_text"],
                    hostRecord["uuid"]
                  )

        try:
            if(hostRecord["metrics"] != "OpaqueRef:NULL"):
                out += ' metrics_uuid="%s"' % (xsUtils.xsSession.xenapi.host_metrics.get_uuid(hostRecord["metrics"]))
                out += ' memory_total="%s"' % (xsUtils.xsSession.xenapi.host_metrics.get_memory_total(hostRecord["metrics"]))
                
        except Exception, ex:
            import sys, traceback
            exc_type, exc_value, exc_traceback = sys.exc_info()
            xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
            traceback.print_exception(exc_type, exc_value, exc_traceback)
                
        try:
            if(hostRecord["PIFs"] != "OpaqueRef:NULL"):
                for pif in hostRecord["PIFs"]:
                    pifRecord = xsUtils.xsSession.xenapi.PIF.get_record(pif);
                    device = 'dvc%s' % (pifRecord["device"].lstrip("eth"))
                    out += ' %s_ip="%s"' % (device, pifRecord["IP"]);
                    out += ' %s_ip_gateway="%s"' % (device, pifRecord["gateway"]);
                    out += ' %s_ip_netmask="%s"' % (device, pifRecord["netmask"]);
                    out += ' %s_ip_mode="%s"' % (device, pifRecord["ip_configuration_mode"]);
                    out += ' %s_mac="%s"' % (device, pifRecord["MAC"]);

        except Exception, ex:
            import sys, traceback
            exc_type, exc_value, exc_traceback = sys.exc_info()
            xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
            traceback.print_exception(exc_type, exc_value, exc_traceback)

        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
    traceback.print_exception(exc_type, exc_value, exc_traceback)
