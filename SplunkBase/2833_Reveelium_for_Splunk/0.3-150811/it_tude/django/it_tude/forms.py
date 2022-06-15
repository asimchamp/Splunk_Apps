from splunkdj.setup import forms


class CustomChoiceField(forms.ChoiceField):
    def validate(self, value):
        if self.required and not value:
            raise forms.ValidationError(self.error_messages['required'])


class SetupForm(forms.Form):
    user = forms.CharField(
        label="User:",
        endpoint="configs/conf-it_tude",
        entity="config",
        field="user",
        required=False,
    )
    password = forms.CharField(
        label="Password:",
        widget=forms.PasswordInput(attrs={'placeholder': 'Password'}),
        endpoint="configs/conf-it_tude",
        entity="config",
        field="password",
        required=False,
    )
    urlapi = forms.CharField(
        label="URL:",
        endpoint="configs/conf-it_tude",
        entity="config",
        field="urlapi",
        required=False,
    )

    def _validateCredentials(self, username, userpassword, urlapi):
        # validate credentias here. Return false if not valid
        return True

    def clean(self):
        cleaned_data = super(SetupForm, self).clean()

        user = cleaned_data.get('user')
        password = cleaned_data.get('password')
        urlapi = cleaned_data.get('urlapi')
        if (user != "" and password != "" and urlapi != ""):
            if(self._validateCredentials(user, password, urlapi) != True):
                msg = (u"Invalid credential")
                self._errors['user'] = self.error_class([msg])
                self._errors['password'] = self.error_class([msg])
                self._errors['urlapi'] = self.error_class([msg])
                raise forms.ValidationError("Invalid credential")

        return cleaned_data


class SourcetypesForm(forms.Form):
    st_list = forms.CharField(
        endpoint="configs/conf-it_tude",
        entity="config",
        field="sourcetypes_list",
    )

    def clean(self):
        cleaned_data = super(SourcetypesForm, self).clean()
        return cleaned_data


