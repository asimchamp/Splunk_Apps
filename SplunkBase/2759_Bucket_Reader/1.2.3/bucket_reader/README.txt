Bucket Reader

This app allows you to read data in Splunk buckets using 3rd-party Hadoop-based applications. When you use the Hunk archiving functionality to export your raw-data journal files to HDFS, you can immediately query and analyze that data via Hunk. 

But what if you want to also view that data via applications like Hive or Pig? This app provides Hadoop tool classes that allow you to do just that:

* Provides classes that implement both the “old-style” and new “new-style” Hadoop interfaces, based on the org.apache.hadoop.mapred and org.apache.hadoop.mapreduce packages.

* Provides access to index-time fields only — search-time fields are not available.

* Lets you configure which fields are retrieved as keys and as values.

* Formats returned data as TSV.

After installing this app, open it in Hunk. The documentation tab will provide complete usage instructions, including examples.


