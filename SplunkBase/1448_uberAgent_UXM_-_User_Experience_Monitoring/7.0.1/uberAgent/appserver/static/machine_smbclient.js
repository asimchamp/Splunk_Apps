
// RequireJS dependency handling
require (["splunkjs/mvc",
         "splunkjs/mvc/simplexml/ready!",
         "splunkjs/mvc/tokenforwarder"], function (mvc)
{
   // Set click event handlers
   var chart31 = mvc.Components.getInstance ("Chart_Panel31");
   chart31.on ("click", drilldown, {clickedElement: "Panel31"});
   var chart32 = mvc.Components.getInstance ("Chart_Panel32");
   chart32.on ("click", drilldown, {clickedElement: "Panel32"});
   var table51 = mvc.Components.getInstance ("Table_Panel51");
   table51.on ("click:row", drilldown, {clickedElement: "Panel51"});

   function drilldown (event)
   {
      event.preventDefault ();

      var earliest = GetToken (mvc, "earliest");
      var latest = GetToken (mvc, "latest");
      
      // Get the field we grouped by
      var filterField = GetToken (mvc, this.clickedElement + "GroupBy");
      
      if (filterField === "host")
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
         drilldownUrl += "&form.FilterDatamodel=" + encodeURIComponent ("System_SmbClient");
         drilldownUrl += "&form.FilterField=" + encodeURIComponent (filterField);
         drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
         drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (event.data["click.value"]);
      }
      
      window.location = drilldownUrl;
   }

});
