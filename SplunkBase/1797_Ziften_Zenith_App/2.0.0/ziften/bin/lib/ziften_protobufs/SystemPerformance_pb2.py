# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: SystemPerformance.proto

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import descriptor_pb2
# @@protoc_insertion_point(imports)


import PostgresType_pb2


DESCRIPTOR = _descriptor.FileDescriptor(
  name='SystemPerformance.proto',
  package='',
  serialized_pb='\n\x17SystemPerformance.proto\x1a\x12PostgresType.proto\"\xe7\x03\n\x11SystemPerformance\x12 \n\ttimeStamp\x18\x01 \x02(\x03\x42\r\x82\xb5\x18\ttimestamp\x12\x1b\n\tagentGUID\x18\x02 \x02(\tB\x08\x82\xb5\x18\x04uuid\x12\x12\n\nusedMemory\x18\x03 \x02(\x03\x12\x12\n\nfreeMemory\x18\x04 \x02(\x03\x12\x18\n\x10\x61\x63tualUsedMemory\x18\x05 \x02(\x03\x12\x18\n\x10\x61\x63tualFreeMemory\x18\x06 \x02(\x03\x12\x0f\n\x07userCPU\x18\x07 \x02(\x01\x12\x0e\n\x06sysCPU\x18\x08 \x02(\x01\x12\x0f\n\x07niceCPU\x18\t \x02(\x01\x12\x0f\n\x07idleCPU\x18\n \x02(\x01\x12\x0f\n\x07waitCPU\x18\x0b \x02(\x01\x12\x0e\n\x06irqCPU\x18\x0c \x02(\x01\x12\x13\n\x0b\x63ombinedCPU\x18\r \x02(\x01\x12\x12\n\nfileSystem\x18\x0e \x03(\t\x12\x16\n\x0esizeFileSystem\x18\x0f \x03(\x03\x12\x16\n\x0eusedFileSystem\x18\x10 \x03(\x03\x12\x17\n\x0f\x61vailFileSystem\x18\x11 \x03(\x03\x12\x17\n\x0fmountFileSystem\x18\x12 \x03(\t\x12\x16\n\x0etypeFileSystem\x18\x13 \x03(\t\x12 \n\x0e\x66ileSystemGUID\x18\x14 \x03(\tB\x08\x82\xb5\x18\x04uuid\x12\x0e\n\x06siteId\x18\x15 \x01(\tB>\n\"com.ziften.server.protocol.messageB\x18SystemPerformanceMessage')




_SYSTEMPERFORMANCE = _descriptor.Descriptor(
  name='SystemPerformance',
  full_name='SystemPerformance',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='timeStamp', full_name='SystemPerformance.timeStamp', index=0,
      number=1, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=_descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\ttimestamp')),
    _descriptor.FieldDescriptor(
      name='agentGUID', full_name='SystemPerformance.agentGUID', index=1,
      number=2, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=_descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\004uuid')),
    _descriptor.FieldDescriptor(
      name='usedMemory', full_name='SystemPerformance.usedMemory', index=2,
      number=3, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='freeMemory', full_name='SystemPerformance.freeMemory', index=3,
      number=4, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='actualUsedMemory', full_name='SystemPerformance.actualUsedMemory', index=4,
      number=5, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='actualFreeMemory', full_name='SystemPerformance.actualFreeMemory', index=5,
      number=6, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='userCPU', full_name='SystemPerformance.userCPU', index=6,
      number=7, type=1, cpp_type=5, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='sysCPU', full_name='SystemPerformance.sysCPU', index=7,
      number=8, type=1, cpp_type=5, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='niceCPU', full_name='SystemPerformance.niceCPU', index=8,
      number=9, type=1, cpp_type=5, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='idleCPU', full_name='SystemPerformance.idleCPU', index=9,
      number=10, type=1, cpp_type=5, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='waitCPU', full_name='SystemPerformance.waitCPU', index=10,
      number=11, type=1, cpp_type=5, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='irqCPU', full_name='SystemPerformance.irqCPU', index=11,
      number=12, type=1, cpp_type=5, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='combinedCPU', full_name='SystemPerformance.combinedCPU', index=12,
      number=13, type=1, cpp_type=5, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='fileSystem', full_name='SystemPerformance.fileSystem', index=13,
      number=14, type=9, cpp_type=9, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='sizeFileSystem', full_name='SystemPerformance.sizeFileSystem', index=14,
      number=15, type=3, cpp_type=2, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='usedFileSystem', full_name='SystemPerformance.usedFileSystem', index=15,
      number=16, type=3, cpp_type=2, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='availFileSystem', full_name='SystemPerformance.availFileSystem', index=16,
      number=17, type=3, cpp_type=2, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='mountFileSystem', full_name='SystemPerformance.mountFileSystem', index=17,
      number=18, type=9, cpp_type=9, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='typeFileSystem', full_name='SystemPerformance.typeFileSystem', index=18,
      number=19, type=9, cpp_type=9, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='fileSystemGUID', full_name='SystemPerformance.fileSystemGUID', index=19,
      number=20, type=9, cpp_type=9, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=_descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\004uuid')),
    _descriptor.FieldDescriptor(
      name='siteId', full_name='SystemPerformance.siteId', index=20,
      number=21, type=9, cpp_type=9, label=1,
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
  serialized_start=48,
  serialized_end=535,
)

DESCRIPTOR.message_types_by_name['SystemPerformance'] = _SYSTEMPERFORMANCE

class SystemPerformance(_message.Message):
  __metaclass__ = _reflection.GeneratedProtocolMessageType
  DESCRIPTOR = _SYSTEMPERFORMANCE

  # @@protoc_insertion_point(class_scope:SystemPerformance)


DESCRIPTOR.has_options = True
DESCRIPTOR._options = _descriptor._ParseOptions(descriptor_pb2.FileOptions(), '\n\"com.ziften.server.protocol.messageB\030SystemPerformanceMessage')
_SYSTEMPERFORMANCE.fields_by_name['timeStamp'].has_options = True
_SYSTEMPERFORMANCE.fields_by_name['timeStamp']._options = _descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\ttimestamp')
_SYSTEMPERFORMANCE.fields_by_name['agentGUID'].has_options = True
_SYSTEMPERFORMANCE.fields_by_name['agentGUID']._options = _descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\004uuid')
_SYSTEMPERFORMANCE.fields_by_name['fileSystemGUID'].has_options = True
_SYSTEMPERFORMANCE.fields_by_name['fileSystemGUID']._options = _descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\004uuid')
# @@protoc_insertion_point(module_scope)
