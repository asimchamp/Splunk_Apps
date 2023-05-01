#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#
"""
Create scheduling jobs
"""
import import_declare_test
import logging
import os.path as op
import socket
import time
import traceback

import box_utility
from checkpoint import Checkpointer
from framework import job_factory as jf
from framework import state_store as ss
from framework import utils

__all__ = ["BoxJobFactory"]


_LOGGER = logging.getLogger("ta_box")


class BoxCollectionJob(jf.Job):
    def __init__(self, job_id, config, data_collect_func):
        super(BoxCollectionJob, self).__init__(job_id)
        self._config = config
        self._func = data_collect_func
        if not config.get("host", None):
            config["host"] = socket.gethostname()

    def __call__(self):
        use_state_store = True
        try:
            collection_name = import_declare_test.COLLECTION_VALUE_FROM_ENDPOINT.get(
                self._config["rest_endpoint"]
            )
            kv_migration_successful = box_utility.checkpoint_migration_successful(
                self._config["input_name"],
                use_state_store,
                self._config["session_key"],
                self._config["checkpoint_dir"],
                collection_name,
                _LOGGER,
            )
            if kv_migration_successful:
                config = self._config
                _LOGGER.info("Start collecting from %s.", config["name"])
                idx = config.get("index", "main")
                host = config["host"]
                event_writer = config["event_writer"]
                start_time = time.time()
                update_timestamp = False
                while 1:
                    done, results = self._func()
                    if results is not None:
                        update_timestamp = True
                        if len(results) > 0:
                            events = "".join(
                                (
                                    "<stream>%s</stream>" % obj.to_string(idx, host)
                                    for obj in results
                                )
                            )
                            event_writer.write_events(events)

                    if done:
                        break

                if update_timestamp and config["rest_endpoint"] != "folders":
                    checkpointer_object = Checkpointer(
                        config["session_key"],
                        config["input_name"],
                        collection_name,
                        _LOGGER,
                    )
                    ckpt = checkpointer_object.get_kv_checkpoint_value()
                    ckpt["start_timestamp"] = start_time
                    checkpointer_object.update_kv_checkpoint(ckpt)

                _LOGGER.info("End collecting from %s.", self._config["name"])
            else:
                _LOGGER.info(
                    "Skipping the invocation for input: {} as the checkpoint migration to KV Store failed. Please restart the input to retry the checkpoint migration instantly.".format(
                        self._config["input_name"]
                    )
                )
        except Exception as e:
            _LOGGER.error(
                "Exception occured while starting the data collection for input: {}:{}".format(
                    self._config["input_name"], traceback.format_exc()
                )
            )

    def __hash__(self):
        return super(BoxCollectionJob, self).__hash__()

    def __lt__(self, other):
        return self.__hash__() < other.__hash__()

    def __gt__(self, other):
        return self.__hash__() > other.__hash__()

    def __eq__(self, other):
        return self.__hash__() == other.__hash__()

    def get(self, key, default=None):
        return self._config.get(key, default)


class BoxJobFactory(jf.JobFactory):

    # Fix Cyclic import issue
    import box_data_loader as bdl

    def __init__(self, job_source, event_writer):
        super(BoxJobFactory, self).__init__(job_source, event_writer)
        self._rest_to_cls = {
            "events": (self.bdl.BoxEvent, 0),
            "folders": (self.bdl.BoxFolder, 1000),
            "users": (self.bdl.BoxUser, 10),
            "groups": (self.bdl.BoxGroup, 100),
        }

    def _create_job(self, job):
        appname = utils.get_appname_from_path(op.abspath(__file__))
        job["appname"] = appname
        job["event_writer"] = self._event_writer
        job["state_store"] = ss.StateStore(
            job, appname, use_kv_store=job.get("use_kv_store")
        )
        cls, priority = self._rest_to_cls[job["rest_endpoint"]]
        box = cls(job)
        return BoxCollectionJob(priority, job, box.collect_data)
