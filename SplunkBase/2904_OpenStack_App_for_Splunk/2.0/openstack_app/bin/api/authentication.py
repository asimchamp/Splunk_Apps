#!/usr/bin/python
'''
This script performs authentication and return authentication token and services information
Author: Basant Kumar, GSLab
'''

#Import from standard libraries
import sys
import argparse
import requests
import ConfigParser
import os
import io

def login(user_name,password):
	#Variable declaration
	headers = {'content-type': 'application/json'}
	auth_token = None
	nova_url = None
	auth_response = None
	auth_token = None

	Config = ConfigParser.ConfigParser()
	PATH = os.path.dirname(os.path.realpath(__file__))
	with io.open(PATH+"/./../../local/myconf.conf", 'r', encoding='utf_8_sig') as fp:
		Config.readfp(fp)
	for section in Config.sections():
		if section == 'userinfo':
			for option in Config.options(section):
				if option == 'baseurl':
					base_url = Config.get(section,option)
				if option == 'tenant':
					tenant = Config.get(section,option)
	

	try:
	    auth_request = ('{ "auth": {"identity": {"methods": ["password"],"password": {"user": {"name": "' + user_name + '","domain": { "id": "default" },"password": "' + password + '"}}},"scope": {"project": {"name": "admin","domain": { "id": "default" }}}}}')
	    auth_response = requests.post(base_url + '/auth/tokens', data=auth_request,headers=headers);
	    auth_response_body = auth_response.json();   
	    subject_token = auth_response.headers["x-subject-token"]
	    auth_token = auth_response.headers["x-subject-token"]
	   
        
	    if not auth_response_body['token']['user']['id']:  
	        raise Exception("Authentication failed. Failed to get an auth token.")
	  
	except Exception as e:
	    print ('WARNING: Athentication failed for tenant %s and user %s' 
	           % (tenant, user_name) + '\nInfo: ' + str(e))

	return auth_token,auth_response_body

	

