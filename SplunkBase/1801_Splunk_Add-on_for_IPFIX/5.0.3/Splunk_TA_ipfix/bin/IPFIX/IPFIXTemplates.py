# Copyright (c) 2013, 2014 Splunk, Inc.  All rights reserved
from splunk.appserver.mrsparkle.lib.util import make_splunkhome_path
from os import path, walk
from struct import unpack

APP_HOME = make_splunkhome_path(['etc', 'apps', 'Splunk_TA_ipfix'])
TEMPLATE_PATHS = path.join(APP_HOME, 'default', 'information-elements'), \
                 path.join(APP_HOME, 'local', 'information-elements')

import xml.etree.cElementTree as ElementTree
import logging


class DataType:
    """Represents an encoding data type with a name, and the code needed for unpack"""

    def __init__(self, type_id, type_name, unpack_code, default_length):
        """Initializes a DataType object

        @param type_id: The integer type_id of the DataType
        @param type_name: The type_name of the DataType
        @param unpack_code: The code for un/packing to binary stream
        @param default_length: The number of bytes to encode the DataType
        """
        self.id = type_id
        self.name = type_name
        self.unpack_code = unpack_code
        self.default_length = default_length


class TemplateField(object):
    """Represents the element definitions that are parsed from each field in a template"""

    # These are the known DataTypes which might be in a template
    data_types = [
        DataType(0, 'octetArray', 's', 1),
        DataType(1, 'unsigned8', 'B', 1),
        DataType(2, 'unsigned16', 'H', 2),
        DataType(3, 'unsigned32', 'L', 4),
        DataType(4, 'unsigned64', 'Q', 8),
        DataType(5, 'signed8', 'b', 1),
        DataType(6, 'signed16', 'h', 2),
        DataType(7, 'signed32', 'l', 4),
        DataType(8, 'signed64', 'q', 8),
        DataType(9, 'float32', 'f', 4),
        DataType(10, 'float64', 'd', 8),
        DataType(11, 'boolean', '?', 1),
        DataType(12, 'macAddress', '6B', 6),
        DataType(13, 'string', 's', 65535),
        DataType(14, 'dateTimeSeconds', 'I', 4),
        DataType(15, 'dateTimeMilliseconds', 'Q', 8),
        DataType(16, 'dateTimeMicroseconds', 'Q', 8),
        DataType(17, 'dateTimeNanoseconds', 'Q', 8),
        DataType(18, 'ipv4Address', '4B', 4),
        DataType(19, 'ipv6Address', '16B', 16),
        None,  # TODO: IPFIXDataType(20,'basicList','B',65535),
        None,  # TODO: IPFIXDataType(21,'subTemplateList','B',65535),
        None,  # TODO: IPFIXDataType(22,'subTemplateMultiList','B',65535)
    ]
    # A cache for element definitions
    elements = {}

    def __init__(self, element_id, enterprise_id=0, length=0, field_name=None, type_name=None, is_scope_field=False):
        """Initialize a TemplateField object

        @type self: TemplateField
        @param element_id: the id which (together with the enterprise_id) uniquely identifies an element
        @param enterprise_id: if set, indicates that this element is enterprise-specific
        @param length: the length (in bytes) of this element in the binary stream
        @param field_name: the element field_name
        @param type_name: the DataType field_name
        @param is_scope_field: if True, this field (in an Option template) is a scope field
        """
        self.id = element_id
        self.enterprise_id = enterprise_id
        self.is_scope_field = is_scope_field
        self.length = length
        self.name = field_name
        self.type = None
        self.type_name = type_name

        key = "%s:%s" % (enterprise_id, element_id)

        if type_name:
            ## Find the actual DataType object
            for t in TemplateField.data_types:
                if t and t.name == type_name:
                    self.type = t
                    break

        if field_name:
            TemplateField.elements[key] = self
        elif key in TemplateField.elements:
            element = TemplateField.elements[key]
            self.name = element.name
            self.type_name = element.type_name
            self.type = element.type

    @classmethod
    def __getitem__(cls, item):
        """Provides a static indexer to get a cached element definition by key.

        @param item: the key for the template field:  {enterprise_id}:{elementId}
        @return: a TemplateField
        """
        return cls.elements[item]

    def __str__(self):
        """Override the string representation of a template field with something that could go into splunk

        @return: the string representation of the TemplateField
        """
        return "Id:{_.id}; Length:{_.length}; EnterpriseId:{_.enterprise_id}; DataType:{_.type_name}; Name:{_.name};". \
            format(_=self)

    import re

    _iespec_re = re.compile("^(?P<name>\w+)\((?:(?P<pen>\d+)/)?(?P<id>\d+)\)<(?P<type>\w+)>(?:\[(?P<size>\d+)\])?")

    @staticmethod
    def load(file_path):
        enterprise_id = 0
        name, ext = path.splitext(file_path)
        if ext == '.iespec':
            with open(file_path) as f:
                for line in f:
                    match = TemplateField._iespec_re.match(line)
                    if match is None:
                        logging.error("%s - invalid iespec line: %s", file_path, line)
                    else:
                        record = match.groupdict()

                        TemplateField.elements[
                            "%s:%s" % (record['pen'] or 0, record['id'])] = \
                            TemplateField(
                                element_id=record['id'],
                                enterprise_id=record['pen'] or 0,
                                field_name=record['name'],
                                type_name=record['type']
                            )
        elif ext == '.xml':
            try:
                spec = ElementTree.parse(file_path)
            except Exception as e:
                logging.error("Unable to parse XML for " + file_path + ": " + str(e))
                return

            if name != "iana":
                # noinspection PyBroadException
                # We cannot allow ANY exceptions to stop our parsing of the rest of the document
                try:
                    registration_rule = spec.getroot().findtext(
                        (".//{http://www.iana.org/assignments}registry[@id='ipfix-information-elements']/"
                         "{http://www.iana.org/assignments}registration_rule"))
                    enterprise_id = int(registration_rule)
                except Exception:
                    # noinspection PyBroadException
                    # We cannot allow ANY exceptions to stop our parsing of the rest of the document
                    try:
                        enterprise_id = int(path.split(path.splitext(file_path)[0])[1])
                    except Exception as e:
                        enterprise_id = 0
                        pass
                    pass
            ## The ipfix might have lots of registries, the one we care about is the ipfix information elements registry
            records = spec.getroot().findall(
                (".//{http://www.iana.org/assignments}registry[@id='ipfix-information-elements']/"
                 "{http://www.iana.org/assignments}record"))
            ## Loop through all the records and insert them with the key = enterprise_id:elementId
            for record in records:
                TemplateField.elements[
                    "%s:%s" % (enterprise_id, record.findtext('{http://www.iana.org/assignments}elementId'))] = \
                    TemplateField(
                        element_id=record.findtext('{http://www.iana.org/assignments}elementId'),
                        enterprise_id=record.findtext(
                            '{http://www.iana.org/assignments}enterprise_id') or enterprise_id,
                        field_name=record.findtext('{http://www.iana.org/assignments}name'),
                        type_name=record.findtext('{http://www.iana.org/assignments}dataType')
                    )

    @staticmethod
    def reload():
        """(Re)parse all the iespec (or xml) files to load information element definitions"""

        TemplateField.elements = {}

        for TEMPLATE_PATH in TEMPLATE_PATHS:
            for root, dirs, files in walk(TEMPLATE_PATH):
                for filename in files:
                    TemplateField.load(path.join(root, filename))


