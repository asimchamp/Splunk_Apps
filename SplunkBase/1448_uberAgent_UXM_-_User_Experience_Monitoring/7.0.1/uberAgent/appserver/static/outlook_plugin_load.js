
// RequireJS dependency handling
require (["splunkjs/mvc",
         "splunkjs/mvc/simplexml/ready!",
         "splunkjs/mvc/tokenforwarder"], function (mvc)
{
   // Set click event handlers
   var chart11 = mvc.Components.getInstance ("Chart_Panel11");
   chart11.on ("click", drilldown);
   var chart12 = mvc.Components.getInstance ("Chart_Panel12");
   chart12.on ("click", drilldown);
   var table31 = mvc.Components.getInstance ("Table_Panel31");
   table31.on ("click:row", drilldown);

   function drilldown (event)
   {
      event.preventDefault ();

      var earliest = GetToken (mvc, "earliest");
      var latest = GetToken (mvc, "latest");
      
      var drilldownUrl = "analyze_timechart";
      drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
      drilldownUrl += "&latest=" + encodeURIComponent (latest);
      drilldownUrl += "&form.FilterDatamodel=" + encodeURIComponent ("Application_OutlookPluginLoad");
      drilldownUrl += "&form.FilterField=" + encodeURIComponent ("sProgID");
      drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
      drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (event.data["click.value"]);
      
      window.location = drilldownUrl;
   }
});
