#! /bin/sh
#
#  ARGUMENTS
#  $0 Script name
#  $1 Number of events returned
#  $2 Search terms
#  $3 Fully qualified query string
#  $4 Name of saved search
#  $5 Trigger reason (for example, "The number of events was greater than 1")
#  $6 Browser URL to view the saved search
#  $8 File in which the results for this search are stored (contains raw results)
splunk search "|snow instance=demo10 action=insert request=incident short_description=\"Alert filed by Splunk.\" work_notes=\"Results URL = $6\""
