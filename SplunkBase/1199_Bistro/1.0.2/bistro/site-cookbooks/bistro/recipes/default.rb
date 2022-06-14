# Sets Node Attributes for the Chef Exception & Reporting Handler for Splunk.
#
# For use with the Bistro App test suite.
#
# Source:: https://github.com/ampledata/bistro
# Author:: Greg Albrecht <mailto:gba@splunk.com>
# Copyright:: Copyright 2012 Splunk, Inc.
# License:: Apache License 2.0
#


node['chef_client']['handler']['splunk']['username'] = 'admin'
node['chef_client']['handler']['splunk']['password'] = 'changeme'
node['chef_client']['handler']['splunk']['host'] = 'localhost'
