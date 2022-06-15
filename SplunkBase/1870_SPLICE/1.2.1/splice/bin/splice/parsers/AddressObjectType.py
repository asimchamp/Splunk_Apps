from .. import splindicator
from .. import common
from .. import errors

from BaseObjectType import BaseObjectType

__author__  = "Cedric Le Roux"
__version__ = "1.0.0"
__email__   = "cleroux@splunk.com"

class AddressObjectType(BaseObjectType):
    """
    in : CybOX Object
    out: array of SPLIndicator: [ SPLindicator(), ... ]

    seen values:
	'address_value': '174.139.20.35'
	'address_value': {'condition': 'Equals', 'value': '82.192.86.44'}
	'address_value': {'pattern_type': 'Regex', 'value': '192\\.168\\.1\\.(0|1|2)'}
	'address_value': {'apply_condition': 'ANY', 'condition': 'Equals', 'value': ['10.0.0.0', '10.0.0.1']}

    range:
	'address_value': {'condition': 'InclusiveBetween', 'value': ['101.80.0.0', '101.95.255.255']}

	ConditionTypeEnum = Equals|DoesNotEqual|Contains|DoesNotContain|StartsWith|EndsWith|...
	ConditionApplicationEnum = ANY|ALL|NONE
	PatternTypeEnum = Regex|Binary|XPath
    """
    def parse_ipv4(self):

	address_value = common.get_value_from_dict(self.properties, 'address_value')
	if address_value == None:
		return []

	# Address_Value inherit from cyboxCommon:StringObjectPropertyType
	apply_condition = common.get_value_from_dict(address_value, 'apply_condition')
	pattern_type    = common.get_value_from_dict(address_value, 'pattern_type')
	condition       = common.get_value_from_dict(address_value, 'condition', 'Equals')

	if isinstance(address_value, dict):
		value = common.get_value_from_dict(address_value, 'value')
		if value == None :
			return []
	else:
		# the simplest AddressObject
		value = address_value


	value_list = []
	if isinstance(value, basestring):
		value_list.append( value )
	else:
		# the 'properties' array already contains splitted values (##comma##)
		value_list = value 

	ret = []
	# Those are IPs !
	if pattern_type == None :

		# IP Range, "from-to" notation
		if condition == "InclusiveBetween" :

			if len(value_list) != 2 :
				raise errors.SpliceError("unsupported IP Range with condition InclusiveBetween")

			self.log("INFO", "IP Range (From-To): %s - %s" % (value_list[0], value_list[1]))
			ret.append( splindicator.SPLIndicator(self.object_id, 'value', 'ipv4-range', "%s-%s" % (value_list[0], value_list[1])) )

		# IP List
		else:
			for v in value_list:
				ret.append( splindicator.SPLIndicator(self.object_id, 'value', 'ipv4-addr', v) )

	# treat the IP as a string pattern.
	if pattern_type == "Regex" :
		for v in value_list:
			ret.append( splindicator.SPLIndicator(self.object_id, 'regex', 'ipv4-addr', v) )

	return ret



    def parse_cidr(self):

	address_value = common.get_value_from_dict(self.properties, 'address_value')
	if address_value == None:
		return []

	# Address_Value inherit from cyboxCommon:StringObjectPropertyType
	apply_condition = common.get_value_from_dict(address_value, 'apply_condition')
	pattern_type    = common.get_value_from_dict(address_value, 'pattern_type')
	condition       = common.get_value_from_dict(address_value, 'condition', 'Equals')

	if isinstance(address_value, dict):
		value = common.get_value_from_dict(address_value, 'value')
		if value == None :
			return []
	else:
		# the simplest AddressObject
		value = address_value


	value_list = []
	if isinstance(value, basestring):
		value_list.append( value )
	else:
		# the 'properties' array already contains splitted values (##comma##)
		value_list = value 
	

	ret = []

	# treat the IP as a string pattern.
	if pattern_type == "Regex" :
		for v in value_list:
			ret.append( splindicators.SPLIndicator(self.object_id, 'regex', 'ipv4-cidr', v) )

	# Those are IP CIDRs !
	if pattern_type == None :
		"""
		Over Engineered scenario that STIX allows:
		ipv4-cidr object with range formating (1.2.3.4/32 - 1.3.0.0/16)
		> valid, but ridiculous (would probably be a mistake in most cases).
		"""

		# IP Range, "from-to" notation
		if condition == "InclusiveBetween" :

			if len(value_list) != 2 :
				raise errors.SpliceError("unsupported IP Range with condition InclusiveBetween (object_id=%s)" % self.object_id)
				return []

			self.log("INFO", "CIDR IP Range (From-To): %s - %s" % (value_list[0], value_list[1]))
			
			# only store the lowest and highest 
			(low_min, low_max)   = iptools.ipv4.cidr2block(value_list[0])
			(high_min, high_max) = iptools.ipv4.cidr2block(value_list[1])
			ret.append( splindicators.SPLIndicator(self.object_id, 'value', 'ipv4-range', "%s-%s" % (low_min, high_max)) )

		# CIDR List
		else:
			for v in value_list:
				if iptools.ipv4.validate_cidr( v ) :
					ret.append( splindicators.SPLIndicator(self.object_id, 'value', 'ipv4-cidr', v) )
				else:
					raise errors.SpliceError("Invalid IPv4 CIDR: %s (object_id=%s)" % (v, self.object_id))
	return ret



    def parse(self):
	category = common.get_value_from_dict(self.properties, 'category', 'ipv4-addr')

	if category == 'ipv4-addr' :
		return self.parse_ipv4()
	elif category == 'cidr' :
		return self.parse_cidr()
	else:
		self.log("WARN", "unsupported category %s" % category)
	return []

