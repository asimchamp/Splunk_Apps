

RESTConfig = {}
MacroConfig = {}
window.HaveRunCollectThisTime = false 

GotConfigEndpoint = $.Deferred()
GotMacroEndpoint = $.Deferred()

var standardConfig = [
    { "name": "max-short-term",
        "type": "int",
        "default": "3600",
        "source": "kvstore",
        "description": "For short term searches, it's far more performant to run a subsearch that looks for all the recently completed searches, and then looks for their data over the past buffer-in-hours-for-long-term-backfill (default: 24 hours) to get their entire history. This parameter defines how long of a time window we will run this short term search over. Generally speaking, you should probably leave this at 1 hour (3600 seconds) but run the summary job at the default schedule of every 6 minutes."},
    { "name": "long-term-range",
        "type": "int",
        "default": "4147200",
        "source": "kvstore",
        "description": "When we run the backfill searches, this parameter indicates how long the searches will run for. In large environments, this may be only a day (maybe even less for the most extreme customers!), but for most environments, a value of 3-6 days (measured in seconds) is typical. If your system has an outrageously heavy load, it could be lowered to improve performance, in conjunction with buffer-in-hours-for-long-term-backfill."},
    { "name": "ldap-config",
        "type": "string",
        "default": "",
        "source": "kvstore",
        "description": "This is the configuration set during setup to indicate whether to use ldap or not."},
    { "name": "ldap-domain",
        "type": "string",
        "default": "",
        "source": "kvstore",
        "description": "Should match SA-LDAPSearch-Domain. This is the rest configuration for the sa-ldapsearch that is configured during setup."},
    { "name": "SA-LDAPSearch-Domain",
        "type": "string",
        "default": "",
        "source": "macro",
        "description": "Should match ldap-domain -- this is the macro that is actually used for configuring the LDAP Domain for sa-ldapsearch if enabled."},
    { "name": "check-for-duplicates",
        "type": "int",
        "default": "1",
        "source": "kvstore",
        "description": "Should be 1, indicating that we will check for duplicates before running a backfill. Could also be set to 0 if desired... though remember that if you are using the default of _audit for sending data, you cannot | delete that data ever, so duplicates will live forever."},
    { "name": "buffer-in-hours-for-long-term-backfill",
        "type": "int",
        "default": "24",
        "source": "kvstore",
        "description": "When we run the backfill searches, we automatically add a buffer at the start so that we can catch long-running searches. I.e., if we need tues-thurs, we will search mon-thurs but filter for searches that completed tues-thurs, so we can catch the beginning of all the searches. This parameter is typically slightly over 1 day (allowing for full visibility of searches up to 24 hours in length), and is set automatically during setup by the system after introspecting data. If your system has an outrageously heavy load, it could be lowered to improve performance, in conjunction with long-term-range. This value is in hours, whereas everything else is in seconds."},
    { "name": "debug",
        "type": "int",
        "default": "1",
        "source": "kvstore",
        "description": "Should usually be 1 (log debug info), could also be 0 (do not log). Controls the level of debug information output when running | sabackfill (and logged to index=_internal sourcetype=searchactivity:log)."},
    { "name": "backfill-status",
        "type": "string",
        "default": "",
        "source": "kvstore",
        "description": "This tracks the status of the backfill. Options include: \"normal\" for typical operating mode, \"no-backfill\" which will run once and then switch to normal, \"general\" for going from an earliest time to now() (e.g., backfill going back a month), and \"selective\" for backfilling between specific time ranges. Once any backfill method completes, it will switch to normal."},
    { "name": "earliest-time",
        "type": "int",
        "default": "",
        "source": "kvstore",
        "description": "When running a backfill, this is the primary factor, tracking when the next search should run. When not backfilling, it should be empty. Epoch format."},
    { "name": "latest-time",
        "type": "int",
        "default": "",
        "source": "kvstore",
    "description": "When running a selective backfill, this marks the end time that the backfill will run to. When not backfilling, it should be empty. Epoch format."},
    { "name": "conversion-status",
        "type": "string",
        "default": "none",
        "source": "kvstore",
        "description": "This tracks the status of a conversion the data from Search Activity 2.x to the 3.x format. Options include: \"none\" which is the default, \"complete\" for after the conversion has completed, or \"converting\" for while the conversion is ongoing. Setup conversion via the main setup flow."},
    { "name": "conversion-earliest-time",
        "type": "int",
        "default": "",
        "source": "kvstore",
        "description": "When running a conversion, this is the primary factor, tracking when the next search should run. When not converting, it should be empty. Epoch format."},
    { "name": "conversion-latest-time",
        "type": "int",
        "default": "",
        "source": "kvstore",
    "description": "When running a conversion, this marks the end time that the conversion will run to. When not converting, it should be empty. Epoch format."},
    { "name": "FillSearchHistory_SummaryIndex",
        "type": "string",
        "default": "_audit",
        "source": "macro",
        "description": "This is the index that summary events are sent to (almost always _audit)."},
    { "name": "ldapsearch_lookup",
        "type": "string",
        "default": "lookup LDAPSearch sAMAccountName as user OUTPUTNEW",
        "source": "macro",
        "description": "TBD"},
    { "name": "ldapsearch_lookup(1)",
        "type": "string",
        "default": "lookup LDAPSearch sAMAccountName as user OUTPUTNEW $fields$",
        "source": "macro",
        "description": "TBD"},
    { "name": "auditindex",
        "type": "string",
        "source": "macro",
        "description": "TBD"},
    { "name": "auditsourcetype",
        "type": "string",
        "source": "macro",
        "description": "TBD"},
    { "name": "internal_index",
        "type": "string",
        "source": "macro",
        "description": "TBD"},
    { "name": "web_access_sourcetype",
        "type": "string",
        "source": "macro",
        "description": "TBD"},
    { "name": "metrics_sourcetype",
        "type": "string",
        "source": "macro",
        "description": "TBD"},
    { "name": "scheduler_sourcetype",
        "type": "string",
        "source": "macro",
        "description": "TBD"}
]



$.when(GotConfigEndpoint, GotMacroEndpoint).then(function(){
    require(["jquery","/static/js/splunkjs/ready.js"], function($, Ready) {onPageLoad()})
})

$.ajax({
    url: '/splunkd/__raw/servicesNS/nobody/search_activity/storage/collections/data/sa_app_configuration',
    async: true,
    success: function(returneddata) {
        for (var i = 0; i < returneddata.length; i++) {
            RESTConfig[returneddata[i].name] = returneddata[i].value
        }
        for(var i = 0; i < standardConfig.length; i++){
            if(standardConfig[i].source == "kvstore" && typeof standardConfig[i].default != "undefined" && typeof RESTConfig[ standardConfig[i].name ] == "undefined"){
                console.log("found a missing parameter!")
                updateRESTConfig(standardConfig[i].name, standardConfig[i].default)
            }
        }
        GotConfigEndpoint.resolve()
    },
    error: function(xhr, textStatus, error) {
        console.error("Error!", xhr, textStatus, error);
    }
});

var macroDeferrals=[]
for(var i = 0; i < standardConfig.length; i++){
    if(standardConfig[i].source=="macro"){
        var newDeferral = $.Deferred();
        getMacroValue(standardConfig[i].name, newDeferral)
        macroDeferrals.push(newDeferral)
    }
}

$.when.apply($, macroDeferrals).then(function() {
    GotMacroEndpoint.resolve()
})


function updateRESTConfig(name, value) {
    RESTConfig[name] = value;
    var record = {
        _time: (new Date).getTime() / 1000,
        "name": name,
        "value": value,
        "_key": name
    }
    $.ajax({
        url: '/en-US/splunkd/__raw/servicesNS/nobody/search_activity/storage/collections/data/sa_app_configuration/' + name,
        type: "POST",
        async: true,
        contentType: "application/json",
        data: JSON.stringify(record),
        success: function(returneddata) {
            console.log("Updated!", returneddata)
        },
        error: function(xhr, textStatus, error) {
            console.error("Error Updating!", xhr, textStatus, error);

            $.ajax({
                url: '/en-US/splunkd/__raw/servicesNS/nobody/search_activity/storage/collections/data/sa_app_configuration',
                type: "POST",
                async: true,
                contentType: "application/json",
                data: JSON.stringify(record),
                success: function(returneddata) {
                    console.log("Added!", returneddata)
                },
                error: function(xhr, textStatus, error) {
                    console.error("Error Adding!", xhr, textStatus, error);
                }
            });
        }
    });
}


