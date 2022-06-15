import os
import time
import gzip, csv
import settings
            
#for reference only
CSV_IOC_FIELDS = ['asn', 'classification', 'confidence', 'country', 'date_first', 'date_last', 'detail', \
              'detail2', 'domain', 'email', 'id', 'import_session_id', 'itype', 'lat', 'lon', \
              'maltype', 'md5', 'media', 'media_type', 'org', 'resource_uri', 'severity', 'source', \
              'source_feed_id', 'srcip', 'state', 'url', 'actor', 'campaign']

IOC_TYPES = set(['ip', 'domain', 'url', 'email', 'md5'])
IOC_FIELDS = ['asn', 'classification', 'confidence', 'country', 'date_first', 'date_last', 'detail', 'id', 'itype', 
              'lat', 'lon', 'lookup_key_value', 'maltype', 'org', 'resource_uri', 'severity', 'source',
              'actor', 'campaign', 'tipreport', '_time', 'last_time', 'link', 'type']

IOC_FIELDS_SET = set(IOC_FIELDS)

#each csv file an indicator
class Iocs():
    
    #type values: 'ip', 'email', 'domain', 'md5', 'url'
    def __init__(self, type, kvsm, logger, single_collection=True):
        self.type = type
        self.kvsm = kvsm
        self.logger = logger
        self.single_collection = single_collection
        self.type_file_map = {'ip' : 'ts_ip.csv.gz',
                'email' : 'ts_email.csv.gz',
                'domain' : 'ts_domain.csv.gz',
                'md5' : 'ts_md5.csv.gz',
                'url' : 'ts_url.csv.gz',
                }
        
    def get_ioc_field(self):
       return self.type if self.type != 'ip' else 'srcip'
    
    def get_ioc(self, key_row, val_row):
        ioc0 = {}
        ioc = {}
        for k, v in zip(key_row, val_row):
            ioc0[k] = v
            if k == self.get_ioc_field():
                k = 'lookup_key_value'   
            if k in IOC_FIELDS_SET:
                ioc[k] = v
        ioc['type'] = self.type 
        return ioc
                 
    def get_lookup_file(self):
        file_name = self.type_file_map.get(self.type)
        self.logger.debug('iocs> file_name: %s' % file_name)
        if not file_name:
            return None
        lookup_file = os.path.join(settings.get_lookup_dir(), file_name)
        return lookup_file

    def get_collection(self):
        if self.single_collection:
            return 'ts_iocs'
        return 'ts_iocs_%s' % self.type

    def load_iocs(self):
        self.logger.debug('iocs> load_iocs starts')
        lookup_file = self.get_lookup_file()
        self.logger.debug('iocs> lookup_file: %s' % lookup_file)
        if not lookup_file:
            return []
        
        with gzip.open(lookup_file, "rb") as csv_file:
            csv_reader = csv.reader(csv_file)
            first_row = None
            try:
                first_row = csv_reader.next()
            except BaseException as e:
                self.logger.exception(e)
                return
            
            iocs = [self.get_ioc(first_row, row) for row in csv_reader]
       
        self.logger.debug('iocs> type: %s, iocs count: %s' % (self.type, len(iocs))) 
#         self.logger.debug('iocs> iocs: %s' % iocs) 
        self.kvsm.add_kvs_batch(self.get_collection(), iocs)      
        return iocs
    
