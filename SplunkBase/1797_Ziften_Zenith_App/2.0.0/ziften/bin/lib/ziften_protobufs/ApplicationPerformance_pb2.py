# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: ApplicationPerformance.proto

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import descriptor_pb2
# @@protoc_insertion_point(imports)


import PostgresType_pb2


DESCRIPTOR = _descriptor.FileDescriptor(
  name='ApplicationPerformance.proto',
  package='',
  serialized_pb='\n\x1c\x41pplicationPerformance.proto\x1a\x12PostgresType.proto\"\xa4\x02\n\x16\x41pplicationPerformance\x12 \n\ttimeStamp\x18\x01 \x02(\x03\x42\r\x82\xb5\x18\ttimestamp\x12\x1b\n\tagentGUID\x18\x02 \x02(\tB\x08\x82\xb5\x18\x04uuid\x12\x17\n\x0f\x61pplicationName\x18\x03 \x02(\t\x12\x12\n\nsizeMemory\x18\x04 \x02(\x03\x12\x16\n\x0eresidentMemory\x18\x05 \x02(\x03\x12\x14\n\x0csharedMemory\x18\x06 \x02(\x03\x12\x0f\n\x07userCPU\x18\x07 \x02(\x03\x12\x0e\n\x06sysCPU\x18\x08 \x02(\x03\x12\x10\n\x08totalCPU\x18\t \x02(\x03\x12\x12\n\npercentCPU\x18\n \x02(\x01\x12\x19\n\x11numberOfProcesses\x18\x0b \x02(\x05\x12\x0e\n\x06siteId\x18\x0c \x01(\tBC\n\"com.ziften.server.protocol.messageB\x1d\x41pplicationPerformanceMessage')




_APPLICATIONPERFORMANCE = _descriptor.Descriptor(
  name='ApplicationPerformance',
  full_name='ApplicationPerformance',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='timeStamp', full_name='ApplicationPerformance.timeStamp', index=0,
      number=1, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=_descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\ttimestamp')),
    _descriptor.FieldDescriptor(
      name='agentGUID', full_name='ApplicationPerformance.agentGUID', index=1,
      number=2, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=_descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\004uuid')),
    _descriptor.FieldDescriptor(
      name='applicationName', full_name='ApplicationPerformance.applicationName', index=2,
      number=3, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='sizeMemory', full_name='ApplicationPerformance.sizeMemory', index=3,
      number=4, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='residentMemory', full_name='ApplicationPerformance.residentMemory', index=4,
      number=5, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='sharedMemory', full_name='ApplicationPerformance.sharedMemory', index=5,
      number=6, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='userCPU', full_name='ApplicationPerformance.userCPU', index=6,
      number=7, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='sysCPU', full_name='ApplicationPerformance.sysCPU', index=7,
      number=8, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='totalCPU', full_name='ApplicationPerformance.totalCPU', index=8,
      number=9, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='percentCPU', full_name='ApplicationPerformance.percentCPU', index=9,
      number=10, type=1, cpp_type=5, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='numberOfProcesses', full_name='ApplicationPerformance.numberOfProcesses', index=10,
      number=11, type=5, cpp_type=1, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='siteId', full_name='ApplicationPerformance.siteId', index=11,
      number=12, type=9, cpp_type=9, label=1,
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
  serialized_start=53,
  serialized_end=345,
)

DESCRIPTOR.message_types_by_name['ApplicationPerformance'] = _APPLICATIONPERFORMANCE

class ApplicationPerformance(_message.Message):
  __metaclass__ = _reflection.GeneratedProtocolMessageType
  DESCRIPTOR = _APPLICATIONPERFORMANCE

  # @@protoc_insertion_point(class_scope:ApplicationPerformance)


DESCRIPTOR.has_options = True
DESCRIPTOR._options = _descriptor._ParseOptions(descriptor_pb2.FileOptions(), '\n\"com.ziften.server.protocol.messageB\035ApplicationPerformanceMessage')
_APPLICATIONPERFORMANCE.fields_by_name['timeStamp'].has_options = True
_APPLICATIONPERFORMANCE.fields_by_name['timeStamp']._options = _descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\ttimestamp')
_APPLICATIONPERFORMANCE.fields_by_name['agentGUID'].has_options = True
_APPLICATIONPERFORMANCE.fields_by_name['agentGUID']._options = _descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\004uuid')
# @@protoc_insertion_point(module_scope)
