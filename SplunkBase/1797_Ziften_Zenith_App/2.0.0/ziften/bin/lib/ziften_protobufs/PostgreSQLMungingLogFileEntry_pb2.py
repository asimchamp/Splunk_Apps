# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: PostgreSQLMungingLogFileEntry.proto

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import descriptor_pb2
# @@protoc_insertion_point(imports)


import PostgresType_pb2


DESCRIPTOR = _descriptor.FileDescriptor(
  name='PostgreSQLMungingLogFileEntry.proto',
  package='',
  serialized_pb='\n#PostgreSQLMungingLogFileEntry.proto\x1a\x12PostgresType.proto\"\xe3\x01\n\x1dPostgreSQLMungingLogFileEntry\x12 \n\ttimeStamp\x18\x01 \x02(\x03\x42\r\x82\xb5\x18\ttimestamp\x12\x1b\n\tagentGUID\x18\x02 \x02(\tB\x08\x82\xb5\x18\x04uuid\x12\x0f\n\x07logfile\x18\x03 \x02(\t\x12\x10\n\x08severity\x18\x04 \x02(\x05\x12\x0f\n\x07message\x18\n \x02(\t\x12\x0c\n\x04uuid\x18\x0b \x02(\t\x12\x10\n\x08\x64\x61tetime\x18\x0c \x02(\t\x12\x0e\n\x06latest\x18\r \x02(\t\x12\x0f\n\x07longest\x18\x0e \x02(\t\x12\x0e\n\x06siteId\x18\x0f \x01(\tBJ\n\"com.ziften.server.protocol.messageB$PostgreSQLMungingLogFileEntryMessage')




_POSTGRESQLMUNGINGLOGFILEENTRY = _descriptor.Descriptor(
  name='PostgreSQLMungingLogFileEntry',
  full_name='PostgreSQLMungingLogFileEntry',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='timeStamp', full_name='PostgreSQLMungingLogFileEntry.timeStamp', index=0,
      number=1, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=_descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\ttimestamp')),
    _descriptor.FieldDescriptor(
      name='agentGUID', full_name='PostgreSQLMungingLogFileEntry.agentGUID', index=1,
      number=2, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=_descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\004uuid')),
    _descriptor.FieldDescriptor(
      name='logfile', full_name='PostgreSQLMungingLogFileEntry.logfile', index=2,
      number=3, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='severity', full_name='PostgreSQLMungingLogFileEntry.severity', index=3,
      number=4, type=5, cpp_type=1, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='message', full_name='PostgreSQLMungingLogFileEntry.message', index=4,
      number=10, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='uuid', full_name='PostgreSQLMungingLogFileEntry.uuid', index=5,
      number=11, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='datetime', full_name='PostgreSQLMungingLogFileEntry.datetime', index=6,
      number=12, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='latest', full_name='PostgreSQLMungingLogFileEntry.latest', index=7,
      number=13, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='longest', full_name='PostgreSQLMungingLogFileEntry.longest', index=8,
      number=14, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='siteId', full_name='PostgreSQLMungingLogFileEntry.siteId', index=9,
      number=15, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  options=None,
  is_extendable=False,
  extension_ranges=[],
  serialized_start=60,
  serialized_end=287,
)

DESCRIPTOR.message_types_by_name['PostgreSQLMungingLogFileEntry'] = _POSTGRESQLMUNGINGLOGFILEENTRY

class PostgreSQLMungingLogFileEntry(_message.Message):
  __metaclass__ = _reflection.GeneratedProtocolMessageType
  DESCRIPTOR = _POSTGRESQLMUNGINGLOGFILEENTRY

  # @@protoc_insertion_point(class_scope:PostgreSQLMungingLogFileEntry)


DESCRIPTOR.has_options = True
DESCRIPTOR._options = _descriptor._ParseOptions(descriptor_pb2.FileOptions(), '\n\"com.ziften.server.protocol.messageB$PostgreSQLMungingLogFileEntryMessage')
_POSTGRESQLMUNGINGLOGFILEENTRY.fields_by_name['timeStamp'].has_options = True
_POSTGRESQLMUNGINGLOGFILEENTRY.fields_by_name['timeStamp']._options = _descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\ttimestamp')
_POSTGRESQLMUNGINGLOGFILEENTRY.fields_by_name['agentGUID'].has_options = True
_POSTGRESQLMUNGINGLOGFILEENTRY.fields_by_name['agentGUID']._options = _descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\004uuid')
# @@protoc_insertion_point(module_scope)
