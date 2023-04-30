#
# Copyright (C) 2012 FileTrek Inc.  All Rights Reserved.
#
import controllers.module as module
import splunk
import splunk.bundle as bundle
import logging

logger = logging.getLogger('splunk.module.FTReportLauncher')

# This class is the server side handler for the FTReportLauncher module.
# It simply looks up the current FileTrek server configuration item from
# ftsetup.conf file and returns that value as the base URL for calls to 
# filetrek server.
#
class FTReportLauncher(module.ModuleHandler):

  # this method overrides the super class implementation for a module.
  # none of the arguments provided are actually used.
  #
  def generateResults(self, host_app, client_app, sid, count=1000, offset=0, entity_name='results'):
    # ftsetup is the conf file we need to query. We are looking specifically for the
    # filetrekserver stanza, and the 'url' key contained in it.
    confDict = bundle.getConf("ftsetup")
    ftserver = 'unknown'
    if None != confDict:
      ftserver = confDict['filetrekserver']['url']
    logger.info("FT SERVER: <" + ftserver + ">")
    return ftserver
