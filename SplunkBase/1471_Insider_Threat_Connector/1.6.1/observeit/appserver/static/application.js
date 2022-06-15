// Copyright (C) 2010-2019 Sideview LLC.  All Rights Reserved.

/**
 * If your use of this app is through the Sideview Trial License Agreement, 
 * or through the Sideview Internal Use License Agreement, then as stated 
 * in the relevant agreement, any modification of this file or modified 
 * copies made of this file constitute a violation of that agreement.
 */

var SideviewApp = {};
SideviewApp.name = "observeit";

SideviewApp.licenseEnd = 0;
SideviewApp.supportEnd = 0;

SideviewApp.isPaidLicense = false;
SideviewApp.displayedErrors = [];

// just a little bit of evil. 
$(document).click(function(evt) {
    var t = $(evt.target);
    if (t.hasClass("primaryLink") || t[0].className.indexOf("primaryLink")==0) {
        
        if (t.attr("href").indexOf("/app/observeit/report?s=")!=-1) {
            var url = t.attr("href");
            url = url.replace("/app/observeit/report?s=","/app/observeit/@go?s=");
            evt.preventDefault();
            document.location.href = url;
            return false;
        }
        // changes
        // /en-US/app/observeit/report?s=%2FservicesNS%2Fadmin%2Fobserveit%2Fsaved%2Fsearches%2Fafred
        // to 
        // /en-US/app/observeit/%40go?s=%2FservicesNS%2Fadmin%2Fobserveit%2Fsaved%2Fsearches%2Ffred 
        // so that through the @go url's evil machinations and then our subsequent hack it ultimately becomes 
        // /browse?search.name=afred2
    }
});

