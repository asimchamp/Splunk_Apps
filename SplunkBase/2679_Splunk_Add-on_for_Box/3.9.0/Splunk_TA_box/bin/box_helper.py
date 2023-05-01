#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#
import logging

import requests
from box_client import BoxAPIError
from solnlib import conf_manager

RESPONSE_CODE_WISE_MSG = {
    requests.codes.UNAUTHORIZED: "Authentication failed",  # pylint: disable=E1101
    requests.codes.NOT_FOUND: "URL Not Found",  # pylint: disable=E1101
}

_LOGGER = logging.getLogger("ta_box_live_monitor")
APP_NAME = "Splunk_TA_box"


def get_proxy_logging_config(session_key):

    settings_cfm = conf_manager.ConfManager(
        session_key,
        APP_NAME,
        realm="__REST_CREDENTIAL__#{}#configs/conf-splunk_ta_box_settings".format(  # noqa: E501
            APP_NAME
        ),
    )

    splunk_ta_box_settings_conf = settings_cfm.get_conf(
        "splunk_ta_box_settings"
    ).get_all()

    return splunk_ta_box_settings_conf["proxy"], splunk_ta_box_settings_conf["logging"]


def get_box_config(session_key):

    box_cfm = conf_manager.ConfManager(
        session_key,
        APP_NAME,
        realm="__REST_CREDENTIAL__#{}#configs/conf-box".format(APP_NAME),
    )

    splunk_ta_box_conf = box_cfm.get_conf("box").get_all()

    return splunk_ta_box_conf["box_default"]


def fetch_data(client, uri):
    try:
        status, data = client.make_request(uri)
    except BoxAPIError as ex:
        msg = "Failed to connect url={}, message={}, status={}, code={}, context_info={}".format(  # noqa: E501
            uri,
            ex.message,
            ex.status,
            ex.code,
            ex.context_info,
        )
        _LOGGER.error(msg)
        raise Exception(msg)

    if status in (200, 201):
        return data

    temp_err_msg = RESPONSE_CODE_WISE_MSG.get(status, "Error occured")
    msg = (
        "{msg}, status_code={status},"
        " url='{uri}', response={response}".format(  # noqa: E501
            msg=temp_err_msg,
            status=status,
            uri=uri,
            response=data.text,
        )
    )
    _LOGGER.error(msg)
    raise Exception(msg)


def fetch_account_id_uri(params):

    return "".join((params["restapi_base"], "/users/me"))


def fetch_stream_event_uri(params):

    args = (
        "?stream_type=admin_logs_streaming&limit={}&stream_position={}"
    ).format(  # noqa: E501
        params["record_count"], params["stream_position"]
    )

    uri = "".join((params["restapi_base"], "/events", args))

    return uri
