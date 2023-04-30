# Copyright (c) 2013, 2014 Splunk, Inc.  All rights reserved
import datetime
import traceback
from IPFIXTemplates import *
from NTPTime import *
from collections import namedtuple
DataSource = namedtuple('DataSource', ['host', 'port', 'observer'])


class DataField:
    def __init__(self, name, value):
        """Initializes a DataField with the specified name and value

        @param name: the name of this data field
        @param value: the value of this field
        """
        self.name = name
        self.value = value if name != 'paddingOctets' else len(value)

        ## Escape quotes:
        if isinstance(self.value, basestring):
            self.value = self.value.replace('"', "'")

    def __str__(self):
        ## NOTE: uncomment the "if" to have paddingOctects render as empty strings
        if isinstance(self.value, float):
            return '%s="%0.9f";' % (self.name, self.value)  # if self.name != 'paddingOctets' else ''
        else:
            return '%s="%s";' % (self.name, self.value)  # if self.name != 'paddingOctets' else ''


class Data:
    @staticmethod
    def read_variable_length_string(data):
        """If the length of the Information Element is greater than or equal to 255 octets,
        the length is encoded into 3 octets before the Information Element.
        The first octet is 255, and the length is carried in the second and third octets.
        """
        length = ord(data[0])
        if length == 255:
            length = unpack("!H", data[1:3])[0]
            start = 3
        else:
            start = 1
        data = data[start:length + start]
        return str(data).rstrip("\x00"), length + start, length

    def __init__(self, template, data, logger=logging):
        """Initialize the IPFIX data parser with a template and raw binary data

        @type data: byte[]
        @param template: the template used to parse this data
        @param data: the binary data to be parsed
        @param logger: an optional logger to be used for debugging data
        """
        start = 0
        self.template_id = template.id
        self.data = []
        for field in template:
            length = field.length

            if not field.type:
                #    The Collecting Process MUST note the Information Element identifier
                #    of any Information Element that it does not understand and MAY
                #    discard that Information Element from the Flow Record.
                # NOTE: we only parse variable-length strings, because those are identifiable by the length == 65535
                #       but we do not discard anything anymore. we display it as hex below...
                logger.log(logger.WARN,
                           "Have not implemented parsing for '%s' of length %s (%s:%s) required for template %s.",
                           field.type_name, field.length, field.enterprise_id, field.id, template.id)

            code = ""
            try:
                if field.length == 65535:
                    output, length, string_length = self.read_variable_length_string(data[start:])
                    # Tweak start and length purely for pretty-print purposes
                    start += length - string_length
                    length = string_length
                else:
                    if not field.type:
                        self.data.append(DataField("%s:%s" % (field.enterprise_id, field.id),
                                                   data[start:start + length].encode('hex')))
                        start += length
                        continue

                    code = "!" + (field.type.unpack_code
                                  if length == field.type.default_length
                                  else "L" if (field.type.unpack_code == 'Q' and length == 4)
                                  else str(length) + field.type.unpack_code)

                    if field.type_name == 'dateTimeSeconds':
                        # MUST be encoded in a 32-bit integer
                        # containing the number of seconds since 0000 UTC Jan 1, 1970.
                        # The 32-bit integer allows the time encoding up to 136 years.
                        output = unpack(code, data[start:start + field.length])[0]
                        output = datetime.datetime.fromtimestamp(output).isoformat()

                    elif field.type_name == 'dateTimeMilliseconds':
                        # MUST be encoded in a 64-bit integer
                        # containing the number of milliseconds since 0000 UTC Jan 1, 1970
                        output = unpack(code, data[start:start + field.length])[0]
                        # sometimes it's actually in seconds rather than milliseconds
                        if output > 1000000000000:
                            output /= 1000.0
                        output = datetime.datetime.fromtimestamp(output).isoformat()
                    elif field.type_name.startswith('dateTime'):
                        # dateTimeMicroseconds and dateTimeNanoseconds are encoded as NTP timestamp
                        # Which is a 64 bit fixed-width with near picosecond precision
                        # But we're converting them to datetime (with microsecond precision)
                        # and then rendering them as a float in unix timestamp
                        # Which is a float (and we're doing this at microsecond precision)
                        output = float(NtpTime.from_bytes(data[start:start + field.length]))
                    elif field.type_name == 'ipv4Address':
                        output = socket_inet_ntop(AF_INET, data[start:start + field.length])
                    elif field.type_name == 'ipv6Address':
                        #data = unpack(code, data[start:start+field.length])[0]
                        output = socket_inet_ntop(AF_INET6, data[start:start + field.length])
                    elif field.type_name == 'octetArray':
                        output = data[start:start + field.length].encode('hex')
                    else:
                        output = unpack(code, data[start:start + field.length])[0]

                # output should be a string/float rather than a unicode
                if isinstance(output, str):
                    # The incoming network data is expected to be utf-8, but
                    # ipfix may mess up this, the packet may be encoded in
                    # other codecs. In order to avoid messing up the downstream
                    # modinput code, we do necessary cleanup here.
                    # "replace" cleans up the code points in output which are
                    # not utf-8 encoded.
                    unicode_output = output.decode("utf-8", "replace")
                    utf8_output = unicode_output.encode("utf-8")
                    if len(utf8_output) != len(output):
                        logger.log(logger.WARN, "Parsed %s of type %s (%s) [Id %s:%s] for template %s. Data(%s): "
                                   "Encode '%s' failed because of the non-unicode data. Use %s instead.",
                                   field.name, field.type_name, length, field.enterprise_id, field.id, template.id,
                                   code, output, unicode_output)
                    output = utf8_output

                logger.log(logger.DEBUG,
                           "Parsed %s of type %s (%s) [Id %s:%s] for template %s. "
                           "Data(%s): Got '%s' from the data (%s)", field.name, field.type_name, length, field.enterprise_id, field.id, template.id,
                                    code, output, data[start:start + length].encode('hex'))
            except Exception as e:
                output = "--"
                logger.log(logger.ERROR,
                           "Parsing %s of type %s (%s) [Id %s:%s] for template %s. "
                           "Data(%s): Got an exception from the data (%s) \n %s: %s: %s",
                           field.name, field.type_name, length, field.enterprise_id, field.id, template.id,
                                    code, data[start:start + length].encode('hex'),
                                    type(e).__name__, e, traceback.format_exc())
            self.data.append(DataField(field.name, output))
            # print "%s (%s): '%s' [%s:%s]" % (field.name, field.type_name, code, start, start+length)
            start += length
        self.length = start
        # print "RECORD: {}".format(self)

    def __str__(self):
        ## NOTE: paddingOctets are currently NOT rendered at all
        return " ".join([str(field) for field in self.data if field.name != 'paddingOctets'])