function getMacroValue(macroName, deferral){
    $.ajax({
        url: '/splunkd/__raw/servicesNS/nobody/search_activity/properties/macros/' + macroName + '/definition',
        async: true,
        success: function(returneddata) {
            console.log("Got macro value", returneddata, macroName)
            MacroConfig[macroName] = returneddata
            deferral.resolve()
        },
        error: function(xhr, textStatus, error) {
            console.error("Error!", xhr, textStatus, error);
            deferral.resolve()
        }
    });
}
function updateMacro(name, value) {
    MacroConfig[name] = value
    var appscope = {}
    appscope['owner'] = "admin"; //Splunk.util.getConfigValue("USERNAME");
    appscope['app'] = "search_activity";
    appscope['sharing'] = "app";
    var mystanza = []
    mystanza['definition'] = value
    mystanza['iseval'] = 0
    var svc = splunkjs.mvc.createService();
    var files = svc.configurations(appscope);
    var fileDeferred = $.Deferred();
    files.fetch({ 'search': 'name=macros"' }, function(err, files) {
        var macrosFile = files.item("macros");
        if (!macrosFile) {
            //  Create the file here
            macrosFile = files.create('macros', function(err, macrosFile) {
                if (err) {
                    // Error case, throw an exception dialog to user here.
                    // console.log("Caught an error in transforms", err, macrosFile)
                    failureCallback()
                    return false;
                }
                fileDeferred.resolve(macrosFile);
            });
        } else {
            fileDeferred.resolve(macrosFile)
        }
    });
    fileDeferred.done(function(macrosFile) {
        macrosFile.post(name, mystanza, function(err, stanza) {
            if (err) {
                console.log("Caught an error in stanza", err, stanza)
                    //failureCallback()
                    //return false;
            } else {
                console.log("Caught a success", err)
                    //document.getElementById("StatusMessages").innerHTML = document.getElementById("StatusMessages").innerHTML + "Lookup Entry w/ Transforms Created!<br/>"
                    //successCallback();
                return true;
            }
        })
    });
}
function createMacro(name, value) {
    MacroConfig[name] = value
    var appscope = {}
    appscope['owner'] = "admin"; //Splunk.util.getConfigValue("USERNAME");
    appscope['app'] = "search_activity";
    appscope['sharing'] = "app";
    var mystanza = []
    mystanza['definition'] = value
    mystanza['iseval'] = 0
    var svc = splunkjs.mvc.createService();
    var files = svc.configurations(appscope);
    var fileDeferred = $.Deferred();
    files.fetch({ 'search': 'name=macros"' }, function(err, files) {
        var macrosFile = files.item("macros");
        if (!macrosFile) {
            //  Create the file here
            macrosFile = files.create('macros', function(err, macrosFile) {
                if (err) {
                    // Error case, throw an exception dialog to user here.
                    // console.log("Caught an error in transforms", err, macrosFile)
                    failureCallback()
                    return false;
                }
                fileDeferred.resolve(macrosFile);
            });
        } else {
            fileDeferred.resolve(macrosFile)
        }
    });
    fileDeferred.done(function(macrosFile) {
        macrosFile.create(name, mystanza, function(err, stanza) {
            if (err) {
                console.log("Caught an error in stanza", err, stanza)
                    //failureCallback()
                    //return false;
            } else {
                console.log("Caught a success", err)
                    //document.getElementById("StatusMessages").innerHTML = document.getElementById("StatusMessages").innerHTML + "Lookup Entry w/ Transforms Created!<br/>"
                    //successCallback();
                return true;
            }
        })
    });
}
function deleteMacro(name) {
    
    var appscope = {}
    appscope['owner'] = "admin"; //Splunk.util.getConfigValue("USERNAME");
    appscope['app'] = "search_activity";
    appscope['sharing'] = "app";
    var svc = splunkjs.mvc.createService();
    var files = svc.configurations(appscope);
    var fileDeferred = $.Deferred();
    files.fetch({ 'search': 'name=macros"' }, function(err, files) {
        var macrosFile = files.item("macros");
        if (!macrosFile) {
            //  Create the file here
            macrosFile = files.create('macros', function(err, macrosFile) {
                if (err) {
                    // Error case, throw an exception dialog to user here.
                    // console.log("Caught an error in transforms", err, macrosFile)
                    failureCallback()
                    return false;
                }
                fileDeferred.resolve(macrosFile);
            });
        } else {
            fileDeferred.resolve(macrosFile)
        }
    });
    fileDeferred.done(function(macrosFile) {
        macrosFile.del(name, function(err, stanza) {
            if (err) {
                console.log("Caught an error in stanza", err, stanza)
                    //failureCallback()
                    //return false;
            } else {
                console.log("Caught a success", err)
                    //document.getElementById("StatusMessages").innerHTML = document.getElementById("StatusMessages").innerHTML + "Lookup Entry w/ Transforms Created!<br/>"
                    //successCallback();
                return true;
            }
        })
    });
}

