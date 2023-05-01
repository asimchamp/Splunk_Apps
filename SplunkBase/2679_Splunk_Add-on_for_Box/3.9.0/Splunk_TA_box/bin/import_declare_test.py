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
HISTORICAL_EVENTS_CHECKPOINTER = "Splunk_TA_box_historical_events_checkpointer"
HISTORICAL_FOLDERS_CHECKPOINTER = "Splunk_TA_box_historical_folders_checkpointer"
HISTORICAL_GROUPS_CHECKPOINTER = "Splunk_TA_box_historical_groups_checkpointer"
HISTORICAL_USERS_CHECKPOINTER = "Splunk_TA_box_historical_users_checkpointer"
LIVE_MONITORING_EVENTS_CHECKPOINTER = (
    "Splunk_TA_box_live_monitoring_events_checkpointer"
)
COLLECTION_VALUE_FROM_ENDPOINT = {
    "events": "Splunk_TA_box_historical_events_checkpointer",
    "folders": "Splunk_TA_box_historical_folders_checkpointer",
    "groups": "Splunk_TA_box_historical_groups_checkpointer",
    "users": "Splunk_TA_box_historical_users_checkpointer",
}


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
