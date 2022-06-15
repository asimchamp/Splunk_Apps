    function removeElement(elementId) {
        // Removes an element from the document
        var element = document.getElementById(elementId);
        if (element !== null)
        {
            element.parentNode.removeChild(element);
        }
    }

function GoToSingleDashboard (tokens) {
    var DrilldownType = tokens.get("DrilldownType");
    var DrilldownClickValue = tokens.get("DrilldownClickValue");
    var DrilldownSessionGUID = tokens.get("DrilldownSessionGUID");
    
    if (DrilldownType === "machine")
      {
         var drilldownUrl = "single_machine_detail?";
         drilldownUrl += "&form.FilterField=" + encodeURIComponent ("shost");
         drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
         drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (DrilldownClickValue);
         
      }
      else if (DrilldownType === "session")
      {
         var drilldownUrl = "analyze_timechart?";
         drilldownUrl += "&form.FilterField=" + encodeURIComponent ("sSessionGUID");
         drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
         drilldownUrl += "&form.FilterDatamodel=" + encodeURIComponent ("Session_SessionDetail_Users");
         drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (DrilldownSessionGUID);
      }
      
      else if (DrilldownType === "application")
      {
         var drilldownUrl = "single_application_detail?";
         drilldownUrl += "&form.FilterField=" + encodeURIComponent ("sAppName");
         drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
         drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (DrilldownClickValue);
      }
      
      // Create new URL
      var BaseURL = window.location.href;
      BaseURL = BaseURL.substr(0, BaseURL.lastIndexOf("/") + 1);
      var NewURL = BaseURL + drilldownUrl;
      
      // Open drilldown in new tab
      window.open(NewURL, '_blank');
}

function CreateBtnSingleDashboard(tokens) {
    var DrilldownClickValue = tokens.get("DrilldownClickValue");
    
    // Create drilldown to new page button with JS because of timing issues when using Simple XML.
    var BtnGoToSingleDashboard = document.createElement("button");
    var textContent = "Analyse " + DrilldownClickValue;
    BtnGoToSingleDashboard.textContent = textContent;
    BtnGoToSingleDashboard.id = "BtnGoToSingleDashboard";

    // Append button to panel
    var Panel71_Div_BtnGoToSingleDashboard = document.getElementById("Panel71_Div_BtnGoToSingleDashboard");
    Panel71_Div_BtnGoToSingleDashboard.appendChild(BtnGoToSingleDashboard);
    
    // Add event listener
    BtnGoToSingleDashboard.addEventListener ("click", function() {
      GoToSingleDashboard(tokens);
    });
}

function SmoothScroll(pixels) {
    if (pixels == null)
    {
        var pixels = 600;
    }
    var y = $(window).scrollTop();
    $('html, body').animate({ scrollTop: y + pixels });
}

function scrollTo(selector) {
    document.querySelector(selector).scrollIntoView({ behavior: 'smooth' })
}

function toggle(button, tokens) {
    var showMore = tokens.get("showMore");
    if(showMore == null) {
        button.attr("src", "/static/app/uberAgent/collapse.svg");
        tokens.set("showMore", "true");
        SmoothScroll()
    }
    else
    {
        button.attr("src", "/static/app/uberAgent/expand.svg");
        tokens.unset("showMore");
    }
}

require.config({
    paths: {
        "app": "../app"
    }
});

require([
    "underscore",
    "jquery",
    "splunkjs/mvc",
    "splunkjs/ready!",
    "splunkjs/mvc/simplexml/ready!",
], function (_, $, mvc) {
    var tokens = mvc.Components.get("submitted");

    // Attach click event handler to buttons
    $('#table_machines').on("click", function () {
        if (document.getElementById("BtnGoToSingleDashboard") == null)
        {
            CreateBtnSingleDashboard(tokens);
            scrollTo("#Panel71")
        }
        else
        {
            removeElement("BtnGoToSingleDashboard");
            CreateBtnSingleDashboard(tokens);
        }
        
    });
    
    $('#table_sessions').on("click", function () {
        if (document.getElementById("BtnGoToSingleDashboard") == null)
        {
            CreateBtnSingleDashboard(tokens);
            scrollTo("#Panel71")
        }
        else
        {
            removeElement("BtnGoToSingleDashboard");
            CreateBtnSingleDashboard(tokens);
        }
    });
    
    $('#table_applications').on("click", function () {
        if (document.getElementById("BtnGoToSingleDashboard") == null)
        {
            CreateBtnSingleDashboard(tokens);
            scrollTo("#Panel71")
        }
        else
        {
            removeElement("BtnGoToSingleDashboard");
            CreateBtnSingleDashboard(tokens);
        }
    });
    
    $("#Panel81imgToggle1").on("click", function(){
        toggle($(this), tokens);
    });
});