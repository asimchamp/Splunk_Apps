#!/usr/bin/env python

# Splunk for XenServer
# Gets all the VDIs (Virtual Disk Interfaces) in the pool

import time
import XenAPI
import xsUtils

try:
    vdis = xsUtils.xsSession.xenapi.VDI.get_all()
    pool = xsUtils.xsSession.xenapi.pool.get_all()[0]
    poolUuid = xsUtils.xsSession.xenapi.pool.get_uuid(pool)

    for vdi in vdis:
        vdiRecord = xsUtils.xsSession.xenapi.VDI.get_record(vdi)
                
        out = '%s - allow_caching="%s" allowed_operations="%s" current_operations="%s" is_a_snapshot="%s" location="%s" managed="%s" missing="%s" name_description="%s" name_label="%s" on_boot="%s" other_config="%s" \
physical_utilisation="%s" read_only="%s" sharable="%s" sm_config="%s" snapshot_time="%s" storage_lock="%s" tags="%s" type="%s" vdi_uuid="%s" virtual_size="%s" xenstore_data="%s" pool_uuid="%s"' % \
            (
                time.strftime("%Y-%m-%d %H:%M:%S"),
                vdiRecord["allow_caching"],
                vdiRecord["allowed_operations"],
                vdiRecord["current_operations"],
                vdiRecord["is_a_snapshot"],
                vdiRecord["location"],
                vdiRecord["managed"],
                vdiRecord["missing"],
                vdiRecord["name_description"],
                vdiRecord["name_label"],
                vdiRecord["on_boot"],
                vdiRecord["other_config"],
                vdiRecord["physical_utilisation"],
                vdiRecord["read_only"],
                vdiRecord["sharable"],
                vdiRecord["sm_config"],
                vdiRecord["snapshot_time"],
                vdiRecord["storage_lock"],
                vdiRecord["tags"],
                vdiRecord["type"],
                vdiRecord["uuid"],
                vdiRecord["virtual_size"],
                vdiRecord["xenstore_data"],
                poolUuid
            )

        if(vdiRecord["parent"] != "OpaqueRef:NULL"):
            out += ' parent_uuid="%s"' % (xsUtils.xsSession.xenapi.VDI.get_uuid(vdiRecord["parent"]))

        if(vdiRecord["snapshot_of"] != "OpaqueRef:NULL"):
            out += ' snapshot_of_uuid="%s"' % (xsUtils.xsSession.xenapi.VDI.get_uuid(vdiRecord["snapshot_of"]))

        if(vdiRecord["SR"] != "OpaqueRef:NULL"):
            out += ' sr_uuid="%s"' % (xsUtils.xsSession.xenapi.SR.get_uuid(vdiRecord["SR"]))

        print out

except Exception, ex:
    import sys, traceback
    exc_type, exc_value, exc_traceback = sys.exc_info()
    xsUtils.xsLog.error(traceback.format_exception(exc_type, exc_value, exc_traceback))
