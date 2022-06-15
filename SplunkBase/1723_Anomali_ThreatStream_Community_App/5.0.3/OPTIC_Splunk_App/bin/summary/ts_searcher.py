import splunklib.client as client
from datetime import datetime
from time import sleep

class Searcher(object):
    def __init__(self, sessionKey, app='threatstream', owner='nobody', port=8089, logger=None):
        self.service = client.Service(token=sessionKey, owner=owner, app=app, port=port)
        self.logger = logger

    def get_status(self, job, saved_search_name):
        status = {"isDone": job["isDone"],
                  "doneProgress": float(job["doneProgress"])*100,
                  "scanCount": int(job["scanCount"]),
                  "eventCount": int(job["eventCount"]),
                  "resultCount": int(job["resultCount"])}
        statusStr = ("isDone=%(isDone)s  %(doneProgress)03.1f%%   %(scanCount)d scanned   "
          "%(eventCount)d matched   %(resultCount)d results") % status
        if self.logger:
            self.logger.info("%s: %s" % (saved_search_name, statusStr))
        print("%s: %s" % (job['name'], statusStr))
        return status

    def run(self, saved_search_names):
        jobs = {}
        job_stats = {}
        done = True
        start_time = datetime.now()
        for saved_search_name in saved_search_names:
            saved_search = self.service.saved_searches[saved_search_name];
            if self.logger:
                self.logger.info("run the savedsearch %s" % saved_search.name)
            print("run the savedsearch %s" % saved_search.name)
            jobs[saved_search_name] = saved_search.dispatch()
            job_stats[saved_search_name] = {"isDone":"0"}
        sleep(3)
        while True:
            for saved_search_name in saved_search_names:
                job = jobs[saved_search_name]
                job.refresh()
                job_stats[saved_search_name] = self.get_status(job, saved_search_name)
            done = True
            for saved_search_name in saved_search_names:
                done = done and job_stats[saved_search_name]["isDone"] == "1"
                if not done:
                    break
            if done:
                break
            else:
                sleep(3)
        if self.logger:
            self.logger.info("It takes %s to run searches %s" % ((datetime.now()-start_time), saved_search_names))
        print("It takes %s to run searches %s" % ((datetime.now()-start_time), saved_search_names))
        return jobs

    def search(self, saved_search_names, earliest, latest):
        jobs = {}
        for saved_search_name in saved_search_names:
            start_time = datetime.now()
            saved_search = self.service.saved_searches[saved_search_name]
            if saved_search:
                query = saved_search['search']
                kwargs_search = {"earliest_time" : earliest,
                                 "latest_time" : latest,
                                 "search_mode" : "normal",
                                 "execute_mode" : "normal"
                                 }
                job = self.service.jobs.create(query, **kwargs_search)
                jobs[saved_search_name] = job
                while True:
                    while not job.is_ready():
                        sleep(2)
                        job.refresh()
                    stats = self.get_status(job, saved_search_name)
                    if stats["isDone"] == "1":
                        break
                    sleep(5)
                    job.refresh()
                if self.logger:
                    self.logger.info("It takes %s to run searches %s" % ((datetime.now()-start_time), saved_search_names))
                else:
                    print("It takes %s to run searches %s" % ((datetime.now()-start_time), saved_search_names))
        return jobs

    def getEnabledSavedSearchNames(self, saved_search_names):
        results=[]
        for saved_search_name in saved_search_names:
            saved_search = self.service.saved_searches[saved_search_name]
            disabled = saved_search.content.get('disabled')
            if disabled in ['1', 1]:
                print("savedsearch: %s is disabled. Skip it" % saved_search.name)
                if self.logger:
                    self.logger.info("savedsearch: %s is disabled. Skip it" % saved_search.name)
            else:
                results.append(saved_search_name)
        return results
