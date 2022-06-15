#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#

import import_declare_test  # isort: skip # noqa: F401
import logging
from datetime import datetime, timedelta

import state_store as ss
from solnlib import utils
from solnlib.splunkenv import make_splunkhome_path
from Splunk_TA_box_input_validation import DateValidator
from splunktaucclib.rest_handler import admin_external, util
from splunktaucclib.rest_handler.admin_external import AdminExternalHandler
from splunktaucclib.rest_handler.endpoint import (
    DataInputModel,
    RestModel,
    field,
    validator,
)

util.remove_http_proxy_env_vars()

fields = [
    field.RestField(
        "input_name",
        encrypted=False,
        default=None,
        validator=validator.Pattern(
            regex=r"""^([a-zA-Z]\w*)$""",
        ),
    ),
    field.RestField(
        "account", required=True, encrypted=False, default=None, validator=None
    ),
    field.RestField(
        "rest_endpoint",
        required=False,
        encrypted=False,
        default="events",
        validator=None,
    ),
    field.RestField(
        "collect_folder", required=False, encrypted=False, default=1, validator=None
    ),
    field.RestField(
        "collect_collaboration",
        required=False,
        encrypted=False,
        default=1,
        validator=None,
    ),
    field.RestField(
        "collect_file", required=False, encrypted=False, default=1, validator=None
    ),
    field.RestField(
        "collect_task", required=False, encrypted=False, default=1, validator=None
    ),
    field.RestField(
        "created_after",
        required=False,
        encrypted=False,
        default=None,
        validator=DateValidator(),
    ),
    field.RestField(
        "duration",
        required=True,
        encrypted=False,
        default="120",
        validator=validator.Number(min_val=1, max_val=31536000, is_int=True),
    ),
    field.RestField(
        "index",
        required=True,
        encrypted=False,
        default="default",
        validator=validator.String(
            min_len=1,
            max_len=80,
        ),
    ),
    field.RestField(
        "folder_fields", required=False, encrypted=False, default=None, validator=None
    ),
    field.RestField(
        "file_fields", required=False, encrypted=False, default=None, validator=None
    ),
    field.RestField(
        "task_fields", required=False, encrypted=False, default=None, validator=None
    ),
    field.RestField(
        "comment_fields", required=False, encrypted=False, default=None, validator=None
    ),
    field.RestField(
        "user_fields", required=False, encrypted=False, default=None, validator=None
    ),
    field.RestField(
        "reuse_checkpoint",
        required=False,
        encrypted=False,
        default="no",
    ),
    field.RestField("disabled", required=False, validator=None),
    field.RestField(
        "event_delay",
        required=False,
        encrypted=False,
        default="0",
        validator=validator.Pattern(
            regex=r"""^[1-9]\d*$|^\d*$""",
        ),
    ),
]
model = RestModel(fields, name=None)


endpoint = DataInputModel(
    "box_service",
    model,
)


class BoxServiceHandler(AdminExternalHandler):
    """
    Manage Box Data Input Details.
    """

    def __init__(self, *args, **kwargs):
        AdminExternalHandler.__init__(self, *args, **kwargs)

    @staticmethod
    def get_session_key(self):
        return self.getSessionKey()

    # jscpd:ignore-start
    def deleteCheckpoint(self, input_name):
        session_key = self.get_session_key(self)
        appname = "Splunk_TA_box"
        metadata = {
            "checkpoint_dir": make_splunkhome_path(
                ["var", "lib", "splunk", "modinputs", "box_service"]
            ),
            "session_key": session_key,
        }
        state = ss.StateStore(metadata, appname)
        checkpoint_data = state.get_state(input_name)

        if checkpoint_data:
            state.delete_state(input_name)

    def updateTimestamp(self, input_name, timestamp):
        session_key = self.get_session_key(self)
        appname = "Splunk_TA_box"
        metadata = {
            "checkpoint_dir": make_splunkhome_path(
                ["var", "lib", "splunk", "modinputs", "box_service"]
            ),
            "session_key": session_key,
        }
        state = ss.StateStore(metadata, appname)
        checkpoint_data = state.get_state(input_name)
        if checkpoint_data:
            checkpoint_data["start_timestamp"] = timestamp
            state.update_state(input_name, checkpoint_data)

    # jscpd:ignore-end

    def handleList(self, confInfo):
        AdminExternalHandler.handleList(self, confInfo)
        # when input page reload if input is disabled, update start_timestamp to 0
        # which starts data collection when input is enabled
        for inputStanzaKey, inputStanzaValue in list(confInfo.items()):
            if utils.is_true(inputStanzaValue.get("disabled")):
                self.updateTimestamp(inputStanzaKey, 0)

    def checkCreatedAfter(self):
        quarter_ago = datetime.utcnow() - timedelta(days=90)
        quarter_ago = datetime.strftime(quarter_ago, "%Y-%m-%dT%H:%M:%S")

        # Check if created_after field is empty. If so, set its default value to 90 days ago so that it reflects on UI.
        if (
            not self.payload.get("created_after")
            and self.payload.get("rest_endpoint") == "events"
        ):
            self.payload["created_after"] = quarter_ago

    # jscpd:ignore-start
    def handleCreate(self, confInfo):
        disabled = self.payload.get("disabled")
        self.checkCreatedAfter()
        if disabled is None and self.payload.get("reuse_checkpoint") == "no":
            input_name = self.payload.get("input_name")
            reuse_checkpoint = self.payload.get("reuse_checkpoint")
            if reuse_checkpoint == "no":
                self.deleteCheckpoint(input_name)

        if "reuse_checkpoint" in self.payload:
            del self.payload["reuse_checkpoint"]
        AdminExternalHandler.handleCreate(self, confInfo)

    def handleEdit(self, confInfo):
        disabled = self.payload.get("disabled")
        self.checkCreatedAfter()
        # when input is disabled, update start_timestamp to 0
        # which starts data collection when input is enabled
        if utils.is_true(disabled):
            self.updateTimestamp(self.callerArgs.id, 0)
        if disabled is None and self.payload.get("reuse_checkpoint") == "no":
            input_name = self.payload.get("input_name")
            reuse_checkpoint = self.payload.get("reuse_checkpoint")
            if reuse_checkpoint == "no":
                self.deleteCheckpoint(input_name)
        # jscpd:ignore-end
        if "reuse_checkpoint" in self.payload:
            del self.payload["reuse_checkpoint"]
        AdminExternalHandler.handleEdit(self, confInfo)


if __name__ == "__main__":
    logging.getLogger().addHandler(logging.NullHandler())
    admin_external.handle(
        endpoint,
        handler=BoxServiceHandler,
    )
