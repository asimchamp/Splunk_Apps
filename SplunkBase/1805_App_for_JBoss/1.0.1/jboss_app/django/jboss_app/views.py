from django.contrib.auth.decorators import login_required
from splunkdj.decorators.render import render_to

@render_to('jboss_app:memstats.html')
@login_required
def home(request):
    return {
        "message": "Hello World from jboss_app!",
        "app_name": "jboss_app"
    }
