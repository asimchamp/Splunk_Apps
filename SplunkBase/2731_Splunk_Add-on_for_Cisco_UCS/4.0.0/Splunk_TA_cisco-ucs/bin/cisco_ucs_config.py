#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-1-2020
#
#
import os.path as op
import logging
import traceback

import splunk_ta_cisco_ucs_constants as constants


_LOGGER = logging.getLogger("splunk_ta_cisco_ucs")


class CiscoUcsConfMonitor:
    def __init__(self, callback):
        self._callback = callback
        app_dir = op.dirname(op.dirname(op.abspath(__file__)))
        conf_files = {
            op.join(app_dir, "local", "inputs.conf"): None,
            op.join(app_dir, "default", "inputs.conf"): None,
			op.join(app_dir, "local", "{}.conf".format(constants.SERVERS_CONF)): None,
            op.join(app_dir, "local", "{}.conf".format(constants.TEMPLATES_CONF)): None,
            op.join(app_dir, "default", "{}.conf".format(constants.TEMPLATES_CONF)): None,
            op.join(app_dir, "local", "{}.conf".format(constants.SETTINGS_CONF_FILE)): None,
            op.join(app_dir, "local", ".signal"): None
        }

        for k in conf_files:
            try:
                if op.isfile(k):
                    conf_files[k] = op.getmtime(k)
            except OSError:
                _LOGGER.error("Failure occurred while reading modified time of the conf file '{0}'. The reason for "
                              "failure is: {1}. Contact Splunk administrator for further information.",
                              k, traceback.format_exc())
        self.conf_files = conf_files

    def check_changes(self):
        conf_files = self.conf_files
        changed_files = []
        for f, last_mtime in conf_files.items():
            try:
                current_mtime = op.getmtime(f)
                if current_mtime != last_mtime:
                    conf_files[f] = current_mtime
                    changed_files.append(f)
                    _LOGGER.info("Detect %s has changed", f)
            except OSError:
                pass

        if changed_files:
            if self._callback:
                self._callback(changed_files)
            return True
        return False