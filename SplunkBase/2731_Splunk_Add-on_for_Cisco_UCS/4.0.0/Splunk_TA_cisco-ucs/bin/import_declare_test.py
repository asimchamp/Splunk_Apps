#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-1-2020
#
#
"""
This module is used to filter and reload PATH.
This file is genrated by Splunk add-on builder
"""
import os
import sys

sys.path.insert(0, os.path.sep.join([os.path.dirname(os.path.realpath(os.path.dirname(__file__))), 'lib']))