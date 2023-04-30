//
// This file is loaded for every dashboard.
//

//
// Enable auto-discovery
// Auto-discovery is an advanced technique for re-using custom components, especially views, in multiple dashboards and apps.
// Auto-discovery traverses the DOM to find splunk-view or splunk-manager class elements.
// The splunkjs/ready script needs to be loaded to perform auto-discovery.
// Note: the splunkjs/ready! loader script should not be loaded before the dashboard finishes rendering. This can be ensured by loading it within a splunkjs/mvc/simplexml/ready! loader script callback.
//
require.config ({
    paths: {
        "apppath": "../app/uberAgent_logcollector"
    }
});

require (['splunkjs/mvc/simplexml/ready!'], function ()
{
   require (['splunkjs/ready!'], function ()
   {
   });
});

//
// Get a token
//
function GetToken (mvc, tokenName, tokenModel)
{
   if (!tokenModel)
      tokenModel = "default";
   
   var tokens = mvc.Components.get (tokenModel);
   if (tokens)
   {
      var tokenValue = tokens.get (tokenName);
   }

   return tokenValue;
}


//
// Set a token, but only in the default, not the submitted token model (unless specified otherwise)
// SubmitTokens must be called separately. For performance reasons that should be done after *all* tokens have been set
//
function SetToken (mvc, tokenName, tokenValue, submit)
{
   // Default value for submit
   submit = typeof submit !== 'undefined' ? submit : false;
   
   var tokens = mvc.Components.getInstance ("default");
   if (tokens)
   {
      tokens.set (tokenName, tokenValue);
   }
   
   if (submit)
   {
      SubmitTokens (mvc);
   }
}


//
// Set a token in a specified token model (should be "default" or "submitted")
//
function SetTokenInModel (mvc, model, tokenName, tokenValue)
{
   var tokens = mvc.Components.getInstance (model);
   if (tokens)
   {
      tokens.set (tokenName, tokenValue);
   }
}


//
// Set a token in both token models ("default" and "submitted")
//
function SetTokenDefaultSubmitted (mvc, tokenName, tokenValue)
{
   SetTokenInModel (mvc, "default", tokenName, tokenValue);
   SetTokenInModel (mvc, "submitted", tokenName, tokenValue);
}


//
// Submit the default token model
//
function SubmitTokens (mvc)
{
   // Copy from the default to the submitted token model, creating both namespaces if they do not exist yet
   mvc.Components.getInstance('submitted', {create: true}).set(mvc.Components.getInstance('default', {create: true}).toJSON());
   
   // var unsubmittedTokens = mvc.Components.getInstance ("default");
   // var submittedTokens = mvc.Components.getInstance ("submitted");
   // if (unsubmittedTokens && submittedTokens)
   // {
      // submittedTokens.set (unsubmittedTokens.toJSON ());
   // }
}


//
// Get the Splunk version as a number for easy comparisons
// E.g. Splunk 7.0.3 -> 70030
//
// Requires Splunk 6.5 (for "env:version")
//
function GetEasySplunkVersion (mvc)
{
   var versionString = GetToken (mvc, "version", "env");
   if (!versionString)
      return;
   
   var versionNumber;
   versionArray = versionString.split (/[.\s]/);
   if (versionArray.length >= 1 && isNaN(versionArray[0]) == false)
      versionNumber = Number(versionArray[0]) * 10000;
   if (versionArray.length >= 2 && isNaN(versionArray[1]) == false)
      versionNumber += Number(versionArray[1]) * 100;
   if (versionArray.length >= 3 && isNaN(versionArray[2]) == false)
      versionNumber += Number(versionArray[2]);

   return versionNumber;
}


//
// Add or change a URL (GET) parameter
// Source: https://gist.github.com/excalq/2961415
//
function UpdateQueryStringParam (param, value)
{
   baseUrl = [location.protocol, '//', location.host, location.pathname].join ('');
   urlQueryString = document.location.search;
   var newParam = param + '=' + value;
   var params = '?' + newParam;

   // If the "search" string exists, build params from it
   if (urlQueryString)
   {
      keyRegex = new RegExp ('([\?&])' + param + '[^&]*');
      
      // If param exists already, update it
      if (urlQueryString.match (keyRegex) !== null)
      {
         params = urlQueryString.replace (keyRegex, "$1" + newParam);
      }
      else
      {
         // Otherwise, add it to end of query string
         params = urlQueryString + '&' + newParam;
      }
   }

   // Change without adding to the browser history
   window.history.replaceState ({}, "", baseUrl + params);
}

//
// Get a URL (GET) parameter
// Source: http://stackoverflow.com/questions/19491336/get-url-parameter-jquery
//
function getUrlParameter (param)
{
   var pageURL = window.location.search.substring (1);
   var urlVariables = pageURL.split ('&');
   for (var i = 0; i < urlVariables.length; i++) 
   {
      var paramElements = urlVariables[i].split ('=');
      if (paramElements[0] == param) 
      {
         return paramElements[1];
      }
   }
}

