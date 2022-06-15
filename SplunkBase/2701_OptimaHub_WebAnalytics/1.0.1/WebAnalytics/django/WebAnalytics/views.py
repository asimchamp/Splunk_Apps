from django.contrib.auth.decorators import login_required
from splunkdj.decorators.render import render_to

@render_to('WebAnalytics:home.html')
@login_required
def home(request):
    return {
        "message": "Hello World from WebAnalytics!",
        "app_name": "WebAnalytics"
    }