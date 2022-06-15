require(['jquery',
		'splunkjs/mvc'],
	function ($, mvc) {
        $(document).ready(function () {
            $(".setup_button").click(function () {
                var ip_address = $("input[name=ip_address]").val().trim();
                var username = $("input[name=username]").val().trim();
                var password = $("input[name=password]").val().trim();
                var confirm_password = $("input[name=confirm_password]").val().trim();
                var index = $("input[name=index]").val().trim();

                // Input Validation
                if (ip_address == "" || username == "" || password == "" || confirm_password == "") {
                    $('.isilon_error_msg').html("<font class=\"fail\">Please fill out required fields.</font>");
                    return;
                }
                if (password != confirm_password) {
                    $('.isilon_error_msg').html("<font class=\"fail\">Passwords do not match.</font>");
                    return;
                }
                if (ip_address.startsWith("http://") || ip_address.startsWith("https://")) {
                    $('.isilon_error_msg').html("<font class=\"fail\">IP Address must not contain protocol. Please remove the http(s) scheme from IP Address.</font>");
                    return;
                }

                // Call to Handler
                var service = mvc.createService();
                service.post('/services/isilonsetupendpoint', 
                    {
                        "ip_address": ip_address, 
                        "username": username,
                        "password": password,
                        "index": index
                    }, 
                    function(err, response) {
                        if (err != null && err != "") {
                            if (err.data != null && err.data != "") {
                                $('.isilon_error_msg').html("<font class=\"fail\">" + err.data + "</font>");
                            }
                            else {
                                $('.isilon_error_msg').html("<font class=\"fail\">Unknown error occurred. Please check the Logs for details.</font>");                                
                            }
                        }
                        else {
                            $('.isilon_error_msg').html("<font class=\"success\">Successfully saved.</font>");
                        }
                    }
                );
            });
        });
    }
);