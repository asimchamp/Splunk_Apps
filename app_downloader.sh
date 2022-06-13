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

splunk_home='/home/runner/work/Splunk_Apps/Splunk_Apps'
#splunk_home='/opt/github'

splunk_token=$( cat /home/runner/work/Splunk_Apps/Splunk_Apps/splunk_token.txt | awk '{print $3}' )
#splunk_token=$( cat $splunk_home/splunk_token.txt | awk '{print $3}' )

app_download_func ()
{
################# Prepare the app details ###############
BASE_APP_NAME=$( cat $splunk_home/splunk_name.txt | grep $e | awk -F"=" '{print $3}' |  awk -F"," '{print $1}' |  sed "s/ $//g" | sed 's/ /_/g' )

BASE_APP_VER=$( cat $splunk_home/splunk_name.txt | grep $e | awk -F"," '{print $2}' | awk -F"=" '{print $2}' )

BASE_DOWN_URL='http://splunkbase.splunk.com/app/$e/release/$BASE_APP_VER/download/'

# Checking the DataBase folder present or not
SplunkBase_folder=$(ls $splunk_home/ | grep -cw SplunkBase)

if [ "$SplunkBase_folder" = "1" ];
   then
      echo "SplunkBase folder present."

   else
      echo "SplunkBase Folder not Present."
      mkdir $splunk_home/SplunkBase/
      echo "SplunkBase Folder Created."

fi

APP_folder=$(ls $splunk_home/SplunkBase/ | grep -cw $BASE_APP_NAME)

if [ "$APP_folder" = "1" ];
   then
      echo "$BASE_APP_NAME folder present."

   else
      echo "$BASE_APP_NAME Folder not Present."
      mkdir $splunk_home/SplunkBase/$BASE_APP_NAME/
      echo "$BASE_APP_NAME Folder Created."

fi

VER_folder=$(ls $splunk_home/SplunkBase/$BASE_APP_NAME/ | grep -cw $BASE_APP_VER)

if [ "$VER_folder" = "1" ];
   then
      echo "$BASE_APP_VER folder present."

   else
      echo "$BASE_APP_VER Folder not Present."
      mkdir $splunk_home/SplunkBase/$BASE_APP_NAME/$BASE_APP_VER/
      echo "$BASE_APP_VER Folder Created."

fi

##### Downloading the app file from SplunkBase


file_tgz=$(ls $splunk_home/SplunkBase/$BASE_APP_NAME/$BASE_APP_VER/ | grep .tgz | wc -l )

if [ "$file_tgz" = "1" ];
   then
      echo "File already present."

   else
      cd $splunk_home/SplunkBase/$BASE_APP_NAME/$BASE_APP_VER/
      curl -L -J -O -H "X-Auth-Token: $splunk_token" https://splunkbase.splunk.com/app/$e/release/$BASE_APP_VER/download/
      sleep 2
      tar -xvzf $splunk_home/SplunkBase/$BASE_APP_NAME/$BASE_APP_VER/*.tgz -C $splunk_home/SplunkBase/$BASE_APP_NAME/$BASE_APP_VER
      sleep 2
fi

}

rm -rf $splunk_home/merge.txt $splunk_home/splunk_name.txt

########## Checking app avaibility on Splunk Base #################
for i in {1850..1855}
do

app_not_found=$(curl -H "X-Auth-Token: $splunk_token" https://splunkbase.splunk.com/app/$i/ | grep "404 Error: Page not found" | awk -F">" '{print $2}' | awk -F"." '{print $1}' )
echo "ID=$i" "app_not_found="$app_not_found,
echo "ID=$i" "app_not_found="$app_not_found, >> $splunk_home/1_app_not_found.txt
cat $splunk_home/1_app_not_found.txt | grep "404 Error: Page not found" >> $splunk_home/merge.txt

app_archive=$(curl -H "X-Auth-Token: $splunk_token" https://splunkbase.splunk.com/app/$i/ | grep "This app has been archived" |  awk -F"." '{print $1}' | cut -c 13-38 )
echo "ID=$i" "app_not_found="$app_archive,
echo "ID=$i" "app_not_found="$app_archive, >> $splunk_home/2_app_archive.txt
cat $splunk_home/2_app_archive.txt | grep "This app has been archived" >> $splunk_home/merge.txt

app_not_available=$(curl -H "X-Auth-Token: $splunk_token" https://splunkbase.splunk.com/app/$i/ | grep "This app is currently not available" | awk -F">" '{print $2}' | awk -F"." '{print $1}' )
echo "ID=$i" "app_not_found="$app_not_available,
echo "ID=$i" "app_not_found="$app_not_available, >> $splunk_home/3_app_not_available.txt
cat $splunk_home/3_app_not_available.txt | grep "This app is currently not available" >> $splunk_home/merge.txt

app_found=$(curl -H "X-Auth-Token: $splunk_token" https://splunkbase.splunk.com/app/$i/ | grep -e 'Splunkbase</title>' | awk -F">" '{print $2}' | awk -F"|" '{print $1}' )
app_version=$(curl -H "X-Auth-Token: $splunk_token" https://splunkbase.splunk.com/app/$i/ | grep 'sb-release-select u-for="download-modal" sb-selector="release-version" sb-target="' | sed -n '1p' | awk -F"=" '{print $4}' | awk -F"\"" '{print $2}' )
echo "ID=$i" "app_found="$app_found, "app_version="$app_version
echo "ID=$i" "app_found="$app_found, "app_version="$app_version >> $splunk_home/splunk_name.txt

done

sort $splunk_home/merge.txt | uniq -d > $splunk_home/merge_uniq.txt
rm -rf $splunk_home/merge.txt $splunk_home/*_app_*
sed -i 's/404//g' $splunk_home/splunk_name.txt

echo "Loop Completed for list"

for e in {1850..1855}
do
   download_app=$(cat $splunk_home/merge_uniq.txt | grep $e | wc -l )
   if [ "$download_app" = "1" ];
      then
      echo "ID=$e"  "App not available for the Download."

   else
      echo "ID=$e"  "App available for the Download."
      app_download_func

   fi

done


echo "Loop Completed for Download."
