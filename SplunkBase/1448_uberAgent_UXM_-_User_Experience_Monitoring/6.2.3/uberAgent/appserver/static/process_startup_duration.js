// RequireJS dependency handling
require (["splunkjs/mvc",
         "splunkjs/mvc/simplexml/ready!",
         "splunkjs/mvc/tokenforwarder"], function (mvc)
{   
   //
   // Set tokens depending on whether we are in process or application mode
   //
   var mode = GetToken (mvc, "mode");
   var regex = /[^|]+/;
   var easySplunkVersion = GetEasySplunkVersion (mvc);
   if (mode == "app")
   {
      //
      // App mode
      //
      SetToken (mvc, "ModeGroupBy", "AppName");
      SetToken (mvc, "ModeGroupByAs", "App name (s)");      
      SetToken (mvc, "ModeGroupByPluralLower", "applications");
      SetToken (mvc, "RadioButtonLabel", "Only show new applications?");

      // Page title and description
      document.title = document.title.replace (regex, "Application Startup ");
      if (easySplunkVersion >= 70300)
      {
         $('.dashboard-header > h1').text ("Application Startup");
      }
      else
      {
         $('.dashboard-header > h2').text ("Application Startup");
      }
      $('.dashboard-header > p.description').text ("This dashboard displays detailed information about application startup performance.");
   }
   else
   {
      //
      // Process mode
      //
      SetToken (mvc, "ModeGroupBy", "ProcName");
      SetToken (mvc, "ModeGroupByAs", "Process name (s)");
      SetToken (mvc, "ModeGroupByPluralLower", "processes");      
      SetToken (mvc, "RadioButtonLabel", "Only show new processes?");

      // Page title and description
      document.title = document.title.replace (regex, "Process Startup ");
      if (easySplunkVersion >= 70300)
      {
         $('.dashboard-header > h1').text ("Process Startup");
      }
      else
      {
         $('.dashboard-header > h2').text ("Process Startup");
      }
      $('.dashboard-header > p.description').text ("This dashboard displays detailed information about process startup performance.");
   }

   // Set click event handlers
   var chart21 = mvc.Components.getInstance ("Chart_Panel21");
   chart21.on ("click", drilldown, {clickedElement: "Panel21"});
   var chart22 = mvc.Components.getInstance ("Chart_Panel22");
   chart22.on ("click", drilldown, {clickedElement: "Panel22"});

   // Get the field we grouped by
   function drilldown (event)
   {
      event.preventDefault ();
      
      var earliest = GetToken (mvc, "earliest");
      var latest = GetToken (mvc, "latest");
      var filterField = GetToken (mvc, this.clickedElement + "GroupBy");
      if (filterField === "AppName")
      {
         var drilldownUrl = "single_application_detail";
         drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
         drilldownUrl += "&latest=" + encodeURIComponent (latest);
         drilldownUrl += "&form.FilterField=" + encodeURIComponent ("sAppName");
         drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
         drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (event.data["click.value"]);
      }
      else if (filterField === "ProcUser")
      {
         var drilldownUrl = "single_user_detail";
         drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
         drilldownUrl += "&latest=" + encodeURIComponent (latest);
         drilldownUrl += "&form.FilterField=" + encodeURIComponent ("sUser");
         drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
         drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (event.data["click.value"]);
      }
      else if (filterField === "host")
      {
         var drilldownUrl = "single_machine_detail";
         drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
         drilldownUrl += "&latest=" + encodeURIComponent (latest);
         drilldownUrl += "&form.FilterField=" + encodeURIComponent ("shost");
         drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
         drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (event.data["click.value"]);
      }      
      else
      {
         var drilldownUrl = "analyze_timechart";
         drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
         drilldownUrl += "&latest=" + encodeURIComponent (latest);
         drilldownUrl += "&form.FilterDatamodel=" + encodeURIComponent ("Process_ProcessStartup");
         drilldownUrl += "&form.FilterField=" + encodeURIComponent ("sProcName");
         drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
         drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (event.data["click.value"]);
      }
      
      window.location = drilldownUrl;
   }
   
   //
   // Submit the changed tokens
   //
   SubmitTokens (mvc);
});