function startupChecks() {
    
    var REQUIRED_VERSION = "3.4.7";
    var REQUIRED_SPLUNK_VERSION = "6.0";
    
    if (Splunk.util.getCurrentView()=="_admin") return false;

    function displayError(errorId, redirectToHomeIfAbsent) {
        SideviewApp.displayedErrors.push(errorId);
        
        
        var error = $("#" + errorId);
        if (error.length>0) {
            error.show();
        } 
        else if (errorId=="SideviewAppNotInstalled") {
            var suddenlyDeputized = $(".panel_row1_col .dashboardCell");
            suddenlyDeputized.html("<div id=\"SideviewAppNotInstalled\" style=\"display:block;font-size:16px;line-height:18px;\">PROBLEM -- To run this app you also need to have installed the \"Sideview Utils\" app on this Splunk instance. Here is how to fix this in just a couple minutes.  : <ol><li>In the \"App\" menu in the top left, right-click \"Manage Apps\" and pick \"open in new window\"</li><li>On that page click the \"Browse More Apps\" button.</li><li>Search for \"sideview\"</li><li>Install the app named \"Sideview Utils (free internal use license)\".  <br>Also note carefully that the login it will ask you for is your Splunk.com website login, not your Splunk enterprise login.</ol></div>");
            $(".panel_row2_col").hide();
        }
        else if (redirectToHomeIfAbsent) {
            // we're home but the error div isn't here...
            if (Splunk.util.getCurrentView()=="home"){ 
                alert("Unexpected Error: " + errorId + ". Please contact Sideview Support.");
            }
            else {
                document.location = "home";
            }
        }
    }

    function getLicenseExpireDate() {
        var expireDate = new Date();
        expireDate.setTime(SideviewApp.licenseEnd);
        return expireDate;
    }
    function getSupportExpireDate() {
        var expireDate = new Date();
        expireDate.setTime(SideviewApp.supportEnd);
        return expireDate;
    }
    

    function isSplunkTooOld() {
        if (!REQUIRED_SPLUNK_VERSION) return false;
        var currentSplunkVersion = Splunk.util.getConfigValue("VERSION_LABEL");
        if (currentSplunkVersion=="UNKNOWN_VERSION") {
            // this is a bug in splunk.  restarting splunk fixes it, but for 
            // some deployments that's not a good option.
            // turning this case off for now. 
        }
        else if (typeof(Sideview)!="undefined" && Sideview.utils.compareVersions(currentSplunkVersion,REQUIRED_SPLUNK_VERSION) == -1) {
            $("#SplunkTooOld .currentVersion").text(currentSplunkVersion);
            $("#SplunkTooOld .requiredVersion").text(REQUIRED_SPLUNK_VERSION);
            return true;
        }
    }

    function isSideviewUtilsTooOld() {
        if (!REQUIRED_VERSION) return false;
        if (typeof(Sideview)!="undefined" && !Sideview.utils.checkRequiredVersion(REQUIRED_VERSION)){
            var currentVersion = Sideview.utils.getCurrentVersion();
            $("#SideviewUtilsTooOld .currentVersion").text(currentVersion);
            $("#SideviewUtilsTooOld .requiredVersion").text(REQUIRED_VERSION);
            return true;
        }
    }

    function isDateInThePast(epochTime) {
        var now = new Date();
        return (now.valueOf() > epochTime);
    }

    function isDateWithinThirtyDays(epochTime) {
        var now = new Date();
        var expiresInDays = Math.ceil((epochTime - now.valueOf())/(1000*3600*24));
        return (expiresInDays>0 && expiresInDays < 30);
    }

    function isLicenseExpired() {
        return (SideviewApp.licenseEnd!=0 && isDateInThePast(SideviewApp.licenseEnd));
    }
    function isSupportExpired() {
        return isDateInThePast(SideviewApp.supportEnd);
    }
    function isLicenseExpiring() {
        return isDateWithinThirtyDays(SideviewApp.licenseEnd);
    }
    function isSupportExpiring() {
        return isDateWithinThirtyDays(SideviewApp.supportEnd);
    }


    function isPaidLicense() {
        return SideviewApp.isPaidLicense;
    }
    function isTrialLicense() {
        return (!SideviewApp.isPaidLicense && SideviewApp.licenseEnd>0)
    }

    function hasSideviewLicense() {
        return (SideviewApp.hasOwnProperty("licenseEnd") && SideviewApp.licenseEnd>-1);
    }

    function legacyIsAppInstalled() {
        var appList = false;
        try {appList = Splunk.Module.loadParams.AccountBar_0_0_0.appList;}
        catch(e) {return -1;}
        if (!appList) return -1;
        for (var i=0,len=appList.length;i<len;i++) {
            if (appList[i].id == "sideview_utils") return 1;
        }
        return 0;
    }

    // Otherwise ModuleLoader fires a barrage of alerts that bewilder the user
    function buildStubModuleClasses() {
        var m = Splunk.Module;
        m.ArrayValueSetter = m.AutoRefresh = m.Button = m.CanvasChart = 
        m.Checkbox = m.Checkboxes = m.CheckboxPulldown = m.CustomBehavior = 
        m.CustomRESTForSavedSearch = m.DateTime = m.Events = m.Filters = 
        m.Gate = m.HTML = m.JobSpinner = m.LeftNavAppBar = m.Link = 
        m.Multiplexer = m.NavBar = m.Pager = m.PostProcess = m.Pulldown = 
        m.Radio = m.Redirector = m.Report = m.ResultsValueSetter = 
        m.SankeyChart = m.SavedSearch = m.Search = m.SearchControls = 
        m.ShowHide = m.SideviewUtils = m.Switcher = m.Table = m.Tabs = 
        m.TextField = m.Timeline = m.TreeMap = m.URLLoader = m.ValueSetter = 
        m.ZoomLinks = $.klass(m, {});
    }
    
    function checkVersions() {
        if (isSplunkTooOld()) {
            displayError("SplunkTooOld",true);
        }
        else if (isSideviewUtilsTooOld()) {
            displayError("SideviewUtilsTooOld",true);
        }
        if (isSideviewUtilsTooOld()) {
            buildStubModuleClasses()
        }
    }

    function populateExpirationDates() {
        var licenseExpireDate = getLicenseExpireDate();
        if (isTrialLicense()) {
            $("#TrialVersionNotice .expirationTime").text(licenseExpireDate.strftime(" on %B %e, %Y"));
        }
        if (isLicenseExpired()) {
            $("#TrialVersionExpired .expirationTime").text(licenseExpireDate.strftime("%b %d %Y"));
            $("#FullVersionExpired .expirationTime").text(licenseExpireDate.strftime("%b %d %Y"));
        }
        else if (isLicenseExpiring()) {
            var now = new Date();
            var expiresInDays = Math.ceil((expireDate - now.valueOf())/(1000*3600*24));
            $("#TrialVersionExpiring .expirationDays").text(expiresInDays.toString());
            $("#FullVersionExpiring .expirationDays").text(expiresInDays.toString());
            $("#TrialVersionExpiring .expirationDate").text(expireDate.strftime("%b %d %Y"));
            $("#FullVersionExpiring .expirationDate").text(expireDate.strftime("%b %d %Y"));
        }
        if (isSupportExpired()) {
            var expireDate = getSupportExpireDate();
            $("#FullVersionSupportExpired .expirationTime").text(expireDate.strftime("%b %d %Y"));
        }
        else if (isSupportExpiring()) {
            var expireDate = getSupportExpireDate();
            var now = new Date();
            var expiresInDays = Math.ceil((expireDate - now.valueOf())/(1000*3600*24));
            $("#FullVersionSupportExpiring .expirationDays").text(expiresInDays.toString());
            $("#FullVersionSupportExpiring .expirationDate").text(expireDate.strftime("%b %d %Y"));

        }
    }

    function checkLicense() {
        if (!hasSideviewLicense()) return;
        if (isTrialLicense()) {
            $("#TrialVersionNotice").show();
        }
        
        populateExpirationDates();
        
        if (isLicenseExpired()) {
            if (isPaidLicense() ) {
                displayError("FullVersionExpired",true);
            } 
            else if (isTrialLicense()) {
                displayError("TrialVersionExpired",true);
            }
        }
        else if (isLicenseExpiring()) {
            if (isPaidLicense() ) {
                displayError("FullVersionExpiring",false);
            } else if (isTrialLicense()) {
                displayError("TrialVersionExpiring",false);
            }
        } 
        else if (isSupportExpired()) {
            displayError("FullVersionSupportExpired",false);
        }
        else if (isSupportExpiring()) {
            displayError("FullVersionSupportExpiring",false);
        }
    }
    // courtesy of always(), this will run for both success and failure.
    function appResultsHandler(jsonResponse) {
        var installedVersion = false;
        try {
            installedVersion = jsonResponse.entry[0].content.version;
        } catch(e) {
            //console.error("Either Sideview Utils is not installed on this server, or we couldn't get the version out of the REST API response");
        }
        if (!installedVersion) {
            // maybe the rest call failed only because we're on an ancient version.
            var isInstalled = legacyIsAppInstalled();
            if (isInstalled!=1) {
                displayError("SideviewAppNotInstalled",true);
                return;
            }
        }
        checkVersions();
        checkLicense();
    }
    
    // On pages like "search", Sideview will be undefined always. 
    if (typeof(Sideview)=="undefined") {
        // note: this URL will only work as far back as 5.0. 
        // in 4.3 and earlier the endpoint does not accept output_mode=json
        var url = Splunk.util.make_url("/splunkd/__raw/services/apps/local/sideview_utils?output_mode=json");
        $.get(url).always(appResultsHandler);
        buildStubModuleClasses();
    } else {
        checkVersions();
        checkLicense();
    }
}
startupChecks();



