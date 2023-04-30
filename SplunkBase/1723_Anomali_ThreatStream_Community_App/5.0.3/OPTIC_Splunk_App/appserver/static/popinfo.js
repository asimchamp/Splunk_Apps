
//set script path
require.config({
    paths: {
    	popUtil: '../app/OPTIC_Splunk_App/share/popUtil',
    	remarkable: '../app/OPTIC_Splunk_App/share/remarkable'
    }
});

require([
          "jquery",
          "splunkjs/mvc",
          "splunkjs/mvc/searchmanager",
          "splunkjs/mvc/tableview",
          "splunkjs/mvc/simpleform/formutils",
          "popUtil",
          "remarkable",
          "splunkjs/mvc/simplexml/ready!" ],
          function(
        		  $,
        		  mvc,
        		  SearchManager,
        		  TableView,
        		  FormUtils,
        		  popUtil,
        		  Remarkable
          ) {


	 //test
    var remarkable = new Remarkable({
	  html:         true,        // Enable HTML tags in source
	  xhtmlOut:     true,        // Use '/' to close single tags (<br />)
	  breaks:       true,        // Convert '\n' in paragraphs into <br>
	  langPrefix:   'language-',  // CSS language prefix for fenced blocks
	  linkify:      true,        // Autoconvert URL-like text to links

	  // Enable some language-neutral replacement + quotes beautification
	  typographer:  false,

	  // Double + single quotes replacement pairs, when typographer enabled,
	  // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
	  quotes: '“”‘’',

	  // Highlighter function. Should return escaped HTML,
	  // or '' if the source string is not changed
	  highlight: function (/*str, lang*/) { return ''; }
	});

	//console.log(remarkable.render('# Remarkable rulezz!'));


	//alert("123 ok!");
	_bsearch = "| inputlookup tm_tipreport | fields _time, name, owner_org_name, status, threat_actor, source, id, body, intelligence, tags";
	_timerange = "-24h@h";
	var infoSearch = new SearchManager({
      "id": "_bsearch",
      "status_buckets": 0,
      "earliest_time": _timerange,
      "latest_time": "now",
      "search": _bsearch,
      "cancelOnUnload": true,
      "auto_cancel": 90,
      "preview": true,
      "runWhenTimeIsUndefined": true
	}, {tokens: true, tokenNamespace: "submitted"});

	var _results = infoSearch.data("results", {
		count: 100
	});

	function renderBulletin(bulletin) {
		var content = '<div class="bblock">';
		content += '<div style="font-size: 14px;">Tags: <span id ="ioccount" style="float: right;" >';
		var iocs = bulletin.intelligence.split(",");
   		var iocs_line = "Associated IOCs: " + iocs.length;
		content += iocs_line + '</span><span id ="btags">';
		content += bulletin.tags + '</span></div>';
		var posted_line = "Posted on " + bulletin.time + " by " + bulletin.owner_org_name;
		content += '<div style="font-size: 14px; padding: 5px 0;" class="postinfo">' + posted_line + '</div>';
		var bodyhtml = remarkable.render(bulletin.body || "");
		content += '<div class="bodydetail">' + bodyhtml + '</div>';
		content += '</div>';
		content += '<div><button type="button" style="float:right;" bid="' + bulletin.id + '" class="btn btn-secondary">Check Status</button></div>';
		//content += '<div class="bblock" id = "checked_summary" ><div><i class="icon icon-rotate"></i>&nbsp;Waiting for check...</div></div>';
		//content += '<div class="bblock" id = "checked_view" ><div><i class="icon icon-rotate"></i>&nbsp;Waiting for check...</div></div>';
    	return content;
	}

	function renderCheckResult(rows) {
		var html = "<table style='width: 100%;'>";
		html += "<tr style='border-bottom:1px solid #ccc;text-align:left;'><th>Source Type</th><th>Scanned events</th><th>Match</th></tr>";
		for(var i = 0; i < rows.length; i++) {
			var row = rows[i];
			var mcount = row[3];
			html += "<tr><td>" + row[0] + "</td>";
			html += "<td>" + row[1] + "</td>";
			if(mcount > 0) {
				html += "<td>" + mcount + "&nbsp;<i class='icon icon-warning-sign'></i></td>";
			} else {
				html += "<td>" + mcount + "&nbsp;<i class='icon icon-check'></i></td>";
			}
			html += "</tr>";
		}
		return html;
	}

	var dialog, bulletins = [], chkButton;
    var searchMap = {};
    function processBulletinCheck(bid, name) {
		//start check
		var _csearch = '| tstats count as event_count, min(_time) as start, max(_time) as end from datamodel=TS_Optic by sourcetype | eval "First Event"= round(start) | eval "Last Event" = round(end) | join type=outer sourcetype [|inputlookup ts_ioc_matches| addinfo | eval info_max_time=if(info_max_time=="+Infinity", info_search_time, info_max_time) | where _time >= info_min_time AND _time <= info_max_time | search ts_tb_id=' + bid + ' | stats count as match_count by sourcetype] | fillnull value=0 match_count | eval Detail=if (match_count==0, "Scan " + event_count+ " events", "Found " + match_count + " matches" ) | convert ctime("First Event") | convert ctime("Last Event")| table sourcetype, "First Event", "Last Event", event_count, match_count, Detai';
		var sid = "_checksearch" + bid;
		var checkSearch = searchMap[sid];
		if(!checkSearch) {
			checkSearch = new SearchManager({
		      "id": sid,
		      "status_buckets": 0,
		      "search": _csearch,
		      "cancelOnUnload": true,
		      "auto_cancel": 90,
		      "earliest_time": _timerange,
		      "latest_time": "now",
		      "preview": true,
		      "runWhenTimeIsUndefined": true
			}, {tokens: true, tokenNamespace: "submitted"});
			searchMap[sid] = checkSearch;
		}
		var check_results = checkSearch.data("results", {
			count: 100
		});
		check_results.on("data", function(evt) {
			if (check_results.hasData()) {
				var data = evt._data, rows = data.rows;
				//summary
				renderCheckSummary(name, rows);
					//detail
				var html = renderCheckResult(rows);
				$("#checked_view").html(html);
			}
		});

		function renderCheckSummary(name, rows) {
			var html = '<div class="btitle">Scan Summary: ' + name + '</div>';
			var tmatch = 0, tevents = 0;
			for(var i = 0; i < rows.length; i++) {
				var row = rows[i];
				tmatch += parseInt(row[4]);
				tevents += parseInt(row[3]);
			}
			html += "<div style='text-align: center;padding: 30px 0;'>";
			if(tmatch > 0) {
				html += "<i class='icon icon-warning-sign' style='font-size: 90px;'></i>";
	   			html += "</div>";
	   			html += "<div style='font-size: 14px;'>Found " + tmatch + " IOC matches for weekly threat brief: " + name + ".</div>";
   			} else {
				html += "<i class='icon icon-check' style='font-size: 90px;'></i>";
				html += "</div>";
	   			html += "<div style='font-size: 14px;'>NO IOC matches for weekly threat brief: " + name + ".</div>";
			}
			html += "<div class='sinfo' style='font-size: 14px;'>Scanned " + tevents + " events across " +  rows.length + " sources";
			var url = Splunk.util.make_full_url("/");
			if(tmatch > 0) {
				html += " See <a href='" + url + "app/OPTIC_Splunk_App/_ts_triage'>event triage</a> for detail"
			}
			html += ".</div>";
			$("#checked_summary").html(html);
		}

		function renderCheckResult(rows) {
			var html = "<div class='btitle'>Scan Detail</div><br>";
			html += "<table style='width: 100%;'>";
			html += "<tr style='border-bottom:1px solid #ccc;text-align:left;'><th>Source Type</th><th>First events</th><th>Last events</th><th>Status</th><th>Detail</th></tr>";
			for(var i = 0; i < rows.length; i++) {
				var row = rows[i];
				var mcount = row[4];
				html += "<tr><td>" + row[0] + "</td>";
				html += "<td>" + row[1] + "</td>";
				html += "<td>" + row[2] + "</td>";
				if(mcount > 0) {
					html += "<td><i class='icon icon-warning-sign'></i></td>";
					html += "<td>Found " + mcount + " events</td>";
				} else {
					html += "<td><i class='icon icon-check'></i></td>";
					html += "<td>Scanned " + row[3] + " records</td>";
				}
			}
			return html;
		}

		//
		//checkSearch.startSearch();

    }

	_results.on("data", function() {
	    if (_results.hasData()) {
	    	if(dialog) {
	    		return;
	    	}
	        var data = _results.data(), rows = data.rows;
	        if(rows.length == 0) {
	        	return;
	        }
	        var row = rows[0];
        	var bulletin = {
        		time: row[0],
        		name: row[1],
        		owner_org_name: row[2] || "",
        		status: row[3] || "",
        		threat_actor: row[4] || "",
        		id: row[6] || "",
        		body: row[7] || "",
        		intelligence: row[8] || "",
        		tags: row[9] || ""
        	}
        	var content = renderBulletin(bulletin);
	        var title = 'Breaking News: "' +  bulletin.name + '"';
	        dialog = popUtil.showInfo(title, content, 800);
	        //console.log(dialog.$el)
	        dialog.$el.on("click", function(evt) {
	        	var target = $(evt.target);
	        	var bid = target.attr("bid");
	        	if(bid) {
	        		//alert(bid);
	        		var html = '<div class="bblock" id = "checked_summary" ><div><i class="icon icon-rotate"></i>&nbsp;Waiting for check...</div></div>';
	        		html += '<div class="bblock" id = "checked_view" ><div><i class="icon icon-rotate"></i>&nbsp;Waiting for check...</div></div>';
	        		target.parent().html(html);
	        		//do check
	        		processBulletinCheck(bulletin.id, bulletin.name)
	        	}
	        	//console.log(target);
	        })
	    }
	});


	_results.on("error", function() {
		console.log("error");
	});

})

