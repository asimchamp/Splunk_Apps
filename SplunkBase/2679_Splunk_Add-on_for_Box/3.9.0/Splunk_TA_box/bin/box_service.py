#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#
import import_declare_test  # noqa F401 # isort: skip
import logging
import os.path as op
import queue
import sys
import time
import traceback
from datetime import datetime, timedelta  # noqa F401

import box_helper
import box_job_factory as jf
import data_loader as dl
import event_writer
import job_scheduler as sched
import log_files
import requests
import utils
from box_client import BoxClient
from box_config import BoxConfig, BoxConfMonitor, handle_ckpts  # noqa
from solnlib import conf_manager
from solnlib import orphan_process_monitor as opm
from solnlib.server_info import ServerInfo
from solnlib.utils import handle_teardown_signals, is_true, remove_http_proxy_env_vars
from splunk import rest
from splunklib import modularinput as smi

requests.urllib3.disable_warnings()  # type: ignore

remove_http_proxy_env_vars()
all_logs = log_files.get_all_logs()
all_logs.append("ta_box")

_LOGGER = logging.getLogger(log_files.ta_box)


APP_NAME = "Splunk_TA_box"
SESSION_KEY = "session_key"
SERVER_URI = "server_uri"


def _setup_signal_handler(data_loader):
    """
    Setup signal handlers
    @data_loader: data_loader.DataLoader instance
    """

    def _handle_exit(signum, frame):
        _LOGGER.info("Box TA is going to exit...")
        data_loader.tear_down()

    handle_teardown_signals(_handle_exit)


def _get_file_change_handler(data_loader, meta_configs):
    def reload_and_exit(changed_files):
        _LOGGER.info("Reload conf %s", changed_files)
        changed_files = [op.basename(x) for x in changed_files]
        changed_files = [
            cf[:-5] if cf.endswith(".conf") else cf for cf in changed_files
        ]
        for conf_file in changed_files:
            cm = conf_manager.ConfManager(
                meta_configs["session_key"],
                APP_NAME,
                realm="__REST_CREDENTIAL__#{}#configs/conf-{}".format(
                    APP_NAME, conf_file
                ),
            )
            conf = cm.get_conf(conf_file, True)
            conf.reload()
        data_loader.tear_down()

    return reload_and_exit


def _setup_logging(loglevel="INFO", refresh=False):
    for logfile in all_logs:
        utils.setup_logging(logfile, loglevel, refresh)


def splunk_session_heartbeat_fn(session_key):
    def splunk_session_heartbeat():
        try:
            server = ServerInfo(session_key)
            server.is_search_head()
            _LOGGER.debug("Successfully executed without session timeout")
        except:  # noqa E722
            _LOGGER.error("Encountered exception: {}".format(traceback.format_exc()))

    return splunk_session_heartbeat


def _check_duration(duration, input_name):
    """Checks if interval is a positive integer. Otherwise,
    logs a warning log to notify the user and set the default value."""
    try:
        duration_int = int(duration)
        if duration_int < 1:
            _LOGGER.warning(
                "Got unexpected value {} of 'duration' field for input '{}'."
                "Duration should be an integer. Setting the default value."
                " You can either change it in inputs.conf file or edit 'Interval' on Inputs page.".format(
                    duration, input_name
                )
            )
            return False
    except ValueError:
        _LOGGER.warning(
            "Got unexpected value {} of 'duration' field for input '{}'."
            "Duration should be an integer. Setting the default value."
            " You can either change it in inputs.conf file or edit 'Interval' on Inputs page.".format(
                duration, input_name
            )
        )
        return False

    return True


def get_account_id(session_key, account_info, proxy_config, box_config, account_name):
    """This function is used to get the account id using the Box SDK."""
    params = {}
    params["session_key"] = session_key
    params["appname"] = APP_NAME
    params.update(proxy_config)
    params.update(box_config)
    params.update(account_info)
    params["account"] = account_name

    if "disable_ssl_certificate_validation" in params:
        params["disable_ssl_certificate_validation"] = is_true(
            params["disable_ssl_certificate_validation"]
        )

    client = BoxClient(params, logger=_LOGGER)
    try:
        account_id = box_helper.fetch_data(
            client, box_helper.fetch_account_id_uri(params)
        ).get("id")
    except Exception as err:
        account_id = None
        _LOGGER.error("Failed to fetch account_id, " "reason={}".format(err))

    return account_id


class ModinputJobSource:
    def __init__(self, stanza_configs):
        self._done = False
        self._job_q = queue.Queue()
        self.put_jobs(stanza_configs)

    def put_jobs(self, jobs):
        for job in jobs:
            self._job_q.put(job)

    def get_jobs(self, timeout=0):
        jobs = []
        try:
            while 1:
                jobs.append(self._job_q.get(timeout=timeout))
        except queue.Empty:
            return jobs


