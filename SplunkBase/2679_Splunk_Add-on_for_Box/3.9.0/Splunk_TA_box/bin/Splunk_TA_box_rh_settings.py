#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#
import import_declare_test  # isort: skip # noqa F401

import logging

from Splunk_TA_box_rh_proxy_validation import ProxyValidation
from splunktaucclib.rest_handler import admin_external, util
from splunktaucclib.rest_handler.admin_external import AdminExternalHandler
from splunktaucclib.rest_handler.endpoint import (
    MultipleModel,
    RestModel,
    field,
    validator,
)

util.remove_http_proxy_env_vars()


fields_proxy = [
    field.RestField(
        "proxy_enabled",
        required=False,
        encrypted=False,
        default=None,
        validator=None,
    ),
    field.RestField(
        "proxy_type",
        required=False,
        encrypted=False,
        default="http",
        validator=None,
    ),
    field.RestField(
        "proxy_url",
        required=False,
        encrypted=False,
        default=None,
        validator=validator.String(
            min_len=0,
            max_len=4096,
        ),
    ),
    field.RestField(
        "proxy_port",
        required=False,
        encrypted=False,
        default=None,
        validator=validator.Number(
            min_val=1,
            max_val=65535,
        ),
    ),
    field.RestField(
        "proxy_username",
        required=False,
        encrypted=False,
        default=None,
        validator=ProxyValidation(),
    ),
    field.RestField(
        "proxy_password",
        required=False,
        encrypted=True,
        default=None,
        validator=ProxyValidation(),
    ),
    field.RestField(
        "proxy_rdns",
        required=False,
        encrypted=False,
        default=None,
        validator=None,
    ),
]
model_proxy = RestModel(fields_proxy, name="proxy")


fields_logging = [
    field.RestField(
        "loglevel",
        required=True,
        encrypted=False,
        default="INFO",
        validator=None,
    )
]
fields_additional_parameters = [
    field.RestField(
        "ca_certs_path",
        required=False,
        encrypted=False,
        default="",
        validator=None,
    ),
]
model_logging = RestModel(fields_logging, name="logging")
model_additional_parameters = RestModel(
    fields_additional_parameters, name="additional_parameters"
)

endpoint = MultipleModel(
    "splunk_ta_box_settings",
    models=[
        model_proxy,
        model_logging,
        model_additional_parameters,
    ],
)


if __name__ == "__main__":
    logging.getLogger().addHandler(logging.NullHandler())
    admin_external.handle(
        endpoint,
        handler=AdminExternalHandler,
    )
