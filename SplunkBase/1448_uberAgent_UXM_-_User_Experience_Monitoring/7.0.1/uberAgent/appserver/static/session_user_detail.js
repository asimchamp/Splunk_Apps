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
   var chart31 = mvc.Components.getInstance ("Chart_Panel31");
   chart31.on ("click", drilldown);
   var chart32 = mvc.Components.getInstance ("Chart_Panel32");
   chart32.on ("click", drilldown);
   var table41 = mvc.Components.getInstance ("Table_Panel41");
   table41.on ("click:row", drilldown);

   function drilldown (event)
   {
      event.preventDefault ();

      var earliest = GetToken (mvc, "earliest");
      var latest = GetToken (mvc, "latest");
      
      var drilldownUrl = "analyze_timechart";
      drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
      drilldownUrl += "&latest=" + encodeURIComponent (latest);
      drilldownUrl += "&form.FilterDatamodel=" + encodeURIComponent ("Session_SessionDetail_Users");

      var sessionGuid = event.data["row.SessionGUID"];
      if (sessionGuid)
      {
         drilldownUrl += "&form.FilterField=" + encodeURIComponent ("sSessionGUID");
         drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
         drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (event.data["row.SessionGUID"]);
      }
      else
      {
         var userAtHost = event.data["row.User@host"].split ('@');
         var user = userAtHost[0];
         var host = userAtHost[1];

         drilldownUrl += "&form.FilterField=" + encodeURIComponent ("shost");
         drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
         drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (host);
         drilldownUrl += "&form.FilterField2=" + encodeURIComponent ("sSessionUser");
         drilldownUrl += "&form.FilterOperator2=" + encodeURIComponent ("in");
         drilldownUrl += "&form.FilterExpression2=" + encodeURIComponent ("*" + user);   // Do not use "*\" here or this breaks with encrypted user names
         drilldownUrl += "&form.FilterLevels=" + encodeURIComponent ("2");
      }
      
      window.location = drilldownUrl;
   }

});
