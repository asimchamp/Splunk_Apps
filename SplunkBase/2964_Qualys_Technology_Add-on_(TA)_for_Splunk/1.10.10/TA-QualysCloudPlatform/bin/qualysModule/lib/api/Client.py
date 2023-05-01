__author__ = 'mwirges'

"""
Thread-safe API Library

You make an APIRequest
it provides an APIResponse

"""

import abc
import base64
import six.moves.urllib.request as urlreq, six.moves.urllib.parse as urlpars, six.moves.urllib.error as urlerr
import six.moves.http_client as httplib
import re
import time
import ssl
import traceback
import sys
from threading import current_thread
import six
from io import open

from defusedxml import ElementTree as ET

# our includes
import qualysModule
from qualysModule import qlogger
import qualysModule.splunkpopulator.utils

class APIRequestError(Exception):
	pass

class APIResponseError(Exception):
	pass

class APIConfig:
	_username = None
	_password = None
	_serverRoot = "https://qualysapi.qualys.com"
	_useProxy = False
	_proxyHost = None

	@property
	def username(self):
		return self._username

	@property
	def password(self):
		return self._password

	@property
	def serverRoot(self):
		return self._serverRoot

	@property
	def useProxy(self):
		return self._useProxy

	@property
	def proxyHost(self):
		return self._proxyHost

	@username.setter
	def username(self, value):
		self._username = value

	@password.setter
	def password(self, value):
		self._password = value

	@serverRoot.setter
	def serverRoot(self, value):
		self._serverRoot = value

	@useProxy.setter
	def useProxy(self, value):
		if value is not True and value is not False:
			raise TypeError("must provide boolean value")
		self._useProxy = value

	@proxyHost.setter
	def proxyHost(self, value):
		self._proxyHost = value

class APIResponse(six.with_metaclass(abc.ABCMeta)):
	_response = None
	_response_code = 0

	@property
	def response_code(self):
		return self._response_code
	
	@response_code.setter
	def response_code(self, value):
		self._response_code = value
		
	@property
	def response(self):
		return self._response

	@response.setter
	def response(self, value):
		self._response = value

	def get_response(self):
		return self._handle_and_return_response()

	@abc.abstractmethod
	def _handle_and_return_response(self):
		pass

# end APIResponse

class SimpleAPIResponse(APIResponse):
	_data = None

	def _handle_and_return_response(self):
		return self.response.read()
		# end _handle_and_return_response

class XMLFileBufferedResponse(APIResponse):
	READ_CHUNK_SIZE = 16 * 1024
	_file_name = None

	def __init__(self, file_name):
		self._file_name = file_name

	@property
	def file_name(self):
		return self._file_name

	def _handle_and_return_response(self):
		try:
			firstChunk = True
			with open(self.file_name, 'wb') as fp:
				while True:
					try:
						chunk = self.response.read(XMLFileBufferedResponse.READ_CHUNK_SIZE)
					except httplib.IncompleteRead as e:
						qlogger.info("The possibly incomplete response seen. IncompleteRead Error received. Trying to parse optimistically.")
						chunk = e.partial

					if not chunk:
						break

					if firstChunk:
						firstChunk = False

						if sys.version_info[0] < 3:
							searchStr = "<!--"
						else:
							searchStr = b"<!--"

						if chunk.startswith(searchStr):
							(discard, chunk) = chunk.split("\n", 1)
					# end if

					fp.write(chunk)
					# end while
					# qlogger.debug("wrote xml data to file: %s", self.file_name)
				# printStreamEventXML("_internal","Wrote xml data to file %s" % self.file_name)
				return True
		except Exception as e:
			qlogger.debug("Exception traceback from Python Library: %s", traceback.format_exc())
			if 'operation timed out' in six.text_type(e):
				# qlogger.error("Unable to save data to file %s", self.file_name)
				qlogger.error("IOError in handling response and writing to file, %s : %s", e.errno, e)
			else:
				qlogger.error("Unable to save data to file: %s: %s", self.file_name, str(e))
			# else:
			#    return True
		# end try

