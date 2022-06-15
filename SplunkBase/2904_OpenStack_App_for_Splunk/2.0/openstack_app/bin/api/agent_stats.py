#!/usr/bin/python
'''
This script pulls neutron agent stats data from OpenStack API
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
       
	#Variable Declaration
        app_name = 'openstack_app'
        base_url = ''
	user_name = ''
	password =''
        #Fetching user credentials
        session_key = sys.stdin.readline().strip()
        splunk_credential = credential(app_name,user_name)
        user_name,password = splunk_credential.getPassword(session_key)
        number_of_running_neutron_agents = 0
        number_of_failed_neutron_agents = 0
        auth_token,auth_services = login(user_name,password)
        for service in auth_services['token']['catalog']:
        	if service['name'] == 'neutron':
        		base_url =  service['endpoints'][2]['url']
        headers = {'content-type': 'application/json','X-Auth-Token':auth_token}
        response = requests.get(base_url + '/v2.0/agents.json',headers=headers).json();
        for agent in response['agents']:
            if agent["alive"]:
                number_of_running_neutron_agents = number_of_running_neutron_agents + 1
            else:
                number_of_failed_neutron_agents = number_of_failed_neutron_agents + 1

        #Print console line with failed_neutron_agents_count and running_neutron_agents_count value
        print "failed_neutron_agents_count="+str(number_of_failed_neutron_agents)+",running_neutron_agents_count="+str(number_of_running_neutron_agents)

if __name__ == "__main__":
    main()
