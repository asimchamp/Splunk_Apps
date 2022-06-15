
// RequireJS dependency handling
require (["splunkjs/mvc",
         "splunkjs/mvc/simplexml/ready!",
         "splunkjs/mvc/tokenforwarder"], function (mvc)
{

   //
   // Set tokens depending on whether we are in application, process or host mode
   //
   var mode = GetToken (mvc, "mode");
   var regex = /[^|]+/;
   var easySplunkVersion = GetEasySplunkVersion (mvc);
   if (mode == "app")
   {
      //
      // App mode
      //
      
      // Page title and description
      document.title = document.title.replace (regex, "Application Network Communication ");
      if (easySplunkVersion >= 70300)
      {
         $('.dashboard-header > h1').text ("Application Network Communication");
      }
      else
      {
         $('.dashboard-header > h2').text ("Application Network Communication");
      }
   }
   else if (mode == "proc")
   {
      //
      // Proc mode
      //
      
      // Page title and description
      document.title = document.title.replace (regex, "Process Network Communication ");
      if (easySplunkVersion >= 70300)
      {
         $('.dashboard-header > h1').text ("Process Network Communication");
      }
      else
      {
         $('.dashboard-header > h2').text ("Process Network Communication");
      }
      
   }
   else
   {
      //
      // Host mode
      //
      
      // Page title and description
      document.title = document.title.replace (regex, "Machine Network Communication ");
      if (easySplunkVersion >= 70300)
      {
         $('.dashboard-header > h1').text ("Machine Network Communication");
      }
      else
      {
         $('.dashboard-header > h2').text ("Machine Network Communication");
      }
   }   

   // Set click event handlers
   var chart11 = mvc.Components.getInstance ("Chart_Panel11");
   chart11.on ("click", drilldown, {clickedElement: "Panel11"});
   var chart12 = mvc.Components.getInstance ("Chart_Panel12");
   chart12.on ("click", drilldown, {clickedElement: "Panel12"});

   function drilldown (event)
   {
      event.preventDefault ();

      var earliest = GetToken (mvc, "earliest");
      var latest = GetToken (mvc, "latest");
      
      // Get the field we grouped by
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
         drilldownUrl += "&form.FilterDatamodel=" + encodeURIComponent ("Process_NetworkTargetPerformance");
         drilldownUrl += "&form.FilterField=" + encodeURIComponent (filterField);
         drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
         drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (event.data["click.value"]);
      }
      
      window.location = drilldownUrl;
   }

});
