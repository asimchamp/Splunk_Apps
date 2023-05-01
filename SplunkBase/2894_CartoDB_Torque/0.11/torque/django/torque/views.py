from django.contrib.auth.decorators import login_required
from splunkdj.decorators.render import render_to

@render_to('torque:home.html')
@login_required
def home(request):
    return {
        "message": "Hello World from torque!",
        "app_name": "torque"
    }

# @render_to('torque:torque.html')
# @login_required
# def torque(request):
#     return {
#         "message": "Hello World from torque!",
#         "app_name": "torque"
#     }