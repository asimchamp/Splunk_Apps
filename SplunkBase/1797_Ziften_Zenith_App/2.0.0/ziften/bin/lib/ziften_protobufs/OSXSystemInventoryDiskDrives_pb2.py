# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: OSXSystemInventoryDiskDrives.proto

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import descriptor_pb2
# @@protoc_insertion_point(imports)


import PostgresType_pb2


DESCRIPTOR = _descriptor.FileDescriptor(
  name='OSXSystemInventoryDiskDrives.proto',
  package='',
  serialized_pb='\n\"OSXSystemInventoryDiskDrives.proto\x1a\x12PostgresType.proto\"\xf2\x01\n\x1cOSXSystemInventoryDiskDrives\x12 \n\ttimeStamp\x18\x01 \x02(\x03\x42\r\x82\xb5\x18\ttimestamp\x12\x1b\n\tagentGUID\x18\x02 \x02(\tB\x08\x82\xb5\x18\x04uuid\x12 \n\x0e\x64iskDrivesGUID\x18\x03 \x02(\tB\x08\x82\xb5\x18\x04uuid\x12\r\n\x05model\x18\x04 \x03(\t\x12\x0f\n\x07\x63\x61ption\x18\x05 \x03(\t\x12\x10\n\x08\x64\x65viceID\x18\x06 \x03(\t\x12\x15\n\rinterfaceType\x18\x07 \x03(\t\x12\x18\n\x04size\x18\x08 \x03(\tB\n\x82\xb5\x18\x06\x62igint\x12\x0e\n\x06siteId\x18\t \x01(\tBI\n\"com.ziften.server.protocol.messageB#OSXSystemInventoryDiskDrivesMessage')




_OSXSYSTEMINVENTORYDISKDRIVES = _descriptor.Descriptor(
  name='OSXSystemInventoryDiskDrives',
  full_name='OSXSystemInventoryDiskDrives',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='timeStamp', full_name='OSXSystemInventoryDiskDrives.timeStamp', index=0,
      number=1, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=_descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\ttimestamp')),
    _descriptor.FieldDescriptor(
      name='agentGUID', full_name='OSXSystemInventoryDiskDrives.agentGUID', index=1,
      number=2, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=_descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\004uuid')),
    _descriptor.FieldDescriptor(
      name='diskDrivesGUID', full_name='OSXSystemInventoryDiskDrives.diskDrivesGUID', index=2,
      number=3, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=_descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\004uuid')),
    _descriptor.FieldDescriptor(
      name='model', full_name='OSXSystemInventoryDiskDrives.model', index=3,
      number=4, type=9, cpp_type=9, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='caption', full_name='OSXSystemInventoryDiskDrives.caption', index=4,
      number=5, type=9, cpp_type=9, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='deviceID', full_name='OSXSystemInventoryDiskDrives.deviceID', index=5,
      number=6, type=9, cpp_type=9, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='interfaceType', full_name='OSXSystemInventoryDiskDrives.interfaceType', index=6,
      number=7, type=9, cpp_type=9, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='size', full_name='OSXSystemInventoryDiskDrives.size', index=7,
      number=8, type=9, cpp_type=9, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=_descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\006bigint')),
    _descriptor.FieldDescriptor(
      name='siteId', full_name='OSXSystemInventoryDiskDrives.siteId', index=8,
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
  serialized_start=59,
  serialized_end=301,
)

DESCRIPTOR.message_types_by_name['OSXSystemInventoryDiskDrives'] = _OSXSYSTEMINVENTORYDISKDRIVES

class OSXSystemInventoryDiskDrives(_message.Message):
  __metaclass__ = _reflection.GeneratedProtocolMessageType
  DESCRIPTOR = _OSXSYSTEMINVENTORYDISKDRIVES

  # @@protoc_insertion_point(class_scope:OSXSystemInventoryDiskDrives)


DESCRIPTOR.has_options = True
DESCRIPTOR._options = _descriptor._ParseOptions(descriptor_pb2.FileOptions(), '\n\"com.ziften.server.protocol.messageB#OSXSystemInventoryDiskDrivesMessage')
_OSXSYSTEMINVENTORYDISKDRIVES.fields_by_name['timeStamp'].has_options = True
_OSXSYSTEMINVENTORYDISKDRIVES.fields_by_name['timeStamp']._options = _descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\ttimestamp')
_OSXSYSTEMINVENTORYDISKDRIVES.fields_by_name['agentGUID'].has_options = True
_OSXSYSTEMINVENTORYDISKDRIVES.fields_by_name['agentGUID']._options = _descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\004uuid')
_OSXSYSTEMINVENTORYDISKDRIVES.fields_by_name['diskDrivesGUID'].has_options = True
_OSXSYSTEMINVENTORYDISKDRIVES.fields_by_name['diskDrivesGUID']._options = _descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\004uuid')
_OSXSYSTEMINVENTORYDISKDRIVES.fields_by_name['size'].has_options = True
_OSXSYSTEMINVENTORYDISKDRIVES.fields_by_name['size']._options = _descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\006bigint')
# @@protoc_insertion_point(module_scope)
