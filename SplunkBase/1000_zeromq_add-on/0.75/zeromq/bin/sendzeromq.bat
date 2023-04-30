@echo off


CLASSPATH=..\lib:..\lib\splunk-1.3.jar:..\lib\zmq.jar

REM set to a low privledge role that can only acccess your sourcetype for testing
set SPLUNK_USER=admin
set SPLUNK_PASSWORD=changeme
set SPLUNK_HOST=localhost
set SPLUNK_PORT=8089



java -cp %CLASSPATH% sendzeromq "search *|head 100" tcp://localhost:5559