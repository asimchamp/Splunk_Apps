#!/usr/bin/env python
import re
import sys

"""
User-Agent:
	http://tools.ietf.org/html/rfc7231#section-5.5.3

BNF: 
	User-Agent = product *( RWS ( product / comment ) )

	product         = token ["/" product-version]
	product-version = token

RWS: 
	http://tools.ietf.org/html/rfc7230#section-3.2.3
	The RWS rule is used when at least one linear whitespace octet is
	required to separate field tokens.

	RWS  = 1*( SP / HTAB )
	SP   = space
	HTAB = horizontal tab.

token:
	http://tools.ietf.org/html/rfc7230#section-3.2.6
     
	token          = 1*tchar
	tchar          = "!" / "#" / "$" / "%" / "&" / "'" / "*"
			/ "+" / "-" / "." / "^" / "_" / "`" / "|" / "~"
			/ DIGIT / ALPHA
			; any VCHAR, except delimiters


   	delimiters	= DQUOTE and "(),/:;<=>?@[\]{}"

comment:
	http://tools.ietf.org/html/rfc7230#section-3.2.6

	comment  = "(" *( ctext / quoted-pair / comment ) ")"
	ctext    = HTAB / SP / %x21-27 / %x2A-5B / %x5D-7E / obs-text
	obs-text = %x80-FF

	The backslash octet ("\") can be used as a single-octet quoting
	mechanism within quoted-string and comment constructs.  Recipients
	that process the value of a quoted-string MUST handle a quoted-pair
	as if it were replaced by the octet following the backslash.

	quoted-pair    = "\" ( HTAB / SP / VCHAR / obs-text )

NOTE:
- There may be a flaw in the RFC, in the token definition applied to the 
  product_version. If we stick to it, the space shouldn't be considered
  as a delimiter so basically all User-Agent are invalid, starting with
  the given examples in the RFC. To confirm.

"""




UA = [
	"Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; en) Opera 8.50",
	"Mozilla/5.0 (Windows NT 6.3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1700.19 Safari/537.36 OPR/19.0.1326.9 (Edition Next)",
	"Nokia5500d/2.0 (03.50) SymbianOS/9.1 Series60/3.0 Profile/MIDP-2.0 Configuration/CLDC-1.1",
	"Microsoft Pocket Internet Explorer/0.6",
	"Baiduspider ( http://www.baidu.com/search/spider.htm)",
	"Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0; Acoo Browser; GTB5; Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1) ; InfoPath.1; .NET CLR 3.5.30729; .NET CLR 3.0.30618)",
	"Mozilla/5.0",
	"Mozilla",
	"-",
	"Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322; .NET CLR 2.0.50727; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729)",
	"V2S;{641A2123-BE87-42B2-8C1E-B61205D56824};",
	"Mozilla/5.0 (Windows NT 6.3 ) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1700.19 Safari/537.36 OPR/19.0.1326.9 (Edition Next)",
	"Microsoft_Office/14.0_(Windows_NT_6.1;_Microsoft_Access_14.0.7128;_Pro)",
]

_DELIMITERS = set("\"(),/:;<=>?@[\]{}")
_VCHARS     = set(chr(c) for c in range(0x20, 0x7f)) - _DELIMITERS
_RWS        = set("\t ") # HTAB and space

# ctext    = HTAB / SP / %x21-27 / %x2A-5B / %x5D-7E / obs-text
# obs-text = %x80-FF   ** ignoring that for ascii logs (ascii = visual).
_CTEXT = set("\t") ^ set(chr(c) for c in range(0x20, 0x7f)) - set(chr(c) for c in range(0x28, 0x2A)) - set("\\")

DELIMITERS = list(_DELIMITERS)
VCHARS     = list(_VCHARS)
RWS        = list(_RWS)
CTEXT      = list(_CTEXT)

def getToken(string, length, space_break=False):
	"""
	Using regex for convenience but its slow.

	space_break: 
  	  special flag to overcome the flaw in the RFC (see notes)
	  regarding the product_version field.
	"""

	i    = 0
	stop = False
	while (i < length) and (not stop) :
		c = string[i]

		if c in VCHARS:
			i += 1

			if space_break and c == " " :
				stop = True
				i   -= 1
		else:
			stop = True

	return string[0:i]