function handleCollectContainer() {
    var checks = [{
            "name": "Existing Configuration Retrieved",
            "validationCheck": function(myDeferral, element) {
                GotConfigEndpoint.done(function(){
                    myDeferral.resolve("Success", element);
                })
                
            },
            "link": ""
        },
        {
            "name": "Is SA-ldapsearch Installed? This will allow us to grab a regularly updated list of users in your environment.",
            "validationCheck": function(myDeferral, element) {
                $.ajax({
                    type: "GET",
                    url: "/en-US/splunkd/__raw/servicesNS/-/-/apps/local?count=0&output_mode=json",
                    success: function(data, textStatus, xhr) {
                        var success = false;
                        for (var i = 0; i < data['entry'].length; i++) {
                            if (data['entry'][i].name == "SA-ldapsearch") {
                                myDeferral.resolve("Success", element);
                                success = true;
                                // Can now add a new check to look for the domains
                            }

                        }
                        if(success == false){
                            myDeferral.resolve("Warning", element);
                            $("#ldapoptions-saldap").parent().html('<p style="font: gray; padding-right: 0;"><a href="https://splunkbase.splunk.com/app/1151/" target="_blank" class="ext">App</a> missing</p>')

                        }
                    },
                    error: function(xhr, textStatus, error) {
                        console.error("Error!", xhr, textStatus, error);
                        $("#ldapoptions-saldap").parent().html('<p style="font: gray; padding-right: 0;"><a href="https://splunkbase.splunk.com/app/1151/" target="_blank" class="ext">App</a> missing</p>')
                        if(typeof RESTConfig["ldap-config"] != "undefined" && RESTConfig["ldap-config"] == "sa-ldap"){
                            updateRESTConfig("ldap-config","");
                            enableSetupSteps();
                        }
                        myDeferral.resolve("Error", element);
                    }
                });
            },
            "link": "/app/search_activity/search?q=%7C%20rest%20%2FservicesNS%2F-%2F-%2Fapps%2Flocal%20%7C%20table%20title%20%7C%20search%20title%3DSA-ldapsearch"
        },
        {
            "name": "SA-ldapsearch domains set up? In order to use SA-ldapsearch, you must configure domains in ldap.conf (and restart Splunk)",
            "validationCheck": function(myDeferral, element) {
                searchHandler(  "ldap-domains-search-collect", 
                "| rest splunk_server=local \"/servicesNS/nobody/SA-ldapsearch/properties/ldap\" | table title | where title!=\"default\"", 
                {}, 
                function(numEvents, data, properties) {
                    var success = false;
                    if (numEvents >= 1) {
                        myDeferral.resolve("Success", element); 
                    }else{
                        $("#ldapoptions-saldap").parent().html('<p style="font: gray; padding-right: 0;">No domains found</p>')
                        if(RESTConfig["ldap-config"] == "sa-ldap"){
                            updateRESTConfig("ldap-config", "");
                            updateRESTConfig("ldap-domain", "");
                            enableSetupSteps();
                        }
                        myDeferral.resolve("None Found", element); 
                    }
                })
            },
            "link": '/app/search_activity/search?q=%7C%20rest%20splunk_server%3Dlocal%20"%2FservicesNS%2Fnobody%2FSA-ldapsearch%2Fproperties%2Fldap"%20%7C%20table%20title%20%7C%20search%20title!%3Ddefault'
        },
        {
            "name": "Is a local LDAPSearch.csv available?",
            "validationCheck": function(myDeferral, element) {
                searchHandler("check_if_ldapsearch_is_populated", " | inputlookup LDAPSearch | stats count", {},
                    function(numEvents, data, properties) {
                        var success = false;
                        if (numEvents == 1) {
                            if (data[0]['count'] > 1) {
                                myDeferral.resolve("Success", element);
                                success = true;
                            }
                        }
                        if (success == false) {
                            myDeferral.resolve("Not Found", element)
                            $("#ldapoptions-existing").parent().html('<p style="font: gray; padding-right: 0;">No lookup found</p>')
                            if(typeof RESTConfig["ldap-config"] != "undefined" && RESTConfig["ldap-config"] == "staticlookup"){
                                updateRESTConfig("ldap-config","");
                            }
                        }
                    })

            },
            "link": "/app/search_activity/search?q=%7C%20rest%20%2FservicesNS%2F-%2F-%2Fapps%2Flocal%20%7C%20table%20title%20%7C%20search%20title%3DSA-ldapsearch"
        },
        {
            "name": "Is legacy 2.x data present?",
            "validationCheck": function(myDeferral, element) {
                if(RESTConfig["conversion-status"] != "completed"){
                    searchHandler("check_for_legacy_data", "| tstats count min(_time) as earliest max(_time) as latest from splunk_search_usage.searchhistory where earliest=0 latest=now | eval conversion_long_term_range = round((latest - earliest) / (count/40000),0)", {},
                    function(numEvents, data, properties){
                        updateRESTConfig("historical-data-from-sse-2-found", data[0]["count"]);
                        if(data[0]["count"] == 0){
                            myDeferral.resolve("N/A", element);
                        }else{
                            myDeferral.resolve(data[0]["count"] + " events found", element);
                            updateRESTConfig("historical-data-from-sse-2-earliest", data[0]["earliest"]);
                            updateRESTConfig("historical-data-from-sse-2-latest", data[0]["latest"]);
                            updateRESTConfig("conversion-long-term-range", data[0]["conversion_long_term_range"]);
                            
                            var body=$("<div></div>")
                            body.append("<p>We found historical data in the system! You have " + data[0]["count"] + " events ranging from " + (new Date( data[0]["earliest"] * 1000 )).toLocaleDateString() + " to " + (new Date( data[0]["latest"] * 1000 )).toLocaleDateString() + ".</p>")
                            body.append("<p>The data storage mechanism has changed in Search Activity 3.0 from using the deprecated tscollect function which stores tscollect files locally on the search head (without a standardized management method) to using the much more normal process of summary indexing the results into an index and then accessing that data via an accelerated data model.</p>")
                            body.append("<p>If desired, we can convert your existing data to the new format for you. We will have a scheduled job that runs every five minutes and grabs approximately 50k results, and sends them out through the new summary indexing methodology. This process will take approximately " + Math.round(data[0]["count"] / 50000 * 5 / 60, 2) + " hour(s) to complete, and then the system will continue on with backfilling as configured on the data menu screen.</p>")
                            body.append("<p>Would you like to backfill?</p>")
                            var div=$("<div></div>").append(
                                $("<button>Yes</button>").click(function(){ 
                                    updateRESTConfig("conversion-status", "converting")
                                    updateRESTConfig("conversion-choice-made", "yes")
                                    updateRESTConfig("conversion-earliest-time", RESTConfig["historical-data-from-sse-2-earliest"])
                                    updateRESTConfig("conversion-latest-time", RESTConfig["historical-data-from-sse-2-latest"])
                                    setSearch("Convert Search Activity 2.x Summaries", true, "3,8,13,18,23,28,33,38,43,48,53,58 * * * *")
                                    createModal("conversion-enabled", "Conversion Set Up", $("<p>Conversion has been set up, and will continue every 5 minutes until complete, at which point it will automatically disable itself.</p>"), [],
                                    [
                                        {   "classes": "btn-primary", 
                                            "label": "Ok"
                                        }
                                    ])
                                    $("#DataContainer").find("tr.normal").hide()
                                    $("#DataContainer").find("tr.convert").show()
                                    
                                    $("#ConversionContainer").find(".btn-primary").removeAttr("disabled");

                                }),
                                $("<button>No</button>").click(function(){ 
                                    updateRESTConfig("conversion-status", "none")
                                    setSearch("Convert Search Activity 2.x Summaries", false)
                                    updateRESTConfig("conversion-choice-made", "yes")
                                    createModal("conversion-enabled", "Conversion Disabled", $("<p>Conversion has <b>not</b> been set up, and any previous conversions have been disabled. If you have a desire to run a conversion in the future, you may come back to setup to configure it.</p>"), [],
                                    [
                                        {   "classes": "btn-primary", 
                                            "label": "Ok"
                                        }
                                    ])
                                    $("#DataContainer").find("tr.normal").show()
                                    $("#DataContainer").find("tr.convert").hide()
                                    $("#ConversionContainer").find(".btn-primary").removeAttr("disabled");
                                })
                            )
                            body.append(div)
                            $("#ConversionContent").html(body)

                        }
                    })
                }else{
                    var body=$("<div><p>Conversion completed!</p></div>")
                    $("#ConversionContent").html(body)
                }
                
            },
            "link": "/app/search_activity/search?q=%7C%20tstats%20count%20from%20splunk_search_usage.searchhistory%20where%20earliest%3D0%20latest%3Dnow"
        },
        {
            "name": "Density of _audit data",
            "validationCheck": function(myDeferral, element) {
                searchHandler("check_for_data_density", "| tstats count where index=_audit TERM(info=granted) TERM(action=search) TERM(search=) NOT TERM(typeahead) earliest=-7d by _time span=1h | stats median(count) as num_records_per_hour sum(count) as count perc95(count) as numperhour | eval long_term_range=min(6*24, round(1000000/numperhour - 0.5,0)) | eval buffer=min(24, round(long_term_range/2,0)) | eval researched_rate_per_minute_for_backfill = 750000/8 | eval num_runs_per_week = 7*24/long_term_range | eval num_records_per_run = num_records_per_hour * (long_term_range + buffer) | eval median_time_per_run = num_records_per_run / researched_rate_per_minute_for_backfill | eval minutes_to_backill_one_week = num_runs_per_week * max(6, 3 + median_time_per_run)", {},
                function(numEvents, data, properties){
                    if(numEvents == 0 || data[0].numperhour == 0){
                        myDeferral.resolve("ERROR", element);
                        console.log("No events found", numEvents, data)
                        triggerGlobalError("No data found -- verify that you have access to index=_audit in order to complete setup.");
                    }else{
                        updateRESTConfig("minutes-to-backfill-one-week", data[0]["minutes_to_backill_one_week"]);
                        updateRESTConfig("buffer-in-hours-for-long-term-backfill", data[0]["buffer"]);
                        updateRESTConfig("long-term-range", data[0]["long_term_range"] * 3600);  
                        updateRESTConfig("95th-percentile-records-per-hour", data[0]["numperhour"]);  
                        $("#backfill-none").parent().parent().find(".expected-backfill-duration").text("N/A");
                        $("#backfill-1week").parent().parent().find(".expected-backfill-duration").text(Math.round((data[0]["minutes_to_backill_one_week"] / 60),2) + " hours");
                        $("#backfill-1month").parent().parent().find(".expected-backfill-duration").text(Math.round(((52/12) * data[0]["minutes_to_backill_one_week"] / 60 ),2) + " hours");
                        $("#backfill-6months").parent().parent().find(".expected-backfill-duration").text(Math.round(((52/2) * data[0]["minutes_to_backill_one_week"] / 60 ),2) + " hours");
                        $("#backfill-12months").parent().parent().find(".expected-backfill-duration").text(Math.round(( 52 * data[0]["minutes_to_backill_one_week"] / 60 ),2) + " hours"); 
                        var message = "Success! Typical load found."
                        if(data[0]["buffer"] < 24){
                            message = "Warning! <a href=\"#\" onclick=\"throwHighLoadWarning()\; return false;\">High load found</a>"
                        }
                        myDeferral.resolve(message, element);

                    }
                })

            },
            "link": "/app/search_activity/search?q=%7C%20tstats%20count%20where%20index%3D_audit%20TERM(info%3Dgranted)%20TERM(action%3Dsearch)%20TERM(search%3D)%20NOT%20TERM(typeahead)%20earliest%3D-7d%20by%20_time%20span%3D1h%20%7C%20stats%20perc95(count)%20as%20numperhour%20%7C%20eval%20numhours%3Dmin(6*24%2C%20round(2000000%2Fnumperhour%20-%200.5%2C0))%2C%20buffer%3Dmin(24%2C%20round(numhours%2F2%2C0))"
        },
        {
            "name": "Check Data Model",
            "validationCheck": function(myDeferral, element) {
                checkDatamodelHealth();
                $("#acceleration-status").append($("<button>Refresh</button>").click(function(){ checkDatamodelHealth() }))
                $("#rebuild-datamodels").html($("<button>Rebuild</button>").click(function(){
                                
                    createModal("rebuild-datamodel-confirm", "Confirm Data Model Rebuilding",
                    $("<p>When rebuilding, you won't have access to this app for up to a few hours while the data rebuilds. Please confirm.</p>"), 
                    [], 
                    [
                        {   "label": "Cancel", 
                            "callback": function(){
                            } 
                        },
                        {   "classes": "btn-primary", 
                            "label": "Ok", 
                            "callback": function(){
                                rebuildDatamodel("Search_Activity_App_Data_Model")
                            } 
                        }
                    ])
                }))
                myDeferral.resolve("Success", element)
            },
            "link": "/app/search_activity/search?q=%7C%20tstats%20count%20where%20index%3D_audit%20TERM(info%3Dgranted)%20TERM(action%3Dsearch)%20TERM(search%3D)%20NOT%20TERM(typeahead)%20earliest%3D-7d%20by%20_time%20span%3D1h%20%7C%20stats%20perc95(count)%20as%20numperhour%20%7C%20eval%20numhours%3Dmin(6*24%2C%20round(2000000%2Fnumperhour%20-%200.5%2C0))%2C%20buffer%3Dmin(24%2C%20round(numhours%2F2%2C0))"
        }
    ]
    if( $("#data_collect_table").find("tbody").find("tr").length == 0 ){
            
        for (var i = 0; i < checks.length; i++) {
            var link = "";
            if (typeof checks[i].link != "undefined" && checks[i].link != "") {
                link = '<a href="' + checks[i].link + '" class="ext external" target="_blank">Launch</a>'
            }
            $("#data_collect_table").find("tbody").append("<tr id=\"datacheck" + i + "\"><td>" + checks[i]['name'] + '</td><td class="data-check-status"></td><td>' + link + '</td></tr>')
        }
        var allDeferrals = [];
        for (var i = 0; i < checks.length; i++) {
            $("#datacheck" + i).find(".data-check-status").text("In Progess");
            var myDeferral = $.Deferred()
            allDeferrals.push(myDeferral);
            checks[i].validationCheck(myDeferral, $("#datacheck" + i).find(".data-check-status"));
            myDeferral.done(function(check_return, element) {
                console.log("Got a return value", check_return, element)
                element.text(check_return);
            })
        }
        $.when.apply($, allDeferrals).then(function() {
            $("#CollectContainer").find(".btn-primary:visible").removeAttr("disabled")
            updateRESTConfig("collect-complete", "true");
            setTimeout(function(){enableSetupSteps()}, 500);
            $("#backfill-convert-normal").parent().parent().find(".expected-backfill-duration").text("Up to " + Math.round( ( ( (new Date).getTime()/1000 - RESTConfig["historical-data-from-sse-2-latest"]  )  /  (7*24*3600)) * RESTConfig["minutes-to-backfill-one-week"] / 60, 2) + " hours")
            window.HaveRunCollectThisTime = true
        })
    }

}







