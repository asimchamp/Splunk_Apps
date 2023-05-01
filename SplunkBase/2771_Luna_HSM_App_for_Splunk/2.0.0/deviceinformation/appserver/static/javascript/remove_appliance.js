require([
    'jquery',
    'splunkjs/mvc/simplexml/ready!'
], function ($) {
    processListAppliances = function () {
        $(".luna-table-header").hide();
        $(".luna-table-row-buttons").hide();
        $(".luna-appliance-row").remove();
        $.ajax({
            type: "GET",
            url: "../../../../en-US/splunkd/__raw/services/deviceinformationapp/lunahsmappliancesetup/getappliancelist?output_mode=json",
            statusCode: {
                404: function (responseObject, textStatus, jqXHR) {
                    // No appliance configured
                    $(".luna-form-group-top-div").html('<div><h2 class="luna-message luna-error" style="font-color:red;">No appliance configured. Redirecting...</h2></div>');
                    setTimeout(function () {
                        window.location.href = "../deviceinformation/hsm_home";
                    }, 3000);
                }
            },
            success: function (text) {
                var applianceList = text['entry'][0]['content'];

                var divContents = '';
                for (let [key, value] of Object.entries(applianceList)) {
                    if (key == "eai:acl") {
                        continue;
                    }
                    divContents += `<div class="luna-table-row luna-appliance-row">`;
                    divContents += `<div class="luna-table-data">${key}</div>`;
                    divContents += `<div class="luna-table-data">${value}</div>`;
                    divContents += `<div class="luna-table-data luna-checkbox"><input type="checkbox" name="appliances_to_delete" value="${key}" /></div>`;
                    divContents += `</div>`;
                }
                $(".luna-table-header").show();
                $(".luna-appliance-list-element").prepend(divContents);
                $(".luna-table-row-buttons").show();
            },
            error: function () {
                $(".luna-form-group-top-div").html('<h2 class="luna-message luna-error">Error: Unable to fetch configured Luna HSM appliances.</h2><br /><h3><a href="#" class="retry-appliance-list">Click to retry</a></h3>');
                $(".retry-appliance-list").click(function (e) {
                    processListAppliances();
                });
            },
        });
    }

    processListAppliances();

    var submit_button = $("#lunaapp_submit_button");
    var cancel_button = $("#lunaapp_cancel_button");

    $(submit_button).click(function (e) {
        e.preventDefault();
        $(".luna-message").remove();

        var data = new Object();
        data.appliances_to_delete = [];
        $('input[name^="appliances_to_delete"]').each(function () {
            if ($(this).prop('checked')) {
                data.appliances_to_delete.push($(this).val());
            }
        });
        if (data.appliances_to_delete.length == 0) {
            $(".luna-form-group-top-div").prepend('<h2 class="luna-message luna-progress">Please first select at least one appliance to process for removal.</h2>')
            $(".luna-message").fadeOut(2000);
            return;
        }
        // var divData = $(".luna-form-group-top-div").html();
        $(".luna-form-group-top-div").prepend('<h2 class="luna-message luna-progress">Processing request. Please wait....</h2>');
        $.ajax({
            type: "POST",
            url: "../../../../en-US/splunkd/__raw/services/deviceinformationapp/lunahsmappliancesetup/removeappliances",
            data: "appliances_to_delete=" + JSON.stringify(data.appliances_to_delete),
            success: function (text) {
                $(".luna-message").remove();
                $(".luna-form-group-top-div").prepend('<h2 class="luna-message luna-success">Request processed successfully.</h2>');
                $(".luna-message").fadeOut(3000);
                processListAppliances(false);
            },
            error: function () {
                $(".luna-message").remove();
                $(".luna-form-group-top-div").prepend('<h2 class="luna-message luna-error">Error: Unable to process "remove appliance" request.</h2>');
                // $(".luna-form-group-top-div").append(divData);
            }
        });
    });

    $(cancel_button).click(function (e) {
        e.preventDefault();
        window.location.href = '../deviceinformation/hsm_home';
    });
});
