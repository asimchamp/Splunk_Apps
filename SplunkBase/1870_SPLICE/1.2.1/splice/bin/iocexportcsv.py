#!/usr/bin/env python

"""
| iocexportcsv type="ipv4-addr" alias="ip" filename="myIpList.csv" directory="/path/somewhere"
will produce csv "description, ip"

see: http://docs.splunk.com/Documentation/ES/3.1.1/Install/Configureblocklists
expected headers name are ip, domain or url.

"""

import re
import sys
import os.path
import time

from splice.ioc      import IOC
from splice.config   import Config
from splice.database import DB
from splice.splindicator import SPLIndicator

from splunklib.searchcommands import \
    dispatch, GeneratingCommand, Configuration, Option, validators, Validator


class Path(Validator):
    pattern = re.compile('^[_.a-zA-Z0-9-/]+$')

    def __call__(self, value):
        value = str(value)
        if Path.pattern.match(value) is None:
            raise ValueError('Illegal characters in path: %s' % value)
        return value


@Configuration()

class IOCExportCSVCommand(GeneratingCommand):
    value_type = Option(name='value_type', require=True, validate=validators.Fieldname())
    alias      = Option(name='alias', require=True, validate=validators.Fieldname())
    filename   = Option(name='filename', require=True, validate=Path())
    directory  = Option(name='directory', require=True, validate=Path())

    splice_conf = Config()
    db_connection_uri = splice_conf.get_mongo_connection_uri()

    spldb = DB(db_connection_uri)
    spldb.connect()

    def __init__(self):
	super(GeneratingCommand, self).__init__()

    def generate(self):

	SPLInd = SPLIndicator()

	ext = ".csv"
	if re.search("\.[Cc][Ss][Vv]$", self.filename) :
		ext = ""
	filepath = os.path.join(self.directory, self.filename + ext)
	try:
		f_out = open(filepath, "w")
	except Exception, e:
		raise ValueError("Failed to open file %s with error: %s" % (filepath, e))

	res = self.spldb.get_csv_list_of_atomic_indicators(self.value_type)

	f_out.write("description,%s\n" % self.alias)
	counter = 0
	for (k,v) in res.iteritems():
		f_out.write("%s,%s\n" % (v,k))
		counter += 1
	f_out.close()
	yield {'_time': time.time(), '_raw': 'file %s created with %s entries' % (filepath, counter)}

dispatch(IOCExportCSVCommand, sys.argv, sys.stdin, sys.stdout, __name__)

