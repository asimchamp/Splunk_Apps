
Author: Nimish Doshi

This add-on uses zeromq as a way to index data that may be coming from a queue.
As zeromq scales to a massive amount of events and supports a number of queue
based design patterns, it seemed logical to use this technology as an input to
capture events into Splunk.

Before Using

1) Install zeromq. http://www.zeromq.org/intro:get-the-software
2) Although zeromq supports a number of language bindings, I have chosen to
use Python here due to its simplicity to use and portability. If the machine
that will be used to receive zeromq data does not have a Python version that
is expected by zeromq, get one. www.python.org/getit/
We will not be using the Python that ships with Splunk as it may be not be
compatible with zeromq.
3) Install the Python module for zeromq. www.zeromq.org/bindings:python
   Test with the test programs that ship with it. If everything works,
   you are ready to use this add-on.

Setup.

There are two design patterns that are shipped here. One is the pipeline
pattern and the other is the publish and subscribe pattern.

What I do is use a scripted input in inputs.conf in the default directory
to initiate a listener. The pipeline listener is hwstartserver.py.
This wrapper kicks off hwserver.py using the Python that is installed on
your machine.

1) Make a copy of inputs.conf and place it in the local directory
   of the app.
2) In inputs.conf enable the hwstartserver.py stanza for your platform. Disable
   the other one. (e.g. Enable the Unix version. Disable the Windows
   version)
3) In the bin directory, edit hwstartserver.py and change the path
   to where your Python is located next to the python_executable
   variable. Edit the path for where the hwserver.py is located
   next to the real_script variable.
4) Start the hwstartserver.py script:
   ./splunk cmd python hwstartserver.py
   
   You should see no errors.
5) From another window, send data to your server. I have provided
   a program called hwclient to send sample data:
  
   python hwclient.py
 
   You should start seeing data received in the hwstartserver.py
   window.

6) Now you need to kill your hwclient.py and your hwserver.py
   processes as you were only doing this for testing. Let's use
   Splunk.

7) Start Splunk and assuming the server started, you should be
   able to send data to the pipeline using hwclient.py again as
   before, but this time, the data will be indexed. Splunk may take
   a minute to show the data, if this is the only new data coming
   in for historical searches. Also, because the TCP buffer in the
   receiving end of the Python script may flush at intervals, you may
   have to wait several minutes before a batch of events gets sent
   to standard output to index.

You are now free to write your own client to send data to the
hwserver process (Remember hwstartserver.py starts hwserver.py to avoid
Splunk's included Python).

For the publish and subscribe pattern, it is the same 7 steps
as before, but in this case you will be modifying the paths
in subscribestart.py instead of hwstartserver.py. You will be using
publish.py instead of hwclient.py to test out the sending and
receiving. Since this is a pub/sub model, it uses a filter. I've
hard coded the filter to be "east" in subscribe.py, but you are
free to change that to any string you would like to you use
for your application. Be sure to change the filter in the client,
publish.py, if you do so.

8) After you stop Splunk, the hwserver.py and/or subscribe.py
process may still be running. You would need to use ps (or task
manager on windows) to kill these processes after Splunk stops.

Troubleshooting

Remember to first get zeromq to work before you do anything with
it in Splunk. The files hwserver.py, hwclient.py, publish.py, and
subscribe.py all have hard coded host:port within them to make
connections. In your production environment, change the host:port
to meet your needs.

If you forget to kill hwserver.py and/or subscribe.py after stopping
Splunk, you won't be able to use them again in your next start
of Splunk because the host:port address is already in use. Be sure
to do that.


--------
Java

I have also built a reference implementation for using the request response
pattern with the Java binding of zeromq. The steps are below.

1) Install zeromq.
2) Install the Java binding for zeromq: http://www.zeromq.org/bindings:java
   If you have trouble after the autogen.sh step, use these instructions:
   http://tjun.jp/blog/2012/04/how-to-build-jzmq-in-mac-os-x-lion/
3) Test the Java binding.
4) Edit bin/receive.sh and bin/send.sh in the distribution to match your
   environment. I have compiled everthing with JDK 1.6. If you need to
   recompile, the source code is in the src directory. I have also shipped
   jar files from the zeromq java binding, but you may use your own. Be sure
   to update the -Djava.library.path=/usr/local/lib to match your own.
5) From two windows, test send.sh and receive.sh. If that works, stop both
   programs and move to step 6.
6) Edit inputs.conf to enable the receive.sh script.
7) Restart Splunk.

You now should be able to receive events and use the receive.java program
as a generic way to index request response events. You can use the send.sh
program to send sample events.

After shutting down Splunk, be sure do a ps -ef|grep java and kill the
the receive program so that its address is no longer in use for receiving.

Experimental Java Program

Just for testing purposes, I've included a beta jar of the Splunk Java SDK so
that you can retrieve data from Splunk using a command line search and then
send the data one line at a time to a receving Zero MQ listener. To test this
out, go to the bin directory. Then, edit sendzeromq.sh (or bat) to set your
environment variables, search string, and sending host:port. Now, edit
receivefromSDK.sh (or bat) so that it matches the host:port you used in the
sendzeromq.sh.

From one window, start receivefromSDK.sh (or bat) and in another window
start sendzeromq.sh (or bat). You should see data sender going to the receiver.

The sendzeromq.java program located in the src directory is a bit of a hack
as all data that is retrieved from Splunk is retrieved in memory in CSV format
and then sent in chunks using the newline character to break it up. Putting
all received events in memory is usually not recommended as you may run out
of Java Heap space and using a newline character to break up the CSV is rather
simplistic. Nevertheless, this part of the add-on is only for testing
purposes to prove that data can be retrieved from Splunk to put on zero MQ.

