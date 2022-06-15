import re

from .. import errors
from .. import splindicator

class BaseItem(object):
    """
    This is the default base class for OpenIOC Objects.
    Every parsers for OpenIOC objects must implement it.
    """
    log_messages = {}
    number_of_log_messages = 0
    
    def __init__(self, object_id=None, indicator_item=None, content=None, context=None):
	self.object_id  = object_id
	self.content = content
	self.context = context
	self.indicator_item = indicator_item

    def generic_parser(self):
	"""
	This is a generic and simple parser for OpenIOC.
	Consider that an IndicatorItem is not splitable in multiple SPLICE indicators (unlike STIX).
	"""
	splice_type = self.identify_search_type()
	splice_condition = self.identify_indicator_condition()

	if splice_type == None :
		# unknown type = don't recognize the object
		return []
	return [ splindicator.SPLIndicator(self.object_id, splice_condition, splice_type, self.content['text']) ]


    def identify_indicator_condition(self):
	"""
	return either 'value' or 'regex' based on the indicator condition.
	netagive expression _not_ supported.
	"""
	try:
		cond = self.indicator_item['condition']
	except:
		raise errors.SpliceError("failed to get the indicator condition for object_id=%s" % self.object_id)

	if cond == 'contains' or cond == 'matches' :
		return 'regex'
	if cond == 'is' :
		return 'value'
	if re.search('not$', cond, re.IGNORECASE) :
		self.log("WARN", "negative condition not supported yet, ignoring indicator.")

	raise errors.SpliceError("failed to identify the condition for the indicator with object_id=%s" % self.object_id)

    def identify_search_type(self):
	"""
	Identify Splice type base based on search attribute in context.
	"""

	try:
		search = self.context['attr']['search'] 
	except:
		raise errors.SpliceError("missing 'search' attributes in OpenIOC with object_id=%s" % self.object_id)

	# Identify Hahes: '../Md5sum', '../Sha1sum'
	reg_hash = re.compile('(Md5|Sha1|Sha256|Sha512)sum$',re.IGNORECASE)
	r = reg_hash.search(search)
	if r :
		h = r.group(1).lower()
		return 'hash-%s' % h
	
	# IP Address
	reg_ip = re.compile('(localIP|remoteIP|IPv4Address)$',re.IGNORECASE)
	if reg_ip.search(search) :
		return 'ipv4-addr'

	# Domain
	reg_domain = re.compile('(Host|HostName|RecordName|DNS)$',re.IGNORECASE)
	if reg_domain.search(search) : 
		return 'domain'

	# URL
	reg_url = re.compile('(URL|URI)$',re.IGNORECASE)
	if reg_url.search(search) : 
		return 'url'

	# File names
	reg_file = re.compile('(FileName|FullPath)$',re.IGNORECASE)
	if reg_file.search(search) :
		return 'filename'

	return None


    def log(self, severity, message):
	"""
	provide a simple logger to modules. severity should be INFO, WARNING, ERROR or DEBUG.
	"""
	self.log_messages[ self.number_of_log_messages ] = (severity, "(object_id=\"%s\") %s" % (self.object_id,message))
	self.number_of_log_messages += 1

    def parse(self):
	raise NotImplementedError('the parse() method is required in every modules')

