#!/usr/bin/env python

import re
import sys
import json
import iptools

from splice.ioc      import IOC
from splice.config   import Config
from splice.database import DB
from splice.splindicator import SPLIndicator

from bson import ObjectId

from splunklib.searchcommands import \
    dispatch, StreamingCommand, Configuration, Option, validators, Validator

class maplist(Validator):
    pattern = re.compile("^[a-zA-Z0-9_\.\-:,]+$")

    def __call__(self, value):
        value = str(value)
        if maplist.pattern.search(value) is None:
            raise ValueError('Illegal characters in maplist: %s' % value)
        return value


@Configuration()

class IOCSearchCommand(StreamingCommand):
    """
    ...search...| iocsearch map="cs_uri:url,c_ip:ipv4-addr" 
    """
    map = Option(name='map', require=True, validate=maplist())

    def __init__(self):
	super(StreamingCommand, self).__init__()

    def _match_generic(self, event_value, atomic_indicators, field_type):

	if not field_type in atomic_indicators :
		return []

	ret = []
	for atomic in atomic_indicators[field_type]:
                
		# strict match, case sensitive         
		if atomic['type'] == "value" :
			if event_value == atomic['value'] :
				ret.append( atomic )

		# regex matching. we consider all regex valid.
		elif atomic['type'] == "regex" : 
			if re.search(atomic['value'], event_value) :
				ret.append( atomic )
	return ret

    def _match_hash(self, event_value, atomic_indicators, field_type):
	"""
	compare hashes in lowercase.
	"""

	if not field_type in atomic_indicators :
		return []

	ret = []
	for atomic in atomic_indicators[field_type]:
                
		# strict match, case sensitive 
		if atomic['type'] == "value" :
			if event_value.lower() == atomic['value'].lower() :
				ret.append( atomic )

		# regex matching. we consider all regex valid.
		elif atomic['type'] == "regex" : 
			if re.search(atomic['value'], event_value, re.IGNORECASE) :
				ret.append( atomic )
	return ret

    def _match_all_hashes(self, event_value, atomic_indicators):
	"""
	when the user use 'hash' because he has no idea on the type
	of hash to look for.
	its an alias for 'hash-*', dummy implementation.
	"""
	ret       = []
	hash_list = []
	
	for atomic in atomic_indicators:
		if re.search('^hash-', atomic) :
			hash_list.append(atomic)

	# testing every hashes
	for hash_type in hash_list:
		for atomic in atomic_indicators[hash_type]:

			# strict match, case sensitive 
			if atomic['type'] == "value" :
				if event_value.lower() == atomic['value'].lower() :
					ret.append( atomic )

			# regex matching. we consider all regex valid.
			elif atomic['type'] == "regex" : 
				if re.search(atomic['value'], event_value, re.IGNORECASE) :
					ret.append( atomic )
	return ret


    def _match_ipv4(self, event_value, atomic_indicators, field_type):
	"""
	NOTE: regex on IPs is not supported.
	
	TODO: 
	- externalize the ip range construction to avoid building it a each call of this function.
	- enhance input validation at IOC ingestion to avoid errornous IPs.
	"""

	# no need to bother if event_value is not an IPv4-(range,addr,cidr)
	if (field_type == 'ipv4-addr') and not (iptools.ipv4.validate_ip(event_value)):
		return []
	if (field_type == 'ipv4-cidr') and not (iptools.ipv4.validate_cidr(event_value)):
		return []
	if (field_type == 'ipv4-range'):
		(start, end) = event_value.split('-') # IP1-IP2 
		if (not iptools.ipv4.validate_ip(start)) or (not iptools.ipv4.validate_ip(end)) :
			return []

	# standardize IPs for comparaison
	# key: iptools.IpRange(IP1, IP2)
	# value: atomic indicator
	ipranges = {}

	# transforms CIDR in BLOCKS/RANGES.
	if 'ipv4-cidr' in atomic_indicators:
		for atomic in atomic_indicators['ipv4-cidr']:
			(start, end) = iptools.ipv4.cidr2block( atomic['value'] ) # IP/MASK
			ipranges[ iptools.IpRange(start, end) ] = atomic

	# append IPs RANGES
	if 'ipv4-range' in atomic_indicators:
		for atomic in atomic_indicators['ipv4-range']:
			(start, end) = atomic['value'].split('-') # IP1-IP2
			ipranges[ iptools.IpRange(start, end) ] = atomic

	# transform IPs in BLOCKS/RANGES
	if 'ipv4-addr' in atomic_indicators:
		for atomic in atomic_indicators['ipv4-addr']:
			ip = atomic['value']
			if iptools.ipv4.validate_ip( ip ):
				ipranges[ iptools.IpRange( ip ) ] = atomic

	# Here, ipranges contains only IpRange of all know ipv4-* (cidr, range, addr)
	# is the given value in there?
	ret = []
	if field_type == 'ipv4-addr' :
		for r in ipranges:
			if event_value in r:
				ret.append( ipranges[r] )

	elif (field_type == 'ipv4-cidr') or (field_type == 'ipv4-range') :

		if field_type == 'ipv4-range' :
			(start, end) = event_value.split('-') # IP1-IP2
		else:
			(start, end) = iptools.ipv4.cidr2block(event_value)
		
		# block match if start _and_ end are in the same known range.
		for r in ipranges:
			if (start in r) and (end in r) :
				ret.append( ipranges[r] )
	return ret

		

    def match(self, spldb, event_value, atomic_indicators, field_type):
	"""
	event_value: value from the log line to evaluate
	atomic_indicators: dict of all atomic indicators by type
	field_type: type of atomic indicators from the map (ipv4-addr, domain, ...)

	atomic_indicators={
	  'indicator_id' : 'fireeye:object-d322039c-6858-4913-b031-76a3b8a67dce', 
	  'value' : 'abcd120719.6600.org', 
	  'type'  : 'value'
	  ....
	}

	return a list of found atomic indicators.
	"""
	res = []
	if re.search('^ipv4-', field_type) :
		res = self._match_ipv4(event_value, atomic_indicators, field_type)
	elif re.search('^hash', field_type) :

		if field_type == 'hash' :
			res = self._match_all_hashes(event_value, atomic_indicators)
		else:
			res = self._match_hash(event_value, atomic_indicators, field_type)
	else:
		res = self._match_generic(event_value, atomic_indicators, field_type)


	# enhancing atomic indicators with time infos and stanza name
	ret = []
	for atomic in res:
		fields = spldb.extend_atomic_indicator_fields_from_raw_id( atomic['raw_id'] )
		atomic.update(fields)
		
		ret.append( atomic )
	return ret

    def stream(self, events):

	splice_conf = Config()
	db_connection_uri = splice_conf.get_mongo_connection_uri()

	spldb = DB(db_connection_uri)
	spldb.connect()

	# map="cs_uri:url,c_ip:ipv4-addr"
	map_per_fields = {}
	map_per_types  = {}
		
	splind = SPLIndicator()

	for m in self.map.split(","):
		(k,v) = m.split(":")
		v = v.lower()

		if k in map_per_fields :
			raise ValueError('duplicate entry in the map list (field=%s)' % k)
		map_per_fields[ k ]=v

		if not v in map_per_types :
			map_per_types[ v ] = []
		map_per_types[ v ].append( k )

	# NOTE:
	# we assume all atomic indicators fit in memory.
	# As we can only read one time the events (log lines) received by the custom search command,
	# we load all atomic indicators in memory, per value_type.
	# Atomic indicators are lightweight versions of IOCs so we should be able to sustain few 
	# millions of them in memory.

	atomic_indicators = spldb.get_atomic_indicators_per_value_type()

	for event in events:

		matching_indicators = []

		# {'dest': 'ipv4-addr', 'source': 'domain', 'src': 'ipv4-addr'}
		for field in map_per_fields:
			field_type = map_per_fields[ field ] # ipv4-addr, domain, url, ...

			# case we have multiple log types and not necessarly every fields
			if not field in event:
				continue

			# it may happens, let's skip empty fields.
			if re.search("^\s*$", event[field]) :
				continue

			# match www.input.url.tld vs url for example
			matching_indicators += self.match(spldb, event[field], atomic_indicators, field_type)
	

		# filter out results, remove duplicates. It will happend when multiple fields in 
		# the same event will match the very same indicator (like an ipv4-cidr for example)
		uniq = {}
		for indicator in matching_indicators:

			# convert ObjectId to String as it's not serialisable
			for (k,v) in indicator.iteritems():
				if type(v) == ObjectId :
					indicator[k] = str(v)
			# serialize
			x = json.dumps(indicator)
			uniq[ x ] = 1
		matching_indicators = []
		for indicator in uniq.keys():
			matching_indicators.append( json.loads(indicator) )

		# NOTE: all event gets a new field 'ioc_indicators_count' which indicate the number of
		# matching atomic indicators. 
		event['ioc_indicators_count'] = len(matching_indicators)
		
		# NOTE: when we add a field in event array, it must exist in every events or Splunk
		# will discard it. As we don't know in advance the number of IOCs that will match, 
		# we just create a generic json output fields for the results. Users will simply 
		# parse it using spath command.
		event['ioc_indicators_json'] = json.dumps(matching_indicators)

		# FIXME: for an unknown reason if we use "| fields ioc_indicators_json" after
		# an iocsearch call, the field ioc_indicators_json is erased.

		yield event

dispatch(IOCSearchCommand, sys.argv, sys.stdin, sys.stdout, __name__)

