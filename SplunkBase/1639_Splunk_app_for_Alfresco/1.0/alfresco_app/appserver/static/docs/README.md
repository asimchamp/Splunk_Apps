## Alfresco monitoring for Splunk

* Version : 1.0
* Date : November 2013
* Author : Nathan McMinn, nmcminn@gmail.com

## Setup Steps

Installing the Splunk app for Alfresco is fairly straightforward.  Note that this app has a dependency
on the "Monitoring of Java Virtual Machines with JMX" app.  Without the JMX app, this app will not function.  Version 2.0.3 or better is required.

* Get the latest (2.0.3 or greater) "Monitoring of Java Virtual Machines with JMX" app here: http://apps.splunk.com/app/668/
* Unpack the JMX plugin into $SPLUNK_HOME/etc/apps
* Unpack the Splunk app for Alfresco into $SPLUNK_HOME/etc/apps
* Edit $SPLUNK_HOME/etc/apps/alfresco_app/jmxconfig/solr-config.xml and alfresco-config.xml to correctly point to your Alfresco and SOLR JVMs (providing the right JMX credentials
* Restart Splunk and log in
* Enable the Alfresco and SOLR data inputs in Settings -> Data Inputs -> JMX (Java Management Extensions)

## Configuration

This app ships with JMX configurations for Alfresco and SOLR pre-written.  These can be found in $SPLUNK_HOME/apps/alfresco_app/jmxconfig.  These
files will need to be edited to point to your Alfresco and SOLR JVMs and authenticate correctly.  Other than that, no additional configuration should
be required.

## Acknowledgements

This app would not have been possible without the excellent "Monitoring of Java Virtual Machines with JMX" app by Damien Dallimore.  A HUGE thank you!
Big chunks of the Alfresco and SOLR XML configurations and the JVM dashboard components are based on the examples
found in the "Monitoring of Java Virtual Machines with JMX" app:

http://apps.splunk.com/app/668/#