function SwitchSection(section) {
    console.log("Changing style to: ", section)
    $(".statuscontainer").hide();
    $(".stage-nav").find("a").css("text-decoration", "none");
    
    document.getElementById(section).style.display = "block";
    if (section == "BasicLDAPContainer") {
        document.getElementById("link_BasicLDAP").style.textDecoration = "underline"
    }
    if (section == "CollectContainer") {
        handleCollectContainer()
    }

    if (section == "DataContainer") {
        document.getElementById("link_Data").style.textDecoration = "underline"
    }
    if (section == "DataModelContainer") {
        document.getElementById("link_DataModels").style.textDecoration = "underline";
    }
    enableSetupSteps();
}

function UpdateLDAPConfig() {
    var value = "noldap"
    if (document.getElementById("ldapoptions-noldap").checked == true) {
        updateRESTConfig("ldap-config", "noldap")
        updateRESTConfig("ldap-domain", "");
        updateMacro("ldapsearch_lookup(1)", "noop")
        updateMacro("ldapsearch_lookup", "noop")

        setSearch("Generate LDAPSearch Lookup", false);
        setSearch("Generate LDAPMgmtChain Lookup", false);

        // Blanking out lookup 
        searchHandler("ClearLookup", " | inputlookup LDAPSearch | where a=b | outputlookup LDAPSearch", {}, null, function(properties) { console.log("Error blanking out lookup", properties) })

        // TODO: re-run health checks maybe? To indicate that this side is now clear.
    }
    if (document.getElementById("ldapoptions-saldap") != null && document.getElementById("ldapoptions-saldap").checked == true) {

        updateMacro("ldapsearch_lookup(1)", "lookup LDAPSearch sAMAccountName as user OUTPUTNEW $fields$")
        updateMacro("ldapsearch_lookup", "lookup LDAPSearch sAMAccountName as user OUTPUTNEW")

        updateRESTConfig("ldap-config", "sa-ldap")
        updateRESTConfig("ldap-domain", splunkjs.mvc.Components.getInstance("ldap-domains-input").val());

        updateMacro("SA-LDAPSearch-Domain", splunkjs.mvc.Components.getInstance("ldap-domains-input").val())

        setSearch("Generate LDAPSearch Lookup", true, "17 3 * * *");
        setSearch("Generate LDAPMgmtChain Lookup", true, "17 4 * * *");
        createModal("ldapsearch-confirmation", "LDAPSearch Search Scheduled",
            $("<p>We've saved your configurations and scheduled a nightly search to run to pull the updated LDAP information. If you would like, you can run the search right now by clicking <a href=\"/app/search_activity/search?s=%2FservicesNS%2Fnobody%2Fsearch_activity%2Fsaved%2Fsearches%2FGenerate%2520LDAPSearch%2520Lookup\" target=\"_blank\" class=\"ext\">here</a> (recommended). Because this search often takes a long time to run, it will open in a new tab so that you can monitor it.</p><p>A note on performance: generally, SA-ldapsearch running once per night late at night is very acceptable. In most environments, it will complete in 10 minutes or less. If you have a large number of users, very unscientific testing suggests approximately 10k records every ten minutes (depending on AD latency, though with almost no load on the system... it's just slow). Hence: nightly.</p> "), [], [{ "classes": "btn-primary", "label": "Ok" }])
    }
    if (document.getElementById("ldapoptions-existing") != null && document.getElementById("ldapoptions-existing").checked == true) {

        updateRESTConfig("ldap-config", "staticlookup")
        updateRESTConfig("ldap-domain", "");

        updateMacro("ldapsearch_lookup(1)", "lookup LDAPSearch sAMAccountName as user OUTPUTNEW $fields$")
        updateMacro("ldapsearch_lookup", "lookup LDAPSearch sAMAccountName as user OUTPUTNEW")

        setSearch("Generate LDAPSearch Lookup", false);
        setSearch("Generate LDAPMgmtChain Lookup", true, "17 4 * * *");
    }

    //function updateMacro("SA_Config_LDAP", value);
    /*setTimeout(function()
            {
                window.DocStatus.BasicLDAP.Errors = []
                var ReRunCheckForLDAPSearchExisting = splunkjs.mvc.Components.getInstance("CheckForLDAPSearchExisting");
                ReRunCheckForLDAPSearchExisting.startSearch();
                var ReRunCheckForTSCollectLookup = splunkjs.mvc.Components.getInstance("CheckForTSCollectLookup");
                ReRunCheckForTSCollectLookup.startSearch();
                var ReRunConfigCheckLDAP = splunkjs.mvc.Components.getInstance("ConfigCheckLDAP");
                ReRunConfigCheckLDAP.startSearch();
                var ReRunPullScheduleSearchInfo = splunkjs.mvc.Components.getInstance("PullScheduleSearchInfo");
                ReRunPullScheduleSearchInfo.startSearch();
                var ReRunsearch1 = splunkjs.mvc.Components.getInstance("search1");
                ReRunsearch1.startSearch();
                var ReRunldapdomainssearch = splunkjs.mvc.Components.getInstance("ldapdomainssearch");
                ReRunldapdomainssearch.startSearch();
            }
    , 8000);*/

}



