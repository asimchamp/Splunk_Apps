#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#

import os
import sys

JAVA_MAIN_CLASS = "com.splunk.jmx.JMXModularInputV3"
IBM_WAS_JAVA_MAIN_CLASS = "com.splunk.jmx.IBMWASJMXModularInputV3"
JAVA_SERVER_VALIDATION_CLASS = "com.splunk.jmx.ServerConfigValidator"
IBM_WAS_JAVA_SERVER_VALIDATION_CLASS = "com.splunk.jmx.IBMWASServerConfigValidator"
PARENT = os.path.sep + os.path.pardir
MODINPUT_PATH = os.path.abspath(__file__ + PARENT + PARENT)
MODINPUT_NAME = os.path.basename(MODINPUT_PATH)  # 'Splunk_TA_jmx'

# Set to True to use the MX4J JMX implementation
# USE_MX4J = True

# Set to True to test SSL
TEST_SSL = True
# TEST_SSL=False

# Adjust these variables to boost/shrink JVM heap size
MIN_HEAP = "64m"
MAX_HEAP = "128m"

# Create Java Args
sep = os.path.sep
psep = os.pathsep
if "JAVA_HOME" not in os.environ:
    JAVA_EXECUTABLE = "java"
else:
    JAVA_EXECUTABLE = sep.join([os.environ["JAVA_HOME"], "bin", "java"])

SPLUNK_HOME = os.environ["SPLUNK_HOME"]
MODINPUT_HOME = sep.join([SPLUNK_HOME, "etc", "apps", MODINPUT_NAME])
CONFIG_HOME = sep.join([MODINPUT_HOME, "local", "config"])

# REMOVED_FILES list contains the 3rd party jar files that are removed
# from add-on package (as they are updated with available latest versions)
# and will not be used in classpath of java process.
REMOVED_FILES = [
    "fastjson-1.2.60.jar",
    "fastjson-1.2.5.jar",
    "commons-discovery-0.2.jar",
    "commons-logging-1.1.1.jar",
    "jakarta.activation.jar",
    "log4j-api-2.11.1.jar",
    "log4j-core-2.11.1.jar",
    "junit-4.11.jar",
    "xercesImpl.jar",
    "log4j-api-2.14.1.jar",
    "log4j-core-2.14.1.jar",
    "log4j-api-2.15.0.jar",
    "log4j-core-2.15.0.jar",
]


def _generate_classpath():
    classpath = ""
    dirpath = sep.join([MODINPUT_HOME, "bin", "lib"])
    for filename in os.listdir(dirpath):
        if filename.endswith(".jar") and filename not in REMOVED_FILES:
            filepath = os.path.join(dirpath, filename)
            if os.path.isfile(filepath):
                if not classpath:
                    classpath = filepath
                else:
                    classpath += psep + filepath
    return classpath


CLASSPATH = _generate_classpath()

CLASSPATH += psep + sep.join([MODINPUT_HOME, "bin", "lib", "mx4j_boot", "*"])

if not os.path.exists(CONFIG_HOME):
    os.makedirs(CONFIG_HOME)

if sys.platform == "win32":
    CLASSPATH += psep + sep.join([MODINPUT_HOME, "bin", "lib", "win", "*"])
else:
    CLASSPATH += psep + sep.join([MODINPUT_HOME, "bin", "lib", "lin", "*"])

JAVA_COMMON_ARGS = [
    JAVA_EXECUTABLE,
    "-classpath",
    CLASSPATH,
    "-Dconfighome=" + CONFIG_HOME,
    "-Dsplunkhome=" + SPLUNK_HOME,
]
JAVA_MAIN_ARGS = JAVA_COMMON_ARGS + [JAVA_MAIN_CLASS]
IBM_WAS_JAVA_MAIN_ARGS = JAVA_COMMON_ARGS + [IBM_WAS_JAVA_MAIN_CLASS]
JAVA_SERVER_VALIDATION_ARGS = JAVA_COMMON_ARGS + [JAVA_SERVER_VALIDATION_CLASS]
IBM_WAS_JAVA_SERVER_VALIDATION_ARGS = JAVA_COMMON_ARGS + [
    IBM_WAS_JAVA_SERVER_VALIDATION_CLASS
]

if TEST_SSL:
    TEST_SSL_ARGS = (
        "-Djavax.net.ssl.trustStore="
        + SPLUNK_HOME
        + "/etc/apps/Splunk_TA_jmx/bin/mx4j.ks"
    )
    JAVA_MAIN_ARGS.insert(-1, TEST_SSL_ARGS)
    JAVA_SERVER_VALIDATION_ARGS.insert(-1, TEST_SSL_ARGS)

PID_FILE_PATH = MODINPUT_HOME + os.path.sep + MODINPUT_NAME + ".pid"
IBM_SOAP_PROTOCOL = "IBMsoap"

LOG_FILE_NAMES = [
    "jmx",
    "ibm_was_jmx",
    "ta_jmx_rh_server_field_validation",
    "ta_jmx_rh_input_data_duplication",
    "ta_jmx_task_monitor",
]
