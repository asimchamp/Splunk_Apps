# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: FileContents.proto

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import descriptor_pb2
# @@protoc_insertion_point(imports)


import PostgresType_pb2


DESCRIPTOR = _descriptor.FileDescriptor(
  name='FileContents.proto',
  package='',
  serialized_pb='\n\x12\x46ileContents.proto\x1a\x12PostgresType.proto\"\xf0\x01\n\x0c\x46ileContents\x12 \n\ttimeStamp\x18\x01 \x02(\x03\x42\r\x82\xb5\x18\ttimestamp\x12\x1b\n\tagentGUID\x18\x02 \x02(\tB\x08\x82\xb5\x18\x04uuid\x12\x15\n\rimageFilePath\x18\x03 \x02(\t\x12\x14\n\x0c\x66ileContents\x18\x04 \x02(\x0c\x12\x18\n\x10\x43reatedTimeStamp\x18\x05 \x01(\x03\x12\x19\n\x11ModifiedTimeStamp\x18\x06 \x01(\x03\x12\x14\n\x0cimageFileMD5\x18\x07 \x02(\t\x12\x19\n\x11\x63ommandIdentifier\x18\x08 \x02(\x04\x12\x0e\n\x06siteId\x18\t \x01(\tB9\n\"com.ziften.server.protocol.messageB\x13\x46ileContentsMessage')




_FILECONTENTS = _descriptor.Descriptor(
  name='FileContents',
  full_name='FileContents',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='timeStamp', full_name='FileContents.timeStamp', index=0,
      number=1, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=_descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\ttimestamp')),
    _descriptor.FieldDescriptor(
      name='agentGUID', full_name='FileContents.agentGUID', index=1,
      number=2, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=_descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\004uuid')),
    _descriptor.FieldDescriptor(
      name='imageFilePath', full_name='FileContents.imageFilePath', index=2,
      number=3, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='fileContents', full_name='FileContents.fileContents', index=3,
      number=4, type=12, cpp_type=9, label=2,
      has_default_value=False, default_value="",
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='CreatedTimeStamp', full_name='FileContents.CreatedTimeStamp', index=4,
      number=5, type=3, cpp_type=2, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='ModifiedTimeStamp', full_name='FileContents.ModifiedTimeStamp', index=5,
      number=6, type=3, cpp_type=2, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='imageFileMD5', full_name='FileContents.imageFileMD5', index=6,
      number=7, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='commandIdentifier', full_name='FileContents.commandIdentifier', index=7,
      number=8, type=4, cpp_type=4, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='siteId', full_name='FileContents.siteId', index=8,
      number=9, type=9, cpp_type=9, label=1,
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
  serialized_start=43,
  serialized_end=283,
)

DESCRIPTOR.message_types_by_name['FileContents'] = _FILECONTENTS

class FileContents(_message.Message):
  __metaclass__ = _reflection.GeneratedProtocolMessageType
  DESCRIPTOR = _FILECONTENTS

  # @@protoc_insertion_point(class_scope:FileContents)


DESCRIPTOR.has_options = True
DESCRIPTOR._options = _descriptor._ParseOptions(descriptor_pb2.FileOptions(), '\n\"com.ziften.server.protocol.messageB\023FileContentsMessage')
_FILECONTENTS.fields_by_name['timeStamp'].has_options = True
_FILECONTENTS.fields_by_name['timeStamp']._options = _descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\ttimestamp')
_FILECONTENTS.fields_by_name['agentGUID'].has_options = True
_FILECONTENTS.fields_by_name['agentGUID']._options = _descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\004uuid')
# @@protoc_insertion_point(module_scope)
