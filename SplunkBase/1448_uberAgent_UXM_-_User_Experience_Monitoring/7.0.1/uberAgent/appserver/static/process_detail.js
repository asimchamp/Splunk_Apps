// RequireJS dependency handling
require (["splunkjs/mvc",
         "splunkjs/mvc/simplexml/ready!"], function (mvc)
{
   //
   // Set tokens depending on whether we are in process or application mode
   //
   var searchCharts;
   var searchTable;
   var mode = GetToken (mvc, "mode");
   var regex = /[^|]+/;
   var easySplunkVersion = GetEasySplunkVersion (mvc);
   if (mode == "app")
   {
      //
      // App mode
      //
      SetToken (mvc, "ModeLower", gettext("application"));
      // Don't translate this, as it is used as a field in queries. Or translate all the fields in the queries too.
      SetToken (mvc, "ModeGroupByAs", "App name");

      // Page title and description
      document.title = document.title.replace (regex, gettext("Application Performance "));
      if (easySplunkVersion >= 70300)
      {
         $('.dashboard-header > h1').text (gettext("Application Performance"));
      }
      else
      {
         $('.dashboard-header > h2').text (gettext("Application Performance"));
      }
      $('.dashboard-header > p.description').text (gettext("This dashboard displays detailed information about application performance."));

      // Build the search string
      searchCharts = '| pivot `uA_DM_Process_ProcessDetail` Process_ProcessDetail ' +
                        'sum($Panel11Field1$) as $Panel11Field1$ ' +
                        'sum($Panel12Field1$) as $Panel12Field1$ ' +
                        'sum(ProcWorkingSetMB) as ProcWorkingSetMB ' +
                        'sum($Panel22Field1$) as $Panel22Field1$ ' +
                        'splitrow ' +
                           'AppName as "App name" ' +
                        'splitrow ' +
                           'time as _time ' +
                        'splitrow ' +
                           'host as host ' +
                        '$SearchFilter$ ' +
                        '`uberAgent_filter_AppNameIsNotOS` ' +
                     '| stats ' +
                        '$Panel11Function1$($Panel11Field1$) as "$Panel11Function1$($Panel11Field1$)" ' +
                        '$Panel12Function1$($Panel12Field1$) as "$Panel12Function1$($Panel12Field1$)" ' +
                        '$Panel21Function1$(ProcWorkingSetMB) as "$Panel21Function1$(ProcWorkingSetMB)" ' +
                        '$Panel22Function1$($Panel22Field1$) as "$Panel22Function1$($Panel22Field1$)" ' +
                        'by "App name"';
                        
      searchTable =  '| pivot `uA_DM_Process_ProcessDetail` Process_ProcessDetail ' +
                        'sum(ProcCPUTimeS) as ProcCPUTimeS ' +
                        'sum(ProcCPUPercent) as ProcCPUPercent ' +
                        'sum(ProcIOPS) as ProcIOPS ' +
                        'sum(ProcIOCount) as ProcIOCount ' +
                        'sum(ProcIOMBPS) as ProcIOMBPS ' +
                        'sum(ProcIOMB) as ProcIOMB ' +
                        'sum(ProcIODurationMs) as ProcIODurationMs ' +
                        'sum(ProcWorkingSetMB) as ProcWorkingSetMB ' +
                        'sum(ProcNetKBPS) as ProcNetKBPS ' +
                        'sum(ProcHandleCount) AS ProcHandleCount ' +
                        'sum(ProcThreadCount) AS ProcThreadCount ' +
                        'sum(ProcPrivateMB) AS ProcPrivateMB ' +
                        'sum(ProcVirtualSizeMB) AS ProcVirtualSizeMB ' +
                        'sum(ProcPageFaultsPS) AS ProcPageFaultsPS ' +
                        'sum(ProcPageFileMB) AS ProcPageFileMB ' +
                        'values(ProcName) as ProcName ' +
                        'splitrow ' +
                           'AppName as "App name" ' +
                        'splitrow ' +
                           'time as _time ' +
                        'splitrow ' +
                           'host as host ' +
                        '$SearchFilter$ ' +
                        '`uberAgent_filter_AppNameIsNotOS` ' +
                     '| stats ' +
                        'sum(ProcCPUTimeS) AS SumProcCPUTimeS ' +
                        '$Panel31Function1$(ProcCPUPercent) AS FuncProcCPUPercent ' +
                        '$Panel31Function1$(ProcIOPS) AS FuncProcIOPS ' +
                        'sum(ProcIOCount) AS SumProcIOCount ' +
                        '$Panel31Function1$(ProcIOMBPS) AS FuncProcIOMBPS ' +
                        'sum(ProcIOMB) AS SumProcIOMB ' +
                        'sum(ProcIODurationMs) AS SumProcIODurationMs ' +
                        '$Panel31Function1$(ProcWorkingSetMB) as FuncProcWorkingSetMB ' +
                        '$Panel31Function1$(ProcNetKBPS) AS FuncProcNetKBPS ' +
                        'values(ProcName) as "Process name(s)" ' +
                        '$Panel31Function1$(ProcHandleCount) AS FuncProcHandleCount ' +
                        '$Panel31Function1$(ProcThreadCount) AS FuncProcThreadCount ' +
                        '$Panel31Function1$(ProcPrivateMB) AS FuncProcPrivateMB ' +
                        '$Panel31Function1$(ProcVirtualSizeMB) AS FuncProcVirtualSizeMB ' +
                        '$Panel31Function1$(ProcPageFaultsPS) AS FuncProcPageFaults ' +
                        '$Panel31Function1$(ProcPageFileMB) AS FuncProcPageFileMB ' +
                        'by ' +
                           '"App name" ' +
                     '| join ' +
                        'type=outer "App name" ' +
                        '[ ' +
                           '| pivot `uA_DM_Process_NetworkTargetPerformance` Process_NetworkTargetPerformance ' +
                                 'sum(NetTargetSendLatencyCount) AS SumNetTargetSendLatencyCount ' +
                                 'sum(NetTargetSendDurationMs) AS SumNetTargetSendDurationMs ' +
                              'splitrow ' +
                                 'AppName as "App name" ' +
                              '$SearchFilter$ ' +
                              '`uberAgent_filter_AppNameIsNotOS` ' +
                           '| fields + ' +
                              '"App name" ' +
                              'SumNetTargetSendLatencyCount ' +
                              'SumNetTargetSendDurationMs ' +
                        '] ' +
                     '| eval "Total CPU time (s)"=round (SumProcCPUTimeS,1) ' +
                     '| eval "CPU (%)"=round (FuncProcCPUPercent,1) ' +
                     '| eval "IOPS"=round (FuncProcIOPS,1) ' +
                     '| eval "Total IO (count)"=round (SumProcIOCount,0) ' +
                     '| eval "IO (MB/s)"=round (FuncProcIOMBPS,3) ' +
                     '| eval "Total IO (MB)"=round (SumProcIOMB,1) ' +
                     '| eval "Avg. IO latency (ms)"=round (SumProcIODurationMs/SumProcIOCount,1) ' +
                     '| eval "RAM (MB)"=round (FuncProcWorkingSetMB,0) ' +
                     '| eval "Net thruput (KB/s)"=round (FuncProcNetKBPS,1) ' +
                     '| eval "Avg. net latency (ms)"=round (SumNetTargetSendDurationMs/SumNetTargetSendLatencyCount,1) ' +
                     '| eval "Handle count"=round (FuncProcHandleCount,0) ' +
                     '| eval "Thread count"=round (FuncProcThreadCount,0) ' +
                     '| eval "RAM - Private (MB)"=round (FuncProcPrivateMB,0) ' +
                     '| eval "RAM - Virtual (MB)"=round (FuncProcVirtualSizeMB,0) ' +
                     '| eval "Page faults (per s)"=round (FuncProcPageFaults,0) ' +
                     '| eval "Page file (MB)"=round (FuncProcPageFileMB,0) ' +
                     '| eval "Process priority (latest)" = "n/a"' +
                     '| eval sortfield=lower (\'App name\') ' +
                     '| fields ' +
                        '"App name" ' +
                        '"Process name(s)" ' +
                        'sortfield ' +
                        '$FieldFilter$ ' +
                     '| sort limit=0 sortfield ' +
                     '| fields - sortfield ';
   }
   else
   {
      //
      // Process mode
      //
      SetToken (mvc, "ModeLower", gettext("process"));
      // Don't translate this, as it is used as a field in queries. Or translate all the fields in the queries too.
      SetToken (mvc, "ModeGroupByAs", "Process name");

      // Page title and description
      document.title = document.title.replace (regex, gettext("Process Performance "));
      if (easySplunkVersion >= 70300)
      {
         $('.dashboard-header > h1').text (gettext("Process Performance"));
      }
      else
      {
         $('.dashboard-header > h2').text (gettext("Process Performance"));
      }
      $('.dashboard-header > p.description').text (gettext("This dashboard displays detailed information about process performance."));

      // Build the search string
      searchCharts = '| pivot `uA_DM_Process_ProcessDetail` Process_ProcessDetail ' +
                        '$Panel11Function1$($Panel11Field1$) as "$Panel11Function1$($Panel11Field1$)" ' +
                        '$Panel12Function1$($Panel12Field1$) as "$Panel12Function1$($Panel12Field1$)" ' +
                        '$Panel21Function1$(ProcWorkingSetMB) as "$Panel21Function1$(ProcWorkingSetMB)" ' +
                        '$Panel22Function1$($Panel22Field1$) as "$Panel22Function1$($Panel22Field1$)" ' +
                        'splitrow ' +
                           'ProcName as "Process name" ' +
                        '$SearchFilter$';
                        
      searchTable =  '| pivot `uA_DM_Process_ProcessDetail` Process_ProcessDetail ' +
                           'sum(ProcCPUTimeS) AS SumProcCPUTimeS ' +
                           '$Panel31Function1$(ProcCPUPercent) AS FuncProcCPUPercent ' +
                           '$Panel31Function1$(ProcIOPS) AS FuncProcIOPS ' +
                           'sum(ProcIOCount) AS SumProcIOCount ' +
                           '$Panel31Function1$(ProcIOMBPS) AS FuncProcIOMBPS ' +
                           'sum(ProcIOMB) AS SumProcIOMB ' +
                           'sum(ProcIODurationMs) AS SumProcIODurationMs ' +
                           '$Panel31Function1$(ProcWorkingSetMB) as FuncProcWorkingSetMB ' +
                           '$Panel31Function1$(ProcNetKBPS) AS FuncProcNetKBPS ' +
                           'values(AppName) as "App name (s)" ' +
                           '$Panel31Function1$(ProcHandleCount) AS FuncProcHandleCount ' +
                           '$Panel31Function1$(ProcThreadCount) AS FuncProcThreadCount ' +
                           '$Panel31Function1$(ProcPrivateMB) AS FuncProcPrivateMB ' +
                           '$Panel31Function1$(ProcVirtualSizeMB) AS FuncProcVirtualSizeMB ' +
                           '$Panel31Function1$(ProcPageFaultsPS) AS FuncProcPageFaults ' +
                           '$Panel31Function1$(ProcPageFileMB) AS FuncProcPageFileMB ' +
                           'latest(ProcPriorityDisplayName) AS "Process priority (latest)" ' +
                        'splitrow ' +
                           'ProcName as "Process name" ' +
                        '$SearchFilter$ ' +
                     '| join ' +
                        'type=outer "Process name" ' +
                        '[ ' +
                           '| pivot `uA_DM_Process_NetworkTargetPerformance` Process_NetworkTargetPerformance ' +
                                 'sum(NetTargetSendLatencyCount) AS SumNetTargetSendLatencyCount ' +
                                 'sum(NetTargetSendDurationMs) AS SumNetTargetSendDurationMs ' +
                              'splitrow ' +
                                 'ProcName as "Process name" ' +
                              '$SearchFilter$ ' +
                           '| fields + ' +
                              '"Process name" ' +
                              'SumNetTargetSendLatencyCount ' +
                              'SumNetTargetSendDurationMs ' +
                        '] ' +
                     '| eval "Total CPU time (s)"=round (SumProcCPUTimeS,1) ' +
                     '| eval "CPU (%)"=round (FuncProcCPUPercent,1) ' +
                     '| eval "IOPS"=round (FuncProcIOPS,1) ' +
                     '| eval "Total IO (count)"=round (SumProcIOCount,0) ' +
                     '| eval "IO (MB/s)"=round (FuncProcIOMBPS,3) ' +
                     '| eval "Total IO (MB)"=round (SumProcIOMB,1) ' +
                     '| eval "Avg. IO latency (ms)"=round (SumProcIODurationMs/SumProcIOCount,1) ' +
                     '| eval "RAM (MB)"=round (FuncProcWorkingSetMB,0) ' +
                     '| eval "Net thruput (KB/s)"=round (FuncProcNetKBPS,1) ' +
                     '| eval "Avg. net latency (ms)"=round (SumNetTargetSendDurationMs/SumNetTargetSendLatencyCount,1) ' +
                     '| eval "Handle count"=round (FuncProcHandleCount,0) ' +
                     '| eval "Thread count"=round (FuncProcThreadCount,0) ' +
                     '| eval "RAM - Private (MB)"=round (FuncProcPrivateMB,0) ' +
                     '| eval "RAM - Virtual (MB)"=round (FuncProcVirtualSizeMB,0) ' +
                     '| eval "Page faults (per s)"=round (FuncProcPageFaults,0) ' +
                     '| eval "Page file (MB)"=round (FuncProcPageFileMB,0) ' +
                     '| eval sortfield=lower (\'Process name\') ' +
                     '| fields ' +
                        '"Process name" ' +
                        '"App name (s)" ' +
                           'sortfield ' +
                        '$FieldFilter$ ' +
                     '| sort limit=0 sortfield ' +
                     '| fields - sortfield ';
   }
                     
   // Update search managers
   var searchmgrCharts = mvc.Components.getInstance ("Search_Charts");
   searchmgrCharts.settings.unset ("search");
   searchmgrCharts.settings.set ("search", mvc.tokenSafe (searchCharts));
   var searchmgrTable = mvc.Components.getInstance ("Search_TablePanel31");
   searchmgrTable.settings.unset ("search");
   searchmgrTable.settings.set ("search", mvc.tokenSafe (searchTable));
   
   // Set click event handlers
   var chart11 = mvc.Components.getInstance ("Chart_Panel11");
   chart11.on ("click", drilldown)
   var chart12 = mvc.Components.getInstance ("Chart_Panel12");
   chart12.on ("click", drilldown)
   var chart21 = mvc.Components.getInstance ("Chart_Panel21");
   chart21.on ("click", drilldown)
   var chart22 = mvc.Components.getInstance ("Chart_Panel22");
   chart22.on ("click", drilldown)
   var table31 = mvc.Components.getInstance ("Table_Panel31");
   table31.on ("click:row", drilldown)

   //
   // Drilldown function
   //
   function drilldown (event)
   {
      event.preventDefault ();

      var earliest = GetToken (mvc, "earliest");
      var latest = GetToken (mvc, "latest");
      var mode = GetToken (mvc, "mode");
      if (mode == "app")
      {
         var drilldownUrl = "single_application_detail";
         drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
         drilldownUrl += "&latest=" + encodeURIComponent (latest);
         drilldownUrl += "&form.FilterField=" + encodeURIComponent ("sAppName");
         drilldownUrl += "&form.FilterOperator=" + encodeURIComponent ("in");
         drilldownUrl += "&form.FilterExpression=" + encodeURIComponent (event.data["click.value"]);
      }
      else
      {
         var drilldownUrl = "analyze_timechart";
         drilldownUrl += "?earliest=" + encodeURIComponent (earliest);
         drilldownUrl += "&latest=" + encodeURIComponent (latest);
         drilldownUrl += "&form.FilterDatamodel=" + encodeURIComponent ("Process_ProcessDetail");
         drilldownUrl += "&form.FilterField=" + encodeURIComponent ("sProcName");
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
