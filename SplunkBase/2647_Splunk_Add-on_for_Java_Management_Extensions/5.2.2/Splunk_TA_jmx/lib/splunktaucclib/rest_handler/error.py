# SPDX-FileCopyrightText: 2020 2020
#
# SPDX-License-Identifier: Apache-2.0

"""
Error Handling.
"""


__all__ = ["STATUS_CODES", "RestError"]


# HTTP status codes
STATUS_CODES = {
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    411: "Length Required",
    500: "Internal Server Error",
    503: "Service Unavailable",
}


class RestError(Exception):
    """
    REST Error.
    """

    def __init__(self, status, message):
        self.status = status
        self.reason = STATUS_CODES.get(
            status,
            "Unknown Error",
        )
        self.message = message
        err_msg = "REST Error [{status}]: {reason} -- {message}".format(
            status=self.status,
            reason=self.reason,
            message=self.message,
        )
        super().__init__(err_msg)
