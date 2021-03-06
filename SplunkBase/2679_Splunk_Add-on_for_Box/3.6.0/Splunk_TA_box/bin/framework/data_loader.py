#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#
"""
Data Loader main entry point
"""

import configparser as ConfigParser
import logging
import multiprocessing
import os.path as op
import queue as Queue
import traceback

import log_files

_LOGGER = logging.getLogger(log_files.ta_frmk)


class DataLoader:
    """
    Data Loader boots all underlying facilities to handle data collection
    """

    def __init__(self, configs, job_scheduler, event_writer):
        """
        @configs: a list like object containing a list of dict
        like object. Each element shall implement dict.get/[] like interfaces
        to get the value for a key.
        @job_scheduler: schedulering the jobs. shall implement get_ready_jobs
        @event_writer: write_events
        """

        import thread_pool as tp
        import timer_queue as tq

        self.settings = self._read_default_settings()
        self.configs = configs
        self.event_writer = event_writer
        self.wakeup_queue = Queue.Queue()
        pool_size = self._get_pool_size()
        self.io_pool = tp.ThreadPool(pool_size)
        self.cpu_pool = None
        self.scheduler = job_scheduler
        self.timer_queue = tq.TimerQueue()
        self._started = False
        self._stopped = False

    def __cmp__(self, other):
        if self.when == other.when:  # pylint: disable=no-member
            return 0
        elif self.when < other.when:  # pylint: disable=no-member
            return -1
        else:
            return 1

    def __call__(self):
        self.callback()  # pylint: disable=no-member

    def __eq__(self, other):
        return self.__cmp__(other)

    def __lt__(self, other):
        return self.__cmp__(other) == -1

    def __gt__(self, other):
        return self.__cmp__(other) == 1

    def __ne__(self, other):
        return not self.__eq__(other)

    def __le__(self, other):
        return self.__lt__(other) or self.__eq__(other)

    def __ge__(self, other):
        return self.__gt__(other) or self.__eq__(other)

    def run(self):
        if self._started:
            return
        self._started = True

        self.cpu_pool = self._create_process_pool()
        self.event_writer.start()
        self.io_pool.start()
        self.timer_queue.start()
        self.scheduler.start()
        _LOGGER.info("DataLoader started.")

        scheduler = self.scheduler
        io_pool = self.io_pool
        wakeup_q = self.wakeup_queue
        while 1:
            try:
                (sleep_time, jobs) = scheduler.get_ready_jobs()
            except Exception:
                _LOGGER.error("Failed to get jobs, reason=%s", traceback.format_exc())
                jobs = ()
                sleep_time = 1

            io_pool.enqueue_jobs(jobs)
            try:  # nosemgrep: gitlab.bandit.B110
                go_exit = wakeup_q.get(timeout=sleep_time)
            except Queue.Empty:
                pass
            else:
                if go_exit:
                    self._stopped = True
                    break

        scheduler.tear_down()
        io_pool.tear_down()
        if self.cpu_pool:
            self.cpu_pool.tear_down()
        self.timer_queue.tear_down()
        self.event_writer.tear_down()
        _LOGGER.info("DataLoader stopped.")

    def tear_down(self):
        self.wakeup_queue.put(True)

    def stopped(self):
        return self._stopped

    def run_io_jobs(self, jobs, block=True):
        self.io_pool.enqueue_jobs(jobs, block)

    def run_computing_job(self, func, args=(), kwargs={}):
        if self.cpu_pool:
            return self.cpu_pool.apply(func, args, kwargs)
        else:
            return func(*args, **kwargs)

    def run_computing_job_async(self, func, args=(), kwargs={}, callback=None):
        """
        @return: AsyncResult
        """

        assert self.cpu_pool is not None  # nosemgrep: gitlab.bandit.B101

        return self.cpu_pool.apply_async(func, args, kwargs, callback)

    def add_timer(self, callback, when, interval):
        return self.timer_queue.add_timer(callback, when, interval)

    def remove_timer(self, timer):
        self.timer_queue.remove_timer(timer)

    def _get_pool_size(self):
        if self.settings["thread_num"] > 0:
            pool_size = self.settings["thread_num"]
        else:
            pool_size = multiprocessing.cpu_count()
        _LOGGER.info("thread_pool_size = %d", pool_size)
        return pool_size

    def _create_process_pool(self):
        if self.settings["process_num"] == 0:
            proc_count = 0
        elif self.settings["process_num"] > 0:
            proc_count = self.settings["process_num"]
        else:
            proc_count = multiprocessing.cpu_count()
            if proc_count > 3:
                proc_count = proc_count - 2
            else:
                proc_count = 1

        _LOGGER.info("process_pool_size = %d", proc_count)

        if proc_count > 0:
            import process_pool as pp

            return pp.ProcessPool(proc_count)
        else:
            return None

    @staticmethod
    def _read_default_settings():
        cur_dir = op.dirname(op.abspath(__file__))
        setting_file = op.join(cur_dir, "setting.conf")
        parser = ConfigParser.ConfigParser()
        parser.read(setting_file)
        settings = {}
        for option in ("process_num", "thread_num"):
            try:
                settings[option] = parser.get("global", option)
            except ConfigParser.NoOptionError:
                settings[option] = -1

            if settings[option] == "dynamic":
                settings[option] = -1

            try:
                settings[option] = int(settings[option])
            except ValueError:
                settings[option] = -1
        _LOGGER.debug("settings:%s", settings)
        return settings


class GlobalDataLoader:
    """Singleton, inited when started"""

    __instance = None

    @staticmethod
    def get_data_loader(configs, job_factory, writer):
        if GlobalDataLoader.__instance is None:
            GlobalDataLoader.__instance = DataLoader(configs, job_factory, writer)
        return GlobalDataLoader.__instance

    @staticmethod
    def reset():
        GlobalDataLoader.__instance = None
