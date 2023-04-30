1. Install the app

2. Download your hangouts.json file from the Google Takeout service. It can be found under your Google account settings or via this link:
https://www.google.com/settings/takeout
Select "Create an archive" and select "Hangouts"

3. In Splunk, select Settings->Data Inputs
	- Click "Files & Directories"
	- Click "New"
	- Select "Skip preview"
	- Click "Continue"
	- Select "Upload and index a file"
	- Click "Choose file"
	- Click "More settings"
	- Under "Set the source type", select "From list"
	- Under "Select source type from list", select "hangouts"
	- Under "Index", select "googlehangouts"
	- Click Save
4. Run Report called "Generate conversation lookup". You can also find this in the menu under Configuration->Generate conversation lookup. 

5. Done!

If you want to update the Hangouts.json file to a newer version, you should delete all old data first. To do this, you should run the report called "Delete all data" which can be found under "Configuration". The user running this report needs to have "Delete" rights enabled under "Access Controls"->"Users"

