#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#
"""
File for cloudwatch data input handler.
"""
from __future__ import absolute_import

import json
import os
import os.path
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta

from splunk_ta_aws import logger as root
from splunk_ta_aws.common.proxy import ProxySettings
from splunksdc import log as logging
from splunksdc.utils import LogExceptions, LogWith

from .discovery import AWSEnvironment, DiscoveryPolicyFactory

from splunk_ta_aws.common.credentials import (  # isort: skip # pylint: disable=ungrouped-imports
    AWSCredentialsCache,
    AWSCredentialsProviderFactory,
)
from splunksdc.config import (  # isort: skip # pylint: disable=ungrouped-imports
    BooleanField,
    IntegerField,
    LogLevelField,
    StanzaParser,
    StringField,
)

from .metric import (  # isort: skip # pylint: disable=ungrouped-imports
    Metric,
    MetricCheckpoint,
    MetricFilter,
    MetricQueryBuilder,
    MetricQueryExecutor,
)

logger = logging.get_module_logger()


class LegacyEventWriter:
    """Class for legacy event writer."""

    def __init__(self, backend, region, account_id, sourcetype):
        self._backend = backend
        self._region = region
        self._account_id = account_id
        self._sourcetype = sourcetype

    def __call__(
        self, points, namespace, name, dimensions, tags
    ):  # pylint: disable=too-many-arguments
        if not points:
            return

        template = {
            "account_id": self._account_id,
            "metric_name": name,
            "metric_dimensions": ",".join(
                [
                    "{}=[{}]".format(  # pylint: disable=consider-using-f-string
                        key, value
                    )
                    for key, value in dimensions
                ]
            ),
        }
        data = self._render(template, points)
        source = "{}:{}".format(  # pylint: disable=consider-using-f-string
            self._region, namespace
        )
        self._backend.write_fileobj(data, source=source, sourcetype=self._sourcetype)

    @classmethod
    def _render(cls, template, points):
        events = []
        for point in points:
            data = dict(template)
            data["timestamp"] = point.iso1806
            data["period"] = point.period
            data.update(point.value)
            events.append(json.dumps(data, sort_keys=True))
        events.append("")
        return "\n".join(events)


class MetricEventWriter:
    """Class for metric event writer."""

    def __init__(self, backend, region, account_id, sourcetype):
        self._backend = backend
        self._region = region
        self._account_id = account_id
        self._sourcetype = sourcetype

    def __call__(
        self, points, namespace, name, dimensions, tags
    ):  # pylint: disable=too-many-arguments
        # pylint: disable=unnecessary-comprehension
        if not points:
            return

        dimensions = {key: value for key, value in dimensions}
        for tag in tags or []:
            dimensions.update(tag)
        template = {
            "MetricName": name,
            "Namespace": namespace,
            "Region": self._region,
            "AccountID": self._account_id,
        }
        template.update(dimensions)
        data = self._render(template, points)
        self._backend.write_fileobj(data, sourcetype=self._sourcetype)

    @classmethod
    def _render(cls, template, points):
        events = []
        for point in points:
            data = dict(template)
            data["Timestamp"] = point.iso1806
            data["Period"] = point.period
            data.update(point.value)
            events.append(json.dumps(data, sort_keys=True))
        events.append("")
        return "\n".join(events)


