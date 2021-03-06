 Introduction
--------------

This application is dedicated to PostgreSQL monitoring and insight.  It is intended to provide a detailed view of PostgreSQL database condition, including metrics and query analysis. It requires Add-on for Postgres to retrieve data from a database server. It also has some samples included for use with eventgen app so that it can be tested without actual database connection.

 Prerequisites
---------------

This application uses Add-on for Postgres to connect to database server(s). 
You can also use eventgen for generating events from samples included in the app so you need to install it first and follow the procedure described below.

 Installation
--------------

During application installation a dedicated index is created called pgsql. It stores all data coming from sample events (generated by eventgen), log files or database scritps.
In order to utilize "simulation" mode using eventgen see the following instruction:

  * Download eventgen from https://github.com/splunk/eventgen/archive/master.zip
  * Extract it to your apps directory ($SPLUNK_HOME/etc/apps)
  * Change extracted directory name from eventgen-master to eventgen
  * Copy from default subdirectory in the app home ( $SPLUNK_HOME/etc/apps/postgres_app/default) file called eventgen.conf.example to subdirectory local ($SPLUNK_HOME/etc/apps/postgres_app/local) and call it eventgen.conf
  * Restart splunk

Now eventgen will start sending events to the app as if they were generated by a live database system.
