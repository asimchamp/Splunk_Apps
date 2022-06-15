from .. import splindicator
from .. import common
from .. import errors

from AddressObjectType import AddressObjectType
from BaseObjectType import BaseObjectType

__author__  = "Cedric Le Roux"
__version__ = "1.0.1"
__email__   = "cleroux@splunk.com"

class EmailMessageObjectType(BaseObjectType):

    def _EmailHeaderType(self, header):
	"""
	header: {'from': {'category': 'e-mail', 'address_value': 'jdoe@state.gov', 'xsi:type': 'AddressObjectType'}, 'message_id': 'CAF=+=fCSNqaNnR=wom=Y6xP09r_wfKjsm0hvY3wJYTGEzGyPkw@mail.gmail.com', 'mime_version': '1.0', 'date': '2011-01-05T12:48:50+08:00', 'to': [{'category': 'e-mail', 'address_value': 'jsmith@gmail.com', 'xsi:type': 'AddressObjectType'}], 'subject': 'Fw:Draft US-China Joint Statement', 'content_type': 'multipart/mixed; boundary=90e6ba10b0e7fbf25104cdd9ad08', 'x_mailer': 'Microsoft CDO for Windows 2000'}

	NOTE: 
	- some items are not covered yet (DateTimeObjectPropertyType, PositiveIntegerObjectPropertyType, EmailReceivedLineListType)
	"""
	ret = []

	ObjHeader = ['from', 'to', 'cc', 'bcc', 'sender', 'reply_to', 'x_originating_ip']
	for oh in ObjHeader:
		if not oh in header :
			continue
		indicator_type = 'email-%s' % oh.lower() # ex: email-from, email-cc, etc

		h = header[oh]
		value = []

		if isinstance(h, basestring) or isinstance(h, dict):
			value = [ h ]
		elif isinstance(h, list):
			value = h
		else:
			self.log("ERROR", "Header field %s is of type %s (value=%s)" % (oh,type(h),h))
			continue

		for v in value:
			a = AddressObjectType(object_id=self.object_id, properties=v)
			res = a.parse() # we get SPLIndicators back
		
			# get the log messages back :] .. dirty!
			for i in range(0, a.number_of_log_messages):
				msg = a.log_messages[i]
				self.log(msg[0], msg[1])

			# adjust the value_type
			for r in res:
				if r.get_value_type() == 'email' :
					r.set_value_type( indicator_type )
				ret.append( r )

	# StringObjectPropertyType
	StringObjects = ['subject', 'in_reply_to', 'message_id', 'errors_to', 'boundary', 'content_type', 'mime_version', 'precedence', 'user_agent', 'x_mailer']
	for so in StringObjects:
		if not so in header :
			continue
		indicator_type = 'email-%s' % so.lower() # ex: email-message_id, email-content_type, etc

		h = header[so]

		if isinstance(h, basestring):
			ret.append( splindicator.SPLIndicator(self.object_id, 'value', indicator_type, h) )
 		elif isinstance(h, dict):
			v = common.get_value_from_dict(h, 'value')
			if isinstance(v, basestring):
				ret.append( splindicator.SPLIndicator(self.object_id, 'value', indicator_type, v) )
			else:
				self.log("ERROR", "The indicator %s is of type %s -- unsupported yet! (header was %s)" % (v,type(v),h))
		else:
			self.log("ERROR", "Header field %s is of type %s (value=%s)" % (so,type(h),h))

	return ret


    def parse(self):

	ret = []

	# AttachmentsType and LinksType are references to other objects in the IOC.
	# They are respectively FileObject and URIObject (so it's handle by the associated parsers).
	attachments = common.get_value_from_dict(self.properties, 'attachments')
	links       = common.get_value_from_dict(self.properties, 'links')

	# Those are raw (StringObjectPropertyType) so it should be difficult to use them in Splunk against fields.
	raw_header  = common.get_value_from_dict(self.properties, 'raw_header')
	raw_body    = common.get_value_from_dict(self.properties, 'raw_body')
	email_server= common.get_value_from_dict(self.properties, 'email_server')

	# so only the EmailHeaderType has to be parsed !
	header      = common.get_value_from_dict(self.properties, 'header')


	if raw_header != None :
		ret.append( splindicator.SPLIndicator(self.object_id, 'value', 'email-raw_header', raw_header) )
	if raw_body != None :
		ret.append( splindicator.SPLIndicator(self.object_id, 'value', 'email-raw_body', raw_body) )
	if email_server != None :
		ret.append( splindicator.SPLIndicator(self.object_id, 'value', 'email-email_server', email_server) )

	if header != None :
		H = self._EmailHeaderType(header)
		ret += H 

	return ret

