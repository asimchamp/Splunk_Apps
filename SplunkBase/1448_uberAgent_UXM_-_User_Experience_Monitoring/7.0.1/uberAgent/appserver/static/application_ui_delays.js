
// RequireJS dependency handling
require (["splunkjs/mvc",
         "splunkjs/mvc/simplexml/ready!",
         "splunkjs/mvc/tokenforwarder"], function (mvc)
{
   //
   // Set tokens depending on whether we are in process or application mode
   //
   var searchTable;
   var searchSingle2;
   
   var mode = GetToken (mvc, "mode");
   var regex = /[^|]+/;
  
   if (mode == "process")
   {
      //
      // Process mode
      //
      SetToken (mvc, "ModeUpper", gettext("Process UI"));
      SetToken (mvc, "ModeLower", gettext("process"));
      SetToken (mvc, "ModeLowerPlural", gettext("processes"));
      SetToken (mvc, "ModeGroupByAs", gettext("Process name"));

      // Page title and description
      document.title = document.title.replace (regex, gettext("Process Unresponsiveness "));
      var easySplunkVersion = GetEasySplunkVersion (mvc);
      if (easySplunkVersion >= 70300)
      {
        $('.dashboard-header > h1').text (gettext("Process UI Unresponsiveness"));
      }
      else
      {
        $('.dashboard-header > h2').text (gettext("Process UI Unresponsiveness"));
      }
      $('.dashboard-header > p.description').text (gettext("This dashboard displays information about times of unresponsiveness, i.e. when processes do not react to user input. Events are generated every time processes do not handle window messages for 200 ms (or longer)."));

      searchSingle2 =   '| pivot `uA_DM_Application_UIDelay` Application_UIDelay ' +
                           'sum(UIDelayS) as SumUIDelayS ' +
                           'splitrow ' +
                              '_time ' + 
                              'period $PivotPeriodAutoSolo$ ' + 
                           'splitcol ' +
                              'ProcessName ' + 
                              'numcols 10 ' +
                              'showother 1 ' +
                           'filter ' +
                              'ProcessName isNotNull ' +
                           '$SearchFilter$';

      searchTable =  '| pivot `uA_DM_Application_UIDelay` Application_UIDelay ' +
                        '$Panel41Function1$(UIDelayS) as FuncUIDelayS ' +
                        'count(UIDelayMs) as "Unresponsiveness count" ' +
                        'sum(HasFocusNumber) as "Focus count" ' +
                        'values(AppName) as "App name" ' +
                        'dc(host) as "Host count" ' +
                        'dc(User) as "User count" ' +
                        'splitrow ' +
                           'ProcessName as "Process name" ' +
                        '$SearchFilter$ ' +
                     '| eval "$Panel41Function1Display$ process UI unresponsiveness (s)" = round(FuncUIDelayS,1) ' +
                     '| eval sortfield=lower(\'Process name\') ' +
                     '| table ' +
                        '"Process name" ' +
                        '"App name" ' +
                        '"$Panel41Function1Display$ process UI unresponsiveness (s)" ' +
                        '"Unresponsiveness count" ' +
                        '"Focus count" ' +
                        '"User count" ' +
                        '"Host count" ' +
                        'sortfield ' +
                     '| sort limit=0 sortfield ' +
                     '| fields - sortfield ';
   }

   else
   {
      //
      // App mode
      //
      SetToken (mvc, "ModeUpper", gettext("Application UI"));
      SetToken (mvc, "ModeLower", gettext("application"));
      SetToken (mvc, "ModeLowerPlural", gettext("applications"));
      SetToken (mvc, "ModeGroupByAs", gettext("app name"));

      // Page title and description
      document.title = document.title.replace (regex, gettext("Application UI Unresponsiveness "));
      var easySplunkVersion = GetEasySplunkVersion (mvc);
      if (easySplunkVersion >= 70300)
      {
        $('.dashboard-header > h1').text (gettext("Application UI Unresponsiveness"));
      }
      else
      {
        $('.dashboard-header > h2').text (gettext("Application UI Unresponsiveness"));
      }
      $('.dashboard-header > p.description').text (gettext("This dashboard displays information about times of unresponsiveness, i.e. when application user interfaces do not react to user input. Events are generated every time applications do not process window messages for 200 ms (or longer)."));

      searchSingle2 = '| pivot `uA_DM_Application_UIDelay` Application_UIDelay ' +
                        'sum(UIDelayS) as SumUIDelayS ' +
                        'splitrow ' +
                           '_time ' + 
                           'period $PivotPeriodAutoSolo$ ' + 
                        'splitcol ' +
                           'AppName ' + 
                           'numcols 10 ' +
                           'showother 1 ' +
                        'filter ' +
                           'AppName isNotNull ' +
                        '$SearchFilter$';

      searchTable =  '| pivot `uA_DM_Application_UIDelay` Application_UIDelay ' +
                        '$Panel41Function1$(UIDelayS) as FuncUIDelayS ' +
                        'count(UIDelayMs) as "Unresponsiveness count" ' +
                        'sum(HasFocusNumber) as "Focus count" ' +
                        'values(ProcessName) as "Process name(s)" ' +
                        'dc(host) as "Host count" ' +
                        'dc(User) as "User count" ' +
                        'splitrow ' +
                           'AppName as "App name" ' +
                        '$SearchFilter$ ' +
                     '| eval "$Panel41Function1Display$ app UI unresponsiveness (s)" = round(FuncUIDelayS,1) ' +
                     '| eval sortfield=lower(\'App name\') ' +
                     '| table ' +
                        '"App name" ' +
                        '"Process name(s)" ' +
                        '"$Panel41Function1Display$ app UI unresponsiveness (s)" ' +
                        '"Unresponsiveness count" ' +
                        '"Focus count" ' +
                        '"User count" ' +
                        '"Host count" ' +
                        'sortfield ' +
                     '| sort limit=0 sortfield ' +
                     '| fields - sortfield ';
   }

   // Update search managers
   var searchmgrSingle2 = mvc.Components.getInstance ("Search_Single2");
   searchmgrSingle2.settings.unset ("search");
   searchmgrSingle2.settings.set ("search", mvc.tokenSafe (searchSingle2));

   var searchmgrTable = mvc.Components.getInstance ("Search_Table");
   searchmgrTable.settings.unset ("search");
   searchmgrTable.settings.set ("search", mvc.tokenSafe (searchTable));

   // Set click event handlers
   var chart21 = mvc.Components.getInstance ("Chart_Panel21");
   chart21.on ("click", drilldown, {clickedElement: "Panel21"});
   var chart22 = mvc.Components.getInstance ("Chart_Panel22");
   chart22.on ("click", drilldown, {clickedElement: "Panel22"});
   var chart31 = mvc.Components.getInstance ("Chart_Panel31");
   chart31.on ("click", drilldown, {clickedElement: "Panel31"});
   var chart32 = mvc.Components.getInstance ("Chart_Panel32");
   chart32.on ("click", drilldown, {clickedElement: "Panel32", dataModel: "Process_ProcessDetail", filterField: "sProcName"});
   var table41 = mvc.Components.getInstance ("Table_Panel41");
   table41.on ("click:row", drilldown, {clickedElement: "Panel41", dataModel: "Process_ProcessDetail", filterField: "sProcName"});

   function drilldown (event)
   {
      event.preventDefault ();

      var earliest = GetToken (mvc, "earliest");
      var latest = GetToken (mvc, "latest");

      if (this.clickedElement === "Panel21")
      {
         var drilldownUrl = "single_machine_detail";
         drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
         drilldownUrl += "&latest=" + encodeURIComponent (latest);
         drilldownUrl += "&form.FilterField=" + encodeURIComponent ("shost");
         drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
         drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (event.data["click.value"]);
      }
      else if (this.clickedElement === "Panel22")
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
         var drilldownUrl = "single_application_detail";
         drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
         drilldownUrl += "&latest=" + encodeURIComponent (latest);
         drilldownUrl += "&form.FilterField=" + encodeURIComponent ("sAppName");
         drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
         drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (event.data["click.value"]);
      }
      else if (this.clickedElement === "Panel41")
      {
         if (mode == "process")
         {
            var drilldownUrl = "analyze_timechart";
            drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
            drilldownUrl += "&latest=" + encodeURIComponent (latest);
            drilldownUrl += "&form.FilterDatamodel=" + encodeURIComponent (this.dataModel);
            drilldownUrl += "&form.FilterField=" + encodeURIComponent (this.filterField);
            drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
            drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (event.data["click.value"]);
         }
         else
         {
            var drilldownUrl = "single_application_detail";
            drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
            drilldownUrl += "&latest=" + encodeURIComponent (latest);
            drilldownUrl += "&form.FilterField=" + encodeURIComponent ("sAppName");
            drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
            drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (event.data["click.value"]);
         }
         
      }
      else
      {
         var drilldownUrl = "analyze_timechart";
         drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
         drilldownUrl += "&latest=" + encodeURIComponent (latest);
         drilldownUrl += "&form.FilterDatamodel=" + encodeURIComponent (this.dataModel);
         drilldownUrl += "&form.FilterField=" + encodeURIComponent (this.filterField);
         drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
         drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (event.data["click.value"]);
      }
      
      window.location = drilldownUrl;
   }

   //
   // Submit the changed tokens
   //
   SubmitTokens (mvc);
});
