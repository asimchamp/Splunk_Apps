#!/usr/bin/python
'''
This script fetches instances stats information from OpenStack API
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
        error_vm_count = 0
        running_vm_count = 0
        shutoff_vm_count = 0
        auth_token,auth_services = login(user_name,password)
        for service in auth_services['token']['catalog']:
            if service['name'] == 'nova':
                base_url =  service['endpoints'][2]['url']
            if service['name'] == 'glance':
                glance_base_url = service['endpoints'][2]['url']
            if service['name'] == 'keystone':
                keystone_base_url = service['endpoints'][1]['url']
        headers = {'content-type': 'application/json','X-Auth-Token':auth_token}
        response = requests.get(base_url + '/servers/detail?all_tenants=True',headers=headers).json();
        for instance in response['servers']:
            if instance['status'] == 'ACTIVE':
                running_vm_count = running_vm_count + 1
            elif instance['status'] == 'ERROR':
                error_vm_count = error_vm_count + 1
            elif instance['status'] == 'SHUTOFF':
                shutoff_vm_count = shutoff_vm_count + 1
        
        #Print console line with instances stats
        print "running_vm_count="+str(running_vm_count)+",error_vm_count="+str(error_vm_count)+",shutoff_vm_count="+str(shutoff_vm_count)

if __name__ == "__main__":
    main()
