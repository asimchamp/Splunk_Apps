# Vagrantfile for Splunk App for Campfire.
#
# -*- mode: ruby -*-
# vi: set ft=ruby :
#
# Author:: Greg Albrecht <mailto:gba@splunk.com>
# Copyright:: Copyright 2012 Splunk, Inc.
# License:: BSD 3-Clause
#


Vagrant::Config.run do |config|
  config.vm.box = 'stormbase_100'
  config.vm.box_url = 'https://dl.dropbox.com/u/4036736/stormbase_100.box'
  config.vm.host_name = 'happen'
  config.vm.forward_port 8000, 5170
  config.vm.forward_port 8089, 5179
  config.vm.provision :chef_solo do |chef|
    chef.cookbooks_path = 'cookbooks'
    chef.add_recipe('splunk')
  end
end
