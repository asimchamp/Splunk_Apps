# Makefile for the Chef Exception & Reporting Handler for Splunk Cookbook.
#
# Source:: https://github.com/ampledata/cookbook-splunk_handler
# Author:: Greg Albrecht <mailto:gba@splunk.com>)
# Copyright:: Copyright 2012 Splunk, Inc.
# License:: Apache License 2.0. See LICENSE.txt
#


GIT_TAG=`git describe --abbrev=0 --tags`


publish:
	rsync -a --exclude-from=.tar_exclude . ../splunk_handler
	knife cookbook site share splunk_handler 'Monitoring & Trending' -o ../
	rm -rf ../splunk_handler

build_tarball:
	rsync -a --exclude-from=.tar_exclude . ../splunk_handler
	tar -zcpf splunk_handler-$(GIT_TAG).tar.gz ../splunk_handler
	rm -rf ../splunk_handler

clean:
	rm -rf *.egg* build dist *.pyc *.pyo cover doctest_pypi.cfg nosetests.xml \
		pylint.log *.egg output.xml flake8.log output.xml */*.pyc .coverage core \
		nohup.out splunk_handler*.tar.gz cookbooks tmp
