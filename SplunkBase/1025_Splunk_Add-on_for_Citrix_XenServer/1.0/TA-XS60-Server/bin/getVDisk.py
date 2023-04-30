#!/usr/bin/env python

# Splunk for XenServer
# Gets all the virtual disks in the pool

import time
import XenAPI
import xsUtils
import re

try:
    vbds = xsUtils.xsSession.xenapi.VBD.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for vbd in vbds:
        vbdRecord = xsUtils.xsSession.xenapi.VBD.get_record(vbd)
                
        out = '%s - pool_uuid="%s"' % \
            (
                time.strftime("%Y-%m-%d %H:%M:%S"),
                poolUuid
            )

        # Get the VM for the virtual block device (VBD)
        try:
            if(vbdRecord["VM"] != "OpaqueRef:NULL"):
                out += ' vm_name="%s" vm_id="%s"' % (xsUtils.xsSession.xenapi.VM.get_name_label(vbdRecord["VM"]), xsUtils.xsSession.xenapi.VM.get_uuid(vbdRecord["VM"]))
                
                # Get the virtual disk interface (VDI) for the VBD
                if(vbdRecord["VDI"] != "OpaqueRef:NULL"):
                
                    vdiRecord = xsUtils.xsSession.xenapi.VDI.get_record(vbdRecord["VDI"])
                
                    out += ' vdisk_name="%s" vdisk_id=%s vdisk_size=%s vdisk_util=%s' % \
                           (
                                vdiRecord["name_label"],
                                vdiRecord["uuid"],
                                str(vdiRecord["virtual_size"]),
                                str(vdiRecord["physical_utilisation"])
                            )

                    # Get the Storage Repository (SR) for the VDI
                    if(vdiRecord["SR"] != "OpaqueRef:NULL"):
                        
                        out += ' sr_uuid=%s' % (xsUtils.xsSession.xenapi.SR.get_uuid(vdiRecord["SR"]))
 
                    print out
                    
        except Exception, ex:
            import sys, traceback
            exc_type, exc_value, exc_traceback = sys.exc_info()
            xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
