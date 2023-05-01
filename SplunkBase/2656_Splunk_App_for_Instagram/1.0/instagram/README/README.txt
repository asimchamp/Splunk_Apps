Johan Bjerke
jbjerke@splunk.com
Splunk Inc.

Installation instructions

Using sample data

The app comes with sample data that can be found in the "sampledata" folder. If you want to try the app without configuring your Instagram developer account you can skip all steps except step 4 and manually upload the sample files. Make sure you import the files using sourcetype=instagram and index=instagram.
Using Instagram API

If you want to enable a real time feed from Instagram follow the steps below.
1. Create a developer account with Instagram."

This can be done here:
https://instagram.com/developer

2. Register a client to obtain your Client ID and Client Secret."

This can be done here:
https://instagram.com/developer/clients/register/
The Splunk app for Instagram uses implicit authentication so you have to un-check the checkbox "Disable implicit Oauth".

3. Obtain your access token."

This entire process is described on this page:
https://instagram.com/developer/authentication/
As we are using implicit authentication you can skip to the section called "Client-Side (implicit) authentication" which is described below under 3.1 and 3.2.

3.1 Direct your user to our authorization URL"

https://instagram.com/oauth/authorize/?client_id=CLIENT-ID redirect_uri=REDIRECT-URI response_type=token
At this point, we present the user with a login screen and then a confirmation screen where they approve your app’s access to their Instagram data. Note that unlike the explicit flow the response type here is "token".

3.2 Receive the access_token via the URL fragment"

Once the user has authenticated and then authorized your application, we’ll redirect them to your redirect_uri with the access_token in the url fragment. It’ll look like so:
http://your-redirect-uri#access_token=ACCESS-TOKEN
Simply grab the access_token off the URL fragment.
4. Install the Splunk app for Instagram"

5. Install the dependent REST API Modular Input app"

Copy the folder SPLUNK HOME/etc/apps/instagram/install/rest_ta to SPLUNK HOME/etc/apps/ . This will install the official REST API modular input created by Damien Dallimore that is used for connecting to the Instagram API. This version of rest_ta includes some custom python response handlers to handle the Instagram API json format. These are not included in the REST API Modular input app that can be found on Splunkbase. 

6. Add the Instagram API credentials to the app."

Add Client ID, Client Secret, and Access Token to the REST inputs that can be found under Settings->Data Inputs->REST
The Splunk app for Instagram connects to the Instagram API. I have included connections to 5 endpoints although you can easily add more endpoint connections by creating a new REST input.
Full details on the endpoints can be found here:
https://instagram.com/developer/endpoints/
7. Enable the REST modular inputs"

This can be done under Settings->Data Inputs->REST
The app will place all data in the index called "instagram"
Usage instructions

Data inputs

The app comes with five pre-configured data inputs.

Your complete feed"

https://api.instagram.com/v1/users/self/feed
This will download every post that appear on the feed associated with the Access Token. This includes posts by other users that the user is following.
User feed - self"

https://api.instagram.com/v1/users/self/media/recent
This will download all posts made by the user associated with the Access Token. The Instagram API will split up the feeds in small pieces of about 50-200 posts per call to limit the amount of data that is sent at any one time. The Splunk app for Instagram will traverse through all posts made by the user by doing multiple API calls. It will start with the newest posts first until it reaches the oldest post. After that the app will add a parameter to the API url string called min_timestamp which will tell the Instagram API to only return posts made after that timestamp.
User feed - nature"

https://api.instagram.com/v1/users/2666166/media/recent
This will download all posts for the user id 2666166. The app includes this input as an example for the account "nature". To follow a different account, clone this input and/or modify the user id 2666166 in the endpoint URL to something else. You can find out the user id for an Instagram user by visiting various web pages such as these: 

http://jelled.com/instagram/lookup-user-id 
http://www.otzberg.net/iguserid/ 

This input will also traverse through all old posts in the same way as the "User feed - self" input.
Tag search - #nature"

https://api.instagram.com/v1/tags/nature/media/recent
This will look for posts tagged with "#nature" . The Instagram user does not have to follow the users creating the posts so this can be used to find trends or to follow activity for your keyword or brand. To follow a different tag, clone this input and/or modify the word "nature" in the endpoint URL. Please note that links in the caption (@nature rather than #nature) are not captured by the Instagram API tag endpoint.
Followed by - nature"

https://api.instagram.com/v1/users/2666166/followed-by
This will download the list of users that are following the user "nature". To follow a different account, clone this input and/or modify the user id 2666166 in the endpoint URL to something else.
Please note that there is no timestamp in the response for this endpoint so we cannot know when a user started following the "nature" account. The timestamp will be when you downloaded that particular follower. Some users on Instagram have many millions of followers so it can take a long time to get the full user list. I have achieved speeds of about 2000 followers per minute using this endpoint so to download a "followed by" list for an account with millions of followers could take days to complete.

Keep the naming convention, "Followed by - USER", on this data source as we extract the field Following from the source field. There is no other way to extract the user that the user is following as this is not contained in the response from the Instagram API.

Dashboards

The app comes with three dashboards.

User feed - self

This shows statistics and metrics around your feed
User feed - nature

This shows statistics and metrics around the template account (@nature) that the app is following.
Tag tracking

This shows trends around the tag #nature
There is also an additional report, "Instagram API Tracking", that shows you the amount of events that is coming into your Splunk installation. This can be used to see which feed or tag is generating most traffic.

Data model

The app comes with a data model called "Social" that you can use to do ad-hoc reporting through the pivot interface. You can access it by clicking "Pivot" in the navigation menu.