class APIClient(object):
	""" :type _config: APIConfig """
	_config = APIConfig()

	def __init__(self, apiConfig):

		""" :type: APIConfig """
		self._config = apiConfig
		self.preflight()
		self.qweb_version = None

	# end __init__

	def preflight(self):
		proxy_server =  self._config.proxy_server
		if self._config.use_ca:
			try:
				qlogger.debug("Using client ca certificate.")
				context = ssl.create_default_context(purpose=ssl.Purpose.CLIENT_AUTH)
				context.load_cert_chain(self._config.ca_path, keyfile=self._config.ca_key, password=self._config.ca_pass)					
				https_handler = urlreq.HTTPSHandler(context=context)
				opener = urlreq.build_opener(https_handler)
				if self._config.useProxy:
					qlogger.debug("Using proxy and ca certificates.")

					if proxy_server != '':
						qlogger.debug("Proxy details: %s",proxy_server)
					proxy = urlreq.ProxyHandler({"https": self._config.proxyHost})
					opener.add_handler(proxy)
				urlreq.install_opener(opener)
			except:
				qlogger.error("Error while configuring CA Certificate. Please check CA Certificate, key paths and/or passphrase.")
		elif self._config.useProxy:
			proxy = urlreq.ProxyHandler({"https": self._config.proxyHost})
			opener = urlreq.build_opener(proxy)			
			urlreq.install_opener(opener)
			qlogger.debug("Installed proxy handler")

			if proxy_server != '':
				qlogger.debug("Proxy details: %s",proxy_server)
			# end if

	# end preflight

	def validate(self):
		""":type response: str """
		response = self.get("/msp/about.php", {}, SimpleAPIResponse())
		if response:
			if sys.version_info[0] < 3:
				response_text = response.get_response()
			else:
				response_text = response.get_response().decode('utf-8')
		else:
			return False

		if response_text.count("WEB-VERSION") > 0:
			root = ET.fromstring(response_text)
			qweb_version_text = root.find('WEB-VERSION').text

			if qweb_version_text is None:
				qlogger.debug('QWEB_VERSION not found.')
				return False
			else:
				version_parts = qweb_version_text.split('.')

			if len(version_parts) > 2:
				if sys.version_info[0] < 3:
					self.qweb_version = (version_parts[0], version_parts[1])
				else:
					self.qweb_version = (int(version_parts[0]), int(version_parts[1]))

				qlogger.info("Found QWEB_VERSION=%s.%s", version_parts[0], version_parts[1])
			return True
		else:
			qlogger.debug(response_text)
			return False

	def isPortalEndpoint(self, end_point):
		# Web Application Scanning - used for WAS Findings
		if '/was/' in end_point:
			return True
		# Asset Management - used for apply Qualys tag - mod alert
		if '/am/' in end_point:
			return True
		return False

	# isPortalEndpoint

	def get(self, end_point, params, response):
		"""
		:param end_point: str
		:param params: dict
		:param responseType: APIResponse
		"""
		retry_interval = int(self._config.retry_interval) if self._config.retry_interval else 300
		req = self._buildRequest(end_point, params, self.isPortalEndpoint(end_point))
		retrycount = 0
		while True:  # Added outer while conditions to retry on fail
			try:
				qlogger.info("Making request: %s with params=%s", req.get_full_url(), params)
				""" :type request: urllib2.Request """
				timeout = int(self._config.api_timeout) if self._config.api_timeout else None
				method = req.get_method()
				qlogger.info("Type of request: %s" % method)
				request = urlreq.urlopen(req, timeout=timeout)  # timeout set to bail in case of timeouts
				response.response_code = request.getcode()
				qlogger.debug("Response Code from API: %s", request.getcode())
				if request.getcode() != 200:
					qlogger.debug("Got NOK response from API")
					if request.getcode() == 204:
						qlogger.warning("No Content. Please check the request.")
						try:
							request.close()
						except NameError:
							pass
						return response # as a special case, we do not want to retry this case, unless request URL has changed.
				else:
					response.response = request
					return response
			except (urlerr.URLError, urlerr.HTTPError) as ue:
				retrycount += 1
				if hasattr(ue, 'code'): #handle non-200 responses
					if ue.code == 401:
						qlogger.exception(
							"Authentication Error, but we're using stored creds, so we will sleep for %s seconds and try again, as this is a temporary condition. Retry Count: %s",
							retry_interval, retrycount)
						try:
							request.close()
						except NameError:
							pass
						time.sleep(retry_interval)  
						continue
					# endif
					elif ue.code == 409:
						qlogger.exception(
							"API concurrency limit reached.  Must sleep for %s seconds and try again. Retry count: %s",
							retry_interval, retrycount)
						try:
							request.close()
						except NameError:
							pass
						time.sleep(retry_interval)  
						continue
					# end elif
					else:
						if hasattr(ue, 'reason'): #all other codes
							try:
								root = ET.fromstring(ue.read())
								element = root.getchildren()[0]
								qlogger.error("API ERROR. ERROR CODE: " + str(ue.getcode()))
								for d in element:
									qlogger.error(d.tag + ": " + d.text)
							except Exception as err:
								raise ET.ParseError(err)
							qlogger.exception(
								"Unsuccessful while calling API [%s : %s]. Retrying after %s seconds: %s with params=%s. Retry count: %s",
								ue.code, ue.reason, retry_interval, req.get_full_url(), params, retrycount)
						else:
							qlogger.exception(
								"Unknown error while calling API. Retrying after %s seconds: %s with params=%s. Retry count: %s",
								retry_interval, req.get_full_url(), params, retrycount)
						try:
							request.close()
						except NameError:
							pass
						time.sleep(retry_interval)  
						continue
					# end else
				else:
					if hasattr(ue, 'reason'): #No code, probably a connection issue
						if 'timed out' in ue.reason:
							qlogger.error(
								"Connection Timed out to %s . Sleeping for %s seconds and retrying. Retry count: %s",
								req.get_full_url(), retry_interval, retrycount)
						else:
							qlogger.error("Error occurred while calling API. Reason: %s; Rtrying afetr %s seconds. Retry count: %s", ue.reason, retry_interval, retrycount)
					else:
						qlogger.error("Unknown Error occurred. Retry count: %s", retrycount)
					# raise APIRequestError("Error during request to %s, [%s] %s" % (end_point, ue.errno, ue.reason))
					time.sleep(retry_interval)
					continue
			#Just in case, catch other types that might fall outside
			except httplib.HTTPException as e:
				retrycount += 1
				qlogger.error('HTTPException')
				qlogger.info("Request failed with HTTPException, Retrying after %s seconds : %s with params=%s. Retry count: %s",
							 retry_interval, req.get_full_url(), params, retrycount)
				time.sleep(retry_interval)
				continue
			except ssl.SSLError as e:
				retrycount += 1
				qlogger.error('SSLError')
				if self._config.use_ca:
					qlogger.info("Request failed with SSLError, please make sure if CA certificate file and/or CA Certificate key file and/or CA passphrase are correct. Retrying after %s seconds", retry_interval)
				else:
					qlogger.info("Request failed with SSLError, Retrying after %s seconds: %s with params=%s. Retry count: %s",
								 retry_interval, req.get_full_url(), params, retrycount)
				time.sleep(retry_interval)
				continue
			except IOError as e:
				retrycount += 1
				if 'SSLError' in repr(e) and self._config.use_ca:
					qlogger.error('SSLError')
					qlogger.info("Request failed with SSLError, please make sure if CA certificate file and/or CA Certificate key file and/or CA passphrase are correct.")
				else:
					qlogger.error('IOError')
					qlogger.info("Request failed with IOError, Retrying after %s seconds: %s with params=%s. Retry count: %s",
							 retry_interval, req.get_full_url(), params, retrycount)
				
				time.sleep(retry_interval)
				continue
			#Catchall for edge cases - include traceback to find out why it wasn't caught
			except Exception as e:
				trace_msg = "Unknown Exception occurred. Traceback: "  + ''.join(traceback.format_exc())
				qlogger.debug(trace_msg)
				qlogger.error("Error during request to %s, Error: %s", end_point, e)
				break
			# time.sleep(3)
			# continue
			# end try
			# end get

	def _buildHeaders(self, contentTypeXML):
		"""

		:return: dict
		"""

		usrPass = self._config.username+":"+self._config.password
		if sys.version_info[0] < 3:
			auth = base64.urlsafe_b64encode(usrPass)
		else:
			auth = base64.urlsafe_b64encode(usrPass.encode("utf-8"))
			auth = str(auth, 'utf-8')

		headers = {
			"User-Agent": "QualysAPIClient",
			"X-Requested-With": "QualysSplunkApp" + (" " + self._config.ta_version) if self._config.ta_version else "",
			"Authorization": "Basic %s" %auth
		}

		if contentTypeXML:
			headers['Content-Type'] = 'text/xml'

		return headers
	# end _buildHeaders

	def _buildRequest(self, end_point, params, contentTypeXML=None):
		"""

        :param end_point:  str
        :param params: dict
        :return: urllib2.Request
        """
		data = None
		if contentTypeXML:
			data = params
		else:
			data = urlpars.urlencode(params)

		if params == {}:
			# For json data
			return urlreq.Request(self._config.serverRoot + end_point, headers=self._buildHeaders(contentTypeXML))
		else:
			if sys.version_info[0] == 3:
				data = data.encode("utf-8")
			return urlreq.Request(self._config.serverRoot + end_point, data=data, headers=self._buildHeaders(contentTypeXML))
		# end _buildRequest
# end APIClient