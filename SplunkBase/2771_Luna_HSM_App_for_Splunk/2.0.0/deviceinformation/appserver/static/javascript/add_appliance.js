require([
    'jquery',
    'splunkjs/mvc/simplexml/ready!'
], function ($) {
    funcCheckConfigNames = function (configNames) {
        $.ajax({
            type: "GET",
            url: "../../../../en-US/splunkd/__raw/services/deviceinformationapp/lunahsmappliancesetup/checkconfignames?output_mode=json",
            data: "config_names=" + configNames,
            success: function (text) { // check returned data
                var existing_config_names = text['entry'][0]['content'];
                // TODO: show error in UI for existing config names
            },
            error: function () { // something failed
                // TODO: Show general error message in UI
            },
        });
    }

    var submit_button = $("#lunaapp_submit_button");
    var cancel_button = $("#lunaapp_cancel_button");

    $(submit_button).click(function (e) {
        e.preventDefault();
        $(".luna-message").remove();

        var data = new Object();
        var appliances_to_add = {};
        var config_name = $('input[name="configName"]').val() || "";
        data.activation_key = $('input[name="activation_key"]').val() || "";
        data.destination = $('input[name="destination"]').val() || "";
        if ($('input[name="ipv6"]').prop('checked')) {
            data.ipv6 = "1";
        } else {
            data.ipv6 = "0";
        }
        data.v3_securityName = $('input[name="v3_securityName"]').val() || "";
        data.v3_authKey = $('input[name="v3_authKey"]').val() || "";
        data.v3_authProtocol = $('#v3_authProtocol option:selected').val();
        data.v3_privKey = $('input[name="v3_privKey"]').val() || "";
        data.v3_privProtocol = $('#v3_privProtocol option:selected').val();
        data.port = $('input[name="port"]').val() || "";
        data.system_python_path = $('input[name="system_python_path"]').val() || "";
        data.snmpinterval = $('input[name="snmpinterval"]').val() || "";
        data.timeout = $('input[name="timeout"]').val() || "";

        config_name = $.trim(config_name)
        if (config_name == '') {
            // TODO: Handle empty config name
        //     $(".luna-form-group-top-div").prepend('<h2 class="luna-message luna-progress">Please first select at least one appliance to process for removal.</h2>')
        //     $(".luna-message").fadeOut(2000);
        //     return;
        }
        for (let [key, value] of Object.entries(data)) {
            data[key] = $.trim(value)
        }
        $(".luna-form-group-form-element").prepend('<h2 class="luna-message luna-progress">Processing request. Please wait....</h2>');
        appliances_to_add[config_name] = JSON.stringify(data);
        $.ajax({
            type: "POST",
            url: "../../../../en-US/splunkd/__raw/services/deviceinformationapp/lunahsmappliancesetup/addappliances",
            data: "appliances_to_add=" + JSON.stringify(appliances_to_add),
            success: function (text) {
                $(".luna-message").remove();
                $(".luna-form-group-form-element").prepend('<h2 class="luna-message luna-success">Appliance <span style="font-weight:bold;">' + data.destination + '</span> with configuration name <span style="font-weight:bold;">' + config_name + '</span> successfully configured.</h2>');
                $(".luna-message").fadeOut(3000);
                setTimeout(function () {
                    window.location.href = "../deviceinformation/hsm_home";
                }, 3000);
            },
            error: function () {
                $(".luna-message").remove();
                $(".luna-form-group-form-element").prepend('<h2 class="luna-message luna-error">Error: Unable to process "add appliance" request.</h2>');
            }
        });
    });

    $(cancel_button).click(function (e) {
        e.preventDefault();
        window.location.href = '../deviceinformation/hsm_home';
    });
});