function ldapToggle() {
    if ($('input[name=ldapoptions]:checked').val() == "noldap") {
        document.getElementById("saldap-domain-p").style.display = "none";
        document.getElementById("ldapquery-example-p").style.display = "none";
        $(".ldap-further-config").hide()
        $("#BasicLDAPContainer").find(".btn-primary").removeAttr("disabled");
    }
    if ($('input[name=ldapoptions]:checked').val() == "sa-ldap") {
        document.getElementById("saldap-domain-p").style.display = "block"
        document.getElementById("ldapquery-example-p").style.display = "none"
        $(".ldap-further-config").hide();
        $(".ldap-further-config-ldapsearch").show();
        $("#BasicLDAPContainer").find(".btn-primary").attr("disabled","");

    }
    if ($('input[name=ldapoptions]:checked').val() == "staticlookup") {
        document.getElementById("saldap-domain-p").style.display = "none";
        document.getElementById("ldapquery-example-p").style.display = "block";
        $(".ldap-further-config").hide()
        $(".ldap-further-config-existing").show();
        $("#BasicLDAPContainer").find(".btn-primary").removeAttr("disabled");
    }
    return true;
}


function enableDataModelAcceleration(name, status, callback) {
    var appscope = {}
    appscope['owner'] = "nobody"; //Splunk.util.getConfigValue("USERNAME");
    appscope['app'] = "search_activity";
    appscope['sharing'] = "app";
    var mystanza = []
    mystanza['acceleration'] = status
    mystanza['acceleration.earliest_time'] = 0
    var svc = splunkjs.mvc.createService();
    var files = svc.configurations(appscope);
    var fileDeferred = $.Deferred();
    files.fetch({ 'search': 'name=datamodels"' }, function(err, files) {
        var datamodelsFile = files.item("datamodels");
        if (!datamodelsFile) {
            //  Create the file here
            datamodelsFile = files.create('datamodels', function(err, datamodelsFile) {
                if (err) {
                    // Error case, throw an exception dialog to user here.
                    // console.log("Caught an error in transforms", err, datamodelsFile)
                    failureCallback()
                    return false;
                }
                fileDeferred.resolve(datamodelsFile);
            });
        } else {
            fileDeferred.resolve(datamodelsFile)
        }
    });
    fileDeferred.done(function(datamodelsFile) {
        datamodelsFile.post(name, mystanza, function(err, stanza) {
            if (err) {
                console.log("Caught an error in stanza", err, stanza)
                    //failureCallback()
                    //return false;
                    callback(false);
            } else {
                console.log("Caught a success", err)
                    //document.getElementById("StatusMessages").innerHTML = document.getElementById("StatusMessages").innerHTML + "Lookup Entry w/ Transforms Created!<br/>"
                    //successCallback();
                    callback(true);
                return true;
            }
        })
    });
}

function rebuildDatamodel(name){
    var namespace="nobody";
    var app = "search_activity";

    $.ajax({
        url: '/en-US/splunkd/__raw/servicesNS/' + namespace + '/' + app + '/admin/summarization/tstats%3ADM_' + app + '_' + name,
        type: "GET",
        method: "DELETE",
        async: true,
        success: function(returneddata) {
            console.log("Got a return", returneddata)
            setTimeout(function(){ checkDatamodelHealth() }, 500)
        }
    });
}

function checkDatamodelHealth(){
    $("#acceleration-answer").html("<p>In progress..</p>")
    searchHandler("check_for_dma_health", "| rest /servicesNS/nobody/search_activity/data/models/Search_Activity_App_Data_Model splunk_server=local count=0 | table title acceleration acceleration.cron_schedule eai:digest | rename title as datamodel | rename acceleration.cron_schedule AS cron | join type=left datamodel  [| rest /servicesNS/nobody/search_activity/admin/summarization by_tstats=t splunk_server=local count=0 | eval datamodel=replace('summary.id',\"DM_\".'eai:acl.app'.\"_\",\"\") ] | table datamodel eai:acl.app summary.access_time acceleration summary.is_inprogress summary.size summary.latest_time summary.complete summary.buckets_size summary.buckets cron summary.last_error summary.time_range summary.id summary.mod_time eai:digest summary.earliest_time summary.last_sid summary.access_count | rename summary.id AS summary_id, summary.time_range AS retention, summary.earliest_time as earliest, summary.latest_time as latest, eai:digest as digest | rename summary.* AS *, eai:acl.* AS * | table datamodel app acceleration is_inprogress size latest complete cron retention | fillnull | eval now=now()", {},
    function(numEvents, data, properties){
        if(numEvents == 0){
            console.log("No events found", numEvents, data)
            triggerGlobalError("No data model found -- this seems to be a configuration error.");
        }else{
            
            updateRESTConfig("dma-acceleration", data[0]["acceleration"]);
            updateRESTConfig("dma-is_inprogress", data[0]["is_inprogress"]);
            updateRESTConfig("dma-size", data[0]["size"]);
            updateRESTConfig("dma-complete", data[0]["complete"]);
            updateRESTConfig("dma-cron", data[0]["cron"]);
            updateRESTConfig("dma-retention", data[0]["retention"]);
            updateRESTConfig("dma-last-checked", data[0]["now"]);
            var status;
            if(data[0]["acceleration"] == 1){
                if(data[0]["is_inprogress"] == 1){
                    status = $("<p>Acceleration enabled an acceleration job is actively running. The data model is currently " + Math.round(data[0]["complete"]*100,2) + " complete.</p>")
                    $("#DataModelContainer").find(".btn-primary").removeAttr("disabled")
                }else{
                    status = $("<p>Acceleration enabled! The data model is currently " + Math.round(data[0]["complete"]*100,2) + " complete.</p>")
                    $("#DataModelContainer").find(".btn-primary").removeAttr("disabled")
                }
            }else{
                status = $("<p>Acceleration not enabled, enabling...</p>")
                enableDataModelAcceleration("Search_Activity_App_Data_Model", true, function(){
                    $("#acceleration-answer").html("<p>Acceleration just enabled. Please wait for accelerated data to appear.</p>")
                })
            }
            $("#acceleration-answer").html(status)
            

        }
    })
}

require.config({
    baseUrl: "{{SPLUNKWEB_URL_PREFIX}}/static/js"
});

//
// LIBRARY REQUIREMENTS
//
// In the require function, we include the necessary libraries and modules for
// the HTML dashboard. Then, we pass variable names for these libraries and
// modules as function parameters, in order.
// 
// When you add libraries or modules, remember to retain this mapping order
// between the library or module and its function parameter. You can do this by
// adding to the end of these lists, as shown in the commented examples below.

