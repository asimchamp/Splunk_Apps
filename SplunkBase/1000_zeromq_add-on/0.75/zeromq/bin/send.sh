#!/bin/sh
java -Djava.library.path=/usr/local/lib -classpath "../lib/zmq.jar:../lib/zmq-perf.jar:../lib" send tcp://localhost:5558