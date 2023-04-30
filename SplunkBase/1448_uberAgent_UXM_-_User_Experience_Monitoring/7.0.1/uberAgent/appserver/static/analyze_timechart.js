// RequireJS dependency handling
require (["jquery",
         "splunkjs/mvc",
         "splunkjs/mvc/simplexml/ready!"], function ($, mvc)
{
   // Get the default token model
   var defaultTokenModel = mvc.Components.get ("default");
   if (!defaultTokenModel)
   {
      console.log ("Error: default token model unavailable!");
      return;
   }
   
   // Bind event listener for future changes
   defaultTokenModel.on ("change:FilterDatamodel", HandleFilterDatamodelChange);
   
   // If we already have an initial value invoke the change event handler now, too
   if (defaultTokenModel.has ("FilterDatamodel"))
   {
      HandleFilterDatamodelChange (defaultTokenModel, defaultTokenModel.get ("FilterDatamodel"));
   }

   //
   // Handle data model change
   //
   function HandleFilterDatamodelChange (model, value)
   {
      //
      // Add the data model name to the page title
      //
      var datamodelInput = $("#Input_FilterDatamodel > div > input")[0];
      if (datamodelInput)
      {
         // Splunk pre 7.1
         var datamodelInputValue = datamodelInput.value;
         var optionLabel = $(datamodelInput).find ("option[value='" + datamodelInputValue + "']").text ();
      }
      else
      {
         // Splunk 7.1+
         try
         {
            var inputFilterDatamodel = mvc.Components.getInstance ("Input_FilterDatamodel");
            var optionValue = inputFilterDatamodel.val ();
            var optionLabel = inputFilterDatamodel.settings.get("choices").filter (function (obj) {return obj.value == optionValue})[0].label;
         }
         catch (e) {}
      }
      var easySplunkVersion = GetEasySplunkVersion (mvc);
      if (easySplunkVersion >= 70300)
      {
         var dashboardHeader = $('.dashboard-header > h1');
      }
      else
      {
         var dashboardHeader = $('.dashboard-header > h2');
      }
      if (dashboardHeader.length && optionLabel)
      {
         var hxtext = dashboardHeader.text ().split (":")[0];
         dashboardHeader.text (hxtext + ': ' + optionLabel);
      }

      // Create/check a global variable to track first execution
      if (typeof filterDatamodelFirstRun == "undefined")
      {
         filterDatamodelFirstRun = true;
      }
      else
      {
         filterDatamodelFirstRun = false;
      }

      // Root data model for filter field search
      var filterDatamodel = model.attributes['FilterDatamodel'];
      if (filterDatamodel == "Session_SessionDetail_Users" || filterDatamodel == "Session_SessionDetail_Session0")
      {
         SetToken (mvc, "FilterDatamodelRoot", "Session_SessionDetail");
         SetToken (mvc, "FilterDatamodelRootMacro", "`uA_DM_Session_SessionDetail`");
         SetToken (mvc, "ShowSessionScore", true);
      }
      else
      {
         SetToken (mvc, "FilterDatamodelRoot", filterDatamodel);
         SetToken (mvc, "FilterDatamodelRootMacro", "`uA_DM_" + filterDatamodel + "`");
         SetToken (mvc, "ShowSessionScore", undefined);
      }
      
      if (!filterDatamodelFirstRun)
      {
         // Provoke a new data model field search
         var searchFilterField = mvc.Components.getInstance ("Search_FilterField");
         searchFilterField.startSearch ();
         
         // Empty filter fields that depend on the data model -> force defaults
         SetToken (mvc, "form.FilterField", undefined);
         SetToken (mvc, "form.FilterExpression", undefined);
         for (i = 2; i <= MAX_FILTER_LEVELS; i++)
         {
            SetToken (mvc, "form.FilterField" + i, undefined);
            SetToken (mvc, "form.FilterExpression" + i, undefined);
         }
         SetToken (mvc, "form.Panel61Field1", undefined);
         SetToken (mvc, "form.Panel61Field2", undefined);
         
         // Instantiate a DashboardFilters object
         var dashboardFilters = new DashboardFilters ($, mvc);
         
         // Setup the filter fields
         dashboardFilters.SetupFilters (true);
      }
      
      //
      // Determine default fields
      //
      if (filterDatamodel == "Process_NetworkTargetPerformance")
      {
         var panel61Field1Default = "NetTargetSendMB";
         var panel61Field2Default = "NetTargetSendCount";
      }
      else if (filterDatamodel == "Process_ProcessDetail")
      {
         var panel61Field1Default = "ProcCPUPercent";
         var panel61Field2Default = "ProcWorkingSetMB";
      }
      else if (filterDatamodel == "Process_ProcessStartup")
      {
         var panel61Field1Default = "StartupTimeS";
         var panel61Field2Default = "StartupIOPS";
      }
      else if (filterDatamodel == "Application_BrowserPerformanceChrome")
      {
         var panel61Field1Default = "CPUPercent";
         var panel61Field2Default = "WorkingSetMB";
      }
      else if (filterDatamodel == "Application_BrowserPerformanceIE")
      {
         var panel61Field1Default = "CPUPercent";
         var panel61Field2Default = "WorkingSetMB";
      }
      else if (filterDatamodel == "Application_OutlookPluginLoad")
      {
         var panel61Field1Default = "BootTimeS";
         var panel61Field2Default = "BootTimeS";
      }
      else if (filterDatamodel == "Session_SessionDetail_Users" || filterDatamodel == "Session_SessionDetail_Session0")
      {
         var panel61Field1Default = "SessionCPUUsagePercent";
         var panel61Field2Default = "SessionWorkingSetMB";
      }
      else if (filterDatamodel == "System_SystemPerformanceSummary")
      {
         var panel61Field1Default = "CPUUsagePercent";
         var panel61Field2Default = "RAMUsagePercent";
      }
      else if (filterDatamodel == "System_GpuUsage")
      {
         var panel61Field1Default = "MemoryDedicatedMB";
         var panel61Field2Default = "MemorySharedMB";
      }
      else if (filterDatamodel == "System_SmbClient")
      {
         var panel61Field1Default = "IOMBRW";
         var panel61Field2Default = "IOLatencyMsRW";
      }

      //
      // Set defaults
      //
      var inputDatamodel = mvc.Components.getInstance ("Input_FilterDatamodel");
      try
      {
         inputDatamodel.settings.set ("default", filterDatamodel);
      }
      catch (e)
      {
         // Somethimes above command fails when called for the first time, but works when tried again...
         inputDatamodel.settings.set ("default", filterDatamodel);
      }
      var inputPanel61Field1 = mvc.Components.getInstance ("Input_Panel61Field1");
      inputPanel61Field1.settings.set ("default", panel61Field1Default);
      var inputPanel61Field2 = mvc.Components.getInstance ("Input_Panel61Field2");
      inputPanel61Field2.settings.set ("default", panel61Field2Default);
         
      //
      // Empty fields that depend on the data model
      //
      SetToken (mvc, "Single01Title", undefined);
      SetToken (mvc, "Single02Title", undefined);
      SetToken (mvc, "Single03Title", undefined);
      SetToken (mvc, "Single04Title", undefined);
      SetToken (mvc, "Single05Title", undefined);
      SetToken (mvc, "Single06Title", undefined);
      SetToken (mvc, "Single07Title", undefined);
      SetToken (mvc, "Single08Title", undefined);
      SetToken (mvc, "Single09Title", undefined);
      SetToken (mvc, "Single10Title", undefined);
      SetToken (mvc, "Single11Title", undefined);
      SetToken (mvc, "Single12Title", undefined);
      SetToken (mvc, "SingleRow2Header", undefined);
      SetToken (mvc, "Panel71Title", undefined);
      SetToken (mvc, "Panel81Title", undefined);
      SetToken (mvc, "Panel91Title", undefined);
      SetToken (mvc, "Panel101Title", undefined);
      SetToken (mvc, "Panel111Title", undefined);
      SetToken (mvc, "Panel121Title", undefined);
      SetToken (mvc, "Panel131Title", undefined);
      SetToken (mvc, "Panel141Title", undefined);
      
      // Customizations per data model
      if (filterDatamodel == "Process_NetworkTargetPerformance")
      {
         /////////////////////////////////////////////////
         //
         // Process_NetworkTargetPerformance
         //
         /////////////////////////////////////////////////

         // Build the dummy search string to prevent annotation errors in timecharts with no annotation base search enabled.
         var searchString;
         searchString = '| makeresults ';
                        
         // Update search manager
         var searchSessionConnectionChanges = mvc.Components.getInstance ("Search_SessionConnectionChanges");
         searchSessionConnectionChanges.settings.unset ("search");
         searchSessionConnectionChanges.settings.set ("search", mvc.tokenSafe (searchString));         
         
         //
         // Avg. send latency
         //

         // Panel title
         SetToken (mvc, "Panel71Title", "Avg. send latency");
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Process_NetworkTargetPerformance` Process_NetworkTargetPerformance ' +
                           'sum(NetTargetSendLatencyCount) as SumNetTargetSendLatencyCount ' +
                           'sum(NetTargetSendDurationMs) as SumNetTargetSendDurationMs ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoTimechart$ ' +
                           '$SearchFilter$ ' +
                        '| timechart ' +
                           '`uberAgent_dynamic_span` ' +
                           'eval(round(sum(SumNetTargetSendDurationMs)/sum(SumNetTargetSendLatencyCount),1)) as "Avg. send latency (ms)"';
                        
         // Update search manager
         var searchPanel71 = mvc.Components.getInstance ("Search_Panel71Chart");
         searchPanel71.settings.unset ("search");
         searchPanel71.settings.set ("search", mvc.tokenSafe (searchString));

         //
         // Data volume
         //

         // Panel title
         SetToken (mvc, "Panel81Title", gettext("Data volume"));
         
         // Chart options
         SetToken (mvc, "Panel81ChartStackMode", "stacked");
         
         // Build the search string
         searchString = '| pivot `uA_DM_Process_NetworkTargetPerformance` Process_NetworkTargetPerformance ' +
                           'sum(NetTargetSendMB) as SumNetTargetSendMB ' +
                           'sum(NetTargetReceiveMB) as SumNetTargetReceiveMB ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoTimechart$ ' +
                           '$SearchFilter$ ' +
                        '| timechart ' +
                           '`uberAgent_dynamic_span` ' +
                           'sum(SumNetTargetSendMB) as "Send volume (MB)" ' +
                           'sum(SumNetTargetReceiveMB) as "Receive volume (MB)"';
                        
         // Update search manager
         var searchPanel81 = mvc.Components.getInstance ("Search_Panel81Chart");
         searchPanel81.settings.unset ("search");
         searchPanel81.settings.set ("search", mvc.tokenSafe (searchString));
         
         //
         // Send, receive and connect counts
         //

         // Panel title
         SetToken (mvc, "Panel91Title", gettext("Send, receive and connect counts"));
         
         // Chart options
         SetToken (mvc, "Panel91ChartStackMode", "stacked");
         
         // Build the search string
         searchString = '| pivot `uA_DM_Process_NetworkTargetPerformance` Process_NetworkTargetPerformance ' +
                           'sum(NetTargetSendCount) as SumNetTargetSendCount ' +
                           'sum(NetTargetReceiveCount) as SumNetTargetReceiveCount ' +
                           'sum(NetTargetConnectCount) as SumNetTargetConnectCount ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoTimechart$ ' +
                           '$SearchFilter$ ' +
                        '| timechart ' +
                           '`uberAgent_dynamic_span` ' +
                           'sum(SumNetTargetSendCount) as "Send count" ' +
                           'sum(SumNetTargetReceiveCount) as "Receive count" ' +
                           'sum(SumNetTargetConnectCount) as "Connect count"';
                        
         // Update search manager
         var searchPanel91 = mvc.Components.getInstance ("Search_Panel91Chart");
         searchPanel91.settings.unset ("search");
         searchPanel91.settings.set ("search", mvc.tokenSafe (searchString));
      
         //
         // Target, host, process and user counts
         //

         // Panel title
         SetToken (mvc, "Panel101Title", "Target, host, process and user counts");
         
         // Build the search string
         searchString = '| pivot `uA_DM_Process_NetworkTargetPerformance` Process_NetworkTargetPerformance ' +
                           "dc(NetTargetRemoteNameAddressPort) as DcNetTargetRemoteNameAddressPort " +
                           "dc(host) as DcHost " +
                           "dc(ProcName) as DcProcName " +
                           "dc(ProcUser) as DcProcUser " +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoTimechart$ ' +
                           '$SearchFilter$ ' +
                        '| timechart ' +
                           '`uberAgent_dynamic_span` ' +
                           'latest(DcNetTargetRemoteNameAddressPort) as "Target count" ' +
                           'latest(DcHost) as "Host count" ' +
                           'latest(DcProcName) as "Process count" ' +
                           'latest(DcProcUser) as "User count"';
                        
         // Update search manager
         var searchPanel101 = mvc.Components.getInstance ("Search_Panel101Chart");
         searchPanel101.settings.unset ("search");
         searchPanel101.settings.set ("search", mvc.tokenSafe (searchString));
      }
      else if (filterDatamodel == "Process_ProcessDetail")
      {
         /////////////////////////////////////////////////
         //
         // Process_ProcessDetail
         //
         /////////////////////////////////////////////////

         // Build the dummy search string to prevent annotation errors in timecharts with no annotation base search enabled.
         var searchString;
         searchString = '| makeresults ';
                        
         // Update search manager
         var searchSessionConnectionChanges = mvc.Components.getInstance ("Search_SessionConnectionChanges");
         searchSessionConnectionChanges.settings.unset ("search");
         searchSessionConnectionChanges.settings.set ("search", mvc.tokenSafe (searchString));
         
         //
         // Total CPU time
         //

         // Panel title
         SetToken (mvc, "Panel71Title", "Total CPU time");
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Process_ProcessDetail` Process_ProcessDetail ' +
                           'sum(ProcCPUTimeS) as SumProcCPUTimeS ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoTimechart$ ' +
                           '$SearchFilter$ ' +
                        '| timechart ' +
                           '`uberAgent_dynamic_span` ' +
                           'sum(SumProcCPUTimeS) as "Total CPU time (s)"';
                        
         // Update search manager
         var searchPanel71 = mvc.Components.getInstance ("Search_Panel71Chart");
         searchPanel71.settings.unset ("search");
         searchPanel71.settings.set ("search", mvc.tokenSafe (searchString));
         
         //
         // Avg. disk latency
         //

         // Panel title
         SetToken (mvc, "Panel81Title", "Avg. disk latency");
         
         // Chart options
         SetToken (mvc, "Panel81ChartStackMode", "stacked");
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Process_ProcessDetail` Process_ProcessDetail ' +
                           'sum(ProcIODurationReadMs) as SumProcIODurationReadMs ' +
                           'sum(ProcIODurationWriteMs) as SumProcIODurationWriteMs ' +
                           'sum(ProcIOReadCount) as SumProcIOReadCount ' +
                           'sum(ProcIOWriteCount) as SumProcIOWriteCount ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoTimechart$ ' +
                           '$SearchFilter$ ' +
                        '| timechart ' +
                           '`uberAgent_dynamic_span` ' +
                           'eval(sum(SumProcIODurationReadMs)/sum(SumProcIOReadCount)) as "Avg. read latency (ms)" ' +
                           'eval(sum(SumProcIODurationWriteMs)/sum(SumProcIOWriteCount)) as "Avg. write latency (ms)"';
                        
         // Update search manager
         var searchPanel81 = mvc.Components.getInstance ("Search_Panel81Chart");
         searchPanel81.settings.unset ("search");
         searchPanel81.settings.set ("search", mvc.tokenSafe (searchString));
         
         //
         // Avg. disk IOPS
         //

         // Panel title
         SetToken (mvc, "Panel91Title", gettext("Avg. disk IOPS"));
         
         // Chart options
         SetToken (mvc, "Panel91ChartStackMode", "stacked");
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Process_ProcessDetail` Process_ProcessDetail ' +
                           'avg(ProcIOPSRead) as AvgProcIOPSRead ' +
                           'avg(ProcIOPSWrite) as AvgProcIOPSWrite ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoSolo$ ' +
                           '$SearchFilter$ ';
                        
         // Update search manager
         var searchPanel91 = mvc.Components.getInstance ("Search_Panel91Chart");
         searchPanel91.settings.unset ("search");
         searchPanel91.settings.set ("search", mvc.tokenSafe (searchString));
         
         //
         // Avg. disk volume
         //

         // Panel title
         SetToken (mvc, "Panel101Title", gettext("Avg. disk volume"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Process_ProcessDetail` Process_ProcessDetail ' +
                           'avg(ProcIOReadMB) as AvgProcIOReadMB ' +
                           'avg(ProcIOWriteMB) as AvgProcIOWriteMB ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoSolo$ ' +
                           '$SearchFilter$ ';
                        
         // Update search manager
         var searchPanel101 = mvc.Components.getInstance ("Search_Panel101Chart");
         searchPanel101.settings.unset ("search");
         searchPanel101.settings.set ("search", mvc.tokenSafe (searchString));
            
         //
         // Avg. network
         //

         // Panel title
         SetToken (mvc, "Panel111Title", gettext("Avg. network thruput"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Process_ProcessDetail` Process_ProcessDetail ' +
                           'avg(ProcNetKBPS) as AvgProcNetKBPS ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoSolo$ ' +
                           '$SearchFilter$ ';
                        
         // Update search manager
         var searchPanel111 = mvc.Components.getInstance ("Search_Panel111Chart");
         searchPanel111.settings.unset ("search");
         searchPanel111.settings.set ("search", mvc.tokenSafe (searchString));

         //
         // Data table
         //

         // Panel title
         SetToken (mvc, "Panel121Title", gettext("Process list"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Process_ProcessDetail` Process_ProcessDetail ' +
                           'latest(AppName) as "App name" ' +
                           'latest(AppVersion) as "App version" ' +
                           'latest(ProcCmdline) as "Command line" ' +
                           'earliest(_time) as FirstSeen ' +
                           'latest(_time) as LastSeen ' +
                           '$SearchFilter$ ' +
                           'splitrow ProcName as "Process name" ' +
                           'splitrow ProcID as "Process ID" ' +
                           'splitrow host as Host ' +
                           'splitrow ProcUser as "User name" ' +
                        '| eval "First seen"=strftime (strptime (FirstSeen, "%Y-%m-%dT%H:%M:%S.%Q%z"), "%Y-%m-%d %H:%M:%S") ' +
                        '| eval "Last seen"=strftime (strptime (LastSeen, "%Y-%m-%dT%H:%M:%S.%Q%z"), "%Y-%m-%d %H:%M:%S") ' +
                        '| table ' +
                           '"First seen" ' +
                           '"Last seen" ' +
                           '"Host" ' +
                           '"Process name" ' +
                           '"Process ID" ' +
                           '"App name" ' +
                           '"App version" ' +
                           '"User name" ' +
                           '"Command line" ' +
                        '| sort -"Last seen" ';
                        
         // Update search manager
         var searchPanel121 = mvc.Components.getInstance ("Search_Panel121Table");
         searchPanel121.settings.unset ("search");
         searchPanel121.settings.set ("search", mvc.tokenSafe (searchString));
      }
      else if (filterDatamodel == "Process_ProcessStartup")
      {
         /////////////////////////////////////////////////
         //
         // Process_ProcessStartup
         //
         /////////////////////////////////////////////////

         // Build the dummy search string to prevent annotation errors in timecharts with no annotation base search enabled.
         var searchString;
         searchString = '| makeresults ';
                        
         // Update search manager
         var searchSessionConnectionChanges = mvc.Components.getInstance ("Search_SessionConnectionChanges");
         searchSessionConnectionChanges.settings.unset ("search");
         searchSessionConnectionChanges.settings.set ("search", mvc.tokenSafe (searchString));

         //
         // Startup IO count
         //

         // Panel title
         SetToken (mvc, "Panel81Title", gettext("Startup IO count"));
         
         // Chart options
         SetToken (mvc, "Panel81ChartStackMode", "stacked");
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Process_ProcessStartup` Process_ProcessStartup ' +
                           'sum(StartupIOCount) as SumStartupIOCount ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoTimechart$ ' +
                           '$SearchFilter$ ' +
                        '| timechart ' +
                           '`uberAgent_dynamic_span` ' +
                           'sum(SumStartupIOCount) as "IO count"';
                        
         // Update search manager
         var searchPanel81 = mvc.Components.getInstance ("Search_Panel81Chart");
         searchPanel81.settings.unset ("search");
         searchPanel81.settings.set ("search", mvc.tokenSafe (searchString));
         
         //
         // Startup count
         //

         // Panel title
         SetToken (mvc, "Panel71Title", gettext("Startup count"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Process_ProcessStartup` Process_ProcessStartup ' +
                           'count(StartupTimeS) as Count ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoTimechart$ ' +
                           '$SearchFilter$ ' +
                        '| timechart ' +
                           '`uberAgent_dynamic_span` ' +
                           'sum(Count) as "Startup count"';
                        
         // Update search manager
         var searchPanel71 = mvc.Components.getInstance ("Search_Panel71Chart");
         searchPanel71.settings.unset ("search");
         searchPanel71.settings.set ("search", mvc.tokenSafe (searchString));

         //
         // Data table
         //

         // Panel title
         SetToken (mvc, "Panel121Title", gettext("Process startup list"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Process_ProcessStartup` Process_ProcessStartup ' +
                           'latest(AppName) as "App name" ' +
                           'latest(StartupIOCount) as "Startup IO count" ' +
                           'latest(_time) as StartTime ' +
                           '$SearchFilter$ ' +
                           'splitrow ProcName as "Process name" ' +
                           'splitrow StartupTimeS ' +
                           'splitrow host as Host ' +
                           'splitrow ProcUser as "User name" ' +
                        '| eval "Start time"=strftime (strptime (StartTime, "%Y-%m-%dT%H:%M:%S.%Q%z"), "%Y-%m-%d %H:%M:%S") ' +
                        '| eval "Startup duration (s)" = round (StartupTimeS, 2) ' +
                        '| table ' +
                           '"Start time" ' +
                           '"Host" ' +
                           '"Process name" ' +
                           '"App name" ' +
                           '"User name" ' +
                           '"Startup duration (s)" ' +
                           '"Startup IO count" ' +
                        '| sort -"Start time" ';
                        
         // Update search manager
         var searchPanel121 = mvc.Components.getInstance ("Search_Panel121Table");
         searchPanel121.settings.unset ("search");
         searchPanel121.settings.set ("search", mvc.tokenSafe (searchString));
      }
      else if (filterDatamodel == "Application_BrowserPerformanceChrome")
      {
         /////////////////////////////////////////////////
         //
         // Application_BrowserPerformanceChrome
         //
         /////////////////////////////////////////////////

         // Build the dummy search string to prevent annotation errors in timecharts with no annotation base search enabled.
         var searchString;
         searchString = '| makeresults ';
                        
         // Update search manager
         var searchSessionConnectionChanges = mvc.Components.getInstance ("Search_SessionConnectionChanges");
         searchSessionConnectionChanges.settings.unset ("search");
         searchSessionConnectionChanges.settings.set ("search", mvc.tokenSafe (searchString));

         //
         // Total CPU time
         //

         // Panel title
         SetToken (mvc, "Panel71Title", gettext("Total CPU time"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Application_BrowserPerformanceChrome` Application_BrowserPerformanceChrome ' +
                           'sum(CPUTimeS) as SumCPUTimeS ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoTimechart$ ' +
                           '$SearchFilter$ ' +
                        '| timechart ' +
                           '`uberAgent_dynamic_span` ' +
                           'sum(SumCPUTimeS) as "Total CPU time (s)"';
                        
         // Update search manager
         var searchPanel71 = mvc.Components.getInstance ("Search_Panel71Chart");
         searchPanel71.settings.unset ("search");
         searchPanel71.settings.set ("search", mvc.tokenSafe (searchString));
         
         //
         // Avg. disk latency
         //

         // Panel title
         SetToken (mvc, "Panel81Title", gettext("Avg. disk latency"));
         
         // Chart options
         SetToken (mvc, "Panel81ChartStackMode", "stacked");
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Application_BrowserPerformanceChrome` Application_BrowserPerformanceChrome ' +
                           'sum(IODurationMs) as SumIODurationMs ' +
                           'sum(IOCount) as SumIOCount ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoTimechart$ ' +
                           '$SearchFilter$ ' +
                        '| timechart ' +
                           '`uberAgent_dynamic_span` ' +
                           'eval(sum(SumIODurationMs)/sum(SumIOCount)) as "Avg. IO latency (ms)"';
                        
         // Update search manager
         var searchPanel81 = mvc.Components.getInstance ("Search_Panel81Chart");
         searchPanel81.settings.unset ("search");
         searchPanel81.settings.set ("search", mvc.tokenSafe (searchString));
         
         //
         // Avg. disk IOPS
         //

         // Panel title
         SetToken (mvc, "Panel91Title", gettext("Avg. disk IOPS"));
         
         // Chart options
         SetToken (mvc, "Panel91ChartStackMode", "stacked");
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Application_BrowserPerformanceChrome` Application_BrowserPerformanceChrome ' +
                           'avg(IOPS) as AvgIOPS ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoSolo$ ' +
                           '$SearchFilter$ ';
                        
         // Update search manager
         var searchPanel91 = mvc.Components.getInstance ("Search_Panel91Chart");
         searchPanel91.settings.unset ("search");
         searchPanel91.settings.set ("search", mvc.tokenSafe (searchString));
         
         //
         // Avg. disk volume
         //

         // Panel title
         SetToken (mvc, "Panel101Title", gettext("Avg. disk volume"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Application_BrowserPerformanceChrome` Application_BrowserPerformanceChrome ' +
                           'avg(IOMB) as AvgIOMB ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoSolo$ ' +
                           '$SearchFilter$ ';
                        
         // Update search manager
         var searchPanel101 = mvc.Components.getInstance ("Search_Panel101Chart");
         searchPanel101.settings.unset ("search");
         searchPanel101.settings.set ("search", mvc.tokenSafe (searchString));
            
         //
         // Avg. network
         //

         // Panel title
         SetToken (mvc, "Panel111Title", gettext("Avg. network thruput"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Application_BrowserPerformanceChrome` Application_BrowserPerformanceChrome ' +
                           'avg(NetKBPS) as AvgNetKBPS ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoSolo$ ' +
                           '$SearchFilter$ ';
                        
         // Update search manager
         var searchPanel111 = mvc.Components.getInstance ("Search_Panel111Chart");
         searchPanel111.settings.unset ("search");
         searchPanel111.settings.set ("search", mvc.tokenSafe (searchString));
      }
      else if (filterDatamodel == "Application_BrowserPerformanceIE")
      {
         /////////////////////////////////////////////////
         //
         // Application_BrowserPerformanceIE
         //
         /////////////////////////////////////////////////

         // Build the dummy search string to prevent annotation errors in timecharts with no annotation base search enabled.
         var searchString;
         searchString = '| makeresults ';
                        
         // Update search manager
         var searchSessionConnectionChanges = mvc.Components.getInstance ("Search_SessionConnectionChanges");
         searchSessionConnectionChanges.settings.unset ("search");
         searchSessionConnectionChanges.settings.set ("search", mvc.tokenSafe (searchString));         

         //
         // Total CPU time
         //

         // Panel title
         SetToken (mvc, "Panel71Title", gettext("Total CPU time"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Application_BrowserPerformanceIE` Application_BrowserPerformanceIE ' +
                           'sum(CPUTimeS) as SumCPUTimeS ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoTimechart$ ' +
                           '$SearchFilter$ ' +
                        '| timechart ' +
                           '`uberAgent_dynamic_span` ' +
                           'sum(SumCPUTimeS) as "Total CPU time (s)"';
                        
         // Update search manager
         var searchPanel71 = mvc.Components.getInstance ("Search_Panel71Chart");
         searchPanel71.settings.unset ("search");
         searchPanel71.settings.set ("search", mvc.tokenSafe (searchString));
         
         //
         // Avg. disk latency
         //

         // Panel title
         SetToken (mvc, "Panel81Title", gettext("Avg. disk latency"));
         
         // Chart options
         SetToken (mvc, "Panel81ChartStackMode", "stacked");
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Application_BrowserPerformanceIE` Application_BrowserPerformanceIE ' +
                           'sum(IODurationMs) as SumIODurationMs ' +
                           'sum(IOCount) as SumIOCount ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoTimechart$ ' +
                           '$SearchFilter$ ' +
                        '| timechart ' +
                           '`uberAgent_dynamic_span` ' +
                           'eval(sum(SumIODurationMs)/sum(SumIOCount)) as "Avg. IO latency (ms)"';
                        
         // Update search manager
         var searchPanel81 = mvc.Components.getInstance ("Search_Panel81Chart");
         searchPanel81.settings.unset ("search");
         searchPanel81.settings.set ("search", mvc.tokenSafe (searchString));
         
         //
         // Avg. disk IOPS
         //

         // Panel title
         SetToken (mvc, "Panel91Title", gettext("Avg. disk IOPS"));
         
         // Chart options
         SetToken (mvc, "Panel91ChartStackMode", "stacked");
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Application_BrowserPerformanceIE` Application_BrowserPerformanceIE ' +
                           'avg(IOPS) as AvgIOPS ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoSolo$ ' +
                           '$SearchFilter$ ';
                        
         // Update search manager
         var searchPanel91 = mvc.Components.getInstance ("Search_Panel91Chart");
         searchPanel91.settings.unset ("search");
         searchPanel91.settings.set ("search", mvc.tokenSafe (searchString));
         
         //
         // Avg. disk volume
         //

         // Panel title
         SetToken (mvc, "Panel101Title", gettext("Avg. disk volume"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Application_BrowserPerformanceIE` Application_BrowserPerformanceIE ' +
                           'avg(IOMB) as AvgIOMB ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoSolo$ ' +
                           '$SearchFilter$ ';
                        
         // Update search manager
         var searchPanel101 = mvc.Components.getInstance ("Search_Panel101Chart");
         searchPanel101.settings.unset ("search");
         searchPanel101.settings.set ("search", mvc.tokenSafe (searchString));
            
         //
         // Avg. network
         //

         // Panel title
         SetToken (mvc, "Panel111Title", gettext("Avg. network thruput"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Application_BrowserPerformanceIE` Application_BrowserPerformanceIE ' +
                           'avg(NetKBPS) as AvgNetKBPS ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoSolo$ ' +
                           '$SearchFilter$ ';
                        
         // Update search manager
         var searchPanel111 = mvc.Components.getInstance ("Search_Panel111Chart");
         searchPanel111.settings.unset ("search");
         searchPanel111.settings.set ("search", mvc.tokenSafe (searchString));
      }
      else if (filterDatamodel == "Application_OutlookPluginLoad")
      {
         /////////////////////////////////////////////////
         //
         // Application_OutlookPluginLoad
         //
         /////////////////////////////////////////////////

         // Build the dummy search string to prevent annotation errors in timecharts with no annotation base search enabled.
         var searchString;
         searchString = '| makeresults ';
                        
         // Update search manager
         var searchSessionConnectionChanges = mvc.Components.getInstance ("Search_SessionConnectionChanges");
         searchSessionConnectionChanges.settings.unset ("search");
         searchSessionConnectionChanges.settings.set ("search", mvc.tokenSafe (searchString));

         //
         // Load duration
         //

         // Panel title
         SetToken (mvc, "Panel71Title", gettext("Total load duration (s)"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Application_OutlookPluginLoad` Application_OutlookPluginLoad ' +
                           'sum(BootTimeS) as SumBootTimeS ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoTimechart$ ' +
                           '$SearchFilter$ ' +
                        '| timechart ' +
                           '`uberAgent_dynamic_span` ' +
                           'sum(SumBootTimeS) as "Total load duration"';
                        
         // Update search manager
         var searchPanel71 = mvc.Components.getInstance ("Search_Panel71Chart");
         searchPanel71.settings.unset ("search");
         searchPanel71.settings.set ("search", mvc.tokenSafe (searchString));         
      }
      else if (filterDatamodel == "Session_SessionDetail_Users")
      {
         /////////////////////////////////////////////////
         //
         // Session_SessionDetail_Users
         //
         /////////////////////////////////////////////////

         //
         // Single values
         //
         
         SetToken (mvc, "Single01Title", "Host");
         SetToken (mvc, "Single01Field", "Host");
         SetToken (mvc, "Single02Title", "User");
         SetToken (mvc, "Single02Field", "User");
         SetToken (mvc, "Single03Title", "Session ID");
         SetToken (mvc, "Single03Field", "ID");
         SetToken (mvc, "Single04Title", "Logon");
         SetToken (mvc, "Single04Field", "LogonTime");
         SetToken (mvc, "Single05Title", gettext("Last seen"));
         SetToken (mvc, "Single05Field", "LastSeen");
         SetToken (mvc, "Single06Title", "Client name");
         SetToken (mvc, "Single06Field", "SessionClientName");
         SetToken (mvc, "Single07Title", gettext("Client IP"));
         SetToken (mvc, "Single07Field", "SessionClientIp");
         SetToken (mvc, "Single08Title", gettext("Client platform"));
         SetToken (mvc, "Single08Field", "SessionClientPlatform");
         SetToken (mvc, "Single09Title", gettext("Client version"));
         SetToken (mvc, "Single09Field", "SessionClientVersion");
         SetToken (mvc, "Single10Title", gettext("Published apps"));
         SetToken (mvc, "Single10Field", "SessionPublishedAppsCtx");
         SetToken (mvc, "Single11Title", gettext("Encryption"));
         SetToken (mvc, "Single11Field", "SessionEncryptionCtx");
         SetToken (mvc, "Single12Title", gettext("Client display"));
         SetToken (mvc, "Single12Field", "SessionDisplaySpecs");
         SetToken (mvc, "SingleRow2Header", gettext("Remoting protocol information (last seen values)"));

         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Session_SessionDetail_Users` Session_SessionDetail_Users ' +
                           'latest(host) as Host ' +
                           'latest(SessionUser) as User ' +
                           'latest(SessionID) as ID ' +
                           'latest(SessionLogonTime) as SessionLogonTime ' +
                           'latest(_time) as LastSeen ' +
                           'latest(SessionDisplaySpecs) as SessionDisplaySpecs ' +
                           'latest(SessionPublishedAppsCtx) as SessionPublishedAppsCtx ' +
                           'latest(SessionClientName) as SessionClientName ' +
                           'latest(SessionClientIp) as SessionClientIp ' +
                           'latest(SessionClientPlatform) as SessionClientPlatform ' +
                           'latest(SessionClientVersion) as SessionClientVersion ' +
                           'latest(SessionEncryptionCtx) as SessionEncryptionCtx ' +
                           'values(SessionProtocol) as SessionProtocols ' +
                           '$SearchFilter$ ' +
                        '| eval LastSeen=strftime (strptime (LastSeen, "%Y-%m-%dT%H:%M:%S.%Q%z"), "%Y-%m-%d %H:%M:%S") ' +
                        '| eval LogonTime=strftime (strptime (SessionLogonTime,"%Y-%m-%d %H:%M:%S.%Q %z"), "%Y-%m-%d %H:%M:%S") ' +
                        '| eval SessionProtocols = if(SessionProtocols=="ICA",1,0) ' +
                        '| rex field=SessionPublishedAppsCtx mode=sed "s/;/, /g" ';
                        
         // Update search manager
         var searchSingle = mvc.Components.getInstance ("Search_Single");
         searchSingle.settings.unset ("search");
         searchSingle.settings.set ("search", mvc.tokenSafe (searchString));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Session_SessionDetail_Users` Session_SessionDetail_Users ' +
                           'latest(_time) as Time ' +
                           'latest(SessionClientName) as latestSessionClientName ' +
                           'latest(SessionClientIp) as latestSessionClientIp ' +
                           'latest(SessionClientPlatform) as latestSessionClientPlatform ' +
                           'latest(SessionClientVersion) as latestSessionClientVersion ' +
                           'latest(SessionConnectionState) as latestSessionConnectionState ' +
                           'splitrow ' +
                              '_time period minute ' +
                           '$SearchFilter$ ' +
                        '| where latestSessionConnectionState="active" OR (isnull(latestSessionClientName) AND isnull(latestSessionClientIp) AND isnull(latestSessionClientPlatform) AND isnull(latestSessionClientVersion)) ' +
                        '| filldown latest* ' +
                        '| streamstats current=f window=1 global=f ' +
                           'last(latestSessionClientPlatform) as last_latestSessionClientPlatform ' +
                           'last(latestSessionClientVersion) as last_latestSessionClientVersion ' +
                           'last(latestSessionClientIp) as last_latestSessionClientIp ' +
                           'last(latestSessionClientName) as last_latestSessionClientName ' +
                           'last(latestSessionConnectionState) as last_latestSessionConnectionState ' +
                        '| eval Time = strftime(strptime(Time, "%Y-%m-%dT%H:%M:%S.%Q%z"), "%Y-%m-%d %H:%M:%S") ' +
                        '| eval Event1 = if(latestSessionClientName!=last_latestSessionClientName,"Client name change;","") ' +
                        '| eval Event2 = if(latestSessionClientIp!=last_latestSessionClientIp,"Client IP change;","") ' +
                        '| eval Event3 = if(latestSessionClientPlatform!=last_latestSessionClientPlatform,"Client platform change;","") ' +
                        '| eval Event4 = if(latestSessionClientVersion!=last_latestSessionClientVersion,"Client version change;","") ' +
                        '| eval Event5 = if(latestSessionConnectionState!=last_latestSessionConnectionState,"Connection state change;","") ' +
                        '| strcat Event1 Event2 Event3 Event4 Event5 SessionEvent ' +
                        '| where SessionEvent!="" ' +
                        '| makemv SessionEvent delim=";" ' +
                        '| append ' +
                           '[ ' +
                              '| pivot `uA_DM_Logon_LogonDetail` Logon_LogonDetail ' +
                                 'earliest(SessionLogonTime) as SessionLogonTime ' +
                                 '$SearchFilter$ ' +
                              '| join type=left SessionGUID ' +
                                 '[ ' +
                                    '| pivot `uA_DM_Session_SessionDetail_Users` Session_SessionDetail_Users ' +
                                       'earliest(SessionClientName) as latestSessionClientName ' +
                                       'earliest(SessionClientIp) as latestSessionClientIp ' +
                                       'earliest(SessionClientPlatform) as latestSessionClientPlatform ' +
                                       'earliest(SessionClientVersion) as latestSessionClientVersion ' +
                                       'earliest(SessionConnectionState) as latestSessionConnectionState ' +
                                       '$SearchFilter$ ' +
                                    '] ' +
                              '| eval "SessionEvent" = "Session logon" ' +
                              '| eval Time = strftime(strptime(SessionLogonTime,"%Y-%m-%d %H:%M:%S.%Q %z"), "%Y-%m-%d %H:%M:%S") ' +
                              '| fields + Time SessionGUID latestSessionClientName latestSessionClientIp latestSessionClientPlatform latestSessionClientVersion latestSessionConnectionState "SessionEvent" ' +
                           '] ' +
                        '| append ' +
                           '[ ' +
                              '| pivot `uA_DM_Logoff_LogoffDetail` Logoff_LogoffDetail ' +
                                 'latest(SessionEndTime) as SessionEndTime ' +
                                 '$SearchFilter$ ' +
                              '| join type=left SessionGUID ' +
                                 '[ ' +
                                    '| pivot `uA_DM_Session_SessionDetail_Users` Session_SessionDetail_Users ' +
                                       'latest(SessionClientName) as latestSessionClientName ' +
                                       'latest(SessionClientIp) as latestSessionClientIp ' +
                                       'latest(SessionClientPlatform) as latestSessionClientPlatform ' +
                                       'latest(SessionClientVersion) as latestSessionClientVersion ' +
                                       'latest(SessionConnectionState) as latestSessionConnectionState ' +
                                       '$SearchFilter$ ' +
                                    '] ' +
                              '| eval "SessionEvent" = "Session logoff" ' +
                              '| eval Time = strftime(strptime(SessionEndTime,"%Y-%m-%d %H:%M:%S.%Q %z"), "%Y-%m-%d %H:%M:%S") ' +
                              '| fields + Time SessionGUID latestSessionClientName latestSessionClientIp latestSessionClientPlatform latestSessionClientVersion latestSessionConnectionState "SessionEvent" ' +
                           '] ' +
                        '| rename latestSessionClientName as "Client name" ' +
                        '| rename latestSessionClientIp as "Client IP" ' +
                        '| rename latestSessionClientPlatform as "Client platform" ' +
                        '| rename latestSessionClientVersion as "Client version" ' +
                        '| rename latestSessionConnectionState as "Connection state" ' +
                        '| rename SessionEvent as "Session change(s)" ' +
                        '| sort - Time ' +
                        '| table Time "Session change(s)" "Client name" "Client IP" "Client platform" "Client version" "Connection state" ';
                        
         // Update search manager
         var searchSessionConnectionChanges = mvc.Components.getInstance ("Search_SessionConnectionChanges");
         searchSessionConnectionChanges.settings.unset ("search");
         searchSessionConnectionChanges.settings.set ("search", mvc.tokenSafe (searchString));


         //
         // Avg. disk latency
         //

         // Panel title
         SetToken (mvc, "Panel71Title", gettext("Avg. disk latency"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Session_SessionDetail_Users` Session_SessionDetail_Users ' +
                           'sum(SessionIODurationMs) as SumSessionIODurationMs ' +
                           'sum(SessionIOCount) as SumSessionIOCount ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoTimechart$ ' +
                           '$SearchFilter$ ' +
                        '| timechart ' +
                           '`uberAgent_dynamic_span` ' +
                           'eval(sum(SumSessionIODurationMs)/sum(SumSessionIOCount)) as "Avg. IO latency (ms)"';
                        
         // Update search manager
         var searchPanel71 = mvc.Components.getInstance ("Search_Panel71Chart");
         searchPanel71.settings.unset ("search");
         searchPanel71.settings.set ("search", mvc.tokenSafe (searchString));
   
         //
         // Session connection state over time
         //

         // Panel title
         SetToken (mvc, "Panel81Title", gettext("Session connection state over time"));
         
         // Chart options
         SetToken (mvc, "Panel81ChartStackMode", "stacked100");
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Session_SessionDetail_Users` Session_SessionDetail_Users ' +
                           'count(Session_SessionDetail_Users) as Dummy ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoSolo$ ' +
                           'splitcol SessionConnectionState ' +
                           '$SearchFilter$ ';
                        
         // Update search manager
         var searchPanel81 = mvc.Components.getInstance ("Search_Panel81Chart");
         searchPanel81.settings.unset ("search");
         searchPanel81.settings.set ("search", mvc.tokenSafe (searchString));
   
         //
         // Published application usage over time (Citrix only)
         //

         // Panel title
         SetToken (mvc, "Panel91Title", gettext("Published application usage over time"));

         // Chart options
         SetToken (mvc, "Panel91ChartStackMode", "stacked100");
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Session_SessionDetail_Users` Session_SessionDetail_Users ' +
                           'count(Session_SessionDetail_Users) as Dummy ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoSolo$ ' +
                           'splitcol SessionPublishedAppsCtxSplitLower ' +
                           '$SearchFilter$ ' +
                        '| fields - NULL OTHER ';
                        
         // Update search manager
         var searchPanel91 = mvc.Components.getInstance ("Search_Panel91Chart");
         searchPanel91.settings.unset ("search");
         searchPanel91.settings.set ("search", mvc.tokenSafe (searchString));
   
         //
         // Remoting protocol latency over time (Citrix only)
         //

         // Panel title
         SetToken (mvc, "Panel111Title", gettext("Remoting protocol latency and round-trip time over time"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Session_SessionDetail_Users` Session_SessionDetail_Users ' +
                           'avg(SessionRpLatencyMs) as AvgSessionRpLatencyMs ' +
                           'avg(SessionRoundTripTimeMs) as AvgSessionRoundTripTimeMs ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoSolo$ ' +
                           '$SearchFilter$ ' +
                        '| eval "Avg. protocol latency (ms)" = round (AvgSessionRpLatencyMs,1) ' +
                        '| eval "Avg. round-trip time (ms)" = round (AvgSessionRoundTripTimeMs,1) ' +
                        '| fields _time "Avg. protocol latency (ms)" "Avg. round-trip time (ms)"';
                        
         // Update search manager
         var searchPanel111 = mvc.Components.getInstance ("Search_Panel111Chart");
         searchPanel111.settings.unset ("search");
         searchPanel111.settings.set ("search", mvc.tokenSafe (searchString));

         //
         // Virtual channel data volume over time (Citrix only)
         //

         // Panel title
         SetToken (mvc, "Panel131Title", gettext("Virtual channel data volume (MB) over time"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_CitrixSession_VirtualChannelDetail` CitrixSession_VirtualChannelDetail ' +
                           'sum(VirtualChannelDataVolumeInputOutputMB) as SumVirtualChannelDataVolumeInputOutputMB ' +
                           'splitrow ' +
                              'VirtualChannel ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoTimechart$ ' +
                           '$SearchFilter$ ' + 
                           '| eval SumVirtualChannelDataVolumeInputOutputMB = round(SumVirtualChannelDataVolumeInputOutputMB,1) ' +
                           '| where SumVirtualChannelDataVolumeInputOutputMB > 0 ' + 
                           '| timechart ' +
                              '`uberAgent_dynamic_span` ' +
                              'sum(SumVirtualChannelDataVolumeInputOutputMB) as "Data volume (MB)" ' +
                                 'by VirtualChannel ';
                        
         // Update search manager
         var searchPanel131 = mvc.Components.getInstance ("Search_Panel131Chart");
         searchPanel131.settings.unset ("search");
         searchPanel131.settings.set ("search", mvc.tokenSafe (searchString));

         //
         // Session FPS over time (Citrix only)
         //

         // Panel title
         SetToken (mvc, "Panel141Title", gettext("Session FPS over time"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Session_SessionDetail_Users` Session_SessionDetail_Users ' +
                           'avg(SessionFps) as AvgSessionFps ' +
                           'splitrow ' +
                              '_time ' +
                           'period $PivotPeriodAutoTimechart$ ' +
                           '$SearchFilter$ ' +  
                        '| timechart ' +
                           '`uberAgent_dynamic_span` ' +
                           'eval(round(avg(AvgSessionFps),0)) as "Avg. session FPS" ';
                        
         // Update search manager
         var searchPanel141 = mvc.Components.getInstance ("Search_Panel141Chart");
         searchPanel141.settings.unset ("search");
         searchPanel141.settings.set ("search", mvc.tokenSafe (searchString));
      }
      else if (filterDatamodel == "Session_SessionDetail_Session0")
      {
         /////////////////////////////////////////////////
         //
         // Session_SessionDetail_Session0
         //
         /////////////////////////////////////////////////

         //
         // Single values
         //
         
         SetToken (mvc, "Single01Title", "Host");
         SetToken (mvc, "Single01Field", "Host");
         SetToken (mvc, "Single04Title", gettext("Startup"));
         SetToken (mvc, "Single04Field", "LogonTime");
         SetToken (mvc, "Single05Title", gettext("Last seen"));
         SetToken (mvc, "Single05Field", "LastSeen");

         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Session_SessionDetail_Session0` Session_SessionDetail_Session0 ' +
                           'latest(host) as Host ' +
                           'latest(SessionLogonTime) as SessionLogonTime ' +
                           'latest(_time) as LastSeen ' +
                           '$SearchFilter$ ' +
                        '| eval LastSeen=strftime (strptime (LastSeen, "%Y-%m-%dT%H:%M:%S.%Q%z"), "%Y-%m-%d %H:%M:%S") ' +
                        '| eval LogonTime=strftime (strptime (SessionLogonTime,"%Y-%m-%d %H:%M:%S.%Q %z"), "%Y-%m-%d %H:%M:%S") ';
                        
         // Update search manager
         var searchSingle = mvc.Components.getInstance ("Search_Single");
         searchSingle.settings.unset ("search");
         searchSingle.settings.set ("search", mvc.tokenSafe (searchString));

         // Build the dummy search string to prevent annotation errors in timecharts with no annotation base search enabled.
         var searchString;
         searchString = '| makeresults ';
                        
         // Update search manager
         var searchSessionConnectionChanges = mvc.Components.getInstance ("Search_SessionConnectionChanges");
         searchSessionConnectionChanges.settings.unset ("search");
         searchSessionConnectionChanges.settings.set ("search", mvc.tokenSafe (searchString));
         
         //
         // Avg. disk latency
         //

         // Panel title
         SetToken (mvc, "Panel71Title", gettext("Avg. disk latency"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_Session_SessionDetail_Session0` Session_SessionDetail_Session0 ' +
                           'sum(SessionIODurationMs) as SumSessionIODurationMs ' +
                           'sum(SessionIOCount) as SumSessionIOCount ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoTimechart$ ' +
                           '$SearchFilter$ ' +
                        '| timechart ' +
                           '`uberAgent_dynamic_span` ' +
                           'eval(sum(SumSessionIODurationMs)/sum(SumSessionIOCount)) as "Avg. IO latency (ms)"';
                        
         // Update search manager
         var searchPanel71 = mvc.Components.getInstance ("Search_Panel71Chart");
         searchPanel71.settings.unset ("search");
         searchPanel71.settings.set ("search", mvc.tokenSafe (searchString));
   
      }
      else if (filterDatamodel == "System_SystemPerformanceSummary")
      {
         /////////////////////////////////////////////////
         //
         // System_SystemPerformanceSummary
         //
         /////////////////////////////////////////////////

         // Build the dummy search string to prevent annotation errors in timecharts with no annotation base search enabled.
         var searchString;
         searchString = '| makeresults ';
                        
         // Update search manager
         var searchSessionConnectionChanges = mvc.Components.getInstance ("Search_SessionConnectionChanges");
         searchSessionConnectionChanges.settings.unset ("search");
         searchSessionConnectionChanges.settings.set ("search", mvc.tokenSafe (searchString));
         
         //
         // Disk time (%)
         //

         // Panel title
         SetToken (mvc, "Panel71Title", gettext("Disk time (%)"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_System_SystemPerformanceSummary` System_SystemPerformanceSummary ' +
                           'avg(IOPercentDiskTime) as AvgIOPercentDiskTime ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoSolo$ ' +
                           '$SearchFilter$ ';
                        
         // Update search manager
         var searchPanel71 = mvc.Components.getInstance ("Search_Panel71Chart");
         searchPanel71.settings.unset ("search");
         searchPanel71.settings.set ("search", mvc.tokenSafe (searchString));
         
         //
         // Avg. disk latency
         //

         // Panel title
         SetToken (mvc, "Panel81Title", gettext("Avg. disk latency"));
         
         // Chart options
         SetToken (mvc, "Panel81ChartStackMode", "stacked");
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_System_SystemPerformanceSummary` System_SystemPerformanceSummary ' +
                           'sum(IODurationReadMs) as SumIODurationReadMs ' +
                           'sum(IODurationWriteMs) as SumIODurationWriteMs ' +
                           'sum(IOCountRead) as SumIOCountRead ' +
                           'sum(IOCountWrite) as SumIOCountWrite ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoTimechart$ ' +
                           '$SearchFilter$ ' +
                        '| timechart ' +
                           '`uberAgent_dynamic_span` ' +
                           'eval(sum(SumIODurationReadMs)/sum(SumIOCountRead)) as "Avg. read latency (ms)" ' +
                           'eval(sum(SumIODurationWriteMs)/sum(SumIOCountWrite)) as "Avg. write latency (ms)"';
                        
         // Update search manager
         var searchPanel81 = mvc.Components.getInstance ("Search_Panel81Chart");
         searchPanel81.settings.unset ("search");
         searchPanel81.settings.set ("search", mvc.tokenSafe (searchString));
         
         //
         // Avg. disk IOPS
         //

         // Panel title
         SetToken (mvc, "Panel91Title", gettext("Avg. disk IOPS"));
         
         // Chart options
         SetToken (mvc, "Panel91ChartStackMode", "stacked");
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_System_SystemPerformanceSummary` System_SystemPerformanceSummary ' +
                           'avg(IOPSRead) as AvgIOPSRead ' +
                           'avg(IOPSWrite) as AvgIOPSWrite ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoSolo$ ' +
                           '$SearchFilter$ ';
                        
         // Update search manager
         var searchPanel91 = mvc.Components.getInstance ("Search_Panel91Chart");
         searchPanel91.settings.unset ("search");
         searchPanel91.settings.set ("search", mvc.tokenSafe (searchString));
         
         //
         // Avg. disk volume
         //

         // Panel title
         SetToken (mvc, "Panel101Title", gettext("Avg. disk volume"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_System_SystemPerformanceSummary` System_SystemPerformanceSummary ' +
                           'avg(IOMBRead) as AvgIOMBRead ' +
                           'avg(IOMBWrite) as AvgIOMBWrite ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoSolo$ ' +
                           '$SearchFilter$ ';
                        
         // Update search manager
         var searchPanel101 = mvc.Components.getInstance ("Search_Panel101Chart");
         searchPanel101.settings.unset ("search");
         searchPanel101.settings.set ("search", mvc.tokenSafe (searchString));
            
         //
         // Avg. network
         //

         // Panel title
         SetToken (mvc, "Panel111Title", gettext("Avg. network thruput"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_System_SystemPerformanceSummary` System_SystemPerformanceSummary ' +
                           'avg(NetUtilizationPercent) as AvgNetUtilizationPercent ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoSolo$ ' +
                           '$SearchFilter$ ';
                        
         // Update search manager
         var searchPanel111 = mvc.Components.getInstance ("Search_Panel111Chart");
         searchPanel111.settings.unset ("search");
         searchPanel111.settings.set ("search", mvc.tokenSafe (searchString));
      }
      else if (filterDatamodel == "System_GpuUsage")
      {
         /////////////////////////////////////////////////
         //
         // System_GpuUsage
         //
         /////////////////////////////////////////////////

         // Build the dummy search string to prevent annotation errors in timecharts with no annotation base search enabled.
         var searchString;
         searchString = '| makeresults ';
                        
         // Update search manager
         var searchSessionConnectionChanges = mvc.Components.getInstance ("Search_SessionConnectionChanges");
         searchSessionConnectionChanges.settings.unset ("search");
         searchSessionConnectionChanges.settings.set ("search", mvc.tokenSafe (searchString));

         //
         // GPU compute usage (%)
         //

         // Panel title
         SetToken (mvc, "Panel71Title", gettext("GPU compute usage (%)"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_System_GpuUsage` System_GpuUsage ' +
                           'avg(ComputeUsagePercentAllEngines) as AvgComputeUsagePercentAllEngines ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoSolo$ ' +
                           '$SearchFilter$ ';
                        
         // Update search manager
         var searchPanel71 = mvc.Components.getInstance ("Search_Panel71Chart");
         searchPanel71.settings.unset ("search");
         searchPanel71.settings.set ("search", mvc.tokenSafe (searchString));
         
         //
         // GPU memory usage (%)
         //

         // Panel title
         SetToken (mvc, "Panel81Title", gettext("GPU memory usage (%)"));
         
         // Chart options
         SetToken (mvc, "Panel81ChartStackMode", "stacked");
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_System_GpuUsage` System_GpuUsage ' +
                           'avg(MemoryDedicatedPercent) as AvgMemoryDedicatedPercent ' +
                           'avg(MemorySharedPercent) as AvgMemorySharedPercent ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoSolo$ ' +
                           '$SearchFilter$ ';
                        
         // Update search manager
         var searchPanel81 = mvc.Components.getInstance ("Search_Panel81Chart");
         searchPanel81.settings.unset ("search");
         searchPanel81.settings.set ("search", mvc.tokenSafe (searchString));
      }
      else if (filterDatamodel == "System_SmbClient")
      {
         /////////////////////////////////////////////////
         //
         // System_SmbClient
         //
         /////////////////////////////////////////////////

         // Build the dummy search string to prevent annotation errors in timecharts with no annotation base search enabled.
         var searchString;
         searchString = '| makeresults ';
                        
         // Update search manager
         var searchSessionConnectionChanges = mvc.Components.getInstance ("Search_SessionConnectionChanges");
         searchSessionConnectionChanges.settings.unset ("search");
         searchSessionConnectionChanges.settings.set ("search", mvc.tokenSafe (searchString));

         //
         // Connected clients
         //

         // Panel title
         SetToken (mvc, "Panel71Title", gettext("Connected clients"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_System_SmbClient` System_SmbClient ' +
                           'dc(host) as "Client count" ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoSolo$ ' +
                           '$SearchFilter$ ';
                        
         // Update search manager
         var searchPanel71 = mvc.Components.getInstance ("Search_Panel71Chart");
         searchPanel71.settings.unset ("search");
         searchPanel71.settings.set ("search", mvc.tokenSafe (searchString));
         
         //
         // Latency
         //

         // Panel title
         SetToken (mvc, "Panel81Title", gettext("Latency"));
         
         // Chart options
         SetToken (mvc, "Panel81ChartStackMode", "default");
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_System_SmbClient` System_SmbClient ' +
                           'sum(IOCountRead) AS SumIOCountRead ' +
                           'sum(IOCountWrite) AS SumIOCountWrite ' +
                           'sum(IODurationReadMs) AS SumIODurationReadMs ' +
                           'sum(IODurationWriteMs) AS SumIODurationWriteMs ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoTimechart$ ' +
                           '$SearchFilter$ ' +
                        '| timechart ' +
                           '`uberAgent_dynamic_span` ' +
                           'eval(round(sum(SumIODurationReadMs)/sum(SumIOCountRead),1)) as "Avg. read latency (ms)" ' +
                           'eval(round(sum(SumIODurationWriteMs)/sum(SumIOCountWrite),1)) as "Avg. write latency (ms)"';
                        
         // Update search manager
         var searchPanel81 = mvc.Components.getInstance ("Search_Panel81Chart");
         searchPanel81.settings.unset ("search");
         searchPanel81.settings.set ("search", mvc.tokenSafe (searchString));
         
         //
         // IOPS
         //

         // Panel title
         SetToken (mvc, "Panel91Title", gettext("IOPS"));
         
         // Chart options
         SetToken (mvc, "Panel91ChartStackMode", "stacked");
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_System_SmbClient` System_SmbClient ' +
                           'avg(IOPSRead) as AvgIOPSRead ' +
                           'avg(IOPSWrite) as AvgIOPSWrite ' +
                           'avg(IOPSMetadata) as AvgIOPSMetadata ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoTimechart$ ' +
                           '$SearchFilter$ ' +
                        '| timechart ' +
                           '`uberAgent_dynamic_span` ' +
                           'eval(round(avg(AvgIOPSRead),1)) as "Avg. read IOPS" ' +
                           'eval(round(avg(AvgIOPSWrite),1)) as "Avg. write IOPS" ' +
                           'eval(round(avg(AvgIOPSMetadata),1)) as "Avg. metadata IOPS"';
                        
         // Update search manager
         var searchPanel91 = mvc.Components.getInstance ("Search_Panel91Chart");
         searchPanel91.settings.unset ("search");
         searchPanel91.settings.set ("search", mvc.tokenSafe (searchString));
         
         //
         // Data volume
         //

         // Panel title
         SetToken (mvc, "Panel101Title", gettext("Data volume"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_System_SmbClient` System_SmbClient ' +
                           'sum(IOMBRead) AS SumIOMBRead ' +
                           'sum(IOMBWrite) AS SumIOMBWrite ' +
                           'splitrow ' +
                              '_time ' +
                              'period $PivotPeriodAutoTimechart$ ' +
                           '$SearchFilter$ ' +
                        '| timechart ' +
                           '`uberAgent_dynamic_span` ' +
                           'sum(SumIOMBRead) as "Read volume (MB)" ' +
                           'sum(SumIOMBWrite) as "Write volume (MB)"';
                        
         // Update search manager
         var searchPanel101 = mvc.Components.getInstance ("Search_Panel101Chart");
         searchPanel101.settings.unset ("search");
         searchPanel101.settings.set ("search", mvc.tokenSafe (searchString));
            
         //
         // Data table
         //

         // Panel title
         SetToken (mvc, "Panel121Title", gettext("Connected clients"));
         
         // Build the search string
         var searchString;
         searchString = '| pivot `uA_DM_System_SmbClient` System_SmbClient ' +
                           'sum(IOCountRead) AS SumIOCountRead ' +
                           'sum(IOCountWrite) AS SumIOCountWrite ' +
                           'sum(IOCountMetadata) AS SumIOCountMetadata ' +
                           'sum(IODurationReadMs) AS SumIODurationReadMs ' +
                           'sum(IODurationWriteMs) AS SumIODurationWriteMs ' +
                           'sum(IOMBRead) AS SumIOMBRead ' +
                           'sum(IOMBWrite) AS SumIOMBWrite ' +
                           'avg(IOPSRead) AS AvgIOPSRead ' +
                           'avg(IOPSWrite) AS AvgIOPSWrite ' +
                           'avg(IOPSMetadata) AS AvgIOPSMetadata ' +
                           'splitrow ' +
                              'host as Host ' +
                           '$SearchFilter$ ' +
                        '| eval "Read IO count" = SumIOCountRead ' +
                        '| eval "Write IO count" = SumIOCountWrite ' +
                        '| eval "Metadata IO count" = SumIOCountMetadata ' +
                        '| eval "Avg. read latency (ms)" = round(SumIODurationReadMs/SumIOCountRead,1) ' +
                        '| eval "Avg. write latency (ms)" = round(SumIODurationWriteMs/SumIOCountWrite,1) ' +
                        '| eval "Avg. read IOPS" = round(AvgIOPSRead,1) ' +
                        '| eval "Avg. write IOPS" = round(AvgIOPSWrite,1) ' +
                        '| eval "Avg. metadata IOPS" = round(AvgIOPSMetadata,1) ' +
                        '| eval "Read data volume (MB)" = round(SumIOMBRead,1) ' +
                        '| eval "Write data volume (MB)" = round(SumIOMBWrite,1) ' +
                        '| eval sortfield = lower("host") ' +
                        '| table ' +
                           'Host ' +
                           '"Read IO count" ' +
                           '"Write IO count" ' +
                           '"Metadata IO count" ' +
                           '"Avg. read latency (ms)" ' +
                           '"Avg. write latency (ms)" ' +
                           '"Avg. read IOPS" ' +
                           '"Avg. write IOPS" ' +
                           '"Avg. metadata IOPS" ' +
                           '"Read data volume (MB)" ' +
                           '"Write data volume (MB)"                      ' +
                           'sortfield ' +
                        '| sort limit=0 sortfield ' +
                        '| fields - sortfield ';
                        
         // Update search manager
         var searchPanel121 = mvc.Components.getInstance ("Search_Panel121Table");
         searchPanel121.settings.unset ("search");
         searchPanel121.settings.set ("search", mvc.tokenSafe (searchString));
      }
   };
   
   //
   // Submit the changed tokens
   //
   SubmitTokens (mvc);
});
