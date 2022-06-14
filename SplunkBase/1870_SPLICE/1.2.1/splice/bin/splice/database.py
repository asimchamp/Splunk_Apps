#!/usr/bin/env python
import time
import pymongo

import pytz
import tzlocal

from datetime import datetime
from bson.objectid import ObjectId
from stix.utils.parser import UnsupportedVersionError, UnknownVersionError

from splunklib.modularinput.event_writer import EventWriter

from ioc import IOC
from errors import *

class DB:
    """ Simple wrapper for MongoDB """

    def __init__(self, connection_uri):
	self.uri = connection_uri
	self.ew = EventWriter() # ew.log("INFO", "Hello !")

    def connect(self):
	"""
	Establish the connection with the mongo by asking the default db. 
	"""
	try:
		self.client = pymongo.MongoClient(self.uri)
		# this ensure we throw an exception if we don't have set a database in the uri
		self.db = self.client.get_default_database()
	except Exception, e:
		raise e

    def get_iocs_to_parse(self):
	"""
	Return the IOCs having parse_flag set to True.
	"""
	res = self.db['raw'].find({'parse_flag':True})
	ret = []
	for r in res:
		i = IOC()
		i.from_dict( r )
		ret.append( i )
	return ret

    def get_csv_list_of_atomic_indicators(self, value_type):
	
	res = self.db['atomic_indicators'].find({'value_type':value_type}, {"indicator_id":1, "value":1, "_id":0})
	ret = {}
	for r in res:
		ret[ r['value'] ] = r['indicator_id']
	return ret

    def get_number_of_iocs(self):
	""" Return the number of RAW IOCs stored in the Mongo """
	res = self.db['raw'].find({}).count()
	return res

    def get_number_of_indicators_per_type(self):
	res = self.db['atomic_indicators'].aggregate([{"$group": {"_id": "$value_type", "count": {"$sum": 1}}}])
	if not 'result' in res :
		return []
	ret = []
	for r in res['result']:
		ret.append( {'value_type': r['_id'], 'count': r['count']} )
	return ret

    def get_number_of_iocs_having_parsing_issues(self):
	res = self.db['raw'].find({'parsing_failed':True}).count()
	return res
	
    def toggle_indicator_state(self, raw_id, ioc_id, indicator_id, indicator_raw_id, set_all_flag):
	"""
	set_all_flag:
	override the default behavior to set all indicators to the specified value (enabled, disabled)
	"""
	indicator_raw_id_objects = []
	for ind in indicator_raw_id:
		indicator_raw_id_objects.append(ObjectId( ind ))

	raw_id_objects = []      
	for ind in raw_id:
		raw_id_objects.append(ObjectId( ind ))

	q = {
	'$or' : [ 
		{'indicator_id': { '$in': indicator_id } },
		{'_id': { '$in': indicator_raw_id_objects } },
		{'raw_id' : { '$in': raw_id_objects } },
		{'ioc_id' : { '$in': ioc_id } }
		]
	}
	res = self.db['atomic_indicators'].find(q, {'_id':1, 'enabled':1})

	counter = 0

	if set_all_flag in ['enabled', 'disabled'] :
		for r in res:
			counter += 1
			if set_all_flag == 'enabled' :
				self.db['atomic_indicators'].update({'_id': r['_id']}, {'$set':{'enabled':True}})
			else:
				self.db['atomic_indicators'].update({'_id': r['_id']}, {'$set':{'enabled':False}})

	else:
		for r in res:
			counter += 1

			if (not 'enabled' in r) or (r['enabled']):
				self.db['atomic_indicators'].update({'_id': r['_id']}, {'$set':{'enabled':False}})
				continue
			self.db['atomic_indicators'].update({'_id': r['_id']}, {'$set':{'enabled':True}})

	return counter


    def get_all_raw_ids(self):
	ret = {}
	res = self.db['raw'].find({},{'_id':1})
	for r in res:
		ret[ r['_id'] ] = 1
 	return ret.keys()

    def get_raw_id_list_by_ioc_id_list(self, id_list):
	ret = {}
	for id in id_list:
		res = self.db['raw'].find({'ioc_id': id},{'_id':1})

		if res == None :
			continue

		for r in res:
			ret[ r['_id'] ] = 1
	return ret.keys()

    def get_ioc_by_raw_id(self, id):
	ioc = self.db['raw'].find_one({'_id': id})
	if ioc == None :
		return []
	# rename the mongo key
	ioc['raw_id'] = ioc.pop('_id', None) 
	return ioc

    def _to_remove_get_raw_ioc_by_ioc_id(self, ioc_id):
	"""
	in: one ioc_id
	out: ioc json
	"""

	ioc = self.db['raw'].find_one({'_id': ObjectId(ioc_id)})
	if ioc == None :
		return []

	ioc['ioc_id'] = ioc.pop('_id', None) # we can't have a Splunk key '_id'so we rename it.
	return ioc

    def get_raw_id_list_by_raw_id_string_list(self, id_list = []):
	# take a list of raw_id as strings and retrieve the existing ObjectId
	ret = {}
	for id in id_list:
		res = self.db['raw'].find({'_id':ObjectId(id)},{'_id':1})

		if res == None :
			continue

		for r in res:
			ret[ r['_id'] ] = 1
	return ret.keys()

    def get_raw_id_list_by_indicator_raw_id_list(self, id_list = []):
	ret = {}
	for id in id_list:
		res = self.db['atomic_indicators'].find({'_id': ObjectId(id)},{'raw_id':1})

		if res == None :
			continue

		for r in res:
			ret[ r['raw_id'] ] = 1
	return ret.keys()

    def get_raw_id_list_by_indicator_id_list(self, id_list = []):
	ret = {}
	for id in id_list:
		res = self.db['atomic_indicators'].find({'indicator_id': id},{'raw_id':1})

		if res == None :
			continue

		for r in res:
			ret[ r['raw_id'] ] = 1
	return ret.keys()

    def get_iocs_by_object_id(self, object_id):
	"""
	in: one object_id
	out: array of iocs
	"""
	res = self.db['atomic_indicators'].aggregate([{'$match': {'object_id': object_id}}, {"$group": {"_id": "$ioc_id", "count": {"$sum": 1}}}])

	if not 'result' in res :
		return []

	ret = []
	for r in res['result']:
		#ioc = self.get_raw_ioc_by_ioc_id( r['_id'] )
		ioc = self.get_ioc_by_raw_id( r['_id'] )
		ret.append( ioc )

	return ret

    def get_stanza_name_from_raw_id(self, id):

	res = self.db['raw'].find_one({'_id':ObjectId(id)},{'stanza_name':1})
	if res == None:
		return "None"
	return res['stanza_name']

    def get_indicators_that_match_regex(self, regex, ignoreCase=False, displayDisabled=False):
	"""
	do not return disabled indicators by default.
	"""
	query = { 'value': { '$regex': regex } }
	if ignoreCase:
		query = { 'value': { '$regex': regex, '$options': 'i' } }

	res = self.db['atomic_indicators'].find( query )
	if res == None :
		return []

	ret = []
	for r in res:

		if ((not 'enabled' in r) or (r['enabled'])) or displayDisabled :

			r['indicator_raw_id'] = r.pop('_id', None)
			r['stanza_name'] = self.get_stanza_name_from_raw_id(r['raw_id'])

			ret.append(r)
	return ret

    def get_list_iocs_sharing_indicators(self):
	"""
	Return a list of IOCs and the number of indicators they share with other IOCs.
	"""
	#FIXME - broken since new IDs logic.
	# used by iocstats. File Objects are splitted in 2 (hash, filename, etc)
	# so they trigger the condition.

	res = self.db['atomic_indicators'].aggregate([{"$group":{"_id": '$indicator_id', "count": {"$sum": 1}}}, {'$match': {'count': {'$gt': 1}}}])
	ret = []

	if not 'result' in res :
		return ret

	for r in res['result']:
		# ignore objects null
		if r['_id'] == None :
			continue
		o =  {
			'indicator_id': r['_id'],
			'number_of_ioc_refering_it': int(r['count']),
		}
		ret.append(o)
	return ret

    def parse_iocs(self):
	"""
	This method should be called after IOC are inserted in db. This will:
	1. Get the list of IOCs to parse
	2. For each of them, set the parse_flag to False
	3. Parse it (extract context info and atomic indicators)
	"""

	raw_iocs = self.get_iocs_to_parse()
	for ioc in raw_iocs:
		# iterate through atomic indicators
		try:
			# large IOCs take time to parse, to avoid multiple concurrent parsing we
			# immediatly set them as parsed. Moreover, if parsing fails we never try
			# to parse it again so it doesn't change the logic.
			self.mark_ioc_as_parsed(ioc)

			n = ioc.extract_contextual_information()

			raw_id = ioc.get_raw_id()
			ioc_id = ioc.get_ioc_id()

			self.ew.log("INFO", "extracted %s contextual information for IOC with id=\"%s\" (raw_id=\"%s\")" % (n, ioc_id,raw_id))

			n = ioc.extract_atomic_indicators(self) # TODO, self ?
			self.ew.log("INFO", "extracted %s atomic indicators from IOC with id=\"%s\" (raw_id=\"%s\")" % (n, ioc_id, raw_id))

		except UnsupportedVersionError, e:
			self.mark_ioc_as_unparsable(ioc, e.message)
		except UnknownVersionError, e:
			self.mark_ioc_as_unparsable(ioc, e.message)
		except UnrecognizedIOCFormatError, e:
			self.mark_ioc_as_unparsable(ioc, e.message)
		except Exception, e:
			raise ValueError("ERROR=[%s]" % e)

    def get_atomic_indicators_per_value_type(self):
	"""
	return a dict like {'ipv4-addr':[], 'ipv4-range':[], ..}
	ignore disabled indicators
	"""
	value_types = self.db['atomic_indicators'].distinct( 'value_type' )

	ret_array = {}
	for v in value_types:
		res = self.db['atomic_indicators'].find({'value_type':v}) #, {'_id':0, 'ioc_id':0})
		ret = []
		for r in res:
			# ignoring disabled indicators.
			if ('enabled' in r) and not r['enabled'] :
				continue

			r['indicator_raw_id'] = r.pop('_id', None)
			ret.append( r )
		ret_array[ v ] = ret
	return ret_array

    def extend_atomic_indicator_fields_from_raw_id(self, raw_id):

	raw_fields = {
		'_id':0,
		'modification_time':1,
		'creation_time':1,
		'revision':1,
		'stanza_name':1
	}
	res = self.db['raw'].find_one({'_id': raw_id}, raw_fields)

	if res == None :
		return []
	return res


    def mark_ioc_as_unparsable(self, ioc, err_msg):
	ioc_id = ioc.get_ioc_id()
	raw_id = ioc.get_raw_id()

	self.ew.log("WARN", "unparsable IOC (id=\"%s\", raw_id=\"%s\") - err_msg=\"%s\"" % (ioc_id, raw_id, err_msg))
	ioc.set_parse_flag(False)
	ioc.add_key('parsing_failed', True)
	ioc.add_key('parsing_error', err_msg)

	self.db['raw'].update( {'_id': raw_id}, ioc.to_dict())


    def mark_ioc_as_parsed(self, ioc):
	""" change the flag parse_me to false """
	self.ew.log("INFO", "IOC parsed (id=\"%s\", raw_id=\"%s\")" % (ioc.get_ioc_id(),ioc.get_raw_id()))
	ioc.set_parse_flag(False)
	self.db['raw'].update( {'_id': ioc.get_raw_id()}, ioc.to_dict())

    def store_ioc(self, ioc): 
	"""
	Store the ioc Object in the Mongo DB. The update flag should be considered only with flat IOC files
	because the file path is used as the key. 
	#NOTE: UPDATE IS NO MORE REQUIRED WITH THE NEW SYSTEM OF IDS
	collections: raw (flat IOC), contextual (IOC Headers), atomic_indicators (IOC Indicators)
	"""
	if not isinstance(ioc, IOC) :
		return False

	if ioc.content_is_none() :
		return False

	# NOTE: 
	# maybe the update flag can go away as the update process should only
	# happen for IOC having existing IDs.
	# > consequence of the new IDs system in SPLICE v1.1


	# if raw_id is set, then update (it shouldn't be the case)
	raw_id = ioc.get_raw_id()
	if raw_id != None :
		res = self.db['raw'].find_one( {'_id': raw_id} )

		if res != None : 
			self.ew.log("INFO", "updating IOC based on a known raw_id (%s)." % raw_id)
			ioc.set_revision(int(res['revision']) +1)
			ioc.set_modification_time(time.time())
			self.db['raw'].update( {'_id':raw_id}, ioc.to_dict()) 

			return True

	# known path, then update
	path = ioc.get_path()
	if path != None :
		res = self.db['raw'].find_one( {'path': path} )

		if res != None :
			self.ew.log("INFO", "updating IOC based on a known file path (%s)." % path)
			raw_id = res['_id']
			ioc.set_revision(int(res['revision']) +1)
			ioc.set_modification_time(time.time())
			self.db['raw'].update( {'_id':raw_id}, ioc.to_dict()) 

			return True

	# no path, no raw_id, just a new doc.
	raw_id = self.db['raw'].insert( ioc.to_dict() )
	ioc.set_raw_id(raw_id)

	return True

    def update_ioc_id(self, raw_id, ioc_id):
	if ioc_id == None :
		return
	
	ioc = self.db['raw'].find_one({'_id':raw_id})
	if ioc  == None  :
		return
	
	ioc['ioc_id'] = ioc_id
	self.db['raw'].update( {'_id':raw_id}, ioc)


    def store_splindicator(self, raw_id, ioc_id, atomic):
	"""
	SPLIndicator are Splunk Atomic Indicators.

        indicator_id : example:Address-f2bb9d4e-b0f8-41ad-98ee-c6c5f561b7ea
               value : 59.49.205.113
                type : value
          value_type : ipv4-addr
	"""
	if not isinstance(atomic, list) :
		raise ValueError("store_splindicator() is expecting a list as input, not a %s." % type(atomic))

	# 1- remove all known indicators associated with this ioc_id
	self.db['atomic_indicators'].remove({'ioc_id':ioc_id, 'raw_id':raw_id})

	# 2- insert all new indicators
	for a in atomic:
		a.set_ioc_id( ioc_id )
		a.set_raw_id( raw_id )

		self.db['atomic_indicators'].insert(a.to_dict())

    def get_taxii_last_timestamp_label(self, taxii_feed_id):
	"""
	Return the last timestamp label used by the taxii feed to filter results.
	Return January 1st 1970 if not existing.
	"""
	try:
		# datetime().replace(tzinfo) is not correctly working.
		tz_local = tzlocal.get_localzone()
		tz       = pytz.timezone(str(tz_local))

		res = self.db['taxii_state'].find_one( {'feed': taxii_feed_id}, {'_id':0} )

		if res == None :
			dt = datetime(1970, 1, 1, 0, 0, 0, 0)
		else:
			dt = datetime.strptime(res['timestamp_label'], "%Y-%m-%d %H:%M:%S")

		dt_utc   = pytz.utc.localize( dt )
		dt_local = dt_utc.astimezone(tz)

		return dt_local
	except Exception, e:
		raise e

    def update_taxii_last_timestamp_label(self, feed_id):
	"""
	Update the last timestamp label for the specified feed id.
	"""
	try:
		#t = datetime.today().strftime("%Y-%m-%d %H:%M:%S")
		tz_local = tzlocal.get_localzone()
		tz       = pytz.timezone(str(tz_local))
		dt       = tz.localize(datetime.now())

		# store the datetime value in UTC
		temp = dt.astimezone(pytz.UTC)
		t    = temp.strftime("%Y-%m-%d %H:%M:%S")
	
		self.db['taxii_state'].update({'feed':feed_id}, {'$set': {'timestamp_label':t}}, upsert=True)
	except Exception, e:
		raise e


