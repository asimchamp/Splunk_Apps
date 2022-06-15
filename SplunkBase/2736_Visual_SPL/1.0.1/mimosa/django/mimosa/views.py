from django.contrib.auth.decorators import login_required
from splunkdj.decorators.render import render_to
from django.utils import simplejson
from django.http import HttpResponse

import splunklib.results as results
from time import sleep
import sys, traceback
from datetime import datetime
from log_factory import LogFactory

logger = LogFactory.create(__name__)

@render_to('mimosa:main.html')
@login_required
def main(request):
    logger.debug('get main page')
    return {
        "message": "Hello World from mimosa!",
        "app_name": "mimosa"
    }
    
@render_to('mimosa:pipeline.html')
def pipeline(request):
    logger.debug('get pipeline page')
    return {
        "message": "Hello World from mimosa!",
        "app_name": "mimosa"
    }
    
@render_to('mimosa:home.html')
@login_required
def home(request):
    logger.debug('get home page')
    return {
        "message": "Hello World from mimosa!",
        "app_name": "mimosa"
    }

def normalize_search(search, session_id, time):
    # split query and join components using pipe
    # ignore commented lines
    pipe = ' | '
    pipelines = search.splitlines()
    pipelines = map(lambda l: (l if not l.startswith('|') else l[1:]).strip(), pipelines)
    pipelines = filter(lambda l: l and not l.startswith('#'), pipelines)
    if len(pipelines) > 0:
        search = pipelines[0]
    
    tee_files = []
    search_id = hash(search)
    for i in range(1, len(pipelines)):
        # tee_dir = '/opt/splunk/var/run/splunk'
        tee_file = 'splunk_tee_{0}_{1}_{2}_{3}.csv'.format(session_id, search_id, time, i)
        tee_files.append(tee_file)
        tee_cmd = ' | outputcsv create_empty=true dispatch=false {} | '.format(tee_file)
        search = search + tee_cmd + pipelines[i]
    
    # search = pipe.join(pipelines)
    return {
        'search': search,
        'tee_files': tee_files
    }
    
def perform_search(service, search):
    logger.debug('performing search "{}"'.format(search))
    search_args = { "exec_mode": "blocking" }
    job = service.jobs.create(search, **search_args)
    rr = results.ResultsReader(job.results())
    events = []
    for result in rr:
        if isinstance(result, dict):
            events.append(result)
    
    return {
        'job': {
            'sid': job['sid'],
            'eventSearch': job['eventSearch'],
            'eventCount': job['eventCount'],
            'resultCount': job['resultCount'],
            'runDuration': job['runDuration'],
            'ttl': job['ttl']
        },
        'events': events
    }
    
def searches(request):
    time = datetime.now().strftime('%Y_%m_%d_%H_%M_%S')
    try:
        service = request.service
        query = simplejson.loads(request.body)
        search = normalize_search(query['q'], service.token[-8:], time)
        
        search_result = perform_search(service, search['search'])
        
        pipeline_result = []
        for tee_file in search['tee_files']:
            logger.debug('loading tee file {}'.format(tee_file))
            tee_search_result = perform_search(service, '| inputcsv events=True {}'.format(tee_file))
            pipeline_result.append(tee_search_result)
        
        pipeline_result.append(search_result)    
        json = {
            'search': search['search'],
            'result': search_result,
            'pipeline': pipeline_result,
            'time': time
        }
        return HttpResponse(simplejson.dumps(json), mimetype='application/json') 
    except:
        error = traceback.format_exc()
        json = {
            'error': error,
            'search': search['search'],
            'time': time
        }
        return HttpResponse(simplejson.dumps(json), mimetype='application/json') 
