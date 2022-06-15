#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#
"""
Create scheduling jobs
"""

import logging
import os.path as op
import socket
import time

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
        config = self._config
        _LOGGER.debug("Start collecting from %s.", config["name"])
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
            ckpt = config["state_store"].get_state(config["input_name"])
            ckpt["start_timestamp"] = start_time
            config["state_store"].update_state(config["input_name"], ckpt)

        _LOGGER.debug("End collecting from %s.", self._config["name"])

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
