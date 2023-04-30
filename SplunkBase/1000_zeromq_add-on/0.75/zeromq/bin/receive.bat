@echo off

set SPLUNK_HOME=C:\Program Files\Splunk
set CLASSPATH="%SPLUNK_HOME%\etc\apps\zeromq\lib\zmq.jar;%SPLUNK_HOME%\etc\apps\zeromq\lib\zmq-perf.jar;%SPLUNK_HOME%\etc\apps\zeromq\lib"
java -classpath %CLASSPATH% receive tcp://*:5558
