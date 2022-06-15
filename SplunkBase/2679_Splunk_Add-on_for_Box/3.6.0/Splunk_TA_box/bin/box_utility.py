#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#

import logging
import traceback
import urllib.parse

from solnlib import conf_manager

_LOGGER = logging.getLogger("ta_box")


def get_sslconfig(session_key, disable_ssl_certificate_validation):
    app = "Splunk_TA_box"
    conf_name = "splunk_ta_box_settings"
    session_key = urllib.parse.unquote(session_key.encode("ascii").decode("ascii"))
    session_key = session_key.encode().decode("utf-8")
    try:
        # Default value will be used for ca_certs_path if there is any error
        sslconfig = False
        ca_certs_path = ""
        cfm = conf_manager.ConfManager(
            session_key,
            app,
            realm="__REST_CREDENTIAL__#{}#configs/conf-{}".format(app, conf_name),
        )
        ca_certs_path = (
            cfm.get_conf(conf_name, refresh=True)
            .get("additional_parameters")
            .get("ca_certs_path")
            or ""
        ).strip()

    except Exception:
        msg = f"Error while fetching ca_certs_path from '{conf_name}' conf. Traceback: {traceback.format_exc()}"
        _LOGGER.error(msg)

    if disable_ssl_certificate_validation is False:
        if ca_certs_path != "":
            sslconfig = ca_certs_path
        else:
            sslconfig = True

    return sslconfig
