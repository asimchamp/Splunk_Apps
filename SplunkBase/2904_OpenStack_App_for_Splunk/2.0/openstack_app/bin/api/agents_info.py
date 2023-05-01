#!/usr/bin/python
'''
This script pulls neutron agent data from Spunk API
Author: Basant Kumar, GSLab
'''

#Import from standard libraries
import sys
import argparse
import requests
from authentication import *
from pprint import pprint
import json
import os

#Import from own classes
from dict_operations import *
from credentials import *

def main():
	
        #Variable declaration
        app_name = 'openstack_app'
        user_name = ''
	password = ''
       
        #Fetching user credentials
        session_key = sys.stdin.readline().strip()
        splunk_credential = credential(app_name,user_name)
        user_name,password = splunk_credential.getPassword(session_key)
        auth_token,auth_services = login(user_name,password)
        base_url = ''
        for service in auth_services['token']['catalog']:
        	if service['name'] == 'neutron':
        		base_url =  service['endpoints'][2]['url']
        headers = {'content-type': 'application/json','X-Auth-Token':auth_token}
        response = requests.get(base_url + '/v2.0/agents.json',headers=headers).json();

        #Print console line with neutron agents information
        print json.dumps(response)

if __name__ == "__main__":
    main()