//
// Hide/unhide a div by assigning the appropriate CSS class
//
function toggleHidden (divID)
{
   var item = document.getElementById (divID);
   if (item)
   {
      item.className=(item.className=='hidden') ? 'unhidden' : 'hidden';
   }
}

//
// Make a string SPL compliant
//
function MakeSPLCompliant (input)
{
   // Trim double quotes from beginning and end
   input = input.replace (/^"?|"?$/g, "");
   
   // Escape backslashes
   input = input.replace (/\\+/g, "\\\\");
   
   // Escape double quotes
   input = input.replace (/"+/g, '\\"');
   
   return '"' + input + '"';
}


//
// Sort an array of objects by any field
// http://stackoverflow.com/a/979325/234152
//
// Parameters:
// - field:       field to sort by
// - ascending:   ascending sort order?
// - primer:      function that converts the sort field to string in an appropriate way (can be null if 'field' is a string field)
//
function SortBy (field, ascending, primer)
{
   var key = function (x) {return primer ? primer (x[field]) : x[field]};

   return function (a, b)
   {
      var A = key (a), B = key (b);
      return ( (A < B) ? -1 : ((A > B) ? 1 : 0) ) * [-1,1][+!!ascending];
   } 
}

//
// Change operators
//
function ChangeOperators  (filterFieldType,inputFilterOperator,operatorBeforeRefresh)
{
   if (filterFieldType == FILTERFIELD_TYPE_STRING)
   {
      // Choices strings
      var choices =
      [
         {value: "in", label: "in"},
         {value: "isNot", label: "isNot"},
      ];
      inputFilterOperator.settings.set ("default", "in");
      inputFilterOperator.settings.unset ("choices");
      inputFilterOperator.settings.set ("choices", choices);
      inputFilterOperator.val ("in");
   }

   if (filterFieldType == FILTERFIELD_TYPE_NUMBER)
   {
      // Choices numbers
      var choices =
      [
         {value: "=", label: "="},
         {value: "!=", label: "!="},
         {value: "<", label: "<"},
         {value: "<=", label: "<="},
         {value: ">", label: ">"},
         {value: ">=", label: ">="},
      ];
      inputFilterOperator.settings.set ("default", "=");
      inputFilterOperator.settings.unset ("choices");
      inputFilterOperator.settings.set ("choices", choices);
      inputFilterOperator.val ("=");
   }

   if (filterFieldType == FILTERFIELD_TYPE_IPADRESS)
   {
      
      // Choices IPv* or fallback
      var choices =
      [
         {value: "is", label: "is"},
         {value: "isNot", label: "isNot"},
      ];
      inputFilterOperator.settings.set ("default", "is");
      inputFilterOperator.settings.unset ("choices");
      inputFilterOperator.settings.set ("choices", choices);
      inputFilterOperator.val ("is");
   }
   
   if (operatorBeforeRefresh)
   {
      inputFilterOperator.val (operatorBeforeRefresh);
   }
}

///////////////////////////////////////////////////////////////////////
//
// Class DashboardFilters start
//
///////////////////////////////////////////////////////////////////////

// This should be const instead of var, but that is only supported by IE from 11 onwards
var MAX_FILTER_LEVELS = 6;
var FILTERFIELD_TYPE_STRING = 1;
var FILTERFIELD_TYPE_NUMBER = 2;
var FILTERFIELD_TYPE_IPADRESS = 3;

//
// Constructor
//
function DashboardFilters ($, mvc, previousFilterFieldType)
{
   this.$ = $;
   this.mvc = mvc;
   this.previousFilterFieldType = previousFilterFieldType;
}
//
// Configure level one filters
//
DashboardFilters.prototype.ConfigureLevelOneFilters = function ()
{
   // Get the data model
   var filterDatamodel = GetToken (this.mvc, "form.FilterDatamodel")
   if (!filterDatamodel)
   {
      // We cannot do anything if this is not present
      return;
   }

   // Get the filter field input
   var inputFilterfield = this.mvc.Components.getInstance ("Input_FilterField");
   if (!inputFilterfield)
   {
      // We cannot do anything if this is not present
      return;
   }

   // Choices for all data models
   var choices =
   [
      {value: "sAdDomainDns", label: "AD domain DNS"},
      {value: "sAdOu", label: "AD OU"},
      {value: "sAdSite", label: "AD site"},
      {value: "nCPUMaxMhz", label: "CPU base frequency (MHz)"},
      {value: "nCPUCoresLogical", label: "CPU cores (logical)"},
      {value: "nCPUCoresPhysical", label: "CPU cores (physical)"},
      {value: "nCPUSockets", label: "CPU sockets"},
      {value: "sCPUName", label: "CPU name"},
      {value: "sCtxDeliveryGroupName", label: "Citrix delivery group"},
      {value: "sCtxFarmName", label: "Citrix site"},
      {value: "sCtxMachineCatalogName", label: "Citrix machine catalog"},
      {value: "shost", label: "Host"},
      {value: "sHwManufacturer", label: "Hardware manufacturer"},
      {value: "sHwModel", label: "Hardware model"},
      {value: "sIsBatteryPresent", label: "Hardware: has battery? [0|1]"},
      {value: "sHwIsVirtualMachine", label: "Hardware: is VM? [0|1]"},
      {value: "iIpv4Address", label: "IPv4 address(es)"},
      {value: "nOsBuild", label: "OS build number"},
      {value: "sOsPlatform", label: "OS platform [Windows|macOS]"},
      {value: "sOsType", label: "OS type"},
      {value: "nOsUpdateBuildRevision", label: "OS UBR (Update Build Revision)"},
      {value: "sOsVersion", label: "OS version number"},
      {value: "nRAMSizeGB", label: "RAM size (GB)"},
      {value: "sSeverity", label: "Log severity"},
      {value: "sDomain", label: "Log domain"},
      {value: "sThreadOwner", label: "Log ThreadOwner"},
      {value: "nThreadId", label: "Log ThreadId"},
      {value: "sCategory", label: "Log category"},
      {value: "sMessage", label: "Log message"}
   ];
   
   // Store the values that are universally available in a global variable
   window.uberAgent_UniversalChoices = [];
   for (var i = 0; i < choices.length; i++) 
   {
      window.uberAgent_UniversalChoices.push (choices[i].value);
   }
   
   // Configure the UI
   inputFilterfield.settings.set ("default", "shost");

   inputFilterfield.settings.unset ("choices");
   choices.sort (SortBy ("label", true, function(a){return a.toUpperCase()}));
   inputFilterfield.settings.set ("choices", choices);
};


//
// Perform one-time filter setup
//
DashboardFilters.prototype.SetupFilters = function (forceInit)
{
   if (forceInit == false && typeof filtersPopulated != "undefined" && filtersPopulated == true)
   {
      // Setup was already run and we were not told to force a rerun
      return;
   }

   this.ConfigureLevelOneFilters ();
   
   var level1FilterField = this.mvc.Components.getInstance ("Input_FilterField");
   var level1FilterOperator = this.mvc.Components.getInstance ("Input_FilterOperator");
   var level1FilterExpression = this.mvc.Components.getInstance ("Input_FilterExpression");
   
   if (!level1FilterField || !level1FilterOperator || !level1FilterExpression)
   {
      // Don't do anything on dashboards without the three level 1 filter inputs
      return;
   }
   
   // Copy properties from the first filter level to the others
   for (i = 2; i <= MAX_FILTER_LEVELS; i++)
   {
      var filterField = this.mvc.Components.getInstance ("Input_FilterField" + i);
      if (filterField)
      {
         filterField.settings.unset ("choices");
         filterField.settings.set ("choices", level1FilterField.settings.get ("choices"));
         filterField.settings.set ("default", level1FilterField.settings.get ("default"));
         
         // Clear the label text to get the label to collapse to zero height
         this.$("#Input_FilterField" + i + " > label").text ("")
      }

      var filterOperator = this.mvc.Components.getInstance ("Input_FilterOperator" + i);
      if (filterOperator)
      {
         // Skip if operator already set. This is the case on a page relaod.
         if (typeof filterOperator.val() == "undefined")
         {
            filterOperator.settings.unset ("choices");
            filterOperator.settings.set ("choices", level1FilterOperator.settings.get ("choices"));
            filterOperator.settings.set ("default", level1FilterOperator.settings.get ("default"));
         }
         
         // Clear the label text to get the label to collapse to zero height
         this.$("#Input_FilterOperator" + i + " > label").text ("")
      }

      var filterExpression = this.mvc.Components.getInstance ("Input_FilterExpression" + i);
      if (filterExpression)
      {
         filterExpression.settings.unset ("choices");
         filterExpression.settings.set ("choices", level1FilterExpression.settings.get ("choices"));
         filterExpression.settings.set ("default", level1FilterExpression.settings.get ("default"));
         
         // Clear the label text to get the label to collapse to zero height
         this.$("#Input_FilterExpression" + i + " > label").text ("")
      }
   }

   // Determine the width of a datamodel input, if visible
   var datamodelWidth = 0;
   if (window.location.pathname.indexOf ("/analyze_timechart") > 0)
   {
      datamodelWidth = this.$("#Input_FilterDatamodel").outerWidth (true);
   }

   // Set left margin of the additional filters to the width of the time range picker
   var timerangepickerWidth = this.$(".input-timerangepicker").outerWidth (true);
   if (!timerangepickerWidth)
   {
      // Splunk 6.5
      var timerangepickerWidth = this.$(".input-time").outerWidth (true);
   }
   var leftMargin = timerangepickerWidth + datamodelWidth;
   this.$("#Input_FilterField2").css ("margin-left", leftMargin);
   this.$("#Input_FilterField3").css ("margin-left", leftMargin);
   this.$("#Input_FilterField4").css ("margin-left", leftMargin);
   this.$("#Input_FilterField5").css ("margin-left", leftMargin);
   this.$("#Input_FilterField6").css ("margin-left", leftMargin);
   
   if (!this.$("#uAAddRemoveFilters").length)
   {
      // Add the add/remove filter links to the DOM
      var fieldset = this.$(".dashboard-body").find (".fieldset").first ();
      fieldset.append ('<div id="uAAddRemoveFilters"><a href="#" id="uARemoveFilter">Remove filter</a><a href="#" id="uAAddFilter" style="margin-left: 20px;">Add filter</a></div>');
   }

   // Set the width of the add / remove filter div
   this.$("#uAAddRemoveFilters").width (timerangepickerWidth + datamodelWidth + this.$("#Input_FilterField").outerWidth (true) + this.$("#Input_FilterOperator").outerWidth (true) + this.$("#Input_FilterExpression").outerWidth (false));
   
   // Attach click event handlers to the new links
   var that = this;
   this.$("#uAAddFilter").on ('click', function() {that.AddFilter()});
   this.$("#uARemoveFilter").on ('click', function() {that.RemoveFilter()});
   
   // Adjust the UI to the current token state
   this.SetFilterState ();

   filtersPopulated = true;
};


//
// Determine the number of filter levels
//
DashboardFilters.prototype.InitFilterLevels = function ()
{
   if (typeof this.filterLevels === 'undefined')
   {
      this.filterLevels = GetToken (this.mvc, "form.FilterLevels")
   }
   if (this.filterLevels == null)
   {
      // Default: 1 filter
      this.filterLevels = 1;
   }
};

//
// Return the filter level count
//
DashboardFilters.prototype.GetFilterLevels = function ()
{
   return this.filterLevels;
};

//
// Add a filter to the fieldset
//
DashboardFilters.prototype.AddFilter = function ()
{
   this.SetFilterState (1);
};

//
// Remove a filter from the fieldset
//
DashboardFilters.prototype.RemoveFilter = function ()
{
   this.SetFilterState (2);
};

//
// Set filter state
// Add a filter, remove a filter or simply adjust the UI to the state of the tokens
//
DashboardFilters.prototype.SetFilterState = function (action)
{
   // Get the Splunk version
   var easySplunkVersion = GetEasySplunkVersion (this.mvc);
   
   this.InitFilterLevels ();
   
   if (action === 1)
   {
      // Add a filter
      this.filterLevels++;
   }
   else if (action === 2)
   {
      // Remove a filter
      if (this.filterLevels > 1)
      {
         // Remove a filter
         this.filterLevels--;
      }
   }
   
   // Store the current filter level count in the default token model
   SetTokenDefaultSubmitted (this.mvc, "form.FilterLevels", this.filterLevels);

   if (this.filterLevels >= MAX_FILTER_LEVELS)
   {
      // Only show the remove filter link
      this.$("#uAAddFilter").hide ();
      this.$("#uARemoveFilter").show ();
   }
   else if (this.filterLevels == 1)
   {
      // Only show the add filter link
      this.$("#uAAddFilter").show ();
      this.$("#uARemoveFilter").hide ();
   }
   else
   {
      this.$("#uAAddFilter").show ();
      this.$("#uARemoveFilter").show ();
   }
   
   // Trigger a change in the field populated by the TokenForwarder by temporarily modifying the "highest" filter expression field value
   for (i = MAX_FILTER_LEVELS; i >= 2 ; i--)
   {
      var fieldToModify = this.mvc.Components.getInstance ("Input_FilterExpression" + i);
      if (!fieldToModify)
         continue;
      
      var originalValue = fieldToModify.val ();
      fieldToModify.val (originalValue + "*");
      fieldToModify.val (originalValue);
      break;
   }

   // Set tokens to be used with "depends" in the UI
   for (i = 2; i <= MAX_FILTER_LEVELS; i++)
   {
      SetTokenInModel (this.mvc, "submitted", "FilterLevel" + i, this.filterLevels >= i ? "true" : undefined);
   }
   
   //
   // Adjust the y position of the submit button
   //
   var searchButton;
   if (this.$("#search_btn").length)
   {
      searchButton = this.$("#search_btn");
   }
   else
   {
      // Splunk 6.5+
      searchButton = this.$("#submit");
   }
   
   if (this.filterLevels >= 2)
   {
      // Potentially changed from 6px to 5px before 6.6 (or our original value of 6px was off by 1px)
      if (easySplunkVersion >= 60600)
      {
         var deltaTop = "5px";
      }
      else
      {
         var deltaTop = "6px";
      }
   }
   else
   {
      if (easySplunkVersion >= 70100)
      {
         var deltaTop = "25px";
      }
      else
      {
         var deltaTop = "21px";
      }
   }
   
   if (deltaTop)
   {
      searchButton.css ("padding-top", deltaTop);
      this.$(".hide-global-filters").css ("margin-top", deltaTop);
   }
};

//
// Choose operators fur current filter field
//
DashboardFilters.prototype.SetupOperators = function (filterFieldType,filterOperator,currentFilterNumber,mvc)
{   
   // Determine current filter field and operator
   var currentFilterField;
   var currentFilterOperator;
   if (currentFilterNumber == 1) 
   {
      currentFilterField = 'Input_FilterField';
      currentFilterOperator = 'Input_FilterOperator';      
   }
   else
   {
      currentFilterField = 'Input_FilterField' + currentFilterNumber;
      currentFilterOperator = 'Input_FilterOperator' + currentFilterNumber;      
   }
   
   var inputFilterField = this.mvc.Components.getInstance (currentFilterField);
   if (!inputFilterField)
   {
      // We cannot do anything if this is not present
      return;
   }
   
   var inputFilterOperator = this.mvc.Components.getInstance (currentFilterOperator);
   if (!inputFilterOperator)
   {
      // We cannot do anything if this is not present
      return;
   }
   
   // Check if this is the first run
   if ((typeof GetToken (mvc, "FilterField") == "undefined") && (this.previousFilterFieldType.length == 0))
   {
      // First run. Default filter is host. Set operators accordingly
         var choices =
         [
            {value: "in", label: "in"},
            {value: "isNot", label: "isNot"},
         ];
         inputFilterOperator.settings.set ("default", "in");
         inputFilterOperator.settings.set ("choices", choices);
         inputFilterOperator.val ("in");
         
         // Set a previous filter variable on the client for all filter fields
         for (x = 1; x <= MAX_FILTER_LEVELS; x++)
         {
            this.previousFilterFieldType[x-1] = FILTERFIELD_TYPE_STRING;
         }
         return "in";
   }
   
   // Check if this is a page refresh
   if ((typeof this.previousFilterFieldType[currentFilterNumber - 1] == "undefined") && (typeof GetToken (mvc, "FilterField") !== "undefined"))
   {
      // Page refresh. Build operator choices.
      var operatorBeforeRefresh = inputFilterOperator.val();
      ChangeOperators (filterFieldType,inputFilterOperator,operatorBeforeRefresh);
      
      // Set current filter field as previous one
      this.previousFilterFieldType[currentFilterNumber - 1] = filterFieldType;
      
      //  Return the current operator
      return operatorBeforeRefresh;
   }
   
   // Check if filter type has changed
   if (filterFieldType != (this.previousFilterFieldType[currentFilterNumber - 1]))
   {
      // Filter type has changed. Change operators
      if (filterFieldType == FILTERFIELD_TYPE_STRING)
      {
         // Choices strings
         var choices =
         [
            {value: "in", label: "in"},
            {value: "isNot", label: "isNot"},
         ];
         inputFilterOperator.settings.set ("default", "in");
         inputFilterOperator.settings.unset ("choices");
         inputFilterOperator.settings.set ("choices", choices);
         inputFilterOperator.val ("in");
      }
      
      if (filterFieldType == FILTERFIELD_TYPE_NUMBER)
      {
         // Choices numbers
         var choices =
         [
            {value: "=", label: "="},
            {value: "!=", label: "!="},
            {value: "<", label: "<"},
            {value: "<=", label: "<="},
            {value: ">", label: ">"},
            {value: ">=", label: ">="},
         ];
         inputFilterOperator.settings.set ("default", "=");
         inputFilterOperator.settings.unset ("choices");
         inputFilterOperator.settings.set ("choices", choices);
         inputFilterOperator.val ("=");
      }
      
      if (filterFieldType == FILTERFIELD_TYPE_IPADRESS)
      {
         
         // Choices IPv* or fallback
         var choices =
         [
            {value: "is", label: "is"},
            {value: "isNot", label: "isNot"},
         ];
         inputFilterOperator.settings.set ("default", "is");
         inputFilterOperator.settings.unset ("choices");
         inputFilterOperator.settings.set ("choices", choices);
         inputFilterOperator.val ("is");
      }
      // Set current filter field as previous one
      this.previousFilterFieldType[currentFilterNumber - 1] = filterFieldType;
      
      // Return new default operator
      var defaultOperator = inputFilterOperator.settings.get ("default");
      return defaultOperator;
   }
   else
   {
      // Filter type did not change
      return filterOperator;
   }
};

///////////////////////////////////////////////////////////////////////
//
// Class DashboardFilters end
//
///////////////////////////////////////////////////////////////////////


//
// Token forwarder: handle changes to filter fields
//
require (["jquery",
         "splunkjs/mvc",
         "splunkjs/mvc/utils",
         "splunkjs/mvc/simplexml/ready!",
         "splunkjs/mvc/tokenforwarder"], function ($, mvc, utils)
{
   var TokenForwarder = require ("splunkjs/mvc/tokenforwarder");

   // Instantiate a DashboardFilters object
   var previousFilterFieldType = [];
   var dashboardFilters = new DashboardFilters ($, mvc, previousFilterFieldType);
   
   //
   // Build the search filter string
   //
   new TokenForwarder (["$form.FilterField$", "$form.FilterOperator$", "$form.FilterExpression$", "$form.FilterField2$", "$form.FilterOperator2$", "$form.FilterExpression2$", 
                       "$form.FilterField3$", "$form.FilterOperator3$", "$form.FilterExpression3$", "$form.FilterField4$", "$form.FilterOperator4$", "$form.FilterExpression4$", 
                       "$form.FilterField5$", "$form.FilterOperator5$", "$form.FilterExpression5$", "$form.FilterField6$", "$form.FilterOperator6$", "$form.FilterExpression6$"], "$SearchFilter$", 
                       function (filterField, filterOperator, filterExpression, filterField2, filterOperator2, filterExpression2, filterField3, filterOperator3, filterExpression3, 
                       filterField4, filterOperator4, filterExpression4, filterField5, filterOperator5, filterExpression5, filterField6, filterOperator6, filterExpression6)
   {
      if (!filterField)
      {
         return TokenForwarder.NO_CHANGE;
      }
      // Determine the filter level
      dashboardFilters.InitFilterLevels ();

      // Setup operators
      var filterFieldType;
      switch (filterField.charAt(0)) 
      {
         // String
         case "s":
            filterFieldType = FILTERFIELD_TYPE_STRING;
            break;
         // Number
         case "n":
            filterFieldType = FILTERFIELD_TYPE_NUMBER;
            break;
         // Ipaddress
         case "i":
            filterFieldType = FILTERFIELD_TYPE_IPADRESS;
            break;
         // As a fallback use Ipaddress type as the operator will be "is", which works with all filter fields
         default:
            filterFieldType = FILTERFIELD_TYPE_IPADRESS;
            filterField = "i" + filterField
      }
      filterOperator = dashboardFilters.SetupOperators(filterFieldType, filterOperator, 1, mvc);
      
      if (!filterOperator)
      {
         // Filter operator could not be determined. Assign "is" as a fallback, because it works with all filter fields
         filterOperator = 'is';
      }
      
      
      // Build filter prefix and postfix depending on operator
      if (filterOperator == 'in')
      {
         var filterPrefix = ' (';
         var filterPostfix = ') ';
      }
      else
      {
         var filterPrefix = ' ';
         var filterPostfix = ' ';
      }
      
      // Remove first character from filter field
      filterField = filterField.substring(1);
      
      // Make filter expression available as seperate token to use standalone on the dashboard
      var filterExpressionSPL = MakeSPLCompliant (filterExpression);
      SetToken (mvc, "filterExpressionSPL", filterExpressionSPL);
      
      // Default filter string
      var filterElement = ' filter ' + filterField + ' ' + filterOperator + filterPrefix + MakeSPLCompliant (filterExpression) + filterPostfix;
      var filterString = filterElement;
      
      // We also build a "universal" filter string that works in all data models
      var filterStringUniversal = "";
      if (window.uberAgent_UniversalChoices && window.uberAgent_UniversalChoices.indexOf (filterField) >= 0)
         filterStringUniversal = filterString;
      
      if (dashboardFilters.GetFilterLevels() >= 2 && filterField2 && filterOperator2 && filterExpression2)
      {
         var filterFieldType2;
         switch (filterField2.charAt(0)) 
         {
            // String
            case "s":
               filterFieldType2 = FILTERFIELD_TYPE_STRING;
               break;
            // Number
            case "n":
               filterFieldType2 = FILTERFIELD_TYPE_NUMBER;
               break;
            // Ipaddress
            case "i":
               filterFieldType2 = FILTERFIELD_TYPE_IPADRESS;
               break;
            // As a fallback use Ipaddress type as the operator will be "is", which works with all filter fields
            default:
               filterFieldType2 = FILTERFIELD_TYPE_IPADRESS;
               filterField2 = "i" + filterField2
         }
         filterOperator2 = dashboardFilters.SetupOperators(filterFieldType2, filterOperator2, 2, mvc);

         if (filterOperator2 == 'in')
         {
            var filterPrefix2 = ' (';
            var filterPostfix2 = ') ';
         }
         else
         {
            var filterPrefix2 = ' "';
            var filterPostfix2 = '" ';
         }
         
         filterField2 = filterField2.substring(1);
         
         // Make filter expression available as seperate token to use standalone on the dashboard
         var filterExpressionSPL2 = MakeSPLCompliant (filterExpression2);
         SetToken (mvc, "filterExpressionSPL2", filterExpressionSPL2);
         
         filterElement = ' filter ' + filterField2 + ' ' + filterOperator2 + filterPrefix2 + MakeSPLCompliant (filterExpression2) + filterPostfix2;
         filterString += filterElement;
         
         if (window.uberAgent_UniversalChoices && window.uberAgent_UniversalChoices.indexOf (filterField2) >= 0)
            filterStringUniversal += filterElement;
      }
      if (dashboardFilters.GetFilterLevels() >= 3 && filterField3 && filterOperator3 && filterExpression3)
      {
         var filterFieldType3;
         switch (filterField3.charAt(0)) 
         {
            // String
            case "s":
               filterFieldType3 = FILTERFIELD_TYPE_STRING;
               break;
            // Number
            case "n":
               filterFieldType3 = FILTERFIELD_TYPE_NUMBER;
               break;
            // Ipaddress
            case "i":
               filterFieldType3 = FILTERFIELD_TYPE_IPADRESS;
               break;
            // As a fallback use Ipaddress type as the operator will be "is", which works with all filter fields
            default:
               filterFieldType3 = FILTERFIELD_TYPE_IPADRESS;
               filterField3 = "i" + filterField3
         }
         filterOperator3 = dashboardFilters.SetupOperators(filterFieldType3, filterOperator3, 3, mvc);

         if (filterOperator3 == 'in')
         {
            var filterPrefix3 = ' (';
            var filterPostfix3 = ') ';
         }
         else
         {
            var filterPrefix3 = ' "';
            var filterPostfix3 = '" ';
         }
         
         filterField3 = filterField3.substring(1);
         
         // Make filter expression available as seperate token to use standalone on the dashboard
         var filterExpressionSPL3 = MakeSPLCompliant (filterExpression3);
         SetToken (mvc, "filterExpressionSPL3", filterExpressionSPL3);
         
         filterElement = ' filter ' + filterField3 + ' ' + filterOperator3 + filterPrefix3 + MakeSPLCompliant (filterExpression3) + filterPostfix3;
         filterString += filterElement;
         
         if (window.uberAgent_UniversalChoices && window.uberAgent_UniversalChoices.indexOf (filterField3) >= 0)
            filterStringUniversal += filterElement;
      }
      if (dashboardFilters.GetFilterLevels() >= 4 && filterField4 && filterOperator4 && filterExpression4)
      {
         var filterFieldType4;
         switch (filterField4.charAt(0)) 
         {
            // String
            case "s":
               filterFieldType4 = FILTERFIELD_TYPE_STRING;
               break;
            // Number
            case "n":
               filterFieldType4 = FILTERFIELD_TYPE_NUMBER;
               break;
            // Ipaddress
            case "i":
               filterFieldType4 = FILTERFIELD_TYPE_IPADRESS;
               break;
            // As a fallback use Ipaddress type as the operator will be "is", which works with all filter fields
            default:
               filterFieldType4 = FILTERFIELD_TYPE_IPADRESS;
               filterField4 = "i" + filterField4
         }
         filterOperator4 = dashboardFilters.SetupOperators(filterFieldType4, filterOperator4, 4, mvc);

         if (filterOperator4 == 'in')
         {
            var filterPrefix4 = ' (';
            var filterPostfix4 = ') ';
         }
         else
         {
            var filterPrefix4 = ' "';
            var filterPostfix4 = '" ';
         }
         
         filterField4 = filterField4.substring(1);
         
         // Make filter expression available as seperate token to use standalone on the dashboard
         var filterExpressionSPL4 = MakeSPLCompliant (filterExpression4);
         SetToken (mvc, "filterExpressionSPL4", filterExpressionSPL4);
         
         filterElement = ' filter ' + filterField4 + ' ' + filterOperator4 + filterPrefix4 + MakeSPLCompliant (filterExpression4) + filterPostfix4;
         filterString += filterElement;
         
         if (window.uberAgent_UniversalChoices && window.uberAgent_UniversalChoices.indexOf (filterField4) >= 0)
            filterStringUniversal += filterElement;
      }
      if (dashboardFilters.GetFilterLevels() >= 5 && filterField5 && filterOperator5 && filterExpression5)
      {
         var filterFieldType5;
         switch (filterField5.charAt(0)) 
         {
            // String
            case "s":
               filterFieldType5 = FILTERFIELD_TYPE_STRING;
               break;
            // Number
            case "n":
               filterFieldType5 = FILTERFIELD_TYPE_NUMBER;
               break;
            // Ipaddress
            case "i":
               filterFieldType5 = FILTERFIELD_TYPE_IPADRESS;
               break;
            // As a fallback use Ipaddress type as the operator will be "is", which works with all filter fields
            default:
               filterFieldType5 = FILTERFIELD_TYPE_IPADRESS;
               filterField5 = "i" + filterField5
         }
         filterOperator5 = dashboardFilters.SetupOperators(filterFieldType5, filterOperator5, 5, mvc);

         if (filterOperator5 == 'in')
         {
            var filterPrefix5 = ' (';
            var filterPostfix5 = ') ';
         }
         else
         {
            var filterPrefix5 = ' "';
            var filterPostfix5 = '" ';
         }
         
         filterField5 = filterField5.substring(1);
         
         // Make filter expression available as seperate token to use standalone on the dashboard
         var filterExpressionSPL5 = MakeSPLCompliant (filterExpression5);
         SetToken (mvc, "filterExpressionSPL5", filterExpressionSPL5);
         
         filterElement = ' filter ' + filterField5 + ' ' + filterOperator5 + filterPrefix5 + MakeSPLCompliant (filterExpression5) + filterPostfix5;
         filterString += filterElement;
         
         if (window.uberAgent_UniversalChoices && window.uberAgent_UniversalChoices.indexOf (filterField5) >= 0)
            filterStringUniversal += filterElement;
      }
      if (dashboardFilters.GetFilterLevels() >= 6 && filterField6 && filterOperator6 && filterExpression6)
      {
         var filterFieldType;
         switch (filterField6.charAt(0)) 
         {
            // String
            case "s":
               filterFieldType6 = FILTERFIELD_TYPE_STRING;
               break;
            // Number
            case "n":
               filterFieldType6 = FILTERFIELD_TYPE_NUMBER;
               break;
            // Ipaddress
            case "i":
               filterFieldType6 = FILTERFIELD_TYPE_IPADRESS;
               break;
            // As a fallback use Ipaddress type as the operator will be "is", which works with all filter fields
            default:
               filterFieldType6 = FILTERFIELD_TYPE_IPADRESS;
               filterField6 = "i" + filterField6
         }
         filterOperator6 = dashboardFilters.SetupOperators(filterFieldType6, filterOperator6, 6, mvc);
         
         if (filterOperator6 == 'in')
         {
            var filterPrefix6 = ' (';
            var filterPostfix6 = ') ';
         }
         else
         {
            var filterPrefix6 = ' "';
            var filterPostfix6 = '" ';
         }
         
         filterField6 = filterField6.substring(1);
         
         // Make filter expression available as seperate token to use standalone on the dashboard
         var filterExpressionSPL6 = MakeSPLCompliant (filterExpression6);
         SetToken (mvc, "filterExpressionSPL6", filterExpressionSPL6);
         
         filterElement = ' filter ' + filterField6 + ' ' + filterOperator6 + filterPrefix6 + MakeSPLCompliant (filterExpression6) + filterPostfix6;
         filterString += filterElement;
         
         if (window.uberAgent_UniversalChoices && window.uberAgent_UniversalChoices.indexOf (filterField6) >= 0)
            filterStringUniversal += filterElement;
      }
      
      // Set the universal filter as a token
      SetToken (mvc, "SearchFilterUniversal", filterStringUniversal);

      var searchFilter = GetToken (mvc, "SearchFilter");
      if (filterString === searchFilter)
      {
         return TokenForwarder.NO_CHANGE;
      }
      else
      {
         // Log overview preparations
         // Hide drilldown
         SetToken (mvc, "DrilldownFilterBy61", null);
         
         // Log detail preparations
         // Show data table
         SetToken (mvc, "LogDataTableShow", "true");
         
         // Hide hint
         SetToken (mvc, "LogDataTableHint", null);
         
         
         // Return new filter string
         return filterString;
      }
   });

   // Adjust the filter UI
   dashboardFilters.SetupFilters (false);
   
   // Auto-run not on details dashboard for performance reasons
   if (window.location.href.indexOf("uberAgent_logcollector/uberAgentLogDetails") === -1)
   {
      SubmitTokens (mvc);
   }
   
});


//
// Setup "explanation" click event handlers
// Setup text input validation
//
require (["jquery",
         "splunkjs/mvc",
         "splunkjs/ready!",
         "splunkjs/mvc/simplexml/ready!"], function ($, mvc)
{
   if ($("#ExplanationLink").length)
   {
      // Attach a click event handler to the link
      $("#ExplanationLink").click (function() {toggleHidden('Explanation');} );
   }
   if ($("#ExplanationLink2").length)
   {
      // Attach a click event handler to the link
      $("#ExplanationLink2").click (function() {toggleHidden('Explanation2');} );
   }
   if ($("#ExplanationLink3").length)
   {
      // Attach a click event handler to the link
      $("#ExplanationLink3").click (function() {toggleHidden('Explanation3');} );
   }
   if ($("#ExplanationLink4").length)
   {
      // Attach a click event handler to the link
      $("#ExplanationLink4").click (function() {toggleHidden('Explanation4');} );
   }

   //
   // Text input validation: prepend element IDs with specifiers to enforce validation through HTML
   //
   // Numbers only, e.g.: id="numbersOnly_Input_MinDays"
   $("[id^=NumbersOnly_]")
      .attr ("type", "number")
      

   //
   // Add submit buttons to all fieldsets in panels whose ID ends with "_SubmitButton"
   //
   $("[id$=_SubmitButton]").each(function()
   {
      CreateButton ("Submit", this.id).click(function()
      {
         SubmitTokens (mvc);
      });
   });
   
   
   //
   // Create a second (third, ...) submit button
   // Inspiration: https://answers.splunk.com/answers/346916/submit-button-per-panel-in-simple-xml.html
   //
   function CreateButton (label, parent)
   {
      var button = document.createElement ("button");

      // Set the label (text on the button)
      if (typeof label !== "undefined" && label.length > 0)
      {
         button.innerHTML = label;
      }

      // Set CSS classes
      button.className = "btn btn-primary";
      
      // Create a DIV  around the button
      var div = document.createElement ("div");
      div.className = "splunk-submit-button form-submit dashboard-form-submit";
      div.appendChild (button);

      // Locate the fieldset in the parent element and append the button
      if (typeof parent !== "undefined" && parent.length > 0)
      {
         var parentID = (parent[0] === "#" ? parent : "#" + parent);
         var parentElement = $(parentID);

         // Set the button DIV in its place of the parent
         if (parentElement.length)
         {
            var fieldset = parentElement.find(".fieldset");
            if (fieldset.length)
            {
               fieldset = $(fieldset[0]);
               fieldset.append (div);
            }
         }
      }
      return $(button);
   }
});