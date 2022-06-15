from django.contrib.auth.decorators import login_required
from splunkdj.decorators.render import render_to

@render_to('sentry_ta_exampleApp:home.html')
@login_required
def home(request):
    return {
        "message": "Hello World from sentry_ta_exampleApp!",
        "app_name": "sentry_ta_exampleApp"
    }


@render_to('sentry_ta_exampleApp:examplePage.html')
@login_required
def examplePage(request):
    return {
	"message": "Hello World from sentry_ta_exampleApp - example page!",
        "app_name": "sentry_ta_exampleApp"
    }

