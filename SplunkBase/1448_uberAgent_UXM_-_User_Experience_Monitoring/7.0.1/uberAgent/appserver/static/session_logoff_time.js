
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
   var table41 = mvc.Components.getInstance ("Table_Panel41");
   table41.on ("click:row", drilldown, {clickedElement: "Panel41"});

   function drilldown (event)
   {
      event.preventDefault ();

      var earliest = GetToken (mvc, "earliest");
      var latest = GetToken (mvc, "latest");

      if (this.clickedElement === "Panel31")
      {
         var drilldownUrl = "single_user_detail";
         drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
         drilldownUrl += "&latest=" + encodeURIComponent (latest);
         drilldownUrl += "&form.FilterField=" + encodeURIComponent ("sUser");
         drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
         drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (event.data["click.value"]);
      }
      else if (this.clickedElement === "Panel41")
      {
         var drilldownUrl = "single_session_logoff_time";
         drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
         drilldownUrl += "&latest=" + encodeURIComponent (latest);
         drilldownUrl += "&FilterSessionGuid=" + encodeURIComponent (event.data["row.SessionGUID"]);
      }
      
      window.location = drilldownUrl;
   }
});
