#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#
import logging
import traceback
import urllib.parse as urllib2

from box_utility import get_sslconfig
from boxsdk.auth import OAuth2
from boxsdk.client import Client
from boxsdk.exception import BoxAPIException, BoxOAuthException
from boxsdk.network.default_network import DefaultNetwork
from boxsdk.session.session import AuthorizedSession, Session
from solnlib import conf_manager, utils

_LOGGER = logging.getLogger("ta_box")


class BoxAPIError(Exception):
    """Exception raised from Box SDK"""

    def __init__(
        self,
        url="",
        message="",
        status=None,
        code=None,
        context_info=None,
    ):
        super(BoxAPIError, self).__init__()
        self.url = url
        self.message = message
        self.status = status or ""
        self.code = code or ""
        self.context_info = context_info or ""


class BoxOAuth2(OAuth2):
    """We need hold a global unique oauth object"""

    def __init__(
        self,
        credentials,
        verify,
        store_tokens_callback=None,
        session=None,
    ):
        super(BoxOAuth2, self).__init__(
            client_id=credentials["client_id"],
            client_secret=credentials["client_secret"],
            store_tokens=store_tokens_callback,
            access_token=credentials["access_token"],
            refresh_token=credentials["refresh_token"],
            session=session,
        )


class ProxyableBoxNetwork(DefaultNetwork):
    """Override request method for supporting proxy"""

    def __init__(self, proxy_conf, verify, logger=None):
        super(ProxyableBoxNetwork, self).__init__()
        self.logger = logger or _LOGGER
        self._verify = verify
        self._proxies = self._proxies_from_conf(proxy_conf)

    def request(self, method, url, access_token, **kwargs):
        return super(ProxyableBoxNetwork, self).request(
            method,
            url,
            access_token,
            proxies=self._proxies,
            verify=self._verify,
            **kwargs
        )

    @staticmethod
    def _escape(s):
        return urllib2.quote(s.encode(), safe="")

    def _proxies_from_conf(self, context):
        if not utils.is_true(context.get("proxy_enabled", "FALSE")):
            self.logger.debug("Proxy is not enabled for Box TA.")
            return None

        self.logger.debug("Proxy is enabled for Box TA.")

        host, port = context.get("proxy_url"), context.get("proxy_port")
        if not all((host, port)):
            self.logger.debug("Proxy host or port is not configured.")
            return None

        proxy_type = (context.get("proxy_type") or "http").lower()
        if proxy_type not in ("http", "socks5", "https"):
            self.logger.warning(
                'Unsupported proxy type=%s, use "HTTP" for Box', proxy_type
            )
            proxy_type = "http"

        # semgrep ignore reason: no hardcoded password here
        user_pass = ""  # nosemgrep: gitlab.bandit.B105
        user = context.get("proxy_username")
        password = context.get("proxy_password")

        if user and password:
            user_pass = "{user}:{password}@".format(
                user=self._escape(user), password=self._escape(password)
            )

        proxy_string = "{user_pass}{host}:{port}".format(
            user_pass=user_pass, host=host, port=port
        )

        schemes = ("http", "https")
        if proxy_type in ("http", "https"):
            proxies = {
                k: "{}://{}".format(proxy_type, proxy_string) for k in schemes
            }  # noqa: E501
        elif proxy_type == "socks5":
            proxies = {
                k: "{}h://{}".format(proxy_type, proxy_string) for k in schemes
            }  # noqa: E501
            # providing support for socks5 using pysocks' socks
        else:
            # FIXME provide support for socks4 support
            proxies = {
                k: "{}://{}".format(proxy_type, proxy_string) for k in schemes
            }  # noqa: E501

        return proxies


class BoxClient:
    """Wrapper of client in Box SDK"""

    def __init__(self, context, conf_mgr=None, logger=None):
        self.logger = logger or _LOGGER
        verify = get_sslconfig(
            context["session_key"], context["disable_ssl_certificate_validation"]
        )
        network_layer = ProxyableBoxNetwork(
            context,
            verify,
            logger=self.logger,
        )
        self._oauth = BoxOAuth2(
            context,
            verify,
            store_tokens_callback=self.store_new_tokens,
            session=Session(network_layer=network_layer),
        )
        self._authorised_session = AuthorizedSession(
            oauth=self._oauth, network_layer=network_layer
        )
        self._client = Client(self._oauth, session=self._authorised_session)

        self._app_name = context["appname"]
        self.account_cfm = conf_manager.ConfManager(
            context["session_key"],
            context["appname"],
            realm="__REST_CREDENTIAL__#{}#configs/conf-splunk_ta_box_account".format(  # noqa: E501
                context["appname"]
            ),
        )

        self._context = context

    def store_new_tokens(self, new_access_token, new_refresh_token):
        self.logger.info("Start to store new tokens")
        tokens = {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "client_secret": self._oauth._client_secret,
        }

        try:
            conf_account = self.account_cfm.get_conf("splunk_ta_box_account")
            conf_account.update(
                stanza_name=self._context["account"],
                stanza=tokens,
                encrypt_keys=tokens.keys(),
            )
        except Exception as ex:
            self.logger.error("Failed to store tokens to conf.")
            self.logger.error(ex)
            return

        self.logger.info("Store tokens successfully.")

    def make_request(self, uri, method="GET", params=None):
        self.logger.debug("Start sending request to uri=%s", uri)
        try:
            response = self._client.make_request(
                method=method,
                url=uri,
                params=params,
            )
            self.logger.debug(
                "Received response with status code = {}".format(response.status_code)
            )
            return response.status_code, response.json()
        except BoxAPIException as ex:
            raise BoxAPIError(
                uri, ex.message, ex.status, ex.code, traceback.format_exc()
            )
        except BoxOAuthException as ex:
            raise BoxAPIError(
                url=uri,
                status=getattr(ex, "_status"),
                code=getattr(ex, "_code", ""),
                message=getattr(ex, "_message", ""),
                context_info=traceback.format_exc(),
            )
        except Exception as ex:
            raise BoxAPIError(
                url=uri, message=str(ex), context_info=traceback.format_exc()
            )
