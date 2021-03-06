require([
	"splunkjs/mvc",
	"splunkjs/mvc/utils",
	"splunkjs/mvc/tokenutils",
	"underscore",
	"jquery",
	"splunkjs/mvc/simplexml",
	"splunkjs/mvc/headerview",
	"splunkjs/mvc/footerview",
	"splunkjs/mvc/simpleform/input/dropdown",
	"splunkjs/mvc/simpleform/input/timerange",
	"splunkjs/mvc/simpleform/input/submit",
	"splunkjs/mvc/searchmanager",
	"splunkjs/mvc/postprocessmanager",
	"splunkjs/mvc/simplexml/urltokenmodel"
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
		DropdownInput,
		TimeRangeInput,
		SubmitButton,
		SearchManager,
		PostProcessManager,
		UrlTokenModel
		) {
	
            


        var ConfigCheckSystem = new SearchManager({
            "id": "ConfigCheckSystem",
            "cancelOnUnload": true,
            "latest_time": "",
            "status_buckets": 0,
            "earliest_time": "0",
            "search": ' | rest splunk_server=local "/servicesNS/admin/search_activity/properties/macros/SA_Config_System/definition" ',
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false
        }, {tokens: true, tokenNamespace: "submitted"});



        var mainSearch = splunkjs.mvc.Components.getInstance("ConfigCheckSystem");
        var myResults = mainSearch.data('results', { output_mode:'json', count:0 });

        mainSearch.on('search:done', function(properties) {
            // clear div elements of previous result



            if(mainSearch.attributes.data.resultCount == 0) {
              return;
            }       

            myResults.on("data", function() {
                var data = myResults.data().results;
                console.log("Here are my results: ", data, data[0].value)         
                if(data[0].value == "unconfigured"){
                	$("<div class=\"dashboard-row\"><div style=\"background-color: #F99; color: #600; border: 1px #e60000 solid;\"><h2>Warning, Setup Not Complete</h2><p>This app is likely missing critical setup elements. You should visit the <a href=\"/app/search_activity/setup\">setup page</a> to complete the setup process. If you are receiving this message in error, please adjust the SA_Config_System macro, but more than likely you should just go complete the setup.</p><p>You should be redirected in the next ten seconds....</p><script>setTimeout(window.location.replace(\"/app/search_activity/setup\"), 4000);</script></div></div>").insertBefore(".dashboard-row1:first");
                //	db = document.getElementById("dashboard");
                //	db.innerHTML = "<div class=\"dashboard-row\"><div style=\"background-color: #F99; color: #600; border: 1px #e60000 solid;\"><h2>Warning, Setup Not Complete</h2><p>This app is likely missing critical setup elements. You should visit the <a href=\"/app/search_activity/setup\">setup page</a> to complete the setup process. If you are receiving this message in error, please adjust the SA_Config_System macro, but more than likely you should just go complete the setup.</div></div>" + db.innerHTML
                }
                	
            });
          });



});




require(['splunkjs/mvc','splunkjs/mvc/utils','splunkjs/mvc/simplexml/ready!'], function(mvc, utils){
                            var unsubmittedTokens = mvc.Components.getInstance('default');
                            var submittedTokens = mvc.Components.getInstance('submitted');

submittedTokens.on('change:sh_clause', function () {

	/*   (SearchHead=zeus-na.demo.splunk.com OR SearchHead=PCI_PROD_EU OR SearchHead=PAN-NA-PROD-7MAR14) */
	var cur_metric = submittedTokens.get("sh_clause");
	var myvar = "DummySH"
	if(cur_metric == "(SearchHead=*)"){
		myvar = "*"
		console.log("Using a generic SearchHead")
	}
	var regex1 = new RegExp(" OR ", "g")
	var regex2 = new RegExp("SearchHead=", "g")
	var shs = cur_metric.replace("(", "").replace(")", "").replace(regex2,"").split(" OR ")
	for(i=0; i<7; i++){
		unsubmittedTokens.set("shlink" + (i+1), "DummySH")
	}
	for(i=0; i<shs.length; i++){
		unsubmittedTokens.set("shlink" + (i+1), shs[i])
	}
	
	submittedTokens.set(unsubmittedTokens.toJSON());

})});

