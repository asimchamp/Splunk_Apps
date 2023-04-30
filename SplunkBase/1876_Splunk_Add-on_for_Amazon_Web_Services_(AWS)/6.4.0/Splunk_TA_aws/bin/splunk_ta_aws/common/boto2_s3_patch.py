#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#
"""
File for making request connection with S3
"""
from __future__ import absolute_import

from boto.s3.connection import S3Connection


class RegionRedirection(Exception):
    """
    Class for region redirection.
    """

    def __init__(self, region_name):  # pylint: disable=super-init-not-called
        self.region_name = region_name


def make_request_wrapper(func):
    """Returns request wrapper."""

    def wrapper(*args, **kwargs):
        response = func(*args, **kwargs)
        if response.status == 301 and args[1] == "HEAD":
            headers = response.getheaders()
            for key, value in headers:
                if key == "x-amz-bucket-region":
                    raise RegionRedirection(value)
        return response

    return wrapper


S3Connection.make_request = make_request_wrapper(S3Connection.make_request)  # type: ignore
