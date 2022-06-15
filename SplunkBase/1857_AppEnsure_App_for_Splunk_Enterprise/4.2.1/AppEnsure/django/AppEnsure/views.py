from django.contrib.auth.decorators import login_required
from splunkdj.decorators.render import render_to

@render_to('AppEnsure:home.html')
@login_required
def home(request):
    return {
        "message": "Hello World from AppEnsure!",
        "app_name": "AppEnsure"
    }
