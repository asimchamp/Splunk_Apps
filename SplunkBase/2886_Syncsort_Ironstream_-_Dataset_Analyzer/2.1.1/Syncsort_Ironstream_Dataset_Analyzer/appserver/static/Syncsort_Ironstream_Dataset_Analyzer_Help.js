// =====================================================================================================================================
// THIS CODE IS SUPPLIED "AS IS".  THERE IS NO LIABILITY OR RESPONSIBILITY FOR LOSS, DAMAGE, NEGLECT OR USAGE.  USED AT USER'S OWN RISK.
// Distributed solely as a demonstration of how to add pop-up help to a Splunk® dashboard.
// =====================================================================================================================================

// Show the Pop-Up dialog.
var showIronstreamDashboardHelpDialog = function () {
    $(".modal-title").html("About this Dashboard");
    
    $("#divIronstreamDashboardHelp").modal("show").css({
        height:"750px", 
        overflow:"auto",
        'margin-left': function () {
            //Horizontal centering
            return -($(this).width() / 2);
        }
    });

    $(".divIronstreamDashboardHelpBody").height($("#divIronstreamDashboardHelp").height() - ($(".modal-header").outerHeight() + $(".modal-footer").outerHeight() + 20));
};

function showIronstreamDashboardHelp() {
    showIronstreamDashboardHelpDialog();
}

// Automagically build and inject div.
(function () {
    // Grab dashboard title and set up vars.
    var elementTitle = $($("span[data-role='app-name']").parent()),
        posLeft = 0,
        txt = "<a href='#' title='Learn more about this dashboard' class='syncsort-ironstream-dashboard-help-anchor' onclick='showIronstreamDashboardHelp()'>About this Dashboard</a>",
        pth = Splunk.util.getPath().split("/");

    // Get dashboard path stub.
    pth = pth[pth.length-2];

    // Build modal div containing reference to help html.
    txt += "<div id='divIronstreamDashboardHelp' class='modal'>";
    txt += "  <div class='modal-dialog'>";
    txt += "  	  <div class='modal-content'>";
    txt += "	    <div class='modal-header'>";
    txt += "		    <h3 class='modal-title'/>";
    txt += "	    </div>";
    txt += "	    <div class='modal-body'>";
    txt += "		  <div class='divIronstreamDashboardHelpBody'><iframe class='syncsort-ironstream-help-frame' src='/static/app/" + pth + "/Syncsort_Ironstream_Dataset_Analyzer_Help.html' name=targetframe' allowTransparency='true' frameborder='0' scrolling='yes'></iframe></div>";
    txt += "	    </div>";
    txt += "	    <div class='modal-footer'>";
    txt += "		  <button type='button' class='btn btn-default' data-dismiss='modal'>Close</button>";
    txt += "	    </div>";
    txt += "	  </div>";
    txt += "  </div>";
    txt += "</div>";
        
    // Got a dashboard to hang on?  Yes, insert new div to left and position. 
    if(elementTitle.length) {
        $(elementTitle).before(txt);
        posLeft = $("#header h2").position().left - $(".syncsort-ironstream-dashboard-help-anchor").outerWidth();
        $(".syncsort-ironstream-dashboard-help-anchor").css("left", posLeft + "px");
    }
})();
