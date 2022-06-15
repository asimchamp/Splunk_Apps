import time
from time import sleep
import json
import splunklib.results
import settings


class Job_manager():
    
    def __init__(self, splunka, logger):
        self.logger = logger
        self.splunka = splunka
        self.jobs = {}
 
    def create_job(self, search, kwargs=None):
        kwargs_create = {
            'exec_mode': 'normal'
        }
        if kwargs:
            for k, v in kwargs.items():
                kwargs_create[k] = v
        job = self.splunka.service.jobs.create(search, **kwargs_create)
        return job
    
    def run_job(self, job, name='Unknown', kwargs=None):
        while True:
            while not job.is_ready():
                pass
            stats = {'isDone': job['isDone'],
                     'doneProgress': job['doneProgress'],
                     'scanCount': job['scanCount'],
                     'eventCount': job['eventCount'],
                     'resultCount': job['resultCount']}
            progress = float(stats['doneProgress'])*100
            scanned = int(stats['scanCount'])
            matched = int(stats['eventCount'])
            results = int(stats['resultCount'])
            status = ("\r%03.1f%% | %d scanned | %d matched | %d results" % (
                progress, scanned, matched, results))
            if stats['isDone'] == '1': 
                break
            sleep(2)
            
        kwargs_results = {'output_mode': 'json',
                          'count': settings.DEFAULT_JOB_SEARCH_COUNT}
        if kwargs:
            for k, v in kwargs.items():
                kwargs_results[k] = v
                
        count = kwargs_results['count']
        offset = 0
        job_result_data = []
        while True:
            kwargs_results['offset'] = offset
            t0 = time.time()
            results = job.results(**kwargs_results)
            result_list = [json.loads(r).get('results') for r in results]
            result_data = result_list[0] if result_list else []
            job_result_data.extend(result_data)
            result_count = len(result_data)
            self.logger.info('jobm> run_job: name: %s, offset: %s, count: %s, result_count: %s, time: %s' % (name, offset, count, result_count, time.time() - t0))
            if result_count < count:
                break
            offset += result_count

        return job_result_data
    
    def run_search(self, search, name, kwargs_create=None, kwargs_results=None):
        self.logger.info('jobm> run_search: %s' % search)
        try:
            job = self.create_job(search, kwargs_create)
        except BaseException as e:
            self.logger.exception(e)
            
        return self.run_job(job, name, kwargs_results)

        

    

 