class LogsForm(forms.Form):
    index = CustomChoiceField(
        label="Index name (required)",
        endpoint="configs/conf-it_tude",
        entity="config",
        field="index",
        choices=[("", "")],
        required=False,
    )

    sourcetype_bind = forms.CharField(
        label="Sourcetype of BIND logs",
        endpoint="configs/conf-it_tude",
        entity="config",
        field="sourcetype_bind",
        required=False,
    )

    sourcetype_msdns = forms.CharField(
        label="Sourcetype of Microsoft DNS logs",
        endpoint="configs/conf-it_tude",
        entity="config",
        field="sourcetype_msdns",
        required=False,
    )

    custom_field_cim_compliant = forms.BooleanField(
        label="My sourcetype is already CIM-compliant",
        endpoint="configs/conf-it_tude",
        entity="config",
        field="cim_custom",
        required=False,
    )

    sourcetype_custom = forms.CharField(
        label="Sourcetype of custom logs",
        endpoint="configs/conf-it_tude",
        entity="config",
        field="sourcetype_custom",
        required=False,
    )

    custom_field_dnstype = forms.CharField(
        label="DNS Type field name",
        endpoint="configs/conf-it_tude",
        entity="config",
        field="dnstype_field_custom",
        required=False,
    )

    custom_field_fqdn = forms.CharField(
        label="FQDN field name",
        endpoint="configs/conf-it_tude",
        entity="config",
        field="fqdn_field_custom",
        required=False,
    )

    custom_field_srcip = forms.CharField(
        label="Source IP field name",
        endpoint="configs/conf-it_tude",
        entity="config",
        field="srcip_field_custom",
        required=False,
    )

    proxy_index = CustomChoiceField(
        label="Index name (required)",
        endpoint="configs/conf-it_tude",
        entity="config",
        field="proxy_index",
        choices=[("", "")],
        required=False,
    )

    sourcetype_proxy = forms.CharField(
        label="Sourcetype of logs",
        endpoint="configs/conf-it_tude",
        entity="config",
        field="sourcetype_proxy",
        required=False,
    )

    custom_proxy_cim_compliant = forms.ChoiceField(
        label="",
        choices=[("0", "My Proxy data is normalized to the Common Information Model."), ("1", "My Proxy data is normalized to the Extended Log File Format from w3c standard."), ("2","My Proxy data is custom.")],
        widget=forms.RadioSelect(attrs={'class': 'RadioSelect'}),
        endpoint="configs/conf-it_tude",
        entity="config",
        field="proxy_cim_custom",
        required=False,
        initial="2",
    )

    custom_field_proxy_c_ip = forms.CharField(
        label="IP field name",
        endpoint="configs/conf-it_tude",
        entity="config",
        field="proxy_c_ip_field_custom",
        required=False,
    )

    custom_field_proxy_cs_user = forms.CharField(
        label="User field name",
        endpoint="configs/conf-it_tude",
        entity="config",
        field="proxy_cs_user_field_custom",
        required=False,
    )

    custom_field_proxy_cs_uri = forms.CharField(
        label="URL field name",
        endpoint="configs/conf-it_tude",
        entity="config",
        field="proxy_cs_uri_field_custom",
        required=False,
    )

    custom_field_proxy_referer = forms.CharField(
        label="Referer field name",
        endpoint="configs/conf-it_tude",
        entity="config",
        field="proxy_referer_field_custom",
        required=False,
    )

    custom_field_proxy_user_agent = forms.CharField(
        label="User Agent field name",
        endpoint="configs/conf-it_tude",
        entity="config",
        field="proxy_user_agent_field_custom",
        required=False,
    )

    custom_field_proxy_cs_bytes = forms.CharField(
        label="Cs Bytes field name",
        endpoint="configs/conf-it_tude",
        entity="config",
        field="proxy_cs_bytes_field_custom",
        required=False,
    )

    custom_field_proxy_sc_status = forms.CharField(
        label="Status field name",
        endpoint="configs/conf-it_tude",
        entity="config",
        field="proxy_sc_status_field_custom",
        required=False,
    )

    custom_field_proxy_sc_bytes = forms.CharField(
        label="Sc Bytes field name",
        endpoint="configs/conf-it_tude",
        entity="config",
        field="proxy_sc_bytes_field_custom",
        required=False,
    )

    def clean(self):
        cleaned_data = super(LogsForm, self).clean()
        # DNS
        bind = cleaned_data.get('sourcetype_bind')
        msdns = cleaned_data.get('sourcetype_msdns')
        sourcetype_custom = cleaned_data.get('sourcetype_custom')
        custom_dnstype = cleaned_data.get('custom_field_dnstype')
        custom_field_fqdn = cleaned_data.get('custom_field_fqdn')
        custom_field_srcip = cleaned_data.get('custom_field_srcip')

        # validate form only when all four above fields are empty or all four are set
        set_fields = sum([1 if x else 0 for x in (sourcetype_custom, custom_dnstype, custom_field_fqdn, custom_field_srcip)])
        if set_fields != 0 and set_fields != 4:
            msg = (u"Using DNS custom log format requires entering all necessary information "
                   u"(a sourcetype and all field names).")
            self._errors['custom_field_srcip'] = self.error_class([msg])

        if not bind and not msdns and set_fields == 0:
            msg = u"At least one sourcetype must be specified."
            # self._errors['sourcetype_msdns'] = self.error_class([msg])
            # raise forms.ValidationError("At least one sourcetype must be specified.")

        # PROXY
        sourcetype_proxy = cleaned_data.get('sourcetype_proxy')
        proxy_c_ip = cleaned_data.get('custom_field_proxy_c_ip')
        proxy_cs_user = cleaned_data.get('custom_field_proxy_cs_user')
        proxy_cs_uri = cleaned_data.get('custom_field_proxy_cs_uri')
        proxy_referer = cleaned_data.get('custom_field_proxy_referer')
        proxy_user_agent = cleaned_data.get('custom_field_proxy_user_agent')
        proxy_cs_bytes = cleaned_data.get('custom_field_proxy_cs_bytes')
        proxy_sc_status = cleaned_data.get('custom_field_proxy_sc_status')
        proxy_sc_bytes = cleaned_data.get('custom_field_proxy_sc_bytes')

        # validate form only when all nine above fields are empty or all nine are set
        proxy_set_fields = sum([1 if x else 0 for x in (sourcetype_proxy, proxy_c_ip, proxy_cs_user, proxy_cs_uri, proxy_referer, proxy_user_agent, proxy_cs_bytes, proxy_sc_status, proxy_sc_bytes)])
        if proxy_set_fields != 0 and proxy_set_fields != 9:
            msg = (u"Using proxy custom log format requires entering all necessary information "
                   u"(a sourcetype and all field names).")
            self._errors['custom_field_proxy_sc_bytes'] = self.error_class([msg])

        return cleaned_data

