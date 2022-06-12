#!/bin/bash
echo
echo '###############################################'
echo '##                                            ##'
echo '## Welcome to the splunk app Github installer ##'
echo '## for CentOS 7 x64.                          ##'
echo '## Last updated 06/12/2022.                   ##'
echo '##                                            ##'
echo '##                                            ##'
echo '################################################'
echo
echo

################ Variables Sections ################

splunk_token=$( cat splunk_token.txt | awk '{print $3}' )


################# Prepare the app details ###############

# Checking the DataBase folder present or not
database_folder=$(ls | grep -c Database)

if [[ "$database_folder" = 1 ]];
   then
      echo "Database folder present."
   else
      echo "Database Folder not Present."
      mkdir DataBase
      curl -L -J -v -H "X-Auth-Token: $splunk_token" https://splunkbase.splunk.com/app/2890/ | grep -e 'Splunkbase</title>' | awk -F">" '{print $2}' | awk -F"|" '{print "Name = " $1}' > splunk_name.txt
      curl -L -J -v -H "X-Auth-Token: $splunk_token"  https://splunkbase.splunk.com/app/2890/ | grep 'sb-release-select u-for="download-modal" sb-selector="release-version" sb-target="' | sed -n '1p' | awk -F"=" '{print $4}' | awk -F"\"" '{print "version = " $2}' >> splunk_name.txt
fi
