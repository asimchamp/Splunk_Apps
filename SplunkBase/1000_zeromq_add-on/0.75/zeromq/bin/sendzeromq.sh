#!/bin/sh

#SPLUNK_HOME=/opt/splunk
JAVA_COMMAND=/usr/bin/java
CLASSPATH=../lib:../lib/splunk-1.3.jar:../lib/zmq.jar

# set to a low privledge role that can only acccess your sourcetype for testing
export SPLUNK_USER=admin
export SPLUNK_PASSWORD=changeme
export SPLUNK_HOST=localhost
export SPLUNK_PORT=8089



$JAVA_COMMAND -Djava.library.path=/usr/local/lib -cp $CLASSPATH sendzeromq "search *|head 100" tcp://localhost:5559