require([
        "splunkjs/mvc",
        "splunkjs/mvc/utils",
        "splunkjs/mvc/tokenutils",
        "underscore",
        "jquery",
        "splunkjs/mvc/simplexml",
        "splunkjs/mvc/headerview",
        "splunkjs/mvc/footerview",
        //"splunkjs/mvc/simplexml/dashboardview",
        "splunkjs/mvc/simplexml/dashboard",
        "splunkjs/mvc/simplexml/element/chart",
        "splunkjs/mvc/simplexml/element/event",
        "splunkjs/mvc/simplexml/element/html",
        "splunkjs/mvc/simplexml/element/list",
        "splunkjs/mvc/simplexml/element/map",
        "splunkjs/mvc/simplexml/element/single",
        "splunkjs/mvc/simplexml/element/table",
        //"splunkjs/mvc/simpleform/formutils",
        "splunkjs/mvc/simpleform/input/dropdown",
        "splunkjs/mvc/simpleform/input/radiogroup",
        //"splunkjs/mvc/simpleform/input/multiselect",
        //"splunkjs/mvc/simpleform/input/checkboxgroup",
        "splunkjs/mvc/simpleform/input/text",
        "splunkjs/mvc/simpleform/input/timerange",
        "splunkjs/mvc/simpleform/input/submit",
        "splunkjs/mvc/searchmanager",
        "splunkjs/mvc/savedsearchmanager",
        "splunkjs/mvc/postprocessmanager",
        "splunkjs/mvc/simplexml/urltokenmodel"
        // Add comma-separated libraries and modules manually here, for example:
        // ..."splunkjs/mvc/simplexml/urltokenmodel",
        // "splunkjs/mvc/checkboxview"
    ],
    function(
        mvc,
        utils,
        TokenUtils,
        _,
        $,
        DashboardController,
        HeaderView,
        FooterView,
        Dashboard,
        ChartElement,
        EventElement,
        HtmlElement,
        ListElement,
        MapElement,
        SingleElement,
        TableElement,
        //FormUtils,
        DropdownInput,
        RadioGroupInput,
        //MultiSelectInput,
        //CheckboxGroupInput,
        TextInput,
        TimeRangeInput,
        SubmitButton,
        SearchManager,
        SavedSearchManager,
        PostProcessManager,
        UrlTokenModel

        // Add comma-separated parameter names here, for example: 
        // ...UrlTokenModel, 
        // CheckboxView
    ) {



        var pageLoading = true;


        // 
        // TOKENS
        //

        // Create token namespaces
        var urlTokenModel = new UrlTokenModel();
        mvc.Components.registerInstance('url', urlTokenModel);
        var defaultTokenModel = mvc.Components.getInstance('default', { create: true });
        var submittedTokenModel = mvc.Components.getInstance('submitted', { create: true });

        urlTokenModel.on('url:navigate', function() {
            defaultTokenModel.set(urlTokenModel.toJSON());
            if (!_.isEmpty(urlTokenModel.toJSON()) && !_.all(urlTokenModel.toJSON(), _.isUndefined)) {
                submitTokens();
            } else {
                submittedTokenModel.clear();
            }
        });


        // Initialize tokens
        defaultTokenModel.set(urlTokenModel.toJSON());

        var defaultUpdate = {};

        var submitTokens = function() {
            submitTokensSoon(pageLoading);
        };

        var submitTokensSoon = _.debounce(function(replaceState) {
            submittedTokenModel.set(defaultTokenModel.toJSON());
            urlTokenModel.saveOnlyWithPrefix('form\\.', defaultTokenModel.toJSON(), {
                replaceState: replaceState
            });
        });

        /*
                // Initialize tokens
                defaultTokenModel.set(urlTokenModel.toJSON());

                function submitTokens() {
                    // Copy the contents of the defaultTokenModel to the submittedTokenModel and urlTokenModel
                    FormUtils.submitForm({ replaceState: pageLoading });
                }

                function setToken(name, value) {
                    defaultTokenModel.set(name, value);
                    submittedTokenModel.set(name, value);
                }

                function unsetToken(name) {
                    defaultTokenModel.unset(name);
                    submittedTokenModel.unset(name);
                }
        */
        //
        // SEARCH MANAGERS
        //





        //
        // SPLUNK HEADER AND FOOTER
        //

        new HeaderView({
            id: 'header',
            section: 'dashboards',
            el: $('.header'),
            acceleratedAppNav: true,
            useSessionStorageCache: true
        }, { tokens: true }).render();

        new FooterView({
            id: 'footer',
            el: $('.footer')
        }, { tokens: true }).render();


        //
        // DASHBOARD EDITOR
        //

        new Dashboard({
            id: 'dashboard',
            el: $('.dashboard-body')
        }, { tokens: true }).render();


        //
        // VIEWS: VISUALIZATION ELEMENTS
        //


/*
        var CheckAppPermissionsSearch = splunkjs.mvc.Components.getInstance("CheckAppPermissions");
        var CheckAppPermissionsSearchResults = CheckAppPermissionsSearch.data('results', { output_mode: 'json', count: 0 });
        console.log("Here's my CheckAppPermissionsSearch Object", CheckAppPermissionsSearch)
        CheckAppPermissionsSearch.on('search:done', function(properties) {
            // clear div elements of previous result

            console.log("Got Results from CheckAppPermissionsSearch");

            if (CheckAppPermissionsSearch.attributes.data.resultCount == 0) {
                console.log("Error pulling CheckAppPermissionsSearch. No results found.")
                return;
            }

            CheckAppPermissionsSearchResults.on("data", function() {
                var data = CheckAppPermissionsSearchResults.data().results;
                console.log("Here are my CheckAppPermissionsSearchResults: ", data)
                if (data[0].IsAvailable == 1) {
                    window.DocStatus.FX.Errors.push("App is available to all users -- should be restricted to administrators. Customize <a href=\"/manager/permissions/search/apps/local/search_activity?uri=%2FservicesNS%2Fnobody%2Fsystem%2Fapps%2Flocal%2Fsearch_activity\">here</a>.");
                    window.DocStatus.FX.permissions = 0
                    document.getElementById("fx_permission").innerHTML = "<img src=\"/static/app/search_activity/err_ico.gif\" />"
                } else {
                    window.DocStatus.FX.permissions = 1;
                    document.getElementById("fx_permission").innerHTML = "<img src=\"/static/app/search_activity/ok_ico.gif\" />"
                }
                RecalculateOverallStatus()


            });
        });

*/


        /*
                var mainSearch = splunkjs.mvc.Components.getInstance("search1");
                var myResults = mainSearch.data('results', { output_mode:'json', count:0 });

                mainSearch.on('search:done', function(properties) {
                    // clear div elements of previous result
                    document.getElementById('ldapqueryexample').innerHTML = "";
                    console.log("Got Results from LDAP Search");

                    if(mainSearch.attributes.data.resultCount == 0) {
                      console.log("Error pulling ldapsearch example code. No results found.")
                      return;
                    }       

                    myResults.on("data", function() {
                        var data = myResults.data().results;
                        console.log("Here are my results: ", data, data[0].value)          
                        document.getElementById("ldapqueryexample").innerHTML = data[0].value;  
                        
                    });
                  });*/



        // Initialize time tokens to default
        if (!defaultTokenModel.has('earliest') && !defaultTokenModel.has('latest')) {
            defaultTokenModel.set({ earliest: '0', latest: '' });
        }

        submitTokens();


        //
        // DASHBOARD READY
        //

        DashboardController.ready();
        pageLoading = false;

    }
);


function searchHandler(desiredSearchName, searchString, params, successCallback, errorCallback, startCallback) {
    require(['jquery',
        "splunkjs/mvc/utils",
        "splunkjs/mvc/searchmanager"
    ], function($,
        utils,
        SearchManager) {
        if (typeof splunkjs.mvc.Components.getInstance(desiredSearchName) == "object") {

            splunkjs.mvc.Components.revokeInstance(desiredSearchName)
        }
        var defaults = {
            "id": desiredSearchName,
            "cancelOnUnload": false,
            "latest_time": "now",
            "status_buckets": 0,
            "earliest_time": "0",
            "search": searchString,
            "app": "search_activity",
            "preview": false,
            "autostart": true
        }
        var searchParams = Object.assign({}, params, defaults);

        var sm = new SearchManager(searchParams, { tokens: true, tokenNamespace: "submitted" });

        sm.on('search:start', function(properties) {
            var searchName = properties.content.request.label;
            if (typeof startCallback != "undefined" && startCallback != null) {
                startCallback(searchName, properties);
            }
        });
        sm.on('search:error', function(properties) {
            if (typeof errorCallback != "undefined" && errorCallback != null) {
                errorCallback(properties);
            }
        });
        sm.on('search:fail', function(properties) {
            if (typeof errorCallback != "undefined" && errorCallback != null) {
                errorCallback(properties);
            }
        });
        sm.on('search:done', function(properties) {
            var searchName = properties.content.request.label
            if (properties.content.resultCount == 0) {
                if (typeof successCallback != "undefined" && successCallback != null) {
                    successCallback(0, [], properties);
                }
            } else {
                var results = splunkjs.mvc.Components.getInstance(searchName).data('results', { output_mode: 'json', count: 0 });
                results.on("data", function(properties) {
                    var data = properties.data().results
                    if (typeof successCallback != "undefined" && successCallback != null) {
                        successCallback(data.length, data, properties);
                    }
                })
            }
        });
    })
}

