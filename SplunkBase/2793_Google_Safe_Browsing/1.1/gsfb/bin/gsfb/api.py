#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import struct
import urllib


import gsfb.ChunkData_pb2 as ChunkData_pb2

from StringIO import StringIO
from gsfb.logger import GSBLogger

class GoogleSafeBrowsing(object):

    def __init__(self, key=None, appver='1.0.0', pver='3.0', logger=None):

	if key == None :
		raise ValueError('You need to provide an API key.')

	self.api_key   = key
	self.clientver = appver
	self.pver      = pver

	self.logger = GSBLogger(logger)
	#self.logger.write("DEBUG", "__init__(%s)" % __file__)


    def DiscoverLists(self):
	"""
	Clients use this to discover the available list types.
	Ex:
	- goog-malware-shavar
	- goog-regtest-shavar
	- goog-unwanted-shavar
	- goog-whitedomain-shavar
	- googpub-phish-shavar
	"""
	req_url  = "https://safebrowsing.google.com/safebrowsing/list"
	req_url += "?client=api&key=%s&appver=%s&pver=%s" % (self.api_key, self.clientver, self.pver)

	u = urllib.urlopen(req_url, urllib.urlencode({}))
	if u.getcode() != 200 :
		self.logger.write("ERROR", "failed to retrieve the lists on %s (status code=%s)" % (req_url, u.getcode()))
		raise ValueError("failed to retrieve the lists on %s (status code=%s)" % (req_url, u.getcode()))

	content = u.readlines()

	lists = []
	for line in content:
		lists.append( line.strip() )
	self.logger.write("INFO", "(%s) discovered lists: %s" % (__file__, ", ".join(lists)))
	return lists

    def RequestLists(self, lists, validate_names=False):
	"""
	parse the string lists to get an array of requested lists used by RequestData()
	optionnaly validate the name of each list by using DiscoverLists()
	"""
	self.logger.write("INFO", "(%s) requesting lists: %s" % (__file__, lists))

	tmp = lists.split(",")

	_lists = {}
	for li in tmp:
		_lists[ li.strip() ] = 1

	if validate_names :
		all = self.DiscoverLists()

		for li in _lists.keys():
			if not li in all:
				msg = "invalid list name %s" % li
				self.logger.write("ERROR", msg)
				raise ValueError(msg)
	self._lists = _lists.keys()

    def RequestFullLengthHashes(self, hash_prefix, prefix_length):
	"""
	A client may request the list of full-length hashes for a hash prefix. 
	This usually occurs when a client is about to download content from a URL 
	whose calculated hash starts with a prefix listed in a blacklist.

	This implementation ignore the metadata part of the protocol and just retrieve
	the full length hashes.

	RequestFullLengthHashes('058d7680', 4)
	"""

	req_url  = "https://safebrowsing.google.com/safebrowsing/gethash"
	req_url += "?client=api&key=%s&appver=%s&pver=%s" % (self.api_key, self.clientver, self.pver)

	hash_bytes = hash_prefix.decode("hex")
	body = "%s:%s\n%s" % (prefix_length, len(hash_bytes), hash_bytes)
	u = urllib.urlopen(req_url, body)

	if u.getcode() != 200 :
		raise ValueError("failed to get full hashes with error code=%s. Response: %s" % (u.getcode(), u.read()))

	life_time = int( u.readline().strip() )

	ret = []
	while True :
	
		hash_entry = u.readline().strip()
		if not hash_entry :
			break

		tmp         = hash_entry.split(':')
		list_name   = tmp.pop(0)
		hash_size   = int( tmp.pop(0) )
		n_responses = int( tmp.pop(0) )
		has_metadata= False

		if len(tmp) :
			has_metadata= (tmp.pop(0) == 'm')

		data_length = hash_size * n_responses
		hash_data   = u.read(data_length)

		if has_metadata :
			metadata_length = u.readline().strip()
			metadata        = u.read( int(metadata_length) )

		for i in range(0, n_responses):
			id_s = i * hash_size
			id_e = id_s + hash_size

			item = {
				'life_time' : life_time,
				'list_name' : list_name,
				'hash' : hash_data[id_s:id_e].encode('hex')
			}

			ret.append( item )
	return ret

    def InlineLookupAPI(self, urls):
	"""
	use the Google POST API (and not the local chunks)
	https://developers.google.com/safe-browsing/lookup_guide
	"""

	req_url  = "https://sb-ssl.google.com/safebrowsing/api/lookup"
	req_url += "?client=api&key=%s&appver=%s&pver=%s" % (self.api_key, self.clientver, self.pver)
	
	n_urls = len(urls)

	body = "%s\n%s" % (n_urls, '\n'.join(urls))

	u = urllib.urlopen(req_url, body)
	code = u.getcode()

	if code == 204 :
		ret = []
		for url in urls:
			ret.append( {'url':url, 'verdict':'ok'} )
		return ret

	if code != 200 :
		raise ValueError("InlineLookupAPI error with status code=%s. Response: %s" % (u.getcode(), u.read()))

	content = u.readlines()
	ret = []
	for i in range(0, n_urls):
		url = urls.pop(0).strip()
		verdict = content.pop(0).strip()
		
		ret.append( {'url':url, 'verdict':verdict} )

	return ret

    def RequestData(self, body):
	"""
	Clients use this to get new data for known list like 'goog-malware-shavar'.
	"""
	req_url  = "https://safebrowsing.google.com/safebrowsing/downloads"
	req_url += "?client=api&key=%s&appver=%s&pver=%s" % (self.api_key, self.clientver, self.pver)

	u = urllib.urlopen(req_url, body)
	if u.getcode() != 200 :
		raise ValueError("failed to get data from %s (status code=%s). Response: %s" % (req_url, u.getcode(), u.read()))

	content = u.readlines()	
	current_list_name = None

	data = []
	for line in content:
		(key, value) = line.strip().split(':')
		self.logger.write("DEBUG", "(%s) key=%s, value=%s" % (__file__, key, value))

		if key == 'n' :
			data.append( {'chunk_type': 'next_update', 'seconds':value} )
		elif key == 'r' and value == "pleasereset" :
			data.append( {'chunk_type': 'reset', 'list_name':current_list_name} )
		elif key == 'i' :
			current_list_name = value
		elif key == 'u' :
			"""
			These URLs should be visited in the order that they are given, 
			and if an error is encountered fetching any of the URLs, then the 
			client must NOT fetch any URL after that. 
			"""
			u_chunk = "https://%s" % value

			uc = urllib.urlopen(u_chunk)

			retcode = uc.getcode()	
			if retcode != 200 :
				raise ValueError("Chunk retrieval failed with %s (status code=%s)" % (u_chunk, retcode))

			# Get the chunks and push them for decoding
			data.append( {'chunk_type': 'new', 'list_name':current_list_name, 'chunk': self.decode_chunk(uc.read())} )

		elif key == 'ad':
			data.append( {'chunk_type': 'adddel', 'chunk_list': value, 'list_name':current_list_name} )
		elif key == 'sd':
			data.append( {'chunk_type': 'subdel', 'chunk_list': value, 'list_name':current_list_name} )
		else:
			raise ValueError('unrecognized answer: %s' % value)

	return data

    def decode_chunk(self, chunk_body):
	
	# decode the chunk
	data = StringIO(chunk_body)

	packed_size = data.read(4)
	unpakt_size = struct.unpack(">L", packed_size)[0]
	chunk_data  = data.read(unpakt_size)

	chunk = ChunkData_pb2.ChunkData()
	chunk.ParseFromString(chunk_data)

	chunk_type          = ChunkData_pb2.ChunkData.ADD
	chunk_type_str      = 'add'
	chunk_prefix        = ChunkData_pb2.ChunkData.PREFIX_4B
	chunk_prefix_length = 4
	chunk_hashes        = []

	if chunk.HasField('chunk_type') :
		chunk_type = chunk.chunk_type

	if chunk_type == ChunkData_pb2.ChunkData.SUB :
		chunk_type_str = 'sub'

	if chunk.HasField('prefix_type') :
		chunk_prefix = chunk.prefix_type
	
		if chunk_prefix == ChunkData_pb2.ChunkData.FULL_32B :
			chunk_prefix_length = 32

	# now we store the hashes 
	if chunk.HasField('hashes') :
		hashes_len = len(chunk.hashes)

		for i in range(0, hashes_len, chunk_prefix_length):
			hash_prefix = chunk.hashes[i:i+chunk_prefix_length].encode('hex')
			chunk_hashes.append( hash_prefix )
	
	# no idea what's the purpose of 'add_numbers'
	# docs says "Sub chunks also encode one add chunk number for every hash stored above."
	# so it's used only for sub chunk ... but for what?
	#for n in chunk.add_numbers:
	#	print n

	# a nice json object
	chunk_json = {
	'chunk_number' : chunk.chunk_number, # 123456
	'chunk_type'   : chunk_type_str,     # add | sub
	'chunk_prefix_length' : chunk_prefix_length, # 4 | 32
	'chunk_hashes' : chunk_hashes,       # [ hash1, hash2, ...]
	}

	return chunk_json


