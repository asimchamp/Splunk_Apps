// RequireJS dependency handling
require (["splunkjs/mvc",
         "splunkjs/mvc/simplexml/ready!",
         "splunkjs/mvc/tokenforwarder"], function (mvc)
{
   // Set click event handlers
   var table41 = mvc.Components.getInstance ("Table_Panel41");
   table41.on ("click:row", drilldown, {clickedElement: "Panel41"});
   var table42 = mvc.Components.getInstance ("Table_Panel42");
   table42.on ("click:row", drilldown, {clickedElement: "Panel42"});

   // Define a drilldown function that can be used by multiple click event handlers
   function drilldown (event)
   {
      // Don't do any further event processing
      event.preventDefault ();

      // Get token values
      var earliest = GetToken (mvc, "earliest");
      var latest = GetToken (mvc, "latest");
      
      // Build the new URL
      if (this.clickedElement === "Panel41")
      {
         var drilldownUrl = "single_machine_detail";
         drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
         drilldownUrl += "&latest=" + encodeURIComponent (latest);
         drilldownUrl += "&form.FilterField=" + encodeURIComponent ("shost");
         drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
         drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (event.data["click.value"]);
      }
      else if (this.clickedElement === "Panel42")
      {
         var drilldownUrl = "single_user_detail";
         drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
         drilldownUrl += "&latest=" + encodeURIComponent (latest);
         drilldownUrl += "&form.FilterField=" + encodeURIComponent ("sUser");
         drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
         drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (event.data["click.value"]);
      }
      
      // Go to the new URL
      window.location = drilldownUrl;
   }
});