Splunk App for Campfire - Enables Campfire Messaging & Alerts from Splunk.

.. image:: https://secure.travis-ci.org/ampledata/splunk_app_campfire.png?branch=develop
        :target: https://secure.travis-ci.org/ampledata/splunk_app_campfire

Installation
============
#. Retrieve your `Campfire API Credentials`_ (Subdomain, Authentication Token & Room Name).
#. Install App (from `Splunk Base`_ or from .spl archive).
#. From the Splunk Manager, find the Splunk App for Campfire and select *Set up*.
#. Enter your API Credentials.

.. image:: https://raw.github.com/ampledata/splunk_app_campfire/develop/docs/splunk_app_setup.png

.. _Campfire API Credentials: http://developer.37signals.com/campfire/index
.. _Splunk Base: http://splunk-base.splunk.com/


Usage
=====

Event Paste
----------------

#. Search for Events within Splunk.
#. Click the 'workflow' pulldown and select **Campfire Paste**.

.. image:: https://raw.github.com/ampledata/splunk_app_campfire/develop/docs/splunk_event_paste.png

.. image:: https://raw.github.com/ampledata/splunk_app_campfire/develop/docs/campfire_event_paste.png

Saved Search Alert Paste
-----------------------------

#. Created a Splunk Saved Search.
#. Under *Alert Actions* select *Run a script*.
#. Enter **campfire.py** and click *Save*.

.. image:: https://raw.github.com/ampledata/splunk_app_campfire/develop/docs/splunk_saved_search_paste.png


.. image:: https://raw.github.com/ampledata/splunk_app_campfire/develop/docs/campfire_alert_paste.png

Testing
=======
To test this App:

#. export CAMPFIRE_SUBDOMAIN='xxx'
#. export CAMPFIRE_AUTH_TOKEN='yyy'
#. export CAMPFIRE_ROOM_NAME='yyy'


Source
======
Github: https://github.com/ampledata/splunk_app_campfire

Author
======
* Greg Albrecht <mailto:gba@splunk.com>
* Portions of campfire.py Lawrence Oluyede

Copyright
=========
* Copyright 2012 Splunk, Inc.
* Portions of campfire.py Copyright (c) 2009-2012, Lawrence Oluyede

License
=======
BSD 3-Clause, see LICENSE.txt
