#!/usr/bin/env python

# Splunk for XenServer
# Gets all the VBDs (Virtual Block Devices) in the pool

import time
import XenAPI
import xsUtils

try:
    vbds = xsUtils.xsSession.xenapi.VBD.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for vbd in vbds:
        vbdRecord = xsUtils.xsSession.xenapi.VBD.get_record(vbd)
                
        out = '%s - allowed_operations="%s" bootable="%s" current_operations="%s" currently_attached="%s" device="%s" empty="%s" mode="%s" other_config="%s" qos_algorithm_params="%s" qos_algorithm_type="%s" \
qos_supported_algorithms="%s" runtime_properties="%s" status_code="%s" status_detail="%s" storage_lock="%s" type="%s" unpluggable="%s" userdevice="%s" vbd_uuid="%s" pool_uuid="%s"' % \
            (
                time.strftime("%Y-%m-%d %H:%M:%S"),
                vbdRecord["allowed_operations"],
                vbdRecord["bootable"],
                vbdRecord["current_operations"],
                vbdRecord["currently_attached"],
                vbdRecord["device"],
                vbdRecord["empty"],
                vbdRecord["mode"],
                vbdRecord["other_config"],
                vbdRecord["qos_algorithm_params"],
                vbdRecord["qos_algorithm_type"],
                vbdRecord["qos_supported_algorithms"],
                vbdRecord["runtime_properties"],
                vbdRecord["status_code"],
                vbdRecord["status_detail"],
                vbdRecord["storage_lock"],
                vbdRecord["type"],
                vbdRecord["unpluggable"],
                vbdRecord["userdevice"],
                vbdRecord["uuid"],
                poolUuid
            )

        try:
            if(vbdRecord["metrics"] != "OpaqueRef:NULL"):
                out += ' vbd_metrics_uuid="%s"' % (xsUtils.xsSession.xenapi.VBD_metrics.get_uuid(vbdRecord["metrics"]))
        except Exception, ex:
            import sys, traceback
            exc_type, exc_value, exc_traceback = sys.exc_info()
            xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))

        if(vbdRecord["VDI"] != "OpaqueRef:NULL"):
            out += ' vdi_uuid="%s"' % (xsUtils.xsSession.xenapi.VDI.get_uuid(vbdRecord["VDI"]))

        if(vbdRecord["VM"] != "OpaqueRef:NULL"):
            out += ' vm_uuid="%s"' % (xsUtils.xsSession.xenapi.VM.get_uuid(vbdRecord["VM"]))

        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
