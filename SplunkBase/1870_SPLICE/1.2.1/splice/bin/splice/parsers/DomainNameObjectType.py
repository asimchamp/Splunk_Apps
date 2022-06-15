from .. import splindicator
from .. import common
from .. import errors

from BaseObjectType import BaseObjectType

__author__  = "Cedric Le Roux"
__version__ = "1.0.0"
__email__   = "cleroux@splunk.com"


class DomainNameObjectType(BaseObjectType):
    """
    {'xsi:type': 'DomainNameObjectType', 'type': 'FQDN', 'value': 'dedydns.ns01.us'}
    {'xsi:type': 'DomainNameObjectType', 'type': 'FQDN', 'value': 'hk.2012yearleft.com'}
    {'xsi:type': 'DomainNameObjectType', 'type': 'FQDN', 'value': 'www.dhcpserver.ns01.us'}
    value : {'apply_condition': 'ANY', 'condition': 'Equals', 'value': ['malicious1.ex.com', 'malicious2.ex.com', ...]}
    """

    def parse(self):

	value = common.get_value_from_dict(self.properties, 'value')
	type  = common.get_value_from_dict(self.properties, 'type', 'FQDN')

	if isinstance(value, basestring):
		return [ splindicator.SPLIndicator(self.object_id, 'value', 'domain', value) ]
	
	# if we arrive here the value should be of type dict
	value_value     = common.get_value_from_dict(value, 'value')
	condition       = common.get_value_from_dict(value, 'condition', 'Equals')
	pattern_type    = common.get_value_from_dict(value, 'pattern_type')
	apply_condition = common.get_value_from_dict(value, 'apply_condition')

	value_list = []
	if isinstance(value_value, basestring):
		value_list.append( value_value )
	else:
		# the 'properties' array already contains splitted values (##comma##)
		value_list = value_value 

	ret = []
	# Those are FQDNs !
	if pattern_type == None :
		for v in value_list:
			ret.append( splindicator.SPLIndicator(self.object_id, 'value', 'domain', v) )

	# treat the FQDN as a string pattern.
	if pattern_type == "Regex" :
		for v in value_list:
			ret.append( splindicator.SPLIndicator(self.object_id, 'regex', 'domain', v) )

	return ret

