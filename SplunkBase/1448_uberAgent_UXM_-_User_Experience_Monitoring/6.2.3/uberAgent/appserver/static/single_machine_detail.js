// RequireJS dependency handling
require (["splunkjs/mvc",
         "splunkjs/mvc/simplexml/ready!",
         "splunkjs/mvc/tokenforwarder"], function (mvc)
{
   // Set click event handlers
   var table21 = mvc.Components.getInstance ("Table_Panel21");
   table21.on ("click:row", drilldown, {clickedElement: "Panel21"});
   var table41 = mvc.Components.getInstance ("Table_Panel41");
   table41.on ("click:row", drilldown, {clickedElement: "Panel41"});
   var table51 = mvc.Components.getInstance ("Table_Panel51");
   table51.on ("click:row", drilldown, {clickedElement: "Panel51"});

   // Define a drilldown function that can be used by multiple click event handlers
   function drilldown (event)
   {
      // Don't do any further event processing
      event.preventDefault ();

      // Get token values
      var earliest = GetToken (mvc, "earliest");
      var latest = GetToken (mvc, "latest");
      
      // Build the new URL
      if (this.clickedElement === "Panel21")
      {
         var drilldownUrl = "analyze_timechart";
         drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
         drilldownUrl += "&latest=" + encodeURIComponent (latest);
         drilldownUrl += "&form.FilterDatamodel=" + encodeURIComponent ("Session_SessionDetail_Users");
         drilldownUrl += "&form.FilterField=" + encodeURIComponent ("sSessionGUID");
         drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
         drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (event.data["row.SessionGUID"]);
      }
      else if (this.clickedElement === "Panel41")
      {
         var drilldownUrl = "single_application_detail";
         drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
         drilldownUrl += "&latest=" + encodeURIComponent (latest);
         drilldownUrl += "&form.FilterField=" + encodeURIComponent ("sAppName");
         drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
         drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (event.data["click.value"]);
      }
      else if (this.clickedElement === "Panel51")
      {
         var drilldownUrl = "analyze_timechart";
         drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
         drilldownUrl += "&latest=" + encodeURIComponent (latest);
         drilldownUrl += "&form.FilterDatamodel=" + encodeURIComponent ("Process_NetworkTargetPerformance");
         drilldownUrl += "&form.FilterField=" + encodeURIComponent ("sNetTargetRemoteNameAddressPort");
         drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
         drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (event.data["click.value"]);
      }
      
      // Go to the new URL
      window.location = drilldownUrl;
   }
});