class Task:  # pylint: disable=too-many-instance-attributes
    """Class for Task."""

    def __init__(  # pylint: disable=too-many-arguments
        self,
        datainput,
        region,
        account_id,
        metadata,
        discovery,
        filtering,
        query,
        options,
    ):
        self._datainput = datainput
        self._region = region
        self._account_id = account_id
        self._metadata = metadata
        self._discovery = discovery
        self._filtering = filtering
        self._query = query
        self._use_metric_format = options.use_metric_format
        self._metric_expiration = options.metric_expiration
        self._sourcetype = options.sourcetype
        self._now = time.time

    @property
    def region(self):
        """Returns region."""
        return self._region

    @property
    def datainput(self):
        """Returns data input."""
        return self._datainput

    @LogWith(region=region, datainput=datainput)
    @LogExceptions(
        logger, "Task was interrupted by an unhandled exception.", lambda e: -1
    )
    def run(self, app, client, executor):
        """Run method for input."""
        event_writer = self._create_event_writer(app)
        with self._create_checkpoint(app) as store:
            checkpoint = MetricCheckpoint(store)
            metrics = self._load_metrics(checkpoint, client)
            self._collect(metrics, checkpoint, event_writer, executor)
            checkpoint.sweep()
        return 0

    def _load_metrics(self, checkpoint, client):
        if checkpoint.need_refresh():
            metrics = self._discover(client)
            data = Metric.archive(metrics)
            checkpoint.archive(data, self._metric_expiration)
        data = checkpoint.restore()
        return Metric.restore(data)

    def _collect(self, metrics, checkpoint, event_writer, executor):
        # pylint: disable=unnecessary-comprehension
        logger.info("Start querying data points.", total=len(metrics))
        expiration = self._metric_expiration * 3
        for batches in self._query.create_batches(metrics):
            logger.info("Start running batches.", count=len(batches))
            for metric, points in executor.run(batches):
                markers = metric.get(checkpoint)
                points = [_ for _ in self._dedup(points, markers)]
                metric.write(points, event_writer)
                markers = self._update_markers(points, markers)
                metric.set(checkpoint, markers, expiration)
            logger.info("Batches completed.")
        logger.info("Querying data points finished.")

    def _create_event_writer(self, app):
        metadata = vars(self._metadata)
        backend = app.create_event_writer(None, **metadata)
        region, account_id = self._region, self._account_id
        sourcetype = (
            "aws:cloudwatch:metric" if self._use_metric_format else self._sourcetype
        )
        if sourcetype == "aws:cloudwatch:metric":
            return MetricEventWriter(backend, region, account_id, sourcetype)
        return LegacyEventWriter(backend, region, account_id, sourcetype)

    def _discover(self, client):
        logger.info("Start discovering metrics.")
        total = []
        for metrics in self._discovery(client):
            total.extend(metrics)
        matched = [item for item in total if item.match(self._filtering)]
        logger.info(
            "Metrics discovery finished.", total=len(total), matched=len(matched)
        )
        return matched

    def _create_checkpoint(self, app):
        basename = "{}_{}".format(  # pylint: disable=consider-using-f-string
            self._region, self._account_id
        )
        folder = os.path.join(app.workspace(), self._datainput)
        if not os.path.exists(folder):
            os.makedirs(folder)
        filename = os.path.join(folder, basename)
        return app.open_checkpoint(filename)

    @classmethod
    def _dedup(cls, points, markers):
        markers.sort()
        i, j = 0, 0
        points_len = len(points)
        markers_len = len(markers)
        while i < points_len:
            point = points[i]
            point_timestamp = point.timestamp

            if j == markers_len:
                yield point
                i += 1
                continue

            marker_timestamp = markers[j]
            if point_timestamp < marker_timestamp:
                if j != 0:
                    yield point
                i += 1
            elif point_timestamp == marker_timestamp:
                i += 1
                j += 1
            elif point_timestamp > marker_timestamp:
                j += 1

    @classmethod
    def _update_markers(cls, points, markers):
        max_number_of_marker = 5
        points = [p.timestamp for p in points]
        if len(points) > 5:
            return points[-max_number_of_marker:]
        markers.extend(points)
        markers.sort()
        return markers[-max_number_of_marker:]

    @classmethod
    def create_builder(  # pylint: disable=too-many-arguments
        cls, datainput, metadata, discovering, filtering, executor, options
    ):
        """Creates builder for input."""

        def _build(region, account_id):
            return cls(
                datainput,
                region,
                account_id,
                metadata,
                discovering,
                filtering,
                executor,
                options,
            )

        return _build


