from __future__ import absolute_import
import abc
import base64
import six.moves.urllib.request as urlreq, six.moves.urllib.parse as urlpars, six.moves.urllib.error as urlerr
import six.moves.http_client as httplib
import re
import time
import ssl
import json
import sys

from qualysModule import qlogger
from .Client import APIClient, SimpleAPIResponse

class JWT_APIClient(APIClient):
	def __init__(self, apiConfig):
		self.__token = None
		super(JWT_APIClient, self).__init__(apiConfig)

	'''
		Validate the connection with configured APIServer, username and password.
	'''
	def validate(self):
		self.__token = self.getAuthToken(refresh=True)
		#If auth token is successfully set -> connection is successful
		if self.__token :
			return True
		return False

	'''
		get JWT auth token
	'''
	def getAuthToken(self, refresh=False):
		if not refresh and self.__token: 
			return self.__token
		else:
			qlogger.info("Getting new auth token from API Gateway Server.")
			apiServer = self._config.serverRoot
			token = None
			end_point = "/auth"
			response = SimpleAPIResponse()
			token = self.get(end_point, {}, response, True)
			qlogger.info("Received auth token from API Gateway Server.")
			return token
		#end getAuthToken			

	'''
		Refresh Auth token
	'''
	def refreshToken(self):
		self.__token = None
		self.__token = self.getAuthToken(refresh=True)

	def get(self, end_point, params, response, tokenRequest=False):
		"""
		:param end_point: str
		:param params: dict
		:param responseType: APIResponse
		"""
		retry_interval = int(self._config.retry_interval) if self._config.retry_interval else 300
		retrycount = 0
		while True:  # Added outer while conditions to retry on fail
			req = self._buildRequest(end_point, params, self.isPortalEndpoint(end_point), tokenRequest)
			qlogger.info("Making request: %s with params=%s", req.get_full_url(), params)
			try:
				""" :type request: urllib2.Request """
				timeout = int(self._config.api_timeout) if self._config.api_timeout else None
				method = req.get_method()
				qlogger.info("Type of request: %s" % method)
				request = urlreq.urlopen(req, timeout=timeout)  # timeout set to bail in case of timeouts
				
				response.response_code = request.getcode()
				if tokenRequest:
					if request.getcode() >= 200 and request.getcode() < 300:
						token = request.read()
						try:
							request.close()
						except NameError:
							pass
						return token
					else:
						qlogger.error("Could not get Auth token. Response code received: " + response.response_code)
				
				if request.getcode() != 200:
					qlogger.debug("Got NOK response from API")
					if request.getcode() == 204:
						qlogger.warning("No Content. Please check the request.")
						try:
							request.close()
						except NameError:
							pass
						return response  # as a special case, we do not want to retry this case, unless request URL has changed.
				else:
					response.response = request
					return response
			except (urlerr.URLError, urlerr.HTTPError) as ue:
				retrycount += 1
				#import pdb;pdb.set_trace()
				if hasattr(ue, 'code'):  # handle non-200 responses
					if ue.code == 401:
						resp_string = ue.read()
						resp_dict = {}
						if tokenRequest:
							qlogger.error("Authentication Error, but we're using stored creds, so we will sleep for %s seconds and try again, as this can be a temporary condition. Retry Count: %s", retry_interval, retrycount)
							time.sleep(retry_interval)
							continue
						try:
							resp_dict = json.loads(resp_string)
							if not tokenRequest:
								if 'message' in resp_dict and resp_dict['message'].strip() == 'JWT expired':
									qlogger.info("JWTClient-001: JWT Token is expired, getting new token.")
									self.refreshToken()
								else:
									qlogger.warning("JWTClient-002: Unexpected response, refreshing the JWT token.")
									self.refreshToken()
						except ValueError as e:
							qlogger.debug("JWTClient-003: "+str(e)+". Unexpected response, refreshing the JWT token.")
						except Exception as e:
							qlogger.debug("JWTClient-004: "+str(e)+". Unexpected response, refreshing the JWT token.")
						finally:
							self.refreshToken()
						qlogger.exception("Retry Count: %s", retrycount)
						try:
							request.close()
						except NameError:
							pass
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
						if hasattr(ue, 'reason'):  # all other codes
							qlogger.exception(
								"Unsuccessful while calling API [%s : %s]. Retrying after %s seconds: %s with params=%s. Retry count: %s",
								ue.code, ue.reason, retry_interval, req.get_full_url(), params, retrycount)
						else:
							qlogger.exception(
								"Unknown error while calling API. Retrying after % seconds: %s with params=%s. Retry count: %s",
								retry_interval, req.get_full_url(), params, retrycount)
						try:
							request.close()
						except NameError:
							pass
						time.sleep(retry_interval)
						continue
					# end else
				else:
					if hasattr(ue, 'reason'):  # No code, probably a connection issue
						if 'timed out' in ue.reason:
							qlogger.error(
								"Connection Timed out to %s . Sleeping for %s seconds and retrying. Retry count: %s",
								req.get_full_url(), retry_interval, retrycount)
						else:
							qlogger.error("Error in connection: %s . Sleeping for %s seconds and retrying. Retry count: %s",
								ue.reason, retry_interval, retrycount)

					else:
						qlogger.error("Unknown Error occurred. Retrying afetr %s seconds Retry count: %s", retry_interval, retrycount)
					# raise APIRequestError("Error during request to %s, [%s] %s" % (end_point, ue.errno, ue.reason))
					time.sleep(retry_interval)
					continue
			# Just in case, catch other types that might fall outside
			except httplib.HTTPException as e:
				retrycount += 1
				qlogger.exception("HTTPException")
				qlogger.info("Request failed with HTTPException, Retrying after %s seconds: %s with params=%s. Retry count: %s",
							 retry_interval, req.get_full_url(), params, retrycount)
				time.sleep(retry_interval)
				continue
			except ssl.SSLError as e:
				retrycount += 1
				qlogger.error('SSLError')
				if self._config.use_ca:
					qlogger.info(
						"Request failed with SSLError, please make sure if CA certificate file and/or CA Certificate key file and/or CA passphrase are correct. Retrying afetr %s seconds", retry_interval)
				else:
					qlogger.info("Request failed with SSLError, Retrying after %s seconds : %s with params=%s. Retry count: %s",
								 retry_interval, req.get_full_url(), params, retrycount)
				time.sleep(retry_interval)
				continue
			except IOError as e:
				retrycount += 1
				if 'SSLError' in repr(e) and self._config.use_ca:
					qlogger.error('SSLError')
					qlogger.info(
						"Request failed with SSLError, please make sure if CA certificate file and/or CA Certificate key file and/or CA passphrase are correct. Rtrying after %s seconds", retry_interval)
				else:
					qlogger.error('IOError')
					qlogger.info("Request failed with IOError, Retrying afetr %s seconds: %s with params=%s. Retry count: %s",
								 retry_interval, req.get_full_url(), params, retrycount)

				time.sleep(retry_interval)
				continue
			# Catchall for edge cases - include traceback to find out why it wasn't caught
			except Exception as e:
				import traceback
				trace_msg = "Unknown Exception occurred. Traceback: " + ''.join(traceback.format_exc())
				qlogger.debug(trace_msg)
				qlogger.error("Error during request to %s, Error: %s", end_point, e)
				break
			# time.sleep(3)
			# continue
			# end try
			# end get

	def _buildHeaders(self, contentTypeXML, tokenRequest, end_point):
		headers = {
			"User-Agent": "QualysAPIClient",
			"X-Requested-With": "QualysSplunkApp" + (" " + self._config.ta_version) if self._config.ta_version else "",
		}
		if tokenRequest:
			headers['Content-Type'] = "application/x-www-form-urlencoded"
		else:
			if not self.__token:
				self.__token = self.getAuthToken()

			if sys.version_info[0] == 3 and type(self.__token) is bytes:
				self.__token = self.__token.decode("utf-8")

			auth = "Bearer " + self.__token
			headers['Authorization'] = auth

		# All FIM request are using post method. According to new rest API header should contends following header.
		if "/fim/" in end_point:
			headers['Content-Type'] = "application/json"
			headers['accept'] = "application/vnd.qualys.fim.api.v2.0+json"

		if "/postureInfo" in end_point:
			headers['Content-Type'] = "application/json"
			headers['accept'] = "application/json"

		if contentTypeXML:
			headers['Content-Type'] = 'text/xml'

		return headers

	# end _buildHeaders

	def _buildRequest(self, end_point, params, contentTypeXML = None, tokenRequest = False):
		"""
        :param end_point:  str
        :param params: dict
        :return: urllib2.Request
        """
		data = None
		if tokenRequest:
			data = urlpars.urlencode({"username":self._config.username, "password":self._config.password, "permissions":'true'})
		else:
			if contentTypeXML:
				data = params
			
			elif "/postureInfo" in end_point:
				data = json.dumps(params)
				
			else:
				data = urlpars.urlencode(params)

			# All FIM request are using post method. so body should be in JSON.
			if "/fim/" in end_point:
				data = json.dumps(params)
			
		if data:
			if sys.version_info[0] == 3:
				data = data.encode("utf-8")
			return urlreq.Request(self._config.serverRoot + end_point, data=data,
								   headers=self._buildHeaders(contentTypeXML, tokenRequest, end_point))
		else:
			return urlreq.Request(self._config.serverRoot + end_point, headers=self._buildHeaders(contentTypeXML, tokenRequest, end_point))

		# end _buildRequest