#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#
"""
File for AWS Cloudtrail input data loader.
"""
from __future__ import absolute_import

import json
import os.path as op
import traceback

import six
import splunk_ta_aws.common.proxy_conf as pc
import splunk_ta_aws.common.ta_aws_common as tacommon
from splunk_ta_aws import set_log_level
from splunk_ta_aws.common.checkpoint import LocalKVService
from splunksdc import logging
from splunktalib.common.util import extract_datainput_name, is_true

from . import aws_cloudtrail_common as ctcommon
from .aws_cloudtrail_processor import CloudTrailProcessor

from splunk_ta_aws.common.ta_aws_common import (  # isort: skip # pylint: disable=ungrouped-imports
    load_config,
    make_splunk_endpoint,
)

from .aws_cloudtrail_sqs_collector import (  # isort: skip
    SQSCollector,
    get_sqs_client,
    get_sqs_queue_url,
)

logger = logging.get_module_logger()


class Configs:
    """Class for AWS cloudtrail configs."""

    ACCOUNTS = "accounts"
    SETTINGS_LOGGING = "settings_logging"
    SETTINGS_PROXY = "settings_proxy"

    ENDPOINTS = {
        ACCOUNTS: {
            "endpoint": "splunk_ta_aws/settings/all_accounts",
            "label": "AWS Accounts",
        },
        SETTINGS_LOGGING: {
            "endpoint": "splunk_ta_aws/splunk_ta_aws_settings_cloudtrail/logging",
            "label": "AWS CloudTrail Logging Setting",
        },
    }

    @staticmethod
    def load(splunkd_uri, session_key):
        """Loads AWS cloudtrail configs."""
        logger.debug("AWS CloudTrail Input Configs")

        user, app = "nobody", "Splunk_TA_aws"
        configs = {
            key: load_config(
                make_splunk_endpoint(splunkd_uri, ep["endpoint"], user, app),
                session_key,
                ep["label"],
            )
            for key, ep in six.iteritems(Configs.ENDPOINTS)
        }

        # handle IAM role for AWS accounts
        for _, item in six.iteritems(configs[Configs.ACCOUNTS]):
            if is_true(item.get("iam")):
                item["key_id"], item["secret_key"] = None, None

        configs[Configs.SETTINGS_PROXY] = pc.get_proxy_info(session_key)
        return configs


def save_to_local_file(messages, local_store):
    """
    Save CloudTrail notifications from SQS into local file.

    :param messages:
    :param local_store:
    :return:
    """
    for msg in messages:
        msg_id = msg["MessageId"]
        # logger.debug('Commit sqs message to local ckpt', message=msg)
        try:
            msg_body = json.loads(msg["Body"])
            if not isinstance(msg_body, dict):
                raise Exception("Body content isn't dict")
        except Exception:  # pylint: disable=broad-except
            logger.error(
                "Parsing Failed",
                message_body=msg["Body"],
                error=traceback.format_exc(),
            )
        else:
            local_store.set(msg_id, msg_body)


class Input:  # pylint: disable=too-many-instance-attributes
    """Class for Input."""

    def __init__(
        self,
        splunkd_uri,
        session_key,
        ckpt_dir,
        input_name,
        input_item,
        ew,  # pylint: disable=invalid-name
    ):  # pylint: disable=too-many-arguments
        self.splunkd_uri, self.session_key = splunkd_uri, session_key
        self.ckpt_dir = ckpt_dir
        self.input_name, self.input_item = input_name, input_item
        input_name = extract_datainput_name(self.input_name)
        self.local_store = LocalKVService.create(
            op.join(self.ckpt_dir, input_name + ".v3.ckpt")
        )
        self.configs = Configs.load(self.splunkd_uri, self.session_key)
        self.aws_account = None
        self.sqs_client = None
        ctcommon.event_writer = ew

    def _prepare(self):
        if self.input_item["aws_account"] not in self.configs[Configs.ACCOUNTS]:
            raise Exception("AWS account not found for datainput")

        # Set Logging
        set_log_level(self.configs[Configs.SETTINGS_LOGGING]["logging"]["level"])
        logger.debug("Running Started", datainput=self.input_name)

        # Set Proxy
        tacommon.set_proxy_env(self.configs[Configs.SETTINGS_PROXY])

        aws_account_name = self.input_item["aws_account"]
        self.aws_account = self.configs[Configs.ACCOUNTS][aws_account_name]
        sqs_endpoint_url = tacommon.get_endpoint_url(
            self.input_item, "sqs_private_endpoint_url"
        )
        self.sqs_client = get_sqs_client(
            self.input_item["aws_region"],
            self.aws_account.get("key_id"),
            self.aws_account.get("secret_key"),
            self.aws_account.get("token"),
            sqs_endpoint_url,
        )

    def _collect(self):
        """
        Fetch SQS messages and store them in local file.
        :return:
        """
        logger.info("SQS Collecting Started", datainput=self.input_name)
        queue_url = get_sqs_queue_url(self.sqs_client, self.input_item["sqs_queue"])
        collector = SQSCollector(
            self.sqs_client,
            queue_url,
            logger,
            handler=save_to_local_file,
            local_store=self.local_store,
        )
        result = collector.run()
        logger.info(
            "SQS Collecting Finished",
            datainput=self.input_name,
            result="successful" if result else "failed",
        )

    def _process(self):
        """
        Process messages stored in local file.
        :return:
        """
        logger.info("Processing Started", datainput=self.input_name)
        processor = CloudTrailProcessor(
            self.session_key,
            self.input_name,
            self.input_item,
            self.aws_account,
            self.local_store,
        )
        result = processor.run()
        logger.info("Processing Finished", datainput=self.input_name, **result)

    def run(self):
        """Runs modinput"""
        logger.info("Running Started", datainput=self.input_name)
        try:
            self._prepare()
            self._collect()
            self._process()
        except Exception:
            logger.error(
                "Running Failed",
                datainput=self.input_name,
                error=traceback.format_exc(),
                **self.input_item
            )
            raise
        logger.info("Running Finished", datainput=self.input_name)
