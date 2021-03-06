#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-1-2020
#
#
import urllib.parse
import json
import logging
from traceback import format_exc

import httplib2
import ta_util2.log_files as log_files
import ta_util2.utils as utils

_LOGGER = logging.getLogger(log_files.splunk_ta_cisco_ucs_ta_util)


def splunkd_request(splunkd_uri, session_key, method="GET",
                    headers=None, data=None, timeout=30, retry=1):
    """
    @return: httplib2.Response and content
    """

    headers = headers if headers is not None else {}
    headers["Authorization"] = "Splunk {0}".format(session_key)
    content_type = headers.get("Content-Type")
    if not content_type:
        content_type = headers.get("content-type")

    if not content_type:
        content_type = "application/x-www-form-urlencoded"
        headers["Content-Type"] = content_type

    if data is not None:
        if content_type == "application/json":
            data = json.dumps(data)
        else:
            data = urllib.parse.urlencode(data)

    http = httplib2.Http(
        timeout=timeout, disable_ssl_certificate_validation=True)
    msg_temp = "Failed to send rest request=%s, errcode=%s, reason=%s"
    resp, content = None, None
    for _ in range(retry):
        try:
            resp, content = http.request(splunkd_uri, method=method,
                                         headers=headers, body=data)
            if content:
                content = content.decode()
        except Exception:
            _LOGGER.error(msg_temp, splunkd_uri, "unknown", format_exc())
        else:
            if resp.status not in (200, 201):
                _LOGGER.debug(msg_temp, splunkd_uri, resp.status,
                              code_to_msg(resp, content))
            else:
                return resp, content
    return resp, content


def code_to_msg(resp, content):
    code_msg_tbl = {
        400: "Request error. reason={}".format(content),
        401: "Authentication failure, invalid access credentials.",
        402: "In-use license disables this feature.",
        403: "Insufficient permission.",
        404: "Requested endpoint does not exist.",
        409: "Invalid operation for this endpoint. reason={}".format(content),
        500: "Unspecified internal server error. reason={}".format(content),
        503: ("Feature is disabled in the configuration file. "
              "reason={}").format(content),
    }

    return code_msg_tbl.get(resp.status, content)

def build_http_connection(config, timeout=120):
    """
    @config: dict like, proxy and account information are in the following
             format {
                 "username": xx,
                 "password": yy,
                 "proxy_url": zz,
                 "proxy_port": aa,
                 "proxy_username": bb,
                 "proxy_password": cc,
             }
    @return: Http2.Http object
    """

    proxy_info = None
    if config.get("proxy_url") and config.get("proxy_port"):
        if config.get("proxy_username") and config.get("proxy_password"):
            proxy_info = httplib2.ProxyInfo(
                proxy_type=httplib2.socks.PROXY_TYPE_HTTP,
                proxy_host=config["proxy_url"],
                proxy_port=config["proxy_port"],
                proxy_user=config["proxy_username"],
                proxy_pass=config["proxy_password"])
        else:
            proxy_info = httplib2.ProxyInfo(
                proxy_type=httplib2.socks.PROXY_TYPE_HTTP,
                proxy_host=config["proxy_url"],
                proxy_port=config["proxy_port"])
    http = httplib2.Http(proxy_info=proxy_info, timeout=timeout,
                         disable_ssl_certificate_validation=utils.is_true(config.get("disable_ssl_verification",False)))
    if config.get("username") and config.get("password"):
        http.add_credentials(config["username"], config["password"])
    return http
