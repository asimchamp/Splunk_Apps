#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import re
import sys
import socket
import struct
import urllib
import hashlib

from datetime import datetime, timedelta
from urlparse import urlsplit, urldefrag

class Canonicalization(object):

    preg_ipv4             = re.compile("^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$")
    preg_rfc1808          = re.compile("://")
    preg_leading_dots     = re.compile("^\.+")
    preg_trailing_dots    = re.compile("\.+$")
    preg_consecutive_dots = re.compile("\.{2,}")
    preg_slash_dot_slash  = re.compile("/\./")
    preg_double_slash     = re.compile("//")
    preg_all_digits       = re.compile("^\d+$")

    def __init__(self):

	# list of 'safe' chars for URL encoding for Canonilize()
	self.url_safe_chars = [i for i in range(33,127) ]
	self.url_safe_chars.remove(0x23) # '#'
	self.url_safe_chars.remove(0x25) # '%'

	self.url_safe_chars_str = ''
	for i in self.url_safe_chars:
		self.url_safe_chars_str += chr(i)

    def SimpleURLSplit(self, url):

	# urlparse/urlsplit have weird behaviors, splitting manually.
	# <scheme>://<netloc>/<path>?<query>#<fragment>
	(scheme, u) = url.split(':', 1)
	u = u[2:] # '//'

	tmp     = u.split('/',1)
	netloc  = tmp.pop(0)
	fullpath= ''
	if len(tmp) :
		fullpath = '/'+ tmp.pop(0)

	# extract the fragment
	tmp      = fullpath.split('#', 1)
	fragment = None
	if len(tmp) > 1 :
		fragment = tmp.pop()
		fullpath = tmp.pop()
	
	# extract the query
	tmp      = fullpath.split('?', 1)
	query    = None
	if len(tmp) > 1 :
		query    = tmp.pop()
		fullpath = tmp.pop()

	# fullpath got the fragment and the query removed, its just the path.
	path = fullpath
	
	# remove the port from the netloc
	tmp = netloc.split(':', 1)
	port = None
	if len(tmp) > 1 :
		port   = tmp.pop()
		netloc = tmp.pop()

	ret = {}
	ret['scheme']   = scheme
	ret['netloc']   = netloc.lower()
	ret['port']     = port
	ret['path']     = path
	ret['query']    = query
	ret['fragment'] = fragment

	return ret


    def canonicalize(self, url):
	"""
	https://developers.google.com/safe-browsing/developers_guide_v3#Canonicalization
	"""

	# missing scheme
	if not self.preg_rfc1808.search(url) :
		url = 'http://%s' % url

	url = url.strip()
	url = url.replace('\n', '')
	url = url.replace('\r', '')
	url = url.replace('\t', '')

	# if the URL ends in a fragment, remove the fragment
	url = urldefrag(url)[0]

	# repeatedly percent-unescape the URL until it has no more percent-escapes.
	uu = urllib.unquote(url)
	while uu != url :
		url = uu
		uu  = urllib.unquote(url)

	url_parts = self.SimpleURLSplit(url)

	hostname = url_parts['netloc']
	scheme   = url_parts['scheme']
	port     = url_parts['port']
	path     = url_parts['path']
	query    = url_parts['query']
	fragment = url_parts['fragment']

	# remove all leading and trailing dots
	hostname = self.preg_leading_dots.sub('', hostname)
	hostname = self.preg_trailing_dots.sub('', hostname)
	
	# replace consecutive dots with a single dot.
	hostname = self.preg_consecutive_dots.sub('.', hostname)

	# if the hostname can be parsed as an IP address, normalize it to 4 dot-separated decimal values.
	if self.preg_all_digits.search(hostname) :
		hostname = socket.inet_ntoa(struct.pack('!L', int(hostname)))

	# sequences "/../" and "/./" in the path should be resolved
	# note: realpath/normpath has different behavior with leading '//' in python 2.7 than in 2.6.
	path = self.preg_slash_dot_slash.sub('/', path)
	path = self.preg_double_slash.sub('/', path)

	path_parts = [] 
	for p in path.split('/'):
		if p == '..' :
			path_parts.pop()
			continue
		path_parts.append( p )
	path = '/'.join(path_parts)

	# the URL must include a path component
	if path == '' :
		path = '/'

	# Rebuild URL and percent-escape all characters that are <= ASCII 32, >= 127, "#", or "%"
	url = "%s://%s" % (scheme, hostname)
	if port != None :
		url += ":%s" % port
	url += path
	if query != None :
		url += "?%s" % query
	if fragment != None :
		url += "#%s" % fragment
	url = urllib.quote(url, self.url_safe_chars_str)

	return url


    def TestCanonicalize(self):
	"""
	return True when all tests are True, False otherwise.
	"""

	tests = {
	"http://host/%25%32%35" : "http://host/%25",
	"http://host/%25%32%35%25%32%35" : "http://host/%25%25",
	"http://host/%2525252525252525" : "http://host/%25",
	"http://host/asdf%25%32%35asd" : "http://host/asdf%25asd",
	"http://host/%%%25%32%35asd%%" : "http://host/%25%25%25asd%25%25",
	"http://www.google.com/" : "http://www.google.com/",
	"http://%31%36%38%2e%31%38%38%2e%39%39%2e%32%36/%2E%73%65%63%75%72%65/%77%77%77%2E%65%62%61%79%2E%63%6F%6D/" : "http://168.188.99.26/.secure/www.ebay.com/",
	"http://195.127.0.11/uploads/%20%20%20%20/.verify/.eBaysecure=updateuserdataxplimnbqmn-xplmvalidateinfoswqpcmlx=hgplmcx/" : "http://195.127.0.11/uploads/%20%20%20%20/.verify/.eBaysecure=updateuserdataxplimnbqmn-xplmvalidateinfoswqpcmlx=hgplmcx/",
	"http://host%23.com/%257Ea%2521b%2540c%2523d%2524e%25f%255E00%252611%252A22%252833%252944_55%252B" : "http://host%23.com/~a!b@c%23d$e%25f^00&11*22(33)44_55+",
	"http://3279880203/blah" : "http://195.127.0.11/blah",
	"http://www.google.com/blah/.." : "http://www.google.com/",
	"www.google.com/" : "http://www.google.com/",
	"www.google.com" : "http://www.google.com/",
	"http://www.evil.com/blah#frag" : "http://www.evil.com/blah",
	"http://www.GOOgle.com/" : "http://www.google.com/",
	"http://www.google.com.../" : "http://www.google.com/",
	"http://www.google.com/foo\tbar\rbaz\n2" : "http://www.google.com/foobarbaz2",
	"http://www.google.com/q?" : "http://www.google.com/q?",
	"http://www.google.com/q?r?" : "http://www.google.com/q?r?",
	"http://www.google.com/q?r?s" : "http://www.google.com/q?r?s",
	"http://evil.com/foo#bar#baz" : "http://evil.com/foo",
	"http://evil.com/foo;" : "http://evil.com/foo;",
	"http://evil.com/foo?bar;" : "http://evil.com/foo?bar;",
	"http://\x01\x80.com/" : "http://%01%80.com/",
	"http://notrailingslash.com" : "http://notrailingslash.com/",
	"http://www.gotaport.com:1234/" : "http://www.gotaport.com:1234/",
	"  http://www.google.com/  " : "http://www.google.com/",
	"http:// leadingspace.com/" : "http://%20leadingspace.com/",
	"http://%20leadingspace.com/" : "http://%20leadingspace.com/",
	"%20leadingspace.com/" : "http://%20leadingspace.com/",
	"https://www.securesite.com/" : "https://www.securesite.com/",
	"http://host.com/ab%23cd" : "http://host.com/ab%23cd",
	"http://host.com//twoslashes?more//slashes" : "http://host.com/twoslashes?more//slashes",
	}

	succ = 0
	err = 0
	for (url, url_canonized) in tests.iteritems():
		u = self.canonicalize( url )
		#print "dec: %s" % u
		#print "exp: %s" % url_canonized

		if u != url_canonized :
			print "Failed to canonize %s\n\tresult: %s\n\texpeted: %s" % (url,u,url_canonized)
			err += 1
			continue

		succ += 1

	print "ran %s tests: %s failed, %s success" % (succ+err, err, succ)

    def Suffix_Prefix_Expression_Lookup(self, url):
	"""
	These lookups only use the host and path components of the URL. 
	The scheme, username, password, and port are disregarded. If the URL includes query parameters, 
	the client will include a lookup with the full path and query parameters.
	"""
	url_parts = self.SimpleURLSplit(url)
	hosts = []
	paths = []

	hostname = url_parts['netloc']
	path     = url_parts['path']
	query    = url_parts['query']

	# hostname permutations
	if not self.preg_ipv4.search(hostname) :

		tmp = hostname.split('.')
		l = len(tmp)

		# only consider 5 parts of the hostname
		if l > 5 :
			hosts.append( hostname )
			tmp = tmp[l-5:]

		while len(tmp) > 1:
			hosts.append( '.'.join(tmp) )
			tmp.pop(0)
	else:
		hosts.append( hostname )

	# path/query permutations
	paths.append(path)

	if query != None :
		paths.append(path+'?'+query)
	
	tmp = path.split('/')
	tmp.pop() # the last item is the page, so the path (= already added)
	l = len(tmp)
	if l > 4 :
		tmp = tmp[0:4]

	while len(tmp) > 0:
		paths.append( '/'.join(tmp) + '/')
		tmp.pop()

	# NOTE:
	# there a duplicate host/path when the path end by slash. To avoid
	# duplicate testing we use a dict as a trick. This shouldn't slow
	# the code as much as a 'if url in res'
	res = {}
	for h in hosts:
		for p in paths:
			v = '%s%s' % (h,p)
			res[ v ] = 1
	return res.keys()


