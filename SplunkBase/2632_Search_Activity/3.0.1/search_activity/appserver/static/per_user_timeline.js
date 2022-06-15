String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr   = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };

var securitySearchConfig = [
    {
        "devstatus": "complete",
        "status": "enabled",
        "name": "Process Launches",
        "paramname": "processlaunches",
        "coresearch": "| tstats summariesonly=true allow_old_summaries=t count values(Processes.parent_process) as parent_process values(Processes.parent_process_name) as parent_process_name from datamodel=Endpoint.Processes where Processes.user=*BudStoll by Processes.user Processes.action Processes.dest Processes.process Processes.process_name Processes.process_id _time span=1s | rename Processes.* as * | eval risk_score=if(action=\"blocked\", 1, 0), risk_contributors=if(action=\"blocked\", \"Signature: Blocked Process Launch\", \"\")",
        "behavioralbackfill": "| tstats summariesonly=true allow_old_summaries=t values(Processes.parent_process) as values_parent_process values(Processes.parent_process_name) as values_parent_process_name values(Processes.process) as values_process values(Processes.process_name) as values_process_name values(Processes.action) as values_action values(Processes.dest) as values_dest from datamodel=Endpoint.Processes where Processes.user=*BudStoll | eval parent_process=\"values\", parent_process_name=\"values\", process=\"values\", process_name=\"values\", action=\"values\", dest=\"values\", risk_process_name=2, risk_action=2, risk_dest=2",
        "fastcountsearch": "| tstats summariesonly=t allow_old_summaries=t prestats=t append=t count from datamodel=Endpoint.Processes where Processes.user=*BudStoll by _time span=1h | eval type=coalesce(type, \"Process Launches\")",
        "aggregate": true,
        "sumfields": [],
        "countfields": ["process_name", "dest"],
        "summarytext": "user launched process_name unique processes counter times on dest systems that were action.",
        "summarytextfields": ["user", "process_name", "dest", "action"],
        "drilldownConfig": {
            "Base": "| from datamodel Endpoint.Processes | search",
            "FieldPrefix": "",
            "AllowedFields": ["action", "user", "dest", "process_id"]
        }
    },
    {
        "devstatus": "complete",
        "status": "enabled",
        "name": "Inbound Emails",
        "paramname": "inboundemails",
        "coresearch": "| tstats summariesonly=t allow_old_summaries=t values(All_Email.recipient) as recipient values(All_Email.bytes_in) as bytes_in values(All_Email.bytes_out) as bytes_out values(All_Email.dest) as dest values(All_Email.file_size) as file_size values(All_Email.file_name) as file_name values(All_Email.file_hash) as file_hash values(All_Email.subject) as subject values(All_Email.src_user) as src_user values(All_Email.action) as All_Email.action values(All_Email.src) as src from datamodel=Email where nodename=All_Email.Delivery All_Email.recipient=bstoll@froth.ly by _time span=1s  All_Email.message_id | eval type=coalesce(type, if('All_Email.src_user'=\"bstoll@froth.ly\", \"Outgoing Emails\", \"Incoming Emails\")) | rename All_Email.* as * ",
        "behavioralbackfill": "| tstats summariesonly=t allow_old_summaries=t values(All_Email.recipient) as values_recipient values(All_Email.src_user) as values_src_user avg(All_Email.bytes_out) as avg_bytes_out stdev(All_Email.bytes_out) as stdev_bytes_out values(All_Email.dest) as values_dest avg(All_Email.file_size) as avg_file_size stdev(All_Email.file_size) as stdev_file_size from datamodel=Email where nodename=All_Email.Delivery ( All_Email.src_user=bstoll@froth.ly OR All_Email.recipient=bstoll@froth.ly ) | eval recipient=\"values\", src_user=\"values\", bytes_out=\"threshold\", file_size=\"threshold\", risk_file_size=2 | fillnull ",
        "fastcountsearch": "| tstats summariesonly=t allow_old_summaries=t prestats=t append=t count  from datamodel=Email where nodename=All_Email.Delivery ( All_Email.src_user=bstoll@froth.ly OR All_Email.recipient=bstoll@froth.ly ) by _time span=1h | eval type=coalesce(type, if('All_Email.src_user'=\"bstoll@froth.ly\", \"Outgoing Emails\", \"Incoming Emails\"))",
        "aggregate": true,
        "sumfields": [],
        "countfields": ["src_user", "recipient"],
        "summarytext": "counter incoming emails with src_user sources",
        "summarytextfields": ["type", "src_user"],
        "drilldownConfig": {
            "Base": "| from datamodel:Email.Delivery | search ",
            "FieldPrefix": "",
            "AllowedFields": ["message_id"]
        }
    },
    {
        "devstatus": "complete",
        "status": "enabled",
        "name": "Outgoing Emails",
        "paramname": "outgoingemails",
        "coresearch": "| tstats summariesonly=t allow_old_summaries=t values(All_Email.recipient) as recipient values(All_Email.bytes_in) as bytes_in values(All_Email.bytes_out) as bytes_out values(All_Email.dest) as dest values(All_Email.file_size) as file_size values(All_Email.file_name) as file_name values(All_Email.file_hash) as file_hash values(All_Email.subject) as subject values(All_Email.src_user) as src_user values(All_Email.action) as All_Email.action values(All_Email.src) as src from datamodel=Email where nodename=All_Email.Delivery All_Email.src_user=bstoll@froth.ly by _time span=1s All_Email.message_id | eval type=coalesce(type, if('All_Email.src_user'=\"bstoll@froth.ly\", \"Outgoing Emails\", \"Incoming Emails\")) | rename All_Email.* as * ",
        "behavioralbackfill": "| tstats summariesonly=t allow_old_summaries=t values(All_Email.recipient) as values_recipient values(All_Email.src_user) as values_src_user avg(All_Email.bytes_out) as avg_bytes_out stdev(All_Email.bytes_out) as stdev_bytes_out values(All_Email.dest) as values_dest avg(All_Email.file_size) as avg_file_size stdev(All_Email.file_size) as stdev_file_size from datamodel=Email where nodename=All_Email.Delivery ( All_Email.src_user=bstoll@froth.ly OR All_Email.recipient=bstoll@froth.ly ) | eval recipient=\"values\", src_user=\"values\", bytes_out=\"threshold\", file_size=\"threshold\", risk_file_size=2 | fillnull ",
        "fastcountsearch": "| tstats summariesonly=t allow_old_summaries=t prestats=t append=t count  from datamodel=Email where nodename=All_Email.Delivery ( All_Email.src_user=bstoll@froth.ly OR All_Email.recipient=bstoll@froth.ly ) by _time span=1h | eval type=coalesce(type, if('All_Email.src_user'=\"bstoll@froth.ly\", \"Outgoing Emails\", \"Incoming Emails\"))",
        "aggregate": true,
        "sumfields": [],
        "countfields": ["src_user", "recipient"],
        "summarytext": "counter outgoing emails to recipient addresses",
        "summarytextfields": ["type"],
        "drilldownConfig": {
            "Base": "| from datamodel:Email.Delivery | search ",
            "FieldPrefix": "",
            "AllowedFields": ["message_id"]
        }
    },
    {
        "devstatus": "workinprogress",
        "status": "enabled",
        "name": "Notable Events",
        "paramname": "notables",
        "coresearch": "( (bstoll user=bstoll*) OR (budstoll user=*budstoll) ) `notable`  | eval risk_score=case(urgency=\"critical\", 5, urgency=\"high\", 4, urgency=\"medium\", 3, urgency=\"low\", 2, 1=1, 1), risk_contributors=\"Correlation Search: \" + search_name | table _time user search_name risk_score risk_contributors src dest status urgency",
        "behavioralbackfill": "",
        "fastcountsearch": "",
        "aggregate": false,
        "sumfields": [],
        "countfields": [],
        "summarytext": "urgency Notable Event Fired: search_name",
        "summarytextfields": ["urgency", "search_name"],
        "drilldownConfig": {
            "Base": "`notable` | search ",
            "FieldPrefix": "",
            "AllowedFields": ["search_name", "user"]
        }
    },
    {
        "devstatus": "workinprogress",
        "status": "enabled",
        "name": "Risk Events",
        "paramname": "risks",
        "coresearch": "( (btun user=btun) OR (billytun user=*billytun) ) index=risk | eval orig_risk_score=risk_score, search_name=coalesce(search_name, source), risk_score=round(risk_score/20, 0), risk_contributors=\"Risk Event: \" + search_name | table _time user search_name risk_score risk_contributors src dest orig_risk_score",
        "behavioralbackfill": "",
        "fastcountsearch": "",
        "aggregate": false,
        "sumfields": [],
        "countfields": [],
        "summarytext": "orig_risk_score Risk Framework Event: search_name",
        "summarytextfields": ["orig_risk_score", "search_name"],
        "drilldownConfig": {
            "Base": "search index=risk ",
            "FieldPrefix": "",
            "AllowedFields": ["user"]
        }
    },
    {
        "devstatus": "workinprogress",
        "status": "enabled",
        "name": "Web Proxy Logs",
        "paramname": "weblogs",
        "coresearch": "| tstats allow_old_summaries=t summariesonly=t count values(Web.action) as action values(Web.category) as category values(Web.bytes) as bytes values(Web.dest) as dest from datamodel=Web where (host=bstoll*) NOT (Web.url=*.jpg OR Web.url=*.png OR Web.url=*.gif OR Web.url=*.js) by Web.url Web.user _time span=1s | rename Web.* as *",
        "behavioralbackfill": "| tstats allow_old_summaries=t summariesonly=t values(Web.action) as values_action values(Web.category) as values_category avg(Web.bytes) as avg_bytes stdev(Web.bytes) as stdev_bytes  from datamodel=Web where (host=bstoll*) | eval action=\"values\", category=\"values\", bytes=\"threshold\" ",
        "fastcountsearch": "| tstats allow_old_summaries=t summariesonly=t prestats=t append=t count from datamodel=Web where (host=bstoll* ) NOT (Web.url=*.jpg OR Web.url=*.png OR Web.url=*.gif OR Web.url=*.js) by _time span=1h",
        "aggregate": true,
        "sumfields": [],
        "countfields": ["url"],
        "summarytext": "counter requests to url pages.",
        "summarytextfields": ["url"],
        "drilldownConfig": {
            "Base": "| from datamodel:Web | search",
            "FieldPrefix": "",
            "AllowedFields": ["user"]
        }
    },
    {
        "devstatus": "workinprogress",
        "status": "enabled",
        "name": "System Logons",
        "paramname": "authentication",
        "coresearch": "| tstats summariesonly=t allow_old_summaries=t count from datamodel=Authentication where nodename=Authentication Authentication.user=bstoll* by Authentication.user Authentication.signature_id Authentication.dest Authentication.src Authentication.action Authentication.app _time span=1s | fields - count | rename Authentication.* as * | eval type=app",
        "behavioralbackfill": "| tstats summariesonly=t allow_old_summaries=t values(Authentication.dest) as values_dest values(Authentication.action) as values_action values(Authentication.src) as values_src values(Authentication.signature_id) as values_signature_id values(Authentication.app) as values_app from datamodel=Authentication where nodename=Authentication Authentication.user=bstoll* | eval dest=\"values\", action=\"values\", src=\"values\", signature_id=\"values\", app=\"values\"",
        "fastcountsearch": "| tstats summariesonly=t allow_old_summaries=t prestats=t append=t count from datamodel=Authentication where nodename=Authentication Authentication.user=bstoll* by  Authentication.app _time span=1h | fields - count | rename Authentication.app as type",
        "aggregate": true,
        "sumfields": [],
        "countfields": ["dest" ],
        "summarytext": "counter logins to dest systems",
        "summarytextfields": ["type"],
        "drilldownConfig": {
            "Base": "",
            "FieldPrefix": "",
            "AllowedFields": []
        }
    }
]

