#!/usr/bin/python
'''
This script fetches volumes stats information from OpenStack API
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
        available_volume_count = 0
        inuse_volume_count = 0
        available_volume_size = 0
        inuse_volume_size = 0

        auth_token,auth_services = login(user_name,password)
        for service in auth_services['token']['catalog']:
        	if 'cinder' in service['name']:
        		base_url =  service['endpoints'][2]['url']
        		break
        headers = {'content-type': 'application/json','X-Auth-Token':auth_token}
        response = requests.get(base_url + '/volumes/detail?all_tenants=true',headers=headers).json();
        for volume in response['volumes']:
            if volume['status'] == 'available':
                available_volume_count = available_volume_count + 1
                available_volume_size = available_volume_size + volume['size']
            elif volume['status'] == 'in-use':
                inuse_volume_count = inuse_volume_count + 1
                inuse_volume_size = inuse_volume_size + volume['size']
        
        #Print console line with volumes stats information
        print "available_volume_count="+str(available_volume_count)+",inuse_volume_count="+str(inuse_volume_count)+",inuse_volume_size="+str(inuse_volume_size)+",available_volume_size="+str(available_volume_size)

if __name__ == "__main__":
    main()
