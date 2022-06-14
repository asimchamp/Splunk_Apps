#
# MSADTopologyReport Python Results Handler - returns JSON to the underlying module
#
# required imports
import cherrypy, datetime
import controllers.module as module

# common imports
import splunk, splunk.search, splunk.util, splunk.entity
import lib.util as util
import lib.i18n as i18n
import json

# logging setup
import logging
logger = logging.getLogger('splunk.appserver.controllers.module.MSADTopologyReport')

class MSADTopologyReport(module.ModuleHandler):
    
    def generateResults(self, host_app, client_app, sid, earliest_time=None, latest_time=None, entity_name='results', postprocess=None):
    
        #
        # This needs to be in response to a search, so we need the search ID
        #
        if not sid:
            raise Exception('MSADTopologyReport.generateResults - sid not passed!')
            
        # get the search jobs
        try:
            job = splunk.search.getJob(sid, sessionKey=cherrypy.session['sessionKey'])
        except splunk.ResourceNotFound:
            return _('<p class="moduleException">[MSADTopologyReport module] Session Key Not Found</p>')
        
        # set formatting
        # set formatting
        job.setFetchOption(
            time_format=cherrypy.config.get('DISPATCH_TIME_FORMAT'),
            earliestTime=earliest_time, 
            latestTime=latest_time,
            output_time_format=i18n.ISO8609_MICROTIME
        )


        # set the postprocess arg.
        if postprocess:
            job.setFetchOption(search=postprocess)
        
        # For each row of data, there will be a number of fields.  The fields could be multi-valued
        # or single valued.  If they are single-valued, then just add them into the order.  If they
        # are multi-valued, then put them in as an array
        #
        results = []
        dataset = getattr(job, entity_name)
        
        for row in dataset:
            # This is the data for each row
            rowdata = {}    

            # Loop through the fields and convert to a string
            for f in row.keys():
                # Skip any entry that begins with an underscore
                if (f[0] != "_"):
                    rowdata[f] = row.get(f).__str__()
            results.append(rowdata)
        
        # Dump out the JSON version
        return _(json.dumps(results))
        
        
            
        