class CloudWatchSpace:
    """Class for Cloudwatch space."""

    _MIN_TTL = timedelta(minutes=30)

    def __init__(self, region, account, iam_role, endpoint_urls=r"{}"):
        self._region = region
        self._account = account
        self._iam_role = iam_role
        self._builder = []
        self._task_cls = Task
        self._endpoint_urls = json.loads(endpoint_urls)

    @property
    def region(self):
        """Returns region."""
        return self._region

    @property
    def account(self):
        """Returns account"""
        return self._account

    @property
    def iam_role(self):
        """Returns iam role"""
        return self._iam_role

    @LogWith(region=region, account=account, iam_role=iam_role)
    @LogExceptions(logger, "An error occurred while running tasks.", lambda e: None)
    def run(self, app, config, io):  # pylint: disable=invalid-name
        """Run method for input."""
        region = self._region
        credentials = self._load_credentials(config)
        account_id = credentials.account_id
        client = AWSEnvironment(credentials, region, self._endpoint_urls)
        executor = MetricQueryExecutor(
            region, credentials, io, self._endpoint_urls.get("monitoring_endpoint_url")
        )
        for builder in self._builder:
            if app.is_aborted():
                break
            if credentials.need_retire(self._MIN_TTL):
                credentials.refresh()
            task = builder(region, account_id)
            task.run(app, client, executor)

    def _load_credentials(self, config):
        factory = AWSCredentialsProviderFactory(
            config, self._region, self._endpoint_urls.get("sts_endpoint_url")
        )
        provider = factory.create(self._account, self._iam_role)
        return AWSCredentialsCache(provider)

    def add(
        self, datainput, metadata, discovery, filtering, query, options
    ):  # pylint: disable=too-many-arguments
        """Adds builder for the input."""
        builder = self._task_cls.create_builder(
            datainput, metadata, discovery, filtering, query, options
        )
        self._builder.append(builder)


class CloudWatchSpaces:
    """Class for cloudwatch spaces."""

    def __init__(self):
        self._spaces = {}

    def __call__(
        self, region, account, iam_role, endpoint_urls={}
    ):  # pylint: disable=dangerous-default-value
        endpoint_urls = json.dumps(endpoint_urls)
        key = region, account, iam_role, endpoint_urls
        return self._spaces.setdefault(key, CloudWatchSpace(*key))

    def __iter__(self):
        return iter(self._spaces.values())


