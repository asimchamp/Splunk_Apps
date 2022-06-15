#!/usr/bin/python
'''
This script fetches routers stats information from OpenStack API
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
        session_key = sys.stdin.readline().strip()
        splunk_credential = credential(app_name,user_name)
        user_name,password = splunk_credential.getPassword(session_key)
        base_url = ''
        running_routers_count = 0
        stopped_routers_count = 0
        auth_token,auth_services = login(user_name,password)
        for service in auth_services['token']['catalog']:
        	if service['name'] == 'neutron':
        		base_url =  service['endpoints'][2]['url']
        headers = {'content-type': 'application/json','X-Auth-Token':auth_token}
        response = requests.get(base_url + '/v2.0/routers.json',headers=headers).json();
        for router in response['routers']:
            if router["status"] == 'ACTIVE':
                running_routers_count = running_routers_count + 1
            else:
                stopped_routers_count = stopped_routers_count + 1

        #Print console line with routers stats information
        print "running_routers_count="+str(running_routers_count)+",stopped_routers_count="+str(stopped_routers_count)

if __name__ == "__main__":
    main()
