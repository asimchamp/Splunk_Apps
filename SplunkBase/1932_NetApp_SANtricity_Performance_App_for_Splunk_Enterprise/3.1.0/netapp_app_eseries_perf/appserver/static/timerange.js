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
 'splunkjs/mvc/simplexml/ready!'], function($, _, mvc){
	 // Timerange Test
	 var mypresetsettings = {
		 showCustomDateTime: false,
		 showPresets: true,
		 showCustomRealTime: false,
		 showCustomAdvanced: false,
		 showCustomRelative: true,
		 showCustomDate: false
	 };	 
	 // Show only the date and time submenu of the timerangepicker
	 var timeRangePicker = mvc.Components.getInstance("timerange");
	//  timeRangePicker.options.dialogOptions = mypresetsettings;
	//  mvc.Components.getInstance("timerange").render();
 });
