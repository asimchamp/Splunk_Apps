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
      document.title = document.title.replace (regex, gettext("Application Network Issues "));
      if (easySplunkVersion >= 70300)
      {
         $('.dashboard-header > h1').text (gettext("Application Network Issues"));
      }
      else
      {
         $('.dashboard-header > h2').text (gettext("Application Network Issues"));
      }
   }
   else if (mode == "proc")
   {
      //
      // Proc mode
      //
      
      // Page title and description
      document.title = document.title.replace (regex, gettext("Process Network Issues "));
      if (easySplunkVersion >= 70300)
      {
         $('.dashboard-header > h1').text (gettext("Process Network Issues"));
      }
      else
      {
         $('.dashboard-header > h2').text (gettext("Process Network Issues"));
      }
      
   }
   else
   {
      //
      // Host mode
      //
      
      // Page title and description
      document.title = document.title.replace (regex, gettext("Machine Network Issues "));
      if (easySplunkVersion >= 70300)
      {
         $('.dashboard-header > h1').text (gettext("Machine Network Issues"));
      }
      else
      {
         $('.dashboard-header > h2').text (gettext("Machine Network Issues"));
      }
   }
});
