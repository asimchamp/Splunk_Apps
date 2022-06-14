# Copyright (c) 2013, 2014 Splunk, Inc.  All rights reserved
# RelaxNG validator utility
#
# This script will validate every XML file found inside of the /etc/apps/IPFIX/local/information-elements directory
#
# See README.txt for setup information

import lxml.etree as et
import os
from splunk.appserver.mrsparkle.lib.util import make_splunkhome_path

FOLDER = make_splunkhome_path(['etc', 'apps', 'Splunk_TA_ipfix', 'local', 'information-elements'])

f = open('./ipfix.rng', 'r')
schema = et.parse(f)
relax = et.RelaxNG(schema)
f.close()

for root, dirs, files in os.walk(FOLDER):
    for name in files:
        if name.endswith('.xml'):
            print '=' * 80
            fullname = os.path.join(root, name).replace("\\", "/")
            print "Validating file: %s" % fullname
            f = open(fullname, 'r')
            root_node = et.parse(f)
            is_valid = relax.validate(root_node)
            if not is_valid:
                print "Validation error: %s" % name
                print str(relax.error_log).replace("file:///" + fullname + ":", "")
                print ''
            else:
                print "Valid file: %s" % name
            f.close()
