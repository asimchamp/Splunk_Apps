require([
    'jquery',
    'splunkjs/mvc/simplexml/ready!'
], function($) {

    var ck_div = $(".ck_div_input_fields");

    var add_credential_keys = $(".add_credential_keys");

    $(add_credential_keys).click(function(e) {
        e.preventDefault();

        $(ck_div).append('<div name="ck_input"><p class="helpText"><br>Credential Key<br><input autocomplete="off"  type="text" size="20" name="mycredkey[]"/><a href="#" class="remove_field">  Remove</a><br><br>Credential<br><input autocomplete="off"  type="password" size="20" name="mycred[]"/></p></div>');

    });

    $(ck_div).on("click", ".remove_field", function(e) {
        e.preventDefault();
        $(this).parent('p').parent('div').remove();
    });

    $.ajax({
        type: "GET",
        url: "../../../../en-US/splunkd/__raw/services/sendfilealert/sendfilealertsetup/sendfilealert?output_mode=json",
        success: function(text) {


            var credentials_json = text;


            var activation_key = credentials_json['entry'][0]['content']['param.activationkey']
            var log_level = credentials_json['entry'][0]['content']['param.log_level']

            $('select[name=param_log_level]').val(log_level) 
            $('input[name=param_activationkey]').val(activation_key)
            
            var credentialKeyCommaString = credentials_json['entry'][0]['content']['credential_key']
            var credentialCommaString = credentials_json['entry'][0]['content']['credential']

            var credentialKeyItems = credentialKeyCommaString.split('::');
            var credentialItems = credentialCommaString.split('::');

            var ck_div = $(".ck_div_input_fields");

            for (var i = 0; i < credentialKeyItems.length; i++) {

                $(ck_div).append('<div name="ck_input"><p class="helpText"><br>Credential Key<br><input autocomplete="off"  type="text" size="20" name="mycredkey[]" value="' + credentialKeyItems[i] + '"/><a href="#" class="remove_field">  Remove</a><br><br>Credential<br><input autocomplete="off"  type="password" size="20" name="mycred[]" value="' + credentialItems[i] + '"/></p></div>');

            }

        },
        error: function() {


        }
    });

    var submit_button = $("#ck_submit_button");
    var cancel_button = $("#ck_cancel_button");


    $(submit_button).click(function(e) {
        e.preventDefault();

        var credential_key_string = ""
        var credential_string = ""
        var activation_key = $("input[name=param_activationkey]").val();
        var log_level = $("select[name=param_log_level]").val();

        $('input[name^="mycredkey"]').each(function() {
            credential_key_string += $(this).val() + "::"
            credential_string += $(this).siblings('input').val() + "::"
        });

        $.ajax({
            type: "POST",
            url: "../../../../en-US/splunkd/__raw/services/sendfilealert/sendfilealertsetup/sendfilealert",
            data: "credential=" + credential_string.substring(0, credential_string.length - 2) + "&credential_key=" + credential_key_string.substring(0, credential_key_string.length - 2)+ "&param.log_level=" + log_level+ "&param.activationkey=" + activation_key,
            success: function(text) {

                window.location.href = '../send_file/landing';

            },
            error: function() {

            }
        });


        $('div[name^="ck_input"]').remove();
        $(".ck_div_input_fields").append('<div name="saving_creds_msg" style="text-align: center;"><p class="helpText"><h3>Saving Your Settings...</h3></p></div>');




    });

    $(cancel_button).click(function(e) {
        e.preventDefault();
        $('div[name^="ck_input"]').remove();
        window.location.href = '../send_file/landing';

    });




});