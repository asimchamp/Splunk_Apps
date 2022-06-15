from .. import splindicator
from .. import common
from .. import errors

from BaseObjectType import BaseObjectType


__author__  = "Cedric Le Roux"
__version__ = "1.0.0"
__email__   = "cleroux@splunk.com"


class URIObjectType(BaseObjectType):
    """
<cybox:Properties xsi:type="URIObj:URIObjectType" type="URL">
	<URIObj:Value condition="Equals">www.documents.myPicture.info</URIObj:Value>
</cybox:Properties>

<cybox:Properties xsi:type="URIObject:URIObjectType" type="URL">
	<URIObject:Value condition="Equals" apply_condition="ANY">http://example.com/foo/malicious1.html##comma##http://example.com/foo/malicious2.html##comma##http://example.com/foo/malicious3.html</URIObject:Value>
</cybox:Properties>

object="{'properties': {'value': {'value': ['http://example.com/foo/malicious1.html', 'http://example.com/foo/malicious2.html', 'http://example.com/foo/malicious3.html'], 'apply_condition': 'ANY', 'condition': 'Equals'}, 'type': 'URL', 'xsi:type': 'URIObjectType'}}"
	

{'type': 'URL', 'value': 'http://vezirogullariyapi.com.tr/ven/cfg.bin', 'xsi:type': 'URIObjectType'}
{'type': 'URL', 'value': {'value': 'www.documents.myPicture.info', 'condition': 'Equals'}, 'xsi:type': 'URIObjectType'}
{'type': 'URL', {'value': {'value': ['http://ex....1.html', 'http://exa...us2.html'], 'apply_condition': 'ANY', 'condition': 'Equals'}'xsi:type': 'URIObjectType'}

{'type': 'Domain Name', 'value': {'value': 'mega', 'condition': 'StartsWith'}, 'xsi:type': 'URIObjectType'}
    """

    def parse(self):

	uri_type = common.get_value_from_dict(self.properties, 'type')
	value    = common.get_value_from_dict(self.properties, 'value')

	if uri_type == None :
		raise errors.SpliceError("The URIObject used in object_id=\"%s\" is missing a type." % self.object_id)

	if isinstance(value, basestring):
		value = { 'value': value }

	if not isinstance(value, dict):
		self.log("WARN", "unsupported branching in URIObject")
		return []

	value_value    = common.get_value_from_dict(value, 'value')
	value_condition= common.get_value_from_dict(value, 'condition', 'Equals')
	
	if value_value == None :
		self.log("WARN", "is it possible to not have a value?")
		return []

	si_type = "value"
	si_value= value_value

	# regex
	if value_condition in ['StartsWith', 'EndWith'] : 
		si_type = "regex"
	
		if value_condition == 'StartsWith' :
			si_value= "^%s" % value_value
		if value_condition == 'EndWith': 
			si_value= "%s$" % value_value

	elif value_condition != "Equals" :
		self.log("WARN", "can't handle the condition %s" % value_condition)
		return []

	if uri_type == 'URL' :
		si_value_type = 'url'
	elif uri_type == 'Domain Name' :
		si_value_type = 'domain'
	else:
		self.log("WARN", "can't handle the URIType %s" % uri_type)
		return [] 

	ret = []
	if isinstance(si_value, list) :
		for v in si_value:
			ret.append( splindicator.SPLIndicator(self.object_id, si_type, si_value_type, v) )
	else:
		ret = [ splindicator.SPLIndicator(self.object_id, si_type, si_value_type, si_value) ]

	return ret


