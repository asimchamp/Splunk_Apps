#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#
import logging
import os.path as op
from datetime import datetime, timedelta

from framework import utils
from solnlib.file_monitor import FileChangesChecker

_LOGGER = logging.getLogger("ta_box")


class BoxConfig:
    """
    Handles box related config, password encryption/decryption
    """

    host_user_passwds = (
        ("url", "client_id", "client_secret"),
        ("restapi_base", "refresh_token", "access_token"),
        ("proxy_url", "proxy_username", "proxy_password"),
    )
    encrypted = "<encrypted>"
    # semgrep ignore reason: no hardcoded password here
    username_password_sep = "``"  # nosemgrep: gitlab.bandit.B105
    dummy = "dummy"

    def __init__(self):
        self.meta_configs = None
        self.stanza_configs = None
        self.default_configs = None

    @staticmethod
    def _get_datetime(when):
        quarter_ago = datetime.utcnow() - timedelta(days=90)
        quarter_ago = datetime.strftime(quarter_ago, "%Y-%m-%dT%H:%M:%S")
        if not when:
            return quarter_ago

        try:
            datetime.strptime(when, "%Y-%m-%dT%H:%M:%S")
        except ValueError:
            _LOGGER.warn(
                "{} is in bad format. Expect YYYY-MM-DDTHH:mm:ss. "
                "Collecting data starting from 90 days ago.".format(when)
            )
            return quarter_ago
        return when

    @staticmethod
    def _is_credential_section(section, option):
        encrypted = {
            "box_account": (
                "client_id",
                "client_secret",
                "refresh_token",
                "access_token",
            ),
            "box_proxy": ("proxy_username", "proxy_password"),
        }
        if section in encrypted and option in encrypted[section]:
            return True
        return False


class BoxConfMonitor(FileChangesChecker):
    def __init__(self, callback):
        super(BoxConfMonitor, self).__init__(callback, self.files())

    def files(self):
        app_dir = op.dirname(op.dirname(op.abspath(__file__)))
        return (
            op.join(app_dir, "local", "inputs.conf"),
            op.join(app_dir, "default", "inputs.conf"),
            op.join(app_dir, "local", "box.conf"),
            op.join(app_dir, "default", "box.conf"),
            op.join(app_dir, "bin", "framework", "setting.conf"),
            op.join(app_dir, "default", "splunk_ta_box_account.conf"),
            op.join(app_dir, "local", "splunk_ta_box_account.conf"),
            op.join(app_dir, "default", "splunk_ta_box_settings.conf"),
            op.join(app_dir, "local", "splunk_ta_box_settings.conf"),
        )


def handle_ckpts(client_id, meta_configs):
    import glob
    import json

    from framework import state_store as ss

    cur_dir = op.dirname(op.abspath(__file__))
    modinput = op.join(cur_dir, ".modinput")
    if not op.exists(modinput):
        with open(  # nosemgrep: python.lang.best-practice.unspecified-open-encoding.unspecified-open-encoding
            modinput, "w"
        ) as f:
            f.write(json.dumps({"id": client_id}))
        return

    with open(  # nosemgrep: python.lang.best-practice.unspecified-open-encoding.unspecified-open-encoding
        modinput
    ) as f:
        prev_client_id = json.load(f)["id"]

    if prev_client_id != client_id:
        with open(  # nosemgrep: python.lang.best-practice.unspecified-open-encoding.unspecified-open-encoding
            modinput, "w"
        ) as f:
            f.write(json.dumps({"id": client_id}))

        _LOGGER.warn("Box account has been changed. Remove previous ckpts.")
        ckpt_files = glob.glob(op.join(meta_configs["checkpoint_dir"], "*"))
        store = ss.StateStore(meta_configs, utils.get_appname_from_path(cur_dir))
        for ckpt in ckpt_files:
            store.delete_state(ckpt)
