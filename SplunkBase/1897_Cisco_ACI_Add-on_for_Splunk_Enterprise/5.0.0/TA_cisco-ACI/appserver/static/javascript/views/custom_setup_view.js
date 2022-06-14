"use strict";

define(
    ["backbone", "jquery", "splunkjs/splunk","splunkjs/mvc/utils","splunkjs/mvc"],
    function(Backbone, jquery, splunk_js_sdk, utils,mvc) {

        sdk = splunk_js_sdk;      
        let htmlActions = '<a class="add" title="Add" data-toggle="tooltip" style="color:#27C46B"><i class="material-icons">&#xE03B;</i></a>' + 
        '<a class="edit" title="Edit" data-toggle="tooltip" style="color:#FFC107"><i class="material-icons">&#xE254;</i></a>' +
        '<a class="delete" title="Delete" data-toggle="tooltip" style="color:#E34724"><i class="material-icons">&#xE872;</i></a>';
        var ENDPOINT_URL = "cisco_aci_server_setup_inputs/cisco_aci_data_inputs";
        var service = mvc.createService();
        service.get(ENDPOINT_URL, {}, function (err, response) {
            $("input[id^='/admin/cisco_aci_server_setup_inputs/cisco_aci_data_inputs/cisco_aci_inputs_json_id']").val(response.data["entry"][0]["content"]["cisco_aci_inputs_json"]);     
            if($("input[id^='/admin/cisco_aci_server_setup_inputs/cisco_aci_data_inputs/cisco_aci_inputs_json_id']").val()){
                $($(".tabs > li")[2]).removeClass("disabled_tab");
            }
        });
        
        let inputs ={
            _data: {},
            setData: function(text){
                _data = JSON.parse(text);
            },
            getData: function(){
                return _data;
            },
            get: function(stanza){
                return _data[stanza];
            },
    
            exist: function(stanza){
                return stanza in _data;
            },
        
            removeStanza: function(stanza){
                if(_data[stanza]['status'] !== 'added'){
                    _data[stanza]['status'] = 'removed';
                }
                else{
                    // Remove element as it is not present on back-end inputs.conf
                    delete _data[stanza];
                }
            },
        
            editStanza: function(oldStanza, inputStanza){
                if(_data[inputStanza['stanza']] !== 'added'){
                    inputStanza['status'] = 'edited';
                }
                if(oldStanza !== inputStanza['stanza']){
                    // Stanza changed, remove old stanza and add new one
                    if(_data[inputStanza['stanza']] !== 'old'){
                        inputStanza['status'] = 'added';
                    }
                    this.removeStanza(oldStanza);
                }
                _data[inputStanza['stanza']] = inputStanza;
            },
            
            addStanza: function(inputStanza){
                if(_data[inputStanza['stanza']] !== 'removed'){
                    inputStanza['status'] = 'added';
                }
                else{
                    inputStanza['status'] = 'edited';
                }
                _data[inputStanza['stanza']] = inputStanza;
            },
    
            resetStatuses: function(){
                for(let stanza in _data){
                    if(_data[stanza]['status'] === 'removed'){
                        delete _data[stanza]
                    }
                    else{
                        _data[stanza]['status'] = 'old';
                    }
                }
            }
        };  
        var ExampleView = Backbone.View.extend({
            // -----------------------------------------------------------------
            // Backbone Functions, These are specific to the Backbone library
            // -----------------------------------------------------------------

            host_input: null,
            host_error_widget: null,
            usernameInput: null,
            usernameInputErrorWidget: null,
            passwordInput: null,
            passwordInputErrorWidget: null, 
            remoteDomainInput: null,
            remoteDomainInputErrorWidget: null,
            certNameInput: null,
            certNameInputErrorWidget: null,
            certPrivateKeyInput: null,
            certPrivateKeyInputErrorWidget: null,  
            apicPort:null, 
            mso_hostInput:null,
            mso_hostInputErrorWidget:null,
            mso_portInput:null,
            mso_usernameInput:null,
            mso_usernameInputErrorWidget:null,
            mso_passwordInput:null,
            mso_passwordInputErrorWidget:null,
            msoremoteDomainInput:null,
            msoremoteDomainInputErrorWidget:null,
            selected_id: null,
            fetchSiteResponse: null,
 

            initialize: function initialize() {
                selected_id = "configure_apic_tab"
                Backbone.View.prototype.initialize.apply(this, arguments);
            },

            render: function() {
                this.el.innerHTML = this.get_template();
                return this;
            },

            events: {
                'click input[name="id_authentication"]': 'Authentication_APIC',
                'click input[name="id_authentication_mso"]': 'Authentication_MSO',
                "click a[class='edit']": 'clickEdit',
                "click a[class='add']": 'clickAdd',
                "click a[class='delete']":"actionDelete",
                "click .add-new" :"addEmptyRow",
                "click .save_button": "trigger_setup",
                "click .cancel_button": "redirect_to_splunk_setup_page",
                "click .tab-link": "tab_view",
                "click .accordion": "accordian_view",
                
                "click .fetch_sites_button": "fetch_sites",
                "click input[type=radio][name^='auth_type_']": "display_auth_type",
            },

            // -----------------------------------------------------------------
            // Custom Functions, These are unrelated to the Backbone functions
            // -----------------------------------------------------------------
            fetch_sites: function fetch_sites(){
                /*
                    This function will hit Splunk endpoint to get API data.
                    :param   : None
                    :return  :None

                */
                $("#sites_id").html("");
                $("#fetch_sites_error").html("");
                $("div[id^='error_message']").hide()
                $("div[id^='success_message']").hide()

                this.fetchHTMLElements();
                
                var is_error = this.validate_inputs(
                    host_input.val().trim(),
                    usernameInput.val().trim(),
                    passwordInput.val().trim(),
                    remoteDomainInput.val().trim(),
                    certNameInput.val().trim(),
                    certPrivateKeyInput.val().trim(),
                    mso_hostInput.val().trim(),
                    mso_usernameInput.val().trim(),
                    mso_passwordInput.val().trim(),
                    msoremoteDomainInput.val().trim(),
                    false,
                    true,
                );
            
                let ENDPOINT_URL = "/services/mso_fetch_sites";
                let fields = {};
                let service = mvc.createService();
                var self = this
            
                let auth_type_value = $("input[name='id_authentication_mso']:checked").val();
            
                if (!is_error){

                    this.disable_site_button()

                    let msoHostNameInput= (mso_hostInput.val().trim()).replace(/(^\/)/, '');
                    if (msoHostNameInput.startsWith("\/"))
                        msoHostNameInput= msoHostNameInput.replace(/(^\/)/, '');

                    fields["cisco_mso_port"] = mso_portInput.val().trim()
                    fields["cisco_mso_host"] = msoHostNameInput
                    fields["cisco_mso_username"] = mso_usernameInput.val().trim()
                    fields["cisco_mso_password"] = mso_passwordInput.val()
            
                    if (auth_type_value=="is_remote_user_authentication_id_mso"){
                        fields["cisco_mso_domain"] = msoremoteDomainInput.val().trim()
                    }
            
                    service.post(ENDPOINT_URL, fields, function (err, response) {
                        if (response != undefined && (response.data != null || response.data != undefined)) {
                            fetchSiteResponse = response.data["sites"];
                            self.addInput(fetchSiteResponse)
                        }
                        else{
                            let newdiv = document.createElement("div");
                            newdiv.setAttribute("class", "msowidgeterror");
                            newdiv.setAttribute("id", "fetch_sites_error");
                            let html_str = "<br>Error: " + err.data["error"].replace(/\|/g, "") + "<br>"
                            newdiv.innerHTML = html_str
                            $("#sites_id").html(newdiv);
                        }
                        self.enable_site_button()
                    });          
                }
            },

            addInput: function addInput(obj) {
                /*
                    This function will add html elements when user clicks Fetch Sites button.
                    :param obj: Response returned from splunk endpoint.
                    :return  :None

                */

                let newdiv = document.createElement("div");
                let html_str = ""
                $('head').append('<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/icon?family=Material+Icons" />');
    
                jQuery.each(obj, function (site, site_url) {
    
                    html_str += "<button type='button' class='accordion' id='" + site + "'><i class='material-icons'>&#xE313;</i>" + site + "   (" + site_url + ")</button>"
                    html_str += "<div class='panel' id='" + site + "_div_id' style='display:none;'>"
                    html_str += "<div id='id_modes_of_authentication_site'><label for='pass_auth' class='site_auth_radio'><input type='radio' id='" + site + "_pass_auth_id' name='auth_type_" + site + "' value='" + site + "' checked='true'>Password Based Authentication</label>"
                    html_str += "<label for='remote_auth' class='site_auth_radio'><input type='radio' id='" + site + "_remote_auth_id' name='auth_type_" + site + "' value='" + site + "'>Remote Based Authentication</label>"
                    html_str += "<label for='cert_auth' class='cert_auth_radio'><input type='radio' id='" + site + "_cert_auth_id' name='auth_type_" + site + "' value='" + site + "'>Certificate Based Authentication</label></div>"
                    html_str += "<div id='" + site + "_port_div_id'><label class='site_data_label'>APIC Port(Optional) </label><input type='text' name='port' id=" + site + "_port_id></div>"
                    html_str += "<div id='" + site + "_username_div_id'><label class='site_data_label'>Username </label><input type='text' name='username' id=" + site + "_username_id><div class='widgeterror'></div></div>"
                    html_str += "<div id='" + site + "_password_div_id'><label class='site_data_label'>Password </label><input type='password' name='password' id=" + site + "_password_id><div class='widgeterror'></div></div>"
                    html_str += "<div id='" + site + "_domain_div_id' style='display:none;'><label class='site_data_label'>Login Domain </label><input type='text' name='domain' id=" + site + "_domain_id><div class='widgeterror'></div></div>"
                    html_str += "<div id='" + site + "_cert_name_div_id' style='display:none;'><label class='site_data_label'>Certificate Name </label><input type='text' name='cert_name' id=" + site + "_cert_name_id><div class='widgeterror'></div></div>"
                    html_str += "<div id='" + site + "_cert_path_div_id' style='display:none;'><label class='site_data_label'>Path of Private Key </label><input type='text' name='cert_path' id=" + site + "_cert_path_id><div class='widgeterror'></div></div><br><br>"
                    html_str += "</div>"    
                });
    

                newdiv.innerHTML = html_str
                $("#sites_id").html(newdiv);
            },



            display_auth_type: function display_auth_type() {
                 /*
                    This function will display textboxes depending on type of authentication so user can configure sites associated with mso.
                    :param  :None
                    :return  :None

                */

                let id = $(event.target).attr("id")
                let val = $(event.target).attr("value")

                let apicUserNameInput= $('#' + val + '_username_div_id');
                $($(apicUserNameInput).children().filter("div.widgeterror")).hide()
                
                let apicPasswordInputInput= $('#' + val + '_password_div_id');
                $($(apicPasswordInputInput).children().filter("div.widgeterror")).hide();
                
                let apicDomainNameInput= $('#' + val + '_domain_div_id');
                $($(apicDomainNameInput).children().filter("div.widgeterror")).hide();
                
                let certNameInputInput= $('#' + val + '_cert_name_div_id');
                $($(certNameInputInput).children().filter("div.widgeterror")).hide();
                
                let certKeyPathInputInput= $('#' + val + '_cert_path_div_id');
                $($(certKeyPathInputInput).children().filter("div.widgeterror")).hide();


                if (id == (val + '_pass_auth_id')){

                    $(apicUserNameInput).show();
                    $(apicPasswordInputInput).show();
                    $(apicDomainNameInput).hide();
                    $(certNameInputInput).hide();
                    $(certKeyPathInputInput).hide();                    
                }
                else if (id == (val + '_remote_auth_id')){

                    $(apicUserNameInput).show();
                    $(apicPasswordInputInput).show();
                    $(apicDomainNameInput).show();
                    $(certNameInputInput).hide();
                    $(certKeyPathInputInput).hide();
                }
                else{

                    $(apicUserNameInput).show();
                    $(apicPasswordInputInput).hide();
                    $(apicDomainNameInput).hide();
                    $(certNameInputInput).show();
                    $(certKeyPathInputInput).show();
                }
            },


            validate_site_inputs: function validate_site_inputs(pwdBasedAuth, remoteBasedAuth, certBasedAuth, username, password, domainName, certName, certPath){
                /*
                    This function will validate inputs given by user to configure sites associated with MSO.

                    :param pwdBasedAuth : bool (The value to check whether password based authentication radio button is enabled).
                    :param remoteBasedAuth : bool (The value to check whether remote based authentication radio button is enabled).
                    :param certBasedAuth : bool (The value to check whether certificate based authentication radio button is enabled).
                    :param username : The element containing username entered by the user for configuring mso site.
                    :param password  : The element containing password entered by the user for configuring mso site.
                    :param domainName : The element containing remote domain name of uer entered by the user for configuring mso site.
                    :param certName : The element containing certificate name entered by the user for configuring mso site.
                    :param certPath : The element containing private path of key entered by the user for configuring mso site.
                    :return : int (Whether the inputs are validated or not)
                */

                let err_flag_apic =false

                let usernameErrorWidget= $(username).siblings('div')[0]
                let passwordErrorWidget= $(password).siblings('div')[0];
                let remoteDomainErrorWidget= $(domainName).siblings('div')[0];
                let certNameErrorWidget= $(certName).siblings('div')[0];
                let certPrivateKeyErrorWidget= $(certPath).siblings('div')[0];

                $(usernameErrorWidget).hide()
                $(passwordErrorWidget).hide()
                $(remoteDomainErrorWidget).hide()
                $(certNameErrorWidget).hide()
                $(certPrivateKeyErrorWidget).hide()


                if(!$(username).val() || $(username).val().trim() === ''){
                    $(usernameErrorWidget).text("Username must not be empty.")
                    $(usernameErrorWidget).show();
                    err_flag_apic = true;
                }
                if((pwdBasedAuth || remoteBasedAuth ) && (!$(password).val() || $(password).val() === '')){
                    $(passwordErrorWidget).text("Password must not be empty.")
                    $(passwordErrorWidget).show();
                    err_flag_apic = true;
                }
                
                if(remoteBasedAuth){
                    if(!$(domainName).val() || $(domainName).val() === ''){
                        $(remoteDomainErrorWidget).text("Login Domain of User must not be empty.")
                        $(remoteDomainErrorWidget).show();
                        err_flag_apic = true;
                    }
                } 
                
                if(certBasedAuth){
                    if(!$(certName).val() || $(certName).val() === ''){
                        $(certNameErrorWidget).text("Certificate Name must not be empty.")
                        $(certNameErrorWidget).show();
                        err_flag_apic = true;
                    }
                    if(!$(certPath).val() || $(certPath).val() === ''){
                        $(certPrivateKeyErrorWidget).text("Path of Private Key must not be empty.")
                        $(certPrivateKeyErrorWidget).show();
                        err_flag_apic = true;
                    }
                }
                
                return err_flag_apic
            },

            apic_inside_mso: function apic_inside_mso(){
                /*
                    This function will fetch the details provided by user to configure sites associated with mso.
                    :param  :None
                    :return  :None

                */

                let count = 0
                let err_flag = false
                let site_url_regex = /\(([^)]+)\)$/;
                var mso_sites_details = {}

                while($(".active_accordian")[count]){

                    let site_id= $($(".active_accordian")[count]).attr('id')

                    let pwdBasedAuth= $("#"+site_id +"_pass_auth_id").is(":checked")
                    let remoteBasedAuth= $("#"+site_id +"_remote_auth_id").is(":checked")
                    let certBasedAuth= $("#"+site_id +"_cert_auth_id").is(":checked")

                    let apicPortInput = "#"+site_id +"_port_id"
                    let userNameInputId= "#"+site_id +"_username_id"
                    let pwdInputInputId= "#"+site_id +"_password_id"
                    let domainNameInputId= "#"+site_id +"_domain_id"
                    let certNameInputId= "#"+site_id +"_cert_name_id"
                    let certKeyPathInputId= "#"+site_id +"_cert_path_id"

                    let site_error_status = this.validate_site_inputs(pwdBasedAuth, remoteBasedAuth, certBasedAuth, userNameInputId, pwdInputInputId, domainNameInputId, certNameInputId, certKeyPathInputId)
                    if (!site_error_status){
                        site_detail = {}

                        
                        site_detail["cisco_aci_host"] = fetchSiteResponse[site_id].split()
                        site_detail["cisco_aci_port"] = ($(apicPortInput).val().trim() || "None").split()

                        if (pwdBasedAuth){

                            site_detail['cisco_aci_username'] = $(userNameInputId).val().split()
                            site_detail['is_cert_authentication'] = "0".split()
                            site_detail['is_password_authentication'] = "1".split()
                            site_detail['is_remote_user_authentication'] = "0".split()
                            site_detail['password'] = $(pwdInputInputId).val().split()
                            site_detail['remote_user_domain_name'] = "None".split()
                            site_detail['remote_user_password'] = "None".split()
                            site_detail['cert_name'] = "None".split()
                            site_detail['cert_private_key_path'] = "None".split()
                        }
                        else if (remoteBasedAuth){
                            
                            site_detail['cisco_aci_username'] = $(userNameInputId).val().split()
                            site_detail['is_cert_authentication'] = "0".split()
                            site_detail['is_password_authentication'] = "0".split()
                            site_detail['is_remote_user_authentication'] = "1".split()
                            site_detail['password'] = "None".split()
                            site_detail['remote_user_domain_name'] = $(domainNameInputId).val().split()
                            site_detail['remote_user_password'] = $(pwdInputInputId).val().split()
                            site_detail['cert_name'] = "None".split()
                            site_detail['cert_private_key_path'] = "None".split()
                        }
                        else{

                            site_detail['cisco_aci_username'] = $(userNameInputId).val().split()
                            site_detail['is_cert_authentication'] = "1".split()
                            site_detail['is_password_authentication'] = "0".split()
                            site_detail['is_remote_user_authentication'] = "0".split()
                            site_detail['password'] = "None".split()
                            site_detail['remote_user_domain_name'] = "None".split()
                            site_detail['remote_user_password'] = "None".split()
                            site_detail['cert_name'] = $(certNameInputId).val().split()
                            site_detail['cert_private_key_path'] = $(certKeyPathInputId).val().split()
                        }
                    
                        mso_sites_details[site_id] = site_detail
                    }
                    err_flag = err_flag || site_error_status
                    count += 1
                }
                return [err_flag, mso_sites_details]
            },

            disable_site_button: function disable_site_button() {
                /*
                    This function will disable Fetch Sites button, so user cannot click it since
                    the backend code is running to fetch sites.
                    :param  :None
                    :return  :None

                */
                $('.fetch_sites_button').prop('disabled', true);
                $('.fetch_sites_button').html("Fetching...")
            },

            enable_site_button: function enable_site_button() {
                /*
                    This function will enable Fetch Sites button, so user can click and fetch sites associated.
                    :param  :None
                    :return  :None

                */

                $('.fetch_sites_button').prop('disabled', false);
                $('.fetch_sites_button').html("Fetch Sites")
            },
            
            tab_view: function tab_view(){
                 /*
                    This function is used to render tab view in setup page.
                    :param  :None
                    :return  :None

                */
               $("div[id^='error_message']").hide()
               $("div[id^='success_message']").hide()
               $("#fetch_sites_error").html("");

               if(!$(event.target).hasClass('disabled_tab'))
               {
                   let tab_id = $(event.target).data('tab')
                   selected_id = tab_id

                   $('.tab-link').removeClass('current');
                   $('.tab-content').removeClass('current');

                   $(event.target).addClass('current');
                   $("#"+tab_id).addClass('current');

                   if(selected_id == "configure_data_inputs_tab")
                       this.show_data_input()
               }
            },

            accordian_view: function accordian_view(){
                /*
                    This function is used to render accordian view, when sites are displayed.
                    :param  :None
                    :return  :None

                */
                let display = $(event.target).next()
                $(event.target).toggleClass("active_accordian")
        
                if ($(display).css('display') === "block")
                    $(display).css('display',"none");
                else
                    $(display).css('display', "block");
            },

            trigger_setup: function trigger_setup() {
                /*
                    This function is used for the setup of the add-on.
                    :param  :None
                    :return  :None

                */
                
                this.fetchHTMLElements()
                $('.save_button').prop('disabled', true);
                $('.save_button').html("Saving...")
                $("div[id^='error_message']").hide()
                $("div[id^='success_message']").hide()
                $("#fetch_sites_error").html("");

                if(selected_id == "configure_data_inputs_tab")
                {
                    
                    var ENDPOINT_URL = "cisco_aci_server_setup_inputs/cisco_aci_data_inputs";
                    //The post call for the edited data inputs in table.

                    let htmlInput = $("input[id$='/admin/cisco_aci_server_setup_inputs/cisco_aci_data_inputs/cisco_aci_inputs_json_id']");
                    htmlInput.val(JSON.stringify(inputs.getData()));
                    service.post(ENDPOINT_URL,{"cisco_aci_inputs_json": htmlInput.val(), "cisco_aci_show_inputs": "1"}, function (err, response) {
                        if(!err){
                            $("div[id^='error_message']").hide()
                            $("div[id^='success_message']").text("Successfully Updated TA_cisco-ACI.")
                            $("div[id^='success_message']").show()
                        }
                        else{
                            $("div[id^='success_message']").hide()
                            $("div[id^='error_message']").text(err.data["messages"][0]["text"]) 
                            $("div[id^='error_message']").show()
                        }
                        $('.save_button').prop('disabled', false);
                        $('.save_button').html("Save")
                    });
                    inputs.resetStatuses();
                }


                else{
                    var mso_sites_error = false
                    var mso_sites_details = {}

                    if (selected_id == "configure_mso_tab"){
                        config_mso = true
                        config_apic= false
                        if ($("#sites_id").has("div").length > 0 && $("#sites_id > div") && ! ($("#sites_id > div").attr('class') == 'msowidgeterror')){
                            mso_status = this.apic_inside_mso()
                            mso_sites_error = mso_status[0]
                            mso_sites_details = mso_status[1]
                        }
                    }
    
                    if (selected_id == "configure_apic_tab"){
                        config_mso = false
                        config_apic= true
                    }
    
                    var error_messages_displayed = this.validate_inputs(
                        host_input.val().trim(),
                        usernameInput.val().trim(),
                        passwordInput.val().trim(),
                        remoteDomainInput.val().trim(),
                        certNameInput.val().trim(),
                        certPrivateKeyInput.val().trim(),
                        mso_hostInput.val().trim(),
                        mso_usernameInput.val().trim(),
                        mso_passwordInput.val().trim(),
                        msoremoteDomainInput.val().trim(),
                        config_apic,
                        config_mso,
                    );
    
                    if (!(error_messages_displayed || mso_sites_error))
                    {
                        //Configure the data if any of the MSO or APIC is configured
                        if(config_apic ||config_mso)
                            this.ConfigureData(config_apic, config_mso, mso_sites_details)
                    }
                    else{
                        $('.save_button').prop('disabled', false);
                        $('.save_button').html("Save")
                    }
                }
               
            },
            validate_inputs: function validate_inputs(host_input_val,usernameInputValue,passwordInputValue,remoteDomainInputValue,certNameInputValue,certPrivateKeyInputValue,mso_host_val,mso_user_val,mso_pass_val,mso_domain_val,config_apic,config_mso) {
                /*
                    The function to validate the inputs taken from the user
                    :param host_input_val : The element containing host name entered by the user for configuring APIC
                    :param usernameInputValue : The element containing username entered by the user for configuring APIC
                    :param passwordInputValue  : The  element containing password entered by the user for configuring APIC
                    :param remoteDomainInputValue : The element containing remote domain name of uer entered by the user for configuring APIC
                    :param certNameInputValue : The element containing certificate name entered by the user for configuring APIC
                    :param certPrivateKeyInputValue : The element containing private path of key entered by the user for configuring APIC 
                    :param mso_host_val : The  element containing host name entered by the user for configuring MSO
                    :param mso_user_val : The element containing username entered by the user for configuring MSO
                    :param mso_pass_val : The element containing password entered by the user for configuring MSO
                    :param mso_domain_val : The element containing remote doamin name of user entered by the user for configuring MSO
                    :param config_apic : int(The value to check whether APIC is configured)
                    :param config_mso : int(The value to check whether MSO is configured)
                    :return : int (Whether the inputs are validated or not)
                */

                let htmlInput = $("input[id$='/admin/cisco_aci_server_setup_inputs/cisco_aci_data_inputs/cisco_aci_inputs_json_id']");
                let host_check_regex = /^(http[s]?)|[\\]+/;
                let err_flag_apic = false;
                let err_flag_mso=false;
                var value = $("input[name='id_authentication']:checked").val();
                var value_mso=$("input[name='id_authentication_mso']:checked").val();

                $(host_error_widget).hide()
                $(usernameInputErrorWidget).hide()
                $(passwordInputErrorWidget).hide()
                $(certNameInputErrorWidget).hide()
                $(certPrivateKeyInputErrorWidget).hide()
                $(remoteDomainInputErrorWidget).hide()

                $(mso_hostInputErrorWidget).hide()
                $(mso_usernameInputErrorWidget).hide()
                $(mso_passwordInputErrorWidget).hide()
                $(msoremoteDomainInputErrorWidget).hide()
                $(mso_portInputErrorWidget).hide()

                if(config_apic){
                    if (!host_input_val || host_input_val === '') {
                        $(host_error_widget).text("APIC Hostname or IP address must not be empty.")
                        $(host_error_widget).show()
                        err_flag_apic = true
                    }
                    if(!err_flag_apic){
                        let each_host= host_input_val.split(",")
                        $.each(each_host, function( index){
                            each_host[index] = each_host[index].trim()
                            if (host_check_regex.test(each_host[index])){
                                $(host_error_widget).text("APIC Hostname or IP address must not contain http/s or slash.")
                                $(host_error_widget).show()
                                err_flag_apic = true
                                return false;
                            }
                        });
                    }
                    if(!usernameInputValue || usernameInputValue.trim() === ''){
                        $(usernameInputErrorWidget).text("Username must not be empty.")
                        $(usernameInputErrorWidget).show();
                        err_flag_apic = true;
                    }
                    if((value=="is_password_based_authentication_id" || value=="is_remote_user_authentication_id") && (!passwordInputValue || passwordInputValue === '')){
                        $(passwordInputErrorWidget).text("Password must not be empty.")
                        $(passwordInputErrorWidget).show();
                        err_flag_apic = true;
                    }
                    if(value=="is_certificate_authentication_id"){
                        if(!certNameInputValue || certNameInputValue === ''){
                            $(certNameInputErrorWidget).text("Certificate Name must not be empty.")
                            $(certNameInputErrorWidget).show();
                            err_flag_apic = true;
                        }
                        if(!certPrivateKeyInputValue || certPrivateKeyInputValue === ''){
                            $(certPrivateKeyInputErrorWidget).text("Path of Private Key must not be empty.")
                            $(certPrivateKeyInputErrorWidget).show();
                            err_flag_apic = true;
                        }
                    } 
                    if(value=="is_remote_user_authentication_id"){
                        if(!remoteDomainInputValue || remoteDomainInputValue === ''){
                            $(remoteDomainInputErrorWidget).text("Login Domain of User must not be empty.")
                            $(remoteDomainInputErrorWidget).show();
                            err_flag_apic = true;
                        }
                    } 

                }

                if(config_mso){
                    if (! mso_host_val ||  mso_host_val === '') {
                        $(mso_hostInputErrorWidget).text("MSO Hostname or IP address must not be empty.")
                        $(mso_hostInputErrorWidget).show()
                        err_flag_mso = true
                    }
                    if(!err_flag_mso){
                        let each_host= mso_host_val.split(",")
                        $.each(each_host, function( index){
                            each_host[index] = each_host[index].trim()
                            if (host_check_regex.test(each_host[index])){
                                $(mso_hostInputErrorWidget).text("MSO Hostname or IP address must not contain http/s or slash.")
                                $(mso_hostInputErrorWidget).show()
                                err_flag_mso = true
                                return false;
                            }
                        });
                    }
                    if((value_mso=="is_password_based_authentication_id_mso"||value_mso=="is_remote_user_authentication_id_mso") && (!mso_user_val || mso_user_val.trim() === '')){

                        $(mso_usernameInputErrorWidget).text("Username must not be empty.")
                        $(mso_usernameInputErrorWidget).show();
                        err_flag_mso = true;
                    }
                    if((value_mso=="is_password_based_authentication_id_mso" || value_mso=="is_remote_user_authentication_id_mso") && (!mso_pass_val || mso_pass_val === '')){
                        $(mso_passwordInputErrorWidget).text("Password must not be empty.")
                        $(mso_passwordInputErrorWidget).show();
                        err_flag_mso = true;
                    }
                    if(value_mso=="is_remote_user_authentication_id_mso"){
                        if(!mso_domain_val || mso_domain_val === ''){
                            $(msoremoteDomainInputErrorWidget).text("Login Domain of User must not be empty.")
                            $(msoremoteDomainInputErrorWidget).show();
                            err_flag_mso = true;
                        }
                    } 
                }

                return err_flag_apic || err_flag_mso;
            },

            ConfigureData :function ConfigureData(config_apic, config_mso, mso_sites_details){
                 /*
                    This function is used for configuring the add-on.
                    :param config_apic : bool (The value to check whether APIC is configured)
                    :param config_mso : bool (The value to check whether MSO is configured)
                    :return  :None

                */

                var ENDPOINT_URL="cisco_aci_server_setup/cisco_aci_server_setup_settings"
                var setup_data={};       
                var value = $("input[name='id_authentication']:checked").val();
                var value_mso=$("input[name='id_authentication_mso']:checked").val();
                this.fetchHTMLElements()
                host=host_input.val()
                username=usernameInput.val()
                password=passwordInput.val()
                remoteDomain=remoteDomainInput.val()
                certName=certNameInput.val()
                PrivateKey=certPrivateKeyInput.val()
                Port=apicPort.val().trim() || "None"
                mso_host=mso_hostInput.val()
                mso_username=mso_usernameInput.val()
                mso_password=mso_passwordInput.val()
                mso_remoteDomain=msoremoteDomainInput.val()
                mso_port=mso_portInput.val().trim() || "None"
                var configured_host= []

                if(config_apic){
                    setup_data['configure_apic']="1".split()

                    host= host.split(",")
                    $.each(host, function( index ) {
                        host[index]= host[index].trim().replace(/(^\/)/, '');
                        host[index]= $.map(host[index].split("."), function(hostname ) {
                                    return hostname.trim()
                                }).join(".");
                        if (host[index].startsWith("\/"))
                            host[index]= host[index].replace(/(^\/)/, '');
                        });
                    host = host.join();
                    configured_host.push(host)

                    if(value=="is_password_based_authentication_id")
                    {
                       
                        setup_data['cisco_aci_host']=host.split()
                        setup_data['cisco_aci_port']=Port.split()
                        setup_data['cisco_aci_username']=username.split()
                        setup_data['is_cert_authentication']="0".split()
                        setup_data['is_password_authentication']="1".split()
                        setup_data['is_remote_user_authentication']="0".split()
                        setup_data['password']=password.split()
                        setup_data['remote_user_domain_name']="None".split()
                        setup_data['remote_user_password']="None".split()
                        setup_data['cert_name']="None".split()
                        setup_data['cert_private_key_path']="None".split()
                    }
                    else if(value=="is_remote_user_authentication_id")
                    {
                       
                        setup_data['cisco_aci_host']=host.split()
                        setup_data['cisco_aci_port']=Port.split()
                        setup_data['cisco_aci_username']=username.split()
                        setup_data['is_cert_authentication']="0".split()
                        setup_data['is_password_authentication']="0".split()
                        setup_data['is_remote_user_authentication']="1".split()
                        setup_data['password']="None".split()
                        setup_data['remote_user_domain_name']=remoteDomain.split()
                        setup_data['remote_user_password']=password.split()
                        setup_data['cert_name']="None".split()
                        setup_data['cert_private_key_path']="None".split()
                    }
                    else
                    {
                        setup_data['cert_name']=certName.split()
                        setup_data['cert_private_key_path']=PrivateKey.split()
                        setup_data['cisco_aci_host']=host.split()
                        setup_data['cisco_aci_port']=Port.split()
                        setup_data['cisco_aci_username']=username.split()
                        setup_data['is_cert_authentication']="1".split()
                        setup_data['is_password_authentication']="0".split()
                        setup_data['is_remote_user_authentication']="0".split()
                        setup_data['password']="None".split()
                        setup_data['remote_user_domain_name']="None".split()
                        setup_data['remote_user_password']="None".split()
                    } 
                }
                else{
                    setup_data['configure_apic']="0".split()
                    setup_data['cert_name']="None".split()
                    setup_data['cert_private_key_path']="None".split()
                    setup_data['cisco_aci_host']="None".split()
                    setup_data['cisco_aci_port']="None".split()
                    setup_data['cisco_aci_username']="None".split()
                    setup_data['is_cert_authentication']="None".split()
                    setup_data['is_password_authentication']="None".split()
                    setup_data['is_remote_user_authentication']="None".split()
                    setup_data['password']="None".split()
                    setup_data['remote_user_domain_name']="None".split()
                    setup_data['remote_user_password']="None".split()
                }
                if(config_mso){
                    setup_data['configure_mso']="1".split()
                    setup_data['site_details'] = JSON.stringify(mso_sites_details)
                    if(mso_sites_details){
                        $.each(mso_sites_details, function(index){
                            configured_host.push(mso_sites_details[index]["cisco_aci_host"][0])
                        });
                    }
                    mso_host= mso_host.split(",")

                    $.each(mso_host, function( index ) {
                        mso_host[index]= mso_host[index].trim().replace(/(^\/)/, '');
                        mso_host[index]= $.map(mso_host[index].split("."), function(hostname ) {
                            return hostname.trim()
                        }).join(".");
                        if (mso_host[index].startsWith("\/"))
                            mso_host[index]= mso_host[index].replace(/(^\/)/, '');
                        });

                    mso_host = mso_host.join();
                    configured_host.push(mso_host)

                    if(value_mso=="is_password_based_authentication_id_mso")
                    {
                        setup_data['cisco_mso_host']=mso_host.split()
                        setup_data['cisco_mso_port']=mso_port.split()
                        setup_data['cisco_mso_username']=mso_username.split()
                        setup_data['is_password_authentication_mso']="1".split()
                        setup_data['is_remote_user_authentication_mso']="0".split()
                        setup_data['password_mso']=mso_password.split()
                        setup_data['remote_user_domain_name_mso']="None".split()
                        setup_data['remote_user_password_mso']="None".split()
                    }
                    else
                    {
                        setup_data['cisco_mso_host']=mso_host.split()
                        setup_data['cisco_mso_port']=mso_port.split()
                        setup_data['cisco_mso_username']=mso_username.split()
                        setup_data['is_password_authentication_mso']="0".split()
                        setup_data['is_remote_user_authentication_mso']="1".split()
                        setup_data['password_mso']="None".split()
                        setup_data['remote_user_domain_name_mso']=mso_remoteDomain.split()
                        setup_data['remote_user_password_mso']=mso_password.split()
                      
                    }
                }
                else{
                    setup_data['configure_mso']="0".split()
                    setup_data['cisco_mso_host']="None".split()
                    setup_data['cisco_mso_port']="None".split()
                    setup_data['cisco_mso_username']="None".split()
                    setup_data['is_password_authentication_mso']="None".split()
                    setup_data['is_remote_user_authentication_mso']="None".split()
                    setup_data['password_mso']="None".split()
                    setup_data['remote_user_domain_name_mso']="None".split()
                    setup_data['remote_user_password_mso']="None".split()
                }
                // A post call is made for configuring the add-on.
                service.post(ENDPOINT_URL,setup_data, function (err, response) {

                    let success_message = ''
                    if(!err){
                        $.each(configured_host, function(index){
                            success_message += "Successfully Updated TA_cisco-ACI for host: "+ configured_host[index]+"<br/>"
                        });
                    }

                    else{
                        let error_messages_displayed= err.data["messages"][0]["text"].replace(/\n/g,"")
                        $("div[id^='error_message']").html(err.data["messages"][0]["text"].replace(/\n/g, "<br/>"))
                        $("div[id^='error_message']").show()

                        $.each(configured_host, function(index){
                            if (configured_host[index].search(",") < 0)
                            {
                                if(error_messages_displayed.search(configured_host[index]) < 0)
                                    success_message += "Successfully Updated TA_cisco-ACI for host: "+ configured_host[index]+"<br/>"
                            }

                            else{
                                let individual_host = configured_host[index].split(",")
                                let individual_host_in_error_message = false
                                $.each(individual_host, function(index){
                                    if(error_messages_displayed.search(individual_host[index]) >= 0 )
                                        individual_host_in_error_message = true
                                });
                                if(!individual_host_in_error_message)
                                    success_message += "Successfully Updated TA_cisco-ACI for host: "+ configured_host[index]+"<br/>"
                            }
                        });
                    }
                    if(success_message.length > 0){
                        $("div[id^='success_message']").html(success_message)
                        $("div[id^='success_message']").show()
                    }
                    $('.save_button').prop('disabled', false);
                    $('.save_button').html("Save")
                });
            },
                
            fetchHTMLElements: function fetchHTMLElements(){
                 /*
                    This function is used for setting the HTML elements so they can be further used.
                    :param  :None
                    :return  :None

                */

                let commonDivPath = '#\\/admin\\/cisco_aci_server_setup\\/cisco_aci_server_setup_settings\\/'
                host_input =  $(commonDivPath + "cisco_aci_host_id");
                host_error_widget = $(host_input).siblings('div')[0];
                apicPort= $(commonDivPath + "cisco_aci_port_id");
                usernameInput = $(commonDivPath+"cisco_aci_password_username_id");
                usernameInputErrorWidget = $(usernameInput).siblings().filter("div.widgeterror")[0];
                passwordInput = $(commonDivPath+"cisco_aci_password_id");
                passwordInputErrorWidget = $(passwordInput).siblings().filter("div.widgeterror")[0];
                remoteDomainInput = $(commonDivPath+"cisco_aci_remote_user_domain_name_id");
                remoteDomainInputErrorWidget = $(remoteDomainInput).siblings().filter("div.widgeterror")[0];
                certNameInput = $(commonDivPath+"cisco_aci_remote_certificate_name_id");
                certNameInputErrorWidget = $(certNameInput).siblings().filter("div.widgeterror")[0];
                certPrivateKeyInput = $(commonDivPath+"cisco_aci_certificate_path_private_key");
                certPrivateKeyInputErrorWidget = $(certPrivateKeyInput).siblings().filter("div.widgeterror")[0];
                mso_hostInput=$(commonDivPath+"cisco_mso_host_id");
                mso_hostInputErrorWidget=$(mso_hostInput).siblings('div')[0];
                mso_portInput=$(commonDivPath+"cisco_mso_port_id");
                mso_portInputErrorWidget=$(mso_portInput).siblings('div')[0];
                mso_usernameInput=$(commonDivPath+"cisco_mso_username");
                mso_usernameInputErrorWidget=$(mso_usernameInput).siblings('div')[0];
                mso_passwordInput=$(commonDivPath+"cisco_mso_confirm_password_id");
                mso_passwordInputErrorWidget=$(mso_passwordInput).siblings('div')[0];
                msoremoteDomainInput=$(commonDivPath+"cisco_mso_remote_user_domain_name_id");
                msoremoteDomainInputErrorWidget=$(msoremoteDomainInput).siblings('div')[0];
            },


            

            actionDelete :function actionDelete(){
                /*
                On click of delete button
                */
               let stanza = $(event.target).parents("tr").attr("data-id");

               if(inputs.exist(stanza)){
                   inputs.removeStanza(stanza);
               }
       
               let htmlInputs = $(event.target).parents("tr").find("td");
               this.Del(htmlInputs)
               $(".add-new").removeAttr("disabled");

            },
            Del:function Del(htmlInputs)
            {
                $(htmlInputs[0]).remove();
                $(htmlInputs[1]).remove();
                $(htmlInputs[2]).remove();
                $(htmlInputs[3]).remove();
                $(htmlInputs[4]).remove();

                // $(".delete").parents("tr").remove();
            },
            addNewRow:function addNewRow(row){
                /*
                Add row at the beginning of table
                */
                $("table > tbody").prepend(row);
            },
            addEmptyRow :function addEmptyRow(){
                /*
                Function add empty row with respective inputs to take input from user for adding new input
                */
                $(".add-new").attr("disabled", "disabled");
               
                let splunkVersion = $C.VERSION_LABEL;
                var row;
                if(splunkVersion.split(".")[0] == 7 && splunkVersion.split(".")[1] == 0){
                    row = '<tr data-action="add">' +
                    '<td><input type="text" class="form-control" style="width: 80%;" name="type" id="type"></td>' +
                    '<td><input type="text" class="form-control" style="width: 97%;" name="arguments" id="arguments"></td>' +
                    '<td><input type="text" class="form-control" style="width: 80%;" name="interval" id="interval"></td>' +
                    '<td><input type="checkbox" class="form-control" style="width: 100%;" name="disabled" id="disabled"></td>' +   // here
                    '<td>' + htmlActions + '</td>' +
                '</tr>';
                }
                else{
                row = '<tr data-action="add">' +
                    '<td><input type="text" class="form-control" style="width: 100%;" name="type" id="type"></td>' +
                    '<td><input type="text" class="form-control" style="width: 100%;" name="arguments" id="arguments"></td>' +
                    '<td><input type="text" class="form-control" style="width: 100%;" name="interval" id="interval"></td>' +
                    '<td><input type="checkbox" class="form-control" style="width: 100%;" name="disabled" id="disabled"></td>' +   // here
                    '<td>' + htmlActions + '</td>' +
                '</tr>';
                }
                this.addNewRow(row);
                $("table tbody tr").eq(0).find(".add, .edit").toggle();
            },
           
            clickEdit :function clickEdit(){
                 /*
                    Onclick of the edit button
                    :param  :None
                    :return  :None

                */
                let target=$(event.target);
                let htmlInputs = target.parents("tr").find("td");
                this.setInputValues(htmlInputs);
                $(".add-new").attr("disabled", "disabled");
                $("a[class='edit']").parents("tr").attr("data-action", "edit");
            },
            setInputValues : function setInputValues(htmlInputs){
                /*
                Function replace values inside row with respective inputs
                */
               let splunkVersion = $C.VERSION_LABEL;
               if(splunkVersion.split(".")[0] == 7 && splunkVersion.split(".")[1] == 0){
                    $(htmlInputs[0]).html('<input type="text" class="form-control" style="width: 80%;" value="' + $(htmlInputs[0]).text() + '">');
                    $(htmlInputs[1]).html('<input type="text" class="form-control" style="width: 97%;" value="' + $(htmlInputs[1]).text() + '">');
                    $(htmlInputs[2]).html('<input type="text" class="form-control" style="width: 80%;" value="' + $(htmlInputs[2]).text() + '">');
                    let disabled = $(htmlInputs[3]).text() == 'Disabled' ? '' : 'checked="true"';   // set checked if disabled is false (enabled)
                    $(htmlInputs[3]).html('<input type="checkbox" class="form-control" style="width: 100%;" ' + disabled + '">');
                    $(htmlInputs[4]).find(".add").show();
                    $(htmlInputs[4]).find(".edit").hide();
                }
        
                else{
                    $(htmlInputs[0]).html('<input type="text" class="form-control" style="width: 100%;" value="' + $(htmlInputs[0]).text() + '">');
                    $(htmlInputs[1]).html('<input type="text" class="form-control" style="width: 100%;" value="' + $(htmlInputs[1]).text() + '">');
                    $(htmlInputs[2]).html('<input type="text" class="form-control" style="width: 100%;" value="' + $(htmlInputs[2]).text() + '">');
                    let disabled = $(htmlInputs[3]).text() == 'Disabled' ? '' : 'checked="true"';   // set checked if disabled is false (enabled)
                    $(htmlInputs[3]).html('<input type="checkbox" class="form-control" style="width: 100%;" ' + disabled + '">');
                    $(htmlInputs[4]).find(".add").show();
                    $(htmlInputs[4]).find(".edit").hide();
                }
            },


            setTextValues:function setTextValues(htmlInputs,htmlInp){
                /*
                Function replaces inputs with respective values
                */
                $(htmlInputs[0]).parents("td").html($(htmlInputs[0]).val());
                $(htmlInputs[1]).parents("td").html($(htmlInputs[1]).val());
                $(htmlInputs[2]).parents("td").html($(htmlInputs[2]).val());
                let disabled = $(htmlInputs[3]).is(':checked') ? 'Enabled' : 'Disabled';
                $(htmlInputs[3]).parents("td").html(disabled);
                $(htmlInp[4]).find(".add").hide();
                $(htmlInp[4]).find(".edit").show();
            },
            clickAdd :function clickAdd(){
                /*
                    Onclick of the Add button
                    :param  :None
                    :return  :None

                */
                let error = false;
                let inputStanza = this.getInputStanza($(event.target));
                let oldStanza = $(event.target).parents("tr").attr('data-id');
                let action = $(event.target).parents("tr").attr('data-action');
                let $regexname = /^[\w\s-]+$/;
                let htmlInputs = $(event.target).parents("tr").find('input');

                $("#inputs_error_widget").text("");

                if(!inputStanza['type'] || inputStanza['type'].trim()==='' || ['authentication', 'classInfo', 'stats', 'health', 'microsegment', 'fex', 'cloud', 'mso'].indexOf(inputStanza['type']) < 0){
                    error = true;
                    $(htmlInputs[0]).addClass('error');
                    $("#inputs_error_widget").text('Script type must be from "authentication", "classInfo", "stats", "health", "microsegment", "fex" "cloud" or "mso".');
                }
                else if(!inputStanza['arguments'] || inputStanza['arguments'].trim()===''){
                    error = true;
                    $(htmlInputs[1]).addClass('error');
                }
                else if (!inputStanza['arguments'].match($regexname)){
                    error = true;
                    $(htmlInputs[1]).addClass('error');
                    $("#inputs_error_widget").text("Enter Valid Class names");
                }
                else if(!inputStanza['interval'] || !(/^\d+$/.test(inputStanza['interval'])) || parseInt(inputStanza['interval'], 10)<=0){
                    error = true;
                    $(htmlInputs[2]).addClass('error');
                    $("#inputs_error_widget").text("Input interval must be positive integer.");
                }
                else if(!inputStanza['disabled']){
                    error = true;
                    $(htmlInputs[3]).addClass('error');
                }
        
                else if(action === 'add' && inputs.exist(inputStanza['stanza']) && inputs.get(inputStanza['stanza']).status != 'removed'){
                    error = true;
                    $(htmlInputs[0]).addClass('error');
                    $(htmlInputs[1]).addClass('error');
                    $("#inputs_error_widget").text("Input stanza is already exist. Create another one or edit the existing one.");
                }
                
                else if(action === 'edit' && oldStanza != inputStanza['stanza'] && inputs.exist(inputStanza['stanza'])){
                    // If input stanza updated is already exist somewhere else
                    error = true;
                    $(htmlInputs[0]).addClass('error');
                    $(htmlInputs[1]).addClass('error');
                    $("#inputs_error_widget").text("Updated input stanza is already exist. Create another one or edit the existing one with different components.");
                }
        
                $(event.target).parents("tr").find(".error").first().focus();
                if(!error){
                    let htmlInp = $(event.target).parents("tr").find("td");
                    this.setTextValues(htmlInputs,htmlInp);
                    // $("a[class='add']").hide();
                    // $("a[class='edit']").show();
                    $(".add-new").removeAttr("disabled");        
                    if(action === 'add'){
                        inputs.addStanza(inputStanza);
                    }
                    else if(action === 'edit'){
                        inputs.editStanza(oldStanza, inputStanza);
                    }
                    $(event.target).parents("tr").attr("data-id", inputStanza['stanza']);
                    $(event.target).parents("tr").attr("data-action", "None");
                    
                }
            },
            show_data_input :function show_data_input(){
                /*
                    Onclick of the show inputs checkbox
                    :param  :None
                    :return  :None

                */
               if($("input[id^='/admin/cisco_aci_server_setup_inputs/cisco_aci_data_inputs/cisco_aci_inputs_json_id']").val()){
                    $('head').append('<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/icon?family=Material+Icons" />');
                    $('head').append('<link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" />');
                    $("div[id^='data_input']").show();
                    //condition to check if the table is already populated
                    if($("#DataTable tr").length<2){
                        this.fill_table();
                    }
                }

            },

            fill_table :function fill_table(){
                /*
                    Filling the data inputs table.
                    :param  :None
                    :return  :None

                */
                let htmlInput = $("input[id$='/admin/cisco_aci_server_setup_inputs/cisco_aci_data_inputs/cisco_aci_inputs_json_id']");
                inputs.setData(htmlInput.val());
                for(let stanza in inputs.getData()){ 
                    this.addRowWithData(stanza, inputs.get(stanza));
                }
            },
            addNewRow: function addNewRow(row){
                /*
                Add row at the beginning of table
                */
                $("table > tbody").prepend(row);
            },
            addRowWithData:function addRowWithData(key, value){
                /*
                Function add row in the table with data from key and value
                */
                let disabled = (value['disabled'] == '1' || (typeof(value['disabled']) === 'string' && value['disabled'].toLowerCase() === 'true')) ? 'Disabled' : 'Enabled';
                let row = '<tr data-id="' + key + '">' +
                    '<td>' + value['type'] + '</td>' +
                    '<td>' + value['arguments'] + '</td>' +
                    '<td>' + value['interval'] + '</td>' +
                    '<td>' + disabled + '</td>' +
                    '<td>' + htmlActions + '</td>' +
                '</tr>';
                this.addNewRow(row);
            },
        
        
            getInputStanza:function getInputStanza(currentRow){
                /*
                Function returns object having information about input of currentRow in table
                */
                let htmlInputs = currentRow.parents("tr").find('input');
                let disabled = $(htmlInputs[3]).is(':checked') ? '0' : '1';   // If is_checked then enabled so, disabled=0
                let inputStanza = {
                    'type': $(htmlInputs[0]).val().trim(),
                    'arguments': $(htmlInputs[1]).val().trim(),
                    'stanza': $(htmlInputs[0]).val().trim() + ' ' + $(htmlInputs[1]).val().trim(),
                    'interval': $(htmlInputs[2]).val().trim(),
                    'disabled': disabled
                };
                return inputStanza;
            },
            Authentication_APIC :function Authentication_APIC(){
                /*
                    To display appropriate inputs based on the authentication method of for APIC
                    :param  :None
                    :return  :None

                */

                var value = $("input[name='id_authentication']:checked").val();
                if(value=="is_password_based_authentication_id"){
                    $("div[id^='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_remote_user']").hide();
                    $("div[id^='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_certificate']").hide();       
                    $("div[id^='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_password']").show();
                }
                else if(value=="is_remote_user_authentication_id"){
                    $("div[id^='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_certificate']").hide();       
                    $("div[id^='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_password']").show();
                    $("div[id^='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_remote_user']").show();}
                else{
                    $("div[id^='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_password']").hide();
                    $("div[id^='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_remote_user']").hide();
                    $("div[id^='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_certificate']").show();
                    $("div[id^='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_password_username']").show()
                }
            },

            Authentication_MSO :function Authentication_MSO()
            {
                /*
                    To display appropriate inputs based on the authentication method of for MSO
                    :param  :None
                    :return  :None

                */
                var value = $("input[name='id_authentication_mso']:checked").val();

                if(value=="is_password_based_authentication_id_mso"){
                    $("div[id^='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_mso_remote_user']").hide();
                    $("div[id^='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_mso_password']").show();
                }
                else{
                    $("div[id^='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_mso_password']").show();
                    $("div[id^='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_mso_remote_user']").show();
                }
            },

            redirect_to_splunk_setup_page: function redirect_to_splunk_setup_page(){
                /*
                    Redirect to setup page of splunk
                    :param  :None
                    :return  :None

                */
                let redirect_url = "/manager/launcher/apps/local";
                window.location.href = redirect_url;
            },

            get_template: function get_template() {
                template_string =
                "<body>"+
                "<ul class='tabs'>"+
					  "<li class='tab-link current' data-tab='configure_apic_tab'>Configure APIC</li>"+
                      "<li class='tab-link' data-tab='configure_mso_tab'>Configure MSO</li>"+
                      "<li class='tab-link disabled_tab' data-tab='configure_data_inputs_tab'>Configure Data Inputs</li>"+
                "</ul>"+
                    
                "<form class='entityEditForm'>"+
                "<div class='formWrapper'>"+
                
                  "<div class='status_message'>"+ 
                     "<div id='success_message' class='display_prop'></div>"+
                     "<div id='error_message' class='display_prop'></div>"+
                   "</div>"+
                
                    "<div id='configure_apic_tab' class='tab-content current'>"+
                        "<div class='fieldsetWrapper' id='item-blockFieldset-0'>"+
                            "<fieldset>"+
                                "<legend>Cisco ACI for Splunk</legend>"+
                                "<p class='helpText'>Welcome to the Splunk for Cisco ACI Setup</p>"+
                            "</fieldset>"+                      
                       "</div>"+

                        "<div class='fieldsetWrapper' id='item-blockFieldset-1' style='border-color: #c3cbd4'>"+
                            "<fieldset>"+
                               "<legend>Add new Cisco APIC configuration</legend>"+                          
                               "<div id='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_configure_apic' class='widget'>"+
                                    "<div id='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_host' class='widget'>"+
                                        "<label for='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_host_id'>APIC Hostname or IP address</label>"+
                                        "<input type='text' id='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_host_id' autocomplete='off'>"+
                                        "<div class='widgeterror'></div>"+
                                    "</div>"+

                                   "<div id='item-textNode-1-1'>"+
                                        "<p class='helpText'>Note: To enable APIC Redundancy, add one or more APIC hosts separated by a comma (,). Ex. apic1,apic2,apic3</p>"+
                                   "</div>"+
                              
                                  "<div id='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_port' class='widget'>"+
                                      "<label for='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_port_id'>APIC Port (Optional)</label>"+
                                      "<input type='text' id='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_port_id' autocomplete='off'>"+
                                       "<div class='widgeterror'></div>"+
                                   "</div>"+

                                   "<div id='item-textNode-1-2'>"+
                                      "<p class='helpText'>Note: If APIC is hosted on a different port, please specify the port number. Ex. 8000 </p>"+
                                    "</div>"+

                                    "<div id='id_modes_of_authentication'>"+
                                        "<input type='radio' id='is_password_based_authentication_id' checked='true' name='id_authentication' value='is_password_based_authentication_id'>Password Based Authentication</br>"+
                                        "<input type='radio' id='is_remote_user_authentication_id' name='id_authentication' value='is_remote_user_authentication_id' name='id_authentication'>Remote User Based Authentication</br>"+
                                        "<input type='radio' id='is_certificate_authentication_id' name='id_authentication' value='is_certificate_authentication_id'>Certificate Based Authentication"+
                                    "</div>"+


                                    "<div id='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_password_username' class='widget'>"+
                                        "<label for='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_password_username_id'>Username</label>"+
                                        "<input type='text' id='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_password_username_id' autocomplete='off'>"+
                                        "<div class='widgeterror'></div>"+ 
                                    "</div>"+
                                            
                                    "<div id='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_password' class='widget'>"+
                                        "<label for='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_password_id'>Password</label>"
                                        +"<input type='password' id='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_password_id' autocomplete='off'>"+
                                        "<div class='widgeterror'></div>"+
                                    "</div>"+

                                   "<div id='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_remote_user_domain_name' class='display_prop widget'>"+
                                        "<label for='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_remote_user_domain_name'>Login Domain</label>"
                                        +"<input type='text' id='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_remote_user_domain_name_id' autocomplete='off'>"+
                                        "<div class='widgeterror'></div>"+
                                    "</div>"+

                                    "<div id='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_certificate_name' class='display_prop widget'>"+
                                        "<label for='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_certificate_name'>Certificate Name</label>"
                                        +"<input type='text' id='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_remote_certificate_name_id' autocomplete='off'>"+
                                        "<div class='widgeterror'></div>"+
                                    "</div>"+

                                    "<div id='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_certificate_path_private_key' class='display_prop widget'>"+
                                        "<label for='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_certificate_path_private_key'>Path of Private Key</label>"
                                        +"<input type='text' id='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_certificate_path_private_key' autocomplete='off'>"+
                                        "<div class='widgeterror'></div>"+
                                    "</div>"+

                               "</div>"+
                            "</fieldset>"+
                        "</div>"+
                            
                        "<div class='fieldsetWrapper' id='item-blockFieldset-2' style='border-color: #c3cbd4'>"+
                            "<fieldset>"+
                                "<legend>Note</legend>"+
                                "<div id='item-textNode-1-3'>"+
                                    "<p class='helpText'>To add another APIC Hostname or IP Address follow the same steps to input credentials and restart Splunk.</p>"+
                                    "<p class='helpText'>By default the SSL verification is enabled. Refer Configuration section of <a href='/app/cisco-app-ACI/setup_guide#config' target='_blank'> Setup Guide </a> or <a href='https://splunkbase.splunk.com/app/1897/#/details' target='_blank'> README.md </a> to Disable SSL verification.</p>"+
                                    "<p class='helpText'>To configure APIC using Certificate Based Authentication, Refer Configuration section of <a href='/app/cisco-app-ACI/setup_guide#config' target='_blank'> Setup Guide </a> or <a href='https://splunkbase.splunk.com/app/1897/#/details' target='_blank'> README.md </a></p>"+
                                "</div>"+
                            "</fieldset>"+
                        "</div>"+

                        "<div class='fieldsetWrapper' id='item-blockFieldset-3' style='border-color: #c3cbd4'>"+
                            "<fieldset>"+
                                "<legend>Warning</legend>"+
                                "<p class='helpText'>Submitting this form can take a long time. Please be patient and wait for it to complete before navigating away from this page.<br>"+
                                "Note: To change the Credentials later, first remove the entry from $SPLUNK_HOME/etc/apps/TA_cisco-ACI/local/passwords.conf or from $SPLUNK_HOME/etc/apps/TA_cisco-ACI/local/cisco_aci_server_setup.conf and restart Splunk.</p>"+
                            "</fieldset>"+
                        "</div>"+
                        
                    "</div> <!--end of configure_apic_tab div-->"+

                    "<div id='configure_mso_tab' class='tab-content'>"+
                        "<div class='fieldsetWrapper' id='item-blockFieldset-0'>"+
                            "<fieldset>"+
                              "<legend>Cisco ACI for Splunk</legend>"+
                              "<p class='helpText'>Welcome to the Splunk for Cisco ACI Setup</p>"+
                            "</fieldset>"+
                        "</div>"+

                        "<div class='fieldsetWrapper' id='item-blockFieldset-1' style='border-color: #c3cbd4'>"+
                           "<fieldset>"+
                               "<legend>Add new Cisco MSO configuration</legend>"+                          
                               "<div id='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_aci_configure_mso' class='widget'>"+                           
                                    "<div id='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_mso_host' class='widget'>"+
                                        "<label for='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_mso_host_id'>MSO Hostname or IP address</label>"+
                                        "<input type='text' id='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_mso_host_id' autocomplete='off'>"+
                                        "<div class='widgeterror'></div>"+
                                   "</div>"+

                                   "<div id='item-textNode-1-1'>"+
                                        "<p class='helpText'>Note: To enable MSO Redundancy, add one or more MSO hosts separated by a comma (,). Ex. mso1,mso2,mso3</p>"+
                                   "</div>"+                                   

                                    "<div id='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_mso_port' class='widget'>"+
                                        "<label for='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_mso_port_id'>MSO Port (Optional)</label>"+
                                        "<input type='text' id='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_mso_port_id' autocomplete='off'>"+
                                        "<div class='widgeterror'></div>"+
                                    "</div>"+

                                    "<div id='item-textNode-1-2'>"+
                                      "<p class='helpText'>Note: If MSO is hosted on a different port, please specify the port number. Ex. 8000 </p>"+
                                    "</div>"+

                                    "<div id='id_modes_of_authentication_mso'>"+
                                        "<input type='radio' id='is_password_based_authentication_id_mso' checked='true' name='id_authentication_mso' value='is_password_based_authentication_id_mso'>Password Based Authentication</br>"+
                                        "<input type='radio' id='is_remote_user_authentication_id_mso' name='id_authentication_mso' value='is_remote_user_authentication_id_mso' name='id_authentication'>Remote User Based Authentication"+
                                    "</div>"+

                                    "<div id='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_mso_password_username' class='widget'>"+
                                        "<label for='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_mso_username'>Username</label>"+
                                        "<input type='text' id='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_mso_username' autocomplete='off'>"+
                                        "<div class='widgeterror'></div>"+ 
                                    "</div>"+
                                            
                                    "<div id='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_mso_password' class='widget'>"+
                                        "<label for='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_mso_confirm_password_id'>Password</label>"
                                        +"<input type='password' id='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_mso_confirm_password_id' autocomplete='off'>"+
                                        "<div class='widgeterror'></div>"+
                                    "</div>"+

                                    "<div id='item-/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_mso_remote_user_domain_name' class='display_prop widget'>"+
                                        "<label for='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_mso_remote_user_domain_name_id'>Login Domain</label>"
                                        +"<input type='text' id='/admin/cisco_aci_server_setup/cisco_aci_server_setup_settings/cisco_mso_remote_user_domain_name_id' autocomplete='off'>"+
                                        "<div class='widgeterror'></div>"+
                                    "</div>"+
                                "</div>"+

                                "<div class='fetch_sites'>" +
                                    "<button type='button' class='fetch_sites_button' id='id_fetch_sites_button'>Fetch Sites</button>" +
                                "</div>" +
                                "<div id='sites_id'> </div>" +                                    
                           "</fieldset>"+
                        "</div>"+

                        "<div class='fieldsetWrapper' id='item-blockFieldset-2' style='border-color: #c3cbd4'>"+
                            "<fieldset>"+
                                "<legend>Note</legend>"+
                                "<div id='item-textNode-1-3'>"+
                                    "<p class='helpText'>To add another MSO Hostname or IP Address follow the same steps to input credentials and restart Splunk.</p>"+
                                    "<p class='helpText'>By default the SSL verification is enabled. Refer Configuration section of <a href='/app/cisco-app-ACI/setup_guide#config' target='_blank'> Setup Guide </a> or <a href='https://splunkbase.splunk.com/app/1897/#/details' target='_blank'> README.md </a> to Disable SSL verification.</p>"+
                                    "<p class='helpText'>To configure APIC using Certificate Based Authentication, Refer Configuration section of <a href='/app/cisco-app-ACI/setup_guide#config' target='_blank'> Setup Guide </a> or <a href='https://splunkbase.splunk.com/app/1897/#/details' target='_blank'> README.md </a></p>"+
                                "</div>"+
                            "</fieldset>"+
                        "</div>"+

                        "<div class='fieldsetWrapper' id='item-blockFieldset-3' style='border-color: #c3cbd4'>"+
                            "<fieldset>"+
                                "<legend>Warning</legend>"+
                                "<p class='helpText'>Submitting this form can take a long time. Please be patient and wait for it to complete before navigating away from this page.<br>"+
                                "Note: To change the Credentials later, first remove the entry from $SPLUNK_HOME/etc/apps/TA_cisco-ACI/local/passwords.conf or from $SPLUNK_HOME/etc/apps/TA_cisco-ACI/local/cisco_aci_server_setup.conf and restart Splunk.</p>"+
                            "</fieldset>"+
                        "</div>"+

                    "</div> <!--end of configure_mso_tab div-->"+

                    "<div id='configure_data_inputs_tab' class='tab-content'>"+
                        "<div class='fieldsetWrapper' id='item-blockFieldset-2' style='border-color: #c3cbd4'>"+
                            "<fieldset>"+
                                "<legend>Inputs</legend>"+
                                "<div id='item-/admin/cisco_aci_server_setup_inputs/cisco_aci_data_inputs/cisco_aci_show_inputs' class='widget'>"+
                                    
                                    "<div class='widgeterror'></div>"+
                                "</div>"+

                                "<div id='item-/admin/cisco_aci_server_setup_inputs/cisco_aci_data_inputs/cisco_aci_inputs_json' class='widget display_prop'>"+
                                    "<label for='/admin/cisco_aci_server_setup_inputs/cisco_aci_data_inputs/cisco_aci_inputs_json_id'>$SPLUNK_HOME/etc/apps/TA_cisco-ACI/bin/collect.py></label>"+
                                    "<div>"+
                                        "<input type='text' name='/admin/cisco_aci_server_setup_inputs/cisco_aci_data_inputs/cisco_aci_inputs_json' id='/admin/cisco_aci_server_setup_inputs/cisco_aci_data_inputs/cisco_aci_inputs_json_id' value='' >"+
                                        "<div class='widgeterror' ></div>"+
                                    "</div>"+
                                "</div>"+

                                "<div id='data_input' class='display_prop'>"+
                                    "<div class='table_wrapper'>"+
                                        "<div id='inputs_error_widget'></div>"+ 
                                            "<div class='add_new_button'>"+
                                                "<button type='button' style='float: right; margin-bottom: 10px;' class='btn btn-info add-new'>"+
                                                "<i class='fa fa-plus' style='font-size:12px;color:white'></i> Add New</button>"+
                                            "</div>"+

                                            "<div class='edit_table' >"+
                                                "<table class='table' id='DataTable'>"+
                                                    "<thead>"+
                                                        "<tr>"+
                                                            "<th>Type</th>"+
                                                            "<th>Arguments</th>"+
                                                            "<th>Interval</th>"+
                                                            "<th>Enable/Disable</th>"+
                                                            "<th>Actions</th>"+
                                                        "</tr>"+
                                                    "</thead>"+
                                                    "<tbody>"+            
                                                    "</tbody>"+
                                                "</table>"+
                                            "</div>"+

                                        "</div>"+
                                    "</div>"+
                                "</div>"+
                            "</fieldset>"+
                        "</div>"+
                    "</div> <!--end of configure_data_inputs_tab div-->"+

                "</form>"+  
                
                "<div class='submit_cancel_buttons'>" +
                    "<button type='submit' class='save_button' id='id_submit_cancel_buttons'>Save</button>" +
                    "<button type='reset' class='cancel_button' id='id_submit_cancel_buttons'>Cancel</button>" +
                "</div>" +
                
                "<br/>" +
                "</body>"
                return template_string;
            },

        }); // End of ExampleView class declaration

        return ExampleView;
    }, // End of require asynchronous module definition function
); // End of require statement
