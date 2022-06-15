
// RequireJS dependency handling
require (["splunkjs/mvc",
         "splunkjs/mvc/simplexml/ready!",
         "splunkjs/mvc/tokenforwarder"], function (mvc)
{
   // Set click event handlers
   var chart21 = mvc.Components.getInstance ("Chart_Panel21");
   chart21.on ("click", drilldown);
   var chart22 = mvc.Components.getInstance ("Chart_Panel22");
   chart22.on ("click", drilldown);

   function drilldown (event)
   {
      event.preventDefault ();

      var earliest = GetToken (mvc, "earliest");
      var latest = GetToken (mvc, "latest");
      
      var gpuName;
      var host = event.data["row.Host"];
      if (typeof host === "undefined")
      {
         var gpuAtHost = event.data["row.GPU@Host"].split ('@');
         gpuName = gpuAtHost[0];
         host = gpuAtHost[1];
      }
      else
      {
         gpuName = event.data["row.GPU name"];
      }
      
      var drilldownUrl = "analyze_timechart";
      drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
      drilldownUrl += "&latest=" + encodeURIComponent (latest);
      drilldownUrl += "&form.FilterDatamodel=" + encodeURIComponent ("System_GpuUsage");
      drilldownUrl += "&form.FilterField=" + encodeURIComponent ("shost");
      drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
      drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (host);
      drilldownUrl += "&form.FilterField2=" + encodeURIComponent ("sDisplayAdapterName");
      drilldownUrl += "&form.FilterOperator2=" + encodeURIComponent ("in");
      drilldownUrl += "&form.FilterExpression2=" + encodeURIComponent (gpuName);
      drilldownUrl += "&form.FilterLevels=" + encodeURIComponent ("2");

      window.location = drilldownUrl;
   }

});
