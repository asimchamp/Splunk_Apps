
//set script path
require.config({
    paths: {
    	popUtil: '../app/OPTIC_Splunk_App/share/popUtil'
    }
});



define([
    	'underscore',
        "jquery",
        "splunkjs/mvc",
        "splunkjs/mvc/searchmanager",
        "splunkjs/mvc/tableview",
        "splunkjs/mvc/simpleform/formutils",
        "popUtil",
        'views/shared/Modal'
    ],
	function(_,  $, mvc, SearchManager, TableView, FormUtils, popUtil, Modal) {

	//ts util
	var tsUtil = {};

    var toggle_on_search = new SearchManager({
        id: "toggle-on-search",
        earliest_time: "-24h@h",
        latest_time: "now",
        cache: false,
        autostart: false,
        search: "| script ts_toggle_saved_search action=enable"
    });

    var toggle_off_search = new SearchManager({
        id: "toggle-off-search",
        earliest_time: "-24h@h",
        latest_time: "now",
        cache: false,
        autostart: false,
        search: "| script ts_toggle_saved_search action=disable"
    });

	var _cloudsearch = '| tstats count, min(_time) as first_event, max(_time) as last_event from datamodel=TS_Optic by sourcetype | eval first_event = round(first_event) | eval last_event=round(last_event) | convert ctime(first_event) | convert ctime(last_event)';
	var _timerange = "-1h@h";
	var infoSearch = new SearchManager({
      //"id": "_cloudsearch",
      "status_buckets": 0,
      "earliest_time": _timerange,
      "latest_time": "now",
      "search": _cloudsearch,
      "cancelOnUnload": true,
      "auto_cancel": 90,
      "preview": true,
      autostart: false,
      "runWhenTimeIsUndefined": true
	}, {tokens: true, tokenNamespace: "submitted"});

	var _results = infoSearch.data("results", {
		count: 100
	});

	_results.on("data", function() {
	    if (_results.hasData()) {
	        var data = _results.data(), rows = data.rows;
	        if(rows.length == 0) {
	        	$(".cin-log-view").html("No logs found.")
	        } else {
	        	//console.log(rows)
	        	var html = renderUpLoadResult(rows);
	        	$(".cin-log-view").html(html);
	        }
	    }
	})
	//fix no result when done
	_results.on("search:done", function(state, job) {
		if (state.content.resultCount === 0) {
			//alert("no results");
			$(".cin-log-view").html("No logs found.")
		}
	});

    function toggleCloudIOCMatch(flag, callback, sliderClick) {
    	if(sliderClick) {
            if(flag) {
            	toggle_on_search.startSearch();
        	} else {
        		toggle_off_search.startSearch();
        	}
        	if(callback) {
        		//call to update toggle
        		callback();
        	}
        } else {
	    	infoSearch.startSearch();
	    	//poopup dialog
	    	var title = 'Advanced Threat Matching';
	    	var buttons = [], btext = "Disable Advanced Threat Matching";
	    	if(flag) {
	    		btext = "Enable Advanced Threat Matching";
	    	}
	    	var content = "<div class='cim-desc'>Anomali offers a free threat matching service that monitors your environment against over 1 million known malicious indicators. Simply click below to enable Advanced Threat Matching. This will securely send a summary index of log data to Anomali for analysis. Every day you will receive a report detailing any matches to known indicators from the Anomali Threat Database. These can be viewed in the Matches page.</div>";
	    	content += "<br><div class='cim-desc'>By enabling Advanced Threat Matching you also get access to the full history of Anomali Labs Weekly Threat Briefings. This gives you the ability to perform health checks against the threats listed in the briefing.</div><br>";
	        content += "<button type='button' class='btn btn-primary toggleBtn' style='margin-left: 275px;' data-dismiss='modal'>" + btext + "</button>";
	    	content += "<br><br>";
	    	content += "<div class='cin-title'>The following logs lists the data that will be summarized and shared with Anomali for analysis:</div>";
	      	content += "<div class='cin-log-view'>Loading...</div>";
	    	
	    	//buttons.push(button);
		    var dialog = popUtil.createDialog(title, content, buttons, 800);
		    $('.toggleBtn').on("click", function() {
		    	var text = $(this).text();
	      		console.log(text);
	      		if(flag) {
	      			toggle_on_search.startSearch();
	      			$(this).html('Disable Advanced Threat Matching');
	      		} else {
	      			toggle_off_search.startSearch();
	      			$(this).html('Enable Advanced Threat Matching');
	      		}
	      		if(callback) {
	      			//call to update toggle
	      			callback();
	      		}
	      	});
		    //console.log(dialog.$el)
		    dialog.show();
        }
    }


	function renderUpLoadResult(rows) {
		var html = "<table style='width: 100%;'>";
		html += "<tr style='border-bottom:1px solid #ccc;text-align:left;'><th>Source Type</th><th>First events</th><th>Last events</th><th>Detail</th></tr>";
		for(var i = 0; i < rows.length; i++) {
			var row = rows[i];
			html += "<tr><td>" + row[0] + "</td>";
			html += "<td>" + row[2] + "</td>";
			html += "<td>" + row[3] + "</td>";
			var mcount = row[1];
			html += "<td>" + mcount + "&nbsp;records</td>";
			html += "</tr>";
		}
		return html;
	}

	//set
	tsUtil.toggleCloudIOCMatch = toggleCloudIOCMatch;

	return tsUtil;
});




