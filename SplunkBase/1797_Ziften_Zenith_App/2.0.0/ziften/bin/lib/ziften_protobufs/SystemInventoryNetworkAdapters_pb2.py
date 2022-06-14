# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: SystemInventoryNetworkAdapters.proto

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import descriptor_pb2
# @@protoc_insertion_point(imports)


import PostgresType_pb2


DESCRIPTOR = _descriptor.FileDescriptor(
  name='SystemInventoryNetworkAdapters.proto',
  package='',
  serialized_pb='\n$SystemInventoryNetworkAdapters.proto\x1a\x12PostgresType.proto\"\x8a\x02\n\x1eSystemInventoryNetworkAdapters\x12 \n\ttimeStamp\x18\x01 \x02(\x03\x42\r\x82\xb5\x18\ttimestamp\x12\x1b\n\tagentGUID\x18\x02 \x02(\tB\x08\x82\xb5\x18\x04uuid\x12%\n\x13networkAdaptersGUID\x18\x03 \x02(\tB\x08\x82\xb5\x18\x04uuid\x12\x13\n\x0b\x61\x64\x61pterName\x18\x04 \x03(\t\x12\x1a\n\x12\x61\x64\x61pterDescription\x18\x05 \x03(\t\x12\x12\n\nMACAddress\x18\x06 \x03(\t\x12\x13\n\x0bIPV4Address\x18\x07 \x03(\t\x12\x18\n\x10isPrimaryAdapter\x18\x08 \x03(\x08\x12\x0e\n\x06siteId\x18\t \x01(\tBK\n\"com.ziften.server.protocol.messageB%SystemInventoryNetworkAdaptersMessage')




_SYSTEMINVENTORYNETWORKADAPTERS = _descriptor.Descriptor(
  name='SystemInventoryNetworkAdapters',
  full_name='SystemInventoryNetworkAdapters',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='timeStamp', full_name='SystemInventoryNetworkAdapters.timeStamp', index=0,
      number=1, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=_descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\ttimestamp')),
    _descriptor.FieldDescriptor(
      name='agentGUID', full_name='SystemInventoryNetworkAdapters.agentGUID', index=1,
      number=2, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=_descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\004uuid')),
    _descriptor.FieldDescriptor(
      name='networkAdaptersGUID', full_name='SystemInventoryNetworkAdapters.networkAdaptersGUID', index=2,
      number=3, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=_descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\004uuid')),
    _descriptor.FieldDescriptor(
      name='adapterName', full_name='SystemInventoryNetworkAdapters.adapterName', index=3,
      number=4, type=9, cpp_type=9, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='adapterDescription', full_name='SystemInventoryNetworkAdapters.adapterDescription', index=4,
      number=5, type=9, cpp_type=9, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='MACAddress', full_name='SystemInventoryNetworkAdapters.MACAddress', index=5,
      number=6, type=9, cpp_type=9, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='IPV4Address', full_name='SystemInventoryNetworkAdapters.IPV4Address', index=6,
      number=7, type=9, cpp_type=9, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='isPrimaryAdapter', full_name='SystemInventoryNetworkAdapters.isPrimaryAdapter', index=7,
      number=8, type=8, cpp_type=7, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='siteId', full_name='SystemInventoryNetworkAdapters.siteId', index=8,
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
  serialized_start=61,
  serialized_end=327,
)

DESCRIPTOR.message_types_by_name['SystemInventoryNetworkAdapters'] = _SYSTEMINVENTORYNETWORKADAPTERS

class SystemInventoryNetworkAdapters(_message.Message):
  __metaclass__ = _reflection.GeneratedProtocolMessageType
  DESCRIPTOR = _SYSTEMINVENTORYNETWORKADAPTERS

  # @@protoc_insertion_point(class_scope:SystemInventoryNetworkAdapters)


DESCRIPTOR.has_options = True
DESCRIPTOR._options = _descriptor._ParseOptions(descriptor_pb2.FileOptions(), '\n\"com.ziften.server.protocol.messageB%SystemInventoryNetworkAdaptersMessage')
_SYSTEMINVENTORYNETWORKADAPTERS.fields_by_name['timeStamp'].has_options = True
_SYSTEMINVENTORYNETWORKADAPTERS.fields_by_name['timeStamp']._options = _descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\ttimestamp')
_SYSTEMINVENTORYNETWORKADAPTERS.fields_by_name['agentGUID'].has_options = True
_SYSTEMINVENTORYNETWORKADAPTERS.fields_by_name['agentGUID']._options = _descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\004uuid')
_SYSTEMINVENTORYNETWORKADAPTERS.fields_by_name['networkAdaptersGUID'].has_options = True
_SYSTEMINVENTORYNETWORKADAPTERS.fields_by_name['networkAdaptersGUID']._options = _descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\004uuid')
# @@protoc_insertion_point(module_scope)
