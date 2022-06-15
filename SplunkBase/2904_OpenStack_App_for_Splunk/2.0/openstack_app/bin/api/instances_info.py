#!/usr/bin/python
'''
This script fetches instances information from OpenStack API
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
        auth_token,auth_services = login(user_name,password)
        for service in auth_services['token']['catalog']:
            if service['name'] == 'nova':
                base_url =  service['endpoints'][2]['url']
            if service['name'] == 'glance':
                glance_base_url = service['endpoints'][2]['url']
            if service['name'] == 'keystone':
                keystone_base_url = service['endpoints'][1]['url']
        headers = {'content-type': 'application/json','X-Auth-Token':auth_token}

        response = requests.get(base_url + '/servers/detail?all_tenants=True',headers=headers).json()

        instance_information = json.dumps(response)
        instance_information = json.loads(instance_information)
        instance_information_with_tenant_name = []
        for row in instance_information['servers']: 
            instance_information_with_tenant_name.append({ 'tenant_id' : row['id'], 'flavor': row['flavor']['id'], 'name' : row['name'], 'status' : row['status'], 'zone' : row['OS-EXT-AZ:availability_zone'], 'hypervisor' : row['OS-EXT-SRV-ATTR:hypervisor_hostname']})  
        instance_information_with_tenant_image_flavor_name = {}
        instance_information_with_tenant_image_flavor_name['instances'] = instance_information_with_tenant_name
        instance_information_with_tenant_image_flavor_name_list = []
        for row in instance_information_with_tenant_image_flavor_name['instances']:
            image_name_response = requests.get(glance_base_url+'/v2/images/' ,headers=headers);
	
            if image_name_response.status_code == 200:
                image_name_response = image_name_response.json()
                image_name = image_name_response['name']
            else:
                image_name = 'NA'
            flavor_name_response = requests.get(base_url+'/flavors/' + row['flavor'],headers=headers).json();
            flavor_name = flavor_name_response['flavor']['name']
            instance_information_with_tenant_image_flavor_name_list.append({'tenant_id' : row['tenant_id'], 'image_id' : image_name, 'flavor' : flavor_name, 'name' : row['name'], 'status' : row['status'], 'zone' : row['zone'], 'hypervisor' : row['hypervisor']})
        instance_information_list = {}
	
        instance_information_list['instances'] = instance_information_with_tenant_image_flavor_name_list
        
        #Print console line with instance information
        print json.dumps(instance_information_list)

if __name__ == "__main__":
    main()
