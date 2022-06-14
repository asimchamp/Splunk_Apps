# Copyright (c) 2013, 2014 Splunk, Inc.  All rights reserved
from IPFIXData import *


class Parser:
    templates = None

    def __init__(self, data_source, raw_data, length, logger=logging):
        """Initialize the Parser for an IPFIX message

        @type data_source: DataSource
        @param data_source: A DataSource describing the host, port and observerId
        @param length:
        @param raw_data:
        @param logger:
        """
        self.source = data_source
        self.length = length
        self.data = []

        pos = 0

        while pos < self.length:
            logger.log(logger.INFO, "reading bytes %s..%s of %s", pos, pos + 4, length)

            (set_id, set_length) = unpack("!HH", raw_data[pos:pos + 4])

            if set_id == 2:
                TemplateCache.parse_template_set(data_source, raw_data[pos + 4:pos + set_length])

            if set_id == 3:
                TemplateCache.parse_option_template_set(data_source, raw_data[pos + 4:pos + set_length])

            # If set_id > 255, that means it's a Data Set Record
            if set_id > 255:
                # Need to wrap IPFIX.DataSet in [] to ensure it doesn't unroll,
                # This way we end up with .data being an array of sets
                self.data += [DataSet(data_source, set_id, raw_data[pos + 4: pos + set_length], logger=logger)]

            pos += set_length

    def __str__(self):
        return "\n".join([str(data_set) for data_set in self.data])
