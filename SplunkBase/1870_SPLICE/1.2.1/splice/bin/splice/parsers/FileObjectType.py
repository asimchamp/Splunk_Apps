from ..splindicator import SPLIndicator
from .. import common
from .. import errors

from BaseObjectType import BaseObjectType
    
__author__  = "Cedric Le Roux"
__version__ = "1.0.0"
__email__   = "cleroux@splunk.com"


class FileObjectType(BaseObjectType):
    """
	NOTES: 
	- This is a very simple implementation to handle simple hashes from samples.
	- All hashes are converted to lowercase


	seen: 
	{'hashes': [{'simple_hash_value': 'f7bb9fe955bf88e02992b86b7ee898e7', 'type': {'xsi:type': None, 'value': 'MD5'}}], 'xsi:type': 'FileObjectType'}
	{'hashes': [{'simple_hash_value': '1f0dbe50b1d.....1626ee8c9bbc1224', 'type': 'SHA256'], 'xsi:type': 'FileObjectType'}
	{'file_name': 'us-embedded.exe', 'xsi:type': 'FileObjectType', 'hashes': [{'type': {'value': 'MD5', 'xsi:type': None}, 'simple_hash_value': {'value': 'CB3DCDE34FD9FF0E19381D99B02F9692', 'condition': 'Equals'}}], 'size_in_bytes': 23040L}
	{'hashes': [{'type': {'value': 'MD5', 'condition': 'Equals'}, 'simple_hash_value': {'value': ['01234567890abcdef01234567890abcdef', 'abcdef1234567890abcdef1234567890', '00112233445566778899aabbccddeeff'], 'apply_condition': 'ANY', 'condition': 'Equals'}}], 'xsi:type': 'FileObjectType'}
    """

    def parse_hashes(self, hashes):

	ret = []
	for h in hashes:
		simple_hash_value = common.get_value_from_dict(h, 'simple_hash_value')
		hash_type         = common.get_value_from_dict(h, 'type')
	
		if isinstance(simple_hash_value, dict):
			d = simple_hash_value
			simple_hash_value = common.get_value_from_dict(d, 'value')
			condition         = common.get_value_from_dict(d, 'condition', 'Equals')

			if condition != 'Equals':
				self.log("INFO", "unsupported FileObjectType properties associations with condition %s" % condition)
				continue

		if isinstance(hash_type, basestring): # 'hashes': [{'type': 'SHA256', ..}]
			hash_type_value = hash_type
		else: #  'hashes': [{'type': {'xsi:type': None, 'value': 'MD5'}, ..}]
			hash_type_value   = common.get_value_from_dict(hash_type, 'value')

		if simple_hash_value == None or hash_type_value == None :
			self.log("WARN", "FileObject(property='hashes') format not understood")
			return []


		# list of hashes
		if isinstance(simple_hash_value, list):
			# if its a list we create more than one atomic indicator
			for h in simple_hash_value:
				ret.append( SPLIndicator(self.object_id, 'value', 'hash-%s' % hash_type_value.lower(), h.lower()) )
		else:
			ret.append( SPLIndicator(self.object_id, 'value', 'hash-%s' % hash_type_value.lower(), simple_hash_value.lower()) )
	return ret




    def parse(self):

	hashes    = common.get_value_from_dict(self.properties, 'hashes')
	file_name = common.get_value_from_dict(self.properties, 'file_name') 
	
	ret = []

	# 1- Parsing Hashes
	if hashes != None :
		r = self.parse_hashes(hashes)
		ret.extend(r)

	# 2- Parsing file names
	if file_name != None :
		if isinstance(file_name, basestring) :
			ret.append( SPLIndicator(self.object_id, 'value', 'filename', file_name) )
		else:
			self.log("WARN", "FileObject having a type(file_name) != basestring is not supported.")
	return ret


