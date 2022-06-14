#!/usr/bin/env python

# Splunk for XenServer
# Gets all PIFs (Physical Interfaces) in the pool

import time
import XenAPI
import xsUtils

try:
    pifs = xsUtils.xsSession.xenapi.PIF.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for pif in pifs:
        pifRecord = xsUtils.xsSession.xenapi.PIF.get_record(pif)

        out = '%s - currently_attached="%s" device="%s" disallow_unplug="%s" dns="%s" gateway="%s" ip="%s" ip_configuration_mode="%s" mac="%s" management="%s" mtu="%s" netmask="%s" other_config="%s" \
physical="%s" pif_uuid="%s" vlan="%s" pool_uuid="%s"' % \
                  (
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    pifRecord["currently_attached"],
                    pifRecord["device"],
                    pifRecord["disallow_unplug"],
                    pifRecord["DNS"],
                    pifRecord["gateway"],
                    pifRecord["IP"],
                    pifRecord["ip_configuration_mode"],
                    pifRecord["MAC"],
                    pifRecord["management"],
                    pifRecord["MTU"],
                    pifRecord["netmask"],
                    pifRecord["other_config"],
                    pifRecord["physical"],
                    pifRecord["uuid"],
                    pifRecord["VLAN"],
                    poolUuid
                  )

        if(pifRecord["bond_slave_of"] != "OpaqueRef:NULL"):
            out += ' bond_slave_of_uuid="%s"' % (xsUtils.xsSession.xenapi.Bond.get_uuid(pifRecord["bond_slave_of"]))

        if(pifRecord["host"] != "OpaqueRef:NULL"):
            out += ' host_uuid="%s"' % (xsUtils.xsSession.xenapi.host.get_uuid(pifRecord["host"]))
            out += ' hostname="%s"' % (xsUtils.xsSession.xenapi.host.get_hostname(pifRecord["host"]))

        if(pifRecord["metrics"] != "OpaqueRef:NULL"):
            out += ' pif_metrics_uuid="%s"' % (xsUtils.xsSession.xenapi.PIF_metrics.get_uuid(pifRecord["metrics"]))

        if(pifRecord["network"] != "OpaqueRef:NULL"):
            out += ' network_uuid="%s"' % (xsUtils.xsSession.xenapi.network.get_uuid(pifRecord["network"]))

        if(pifRecord["VLAN_master_of"] != "OpaqueRef:NULL"):
            out += ' vlan_master_of_uuid="%s"' % (xsUtils.xsSession.xenapi.VLAN.get_uuid(pifRecord["VLAN_master_of"]))

        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
