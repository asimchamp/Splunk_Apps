from django.contrib.auth.decorators import login_required
from splunkdj.decorators.render import render_to

@render_to('ossim1:home.html')
@login_required
def home(request):
    return {
        "message": "Hello World from ossim1!",
        "app_name": "ossim1"
    }