function setSearch(searchName, status, cron_schedule) {
    //"search": ' | rest splunk_server=local "/servicesNS/nobody/search_activity/saved/searches" | where \'eai:acl.app\'="search_activity" | fields cron_schedule disabled title eai:acl.sharing',

    var appscope = {}
    appscope['owner'] = "admin"; //Splunk.util.getConfigValue("USERNAME");
    appscope['app'] = "search_activity";
    appscope['sharing'] = "app";
    var mystanza = []
    if (status) {
        mystanza['disabled'] = 0
        mystanza['enableSched'] = 1
    } else {
        mystanza['disabled'] = 1
        mystanza['enableSched'] = 0
    }
    mystanza['cron_schedule'] = cron_schedule || ""

    var svc = splunkjs.mvc.createService();
    var files = svc.configurations(appscope);
    var fileDeferred = $.Deferred();
    files.fetch({ 'search': 'name=savedsearches"' }, function(err, files) {
        var savedsearchesFile = files.item("savedsearches");
        if (!savedsearchesFile) {
            //  Create the file here
            savedsearchesFile = files.create('savedsearches', function(err, savedsearchesFile) {
                if (err) {
                    // Error case, throw an exception dialog to user here.
                    // console.log("Caught an error in transforms", err, savedsearchesFile)
                    failureCallback()
                    return false;
                }
                fileDeferred.resolve(savedsearchesFile);
            });
        } else {
            fileDeferred.resolve(savedsearchesFile)
        }
    });
    fileDeferred.done(function(savedsearchesFile) {
        savedsearchesFile.post(searchName, mystanza, function(err, stanza) {
            if (err) {
                console.log("Caught an error in stanza", err, stanza)
                    //failureCallback()
                    //return false;
            } else {
                console.log("Caught a success", err)
                    //successCallback();
                return true;
            }
        })
    });
}


function createModal(modalName, title, jq_body, actions, buttons, launch) {
    require(['jquery',
        "/static/app/search_activity/components/Modal.js"
    ], function($,
        Modal) {
        // Now we initialize the Modal itself
        var myModal = new Modal(modalName, {
            title: title,
            backdrop: 'static',
            keyboard: false,
            destroyOnHide: true,
            type: 'normal'
        });
        for (var i = 0; i < actions.length; i++) {
            // events (str), callback
            $(myModal.$el).on(actions[i]['event'], actions[i]['callback'])
        }

        myModal.body.append(jq_body);


        for (var i = 0; i < buttons.length; i++) {
            // classes, label, callback
            myModal.footer.append(
                $('<button>').attr({
                    type: 'button',
                    'data-dismiss': 'modal'
                }).addClass('btn ' + (buttons[i]['classes'] || "")).text(buttons[i]['label'] || "Button Label Missing").on('click', buttons[i]['callback'] || function() {}))
        }
        if (typeof launch == "undefined" || launch == true) {
            myModal.show(); // Launch it!
        }
        return myModal;

    })
}

function enableSetupSteps(){

    $("#link_Intro").unbind("click").css("cursor", "default").css("color", "gray")
 
    $("#link_Collect").unbind("click").css("cursor", "default").css("color", "gray")
 
    $("#link_BasicLDAP").unbind("click").css("cursor", "default").css("color", "gray")
 
    $("#link_Data").unbind("click").css("cursor", "default").css("color", "gray")
 
    $("#link_DataModels").unbind("click").css("cursor", "default").css("color", "gray")
 
    $("#link_2x_data").unbind("click").css("cursor", "default").css("color", "gray")
 

    if(typeof window.criticalErrorTriggered == "undefined" || window.criticalErrorTriggered == ""){
        
        $("#link_Intro").css("cursor", "hand").css("color", "#006eaa");

        $("#link_Collect").css("cursor", "hand").css("color", "#006eaa");

        
        if(window.HaveRunCollectThisTime == true ){
            if(RESTConfig["backfill-status"] != ""){
                $("#DataContainer").find(".btn-primary").removeAttr("disabled")
            }
            if(RESTConfig["historical-data-from-sse-2-found"] == 0){
                $("#CollectContainer").find(".btn-primary").click(function(){SwitchSection('BasicLDAPContainer')})
            }else{
                $("#CollectContainer").find(".btn-primary").click(function(){SwitchSection('ConversionContainer')})
                $("#link_2x_data").css("cursor", "hand").css("color", "#006eaa").click(function(){SwitchSection('ConversionContainer')});
            
            }
            $("#link_BasicLDAP").click(function(){SwitchSection("BasicLDAPContainer")}).css("cursor", "hand").css("color", "#006eaa");
            if(RESTConfig["ldap-config"] == "noldap" || RESTConfig["ldap-config"] == "staticlookup" || (RESTConfig["ldap-config"] == "sa-ldap" && RESTConfig["ldap-domain"] != "")){
                $("#link_Data").click(function(){SwitchSection("DataContainer")}).css("cursor", "hand").css("color", "#006eaa");
            }
            if(RESTConfig["backfill-status"] != ""){
                $("#link_DataModels").click(function(){SwitchSection("DataModelContainer")}).css("cursor", "hand").css("color", "#006eaa");
                
            }
            if(typeof RESTConfig["conversion-choice-made"] != "undefined" && RESTConfig["conversion-choice-made"] != ""){
                $("#ConversionContainer").find(".btn-primary").removeAttr("disabled")
            }
            
        }
    }
    
}

function onPageLoad(){
    enableSetupSteps();
    loadLDAPConfig();
}

function loadLDAPConfig(){
    if(typeof RESTConfig["ldap-config"] != "undefined" && RESTConfig["ldap-config"] != ""){
        $("input[name=ldapoptions][value=" + RESTConfig["ldap-config"] +"]").click()
    } 

    require([
        "jquery",
        "splunkjs/mvc/simpleform/input/dropdown"
        ],
        function(
            $,
            DropdownInput
        ) {

        var input = new DropdownInput({
            "id": "ldap-domains-input",
            "choices": [],
            "searchWhenChanged": true,
            "labelField": "title",
            "selectFirstChoice": false,
            "valueField": "title",
            "managerid": "ldap-domains-search",
            "showClearButton": true,
            "el": $('#ldapdomains')
        }, { tokens: true }).render();

        input.on("change", function(newValue) {
            console.log("Got a change to the LDAP Domain", newValue);
            $("#BasicLDAPContainer").find(".btn-primary").removeAttr("disabled");
            //FormUtils.handleValueChange(ldapdomainsinput);
        });

        // Populating search for field 'ldap-domains-input'
        searchHandler(  "ldap-domains-search", 
                        "| rest splunk_server=local \"/servicesNS/nobody/SA-ldapsearch/properties/ldap\" | table title | where title!=\"default\"", 
                        {}, 
                        function(numEvents, data, properties) {
                            var success = false;
                            if (numEvents >= 1) {
                                if(typeof RESTConfig["ldap-domain"] != "undefined" && RESTConfig["ldap-domain"] != ""){
                                    for(var i = 0; i < data.length; i++){
                                        if(data[i].title == RESTConfig["ldap-domain"]){
                                            splunkjs.mvc.Components.getInstance("ldap-domains-input").val(RESTConfig["ldap-domain"])
                                        }
                                    }
                                } 
                            }else{
                                console.log("No domains found -- throw a modal")
                            }
                        })

        //splunkjs.mvc.Components.getInstance("ldapdomainssearch").data("results").on("data", function(properties){ var results = properties.data().rows; console.log( results );} )
    })
}
function requestBackfill(obj, startseconds, endseconds){

    if(typeof RESTConfig["backfill-status"] != "undefined" && RESTConfig["backfill-status"] != "normal" && RESTConfig["backfill-status"] != ""){
            
        createModal("custom-backfill", "Set Custom Backfill Window",
        $("<p>You already have a backfill window running. We will not duplicate data, but setting a shorter window while a longer backfill is in progress could result in unexpected data gaps.<br/><br/>Are you sure you want to overwrite?</p>"), 
        [], 
        [
            {   "label": "Cancel", 
                "callback": function(){
                } 
            },
            {   "classes": "btn-primary", 
                "label": "Ok", 
                "callback": function(){
                    setBackfill(obj, startseconds,  endseconds);
                } 
            }
        ])
    }else{
        setBackfill(obj, startseconds, endseconds);
    }

}
function setBackfill(obj, startseconds, endseconds){
    // Three Params that can be set
    //  backfill-status
    //  earliest-time
    //  latest-time

    var getCurrentTime = $.Deferred();
    $(obj).text("In Progress")
    $(".backfillOptions").attr("disabled", "disabled")

    searchHandler(  "currentServerEpoch", 
                    "| makeresults | eval time=_time ", 
                    {}, 
                    function(numEvents, data, properties) {
                        getCurrentTime.resolve(data[0]['time'])
                    })
    getCurrentTime.done(function(currentTime){
        console.log("Got the current server time", currentTime)
        if(startseconds == 0){
            updateRESTConfig("backfill-status", "no-backfill")
            updateRESTConfig("earliest-time", "")
            updateRESTConfig("latest-time", "")
            setSearch("Generate Search Activity Summaries", true, "3,9,15,21,27,33,39,45,51,57 * * * *");
        }else if(typeof endseconds != "undefined" && endseconds!=""){
            // for this one, we put in absolute times.
            updateRESTConfig("backfill-status", "selective")
            updateRESTConfig("earliest-time", startseconds)
            updateRESTConfig("latest-time", endseconds)
            setSearch("Generate Search Activity Summaries", true, "3,9,15,21,27,33,39,45,51,57 * * * *");
        }else{
            updateRESTConfig("backfill-status", "general")
            updateRESTConfig("earliest-time", currentTime - startseconds)
            updateRESTConfig("latest-time", "")
            setSearch("Generate Search Activity Summaries", true, "3,9,15,21,27,33,39,45,51,57 * * * *");
        }
        $(obj).text("Configured")
        $("#DataContainer").find(".btn-primary").removeAttr("disabled")
    })
}

