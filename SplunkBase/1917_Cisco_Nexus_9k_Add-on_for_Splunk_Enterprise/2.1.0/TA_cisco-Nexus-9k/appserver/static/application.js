$(document).ready(function () {

    let splunk_version = $C.VERSION_LABEL

    let host_input = $("#\\/admin\\/TA_cisco_Nexus_9k_server_setup\\/TA_cisco_Nexus_9k_server_setup_settings\\/cisco_Nexus_9k_host_id");
    let host_error_widget = $(host_input).siblings('div')[0]
    let username_input = $("#\\/admin\\/TA_cisco_Nexus_9k_server_setup\\/TA_cisco_Nexus_9k_server_setup_settings\\/cisco_Nexus_9k_username_id")
    let username_error_widget = $(username_input).siblings('div')[0]
    let password_input = $("#\\/admin\\/TA_cisco_Nexus_9k_server_setup\\/TA_cisco_Nexus_9k_server_setup_settings\\/password_id")
    let password_error_widget;

    let version_info = splunk_version.split('.')
    if (+version_info[0] == 7 && +version_info[1] == 0) {
        password_error_widget = $(password_input).siblings('div')[0]
    } else {
        password_error_widget = $(password_input).parent().siblings('div')[0]
        $("#item-textNode-0-1").css({ "margin-left": "24%" })
    }

    function isValidated(e) {

        let host_input_val = $(host_input).val().trim()
        let username_input_val = $(username_input).val().trim()
        let password_input_val = $(password_input).val()
        let err_flag = false

        let host_check_regex = /^(http)|[/\\]+/;
        let space_check_regex = /\s+/;

        $(host_error_widget).hide()
        $(username_error_widget).hide()
        $(password_error_widget).hide()


        if (!host_input_val) {
            $(host_error_widget).text("IP Address must not be empty")
            $(host_error_widget).css({ "margin-top": "5px" })
            $(host_error_widget).show()
            err_flag = true
        }
        if (host_check_regex.test(host_input_val)) {
            $(host_error_widget).text("IP address must not contain http/s or slash")
            $(host_error_widget).css({ "margin-top": "5px" })
            $(host_error_widget).show()
            err_flag = true
        }
        if (!username_input_val) {
            $(username_error_widget).text("Username must not be empty")
            $(username_error_widget).css({ "margin-top": "5px" })
            $(username_error_widget).show()
            err_flag = true
        }
        else if (space_check_regex.test(username_input_val)){
            $(username_error_widget).text("Username must not contain any space")
            $(username_error_widget).css({ "margin-top": "5px" })
            $(username_error_widget).show()
            err_flag = true
        }
        if (!password_input_val) {
            $(password_error_widget).text("Password must not be empty")
            $(password_error_widget).show()
            err_flag = true
        }
        if (err_flag) {
            e.preventDefault()
        }
    }

    $('.splButton-primary').on('click', function (e) {
        isValidated(e)
    })

    $(window).keydown(function (event) {
        if (event.keyCode == 13 && $(document.activeElement).length != 0 && $(document.activeElement)[0].innerText != "Cancel\n") {
            isValidated(event);
        }
    });

})