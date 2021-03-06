#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#

import json
import logging
import urllib.parse
from traceback import format_exc

import httplib2
import ta_util2.log_files as log_files
import ta_util2.utils as utils

_LOGGER = logging.getLogger(log_files.ta_util_rest)


def splunkd_request(
    splunkd_uri, session_key, method="GET", headers=None, data=None, timeout=30, retry=1
):
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

    http = httplib2.Http(timeout=timeout, disable_ssl_certificate_validation=True)
    msg_temp = "Failed to send rest request=%s, errcode=%s, reason=%s"
    resp, content = None, None
    for _ in range(retry):
        try:
            resp, content = http.request(
                splunkd_uri, method=method, headers=headers, body=data
            )
        except Exception:
            _LOGGER.error(msg_temp, splunkd_uri, "unknown", format_exc())
        else:
            if resp.status not in (200, 201):
                _LOGGER.debug(
                    msg_temp, splunkd_uri, resp.status, code_to_msg(resp, content)
                )
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
        503: (
            "Feature is disabled in the configuration file. "
            "reason={}".format(content)
        ),
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
    # Map Proxy Type to its respective httplib2 Proxy Type Code
    proxy_type_to_code = {
        "http": httplib2.socks.PROXY_TYPE_HTTP,
        "http_no_tunnel": httplib2.socks.PROXY_TYPE_HTTP_NO_TUNNEL,
        "socks4": httplib2.socks.PROXY_TYPE_SOCKS4,
        "socks5": httplib2.socks.PROXY_TYPE_SOCKS5,
    }

    # Set proxy to None if not enabled
    if not utils.is_true(config.get("proxy_enabled")):
        _LOGGER.debug("Proxy is not configured")
        proxy_info = None
    else:
        if config.get("proxy_url") and config.get("proxy_port"):
            if config.get("proxy_type") in proxy_type_to_code:
                proxy_type = proxy_type_to_code[config["proxy_type"]]
            else:
                proxy_type = httplib2.socks.PROXY_TYPE_HTTP
            _LOGGER.debug("Proxy is configured")
            if config.get("proxy_username") and config.get("proxy_password"):
                proxy_info = httplib2.ProxyInfo(
                    proxy_type=proxy_type,
                    proxy_host=config["proxy_url"],
                    proxy_port=int(config["proxy_port"]),
                    proxy_user=config["proxy_username"],
                    proxy_pass=config["proxy_password"],
                    proxy_rdns=utils.is_true(config.get("proxy_rdns")),
                )
            else:
                proxy_info = httplib2.ProxyInfo(
                    proxy_type=proxy_type,
                    proxy_host=config["proxy_url"],
                    proxy_port=int(config["proxy_port"]),
                    proxy_rdns=utils.is_true(config.get("proxy_rdns")),
                )

    disable_ssl_certificate_validation = utils.is_true(
        config.get("disable_ssl_certificate_validation")
    )
    ca_certs_path = config.get("ca_certs_path")

    if ca_certs_path:
        ca_certs_path = ca_certs_path.strip()

    _LOGGER.debug(
        "Found %s value for disable_ssl_certificate_validation parameter",
        disable_ssl_certificate_validation,
    )
    _LOGGER.debug("Found %s value for ca_certs_path parameter", ca_certs_path)

    http = httplib2.Http(
        proxy_info=proxy_info,
        timeout=timeout,
        disable_ssl_certificate_validation=disable_ssl_certificate_validation,
        ca_certs=ca_certs_path,
    )
    if config.get("username") and config.get("password"):
        http.add_credentials(config["username"], config["password"])
    return http
