Author:  James Donn

This App requires some configuration to work properly.

### System Performance 

This requires the Splunk App for Unix and Linux - https://apps.splunk.com/app/273/.  After installing the App, enable all of the data inputs.  


### Clicks! and Keys!:

--->> Supported on OS X only!!!  Developed using Yosemite.  No plans for further expansion for other OSs. <<---

To enable keyboard tracking, you must allow the Terminal App to control your computer.  To do this:
System Preferences -> Security & Privacy -> Privacy (tab) -> Accessibility (in column) -> Add Terminal.app 

Also be sure to ensure there is a check mark next to it.

These dashboards are fueled by the keystrokes.py script in the bin dir.  The script needs to be launched manually to start tracking clicks.  To stop it, you need to kill it. 

All the data will be placed into the newly created keystrokes and mouse indexes.

Due to its potentially nefarious nature, I will not start this script automatically.  This is also why the default data retention time for keystrokes is very low.  Feel free to change any of this on your own.

        /opt/splunk/etc/apps/stream_splunk_usage_demo/bin/keystrokes.py &