def getComment(string, cursor, ua_len):
	"""
	extract the comment from the given string
	( ... )
	"""
	open_parenthesis = 1
	has_ctext = 0 # FIXME Do something to check if the chars maps it to a comment or a product
	
	cursor += 1 # skip the parenthesis
	cursor_start = cursor
	while cursor < ua_len :
		if string[cursor] == ')':
			open_parenthesis -= 1

			if open_parenthesis == 0 :
				break
		elif string[cursor] == '(':
			open_parenthesis += 1
	
		cursor += 1
	return string[cursor_start:cursor]

def skipRWS(ua, cursor, ua_len):
	"""
	Skip the spaces. Return -1 in case of end of line.
	"""

	# parsing done
	if cursor >= ua_len :
		return -1

	# RWS
	while (ua[cursor] in RWS) and (cursor < ua_len):
		cursor += 1

	# parsing done
	if cursor >= ua_len :
		return -1
	
	return cursor





def parse_user_agent(ua):
	"""
	return a JSON Object with all the parts of a User-Agent following RFC7231.

	# ua.product1.name = "pouet"
	# ua.products = 3
	# ua.prodcut1.components = ["a","WOW"...]

	{'ua':{
	'products' : 3,
	'string'   : 'Mozilla/5.0 (Windows; U; Windows NT 5.1; fr; rv:1.9.2.13) Gecko/20101203 Firefox/3.6.13',
	    'product1' : {
		'name'   : 'Mozilla',
		'version': '5.0', 
		'comment': 'Windows; U; Windows NT 5.1; fr; rv:1.9.2.13',
	     }
	}}

	"""
	
	ua  = ua.strip()
	ret = {'ua': { 'string': ua}}
	rnd = 0 # round counter for field name

	while len(ua) > 0 :
		rnd    += 1

		# at first, skip delimiters
		# special case encourtered with "Google Update/1.2.183.13;winhttp;cup" which ended in infinite loop
		i = 0
		c = ua[i]
		while (c in DELIMITERS) :
			i += 1
			if i >= len(ua) :
				break
			c = ua[i]

		ua = ua[i:]
		if ua == "" : 
			# special case when the last part of the UA is composed with shit like only delimiters
			break

		ua_len  = len(ua)
		product = getToken(ua, ua_len)
		cursor  = len(product)

		ret['ua']['products'] = rnd
		_key = "product%s" % rnd
		ret['ua'][_key] = {}
		ret['ua'][_key]['name']    = product
		ret['ua'][_key]['version'] = None
		ret['ua'][_key]['comment'] = None

		# only a product name
		if cursor == ua_len:
			break

		# has product version
		if ua[cursor] == '/' :
			cursor += 1 # skip the slash.
			product_version = getToken( ua[cursor:], len(ua[cursor:]), space_break=True )
			cursor += len(product_version)

			ret['ua'][_key]['version'] = product_version

		cursor = skipRWS(ua, cursor, ua_len)

		if cursor == -1 :
			break

		# do we have comments?
		if ua[cursor] == '(' :

			comment = getComment(ua, cursor, ua_len)
			cursor += len(comment) + 2 +1# skip the parenthesis

			ret['ua'][_key]['comment'] = comment
			
			cursor = skipRWS(ua, cursor, ua_len)
			if cursor == -1 :
				break

		# continue to parse 
		ua = ua[cursor:]

	return ret



if __name__ == "__main__" :

	"""
	user_agent: Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; en) Opera 8.50

	# products: 2
	{
		'user_agent': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; en) Opera 8.50', 
		'products_number': 2, 

		'product_2_name': 'Opera 8.50'
		'product_2_version': None, 
		'product_2_comment': None, 

		'product_1_name': 'Mozilla', 
		'product_1_version': '4.0', 
		'product_1_comment': 'compatible; MSIE 6.0; Windows NT 5.1; en', 
	}
	"""

	import json

	for ua in UA:
		print '\n' + "=" * 50
		ret = parse_user_agent(ua)

		print json.dumps(ret, sort_keys=True, indent=4, separators=(',', ': '))

