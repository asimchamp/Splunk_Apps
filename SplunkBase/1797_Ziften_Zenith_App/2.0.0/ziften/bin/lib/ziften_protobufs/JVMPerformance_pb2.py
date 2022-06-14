# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: JVMPerformance.proto

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import descriptor_pb2
# @@protoc_insertion_point(imports)


import PostgresType_pb2


DESCRIPTOR = _descriptor.FileDescriptor(
  name='JVMPerformance.proto',
  package='',
  serialized_pb='\n\x14JVMPerformance.proto\x1a\x12PostgresType.proto\"\x9e\x03\n\x0eJVMPerformance\x12 \n\ttimeStamp\x18\x01 \x02(\x03\x42\r\x82\xb5\x18\ttimestamp\x12\x1b\n\tagentGUID\x18\x02 \x02(\tB\x08\x82\xb5\x18\x04uuid\x12\x17\n\x0f\x61pplicationName\x18\x03 \x02(\t\x12\x11\n\tprocessId\x18\x04 \x02(\x03\x12\x15\n\rclassesLoaded\x18\x05 \x02(\x03\x12\x1a\n\x12totalClassesLoaded\x18\x06 \x02(\x03\x12\x17\n\x0f\x63lassesUnloaded\x18\x07 \x02(\x03\x12\x10\n\x08heapUsed\x18\x08 \x02(\x03\x12\x15\n\rheapCommitted\x18\t \x02(\x03\x12\x13\n\x0bheapMaximum\x18\n \x02(\x03\x12\x13\n\x0bnonHeapUsed\x18\x0b \x02(\x03\x12\x18\n\x10nonHeapCommitted\x18\x0c \x02(\x03\x12\x16\n\x0enonHeapMaximum\x18\r \x02(\x03\x12\x13\n\x0bliveThreads\x18\x0e \x02(\x03\x12\x13\n\x0bpeakThreads\x18\x0f \x02(\x03\x12\x16\n\x0ethreadsStarted\x18\x10 \x02(\x03\x12\x0e\n\x06siteId\x18\x11 \x01(\tB;\n\"com.ziften.server.protocol.messageB\x15JVMPerformanceMessage')




_JVMPERFORMANCE = _descriptor.Descriptor(
  name='JVMPerformance',
  full_name='JVMPerformance',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='timeStamp', full_name='JVMPerformance.timeStamp', index=0,
      number=1, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=_descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\ttimestamp')),
    _descriptor.FieldDescriptor(
      name='agentGUID', full_name='JVMPerformance.agentGUID', index=1,
      number=2, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=_descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\004uuid')),
    _descriptor.FieldDescriptor(
      name='applicationName', full_name='JVMPerformance.applicationName', index=2,
      number=3, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='processId', full_name='JVMPerformance.processId', index=3,
      number=4, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='classesLoaded', full_name='JVMPerformance.classesLoaded', index=4,
      number=5, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='totalClassesLoaded', full_name='JVMPerformance.totalClassesLoaded', index=5,
      number=6, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='classesUnloaded', full_name='JVMPerformance.classesUnloaded', index=6,
      number=7, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='heapUsed', full_name='JVMPerformance.heapUsed', index=7,
      number=8, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='heapCommitted', full_name='JVMPerformance.heapCommitted', index=8,
      number=9, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='heapMaximum', full_name='JVMPerformance.heapMaximum', index=9,
      number=10, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='nonHeapUsed', full_name='JVMPerformance.nonHeapUsed', index=10,
      number=11, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='nonHeapCommitted', full_name='JVMPerformance.nonHeapCommitted', index=11,
      number=12, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='nonHeapMaximum', full_name='JVMPerformance.nonHeapMaximum', index=12,
      number=13, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='liveThreads', full_name='JVMPerformance.liveThreads', index=13,
      number=14, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='peakThreads', full_name='JVMPerformance.peakThreads', index=14,
      number=15, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='threadsStarted', full_name='JVMPerformance.threadsStarted', index=15,
      number=16, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='siteId', full_name='JVMPerformance.siteId', index=16,
      number=17, type=9, cpp_type=9, label=1,
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
  serialized_start=45,
  serialized_end=459,
)

DESCRIPTOR.message_types_by_name['JVMPerformance'] = _JVMPERFORMANCE

class JVMPerformance(_message.Message):
  __metaclass__ = _reflection.GeneratedProtocolMessageType
  DESCRIPTOR = _JVMPERFORMANCE

  # @@protoc_insertion_point(class_scope:JVMPerformance)


DESCRIPTOR.has_options = True
DESCRIPTOR._options = _descriptor._ParseOptions(descriptor_pb2.FileOptions(), '\n\"com.ziften.server.protocol.messageB\025JVMPerformanceMessage')
_JVMPERFORMANCE.fields_by_name['timeStamp'].has_options = True
_JVMPERFORMANCE.fields_by_name['timeStamp']._options = _descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\ttimestamp')
_JVMPERFORMANCE.fields_by_name['agentGUID'].has_options = True
_JVMPERFORMANCE.fields_by_name['agentGUID']._options = _descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\004uuid')
# @@protoc_insertion_point(module_scope)
