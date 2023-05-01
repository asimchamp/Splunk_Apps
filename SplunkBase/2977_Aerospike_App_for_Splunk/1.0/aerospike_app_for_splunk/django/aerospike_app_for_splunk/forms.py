from splunkdj.setup import forms


class SetupForm(forms.Form):
    seed_node = forms.CharField(
        label="Seed Node",
        endpoint='configs/conf-myconf', entity='nodeinfo', field='seed_node',
        max_length=100)
    

