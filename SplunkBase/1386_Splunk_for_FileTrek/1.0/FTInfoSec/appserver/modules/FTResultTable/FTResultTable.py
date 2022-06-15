#
# Copyright (C) 2012 FileTrek Inc.  All Rights Reserved.
#
import controllers.module as module
import splunk
import splunk.search
import splunk.util
import splunk.entity
import lib.util as util
import lib.i18n as i18n
import logging
import cgi
import math
import splunk.bundle as bundle

logger = logging.getLogger('splunk.module.FTResultTable')

# This class is the server side handler for the FTResultTable module.
#
class FTResultTable(module.ModuleHandler):

  # this method overrides the super class implementation for a module.
  # none of the arguments provided are actually used.
  #
  def generateResults(self, host_app, client_app, sid, count=1000, offset=0, entity_name='results'):
    count = max(int(count), 0)
    offset = max(int(offset), 0)
    if not sid:
      raise Exception('CustomResultsTable.generateResults - sid not passed!')

    try:
      job = splunk.search.getJob(sid)
    except splunk.ResourceNotFound, e:
      logger.error('CustomResultsTable could not find job %s.' % sid)
      return _('<p class="resultStatusMessage">Could not retrieve search data.</p>')

    confDict = bundle.getConf("ftsetup")
    ftserver = 'unknown'
    if None != confDict:
      ftserver = confDict['filetrekserver']['url']

    if not ftserver.endswith('/'): ftserver += '/'
    output = []
    output.append('<div id="FTResultTableWrapper" class="FTResultTableWrapper">')
    output.append('<table id="FTResultTable" class="FTResultTable splTable">')
    fieldNames = [x for x in getattr(job, entity_name).fieldOrder if (not x.startswith('_'))]

    offset_start = offset
    if offset < 0 and count < abs(offset):
      offset_start = -count

    dataset = getattr(job, entity_name)[offset: offset+count]

    headingsDrawn = False
        
    for i, result in enumerate(dataset):
      #scan the resuts and place the table headers.

      if not headingsDrawn:
        output.append('<tr>')
        for field in fieldNames:
          if field == 'Id' or field == 'EndFileId' or field == 'MachineId' or field == 'UserId':
            continue
          output.append('<th>%s</th>' % field)
        output.append('</tr>')
        headingsDrawn = True


      output.append('<tr>')

      ftFileId = result.get(cgi.escape('Id'), None)
      ftEndFileId = result.get(cgi.escape('EndFileId'), None)
      ftMachineId = result.get(cgi.escape('MachineId'), None)
      ftUserId = result.get(cgi.escape('UserId'), None)
      ftAction = result.get(cgi.escape('Action'), None)
      ftDest = result.get(cgi.escape('Destination'), None)
      for field in fieldNames:
        if field == 'Id' or field == 'EndFileId' or field == 'MachineId' or field == 'UserId':
          continue

        output.append('<td')
        fieldValues = result.get(cgi.escape(field), None)
        if fieldValues:
          if field == 'File':
            output.append('><a target=\"_blank\" href=\"%sreports/file/file.html?%s\">%s</a></td>' % (ftserver,ftFileId,fieldValues))
          elif (field == 'EndFile' or field == 'Destination') and ftEndFileId != None:
            output.append('><a target=\"_blank\" href=\"%sreports/file/file.html?%s\">%s</a></td>' % (ftserver,ftEndFileId,fieldValues))
          elif field == 'Machine':
            output.append('><a target=\"_blank\" href=\"%sreports/machine/machine.html?%s\">%s</a></td>' % (ftserver,ftMachineId,fieldValues))
          elif field == 'User':
            output.append('><a target=\"_blank\" href=\"%sreports/user/user.html?%s\">%s</a></td>' % (ftserver,ftUserId,fieldValues))
          else:
            output.append('>%s</td>' % fieldValues)
        else:
          output.append('></td>')

      output.append('</tr>')

    output.append('</table></div>')

    if (entity_name == 'results' and job.resultCount == 0):
      if job.isDone:
        output = self.generateStatusMessage(entity_name, 'nodata', job.id)
      else:
        output = self.generateStatusMessage(entity_name, 'waiting', job.id)
    else:
      output = ''.join(output)

    return output