class DataInput:
    """Class for data input."""

    def __init__(self, stanza):
        self._content = stanza.content
        self._kind = stanza.kind
        self._name = stanza.name
        self._filter_cls = MetricFilter
        self._query_cls = MetricQueryBuilder

    def _create_filter(self):
        parser = StanzaParser(
            [
                StringField("metric_names"),
                StringField("metric_dimensions"),
            ]
        )
        args = self._extract_args(parser)
        metric_names = json.loads(args.metric_names)
        metric_dimensions = json.loads(args.metric_dimensions)
        metric_dimensions = metric_dimensions[0]
        return self._filter_cls(metric_names, metric_dimensions)

    def _create_discovery_policy(self, policies, dimensions):
        parser = StanzaParser(
            [
                StringField("metric_namespace"),
            ]
        )
        args = self._extract_args(parser)
        metric_ns = args.metric_namespace
        return policies(metric_ns, dimensions)

    def _create_query_builder(self):
        parser = StanzaParser(
            [
                StringField("statistics", required=True),
                IntegerField("period", lower=60, upper=3600, default=300),
                IntegerField("query_window_size", upper=1440, lower=12, default=24),
            ]
        )
        args = self._extract_args(parser)
        period = args.period // 60 * 60
        statistics = json.loads(args.statistics)
        return self._query_cls(
            statistics,
            period,
            args.query_window_size,
        )

    def _create_event_metadata(self):
        stanza = self._kind + "://" + self._name
        parser = StanzaParser(
            [
                StringField("index"),
                StringField("host"),
                StringField("stanza", fillempty=stanza),
            ]
        )
        return self._extract_args(parser)

    def _is_enabled(self):
        parser = StanzaParser(
            [
                BooleanField("disabled", rename="enabled", reverse=True),
            ]
        )
        args = self._extract_args(parser)
        return args.enabled

    def _create_options(self):
        parser = StanzaParser(
            [
                StringField("sourcetype", default="aws:cloudwatch"),
                BooleanField("use_metric_format", default=False),
                IntegerField("metric_expiration", lower=600, upper=86400, default=3600),
            ]
        )
        return self._extract_args(parser)

    def _extract_args(self, parser):
        return parser.parse(self._content)

    def _create_spaces(self, spaces):
        parser = StanzaParser(
            [
                StringField("aws_account", required=True),
                StringField("aws_iam_role", default=""),
                StringField("aws_region", required=True),
            ]
        )
        args = self._extract_args(parser)
        account = args.aws_account
        iam_role = args.aws_iam_role
        regions = [item.strip() for item in args.aws_region.split(",")]
        if int(self._content.get("private_endpoint_enabled", 0)):
            endpoint_urls = {
                "sts_endpoint_url": self._content.get("sts_private_endpoint_url"),
                "monitoring_endpoint_url": self._content.get(
                    "monitoring_private_endpoint_url"
                ),
                "autoscaling_endpoint_url": self._content.get(
                    "autoscaling_private_endpoint_url"
                ),
                "ec2_endpoint_url": self._content.get("ec2_private_endpoint_url"),
                "elb_endpoint_url": self._content.get("elb_private_endpoint_url"),
                "lambda_endpoint_url": self._content.get("lambda_private_endpoint_url"),
                "s3_endpoint_url": self._content.get("s3_private_endpoint_url"),
            }
        else:
            endpoint_urls = {}
        return [spaces(region, account, iam_role, endpoint_urls) for region in regions]

    @property
    def name(self):
        """Returns name."""
        return self._name

    @LogWith(datainput=name)
    @LogExceptions(logger, "An error occurred while creating tasks.", lambda e: None)
    def initial(self, spaces, policies):
        """Creates task for data input."""
        datainput = self._name
        if not self._is_enabled():
            logger.info("Skip disabled data input.")
            return

        logger.info("Create task for data input.", content=self._content)

        metadata = self._create_event_metadata()
        filtering = self._create_filter()
        dimensions = filtering.get_dimension_keys()
        discovering = self._create_discovery_policy(policies, dimensions)
        query = self._create_query_builder()
        options = self._create_options()

        for space in self._create_spaces(spaces):
            space.add(datainput, metadata, discovering, filtering, query, options)
        return


class CloudWatchSettings:
    """Class for cloudwatch settings."""

    @classmethod
    def load(cls, config):
        """Returns aws cloudwatch settings"""
        content = config.load("aws_settings", stanza="aws_cloudwatch")
        parser = StanzaParser([LogLevelField("log_level", default="WARNING")])
        settings = parser.parse(content)
        return cls(settings)

    def __init__(self, settings):
        self._settings = settings

    def setup_log_level(self, target):
        """Sets log level."""
        target.set_level(self._settings.log_level)


class ModularInput:
    """Class for Modular input."""

    def __init__(self, stanzas):
        self._stanzas = stanzas
        self._start_time = time.time()
        self._input_cls = DataInput

    @property
    def start_time(self):
        """Returns start time."""
        return self._start_time

    def _create_spaces(self):
        spaces = CloudWatchSpaces()
        policies = DiscoveryPolicyFactory()
        for stanza in self._stanzas:
            datainput = self._input_cls(stanza)
            datainput.initial(spaces, policies)
        return spaces

    @LogWith(start_time=start_time)
    @LogExceptions(
        logger, "Modular input was interrupted by an unhandled exception.", lambda e: -1
    )
    def run(self, app, config):
        """Run method for cloudwatch input."""
        if not len(self._stanzas):  # pylint: disable=len-as-condition
            logger.info("No data input has been configured.")
            return 0

        settings = CloudWatchSettings.load(config)
        settings.setup_log_level(root)
        proxy = ProxySettings.load(config)
        proxy.hook_boto3_get_proxies()
        with ThreadPoolExecutor() as tpe_io:
            for space in self._create_spaces():
                if app.is_aborted():
                    break
                space.run(app, config, tpe_io)
        return 0
