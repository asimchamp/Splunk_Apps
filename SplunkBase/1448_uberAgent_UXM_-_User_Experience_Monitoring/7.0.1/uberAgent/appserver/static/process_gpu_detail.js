
// RequireJS dependency handling
require (["splunkjs/mvc",
         "splunkjs/mvc/simplexml/ready!",
         "splunkjs/mvc/tokenforwarder"], function (mvc)
{
   
   //
   // Set tokens depending on whether we are in application or process mode
   //
   var mode = GetToken (mvc, "mode");
   var regex = /[^|]+/;
   var easySplunkVersion = GetEasySplunkVersion (mvc);
   if (mode == "app")
   {
      //
      // App mode
      //
      SetToken (mvc, "ModeLower", gettext("application"));
      
      // Page title and description
      document.title = document.title.replace (regex, gettext("Application GPU "));
      if (easySplunkVersion >= 70300)
      {
         $('.dashboard-header > h1').text (gettext("Application GPU"));
      }
      else
      {
         $('.dashboard-header > h2').text (gettext("Application GPU"));
      }
      $('.dashboard-header > p.description').text (gettext("This dashboard displays detailed information about GPU usage per application."));
      
      // Build the search string
      searchTable =  '| pivot `uA_DM_Process_ProcessDetail` Process_ProcessDetail ' +
                        '$Panel31Function1$(ProcGpuComputePercent) as ProcGpuComputePercent ' +
                        '$Panel31Function1$(ProcGpuMemMB) as ProcGpuMemMB ' +
                        'values(ProcName) as "Process name" ' +
                        'splitrow ' +
                           'AppName as "App name" ' +
                        '$SearchFilter$ ' +
                        'filter ProcGpuComputePercent is "*" ' +
                     '| join type=outer "App name" ' +
                     '[ ' +
                        '| pivot `uA_DM_Process_ProcessDetail` Process_ProcessDetail ' +
                           'sum(ProcGpuComputePercent) as ProcGpuComputePercent ' +
                           'splitrow ' +
                              'AppName as "App name" ' +
                           'splitrow ' +
                              'ProcGpuEngineMostUsedDisplayName as "GPU engine most used" ' +
                           '$SearchFilter$ ' +
                           'filter ProcGpuComputePercent is "*" ' +
                        '| eventstats max(ProcGpuComputePercent) as maxProcGpuComputePercent by "App name" ' +
                        '| where maxProcGpuComputePercent = ProcGpuComputePercent ' +
                        '| fields "App name" "GPU engine most used"   ' +
                     '] ' +   
                     '| eval "$Panel31Function1Display$ GPU compute (%)"=round (ProcGpuComputePercent,1) ' +
                     '| eval "$Panel31Function1Display$ GPU memory (MB)"=round (ProcGpuMemMB,1) ' +
                     '| eval sortfield=lower (\'App name\') ' +
                     '| table ' +
                        '"App name" ' +
                        '"Process name" ' +
                        '"GPU engine most used" ' +
                        '"$Panel31Function1Display$ GPU compute (%)" ' +
                        '"$Panel31Function1Display$ GPU memory (MB)" ' +
                        'sortfield ' +
                     '| sort limit=0 sortfield ' +
                     '| fields - sortfield ';
   }
   else if (mode == "proc")
   {
      //
      // Proc mode
      //
      SetToken (mvc, "ModeLower", gettext("process"));
      
      // Page title and description
      document.title = document.title.replace (regex, gettext("Process GPU "));
      if (easySplunkVersion >= 70300)
      {
         $('.dashboard-header > h1').text (gettext("Process GPU"));
      }
      else
      {
         $('.dashboard-header > h2').text (gettext("Process GPU"));
      }
      $('.dashboard-header > p.description').text (gettext("This dashboard displays detailed information about GPU usage per process."));
      
      // Build the search string
      searchTable =  '| pivot `uA_DM_Process_ProcessDetail` Process_ProcessDetail ' +
                        '$Panel31Function1$(ProcGpuComputePercent) as ProcGpuComputePercent ' +
                        '$Panel31Function1$(ProcGpuMemMB) as ProcGpuMemMB ' +
                        'values(AppName) as "App name" ' +
                        'splitrow ' +
                           'ProcName as "Process name" ' +
                        '$SearchFilter$ ' +
                        'filter ProcGpuComputePercent is "*" ' +
                     '| join type=outer "Process name" ' +
                     '[ ' +
                        '| pivot `uA_DM_Process_ProcessDetail` Process_ProcessDetail ' +
                           'sum(ProcGpuComputePercent) as ProcGpuComputePercent ' +
                           'splitrow ' +
                           'ProcName as "Process name" ' +
                           'splitrow ' +
                              'ProcGpuEngineMostUsedDisplayName as "GPU engine most used" ' +
                           '$SearchFilter$ ' +
                           'filter ProcGpuComputePercent is "*" ' +
                        '| eventstats max(ProcGpuComputePercent) as maxProcGpuComputePercent by "Process name" ' +
                        '| where maxProcGpuComputePercent = ProcGpuComputePercent ' +
                        '| fields "Process name" "GPU engine most used"   ' +
                     '] ' +                           
                     '| eval "$Panel31Function1Display$ GPU compute (%)"=round (ProcGpuComputePercent,1) ' +
                     '| eval "$Panel31Function1Display$ GPU memory (MB)"=round (ProcGpuMemMB,1) ' +
                     '| eval sortfield=lower (\'Process name\') ' +
                     '| table ' +
                        '"Process name" ' +
                        '"App name" ' +
                        '"GPU engine most used" ' +
                        '"$Panel31Function1Display$ GPU compute (%)" ' +
                        '"$Panel31Function1Display$ GPU memory (MB)" ' +
                        'sortfield ' +
                     '| sort limit=0 sortfield ' +
                     '| fields - sortfield ';
   }

   // Update search managers
   var searchmgrTable = mvc.Components.getInstance ("Search_TablePanel31");
   searchmgrTable.settings.unset ("search");
   searchmgrTable.settings.set ("search", mvc.tokenSafe (searchTable));
 
   //
   // Submit the changed tokens
   //
   SubmitTokens (mvc);
});