if (typeof(Sideview)!="undefined") {

    var driven  = null;
    var drivers = {};

    Sideview.utils.declareCustomBehavior("buildMainReportingTokens", function(mod) {
        var ID_FIELDS    = ["SessionId"];
        var FIRST_FIELDS = [];
        var LAST_FIELDS  = [];
        var SUM_FIELDS   = [];

        
        function getFieldsFromExpression(expr) {
            var output = {};
            output["fields"] = [];
            output["definitive"] = false;
            var commands = Sideview.utils.getCommands(expr);
            if (commands.length==1 && commands[0].indexOf("search")==0) {
                output["fields"] = Sideview.utils.getFieldNamesFromSearchExpression(commands[0]);
                output["definitive"] = true;
            } 
            else if (commands.length>1){
                for (var i=0,len=commands.length;i<len;i++) {
                    if (commands[i].indexOf("search")==0) {
                        var newFields = Sideview.utils.getFieldNamesFromSearchExpression(commands[i]);
                        output["fields"] = output["fields"].concat(newFields);
                    }
                }
            }
            return output;
        }

        function getFieldsInSearchTerms(context) {
            var searchTerms = context.get("searchterms.rawValue");
            if (searchTerms) {
                return getFieldsFromExpression("search " + searchTerms);
            }
            return {"fields":[],"definitive":true};
        }

        function getRequiredFields(context, stFieldsDict) {
            var requiredFields = [];
            var xField = context.get("xField");
            var yField = context.get("yField");
            var zField = context.get("zField");

            if (xField) requiredFields.push(xField);
            if (yField) requiredFields.push(yField);
            if (zField) requiredFields.push(zField);


            if (context.get("OS")) requiredFields.push("OS");
            if (context.get("ServerName")) requiredFields.push("ServerName");
            if (context.get("UserName")) requiredFields.push("UserName");
            if (context.get("ApplicationName")) requiredFields.push("ApplicationName");
            if (context.get("Command")) requiredFields.push("Command");
            
            if (requiredFields.indexOf("duration")!=-1) {
                requiredFields.push("_time");
            }
            
            if (stFieldsDict.fields.length>0) {
                $.merge(requiredFields, stFieldsDict.fields);
            }
            
            requiredFields = requiredFields.filter(function(el,index) {
                //we don't want any ID_FIELDS in here, and we want to remove any duplicates.
                return (ID_FIELDS.indexOf(el) < 0) && (index == $.inArray(el, requiredFields));
            });
            return requiredFields;
        }

        function getStatsCommand(requiredFields) {
            var mainClauses = [];
            
            var statsFunctions=[];
            
            for (var i=0;i<requiredFields.length;i++) {
                var f = requiredFields[i];
                
                if (SUM_FIELDS.indexOf(f)!=-1) {
                    for (var j=0;j<SUM_FIELDS.length;j++) {
                        if (f==SUM_FIELDS[j]) {
                            statsFunctions.push("sum(" + f + ") as " + f);
                        }
                    }
                } 
                else if (f=="_time") {
                    statsFunctions.push("min(_time) as _time");
                }
                else if (FIRST_FIELDS.indexOf(f)!=-1) {
                    var ffIndex=FIRST_FIELDS.indexOf(f);
                    // you might say why not use earliest(),  for records in the same second earliest() seems to get it wrong half the time.
                    statsFunctions.push("last(" + FIRST_FIELDS_SOURCE[ffIndex] + ") as " + FIRST_FIELDS[ffIndex]);
                }
                else if (LAST_FIELDS.indexOf(f)!=-1) {
                    var lfIndex=LAST_FIELDS.indexOf(f);
                    // see above comment about earliest(), replacing earliest with latest.
                    statsFunctions.push("first(" + LAST_FIELDS_SOURCE[lfIndex] + ") as " + LAST_FIELDS[lfIndex]);
                }
                else if (f=="duration") {
                    statsFunctions.push("max(_time) as ended");
                }
                else {
                    statsFunctions.push("values(" + f + ") as " + f);
                }
            }
            if (requiredFields.length>0) {
                if ($(requiredFields).filter(ID_FIELDS).length>0) {
                    console.error("ASSERTION FAILED. Somehow one of the canonical ID fields ended up in our requiredFields array");
                }
                mainClauses.push("stats " + statsFunctions.join(" ") + " by " + ID_FIELDS.join(" "));
            }

            // a bit evil.  We can't move postStatsSearch to after postStatsTransform because duration-00:00:00
            // but we need to do these particular transforms before the postStatsSearch because duration_elapsed>100
            if (requiredFields.indexOf("duration")!=-1) {
                mainClauses.push("eval duration=ended - _time");
                mainClauses.push("fields - ended");
            }

            if (mainClauses.length>0) {
                return "| " + mainClauses.join(" | ") + " ";
            }
            return "";
        };

        mod.getModifiedContext = function() {
            var context = this.getContext();
            var stFieldDict       = getFieldsInSearchTerms(context);
            var requiredFields    = getRequiredFields(context, stFieldDict);
            //console.log("requiredFields are " + requiredFields.join(", "));
            var statsCommand = getStatsCommand(requiredFields)
            //console.log("statsCommand is " + statsCommand);
            context.set("transformation",  statsCommand + "\n");
            return context;
        }
    });
        

    Sideview.utils.declareCustomBehavior("sendPushesToDrilldownTable", function(mod) {
        drivers[mod.moduleId] = mod;
        mod.pushContextToChildren = function() {
            for (moduleId in drivers) {
                if (moduleId != this.moduleId) {
                    drivers[moduleId].parent.update();
                }
            }
            
            var context = this.getContext();
            if (context.get("charting.chart")=="pie" && context.get("click.value")=="other") {
                var messenger = Splunk.Messenger.System.getInstance();
                messenger.send("info", "observeit_app", _("Drilldown on 'other' in pie charts is not yet supported."));
                return;
            }
            if (context.get("click.name") == "Command") {
                var value = Sideview.utils.doubleQuoteValue(context.get("click.value") + "*");
                driven.searchTerms = context.get("click.name") + "=" + value;
            } else {
                driven.searchTerms = context.get("click.searchTerms");
            }
            driven.searchValue   = context.get("click.value");
            driven.selectedField = context.get("selectedField");

            driven.pushContextToChildren();
        }
    });
    
    Sideview.utils.declareCustomBehavior("receivePushes", function(mod) {
        driven = mod;
        mod.getModifiedContext = function() {
            var context = this.getContext();
            context.set("customSearchTerms", this.searchTerms);
            context.set("customSearchValue", this.searchValue);
            context.set("selectedField", this.selectedField);
            return context;
        }
    });
    
    Sideview.utils.declareCustomBehavior("clearPushes", function(mod) {
        mod.onContextChange = function() {
            driven.searchTerms = null;
        }
    });

    
    Sideview.utils.declareCustomBehavior("yFieldPulldown", function(pulldownModule) {
        var methodReference = pulldownModule.onContextChange.bind(pulldownModule);
        pulldownModule.enableAppropriateOptions = function() {
            var context = this.getContext();
            var stat = context.get("stat");
            var allow_only = (stat=="dc")? "categorical":"numeric";
            var opt, field;
            $("option",this.container).each(function() {
                opt = $(this);
                field = opt.attr("value");
                if (Sideview.fieldDict.hasOwnProperty(field)) {
                    value = Sideview.fieldDict[field][allow_only];
                    if (value) {
                        opt.removeAttr("disabled");
                    } else {
                        opt.attr("disabled","disabled");
                    }
                }
            });
            var currentValue = this.select.val();
            if (!currentValue && allow_only=="numeric") {
                this.select[0].selectedIndex=1;
                this.onPassiveChange();
            } else if (!currentValue && allow_only=="categorical") {
                this.select[0].selectedIndex=0;
                this.onPassiveChange();
            }
        }
        pulldownModule.onContextChange = function() {
            this.enableAppropriateOptions();
            return methodReference();
        }
    });

    Sideview.utils.declareCustomBehavior("tabFields",   
        function(tabsModule) {
            var baseMethodReference = tabsModule.getModifiedContext.bind(tabsModule);
            tabsModule.getModifiedContext = function() {
                var modCon = baseMethodReference();
                var field = modCon.get("field");
                var label = modCon.get("field.label");
                label = label.replace(/\s\(\d+\)/,"");
                modCon.set("field.label", label);
                modCon.set("field.lowercaseLabel",label.toLowerCase());

                if (field!="SessionId") {
                    modCon.set("reportSplitBy", field);
                }
                return modCon;
            }
        }
    );

    Sideview.utils.declareCustomBehavior("bouncer",
        function(module) {

            module.onContextChange = function() {
                var context = this.getContext();
                var field=context.get("field");
                if (field=="SessionId") return context;

                var selectedValue = context.get("row.fields." + field);
                
                var upwardContext = new Splunk.Context();
                // reset the tab to Sessions
                upwardContext.set("field","SessionId");

                if (["OS","ServerName","UserName","ApplicationName","Command"].indexOf(field)!=-1) {
                    upwardContext.set(field,selectedValue);
                } else {
                    var searchterms = context.get("searchterms.rawValue") || "";
                    searchterms = field + "=\"" + selectedValue + "\" " + searchterms;
                    upwardContext.set("searchterms",searchterms);
                }
                this.passContextToParent(upwardContext);
            }
        }
    );
        


    if (["browse_sessions","browse","users"].indexOf(Splunk.util.getCurrentView())!=-1) {
        if (Splunk.Module.FieldPicker) {
            Splunk.Module.FieldPicker = $.klass(Splunk.Module.FieldPicker, {
                initialize: function($super, container) {
                    Sideview.fieldPickerInstance = this;
                    var currentView = Splunk.util.getCurrentView();
                    if (currentView=="users") {
                        this.defaultFields = ["UserName","LoginName","ServerName","ClientName","duration","Slides"];
                    } else if (currentView=="browse_sessions") {
                        this.defaultFields = ["UserName","LoginName","ServerName","ClientName","duration","ApplicationsAndCommands","Slides"];
                    }
                    return $super(container);
                }, 
                /* the horror.  I forgot there was a setFields intention. */
                applyContext: function() {},

                getModifiedContext: function($super) {
                    var context = this.getContext();
                    var fields = ["_time"].concat(this.selectedFields);
                    context.set("results.fields", fields);
                    return context;
                }, 
                resetTo: function(fields)  {
                    this.onPopupClearAll();
                    var fieldToElementMap = {};
                    
                    var that = this;
                    $(this.POPUP_NON_SELECTED_FIELDS_SELECTOR, popupContainer).each(function(){
                        var term = $(this).attr(that.POPUP_SELECTED_FIELD_NAME_ATTR);
                        if (jQuery.inArray(term, fields)==-1) {
                            fieldToElementMap[term] = $(this);
                        }
                    });

                    for (var i=0,len=fields.length;i<len;i++) {
                        var term = fields[i];
                        this.selectedFields.push(term);
                        if (fieldToElementMap.hasOwnProperty(term)) {
                            fieldToElementMap[term].addClass(this.POPUP_SELECTED_FIELD_CLASS_NAME);
                        }
                        var popupContainer = this.popup.getPopup();
                        var selectedFieldTemplate = sprintf(this.POPUP_SELECTED_FIELD_HTML_TEMPLATE, {fieldName: Sideview.utils.escapeHTML(term)});
                        $("." + this.POPUP_SELECTED_FIELD_CONTAINER_CLASS_NAME, popupContainer).append($(selectedFieldTemplate));
                    }
                },
                
                resetToDefault: function() {
                    this.resetTo(this.defaultFields);
                },

                // word salad ftw
                onUIEventPopupBindSortableSelectedFields: function($super) {
                    var retVal = $super();
                    var clearAllLink = $(".FieldPickerPopup ." + this.POPUP_REMOVE_ALL_CLASS_NAME);
                    var resetToDefaultLink =$("<a>")
                        .addClass("extraLinkCreatedBySideview")
                        .html("&laquo; Reset to default fields")
                        .click(this.resetToDefault.bind(this));
                    clearAllLink.after(resetToDefaultLink);

                    
                    resetToDefaultLink.after(clearAllLink);

                    resetToDefaultLink.after($("<br>"));

                    return retVal;
                }

            });
        }
        // blending into the ui's green button parade.
        var link = $(".FieldPicker a.fpActivate");
        link.text("");
        link.addClass("splButton-primary save");
        link.append($("<span>").text("Edit Fields"));
    }

    

    Sideview.fieldDict = {
        "SessionId": {"numeric": 0, "categorical": 1, "time":0},
        "ApplicationName": {"numeric": 0, "categorical": 1, "time":0},
        "ClientName": {"numeric": 0, "categorical": 1, "time":0},
        "Command": {"numeric": 0, "categorical": 1, "time":0},
        "CommandBase": {"numeric": 0, "categorical": 1, "time":0},
        "CommandInvocation": {"numeric": 0, "categorical": 1, "time":0},
        "DomainName": {"numeric": 0, "categorical": 1, "time":0},
        "duration": {"numeric": 1, "categorical": 0, "time":0},
        "ended": {"numeric": 0, "categorical": 0, "time":1},
        "eventtype": {"numeric": 0, "categorical": 1, "time":0},
        "FirstScreenshotTime": {"numeric": 0, "categorical": 0, "time":1},
        "host": {"numeric": 0, "categorical": 1, "time":0},
        "LoginName": {"numeric": 0, "categorical": 1, "time":0},
        "OS": {"numeric": 0, "categorical": 1, "time":0},
        "ScreenshotID": {"numeric": 0, "categorical": 1, "time":0},
        "ServerName": {"numeric": 0, "categorical": 1, "time":0},
        "SessionId": {"numeric": 0, "categorical": 1, "time":0},
        "source": {"numeric": 0, "categorical": 1, "time":0},
        "sourcetype": {"numeric": 0, "categorical": 1, "time":0},
        "UserName": {"numeric": 0, "categorical": 1, "time":0},
        "ViewerURL": {"numeric": 0, "categorical": 1, "time":0},
        "WindowTitle": {"numeric": 0, "categorical": 1, "time":0}
    };



}





