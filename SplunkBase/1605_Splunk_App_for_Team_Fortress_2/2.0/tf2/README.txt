Thanks for downloading the Splunk for Team Fortress 2 App!

We built this app to explore Splunk's ability to make sense of video game server logs, specifically Team Fortress 2 by Valve software.

If you don't have a server set up but still want to play with the app, we have included sample data in ~appserver/static/sample_data/

The easiest way to explore the entire dataset in Splunk is to search for "tag=tf2". 

Please note you will likely need to change the value of the [monitor://] stanza of tf2/default/inputs.conf (or better yet, make one in tf2/local/inputs.conf) to reflect the location of your TF2 server logs. 

For information about implementing some of the custom d3 visualizations that you see here in your Splunk environment, please visit:
http://dev.splunk.com/view/webframework-splunkjsstack/SP-CAAAEN6

Current development on the chord chart visualization: 
https://github.com/hobbes3/splunk_chordchart

Special thanks to Vladimir Skoryk, Stephen Luedtke, Satoshi Kawasaki, and Rachel Perkins.

We hope you enjoy this app and please feel free to send comments directly to me:

Jesse Miller
jmiller@splunk.com
Product Manager, Splunk

