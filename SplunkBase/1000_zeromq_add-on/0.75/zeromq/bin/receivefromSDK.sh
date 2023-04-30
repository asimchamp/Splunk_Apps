#!/bin/sh

CLASSPATH=../lib/zmq.jar:../lib
java -Djava.library.path=/usr/local/lib -classpath $CLASSPATH receive tcp://*:5559
