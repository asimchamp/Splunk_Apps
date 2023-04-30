#!/bin/bash
unset PYTHONPATH
unset LD_LIBRARY_PATH
CLASSPATH="<change me>/selenium-server-standalone-*.jar"
export CLASSPATH
SELENIUM_SERVER_JAR="/<change me>/selenium-server-standalone-*.jar"
export SELENIUM_SERVER_JAR

python3.4 <change me>/etc/apps/splunk-app-synthetic/bin/GoogleTest.py


