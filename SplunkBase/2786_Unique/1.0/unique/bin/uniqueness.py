#!/usr/bin/env python
#
# Copyright 2011-2015 Splunk, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License"): you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.

import sys
from config import *

from splunklib.searchcommands import \
    dispatch, StreamingCommand, Configuration, Option, validators

from splunklib.results import ResultsReader

import splunklib.client as client
import splunklib.results as results

@Configuration()
class UniquenessCommand(StreamingCommand):
    """ Compares input to snapshot for uniqueness

    ##Syntax

    .. code-block::
        uniqueness snapshot=<field> fields="<field>, <field>, ..."

    ##Description

    Compares input events to existing snapshot for uniqueness

    ##Example

    Compare events to snapshot "Wednesday-URLs" with fields for ut_tld, ut_domain

    .. code-block::
        | snapshot snapshot=Wednesday-URLs fields="ut_tld, ut_domain"

    """
    snapshot = Option(
        doc='''
        **Syntax:** **snapshot=***<snapshot>*
        **Description:** Name of the field that will hold the snapshot name''',
        require=True)

    fields = Option(
        doc='''
        **Syntax:** **fields=***<fields>*
        **Description:** Name of the field that will hold the list of fields to compare''',
        require=True, validate=validators.List())

    def _run_on_record(self, record):
        record["unique"] = False
        for field in self.fields:
            if not record[field] in self.snapshotData[field]:
                if record["unique"] == False:
                    record["unique"] = field
                else:
                    record["unique"] += " , %s" % (field)
        return True

    def stream(self, records):
        self.logger.debug('UniquenessCommand: %s' % self)  # logs command line
        self.snapshotData = {}
        if not self.snapshot:
            sys.exit(0)
        for field in self.fields:
            self.snapshotData[field]={}
            snapshotJob = self.service.jobs.create("|zkread command=get_children path=/unique/%s/fields/%s" % (self.snapshot, field),**{"exec_mode": "blocking"})
            snapshotResults = snapshotJob.results(count=0)
            for x in ResultsReader(snapshotResults):
                self.snapshotData[field][x["value"]] = False

        for record in records:
            ret = self._run_on_record(record)
            yield record


dispatch(UniquenessCommand, sys.argv, sys.stdin, sys.stdout, __name__)
