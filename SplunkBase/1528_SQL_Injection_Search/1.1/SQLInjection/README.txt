by Nimish Doshi

SQL Injection search is an application template for you to use to search for
possible SQL injection in your events. It uses two macros. One is called
sqlinjection_pattern(sourcetype, uri query field) which looks for patterns
in your URI Query field to see if someone has injected them with SQL
statements. A simple set of patterns have been provided in the macro, but
be sure to modify them with possible commands, which may be used with your own
database. Simply copy macros.conf from default to the app's local directory
and change the rex command's regex to match your own patterns.

Because it is difficult to point out every SQL pattern that may be used,
another method suggested by Monzy Merza is to use standard deviations that
are 2.5 times greater than the average length of your URI Query Field. The
sqlinjection_stats(sourcetype, uri query field) macro is used to detect this.
Simply copy macros.conf from default to the app's local directory and change
the macro's where clause to match what may be typical of your own web site
to find outliers.

A combination of both these macros will help you find possible SQL Injection
attempts.

Install

Gunzip/Untar (tar zxvf or the equivalant on Windows) the distribution into
$SPLUNK_HOME/etc/apps/. If you want to index sample data, go into the default
directory and change disabled=true to disabled=false for the monitor statement.
Start Splunk. In the apps's default page, you can enter a sourcetype (such
as access_combined) and a URI Query Field (such as uri_query) to see if a
SQL Injection pattern appears. From the Dashboard Menu, select the SQL
Statistics Dashboard to try the same search using standard deviation of the
lenghth of the URI Query Field. You can also use the same two macros in
scheduled searches to trigger alerts on possible SQL injections.

If your data happens to be in a different index than main, you can either
add that index as a default index to search for the role that is using this
app or change the macros to use index=<name of index> in their search template.

