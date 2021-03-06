#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#
import os
import sys

class JavaArgsGenerator:

    CLASSPATH_ARG = '-classpath'

    JAVA_EXECUTABLE = 'java'

    # REMOVED_FILES list contains the 3rd party jar files that are removed from add-on (as they are updated with available latest versions) 
    # and will not be used in classpath of java process. Appended list with older versions of the jar files.
    REMOVED_FILES = ['jboss-cli-client-6.4.jar', 'log4j-1.2.17.jar', 'guava-24.1.1-jre.jar', 'commons-lang-2.6.jar', 'guava-30.1-jre.jar', 'jboss.tar.gz', 'log4j-1.2.17.redhat-3.jar', 'commons-collections-3.2.2.jar', 'commons-logging-1.1.1.jar', 'jbossws-api-1.0.1.Final.jar', 'slf4j-api-1.7.5.jar', 'commons-configuration-1.10.jar', 'commons-pool2-2.3.jar', 'jboss-jaxb-intros-1.0.2.GA.jar', 'jbossws-common-2.1.0.Final.jar', 'slf4j-log4j12-1.7.5.jar', 'commons-io-2.4.jar', 'fastjson-1.2.60.jar', 'jboss-jaxws-api_2.2_spec-1.0.0.Final.jar', 'jbossws-spi-2.1.0.Final.jar', 'jmx-op-invoke-1.0.jar', 'log4j-api-2.14.1.jar', 'log4j-core-2.14.1.jar', 'log4j-api-2.15.0.jar', 'log4j-core-2.15.0.jar']

    def __init__(self, app_home, jar_dirs=['bin', 'lib'], vm_arguments=None, main_class=None):
        self._app_home = app_home
        self._jar_dirs = jar_dirs
        self._vm_arguments = vm_arguments
        self._main_class = main_class
        if sys.platform == 'win32':
            self._classpath_sep = ';'
        else:
            self._classpath_sep = ':'

    def generate(self):
        classpath = self._generate_classpath()
        vm_arguments_lst = self._generate_vm_arguments()
        java_args = [JavaArgsGenerator.JAVA_EXECUTABLE, JavaArgsGenerator.CLASSPATH_ARG, classpath]
        java_args.extend(vm_arguments_lst)
        if self._main_class is not None:
            java_args.append(self._main_class)
        return java_args

    def _generate_vm_arguments(self):
        vm_arguments_lst = []
        if self._vm_arguments is not None:
            for k, v in list(self._vm_arguments.items()):
                vm_arguments_lst.append(k + v)
        return vm_arguments_lst

    def _generate_classpath(self):
        classpath = ''
        for jar_dir in self._jar_dirs:
            dirpath = os.path.sep.join([self._app_home, jar_dir])
            for filename in os.listdir(dirpath):
                if filename.endswith('.jar') and filename not in JavaArgsGenerator.REMOVED_FILES:
                    filepath = os.path.join(dirpath, filename)
                    if os.path.isfile(filepath):
                        classpath = classpath + self._classpath_sep + filepath
        return classpath
