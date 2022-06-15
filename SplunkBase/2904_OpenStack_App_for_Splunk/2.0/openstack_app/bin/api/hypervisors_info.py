#!/usr/bin/python
'''
This script fetches hypervisor information from OpenStack API
Author:  Basant Kumar, GSLab
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
        session_key = sys.stdin.readline().strip()
        splunk_credential = credential(app_name,user_name)
        user_name,password = splunk_credential.getPassword(session_key)
        base_url = ''
        auth_token,auth_services = login(user_name,password)
        for service in auth_services['token']['catalog']:
        	if service['name'] == 'nova':
        		base_url =  service['endpoints'][2]['url']
        headers = {'content-type': 'application/json','X-Auth-Token':auth_token}
        response = requests.get(base_url + '/os-hypervisors',headers=headers).json();
        
        #Print console line with hypervisor information
        print json.dumps(response)

if __name__ == "__main__":
    main()
