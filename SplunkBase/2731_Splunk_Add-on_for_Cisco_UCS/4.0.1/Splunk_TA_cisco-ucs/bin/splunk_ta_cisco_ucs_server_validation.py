#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#
import logging
from defusedxml.ElementTree import fromstring as defused_fromstring
from httplib2 import Http, ServerNotFoundError
from ta_util2 import log_files
from splunktaucclib.rest_handler.endpoint.validator import Validator
import ta_util2.utils as utils
import ssl
import traceback

_LOGGER = logging.getLogger(log_files.splunk_ta_cisco_ucs_validation)


class AccountValidation(Validator):
    def __init__(self, *args, **kwargs):
        super(AccountValidation, self).__init__(*args, **kwargs)

    def validate(self, value, data):
        url = "https://{}/nuova".format(data["server_url"])
        headers = {"content-type": "application/xml"}
        payload = "<aaaLogin inName='{}' inPassword='{}'></aaaLogin>".format(
            data["account_name"], data["account_password"]
        )

        try:
            # Note: to update server after disabling ssl certification verification
            # from backend, user will need to update it from backend only
            http = Http(
                proxy_info=None,
                disable_ssl_certificate_validation=utils.is_true(
                    data.get("disable_ssl_verification", False)
                ),
            )
            resp, content = http.request(
                url, method="POST", headers=headers, body=payload
            )
        except (ServerNotFoundError, TimeoutError) as e:
            _LOGGER.error("Error: {}".format(str(e)))
            self.put_msg("Unable to reach server!")
            return False

        except ssl.SSLCertVerificationError as e:
            _LOGGER.error(
                "SSLCertVerificationError: {}, Traceback: {}".format(
                    str(e), traceback.format_exc()
                )
            )
            self.put_msg(
                "Error: Certificate verification failed. Please refer to splunk_ta_cisco_ucs_validation.log"
                " for more details."
            )
            return False

        except Exception as e:
            _LOGGER.error(
                "Unexpected error while authenticating credentials for"
                " URL: {}, Exception-Type: {}, Traceback: {}".format(
                    url, type(e), traceback.format_exc()
                )
            )
            self.put_msg(
                "Unexpected error occured! Please refer to splunk_ta_cisco_ucs_validation.log"
                " for more details."
            )
            return False
        else:
            if resp.status not in (200, 201):
                _LOGGER.error(
                    "Response returned with status code %s, Content of the response: %s",
                    resp.status,
                    content,
                )
                self.put_msg(
                    "Got invalid status code: {} while authenticating!".format(
                        resp.status
                    )
                )
                return False
            else:
                content = defused_fromstring(content)
                if content.get("errorDescr"):
                    _LOGGER.error(
                        "Response returned with status code %s and error description: %s",
                        resp.status,
                        content.get("errorDescr"),
                    )
                    self.put_msg(content.get("errorDescr"))
                    return False
                elif content.get("outCookie"):
                    _LOGGER.info("Authentication successful with provided credentials.")
                    return True
                else:
                    _LOGGER.error("Unknown Error: Response=%s", content)
                    self.put_msg(
                        "Unexpected error occured! Please refer to splunk_ta_cisco_ucs_validation.log"
                        " for more details."
                    )
                    return False