class Template(object):
    """Represents the actual templates received over the wire"""

    def __init__(self, data, bump=0):
        """Initializes a Template from binary data

        @type self: Template
        @param data: The binary data
        @param bump: if non-zero, skip this many bytes after header (for option templates)
        """
        self.id, self.field_count = unpack("!HH", data[0:4])
        self.fields = []
        self.length = 4 + bump

        for field in range(self.field_count):
            element_id, field_length = unpack("!HH", data[self.length:self.length + 4])
            enterprise_id = 0
            if element_id >> 15 == 1:
                element_id ^= 0b1000000000000000  # 0x8000 #
                (enterprise_id,) = unpack("!L", data[self.length + 4:self.length + 8])
                self.length += 8
            else:
                self.length += 4

            # logger.info("Field: {}:{} ({})".format(enterprise_id, element_id, field_length))
            self.fields.append(TemplateField(element_id, enterprise_id, field_length))

    def __len__(self):
        """Override length to return the sum of the field lengths.
         Except in the case of variable length strings, that would be the length (in bytes)
         of data encoded with this template/

        @return: int
        """
        return sum([field.length if field.length < 65535 else 2 for field in self.fields])

    def __str__(self):
        """Override the string representation of a template to print out the fields

        @return: A string representation of the Template
        """
        return ("Template %s with %s fields:\n" % (self.id, self.field_count) +
                "Id    Length Enterprise Type                 Name\n" +
                "\n".join(
                    ["{field.id:<5} {field.length:>6} {field.enterprise_id:<10} {field.type_name:<20} {field.name}"
                    .format(field=field) for field in self.fields]))

    def __getitem__(self, item):
        """Provides an indexer into the Template to return TemplateField objects for each element

        @param item: the index of the field
        @return: A TemplateField object
        """
        return self.fields[item]

    def __iter__(self):
        """Overrides iteration so we iterate the fields

        @return: the fields iterator
        """
        return self.fields.__iter__()


