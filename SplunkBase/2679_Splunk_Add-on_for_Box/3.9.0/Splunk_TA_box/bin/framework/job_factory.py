#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#
class JobFactory:
    def __init__(self, job_source, event_writer):
        self._job_source = job_source
        self._event_writer = event_writer

    def get_jobs(self):
        """
        Get jobs from job source
        """

        jobs = self._job_source.get_jobs(timeout=1)
        if jobs:
            return [self._create_job(job) for job in jobs]
        return None

    def _create_job(self, job):
        """
        @job: dict for job definition
        """
        raise NotImplementedError("Derived class shall override _create_job")


class Job:
    def __init__(self, job_id):
        self._id = job_id

    def __call__(self):
        raise NotImplementedError("Derived class shall implement call method")

    def is_alive(self):
        return True

    def get(self, key, default=None):
        raise NotImplementedError("Derived class shall implement get method")

    def __lt__(self, other):
        return self.__hash__() < other.__hash__()

    def __gt__(self, other):
        return self.__hash__() > other.__hash__()

    def __eq__(self, other):
        return self.__hash__() == other.__hash__()

    def __hash__(self):
        return self.ident()

    def ident(self):
        return self._id
