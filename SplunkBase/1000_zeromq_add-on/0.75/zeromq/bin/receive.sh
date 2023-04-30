#!/bin/sh

SPLUNK_HOME=/opt/splunk
CLASSPATH="$SPLUNK_HOME/etc/apps/zeromq/lib/zmq.jar:$SPLUNK_HOME/etc/apps/zeromq/lib/zmq-perf.jar:$SPLUNK_HOME/etc/apps/zeromq/lib"
java -Djava.library.path=/usr/local/lib -classpath $CLASSPATH receive tcp://*:5558
