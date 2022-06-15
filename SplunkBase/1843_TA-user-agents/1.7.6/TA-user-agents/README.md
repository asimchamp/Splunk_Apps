# PAVO TA User Agents Documentation

## Summary

|                            |                                                |
| -------------------------- | ---------------------------------------------- |
| Author                     | Aplura, LLC.                                   |
| App Version                | 1.7.6                                          |
| App Build                  | 9                                              |
| Platforms                  | Splunk Enterprise                              |
| Splunk Enterprise versions | 8.0, 8.1                                       |
| Creates an index           | False                                          |
| Implements summarization   | Currently, the app does not generate summaries |
| Summary Indexing           | False                                          |
| Data Model Acceleration    | False                                          |
| Report Acceleration        | False                                          |

## Scripts and binaries

This App provides the following scripts:

|                  |                                                            |
| ---------------- | ---------------------------------------------------------- |
| Diag.py          | For use with the diag command.                             |
| fetch_latest.sh | For grabbing the most recent versions of the libraries.    |
| user_agents.py  | This is the lookup command python to parse the user agent. |

Note: `fetch_latest.sample` is a bash script that would need to be renamed and have +x added to it in order to be a valid script. This script updates the libraries for on-prem installations.

# About PAVO TA User Agents

## Overview

This Add-on provides a dynamic lookup for parsing User Agent strings. This version was built to be faster, and does not require internet access from your Splunk systems.

### About

A simple HTML version of this document.

# Support and resources

## Questions and answers

Access questions and answers specific to PAVO TA User Agents at [https://community.splunk.com](https://community.splunk.com). Be sure to tag your question with the App.

## Support

  - Support Email: [customersupport@aplura.com](mailto:customersupport%40aplura.com)

  - Support Offered: Splunk Answers, Email

### Logging

Copy the `log.cfg` file from `default` to `local` and change the settings as needed.

### Diagnostics Generation

If a support representative asks for it, a support diagnostic file can be generated. Use the following command to generate the file. Send the resulting file to support.

`$SPLUNK_HOME/bin/splunk diag --collect=app:TA-user-agents`

# Prerequisites

Because this App runs on Splunk Enterprise, all of the [Splunk Enterprise system requirements](https://docs.splunk.com/Documentation/Splunk/latest/Installation/Systemrequirements) apply.

# Installation and Configuration

## Download

Download PAVO TA User Agents at [https://splunkbase.splunk.com/app/1843](https://splunkbase.splunk.com/app/1843).

### Installation Process Overview

  - Install the extension.

### Deploy to single server instance

Follow these steps to install the app in a single server instance of Splunk Enterprise:

1.  Deploy as you would any App, and restart Splunk.

2.  Configure.

### Deploy to Splunk Cloud

1.  Have your Splunk Cloud Support handle this installation.

### Deploy to a Distributed Environment

1.  For each Search Head in the environment, deploy a copy of the App.

# User Guide

## Configure PAVO TA User Agents

  - Install the App according to your environment (see steps above)

## Lookups

PAVO TA User Agents contains the following lookup files.

  - None

## Event Generator

PAVO TA User Agents does not include an event generator.

## Acceleration

1.  Summary Indexing: No

2.  Data Model Acceleration: No

3.  Report Acceleration: No

# Third Party Notices

Version 1.7.6 of PAVO TA User Agents incorporates the following Third-party software or third-party services.

  - `ua_parser`

  - `pyyaml`

## Known Issues

Version 1.7.6 of PAVO TA User Agents has the following known issues:

  - None

# Release notes

## Version 1.7.5

  -   - Improvement
        
          - Modified Script for Splunk Cloud compatability.

## Version 1.7.4

  -   - Improvement
        
          - Updated for Python 3 and Splunk 8 compatability

# [PAVO TA User Agents](#)

### Navigation

### Related Topics

  - [Documentation overview](#)

2018, Aplura, LLC.
