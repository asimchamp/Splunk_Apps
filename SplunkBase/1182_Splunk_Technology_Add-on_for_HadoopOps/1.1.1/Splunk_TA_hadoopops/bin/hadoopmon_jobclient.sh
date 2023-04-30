#!/bin/sh
# mrclient.sh
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

HADOOP_JAR=`ls ../lib/hadoop-core*.jar`
CMNSLGNG=`ls ../lib/commons-logging-1*.jar`
CMNSCNFG=`ls ../lib/commons-configuration*.jar`
CMNSLANG=`ls ../lib/commons-lang*.jar`
HADOOP_CLIENT_JARS=$HADOOP_JAR:$CMNSLGNG:$CMNSCNFG:$CMNSLANG
CMNSHTTP=`ls ../lib/commons-httpclient*.jar`
JKSNCORE=`ls ../lib/jackson-core-asl*.jar`
JKSNMAPR=`ls ../lib/jackson-mapper-asl*.jar`
LOG4J=`ls ../lib/log4j*.jar`
SPLUNK_JARS=./*
HADOOP_LAUNCH_JARS=$CMNSHTTP:$JKSNCORE:$JKSNMAPR:$LOG4J

if [ "$JAVA_HOME" = "" ]; then
  JAVA=java #Rely on that java is in path.
else
  JAVA="$JAVA_HOME"/bin/java #Use JAVA_HOME.
fi

$JAVA -cp "$HADOOP_CLIENT_JARS:$HADOOP_LAUNCH_JARS:$SPLUNK_JARS" com.splunk.hadoopopsfwd.hadoop.client.MapReduceClient $@