function customBackfill(obj){
    createModal("custom-backfill", "Set Custom Backfill Window",
    $("<p>Setting custom backfill windows is an advanced configuration activity. The motivation for doing so would be that you backfilled for a short period of time, and now you would like to go back and backfill a greater amount of time. In order to do so, you will need to provide epoch times for the start and end of the backfill. (Epoch times are native linux timestamps, and it's the underlying time format for Splunk and many systems.) While in theory timezones shouldn't really apply since Epoch times are based in UTC, it's recommended that you make sure you're matching the epoch time with Splunk itself, which you can see by doing | makeresults | eval epoch = now() for the current time.</p><h3>Data In The System Today</h3><table class=\"table\"><thead><tr><th>Start</th><th>End</th></tr></thead><tbody><tr><td id=\"epoch-start\">Checking...</td><td id=\"epoch-end\">Checking...</td></tr></tbody></table><div style=\"position: relative\"><h3>Desired Epoch Times</h3>Only enter whole numbers please, lest you get unexpected results.<div style=\"display: inline-block; width: 210px; padding: 4px;\"><label>Start</label><input type=\"text\" class=\"desired-epoch\" id=\"desired-epoch-start\" /></div><div style=\"display: inline-block; width: 210px; padding: 4px; right: 0px;\"><label>End</label><input type=\"text\" class=\"desired-epoch\" id=\"desired-epoch-end\" /></div></div>"), 
    [
        {   "event": "shown",
            "callback": function(){
                $(".modal").find(".btn-primary:visible").attr("disabled", "disabled")
                // TODO: Pull the existing data searchHandler("findExistingData")
                $(".desired-epoch").on("keyup keypress blur change", function(){
                    if(parseInt($("#desired-epoch-start").val().replace(/\..*/, "").replace(/\D/g, "")) > 1000 && parseInt($("#desired-epoch-end").val().replace(/\..*/, "").replace(/\D/g, "")) > 1000){
                        $(".modal").find(".btn-primary:visible").removeAttr("disabled")
                    }
                })

                searchHandler("pullExistingMaxMinTimes", "| tstats count min(_time) as mintime max(_time) as maxtime where earliest=0 latest=now index=`FillSearchHistory_SummaryIndex` sourcetype=searchactivity:searchhistory",[],function(numResults, data, properties){
                    console.log("Event fired", numResults, data, properties)
                    if(typeof data[0]['mintime']!="undefined" && data[0]['mintime'] != ""){
                        $("#epoch-start").text(data[0]['mintime'])
                    }else{
                        $("#epoch-start").text("Not Found")
                    }
                    if(typeof data[0]['maxtime']!="undefined" && data[0]['maxtime'] != ""){
                        $("#epoch-end").text(data[0]['mintime'])
                    }else{
                        $("#epoch-end").text("Not Found")
                    }
                })
            }
        }
    ], 
    [
        {   "label": "Cancel", 
            "callback": function(){
                $(".backfillOptions").removeAttr("disabled")
                $(".backfillOptions").text("Select")
            } 
        },
        {   "classes": "btn-primary", 
            "label": "Ok", 
            "callback": function(){
                var start = $("#desired-epoch-start").val();
                var end = $("#desired-epoch-end").val();
                if(parseInt(start) > parseInt(end)){
                    var temp = end;
                    end = start;
                    start = temp;
                }
                requestBackfill(obj, start,  end);
            } 
        }
    ])
}

function advancedConfig(){
    var tbody = $("<tbody>")
    for(var i=0; i < standardConfig.length; i++){
        var obj = standardConfig[i]
        var value=""
        if(standardConfig[i].source=="kvstore"){
            value=RESTConfig[standardConfig[i].name]
        }else if(standardConfig[i].source=="macro"){
            value=MacroConfig[standardConfig[i].name]
        }else{
            console.log("Need to find other storage for", standardConfig[i])
        }
        var row = $("<tr><td>" + obj["name"] + "</td><td><input type=\"text\" value=\"" + value + "\" /></td><td class=\"status\">Unchanged</td><td>" + obj['source'] + "</td><td>" + obj['description'] + "</td></tr>")
        row.find("input").on("keypress keydown keyup blur change", function(event){
            var newValue = $(event.target).val()
            var row = $(event.target).parent().parent()
            var attribute = row.find("td").first().text()
            var configobject = {}
            for(var i = 0; i < standardConfig.length; i++){
                if(standardConfig[i].name == attribute){
                    configobject = standardConfig[i]
                }
            }
            var existingValue = "";
            if(configobject.source=="kvstore"){
                existingValue=RESTConfig[configobject.name]
            }else if(configobject.source=="macro"){
                existingValue=MacroConfig[configobject.name]
            }else{
                console.log("Need to find other storage for", configobject)
            }
            
            if(newValue!=existingValue){
                row.find(".status").html(
                    $("<button>Update</button>").click(function(event){ advancedConfigChangeEvent(event); })
                )
            }else{
                row.find(".status").text("Unchanged")
            }

        })
        tbody.append(row)
        console.log(tbody, row)

    }
    var body=$("<p>Below are all configuration options. Note that there is no validation of values entered, so please be cautious (treat them like limits.conf and research extensively).</p>")
    var table = $("<table class=\"table\"><thead><tr><td>Name</td><td>Value</td><td>Status</td><td>Source</td><td>Description></td></tr></thead></table>")
    table.append(tbody)
    body.append(table)
    createModal("advancedConfig", "Advanced Configuration", body, [{"event": "shown.bs.modal", "callback": function(){$("#advancedConfig").css("width", "1000px").css("left","350px")}}],
    [
        {   "classes": "btn-primary", 
            "label": "Ok"
        }
    ])
    
}

function advancedConfigChangeEvent(event){
    var row = $(event.target).parent().parent()
    var attribute = row.find("td").first().text()
    var newValue = row.find("input").val()
    var configobject = {}
    for(var i = 0; i < standardConfig.length; i++){
        if(standardConfig[i].name == attribute){
            configobject = standardConfig[i]
        }
    }
    if(configobject.source == "kvstore"){
        updateRESTConfig(attribute, newValue)
        row.find(".status").text("Changed")
    }
    if(configobject.source == "macro"){
        updateMacro(attribute, newValue)
        row.find(".status").text("Changed")
    }
}

function triggerGlobalError(message){
    window.criticalErrorTriggered = true; 
    var jq_body = $("<p>" + message + "</p>");
    $(".statuscontainer .btn").unbind("click").attr("disabled","")
    createModal("globalError", "Critical Error!", jq_body, [],
    [
        {   "classes": "btn-primary", 
            "label": "Ok"
        }
    ])
    enableSetupSteps()
}

function throwHighLoadWarning(){
    var body = $("<div></div>")
    body.append("<p>Your environment is among the most active of all Splunk customers, and so your search load is far beyond what we would normally expect. In a typical multi-terabyte environment, we will often see between 3,000 and 10,000 searches per hour (95th percentile). In your environment, we see <b>" + RESTConfig["95th-percentile-records-per-hour"] + "</b> records by the same measure.</p>")
    body.append("<p>To adapt to this heavier load, we will reduce the window of time that we search for, so that we don't end up with so many events at one time that the stats command will slow down. This is generally fine, except that we are also reducing the buffer we maintain for long running searches. For most users of this app, we will look for searches running up to 24 hours in duration, but for your sized environment, we will only look at up to <b>" + RESTConfig["buffer-in-hours-for-long-term-backfill"] + "</b> hours. If this is a problem for you, you can always tweak these settings via the Advanced Settings option (look for buffer-in-hours-for-long-term-backfill), but beware that your performance may get dicey.</p>")
    createModal("highLoadWarning", "High Load Warning", body, [],
    [
        {   "classes": "btn-primary", 
            "label": "Ok"
        }
    ])

}