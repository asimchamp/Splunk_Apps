#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-1-2020
#
#
splunk_ta_cisco_ucs = "splunk_ta_cisco_ucs"
splunk_ta_cisco_ucs_ta_util = "splunk_ta_cisco_ucs_ta_util"
splunk_ta_cisco_ucs_migration = "splunk_ta_cisco_ucs_migration"
splunk_ta_cisco_ucs_validation = "splunk_ta_cisco_ucs_validation"
splunk_ta_cisco_ucs_utility = "splunk_ta_cisco_ucs_utility"


def get_all_logs():
    g = globals()
    return [g[log] for log in g if log.startswith("splunk_ta_")]