/* Template

    {
        "status": "enabled",
        "name": "",
        "paramname": "",
        "coresearch": "",
        "behavioralbackfill": "",
        "fastcountsearch": "",
        "aggregate": true,
        "sumfields": [],
        "countfields": [],
        "summarytext": "",
        "summarytextfields": [],
        "drilldownConfig": {
            "Base": "",
            "FieldPrefix": "",
            "AllowedFields": []
        }
    }

    */


var SearchConfig = [
    {
        "status": "enabled",
        "name": "Search History",
        "paramname": "searchhistory",
        "coresearch": "| tstats `SearchActivitySummaries` min(_time) as _time values(Search_History.searchcommands) as searchcommands values(Search_History.actualsearch) as actualsearch values(Search_History.savedsearch_name) as savedsearch_name values(Search_History.search_status) as search_status values(Search_History.searchtype) as searchtype values(Search_History.total_run_time) as total_run_time values(Search_History.result_count) as result_count values(Search_History.scan_count) as scan_count values(Search_History.event_count) as event_count sum(Search_History.ShouldInvestigate) as ShouldInvestigate values(user) as user from `SA_SearchHistory` where (Search_History.searchtype=adhoc* OR Search_History.searchtype=dashboard* OR Search_History.searchtype=realtime* ) Search_History.user=admin by Search_History.searchid | `SARename` | eval realtime=_time | eval risk_score = if(ShouldInvestigate>1,1,0), risk_contributors=if(ShouldInvestigate>1, \"Signature: Questionable Search Practices Found\", \"\"), risk_score=if(search_status == \"failed\", risk_score+1, risk_score), risk_contributors=if(search_status == \"failed\", mvappend(risk_contributors, \"Signature: Failed Search\"), risk_contributors), risk_contributors=mvfilter(risk_contributors!=\"\")",
        "behavioralbackfill": "| tstats `SearchActivitySummaries`  values(Search_History.savedsearch_name) as values_savedsearch_name values(Search_History.searchcommands) as values_searchcommands values(Search_History.search_status) as values_search_status values(Search_History.searchtype) as values_searchtype avg(Search_History.total_run_time) as avg_total_run_time stdev(Search_History.total_run_time) as stdev_total_run_time avg(Search_History.result_count) as avg_result_count stdev(Search_History.result_count) as stdev_result_count from `SA_SearchHistory` where (Search_History.searchtype=adhoc* OR Search_History.searchtype=dashboard* OR Search_History.searchtype=realtime* ) Search_History.user=admin | eval savedsearch_name=\"values\", risk_savedsearch_name=1, searchcommands=\"values\", risk_searchcommands=1, search_status=\"values\", risk_search_status=1, searchtype=\"values\", risk_searchtype=2, total_run_time=\"threshold\", risk_total_run_time=2, result_count=\"threshold\", risk_result_count=2",
        "fastcountsearch": "| tstats `SearchActivitySummaries` append=t prestats=t count from `SA_SearchHistory` where (Search_History.searchtype=adhoc* OR Search_History.searchtype=dashboard* OR sSearch_History.earchtype=realtime* ) Search_History.user=admin by Search_History.searchtype _time span=1h | eval type = coalesce(type, 'Search_History.searchtype' + \" search\")",
        "aggregate": true,
        "sumfields": ["total_run_time", "result_count"],
        "countfields": [],
        "summarytext": "User ran counter search(es), running for a total of total_run_time seconds and returning result_count results.",
        "summarytextfields": ["total_run_time", "result_count"],
        "drilldownConfig": {
            "Base": "| from datamodel:Search_Activity_App_Data_Model.Search_History | search ",
            "FieldPrefix": "",
            "AllowedFields": ["user", "searchid"]
        }
    },
    {
        "status": "enabled",
        "name": "Logins",
        "paramname": "logins",
        "coresearch": "| tstats `SearchActivitySummaries` count values(Log_Events.user) as user  from `SA_Events` where Log_Events.user=admin Log_Events.type=login by Log_Events.user Log_Events.result Log_Events.SearchHead _time span=1s  | `SARename`",
        "behavioralbackfill": "| tstats `SearchActivitySummaries` values(Log_Events.SearchHead) as values_SearchHead values(Log_Events.myapp) as values_myapp values(Log_Events.myview) as values_myview values(Log_Events.type) as values_type from `SA_Events` where Log_Events.user=admin | eval SearchHead=\"values\", myapp=\"values\", myview=\"values\", type=\"values\", risk_SearchHead=2, risk_myapp=2, risk_myview=1, risk_type=2",
        "fastcountsearch": "| tstats `SearchActivitySummaries` prestats=t append=t count from `SA_Events` where Log_Events.type IN (\"export\", \"share\", \"login\", \"admin\") by Log_Events.type _time span=1h | eval type = coalesce(type, 'Log_Events.type')",
        "aggregate": true,
        "sumfields": [],
        "countfields": [],
        "summarytext": "user attempted to log in with status=result counter time(s).",
        "summarytextfields": ["user", "result"],
        "drilldownConfig": {
            "Base": "| from datamodel:Search_Activity_App_Data_Model.Log_Events | search type=login  ",
            "FieldPrefix": "",
            "AllowedFields": ["user", "result"]
        }
    },
    {
        "status": "enabled",
        "name": "Dashboard Views",
        "paramname": "dashboardviews",
        "coresearch": "| tstats `SearchActivitySummaries` values(Log_Events.user) as user from `SA_Events` where Log_Events.user=admin Log_Events.type=weblog by _time span=1s Log_Events.myview Log_Events.myapp  | `SARename` | eval type=coalesce(type, \"dashboardview\")| eval realtime=_time",
        "behavioralbackfill": "",
        "fastcountsearch": "",
        "aggregate": true,
        "sumfields": [],
        "countfields": ["myapp", "myview"],
        "summarytext": "user opened myview dashboard(s) in myapp app(s).",
        "summarytextfields": [],
        "drilldownConfig": {
            "Base": "| from datamodel:Search_Activity_App_Data_Model.Log_Events | search type=weblog  ",
            "FieldPrefix": "",
            "AllowedFields": ["user", "myapp", "myview"]
        }
    },
    {
        "status": "enabled",
        "name": "Exports and Shares",
        "paramname": "exportsandshares",
        "coresearch": "| tstats `SearchActivitySummaries` prestats=t count dc(Log_Events.user) values(Log_Events.user) values(Log_Events.type) min(_time) from `SA_Events` where Log_Events.user=admin ( Log_Events.is_exported=1 OR Log_Events.is_shared=1) by Log_Events.searchid _time span=1s | tstats `SearchActivitySummaries` prestats=t append=t values(Search_History.actualsearch) values(Search_History.user) values(Search_History.result_count) from `SA_SearchHistory` where [| tstats `SearchActivitySummaries` count from `SA_Events` where Log_Events.user=admin ( Log_Events.is_exported=1 OR Log_Events.is_shared=1) by Log_Events.searchid | rename Log_Events.searchid as Search_History.searchid | table Search_History.searchid ] by Search_History.searchid | eval searchid=coalesce('Log_Events.searchid', 'Search_History.searchid') | stats values(Log_Events.type) as type min(_time) as _time dc(Log_Events.user) as Num_Users values(Log_Events.user)  as User values(Search_History.actualsearch) as Search_String values(Search_History.user) as User_Who_Started_Search values(Search_History.result_count) as Num_Results by searchid | table _time Action User Num_Results  User_Who_Started_Search Search_String searchid | eval realtime=_time",
        "behavioralbackfill": "",
        "fastcountsearch": "",
        "aggregate": false,
        "sumfields": [],
        "countfields": [],
        "summarytext": "User performed \"type\" on a search with Num_Results results.",
        "summarytextfields": ["User", "type", "Num_Results"],
        "drilldownConfig": {
            "Base": "| from datamodel:Search_Activity_App_Data_Model.Log_Events | search type=export OR type=share  ",
            "FieldPrefix": "",
            "AllowedFields": ["searchid"]
        }
    }
]

