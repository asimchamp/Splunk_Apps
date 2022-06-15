Readme

Written by Evan SooHoo, Maria Yu, Rena Jing and Xialin Yan

*Follow these instructions to get the Twitter Disease Tracker application running on your home computer

Part 1: Launch Twitter Disease Tracker

1. Download this application from Splunkbase

2. Restart Splunk Enterprise

3. Find Twitter Disease Tracker under "Applications" and launch it

4. Open "Twitter Disease Tracker" under dashboards.  The application's text boxes appears, but the visualizations are blank.  This is because you have not yet confifured the inputs

Part 2: Configure a Twitter Development Account and the Rest API Modular Input Splunk App

*These instructions are adapated from <http://discoveredintelligence.ca/stream-twitter-splunk-10-simple-steps/>, which is formally cited at the bottom of this README.

1. Log into https://dev.twitter.com using your Twitter Account

2. Click on "My Applications"

3. Click "Create New App" and fill out the name, description and website. Click "Create Your Twitter Application"

4. At the bottom of the page, click "Create my access token"

5. Wait for 30 seconds, then click the "Test OAuth" button at the bottom, top right of your screen. 

6. Go to <https://splunkbase.splunk.com/app/1546/> and download the REST API Modular Input application. This is a free, Splunk-official application.  Run it on your Splunk Enterprise UI.

7. Restart Splunk Enterprise

8. After logging back onto Splunk Enterprise, click on "Settings", then "Data Inputs", then find a new button called REST

9. Open the REST configuration window and name a REST API Input name (which is whatever you want your data to be called), type https://stream.twitter.com/1.1/statuses/filter.json as the endpoint URL, set GET for the HTTP Method, type oauth1 as the Authentication type, and enter the Client Key, Client Secret, Access Token, and Access Token Secret that appear on your Twitter development page

10. Type track=fever,vomiting^stall_warnings=true

11. Set json as the Response Type, make sure the Streaming Request is checked, set 86400 as the Request Timeout, set ^ as the delimiter, set the sourcetype to TwitterFlu and check the box for More Settings

12. Clone TwitterFlu, using TwitterCold as the name.  Set the URL arguments to track=congestion,cough,sore throat,runny nose,stuffy nose,headache,sneezing,watery eyes,fatigue^stall_warnings=true and leave all the other fields as they were

13. Repeat step 12, this time using TwitterAllergy as the name.  Set the URL arguments to track=sneezes,sneezy,watery eyes,claritin,zyrtec,hayfever,antihistamine, itchy eyes,itchy nose,nose is itchy^stall_warnings=true

14. Repeat step 12, this time using TwitterSalmonella as the name. Set the URL arguments to track=nausea,vomiting,diarrhea,fever,chills,headache^stall_warnings=true

15. Restart Splunk Enterprise. Open the Twitter Disease Tracker application and open the Twitter Disease Tracker dashboard

16. The application is now functional and all inputs have been configured. It may take several hours for a significant number of results to stream.

*References

"How to Stream Twitter into Splunk in 10 Simple Steps." Discovered Intelligence.      
     N.p., 8 Jan. 2014. Web.

 
