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

splunk_token=$( cat /home/runner/work/Splunk_Apps/Splunk_Apps/splunk_token.txt | awk '{print $3}' )


app_list_func ()
{
################# Prepare the app details ###############


# Checking the DataBase folder present or not
SplunkBase_folder=$(ls | grep -c SplunkBase)

if [ "$SplunkBase_folder" = "1" ];
   then
      echo "SplunkBase folder present."
      curl -L -J -v -H "X-Auth-Token: $splunk_token" https://splunkbase.splunk.com/app/$i/ | grep -e 'Splunkbase</title>' | awk -F">" '{print $2}' | awk -F"|" '{print "Name = " $1}' > /home/runner/work/Splunk_Apps/Splunk_Apps/SplunkBase/splunk_name.txt
      curl -L -J -v -H "X-Auth-Token: $splunk_token"  https://splunkbase.splunk.com/app/$i/ | grep 'sb-release-select u-for="download-modal" sb-selector="release-version" sb-target="' | sed -n '1p' | awk -F"=" '{print $4}' | awk -F"\"" '{print "version = " $2}' >> /home/runner/work/Splunk_Apps/Splunk_Apps/SplunkBase/splunk_name.txt
   else
      echo "SplunkBase Folder not Present."
      mkdir SplunkBase
      curl -L -J -v -H "X-Auth-Token: $splunk_token" https://splunkbase.splunk.com/app/$i/ | grep -e 'Splunkbase</title>' | awk -F">" '{print $2}' | awk -F"|" '{print "Name = " $1}' > /home/runner/work/Splunk_Apps/Splunk_Apps/SplunkBase/splunk_name.txt
      curl -L -J -v -H "X-Auth-Token: $splunk_token"  https://splunkbase.splunk.com/app/$i/ | grep 'sb-release-select u-for="download-modal" sb-selector="release-version" sb-target="' | sed -n '1p' | awk -F"=" '{print $4}' | awk -F"\"" '{print "version = " $2}' >> /home/runner/work/Splunk_Apps/Splunk_Apps/SplunkBase/splunk_name.txt
fi

}


########## Checking app avaibility on Splunk Base #################
app_not_found=$(curl -L -J -v -H "X-Auth-Token: $splunk_token" https://splunkbase.splunk.com/app/$i/ | grep "404 Error" | awk -F">" '{print $2}' | awk -F"." '{print $1}' | wc -l)

app_archive=$(curl -L -J -v -H "X-Auth-Token: $splunk_token" https://splunkbase.splunk.com/app/$i/ | grep "This app has been archived" |  awk -F"." '{print $1}' | cut -c 13-38 | wc -l)

app_found=$(curl -L -J -v -H "X-Auth-Token: $splunk_token" https://splunkbase.splunk.com/app/$i/ | grep -e 'Splunkbase</title>' | awk -F">" '{print $2}' | awk -F"|" '{print "Name = " $1}' | wc -l)

for i in {1850..1852}
do
   if [ "$app_not_found" = "1" ];
   then
   echo "Splunk App ID:$i is not available in Splunkbase."

   elif [ "$app_archive" = "1" ];
   then
   echo "Splunk App ID:$i is archived app in Splunkbase."

   elif [ "$app_found" = "1" ];
   then
   echo "Splunk App ID:$i is availabe in Splunkbase."
   app_list_func

   fi

done

echo "Loop Completed."
