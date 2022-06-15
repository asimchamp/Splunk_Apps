#!/usr/bin/env python
# -*- coding: utf-8 -*-
	
# FIXME
# The self.service.request() cannot be replaced by self.service.post() because an
# error is thrown about the content-type even if its correctly set. It's a SDK issue.
# - the public SDK ignore the submitted content type.
#
# splunklib.binding.HTTPError: HTTP 400 Bad Request -- Must supply 'Content-Type' header set to 'application/json'
#
# req = self.service.post('storage/collections/data/chunks/batch_save', headers=self.json_header, body=json.dumps(bulk_chunks))
# 

import os
import re
import json

import splunklib.client as client

from gsfb.logger import GSBLogger
from datetime    import datetime, timedelta

class Cache(object):

    def __init__(self, checkpoint_dir='/tmp', fair_update=True, logger=None, user='admin', 
			password=None, host='localhost', port=8089, app='gsfb', owner='nobody'):

	self.logger = GSBLogger(logger)

	if isinstance(fair_update, basestring) :
		if fair_update in ['1', 'True'] :
			self.respect_update_interval = True
		else:
			self.respect_update_interval = False
	else:
		self.respect_update_interval = fair_update

	if not os.path.isdir(checkpoint_dir) :
		raise ValueError("%s is not a directory" % checkpoint_dir)

	self.authorized_update_file = os.path.join(checkpoint_dir, 'gsfb_next_authorized_update')

   	# this will throw an error in case of login failure. 
	self.service = client.connect(
		host     = host,
		port     = int(port),
		username = user,
		password = password,
		app      = app,
		owner    = owner
	)


    def expand_chunk_numbers(self, chunk_list):
	"""
	'1-3,5-6,8,11,13-19,22' => [1, 2, 3, 5, 6, 8, 11, 13, 14, 15, 16, 17, 18, 19, 22]
	"""
	ret   = []
	items = chunk_list.split(',')
	for item in items:
		tmp = item.split('-')
		if len(tmp) == 2 :
			b = int( tmp.pop() )
			a = int( tmp.pop() )
		elif len(tmp) == 1 :
			a = int( tmp.pop() )
			b = int(a) + 1
		else:
			raise ValueError("whoops expand_chunk_numbers")


		for i in range(a, b):
			ret.append( i )

	return ret


    def collapse_chunk_numbers(self, chunks):
	"""
	[1, 2, 3, 5, 6, 8, 11, 13, 14, 15, 16, 17, 18, 19, 22] => '1-3,5-6,8,11,13-19,22'
	"""
	l = len(chunks)
	if l == 0 :
		return ''
	elif l == 1 :
		return int(chunks.pop())

        chunks.sort()

	a = int(chunks.pop(0))
        c = a
	s = ""

	in_range = False
	while len(chunks) > 0 :
	
		b = int(chunks.pop(0))

		# move forward in the range
		if (b-c) == 1 :
			in_range = True
			c = b 
			if len(chunks) > 0 :
				continue

		if in_range :
			s += '%s-%s,' % (a,c)
		else:
			s += '%s,' % a

		# end of tab
		if (len(chunks) == 0) and (b != c):
			s += '%s' % b

		# reset	
		in_range = False
		a = b  
		c = a 

	return re.sub(',$', '', s)


    def update_next_authorized_run(self, seconds):
	"""
	value is in seconds
	"""
	now = datetime.now()
	n   = now + timedelta(seconds=int(seconds))

	self.logger.write("INFO","(%s) next authorized update: %s" % (__file__, str(n)))

	try:
		fd = open(self.authorized_update_file, "wb")
		fd.write(str(n))
		fd.close()
	except Exception, e:
		raise e


    def allowed_to_run(self):

	if not self.respect_update_interval :
		return True

	if not os.path.isfile(self.authorized_update_file) :
		return True

	try:
		fd = open(self.authorized_update_file, "rb")
		l  = fd.readline().strip()
		fd.close()
	except Exception, e:
		raise e

	n = datetime.now()
	if n < datetime.strptime(l, '%Y-%m-%d %H:%M:%S.%f') :
		self.logger.write("WARN","(%s) not allowed to run yet. Next authorized update: %s, Now: %s" % (__file__, l, str(n)) )
		return False

	return True


    def reset(self, listname):
	# TODO
	# remove everything linked to listname
	# basically: rm -rf /tmp/dev-next-gen/goog-malware-shavar/	
	# basically: rm -rf store_dir + list_name
	self.logger.write("ERROR","(%s) whoops, not implemented" % (__file__))

    def remove_chunks(self, list_name, chunk_type, chunk_list):
	"""
	list_name : goopub-malware-shavar
	chunk_type: add | sub
	chunk_list: 1-3,4,6
	"""
	chunks_to_remove = self.expand_chunk_numbers(chunk_list)

	for c_id in chunks_to_remove:
		self.logger.write("INFO", "(%s) removing chunk: chunk_number=%s chunk_type=%s list_name=%s" % (__file__,c_id,chunk_type,list_name))
		q = {
		  'list_name'   : list_name,
		  'chunk_type'  : chunk_type,
		  'chunk_number': c_id,
		}

		r    = self.service.get('storage/collections/data/chunks', output_mode="json", query=json.dumps(q) )
		data = json.loads(r.body.read())
		if len(data) == 0 : 
			raise ValueError("cannot remove chunk, no match: %s" % q)
		chunk_key = data[0]['_key']

		# To delete the prefixes, we have to retrieve all the _key values
		# first because the kvstore ignore the 'body' on delete.
		r    = self.service.get('storage/collections/data/prefixes', output_mode="json", query=json.dumps({'chunk_key':chunk_key}) )
		data = json.loads(r.body.read())
		for row in data:
			k = row['_key']
			self.logger.write("DEBUG", "removing prefix with _key=%s" % k)

			req = self.service.request(
				'storage/collections/data/prefixes/%s' % k,
				method  = 'DELETE',
				headers = [('content-type', 'application/json')], 
			)

		# remove the chunk
		self.logger.write("DEBUG", "removing chunk with _key=%s" % chunk_key)

		req = self.service.request(
			'storage/collections/data/chunks/%s' % chunk_key,
			method  = 'DELETE',
			headers = [('content-type', 'application/json')], 
		)

		# TODO FIXME - remove the hashes



    def store_chunk(self, list_name, chunk):
	"""
	chunk = {
		'chunk_type': 'sub', 
		'chunk_number': 186791, 
		'chunk_prefix_length': 4,
		'chunk_hashes': ['eedf78dc', '26eef488', '8e6dbf9e', '08d886a7', '5a17ecc9'], 
	}

	return True if OK, False otherwise.
	"""

	# First, insert the chunk
	n_prefixes = len(chunk['chunk_hashes'])
	c = {
	'chunk_number'  : chunk['chunk_number'],
	'chunk_type'    : chunk['chunk_type'],
	'list_name'     : list_name,
	'prefixes_count': n_prefixes,
	}

	self.logger.write("INFO", "(%s) inserting chunk: chunk_number=%s chunk_type=%s list_name=%s prefixes=%s" % (__file__,chunk['chunk_number'],chunk['chunk_type'],list_name, n_prefixes))

	req = self.service.request(
	    'storage/collections/data/chunks',
	    method  = 'POST',
	    headers = [('content-type', 'application/json')], 
	    body    = json.dumps(c),
	)

	# get the _key attribute of the inserted chunk
	r = json.loads(req.body.read())
	chunk_key = r['_key']

	# Then, insert the prefixes
	prefixes = []
	for h in chunk['chunk_hashes']:

		prefixes.append( {
		'prefix' : h,
		'prefix_length' : chunk['chunk_prefix_length'],
		'chunk_key'     : chunk_key,
		} )
	
	# by default Splunk limit to 1,000 documents to be saved in a single batch_save
	# see limits.conf - max_documents_per_batch_save
	n_prefixes = len(prefixes)

	for i in range(0, n_prefixes, 1000):
		req = self.service.request(
		    'storage/collections/data/prefixes/batch_save',
		    method  = 'POST',
		    headers = [('content-type', 'application/json')], 
		    body    = json.dumps(prefixes[i:i+1000]),
		)

	return True



    def getKnownChunksList(self, lists):
	"""
	lists: dict

	return a formated string:
	<listname>:<known chunks>\n
	\n
	"""

	if isinstance(lists, basestring) :
		tmp = lists.split(",")
		lists = []
		for item in tmp:
			lists.append( item.strip() )

	known_chunks = {}
	for li in lists:
		known_chunks[ li ] = {}

		# by default we are limited by the KVStore to 10,000 events
		has_results = True
		skip = 0
		while has_results :

			r = self.service.get('storage/collections/data/chunks', output_mode="json", query=json.dumps({'list_name': li}), skip=(skip*10000), limit=10000)
			data = json.loads(r.body.read())

			self.logger.write("INFO", "(%s) getting existing %s chunks for %s (skip=%s)" % (__file__, len(data), li, skip))
			skip += 1

			if len(data) == 0 or len(data)<10000:
				has_results = False

			for row in data:
				c_type = row['chunk_type']
				c_id   = row['chunk_number']

				if not c_type in known_chunks[ li ] :
					known_chunks[ li ][c_type] = []
				known_chunks[ li ][c_type].append( c_id )


	# data[pouet-shavar] = {'add':[...], 'sub':[....]}
	ret = ""
	for list_name in known_chunks:
		tmp  = []
		for (chunk_type, chunks) in known_chunks[ list_name ].iteritems():
			self.logger.write("INFO", "(%s) list %s has %s known %s chunks" % (__file__,list_name,len(chunks),chunk_type))
			if len(chunks) > 0:
				s = "%s:%s" % (chunk_type[0], self.collapse_chunk_numbers(chunks))
				tmp.append( s )

		ret += "%s;%s\n" % (list_name, ":".join(tmp))

	return ret + '\n'
	

    def ProcessData(self, data):

	new_chunks = 0

	for msg in data:
		c_type = msg['chunk_type']

		if c_type == 'new' :
			self.store_chunk(msg['list_name'], msg['chunk'])
			new_chunks += 1

		elif c_type == 'next_update' :
			self.update_next_authorized_run( msg['seconds'] )

		elif c_type in ['adddel', 'subdel']  :
			self.remove_chunks(msg['list_name'], c_type[0:3], msg['chunk_list'])

		elif c_type == 'reset' :
			self.reset( msg['list_name'] )

		else:
			self.logger.write("ERROR", "(%s) unrecognized c_type: %s" % (__file__, msg) )
			raise ValueError("unrecognized event: %s" % msg)

	return new_chunks

