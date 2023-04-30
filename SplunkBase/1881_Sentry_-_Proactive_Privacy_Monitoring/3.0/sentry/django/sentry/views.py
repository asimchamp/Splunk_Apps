from django.contrib.auth.decorators import login_required
from splunkdj.decorators.render import render_to

@render_to('sentry:home.html')
@login_required
def home(request):
    return {
        "message": "Hello World from sentry!",
        "app_name": "sentry"
    }

@render_to('sentry:analytic/commonality.html')
@login_required
def commonality(request):
    return {"message": "Analytic: Commonality"}

@render_to('sentry:analytic/cust_demo.html')
@login_required
def cust_demo(request):
    return {"message": "Analytic: Customer Demographics"}

@render_to('sentry:analytic/non_employee.html')
@login_required
def non_employee(request):
    return {"message": "Analytic: Non-Employee"}

@render_to('sentry:relation/personal.html')
@login_required
def personal(request):
    return {"message": "Relation: Personal"}

@render_to('sentry:relation/physical.html')
@login_required
def physical(request):
    return {"message": "Relation: Physical"}

@render_to('sentry:relation/organizational.html')
@login_required
def organizational(request):
    return {"message": "Relation: Organizational"}

@render_to('sentry:triage.html')
@login_required
def triage(request):
    return {
        "includeRedacted": False 
    }
    
@render_to('sentry:lookup.html')
@login_required
def lookup(request):
    return {
        "includeRedacted": True 
    }

@render_to('sentry:redacted.html')
@login_required
def redacted(request):
    return {
        "includeRedacted": False
    }

@render_to('sentry:diagnostic.html')
@login_required
def diagnostic(request):
    return {
    }

@render_to('sentry:search.html')
@login_required
def search(request):
    return {
    }


