import json, time

# from splunk.clilib import cli_common as cli
import splunk.clilib
import splunk.Intersplunk
import splunklib.client
import util.kvs_manager
import util.job_manager
import settings

def strip_begin_end_quotes(text):
    if not text or len(text) < 2 or text[0] != text[-1]:
        return text
    if text[0] == '"' or text[0] == "'":
        return text[1:-1]
    return text

def getKeywordsAndOptions():
    keywords, options = splunk.Intersplunk.getKeywordsAndOptions()
    for field in options:
        options[field] =  strip_begin_end_quotes(options[field])
    return keywords, options

def getOrganizedResults():
    return splunk.Intersplunk.getOrganizedResults()

class Splunk_access():
        
    def __init__(self, logger):
        self.logger = logger
        self.options = None
        self.keywords = None
        self.settings = None

        config = splunk.clilib.cli_common.getConfStanza('app','package')
        self.app = config.get('id')
        logger.debug('splunka> self.app: %s' % self.app)
        port = settings.get_mgmt_port()
        self.service = splunklib.client.Service(token=self.get_session_key(), owner='nobody', app=self.app, port=port)
        
        self.kvsm = util.kvs_manager.Kvs_manager(self, logger)
        self.jobm = util.job_manager.Job_manager(self, logger)
        
    def get_service(self):
        return self.service
     
    def get_app(self):
       return self.app
     
    def get_keywords(self):
        if self.options is None or self.keywords is None:
            self.keywords, self.options = getKeywordsAndOptions()
        return self.keywords
     
    def get_options(self):
        if self.options is None or self.keywords is None:
            self.keywords, self.options = getKeywordsAndOptions()
        return self.options
     
    def get_session_key(self):
        if self.settings is None:
            results, dummyresults, self.settings = getOrganizedResults()
        return self.settings['sessionKey']
    
    def get_settings(self):
        return self.settings
    
    def get_kvsm(self):
        return self.kvsm
    
    def get_jobm(self):
        return self.jobm
    
    def output_results(self, results):
        splunk.Intersplunk.outputResults(results)
        
    def audit_log(self, type='general', event='', _time=None, level='info'):
        if not _time:
            _time = time.time()
        entry = {'type': type,
                 'event': event,
                 '_time': _time,
                 'level': level
                 }    
        self.kvsm.add_kvs_batch('ts_audit_logs', [entry])