class OptionTemplate(Template):
    def __init__(self, data):
        super(OptionTemplate, self).__init__(data, 2)
        (self.scope_count,) = unpack("!H", data[4:6])
        for field in range(self.field_count):
            self.fields[field].is_scope_field = (field > (self.field_count - self.scope_count))

    def __str__(self):
        return ("OptionTemplate %s with %s fields:\n" % (self.id, len(self.fields)) +
                "Id    Length Enterprise Type                 Name\n" +
                "\n".join(
                    ["{field.id:<5} {field.length:>6} {field.enterprise_id:<10} {field.type_name:<20} {field.name}"
                    .format(field=field) for field in self.fields]))


class CacheMetaClass(type):
    _cache = {}

    def __getitem__(cls, item):
        return cls._cache[item]

    def __setitem__(cls, item, value):
        cls._cache[item] = value

    def __iter__(cls):
        """Overrides iteration so we iterate the fields

        @return: the fields iterator
        """
        return cls._cache.__iter__()


class TemplateCache(object):
    """A cache of received templates"""
    __metaclass__ = CacheMetaClass

    @staticmethod
    def get_template_safe(source, template_id):
        """Gets a template from the cache if it's there (or returns None otherwise)

        @param source: the DataSource representing the sender
        @param template_id: the identity of the template
        @return: the matching Template, or None
        """
        if source in TemplateCache:
            t = TemplateCache[source]
            if template_id in t:
                return t[template_id]
        return None

    @staticmethod
    def parse_template_set(source, data=None):
        """Initialize a TemplateCache with the sender key, the raw binary data, and optionally a logger

        @param source: the DataSource representing the sender
        @param data: the binary data for this set of templates
        """
        if data:
            ## Retrieve the templates we already know about (if there are any)
            templates = TemplateCache[source] if source in TemplateCache else {}
            length = len(data)

            _next = 0
            while _next < length:
                template = Template(data[_next:])
                templates[template.id] = template
                _next += template.length

            ## Store the templates we know about now!
            TemplateCache[source] = templates

    @staticmethod
    def parse_option_template_set(source, data=None):
        """Initialize a collection of OptionTemplates from binary data

        @param source: the DataSource representing the sender
        @param data: the binary data
        """

        if data:
            ## Retrieve the templates we already know about (if there are any)
            templates = TemplateCache[source] if source in TemplateCache else {}
            length = len(data)

            _next = 0
            while _next < length:
                template = OptionTemplate(data[_next:])
                templates[template.id] = template
                _next += template.length

            TemplateCache[source] = templates


TemplateField.reload()
