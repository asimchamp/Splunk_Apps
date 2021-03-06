#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#

import ta_util2.log_files as log_files
import ta_util2.utils as utils


def setup_logging_for_frmk(loglevel="INFO", refresh=False):
    for f in log_files.get_all_logs():
        utils.setup_logging(f, loglevel, refresh)


setup_logging_for_frmk()
