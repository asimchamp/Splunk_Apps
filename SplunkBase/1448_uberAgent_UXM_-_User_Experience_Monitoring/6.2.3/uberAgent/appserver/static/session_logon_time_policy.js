
// RequireJS dependency handling
require (["splunkjs/mvc",
         "splunkjs/mvc/simplexml/ready!",
         "splunkjs/mvc/tokenforwarder"], function (mvc)
{
   // Set click event handlers
   var chart21 = mvc.Components.getInstance ("Chart_Panel21");
   chart21.on ("click", drilldown, {clickedElement: "Panel21"});
   var chart22 = mvc.Components.getInstance ("Chart_Panel22");
   chart22.on ("click", drilldown, {clickedElement: "Panel22"});
   var table31 = mvc.Components.getInstance ("Table_Panel31");
   table31.on ("click:row", drilldown, {clickedElement: "Panel31"});
   
   function drilldown (event)
   {
      event.preventDefault ();

      var earliest = GetToken (mvc, "earliest");
      var latest = GetToken (mvc, "latest");
      
      if (this.clickedElement === "Panel21")
      {
         var drilldownUrl = "single_user_detail";
         drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
         drilldownUrl += "&latest=" + encodeURIComponent (latest);
         drilldownUrl += "&form.FilterField=" + encodeURIComponent ("sUser");
         drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
         drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (event.data["click.value"]);
      }
      else if (this.clickedElement === "Panel31")
      {
         var drilldownUrl = "single_session_logon_time";
         drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
         drilldownUrl += "&latest=" + encodeURIComponent (latest);
         drilldownUrl += "&FilterSessionGuid=" + encodeURIComponent (event.data["row.SessionGUID"]);
      }
      
      window.location = drilldownUrl;
   }
});
