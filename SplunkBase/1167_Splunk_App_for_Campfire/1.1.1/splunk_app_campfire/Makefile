# Makefile for splunk_app_campfire.
#
# Home:: https://github.com/ampledata/splunk_app_campfire
# Author:: Greg Albrecht <mailto:gba@splunk.com>
# Copyright:: Copyright 2012 Splunk, Inc.
# License:: BSD 3-Clause
#


init:
	pip install -r requirements.txt --use-mirrors
	bundle install

build:
	tar -X .tar_exclude -zcpf splunk_app_campfire.spl ../splunk_app_campfire


## Vagrant
vagrant:
	vagrant up


## Python
lint:
	pylint -f parseable -i y -r y bin/*.py tests/*.py | tee pylint.log

flake8:
	flake8 --exit-zero  --max-complexity 12 bin/*.py tests/*.py | \
		awk -F\: '{printf "%s:%s: [E]%s\n", $$1, $$2, $$3}' | tee flake8.log

cli_lint:
	pylint -f colorized -i y -r n bin/*.py tests/*.py

cli_flake8:
	flake8 --max-complexity 12 bin/*.py tests/*.py

pep8: flake8

clonedigger:
	clonedigger --cpd-output .

nosetests:
	nosetests

test: init lint flake8 clonedigger nosetests


## App

install_app:
	vagrant ssh -c 'sudo /opt/splunk/bin/splunk install app /vagrant/splunk_app_campfire.spl -update true -auth admin:ampledata'
	vagrant ssh -c 'sudo /opt/splunk/bin/splunk restart'

upgrade: install


## App Testing

add_input:
	vagrant ssh -c 'sudo /opt/splunk/bin/splunk add monitor /var/log -auth admin:ampledata'

generate_paste:
	vagrant ssh -c 'logger -t generated paste'
	vagrant ssh -c "sudo /opt/splunk/bin/splunk search 'generated paste | head 1 | campfire' -auth admin:ampledata"

generate_paste_table:
	vagrant ssh -c 'logger -t generated paste'
	vagrant ssh -c "sudo /opt/splunk/bin/splunk search 'generated paste | head 1 | table _time host | campfire' -auth admin:ampledata"

generate_alert:
	vagrant ssh -c 'logger -t generated alert'

delete_saved_search:
	curl -k -u admin:ampledata --request DELETE https://localhost:4179/servicesNS/admin/search/saved/searches/splunk_app_campfire_saved_search

create_saved_search:
	curl -k -u admin:ampledata https://localhost:4179/servicesNS/admin/search/saved/searches -d name=splunk_app_campfire_saved_search \
		--data-urlencode search='generated alert' -d action.script=1 -d action.script.filename=campfire.py \
		-d action.script.track_alert=1 -d actions=script -d alert.track=1 -d cron_schedule='*/5 * * * *' -d disabled=0 -d dispatch.earliest_time=-5m@m \
		-d dispatch.latest_time=now -d run_on_startup=1 -d is_scheduled=1 -d alert_type='number of events' -d alert_comparator='greater than' \
		-d alert_threshold=0

delete_saved_search_table:
	curl -k -u admin:ampledata --request DELETE https://localhost:4179/servicesNS/admin/search/saved/searches/splunk_app_campfire_saved_search_table

create_saved_search_table:
	curl -k -u admin:ampledata https://localhost:4179/servicesNS/admin/search/saved/searches -d name=splunk_app_campfire_saved_search_table \
		--data-urlencode search='generated alert|table _time host' -d action.script=1 -d action.script.filename=campfire.py \
		-d action.script.track_alert=1 -d actions=script -d alert.track=1 -d cron_schedule='*/5 * * * *' -d disabled=0 -d dispatch.earliest_time=-5m@m \
		-d dispatch.latest_time=now -d run_on_startup=1 -d is_scheduled=1 -d alert_type='number of events' -d alert_comparator='greater than' \
		-d alert_threshold=0

test_search:
	true

splunk_errors:
	vagrant ssh -c "sudo /opt/splunk/bin/splunk search 'index=_internal \" error \" NOT debug source=*splunkd.log*' -auth admin:ampledata"

set_splunk_password:
	vagrant ssh -c "sudo /opt/splunk/bin/splunk edit user admin -password ampledata -auth admin:changeme"

setup_app:
	curl -k -u admin:ampledata https://localhost:4179/servicesNS/nobody/splunk_app_campfire/apps/local/splunk_app_campfire/setup -d /campfire/campfire_api/campfire_api/subdomain=$(CAMPFIRE_SUBDOMAIN) -d /campfire/campfire_api/campfire_api/room_name=$(CAMPFIRE_ROOM_NAME) -d /campfire/campfire_api/campfire_api/auth_token=$(CAMPFIRE_AUTH_TOKEN)

reinit: build install_app setup_app generate_alert delete_saved_search create_saved_search


## Cleanup

clean:
	rm -rf *.egg* build dist *.pyc *.pyo cover doctest_pypi.cfg nosetests.xml \
		pylint.log *.egg output.xml flake8.log output.xml */*.pyc .coverage
