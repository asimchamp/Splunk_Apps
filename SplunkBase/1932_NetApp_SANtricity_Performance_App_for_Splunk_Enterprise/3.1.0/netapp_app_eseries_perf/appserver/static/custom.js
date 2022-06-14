require.config({
    paths: {
        jquery_netapp: '../app/netapp_app_eseries_perf/js/jquery_netapp',
		jquery_ui: '../app/netapp_app_eseries_perf/js/jquery-ui'
    }
});

require([
     'jquery_netapp',
	 'jquery_ui',
     'splunkjs/mvc/simplexml/ready!'
 ], function($, ui) {
	$(".tbl-title-UnassignedDrives").tooltip();

	var tooltipMap = {
		"encryption": "Full Disk Encryption; self-encrypting drives. A status of “Capable-Secured” indicates the drives support encryption and it is in use.",
		"data assurance": "T10 PI (Protection Information)",
		"unallocated capacity (gib)": "Physical capacity that is available for configuration into volumes. Does not include drives that are not part of a volume group or disk pool.",
		"allocated capacity (gib)": "Actual physical capacity that has been configured into volumes",
		"preservation capacity": "Distributed spare capacity",
		"background priority": "Long-running operations such as expansion or initialization that run in the background at a priority level that can be tuned to favor application I/O or operation completion."	
	};
	
	$("#dashboard").on("mouseover","th", function() {
		var headerKey = $(this).children("a").html();
		headerKey = $.trim(headerKey.substring(0, headerKey.indexOf("<i "))).toLowerCase();

		if( typeof(tooltipMap[headerKey]) != "undefined") {

			//Condition for Tooltip check is selected and ToolTip on the <th> tag is not applied
			if($("#chkShowToolTip i").css('display') != 'none' && true != $(this).children("a").data("tipapplied")) {
				$(this).children("a").data("tipapplied",true);
				$(this).children("a").prop("title",tooltipMap[headerKey]);
				$(this).children("a").attr("data-placement","bottom");
				$(this).children("a").tooltip({container:'body'});
			}

			//Condition for ToolTip checkbox is unselected and ToolTip on the <th> tag is applied
			if($("#chkShowToolTip i").css('display') == 'none' && true == $(this).children("a").data("tipapplied")) {
				//clearing title property as well so to avoid showing tooltip Text as normal html ToolTip
				$(this).children("a").prop("title","");

				//Disabling bootstrap tooltip
				$(this).children("a").tooltip('disable');
				$(this).children("a").data("tipapplied",false);
			}
		}
	});
});
