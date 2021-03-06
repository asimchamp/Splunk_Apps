#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#
import logging
import random
import threading
from heapq import heapify, heappop, heappush
from time import time

import log_files

_LOGGER = logging.getLogger(log_files.ta_frmk)


class Scheduler:
    """
    A simple scheduler which schedules the periodic or once event
    """

    max_delay_time = 60

    def __init__(self):
        self._job_heap = []
        self._lock = threading.Lock()

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

    def get_ready_jobs(self):
        """
        @return: a 2 element tuple. The first element is the next ready
                 duration. The second element is ready jobs list
        """

        now = time()
        ready_jobs = []
        sleep_time = 1

        with self._lock:
            job_heap = self._job_heap
            total_jobs = len(job_heap)
            while job_heap:
                if job_heap[0][0] <= now:
                    job = heappop(job_heap)
                    if job[1].is_alive():
                        ready_jobs.append(job[1])
                        if job[1].get("duration") != 0:
                            # repeated job, calculate next due time and enqueue
                            job[0] = now + job[1].get("duration")
                            heappush(job_heap, job)
                    else:
                        _LOGGER.warn("Removing dead endpoint: %s", job[1].get("name"))
                else:
                    sleep_time = job_heap[0][0] - now
                    break

        if ready_jobs:
            _LOGGER.info(
                "Get %d ready jobs, next duration is %f, "
                "and there are %s jobs scheduling",
                len(ready_jobs),
                sleep_time,
                total_jobs,
            )

        ready_jobs.sort(key=lambda job: job.get("priority", 0), reverse=True)
        return (sleep_time, ready_jobs)

    def add_jobs(self, jobs):
        with self._lock:
            now = time()
            job_heap = self._job_heap
            for job in jobs:
                if job is not None:
                    delay_time = random.randrange(  # nosemgrep: gitlab.bandit.B311
                        0, self.max_delay_time
                    )
                    heappush(job_heap, [now + delay_time, job])

    def update_jobs(self, jobs):
        with self._lock:
            job_heap = self._job_heap
            for njob in jobs:
                for i, job in enumerate(job_heap):
                    if njob == job[1]:
                        job_heap[i][1] = njob
                        break
            heapify(job_heap)

    def remove_jobs(self, jobs):
        with self._lock:
            new_heap = []
            for job in self._job_heap:
                for djob in jobs:
                    if djob == job[1]:
                        _LOGGER.info("Remove job=%s", djob.ident())
                        break
                else:
                    new_heap.append(job)
            heapify(new_heap)
            self._job_heap = new_heap

    def number_of_jobs(self):
        with self._lock:
            return len(self._job_heap)
