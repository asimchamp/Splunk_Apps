require.config({
    paths: {
		jquery_netapp: '../app/netapp_app_eseries_perf/js/jquery_netapp',
        underscore_utils: '../app/netapp_app_eseries_perf/js/underscore-min'
    }
});


require([
		'jquery_netapp',
		'underscore_utils',
		'splunkjs/mvc',
		'splunkjs/mvc/searchmanager',
		'splunkjs/mvc/tableview',
		'splunkjs/mvc/simplexml/ready!'], function ($, _, mvc, SearchManager, TableView) {
	var submitted = mvc.Components.get("submitted");
	var unsubmittedTokens = mvc.Components.get('default');
	var utils = require("splunkjs/mvc/utils");
	var defaultTokenModel = mvc.Components.getInstance('default', {
			create : true
		});
	var submittedTokenModel = mvc.Components.getInstance('submitted', {
			create : true
		});
	//var flg = false;
	var current = Splunk.util.getConfigValue("USERNAME");
	var CustomRangeRenderer = TableView.BaseCellRenderer.extend({
			canRender : function (cell) {
				return _(['Needs Attention']).contains(cell.field);
			},
			render : function ($td, cell) {
				if (cell.value == "true") {
					$td.html("<div style=\'color:red;cursor:pointer;\'><b>" + cell.value + "</b>&nbsp;&nbsp;&nbsp;<span style=\'color:blue;text-decoration: underline\'>(more info )</span>  </div>");
				} else {
					$td.html("<div>" + cell.value + "</div>");
				}
			}
	});	

	function drawTable()
	{
		var counter=1;
		$('#config_table').html("");
		var d = new Date().getMilliseconds();
		var mysearch = new SearchManager({
			id : "t_search"+ d,
			preview : true,
			cache : true,
			earliest_time : "-4h",
			latest_time : "now",
			search : '`get_nesa_index` sourcetype=eseries:graph | stats first(_raw) AS _raw by host | spath sa.saData.storageArrayLabel output=arrayName | eval arrayName=if(arrayName=="", "Unnamed-".mvindex(split(host, "-"), 0), arrayName) | where like(upper(arrayName),upper("%'+unsubmittedTokens.get('form.array_tkn')+'%"))  | spath volumeGroup{} output=volumeGroup | eval volumeGroup_count=mvcount(volumeGroup) | fields - volumeGroup | spath volume{} output=volume | eval volume_count=mvcount(volume) | fields - volume | spath drive{} output=drive | eval drive_count=mvcount(drive) | fields - drive | spath configGeneration output=configGeneration | spath sa.saData.needsAttention output=needsAttention | spath sa.saData.fixing output=fixing | spath sa.saData.bootTime output=boot | `ctime(boot)` | spath sa.saData.chassisSerialNumber output=serialNumber | sort arrayName | table arrayName, host, needsAttention, fixing, configGeneration, volumeGroup_count, volume_count, drive_count, boot, serialNumber | rename host AS "arrayId"   arrayName AS "Array Name"   volumeGroup_count AS "Volume Groups/Pools Count"   volume_count AS "Volume Count"   drive_count AS "Drive Count"   boot AS "Boot Time"   serialNumber AS "Serial Number"   configGeneration AS "Config Generation"   needsAttention AS "Needs Attention"   fixing AS "Fixup Activity"'
		});
		
			setsrcCookie("config_summary_rowcount", submitted.get('rowcount'));
		
			var arraySummaryTable = new TableView({
					id : "arraySummary" + d,
					managerid : "t_search"+ d,
					rowNumbers : true,
					"title" : "Array",
					el : $("#config_table"),
					pageSize : getsrcCookie("config_summary_rowcount"),
					drilldown : "cell"
				});
			arraySummaryTable.on("click", function (e) {
				// Bypass the default behavior
				e.preventDefault();
				if (e.data['click.name2'] === "Array Name" || e.data['click.name2'] === "arrayId") {
					utils.redirect("config_array?form.arrayId=" + e.data['row.arrayId'], "_blank");
				} else if (e.data['click.name2'] === "Needs Attention") {
					if(e.data['row.Needs Attention']==="true"){
						utils.redirect("failure_array?form.arrayId_tkn=" + e.data['row.arrayId'], "_blank");
					}
				}
			});
			arraySummaryTable.table.addCellRenderer(new CustomRangeRenderer());
			arraySummaryTable.render();
	}
	function setsrcCookie(cookiename, cookievalue) {
		document.cookie=current + "_" + cookiename+"="+cookievalue;
	}
	function getsrcCookie(cookiename) {
		var nameEQ = current + "_"+cookiename + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return "20";
	
	}
	submitted.on("change:rowcount", function () {
		$("#custom_error").remove();
		var pattern = /^[1-9]\d*$/i;
		var rowcount = submitted.get('rowcount');
		if(rowcount.match(pattern) && Number(submitted.get('rowcount'))<=100)
		{
			drawTable();
		}
		else {
			$( "#rowcount_id").parent().after('<div class="alert alert-error" id="custom_error"><i class="icon-alert"></i># of Arrays must be a positive number no larger than 100.</div>');
		}
	});
	submitted.on("change:array_tkn", function () {
		drawTable();
	});
	var cookieRowCount=getsrcCookie("config_summary_rowcount");
	defaultTokenModel.set("rowcount", cookieRowCount);
	mvc.Components.get("rowcount_id").settings.set("default", cookieRowCount);
	submittedTokenModel.set(defaultTokenModel.toJSON());
	 
	 $("[id^=array_id] input[type=text]").change(function() {
		var $th = $(this);
		$th.val( $th.val().trim());
     });
 });