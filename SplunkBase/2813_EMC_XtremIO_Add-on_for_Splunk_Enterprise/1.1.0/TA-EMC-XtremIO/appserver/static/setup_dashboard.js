require.config({
    paths: {
        jquery_dx: '../app/TA-EMC-XtremIO/lib/jquery_dx'
    }
});
require([
    "jquery_dx",
    "splunkjs/mvc",
    "splunkjs/mvc/simplexml/ready!"
], function($, mvc) {

    var show_error = function show_error(msg) {
        var error_output_element = $("#error_output");

        var new_error_output_string = "";
        new_error_output_string += "<ul><li><b>";
        new_error_output_string += msg

        new_error_output_string += "</b></li></ul>";

        error_output_element.html(new_error_output_string);
        error_output_element.show();

    };

    var service = mvc.createService();

    var post_data = function(data) {

        $("#loading").text("Saving...");
        $("#whitescreen").show();

        var ENDPOINT_URL = "xtremiocustom/xtremioendpoint/setupentity";
        service.request(
            ENDPOINT_URL,
            "POST",
            null,
            data,
            null,
            null,
            function(err, response) {
                if (err) {
                    $("#whitescreen").hide();
                    show_error("Please verify that Host, Username and Password are correct.");
                } else if (response.status === 200) {
                    $("#loading").text("Saved Successfully. Redirecting to search.");
                    window.location.href = "/app/search";
                }
                else {
                    $("#whitescreen").hide();
                    show_error("Something went wrong");
                }
            });
    };

    $(document.body).on('click', '#submit_button', function(e) {

        $("#error_output").hide();

        var host = $("#host").val();
        var username = $("#username").val();
        var password = $("#pswd").val();
        var confirm_password = $("#cpswd").val();

        var data = {
            'username':username,
            'host':host,
            'password':password
        };

        if (!$("#host").val()){
            show_error("Field Host is required");
            $("#host").focus();
        }
        else if(!$("#username").val()){
            show_error("Field Username is required");
            $("#username").focus();
        }
        else if(!$("#pswd").val()){
            show_error("Field Password is required");
            $("#pswd").focus();
        }
        else if(!$("#cpswd").val()){
            show_error("Field Confirm password is required");
            $("#cpswd").focus();
        }
        else{
            if (password != confirm_password)
            {
                show_error("Password and Confirm password do not match");
                $("#pswd").focus();
            }
            else {
                post_data(data);
            }
        }
    });
});