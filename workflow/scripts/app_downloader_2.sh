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

#splunk_home='/workspace/Splunk_installation'
splunk_home='/home/runner/work/Splunk_Apps/Splunk_Apps'

n=2882
k=1
l=1

#splunk_token=$( cat /home/runner/work/Splunk_Apps/Splunk_Apps/splunk_token.txt | awk '{print $3}' )
splunk_token=$SPLUNK_TOKEN

workflow_number='_1'

### Checking the Workflow folder present or not

workflow_folder=$(ls $splunk_home/ | grep -cw workflow)

if [ "$workflow_folder" = "1" ];
   then
      echo "workflow folder present."

   else
      echo "workflow Folder not Present."
      mkdir $splunk_home/workflow/
      echo "workflow Folder Created."

fi

### Checking the Workflow number folder present or not

workflow_number_folder=$(ls $splunk_home/workflow/ | grep -cw workflow$workflow_number)

if [ "$workflow_number_folder" = "1" ];
   then
      echo "workflow folder number present."
	  
   else
      echo "workflow Folder not Present."
      mkdir $splunk_home/workflow/workflow$workflow_number
      echo "workflow Folder Created."
	  

fi

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



app_download_func ()
{
################# Prepare the app details ###############
BASE_APP_NAME=$( cat $splunk_home/workflow/workflow$workflow_number/splunk_name.txt | grep $e | awk -F"=" '{print $3}' |  awk -F"," '{print $1}' |  sed "s/ $//g" | sed 's/ /_/g' )

BASE_APP_VER=$( cat $splunk_home/workflow/workflow$workflow_number/splunk_name.txt | grep $e | awk -F"," '{print $2}' | awk -F"=" '{print $2}' )

BASE_DOWN_URL='http://splunkbase.splunk.com/app/$e/release/$BASE_APP_VER/download/'


APP_folder=$(ls $splunk_home/SplunkBase/ | grep -cw $e"_"$BASE_APP_NAME)

if [ "$APP_folder" = "1" ];
   then
      echo "$BASE_APP_NAME folder present."

   else
      echo "$BASE_APP_NAME Folder not Present."
      mkdir $splunk_home/SplunkBase/$e"_"$BASE_APP_NAME/
      echo "$BASE_APP_NAME Folder Created."

fi

VER_folder=$(ls $splunk_home/SplunkBase/$e"_"$BASE_APP_NAME/ | grep -cw $BASE_APP_VER)

if [ "$VER_folder" = "1" ];
   then
      echo "$BASE_APP_VER folder present."

   else
      echo "$BASE_APP_VER Folder not Present."
      mkdir $splunk_home/SplunkBase/$e"_"$BASE_APP_NAME/$BASE_APP_VER/
      echo "$BASE_APP_VER Folder Created."

fi

### excluding over 50MB file

file_size=$(curl -s -H "X-Auth-Token: $splunk_token" https://splunkbase.splunk.com/app/$i | awk -F",\"release\":" '{print $2}' | awk -F"\"size\":" '{print $2}' | cut -d ',' -f 1)

if [[ "$file_size" -gt "50000000" ]];
   then
      echo "file_size=$file_size" "File size too large."
	  
   else
	  echo "file_size=$file_size" "File size normal."
	  tar_file_func
      
fi  

}

tar_file_func()
{

##### Downloading the app file from SplunkBase


file_tgz=$(ls $splunk_home/SplunkBase/$e"_"$BASE_APP_NAME/$BASE_APP_VER/ | grep .tgz | wc -l )

if [ "$file_tgz" = "1" ];
   then
      echo "File already present."
   else
      cd $splunk_home/SplunkBase/$e"_"$BASE_APP_NAME/$BASE_APP_VER/
      curl -s -L -J -O -H "X-Auth-Token: $splunk_token" https://splunkbase.splunk.com/app/$e/release/$BASE_APP_VER/download/
      sleep 2
	  tar_file_size

fi

}

tar_file_size()
{

check_tar_size=$( find $splunk_home/SplunkBase/$e"_"$BASE_APP_NAME/$BASE_APP_VER/ -type f -name "*.tgz" -size +50M | wc -l )

if [ "$check_tar_size" = "1" ];
   then
   echo "Tar file size more than 50MB, deleting file"
   rm -rf $splunk_home/SplunkBase/$e"_"$BASE_APP_NAME/$BASE_APP_VER/*.tgz
   
   else
      echo "Tar file size less than 50MB, unzip tar tile"
      tar -xvzf $splunk_home/SplunkBase/$e"_"$BASE_APP_NAME/$BASE_APP_VER/*.tgz -C $splunk_home/SplunkBase/$e"_"$BASE_APP_NAME/$BASE_APP_VER
      sleep 2

fi
}

rm -rf $splunk_home/workflow/workflow$workflow_number/splunk_name.txt

previous_check_func()
{

previous_download_app=$(cat $splunk_home/workflow/workflow$workflow_number/null_app.txt | grep "$i" | wc -l )

if [ "$previous_download_app" = "1" ];
   then
   echo "App Present on old data bsase"
   echo "previous_download_app=$previous_download_app"
   
else
   echo "Checking on Splunkbase Portal"
   echo "previous_download_app=$previous_download_app"
   check_splunkbase_func

fi

}

check_splunkbase_func()
{

file_name_present=$(curl -s -H "X-Auth-Token: $splunk_token" https://splunkbase.splunk.com/app/$i | grep filename | wc -l)

if [ "$file_name_present" = "1" ];
   then
   echo "file_name_present=$file_name_present" "ID=$i" "App available in splunkbase portal"
   app_found=$(curl -s -H "X-Auth-Token: $splunk_token" https://splunkbase.splunk.com/app/$i |  awk -F",\"title\":\"" '{print $2}' |  awk -F"\"" '{print $1}' )
   app_version=$(curl -s -H "X-Auth-Token: $splunk_token" https://splunkbase.splunk.com/app/$i |  awk -F",\"release\":" '{print $2}' | awk -F"," '{print $2}' | awk -F":" '{print $2}' | sed "s/\"//g" )
   echo "ID=$i" "app_found="$app_found, "app_version="$app_version >> $splunk_home/workflow/workflow$workflow_number/splunk_name1.txt
   
   else
   echo "file_name_present=$file_name_present" "ID=$i" "App is not available in splunkbase portal"
   echo "ID=$i" "msg=Not in splunkbase" >> $splunk_home/workflow/workflow$workflow_number/null_app1.txt
fi   

}

########## Checking app avaibility on Splunk Base #################
while [ $k -le 500 ]

do
   i=`expr $k \+ $n`
   echo "Performing app avaibility function"
   previous_check_func

((++k))

done

sort $splunk_home/workflow/workflow$workflow_number/splunk_name1.txt | uniq > $splunk_home/workflow/workflow$workflow_number/splunk_name.txt
sort $splunk_home/workflow/workflow$workflow_number/null_app1.txt | uniq > $splunk_home/workflow/workflow$workflow_number/null_app.txt
rm -rf $splunk_home/workflow/workflow$workflow_number/merge.txt $splunk_home/workflow/workflow$workflow_number/1merge_uniq.txt $splunk_home/workflow/workflow$workflow_number/*_app_*

echo "Loop Completed for list"


# Looping i, i should be less than
# or equal to 10 
while [ $l -le 500 ]
do
e=`expr $l \+ $n`

# printing on console
echo "$e"

   download_app=$(cat $splunk_home/workflow/workflow$workflow_number/splunk_name.txt | grep $e | wc -l )
   
   if [ "$download_app" = "1" ];
      then
      echo "ID=$e"  "App available for the Download."
      app_download_func

   else
	  echo "ID=$e"  "App not available for the Download."

   fi
   
 ## deleting the blank folder
 delete_blank=$(ls $splunk_home/SplunkBase/ | grep -cw $e"_" )
 
 if [ "$delete_blank" = "1" ];
   then
      echo "ID=$e"  "folder present for deleting."
      rm -rf $splunk_home/SplunkBase/$e"_"

   else
      echo "ID=$e"  "Folder not Present for deleting."

fi

# incrementing i by one  
((++l))

done



echo "Loop Completed for Download."

echo "Permission set to Global"
chmod -R 777 $splunk_home/
echo "Permission has been changed"
