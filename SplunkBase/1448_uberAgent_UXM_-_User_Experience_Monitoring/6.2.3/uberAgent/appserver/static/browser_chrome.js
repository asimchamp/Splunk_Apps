
// RequireJS dependency handling
require (["splunkjs/mvc",
         "splunkjs/mvc/simplexml/ready!",
         "splunkjs/mvc/tokenforwarder"], function (mvc)
{
   // Set click event handlers
   var chart31 = mvc.Components.getInstance ("Chart_Panel31");
   chart31.on ("click", drilldown);
   var chart32 = mvc.Components.getInstance ("Chart_Panel32");
   chart32.on ("click", drilldown);
   var chart41 = mvc.Components.getInstance ("Chart_Panel41");
   chart41.on ("click", drilldown);
   var chart42 = mvc.Components.getInstance ("Chart_Panel42");
   chart42.on ("click", drilldown);
   var table51 = mvc.Components.getInstance ("Table_Panel51");
   table51.on ("click:row", drilldown);

   function drilldown (event)
   {
      event.preventDefault ();

      var earliest = GetToken (mvc, "earliest");
      var latest = GetToken (mvc, "latest");
      
      var drilldownUrl = "analyze_timechart";
      drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
      drilldownUrl += "&latest=" + encodeURIComponent (latest);
      drilldownUrl += "&form.FilterDatamodel=" + encodeURIComponent ("Application_BrowserPerformanceChrome");
      drilldownUrl += "&form.FilterField=" + encodeURIComponent ("sProcType");
      drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
      drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (event.data["click.value"]);
      
      window.location = drilldownUrl;
   }
});
