#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#
import enum
import http
import os
import queue
import sys

bin_path = None
ta_name = "Splunk_TA_box"


sys.path.insert(0, os.path.sep.join([os.path.dirname(__file__), "framework"]))
sys.path.insert(
    0,
    os.path.sep.join(
        [os.path.dirname(os.path.realpath(os.path.dirname(__file__))), "lib"]
    ),
)

import requests  # noqa: E402

assert "Splunk_TA_box" in requests.__file__  # nosemgrep: gitlab.bandit.B101
assert "Splunk_TA_box" not in http.__file__  # nosemgrep: gitlab.bandit.B101
assert "Splunk_TA_box" not in queue.__file__  # nosemgrep: gitlab.bandit.B101
assert "Splunk_TA_box" not in enum.__file__  # nosemgrep: gitlab.bandit.B101