class BoxService(smi.Script):
    def __init__(self):
        super(BoxService, self).__init__()

    def get_scheme(self):
        scheme = smi.Scheme("Splunk Add-on for Box")
        scheme.description = "Enable Box RESTful inputs"
        scheme.use_external_validation = True
        scheme.streaming_mode_xml = True
        scheme.use_single_instance = True

        scheme.add_argument(
            smi.Argument(
                "input_name", title="Name", description="Name", required_on_create=True
            )
        )
        scheme.add_argument(
            smi.Argument(
                "name", title="Name", description="Name", required_on_create=True
            )
        )

        scheme.add_argument(
            smi.Argument(
                "account",
                required_on_create=True,
            )
        )

        scheme.add_argument(
            smi.Argument(
                "rest_endpoint",
                required_on_create=False,
            )
        )

        scheme.add_argument(
            smi.Argument(
                "collect_folder",
                required_on_create=False,
            )
        )

        scheme.add_argument(
            smi.Argument(
                "collect_collaboration",
                required_on_create=False,
            )
        )

        scheme.add_argument(
            smi.Argument(
                "collect_file",
                required_on_create=False,
            )
        )

        scheme.add_argument(
            smi.Argument(
                "collect_task",
                required_on_create=False,
            )
        )

        scheme.add_argument(
            smi.Argument(
                "created_after",
                required_on_create=False,
            )
        )

        scheme.add_argument(
            smi.Argument(
                "duration",
                required_on_create=True,
            )
        )

        scheme.add_argument(
            smi.Argument(
                "folder_fields",
                required_on_create=False,
            )
        )

        scheme.add_argument(
            smi.Argument(
                "file_fields",
                required_on_create=False,
            )
        )

        scheme.add_argument(
            smi.Argument(
                "task_fields",
                required_on_create=False,
            )
        )

        scheme.add_argument(
            smi.Argument(
                "comment_fields",
                required_on_create=False,
            )
        )

        scheme.add_argument(
            smi.Argument(
                "user_fields",
                required_on_create=False,
            )
        )

        scheme.add_argument(
            smi.Argument(
                "event_delay",
                required_on_create=False,
            )
        )

        return scheme

    def validate_input(self, definition):
        return

    def stream_events(self, inputs, ew):
        meta_configs = self._input_definition.metadata

        for input_name, input_item in inputs.inputs.items():  # py2/3
            if "account" not in input_item:
                rest.simpleRequest(
                    "messages",
                    meta_configs[SESSION_KEY],
                    postargs={
                        "severity": "error",
                        "name": "Box error message",
                        "value": "Some configurations are missing in Splunk Add-on for Box. "
                        "Please fix the configurations to resume data collection.",
                    },
                    method="POST",
                )
        try:
            settings_cfm = conf_manager.ConfManager(
                meta_configs[SESSION_KEY],
                APP_NAME,
                realm="__REST_CREDENTIAL__#{}#configs/conf-splunk_ta_box_settings".format(
                    APP_NAME
                ),
            )

            splunk_ta_box_settings_conf = settings_cfm.get_conf(
                "splunk_ta_box_settings"
            ).get_all()

            loglevel = splunk_ta_box_settings_conf["logging"].get("loglevel", "INFO")
            _setup_logging(loglevel)
            if not bool(inputs.inputs):
                _LOGGER.info(
                    "No configured Historical Querying inputs found. To collect data from Box, "
                    "configure new input(s) or "
                    "update existing input(s) either from Inputs page of the Add-on or manually from inputs.conf."
                )
                return 0

            try:
                if not op.isfile(
                    op.join(
                        op.dirname(op.realpath(op.dirname(__file__))),
                        "local",
                        "splunk_ta_box_account.conf",
                    )
                ):
                    raise Exception("Box account conf file not found")
                account_cfm = conf_manager.ConfManager(
                    meta_configs[SESSION_KEY],
                    APP_NAME,
                    realm="__REST_CREDENTIAL__#{}#configs/conf-splunk_ta_box_account".format(
                        APP_NAME
                    ),
                )

                splunk_ta_box_account_conf_obj = account_cfm.get_conf(
                    "splunk_ta_box_account"
                )
                splunk_ta_box_account_conf = splunk_ta_box_account_conf_obj.get_all()
            except:  # noqa E722
                _LOGGER.info(
                    "Either account configuration does not exist or there was an error while fetching the account configuration"  # noqa
                )
                return

            box_conf = account_cfm.get_conf("box").get_all()

            account_info = {}
            stanza_configs = []
            for k, v in splunk_ta_box_account_conf.items():  # py2/3
                account_info[k] = v

            account_id_dict = {}
            for input_name, input_item in inputs.inputs.items():  # py2/3
                input_item["name"] = input_name
                input_item["created_after"] = BoxConfig._get_datetime(
                    input_item.get("created_after")
                )
                account_id = None
                account_id_present = False
                try:
                    account_config = account_info[input_item["account"]]
                    box_config = box_helper.get_box_config(meta_configs[SESSION_KEY])
                    proxy_config, _ = box_helper.get_proxy_logging_config(
                        meta_configs[SESSION_KEY]
                    )  # noqa: E501

                    if input_item["account"] in account_id_dict:
                        account_id = account_id_dict[input_item["account"]]
                        account_id_present = True
                    else:
                        account_id = get_account_id(
                            meta_configs[SESSION_KEY],
                            account_config,
                            proxy_config,
                            box_config,
                            input_item["account"],
                        )
                        account_id_dict[input_item["account"]] = account_id

                    if account_id is None:
                        _LOGGER.info(
                            "Box account ID not found for account {}".format(
                                input_item["account"]
                            )
                        )
                        pass
                except Exception as e:
                    _LOGGER.error(
                        "Error occured while getting the account Id: {}".format(e)
                    )

                if account_id_present:
                    for k, v in account_info[input_item["account"]].items():  # py2/3
                        input_item[k] = v
                else:
                    updated_info = {}
                    try:
                        updated_account_info = splunk_ta_box_account_conf_obj.get_all()
                        for k, v in updated_account_info.items():  # py2/3
                            updated_info[k] = v
                        for k, v in updated_info[
                            input_item["account"]
                        ].items():  # py2/3
                            input_item[k] = v
                    except Exception as e:
                        _LOGGER.error(
                            "Error occured while fetching the updated values of account: {}".format(
                                e
                            )
                        )
                        continue

                for k, v in box_conf["box_default"].items():  # py2/3:
                    if k not in input_item:
                        input_item[k] = v

                if "disable_ssl_certificate_validation" in input_item:
                    input_item["disable_ssl_certificate_validation"] = is_true(
                        input_item["disable_ssl_certificate_validation"]
                    )

                input_item["account_id"] = account_id

                for k, v in meta_configs.items():  # py2/3
                    input_item[k] = v
                if splunk_ta_box_settings_conf is not None:
                    for k, v in splunk_ta_box_settings_conf["proxy"].items():  # py2/3:
                        input_item[k] = v
                    for x, y in splunk_ta_box_settings_conf["logging"].items():  # py2/3
                        input_item[x] = y
                # Validate duration
                if "duration" not in input_item:
                    # Keeping the default value in case duration is not specified
                    input_item["duration"] = int(input_item["collection_interval"])
                elif _check_duration(input_item["duration"], input_item["name"]):
                    input_item["duration"] = int(input_item["duration"])
                else:
                    default_duration = {
                        "events": 120,
                        "users": 604800,
                        "folders": 604800,
                        "groups": 604800,
                    }
                    input_item["duration"] = default_duration[
                        input_item["rest_endpoint"]
                    ]

                # default value of event_delay will be '0'; type:: str
                e_delay = (
                    int(input_item.get("event_delay"))
                    if input_item.get("event_delay")
                    else 0
                )
                e_interval = input_item["duration"]
                if e_delay and (e_delay > e_interval):
                    e_delay = max((e_interval - 10), (e_delay % e_interval))
                    _LOGGER.warn(
                        "Entered Delay ({} sec) is greater than Interval ({} sec) provided. "
                        " Using the delay: {} seconds.".format(
                            input_item["event_delay"], e_interval, e_delay
                        )
                    )

                input_item["event_delay"] = e_delay

                stanza_configs.append(input_item)

            writer = event_writer.EventWriter()
            job_src = ModinputJobSource(stanza_configs)
            job_factory = jf.BoxJobFactory(job_src, writer)
            job_scheduler = sched.JobScheduler(job_factory)
            # semgrep ignore reason: The rule is for python dl module, here we have imported data loader module as dl
            data_loader = dl.GlobalDataLoader.get_data_loader(  # nosemgrep: contrib.dlint.dlint-equivalent.insecure-dl-use  # noqa: E501
                stanza_configs, job_scheduler, writer
            )
            callback = _get_file_change_handler(data_loader, meta_configs)
            conf_monitor = BoxConfMonitor(callback)
            data_loader.add_timer(conf_monitor.check_changes, time.time(), 60)

            orphan_checker = opm.OrphanProcessChecker(data_loader.tear_down)
            data_loader.add_timer(orphan_checker.check_orphan, time.time(), 2)

            # making sure the session_key won't expire
            data_loader.add_timer(
                splunk_session_heartbeat_fn(meta_configs[SESSION_KEY]), time.time(), 600
            )

            _setup_signal_handler(data_loader)
            data_loader.run()

        except Exception:
            _LOGGER.error("Error %s", traceback.format_exc())


if __name__ == "__main__":
    exit_code = BoxService().run(sys.argv)
    sys.exit(exit_code)
