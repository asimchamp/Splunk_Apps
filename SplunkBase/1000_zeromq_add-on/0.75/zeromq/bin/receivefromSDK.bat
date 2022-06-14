@echo off

set CLASSPATH=..\lib\zmq.jar:..\lib
java -classpath %CLASSPATH% receive tcp://*:5559