function populateKVStoreInitially(){
    require(['jquery',
    "splunkjs/mvc/utils"
], function($,
    utils) {
        var postready = SearchConfig;
        for(var i=0; i < SearchConfig.length; i++){
            postready[i]["_key"] = postready[i]["paramname"]
            postready[i]["sumfields"] = JSON.stringify(postready[i]["sumfields"])
            postready[i]["countfields"] = JSON.stringify(postready[i]["countfields"])
            postready[i]["summarytextfields"] = JSON.stringify(postready[i]["summarytextfields"])
            postready[i]["aggregate"] = JSON.stringify(postready[i]["aggregate"])
            postready[i]["drilldownConfig"] = JSON.stringify(postready[i]["drilldownConfig"])
            updateKVStoreRecord(utils.getCurrentApp(), "sa_chronology_view", postready[i]["paramname"], postready[i])
        }
    })
    
}
function updateKVStoreRecord(app, collection, key, record){
    $.ajax({
        url: '/en-US/splunkd/__raw/servicesNS/nobody/' + app +'/storage/collections/data/' + collection + '/' + key,
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
                url: '/en-US/splunkd/__raw/servicesNS/nobody/' + app + '/storage/collections/data/' + collection,
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
/// TEMPORARY -- overriding the kvstore at every load 'cause I haven't built kvstore management yet.
//populateKVStoreInitially()



// UTILITY FUNCTIONS


function setToken(name, value){
    var token = {}
    token[name] = value
    splunkjs.mvc.Components.getInstance("default").set(token)
    splunkjs.mvc.Components.getInstance("submitted").set(token)
    console.log("Set Token", name, value)
}

function unSetToken(name){
    splunkjs.mvc.Components.getInstance("default").unset(name)
    splunkjs.mvc.Components.getInstance("submitted").unset(name)
    console.log("Unset Token", name)
}

function searchHandler(desiredSearchName, searchString, params, successCallback, errorCallback, startCallback, progressCallback) {
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
            "app": utils.getCurrentApp(),
            "preview": false,
            "autostart": true
        }
        var searchParams = Object.assign({}, defaults, params);
        console.log("Initializing search", desiredSearchName, searchParams)
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
        sm.on('search:progress', function(properties) {
            if (typeof progressCallback != "undefined" && progressCallback != null) {
                progressCallback(properties);
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

require([
    "splunkjs/mvc",
    "../app/search_activity/Modal",
    "splunkjs/mvc/simplexml/ready!"
], function(mvc, Modal) {

    
    // INIT
    var tokensForDetailSearch = ""
    var tokensForAnomalyDetectSearch = ""
    var superfastSearchString = " | timechart span=1h count by type"
    for(var i = 0; i < SearchConfig.length; i++){
        var search = SearchConfig[i];
        console.log("Starting with search", search)
        setToken(search.paramname, "")
        tokensForDetailSearch += " $" + search.paramname + "$"
        $("#listOfStatusTRs").append("<tr><td>" + search.name + "</td><td id=\"" + search.paramname + "statusdiv\">" + '</td><td id="baseline' + search.paramname + 'statusdiv"></td><td id="' + search.paramname + '-link">&nbsp;</td></tr>')
        if(typeof search.fastcountsearch != "undefined"){
            superfastSearchString = search.fastcountsearch + "\n" + superfastSearchString
        }
        if(typeof search.behavioralbackfill != "undefined" && search.behavioralbackfill != ""){
            tokensForAnomalyDetectSearch += " $baseline" + search.paramname + "$"
        }
    }
    var queryStack = []
    var baselineQueryStack = []
    var anomalyDetectQueryStack = []
    var mySearchingTokenTimer = setInterval( checkDesiredSearchingTokenStatus, 500)
    function checkDesiredSearchingTokenStatus(){
        //console.log("Checking queues", queryStack, baselineQueryStack, anomalyDetectQueryStack)
        if(baselineQueryStack.length == 0 && queryStack.length == 0 && anomalyDetectQueryStack.length == 0){
            if(typeof splunkjs.mvc.Components.getInstance("submitted").toJSON()['searching'] != "undefined"){
                unSetToken("searching")
                //clearInterval(mySearchingTokenTimer)
            }
        }else{
            if(typeof splunkjs.mvc.Components.getInstance("submitted").toJSON()['searching'] == "undefined"){
                setToken("searching", "inprogress")

            }
            
        }
    }
    
    window.checkDesiredSearchingTokenStatus = checkDesiredSearchingTokenStatus
    window.queryStack = queryStack
    window.baselineQueryStack = baselineQueryStack
    window.anomalyDetectQueryStack = anomalyDetectQueryStack

    for(let i = 0; i < SearchConfig.length; i++){
        let search = SearchConfig[i];
        searchHandler(search.paramname, search.coresearch, {"earliest_time": "$field1.earliest$", "latest_time": "$field1.latest$"}, null, null, function(searchName, properties){
            //console.log("Got start", properties, properties.content.request.label, properties.content.sid)
            $("#" + properties.content.request.label + "-link").html('<a href="search?sid=' + properties.content.sid + '" target="_blank" class="ext">Open</a>')
            queryStack.push(search.paramname)
            $("#" + search.paramname + 'statusdiv').html('<div style="height: 1.25em; padding: 0; border: 1px solid blue; width: 100px;"> <div style="height: 1.25em; width: 0px; padding: 0; background-color: blue;" id="' + search.paramname + 'status"/></div>')
            setToken("searching", "inprogress")
        }, function(properties){
            console.log("Got progress", properties.content.doneProgress, properties.content.request.label, properties)
            $("#" + properties.content.request.label + "status").css("width", properties.content.doneProgress*100 + "px")
        })


        setTimeout(function(){
            // custom handler since I don't actually want the data here (and don't want to waste resources transferring it twice), I just want the SID
            console.log("Attempting to set a search:done for ", search.paramname)
            splunkjs.mvc.Components.getInstance(search.paramname).on('search:done', function(properties) {
                let searchName = properties.content.request.label
                setToken(searchName, searchName + "=" + properties.content.sid)
                console.log("Got a completed search")
                $("#" + searchName + 'statusdiv').html('<div style="height: 1.25em; padding: 0; background-color: blue; width: 100px; text-align: center; color: white;">Complete</div>')
                queryStack.splice(queryStack.indexOf(searchName),1)
                checkDesiredSearchingTokenStatus()
            });
        }, 300)

        if(typeof search.behavioralbackfill != "undefined" && search.behavioralbackfill != ""){
            console.log("I have a baseline!", search, search.behavioralbackfill)
            setToken("baseline" + search.paramname, " ")
            searchHandler("baseline" + search.paramname, search.behavioralbackfill, {"earliest_time": "-90d$field1.earliest$", "latest_time": "$field1.earliest$"}, null, null, function(searchName, properties){
                //console.log("Got start", properties, properties.content.request.label, properties.content.sid)
                $("#" + properties.content.request.label + "-link").html('<a href="search?sid=' + properties.content.sid + '" target="_blank" class="ext">Open</a>')
                baselineQueryStack.push("baseline" + search.paramname)
                $("#baseline" + search.paramname + 'statusdiv').html('<div style="height: 1.25em; padding: 0; border: 1px solid blue; width: 100px;"> <div style="height: 1.25em; width: 0px; padding: 0; background-color: blue;" id="' + search.paramname + 'status"/></div>')
                setToken("searching", "inprogress")
            }, function(properties){
                console.log("Got progress", properties.content.doneProgress, properties.content.request.label, properties)
                $("#" + properties.content.request.label + "status").css("width", properties.content.doneProgress*100 + "px")
            })


            setTimeout(function(){
                // custom handler since I don't actually want the data here (and don't want to waste resources transferring it twice), I just want the SID
                splunkjs.mvc.Components.getInstance("baseline" + search.paramname).on('search:done', function(properties) {
                    let searchName = properties.content.request.label
                    setToken(searchName, searchName + "=" + properties.content.sid)
                    console.log("Got a completed search")
                    $("#" + searchName + 'statusdiv').html('<div style="height: 1.25em; padding: 0; background-color: blue; width: 100px; text-align: center; color: white;">Complete</div>')
                    baselineQueryStack.splice(baselineQueryStack.indexOf(searchName),1)
                    checkDesiredSearchingTokenStatus()
                });
            }, 300)

        }
    }

    // Create Anomaly Detection Search
    $("#listOfStatusTRs").append("<tr><td>Overall Anomaly Detection</td><td id=\"anomaly_detection_search_statusdiv\">" + '</td><td></td><td id="anomaly_detection_search-link">&nbsp;</td></tr>')
        
    searchHandler("anomaly_detection_search", "| summarizeeventsids mode=anomalydetection " + tokensForAnomalyDetectSearch + " " + tokensForDetailSearch, [], null, null, function(searchName, properties){
        console.log("Got start for Anomaly Detection Search", properties, properties.content.request.label, properties.content.sid)
        setToken("riskyevents", "" )
        $("#anomaly_detection_search-link").html('<a href="search?sid=' + properties.content.sid + '" target="_blank" class="ext">Open</a>')
        
        anomalyDetectQueryStack.push("anomaly_detection_search")
        $("#anomaly_detection_search_statusdiv").html('<div style="height: 1.25em; padding: 0; border: 1px solid blue; width: 100px;"> <div style="height: 1.25em; width: 0px; padding: 0; background-color: blue;" id="anomaly_detection_search_status"/></div>')
        setToken("searching", "inprogress")
    }, null)
    setTimeout(function(){
        // custom handler since I don't actually want the data here (and don't want to waste resources transferring it twice), I just want the SID
        splunkjs.mvc.Components.getInstance("anomaly_detection_search").on('search:done', function(properties) {
            let searchName = properties.content.request.label
            setToken("riskyevents", "riskyevents=" + properties.content.sid)
            
            splunkjs.mvc.Components.getInstance("annotationsForChart").set("search", splunkjs.mvc.tokenSafe("| summarizeeventsids mode=annotate riskyevents=" + properties.content.sid + " minrisklevel=2")) // | eval annotation_category=\"Score: \" . risk_score, annotation_label = mvappend(risk_contributors, Message), annotation_color=case(risk_score=1,\"0x98c697\", risk_score=2,\"0xfde5ae\", risk_score=3,\"0xf7b48c\", risk_score=4,\"0xea958d\", risk_score=5,\"0x9c3529\", 1=1,\"0x6f261d\")"))
            // | summarizeeventsids mode=annotate riskyevents=admin__admin_c2VhcmNoX2FjdGl2aXR5__RMD5ac2d4bd6aabcc60f_1549941193.3709 minrisklevel=2
            console.log("Got a baseline search")
            $("#anomaly_detection_search_statusdiv").html('<div style="height: 1.25em; padding: 0; background-color: blue; width: 100px; text-align: center; color: white;">Complete</div>')
            anomalyDetectQueryStack.splice(anomalyDetectQueryStack.indexOf(searchName),1)
            checkDesiredSearchingTokenStatus()
        });
    }, 300)

    window.dvtest = tokensForAnomalyDetectSearch;
    console.log("Got a fast search string", superfastSearchString)
    
    splunkjs.mvc.Components.getInstance("detailsearch").set("search", splunkjs.mvc.tokenSafe("| summarizeeventsids earliest=$selection.earliest$ latest=$selection.latest$ $riskyevents$ " + tokensForDetailSearch))

    splunkjs.mvc.Components.getInstance("superfastSearch").set("search", splunkjs.mvc.tokenSafe(superfastSearchString))

/*
    // Get the Events table
    var myEventsTable = mvc.Components.get('detailtable');

    // Respond to a click event
    myEventsTable.on("click", function(e) {
        // Prevent drilldown from redirecting away from the page
        e.preventDefault();
        
        // Console feedback
        console.log("Click", e); 


        var myModal = new Modal("detailModal", {
            title: "Detail",
            backdrop: 'static',
            keyboard: true,
            destroyOnHide: true,
            type: 'normal'
        });

        $(myModal.$el).on("hide", function() {

        })

        $(myModal.$el).on("shown", function() {
            $(".modal").css("width", "800px")
        })


        var supplements = JSON.parse(e.data['row.supplement'])
        var drilldownConfig = JSON.parse(e.data['row.eventDrilldown'])
        
        try{
            supplements = JSON.parse(supplements)
            drilldownConfig = JSON.parse(drilldownConfig)
        }
        catch(err){
                IS_JSON = false;
                // was seeing some weird situations where all of a sudden these values were being double-JSON-encapsulated. Leaving this here in case that occurs again.. 
        }                

        var body=$("<div></div>").html("<p>Below are the detailed results from each example. - " + '<a href="" id="groupDrilldownLink" target="_blank" class="ext">View all raw events</a>')
        
        for(var i = 0; i < supplements.length; i++){
            var d = new Date(0);
            d.setUTCSeconds(supplements[i]["realtime"]);
            var drilldownSearch = drilldownConfig['Base']
            for(var g = 0; g < drilldownConfig['AllowedFields'].length; g++){
                if(typeof supplements[i][drilldownConfig['AllowedFields'][g]] != "undefined" && supplements[i][drilldownConfig['AllowedFields'][g]] != ""){
                    drilldownSearch += " " + drilldownConfig['FieldPrefix'] + drilldownConfig['AllowedFields'][g] + "=\"" + supplements[i][drilldownConfig['AllowedFields'][g]] + "\""
                }    
            }

            var drilldownURL = encodeURI("search?earliest=" + Math.floor(parseInt( supplements[i]["realtime"] )) + "&latest=" + Math.ceil( 0.00001 + parseInt( supplements[i]["realtime"] )) + "&q=" + drilldownSearch)
            body.find("#groupDrilldownLink").attr("href", encodeURI("search?earliest=" + Math.floor(parseInt( supplements[i]["_time"] )) + "&latest=" + (15*60 + parseInt( supplements[i]["realtime"] )) + "&q=" + drilldownSearch))
            body.append($("<hr>"), $("<p>").html("Event on " + d.toLocaleString() + ' - <a href="' + drilldownURL + '" target="_blank" class="ext">View Raw Event</a>'))
            if(typeof supplements[i]['risk_score'] == "undefined" || supplements[i]['risk_score'] == "" || supplements[i]['risk_score'] == 0){
                body.append("Risk Score: " + (supplements[i]['risk_score'] || 0))
            }else{
                body.append("<b>Risk Score: " + supplements[i]['risk_score'] + "</b> - Risk Contributors: <div style=\"display: inline-block\">" + supplements[i]['risk_contributors'] + "</div>" )
            }
            
            var table = $("<table class=\"table table-striped\"><thead><tr><th>Name</th><th>Value</th></tr><tbody></tbody></table>")
            var values = Object.keys(supplements[i])
            for(var g = 0; g < values.length; g++){
                if(values[g]!="_time" && values[g]!="realtime" && values[g]!="risk_score" && values[g]!="risk_contributors"){
                    table.find("tbody").append("<tr><td>" + values[g] + "</td><td>" + supplements[i][values[g]] + "</td></tr>" )
                }

            }
            body.append(table)
            
        }

        console.log(supplements)
        myModal.body
            .append(body);

        myModal.footer.append($('<button>').attr({
            type: 'button',
            'data-dismiss': 'modal'
        }).addClass('btn btn-primary').text('Ok'))
        myModal.show(); // Launch it!


    });
End Modal Comment Out */
});




// Row Expansion
require([
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/chartview',
    'splunkjs/mvc/searchmanager',
  //  'splunkjs/mvc/eventsviewerview',
    'splunkjs/mvc',
    'underscore',
    'splunkjs/mvc/simplexml/ready!'],function(
    TableView,
    ChartView,
   // EventsViewerView,
    SearchManager,
    mvc,
    _
    ){
    var EventSearchBasedRowExpansionRenderer = TableView.BaseRowExpansionRenderer.extend({
        initialize: function(args) {
            // initialize will run once, so we will set up a search and a chart to be reused.
            /*this._searchManager = new SearchManager({
                id: 'details-search-manager',
                preview: false
            });
            this._chartView = new ChartView({
                managerid: 'details-search-manager',
                'charting.legend.placement': 'none'
            });*/
        },
        canRender: function(rowData) {
            // Since more than one row expansion renderer can be registered we let each decide if they can handle that
            // data
            // Here we will always handle it.
            return true;
        },
        render: function($container, rowData, a, b, c) {
            // rowData contains information about the row that is expanded.  We can see the cells, fields, and values
            // We will find the sourcetype cell to use its value
            console.log("Expansion -- got", $container, rowData, a, b, c)
            let myRow = rowData['rowIndex']
            let container = $container
            $container.each(function () {
                this.style.setProperty( 'background-color', 'white', 'important' );
            });
            var minWidthPerColumn = 350;
            var maxColumnsPerRow = Math.floor(parseInt($container.css("width").replace("px", "")) / 350)
            
            
            
            var results = splunkjs.mvc.Components.getInstance("detailsearch").data('results', { output_mode: 'json', count: 0 });
            results.on("data", function(properties) {
                var data = properties.data().results
                myRow = data[myRow];
                let rowHash = "event" + JSON.stringify(myRow).hashCode()    
                console.log("Here's my row", myRow)
                globalEarliest = myRow["grouping_earliest"]
                globalLatest = myRow["grouping_latest"]
                globalAllCriteria = []
                console.log("Got my earliest and latest", globalEarliest, globalLatest)

                var supplements = JSON.parse(myRow['supplement'])
                console.log("Here's my supplements", supplements)
                var drilldownConfig = JSON.parse(myRow['eventDrilldown'])
                console.log("Here's my drilldown", drilldownConfig)
                
                try{
                    supplements = JSON.parse(supplements)
                    drilldownConfig = JSON.parse(drilldownConfig)
                }
                catch(err){
                        IS_JSON = false;
                        // was seeing some weird situations where all of a sudden these values were being double-JSON-encapsulated. Leaving this here in case that occurs again.. 
                }              
                
                //var body=$("<div style=\"background-color: white;\"></div>").html("<p>Below are the detailed results from each example. - " + '<a href="" id="groupDrilldownLink" target="_blank" class="ext">View all raw events</a>')
                var body=$("<div style=\"background-color: white;\"></div>").html("<p>Below are the detailed results from each example. " + '<button id="groupDrilldownLink">View All Raw Events in Search</button>')
                var objID = JSON.stringify(myRow)
                for(var i = 0; i < supplements.length; i++){
                    let supplementId = rowHash + "-" + JSON.stringify(supplements[i]).hashCode()    
                    console.log("Exploring supplement", supplementId)
                    let d = new Date(0);
                    d.setUTCSeconds(supplements[i]["actual_time"]);
                    let drilldownSearch = drilldownConfig['Base']
                    let addToGlobal = "( * "
                    for(let g = 0; g < drilldownConfig['AllowedFields'].length; g++){
                        if(typeof supplements[i][drilldownConfig['AllowedFields'][g]] != "undefined" && supplements[i][drilldownConfig['AllowedFields'][g]] != ""){
                            drilldownSearch += " " + drilldownConfig['FieldPrefix'] + drilldownConfig['AllowedFields'][g] + "=\"" + supplements[i][drilldownConfig['AllowedFields'][g]] + "\""
                            addToGlobal += " " + drilldownConfig['FieldPrefix'] + drilldownConfig['AllowedFields'][g] + "=\"" + supplements[i][drilldownConfig['AllowedFields'][g]] + "\""
                        }    
                    }
                    
                    globalAllCriteria.push(addToGlobal + ")")
                    let drilldownURL = encodeURI("search?earliest=" + Math.floor(parseInt( supplements[i]["actual_time"] )) + "&latest=" + Math.ceil( 0.00001 + parseInt( supplements[i]["actual_time"] )) + "&q=" + drilldownSearch)
                    let eventEarliest = Math.floor(parseInt( supplements[i]["actual_time"] ))
                    let eventLatest = Math.ceil( 0.00001 + parseInt( supplements[i]["actual_time"] ))
                    if(supplements.length < 5){
                        setTimeout(function(){
                            searchHandler(supplementId, drilldownSearch, {"earliest_time": eventEarliest, "latest_time": eventLatest},null,null,function(searchName){
                                console.log("Search Started", searchName);
                                console.log("Going after", $("#" + searchName))
                                let EventsViewerView = require("splunkjs/mvc/eventsviewerview");


                                let myeventsviewer = new EventsViewerView ({
                                    id: "events-" + searchName,
                                    managerid: searchName,
                                    el: $("#" + searchName)
                                }).render();

                                myeventsviewer.on("rendered", function(){
                                    setTimeout(function(){
                                        $(".dveventsviewer .a").removeClass("a")
                                    },200)

                                })
                            
                            })
                            
                        }, 500)
                    }
                    
                    
                    body.append($("<hr>"), $("<p>").html("Event on " + d.toLocaleString() + ' <button onclick="drillDownToEvents(\'' + drilldownURL + '\')">View Raw Event in Search</a>'))
                    if(typeof supplements[i]['risk_score'] == "undefined" || supplements[i]['risk_score'] == "" || supplements[i]['risk_score'] == 0){
                        body.append("<p>Risk Score: " + (supplements[i]['risk_score'] || 0) + "</p>")
                    }else{
                        body.append("<p><b>Risk Score: " + supplements[i]['risk_score'] + "</b> - Risk Contributors: <div style=\"display: inline-block\">" + supplements[i]['risk_contributors'] + "</div></p>" )
                    }
                    
                    var table = $("<table class=\"table table-striped\"></table>") // <thead><tr><th>Name</th><th>Value</th></tr><tbody></tbody>
                    var values = Object.keys(supplements[i])


                    var numInScopeColumns = 0;
                    for(var g = 0; g < values.length; g++){
                        if(values[g]!="_time" && values[g]!="realtime" && values[g]!="actual_time" && values[g]!="rounded_time" && values[g]!="unique_identifier" && values[g]!="risk_score" && values[g]!="risk_contributors"){
                            numInScopeColumns++;
                        }
                    }
                    var numRows = Math.ceil( numInScopeColumns / maxColumnsPerRow )
                    var numColumns = Math.ceil( numInScopeColumns / numRows )
                    var widthPerColumn =  Math.floor( parseInt($container.css("width").replace("px", "")) / numColumns )
                    var minWidthPerColumn = Math.floor( widthPerColumn / 2)
                    console.log("Calculation complete.", {"Screen Width": parseInt($container.css("width").replace("px", "")), "minWidthPerColumn": minWidthPerColumn, "maxColumnsPerRow": maxColumnsPerRow, "numInScopeColumns": numInScopeColumns, "numRows": numRows, "numColumns": numColumns, "widthPerColumn": widthPerColumn})
                    


                    var currentTRHead = $("<tr></tr>")
                    var currentTRBody = $("<tr></tr>")
                    var columnCount = 0;
                    for(var g = 0; g < values.length; g++){
                        if(values[g]!="_time" && values[g]!="realtime" && values[g]!="actual_time" && values[g]!="rounded_time"  && values[g]!="unique_identifier" && values[g]!="risk_score" && values[g]!="risk_contributors"){
                            //table.find("tbody").append("<tr><td style=\"background-color: white !important;\">" + values[g] + "</td><td style=\"background-color: white !important;\">" + supplements[i][values[g]] + "</td></tr>" )
                            currentTRHead.append("<td style=\"min-width: " + minWidthPerColumn + "px; font-weight: bold; background-color: white !important;\">" + values[g] + "</td>")
                            currentTRBody.append("<td style=\"min-width: " + minWidthPerColumn + "px; background-color: white !important;\">" + $('<div>').text(supplements[i][values[g]]).html() + "</td>" )
                            columnCount++;
                            if(numColumns == columnCount){
                                table.append(currentTRHead)
                                table.append(currentTRBody)
                                var currentTRHead = $("<tr></tr>")
                                var currentTRBody = $("<tr></tr>")
                            }
                        }
                    }
                    if(columnCount > 0){
                        for(let g = columnCount; g < numColumns; g++){
                            currentTRHead.append("<td>&nbsp;</td>")
                            currentTRBody.append("<td>&nbsp;</td>")
                        }
                        table.append(currentTRHead)
                        table.append(currentTRBody)
                    }
                    body.append(table)
                    body.append('<div class="dveventsviewer" style="white-space: normal !important;" id="' + supplementId + '"></div>')
                    
                }
                if( parseFloat(globalEarliest) == parseFloat(globalLatest)){
                    globalLatest = parseFloat(globalLatest) + 0.1
                }
                let url = encodeURI("search?earliest=" + globalEarliest + "&latest=" + globalLatest + "&q=" + drilldownConfig['Base'] + " (" + globalAllCriteria.join(" OR ") + ")")
                body.find("#groupDrilldownLink").click(function(){ drillDownToEvents(url) } )
                
                //$container.append("<pre>" + JSON.stringify() + "</pre>")
                console.log("Here's the body", body.html())
                container.append(body)
            })

            /*
            var myResults = splunkjs.mvc.Components.getInstance("detailsearch").data("results", { output_mode: 'json', count:0});
            
            myResults.on( "data", function(properties) {
                var rows = properties.data().rows;
                $container.append("<pre>" + JSON.stringify(rows[myRow]))
                // AND SO ON
            } );*/
            var sourcetypeCell = _(rowData.cells).find(function (cell) {
                console.log("Analyzing Fields for Expansion", cell.field, cell)
               return cell.field === 'Message';
            });
            //update the search with the sourcetype that we are interested in
            //this._searchManager.set({ search: 'index=_internal sourcetype=' + sourcetypeCell.value + ' | timechart count'});
            // $container is the jquery object where we can put out content.
            // In this case we will render our chart and add it to the $container
            //$container.append(this._chartView.render().el);
            //$container.append("<p>Hello World</p>");
        }
    });
    var tableElement = mvc.Components.getInstance("detailtable");
    tableElement.getVisualization(function(tableView) {
        // Add custom cell renderer, the table will re-render automatically.
        tableView.addRowExpansionRenderer(new EventSearchBasedRowExpansionRenderer());
    });
    
    // Get the Events table
    var myEventsTable = splunkjs.mvc.Components.get('detailtable');

    // Respond to a click event
    myEventsTable.on("click", function(e) {
        // Prevent drilldown from redirecting away from the page
        e.preventDefault();
        
        // Console feedback
        console.log("Click", e); 

        $(e.event.originalEvent.target).parent("tr").find("td").first().click()
    })

    
});


function checkAllTokenValue(){
    var searchString = splunkjs.mvc.Components.getInstance("anomaly_detection_search").attributes.search.value || splunkjs.mvc.Components.getInstance("anomaly_detection_search").attributes.search
    var myRegex = /\$(\S*)\$/g,
             matches,
             tokens = [];
    window.tokenResults = ""
    console.log("Got search string", searchString)
    console.log("Got these token results", myRegex.exec(searchString))
    while (matches = myRegex.exec(searchString)) {
        if(typeof splunkjs.mvc.Components.getInstance("submitted").get(matches[1]) == "undefined"){
                console.log("No Token found for", matches[1])
                window.tokenResults += "No Token found for " + matches[1] + "\n"
        }else if(typeof splunkjs.mvc.Components.getInstance("submitted").get(matches[1]) == "undefined"){
                console.log("Got a token found for", matches[1], splunkjs.mvc.Components.getInstance("submitted").get(matches[1]))
                window.tokenResults += "Got a Token for " + matches[1] + ": " + splunkjs.mvc.Components.getInstance("submitted").get(matches[1]) + "\n"
        }
    }
    searchString = splunkjs.mvc.Components.getInstance("detailsearch").attributes.search.value || splunkjs.mvc.Components.getInstance("detailsearch").attributes.search
    var myRegex = /\$(\S*)\$/g,
             matches,
             tokens = [];
    window.tokenResults = ""
    console.log("Got search string", searchString)
    console.log("Got these token results", myRegex.exec(searchString))
    while (matches = myRegex.exec(searchString)) {
        if(typeof splunkjs.mvc.Components.getInstance("submitted").get(matches[1]) == "undefined"){
                console.log("No Token found for", matches[1])
                window.tokenResults += "No Token found for " + matches[1] + "\n"
        }else if(typeof splunkjs.mvc.Components.getInstance("submitted").get(matches[1]) == "undefined"){
                console.log("Got a token found for", matches[1], splunkjs.mvc.Components.getInstance("submitted").get(matches[1]))
                window.tokenResults += "Got a Token for " + matches[1] + ": " + splunkjs.mvc.Components.getInstance("submitted").get(matches[1]) + "\n"
        }
    }
    
}


/// Row Highlighting

  require([
      'underscore',
      'jquery',
      'splunkjs/mvc',
      'splunkjs/mvc/tableview',
      '../app/search_activity/theme_utils',
      'splunkjs/mvc/simplexml/ready!'
  ], function(_, $, mvc, TableView, themeUtils) {
      
      var isDarkTheme = themeUtils.getCurrentTheme && themeUtils.getCurrentTheme() === 'dark';
       // Row Coloring Example with custom, client-side range interpretation
      var CustomRangeRenderer = TableView.BaseCellRenderer.extend({
          canRender: function(cell) {
              
              return _(['risk_score']).contains(cell.field);
          },
          render: function($td, cell) {
              // Add a class to the cell based on the returned value
              
              var value = parseFloat(cell.value);
              // Apply interpretation for number of historical searches
              if (cell.field === 'risk_score') {
                  if (value > 0 && value <= 5) {
                      $td.addClass('range-cell').addClass('range-level' + value);
                  }else if(value>5){
                    $td.addClass('range-cell').addClass('range-extreme');
                  }
              }
              // Update the cell content
              $td.text(value);
          }
      });
      mvc.Components.get('detailtable').getVisualization(function(tableView) {
          tableView.on('rendered', function() {
            
            // Apply class of the cells to the parent row in order to color the whole row
            var myTimer = setInterval(applyStyles, 100);
            function applyStyles(){
                if( $("#detailtable").find("td.string").first().text().length >10){
                    $("#detailtable").find(".table-striped").removeClass("table-striped");
                    $('td.range-cell').each(function() {
                        $(this).parents('tr').addClass(this.className);
                    });   
                    setTimeout(function(){
                        $("#detailtable").find(".table-striped").removeClass("table-striped");
                        $('td.range-cell').each(function() {
                            $(this).parents('tr').addClass(this.className);
                        });   
                    }, 100)
                    clearInterval(myTimer)
                }
            }
                
              if(isDarkTheme){
                tableView.$el.find('td.timestamp').each(function() {
                   $(this).parents('tr').addClass('dark');
                });
              }
          });
          // Add custom cell renderer, the table will re-render automatically.
          tableView.addCellRenderer(new CustomRangeRenderer());
      });
  });


  function drillDownToEvents(url){
    var win = window.open(url, '_blank');
    win.focus();
  }




// Configuration Menu
function showConfig(){

    require([
        "splunkjs/mvc",
        "../app/search_activity/Modal",
        "splunkjs/mvc/simplexml/ready!"
    ], function(mvc, Modal) {


        var myModal = new Modal("configModal", {
            title: "Detail",
            backdrop: 'static',
            keyboard: true,
            destroyOnHide: true,
            type: 'normal'
        });

        $(myModal.$el).on("hide", function() {

        })

        $(myModal.$el).on("shown", function() {
            $(".modal")
        })


        var body=$("<div></div>").html("<p>Configuration Objects</p>")
        for(var i = 0; i < SearchConfig.length; i++){
            body.append(generateSearchConfigHTML(SearchConfig[i]))
        }
        myModal.body
            .append(body);

        myModal.footer.append($('<button>').attr({
            type: 'button',
            'data-dismiss': 'modal'
        }).addClass('btn btn-primary').text('Ok'))
        myModal.show(); // Launch it!
    })
}


function generateSearchConfigHTML(search){
    var div = $('<div class="search-config-container" id="' + search["paramname"] + '"></div>')
    div.append("<h3>" + search["name"] + "</h3>")
    
    div.append(generateConfigObject("Status", "status", search["status"], "input", true, "Available Options: enabled, disabled"))
    div.append(generateConfigObject("Detail Search", "coresearch", search["coresearch"], "textarea", true, "This is quite tricky -- go to docs to validate."))
    div.append(generateConfigObject("Baseline Search", "behavioralbackfill", search["behavioralbackfill"], "textarea", true, "This is quite tricky -- go to docs to validate."))
    div.append(generateConfigObject("Fast Count Search", "fastcountsearch", search["fastcountsearch"], "textarea", true, "This is quite tricky -- go to docs to validate."))
    div.append(generateConfigObject("Should Aggregate", "aggregate", search["aggregate"], "input", true, "Available Options: true, false."))
    div.append(generateConfigObject("Summation Fields", "sumfields", search["sumfields"], "input", true, "Comma separated list of fields that should be aggregated summed up when aggregating (e.g., duration, bytes_out, etc.)"))
    div.append(generateConfigObject("Count Fields", "countfields", search["countfields"], "input", true, "Comma separated list of fields that should be counted (distinct count)  when aggregating (e.g., user, dashboard, etc.)"))
    div.append(generateConfigObject("Text Summary", "summarytext", search["summarytext"], "input", true, "Short description that summarize the values of an aggregated set of events. (Field replacement in Text Summary Fields)"))
    div.append(generateConfigObject("Text Summary Fields", "summarytextfields", search["summarytextfields"], "input", true, "Comma separated list of fields where we'll replace values in the Text Summary. These should match either static values in your data (maybe user?) or counted / summed fields defined in this object."))
    // name
    // paramname
    // coresearch
    // behavioralbackfill
    // fastcountsearch
    // aggregate
    // sumfields
    // countfields
    // summarytext
    // summarytextfields
    // drilldownConfig
    // _key 
    
    return div;
}

function generateConfigObject(label, key, value, type, isDefault, description, style){
    if(typeof style=="undefined"){
        style=""
    }
    var configObj = $('<div class="search-config-object"></div>')
    configObj.append("<label class=\"search-config-label\">" + label + '</label>')
    if(isDefault){
        configObj.append($('<span class="search-config-restore" id="search-config-restore-' + key + '">(Restore Default)</span>').click(function(){
            console.log("Ask to restore config for ", this)
        }))
    }
    if(typeof description != "undefined" && description != ""){
        configObj.append("<p class=\"search-config-description\">" + description + "</p>")
    }
    if(type == "input"){
        configObj.append('<input type="text" style="' + style + '" value="' + value.replace(/"/g, '\\"') + '" id="search-config-' + key + '" />')
    }else if(type == "textarea"){
        configObj.append('<textarea type="text" style="' + style + '" id="search-config-' + key + '">' + value.replace(/"/g, '\\"') + '</textarea>')
    }
    
    return configObj
}
