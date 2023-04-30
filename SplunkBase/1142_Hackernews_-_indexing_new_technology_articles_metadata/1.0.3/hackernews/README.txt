Author: Nimish Doshi

This app uses an API to download new hacker news articles every hour in JSON
format. The data is indexed within Splunk and there are three reports on a
dashboard to show the data.

If you click on an URL or any event that has a URL, you can
show the URL field in the event listing and then use the built in workflow
action to read that article.

The app showcases the KV_MODE=json feature of Splunk to automatically extract
json data into fields.

Install

Untar the app into $SPLUNK_HOME/etc/apps.
Go to $SPLUNK_HOME/etc/apps/hackernews/bin and test the input program:

splunk cmd python hackernews.py

If you get JSON data back, it worked. If not, check your internet connection
or check if the site is down. I am using api.hackernews.com for my input.

If you are on Unix, you may simply start or restart Splunk to get to the app.

On Windows, first copy hackernews/default/inputs.conf to
hackernews/local/inputs.conf and enable the windows input. Disable the
Unix input. Then start or restart Splunk.