class DataSet:
    def __init__(self, data_source, template_id, data, logger=logging):
        """Create a DataSet

        @type data_source: DataSource
        @param data_source: the source information to find the right template definition
        @param template_id: the template id
        @param data: the binary data set
        @param logger: an optional logger for debugging information
        """
        self.source = data_source
        self.template_id = template_id
        self.logger = logger
        self.template = TemplateCache.get_template_safe(self.source, self.template_id)

        self.record_start = 0
        self.data = data
        self.length = 0
        self.minimum_record_size = 0
        if not self.template:
            # TODO: investigate if we're allowed (in UDP mode) to store this data until we get the template
            logger.log(logger.WARN,
                       "Can't parse Data Set with Template ID: %s (from %s) with no template. Data: %s",
                           template_id, data_source, data.encode("hex"))
        else:
            self.length = len(data)
            self.minimum_record_size = len(self.template)

    def __iter__(self):
        """We parse the data at iteration and not before, so iteration start just means resetting to zero.
        Ultimately, we iterate over the Data objects in the set, but the iterator is the DataSet itself.

        @return: the reset DataSet
        """
        self.record_start = 0
        return self

    def next(self):
        """Get the next Data record from the DataSet

        @return: the Data object
        @raise StopIteration: when there's no template or when all records have been parsed.
        """
        if not self.template:
            self.template = TemplateCache.get_template_safe(self.source, self.template_id)

            if not self.template:
                self.logger.log(self.logger.ERROR,
                                "Still can't parse Data Set with Template ID: %s (from: %s) with no template. ERROR.",
                                self.template_id, self.source)
                raise StopIteration
            else:
                self.length = len(self.data)
                self.minimum_record_size = len(self.template)

        if self.record_start + self.minimum_record_size > self.length:
            raise StopIteration
        data = Data(self.template, self.data[self.record_start:], self.logger)
        self.record_start += data.length
        return data

    def __str__(self):
        """Converting a DataSet to string means iterating the Data records and outputting them all for splunk.

        @return:
        """
        header = 'Observer="%s"; Host="%s"; Port="%s"; ' % (self.source.observer, self.source.host, self.source.port)

        if self.length:
            return header + ("\n" + header).join([str(data) for data in self])
        else:
            return header + 'ParseError="Template not known (yet).";'
