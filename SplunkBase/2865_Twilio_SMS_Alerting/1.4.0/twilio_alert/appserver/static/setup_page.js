require([
    'jquery',
    'splunkjs/mvc/simplexml/ready!'
], function($) {


    $.ajax({
        type: "GET",
        url: "../../../../en-US/splunkd/__raw/services/twilioalert/twilioalertsetup/twilioalert?output_mode=json",
        success: function(text) {


            var credentials_json = text;

            var log_level = credentials_json['entry'][0]['content']['param.log_level']
            var authtoken = credentials_json['entry'][0]['content']['param.authtoken']
            var accountsid = credentials_json['entry'][0]['content']['param.accountsid']

            $('select[name=param_log_level]').val(log_level) 

            $('input[name=param_authtoken]').val(authtoken)
            $('input[name=param_accountsid]').val(accountsid)

            

        },
        error: function() {


        }
    });

    var submit_button = $("#ck_submit_button");
    var cancel_button = $("#ck_cancel_button");


    $(submit_button).click(function(e) {
        e.preventDefault();

        var log_level = $("select[name=param_log_level]").val();
        var authtoken = $('input[name=param_authtoken]').val();
        var accountsid = $('input[name=param_accountsid]').val();


        $.ajax({
            type: "POST",
            url: "../../../../en-US/splunkd/__raw/services/twilioalert/twilioalertsetup/twilioalert",
            data: "param.log_level=" + log_level + "&param.authtoken=" + authtoken + "&param.accountsid=" + accountsid,
            success: function(text) {

                window.location.href = '../twilio_alert/landing';

            },
            error: function() {

            }
        });


        $(".ck_div_input_fields").append('<div name="saving_creds_msg" style="text-align: center;"><p class="helpText"><h3>Saving Your Settings...</h3></p></div>');

    });

    $(cancel_button).click(function(e) {
        e.preventDefault();
        window.location.href = '../twilio_alert/landing';

    });

});