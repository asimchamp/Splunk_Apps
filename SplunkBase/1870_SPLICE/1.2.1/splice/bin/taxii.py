import re
import sys
import time
import os, os.path

# https://github.com/TAXIIProject/libtaxii
import libtaxii as t
import libtaxii.clients as tc
import libtaxii.messages_11 as tm

from splice.ioc      import IOC
from splice.config   import Config
from splice.database import DB
import splice.common as splcom

from splunklib.modularinput import *

class TAXIIModularInput(Script):

    def get_scheme(self):
	"""
	Return the expected XML by Splunk Enterprise when it starts.
	"""

	scheme = Scheme("IOC - TAXII Feeds")
	scheme.description = "Periodically poll a TAXII feed to retrieve IOCs"

	# If single instance mode is enabled, each stanza defined in the script is run in the same instance. 
	# Otherwise, Splunk Enterprise launches a separate instance for each stanza.
	scheme.use_external_validation = True
	scheme.use_single_instance = False

	# Only available data types : 
	# data_type_boolean / data_type_boolean / data_type_number
	taxii_host = Argument("taxii_host")
	taxii_host.data_type = Argument.data_type_string
	taxii_host.description = "IP or Hostname of the TAXII host"
	taxii_host.required_on_create = True
	scheme.add_argument(taxii_host)

	taxii_port = Argument("taxii_port")
	taxii_port.data_type = Argument.data_type_number
	taxii_port.description = "Port to use to connect to the TAXII host"
	taxii_port.required_on_create = True
	scheme.add_argument(taxii_port)

	taxii_path = Argument("taxii_path")
	taxii_path.data_type = Argument.data_type_string
	taxii_path.description = "TAXII feed discovery url."
	taxii_path.required_on_create = True
	scheme.add_argument(taxii_path)

	taxii_feed_id = Argument("taxii_feed_id")
	taxii_feed_id.data_type = Argument.data_type_string
	taxii_feed_id.description = "Descriptor of the feed (feed unique id)."
	taxii_feed_id.required_on_create = True
	scheme.add_argument(taxii_feed_id)
	
	taxii_login = Argument("taxii_login")
	taxii_login.data_type = Argument.data_type_string
	taxii_login.description = "Login to use to connect to the TAXII feed."
	taxii_login.required_on_create = True
	scheme.add_argument(taxii_login)

	taxii_password = Argument("taxii_password")
	taxii_password.data_type = Argument.data_type_string
	taxii_password.description = "Password associated with the login."
	taxii_password.required_on_create = True
	scheme.add_argument(taxii_password)

	taxii_use_https = Argument("taxii_use_https")
	taxii_use_https.data_type = Argument.data_type_boolean
	taxii_use_https.description = "Specify to use HTTPS instead of regular HTTP."
	taxii_use_https.required_on_create = True
	scheme.add_argument(taxii_use_https)

	taxii_cert_pem = Argument("taxii_cert_pem")
	taxii_cert_pem.data_type = Argument.data_type_string
	taxii_cert_pem.description = "Specify the full path of the SSL certificate to use (.pem) for a dual-factor authentication."
	taxii_cert_pem.description += " (support system envirionment variables like $SPLUNK_HOME)"
	taxii_cert_pem.required_on_create = True
	scheme.add_argument(taxii_cert_pem)

	taxii_cert_key = Argument("taxii_cert_key")
	taxii_cert_key.data_type = Argument.data_type_string
	taxii_cert_key.description = "Specify the full path of the certificate key file to use (.key) for a dual-factor authentication."
	taxii_cert_key.description += " (support system envirionment variables like $SPLUNK_HOME)"
	taxii_cert_key.required_on_create = True
	scheme.add_argument(taxii_cert_key)

	return scheme


    def validate_input(self, validation_definition):
        """
	Validates input.
	"""
	#TODO: check the input parameters!

    def get_taxii_connection(self, login=None,password=None,cert=None,key=None,use_https=False):
	"""
	Instantiate a connection with the taxii server and return the client.
	"""
	client = tc.HttpClient()
	client.setUseHttps(use_https)
   
	tls = (cert is not None and key is not None)
	basic = (login is not None and password is not None)

	if tls and basic:
		client.setAuthType(tc.HttpClient.AUTH_CERT_BASIC)
		client.setAuthCredentials({'key_file': key, 'cert_file': cert, 'username': login, 'password': password})
	elif tls:
		client.setAuthType(tc.HttpClient.AUTH_CERT)
		client.setAuthCredentials({'key_file': key, 'cert_file': cert})
	elif basic:
		client.setAuthType(tc.HttpClient.AUTH_BASIC)
		client.setAuthCredentials({'username': login, 'password': password})
	return client

    def taxii_message_is_empty(self, content):
	"""
	Return True when the provided content is _just_ the STIX Package headers.
	https://github.com/TAXIIProject/libtaxii/issues/76
	"""

	if re.search("^<stix:STIX_Package\s+[^>]+>$", content) :
		return True
	return False

    def stream_events(self, inputs, ew):
        # Splunk Enterprise calls the modular input, 
        # streams XML describing the inputs to stdin,
        # and waits for XML on stdout describing events.

	# ~/modinputs/ioc/alnum(stanza)_alnum(file)
	# handle IOCs modification by looking at IOCs size and modification time.

	# inputs.inputs = {
	#  'ioc://testioc': 
	#          {'host': 'splunkd', 'ingest_directory': '/var/iocs', 'index': 'default', 'ioc_type': 'auto', 'interval': '5'}
	# }
	# inputs.metadata = {
	# 	'server_uri': 'https://127.0.0.1:8089', 'server_host': 'splunkd', 'session_key': 'UuY...', 
	# 	'checkpoint_dir': '/opt/splunk/var/lib/splunk/modinputs/ioc'
	# }

	splice_conf    = Config()
	checkpoint_dir = inputs.metadata['checkpoint_dir']

	for input_name, input_item in inputs.inputs.iteritems():
		input_name_printable = splcom.get_printable_name(input_name)
		db_connection_uri    = splice_conf.get_mongo_connection_uri()

		taxii_host = input_item["taxii_host"]
		taxii_port = input_item["taxii_port"]
		taxii_path = input_item["taxii_path"]
		taxii_feed_id  = input_item["taxii_feed_id"]
		taxii_login    = input_item["taxii_login"]
		taxii_password = input_item["taxii_password"]
		taxii_cert_pem = input_item["taxii_cert_pem"]
		taxii_cert_key = input_item["taxii_cert_key"]

		if taxii_cert_pem == "None" or taxii_cert_key == "None" :
			taxii_cert_pem = None
			taxii_cert_key = None
		else:
			taxii_cert_pem = splcom.set_envvars(taxii_cert_pem) #cert.pem
			taxii_cert_key = splcom.set_envvars(taxii_cert_key) #cert.key

			if (not os.path.exists(taxii_cert_pem)) or (not os.path.exists(taxii_cert_key)) :
				raise ValueError(" taxii_cert_pem or taxii_cert_key doesn't exists")

		taxii_use_https = True
		if input_item["taxii_use_https"] in ["0", "False"] :
			taxii_use_https = False
		
		spldb = DB(db_connection_uri)
		spldb.connect()

		# get the last timestamp used from mongo (2014-07-24T02:44:50.354860+00:00)
		timestamp_label = spldb.get_taxii_last_timestamp_label(taxii_feed_id)

		#ew.log("INFO", "input_item=%s " % str(input_item) )
		try:
			taxii_client = self.get_taxii_connection(taxii_login, taxii_password, taxii_cert_pem, taxii_cert_key, taxii_use_https)

			poll_req = tm.PollRequest(
				message_id = tm.generate_message_id(), 
				collection_name = taxii_feed_id,
				exclusive_begin_timestamp_label = timestamp_label,
				poll_parameters = tm.PollRequest.PollParameters()
			)

			resp = taxii_client.callTaxiiService2(taxii_host, taxii_path, t.VID_TAXII_XML_11, poll_req.to_xml(pretty_print=True), taxii_port)
			taxii_message = t.get_message_from_http_response(resp, poll_req.message_id)

			# time synch is _very_ important as we filters IOCs by time.
			if taxii_message.message_type == tm.MSG_POLL_RESPONSE :

				#ew.log("INFO", "input_item=%s " % str(taxii_message.to_dict()) )
				for cb in taxii_message.content_blocks:
					empty_message = self.taxii_message_is_empty(cb.content)
					if empty_message :
						#ew.log("INFO", "received an empty message (%s)" % timestamp_label)
						continue
					ew.log("INFO", "received a new content block (%s)" % timestamp_label)

					spldb.store_ioc( IOC(content=cb.content, type="stix", stanza_name=input_name) )

				# updating the timestamp marker
				spldb.update_taxii_last_timestamp_label(taxii_feed_id)
			elif taxii_message.message_type == tm.MSG_STATUS_MESSAGE: 
				msg =  "Received a Status Message in response."
				msg += " Status Type: %s;" % taxii_message.status_type
				msg += " Message: %s" % taxii_message.message
				ew.log("WARN", msg)
			else:
				ew.log("WARN", "No poll response. Unexpected message type: %s" % taxii_message.message_type)

		except Exception, e:
			ew.log("ERROR", "something went wrong with TAXII polling: %s" % str(e))

	# NOTE:
	# If the ioc and the taxii modular inputs run at the very same time, they both will have the same events to
	# parse. However, when they will insert them in the atomic_indicator collection, the upsert logic is used,
	# so we should be fine (meaning: no duplicate events based on their id).
	spldb.parse_iocs()

	# eof stream_events() / run()

if __name__ == "__main__":
	sys.exit(TAXIIModularInput().run(sys.argv))

