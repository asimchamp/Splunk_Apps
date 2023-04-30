#!/bin/sh
# jmxclient.sh
#
# Copyright (C) 2011 Splunk Inc.
#
# Splunk Inc. licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
#
# script to make jar loading independent of versions

CMNSLGNG=`ls ../lib/commons-logging-1*.jar`
CMNSCNFG=`ls ../lib/commons-configuration*.jar`
CMNSLANG=`ls ../lib/commons-lang*.jar`
LOG4J=`ls ../lib/log4j*.jar`
SPLUNK_JARS=./*

if [ "$JAVA_HOME" = "" ]; then
  JAVA=java #Rely on that java is in path.
else
  JAVA="$JAVA_HOME"/bin/java #Use JAVA_HOME.
fi

JT_PID=`ps  -aef|grep java|grep proc_jobtracker |awk '{print $2}'`
TT_PID=`ps  -aef|grep java|grep proc_tasktracker |awk '{print $2}'`
NN_PID=`ps  -aef|grep java|grep proc_namenode |awk '{print $2}'`
SNN_PID=`ps  -aef|grep java|grep proc_secondarynamenode |awk '{print $2}'`
DN_PID=`ps  -aef|grep java|grep proc_datanode |awk '{print $2}'`

$JAVA -cp "$CMNSLGNG:$CMNSCNFG:$CMNSLANG:$LOG$J:$SPLUNK_JARS:$JAVA_HOME/lib/tools.jar" com.splunk.hadoopopsfwd.jmx.client.JMXClient $JT_PID,$TT_PID,$NN_PID,$SNN_PID,$DN_PID
