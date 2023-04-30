# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: OSXSoftwareInventory.proto

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import descriptor_pb2
# @@protoc_insertion_point(imports)


import PostgresType_pb2


DESCRIPTOR = _descriptor.FileDescriptor(
  name='OSXSoftwareInventory.proto',
  package='',
  serialized_pb='\n\x1aOSXSoftwareInventory.proto\x1a\x12PostgresType.proto\"\xa6\x03\n\x14OSXSoftwareInventory\x12 \n\ttimeStamp\x18\x01 \x02(\x03\x42\r\x82\xb5\x18\ttimestamp\x12\x1b\n\tagentGUID\x18\x02 \x02(\tB\x08\x82\xb5\x18\x04uuid\x12\x15\n\rimageFilepath\x18\x03 \x02(\t\x12\x13\n\x0b\x66ileVersion\x18\x04 \x02(\t\x12\x17\n\x0f\x66ileDescription\x18\x05 \x02(\t\x12\x13\n\x0b\x63ompanyName\x18\x06 \x02(\t\x12\x13\n\x0bproductName\x18\x07 \x02(\t\x12\x14\n\x0cinternalName\x18\x08 \x02(\t\x12\x16\n\x0elegalCopyright\x18\t \x02(\t\x12\x17\n\x0flegalTrademarks\x18\n \x02(\t\x12\x18\n\x10originalFilename\x18\x0b \x02(\t\x12\x16\n\x0eproductVersion\x18\x0c \x02(\t\x12\x14\n\x0cimageFileMD5\x18\r \x02(\t\x12\x10\n\x08isDeamon\x18\x0e \x02(\x05\x12\x0e\n\x06siteId\x18\x0f \x01(\t\x12\x1b\n\x13sourceModuleMessage\x18\x10 \x01(\t\x12\x12\n\nisDisabled\x18\x11 \x01(\x08\x42\x41\n\"com.ziften.server.protocol.messageB\x1bOSXSoftwareInventoryMessage')




_OSXSOFTWAREINVENTORY = _descriptor.Descriptor(
  name='OSXSoftwareInventory',
  full_name='OSXSoftwareInventory',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='timeStamp', full_name='OSXSoftwareInventory.timeStamp', index=0,
      number=1, type=3, cpp_type=2, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=_descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\ttimestamp')),
    _descriptor.FieldDescriptor(
      name='agentGUID', full_name='OSXSoftwareInventory.agentGUID', index=1,
      number=2, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=_descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\004uuid')),
    _descriptor.FieldDescriptor(
      name='imageFilepath', full_name='OSXSoftwareInventory.imageFilepath', index=2,
      number=3, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='fileVersion', full_name='OSXSoftwareInventory.fileVersion', index=3,
      number=4, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='fileDescription', full_name='OSXSoftwareInventory.fileDescription', index=4,
      number=5, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='companyName', full_name='OSXSoftwareInventory.companyName', index=5,
      number=6, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='productName', full_name='OSXSoftwareInventory.productName', index=6,
      number=7, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='internalName', full_name='OSXSoftwareInventory.internalName', index=7,
      number=8, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='legalCopyright', full_name='OSXSoftwareInventory.legalCopyright', index=8,
      number=9, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='legalTrademarks', full_name='OSXSoftwareInventory.legalTrademarks', index=9,
      number=10, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='originalFilename', full_name='OSXSoftwareInventory.originalFilename', index=10,
      number=11, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='productVersion', full_name='OSXSoftwareInventory.productVersion', index=11,
      number=12, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='imageFileMD5', full_name='OSXSoftwareInventory.imageFileMD5', index=12,
      number=13, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='isDeamon', full_name='OSXSoftwareInventory.isDeamon', index=13,
      number=14, type=5, cpp_type=1, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='siteId', full_name='OSXSoftwareInventory.siteId', index=14,
      number=15, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='sourceModuleMessage', full_name='OSXSoftwareInventory.sourceModuleMessage', index=15,
      number=16, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='isDisabled', full_name='OSXSoftwareInventory.isDisabled', index=16,
      number=17, type=8, cpp_type=7, label=1,
      has_default_value=False, default_value=False,
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
  serialized_start=51,
  serialized_end=473,
)

DESCRIPTOR.message_types_by_name['OSXSoftwareInventory'] = _OSXSOFTWAREINVENTORY

class OSXSoftwareInventory(_message.Message):
  __metaclass__ = _reflection.GeneratedProtocolMessageType
  DESCRIPTOR = _OSXSOFTWAREINVENTORY

  # @@protoc_insertion_point(class_scope:OSXSoftwareInventory)


DESCRIPTOR.has_options = True
DESCRIPTOR._options = _descriptor._ParseOptions(descriptor_pb2.FileOptions(), '\n\"com.ziften.server.protocol.messageB\033OSXSoftwareInventoryMessage')
_OSXSOFTWAREINVENTORY.fields_by_name['timeStamp'].has_options = True
_OSXSOFTWAREINVENTORY.fields_by_name['timeStamp']._options = _descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\ttimestamp')
_OSXSOFTWAREINVENTORY.fields_by_name['agentGUID'].has_options = True
_OSXSOFTWAREINVENTORY.fields_by_name['agentGUID']._options = _descriptor._ParseOptions(descriptor_pb2.FieldOptions(), '\202\265\030\004uuid')
# @@protoc_insertion_point(module_scope)
