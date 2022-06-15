#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#
import os
import sys

sys.path.insert(0, os.path.sep.join([os.path.dirname(os.path.realpath(os.path.dirname(__file__))), 'lib']))

import http
import queue

assert 'Splunk_TA_jboss' not in http.__file__
assert 'Splunk_TA_jboss' not in queue.__file__