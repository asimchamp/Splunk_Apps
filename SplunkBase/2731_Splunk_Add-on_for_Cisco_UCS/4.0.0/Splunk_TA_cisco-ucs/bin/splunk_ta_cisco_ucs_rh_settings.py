#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-1-2020
#
#
import import_declare_test

from splunktaucclib.rest_handler.endpoint import (
    field,
    RestModel,
    MultipleModel,
)
from splunktaucclib.rest_handler import admin_external, util
from splunktaucclib.rest_handler.admin_external import AdminExternalHandler
import logging

util.remove_http_proxy_env_vars()


fields_logging = [
    field.RestField(
        "loglevel",
        required=True,
        encrypted=False,
        default="INFO",
        validator=None,
    )
]
model_logging = RestModel(fields_logging, name="logging")


endpoint = MultipleModel("splunk_ta_cisco_ucs_settings", models=[model_logging],)


if __name__ == "__main__":
    logging.getLogger().addHandler(logging.NullHandler())
    admin_external.handle(
        endpoint, handler=AdminExternalHandler,
    )
