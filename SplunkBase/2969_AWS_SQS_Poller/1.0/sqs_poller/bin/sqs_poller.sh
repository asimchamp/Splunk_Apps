#!/bin/bash

current_dir=$(dirname "$0")
"$SPLUNK_HOME/bin/splunk" cmd node "$current_dir/app/sqs_poller.js" $@