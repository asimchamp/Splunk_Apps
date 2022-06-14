require.config({
    paths: {
		jquery_netapp: '../app/netapp_app_eseries_perf/js/jquery_netapp',
        underscore_utils: '../app/netapp_app_eseries_perf/js/underscore-min'
    }
});


require(['jquery_netapp','underscore_utils','splunkjs/mvc','splunkjs/mvc/searchmanager','splunkjs/mvc/simplexml/ready!'], function($,_,mvc){
    var submittedTokens = mvc.Components.get('submitted');
	var unsubmittedTokens = mvc.Components.get('default');
	var utils = require("splunkjs/mvc/utils");	
	var single_id = mvc.Components.get('single_id');
	single_id.on('click', function(e){
		 e.preventDefault();
		 //console.log("22");
		 var volumeGroup=unsubmittedTokens.get('form.volumeGroup');
		 //console.log(typeof(volumeGroup));
		 if(typeof(volumeGroup)=="string")
		 {
			volumeGroup=volumeGroup.split(",");
		 }
		 //console.log(typeof(volumeGroup));
		 //console.log(volumeGroup);
		 if(volumeGroup.length>0) {
			 			 
			 var search_volumeGroup_id = mvc.Components.get("search_volumeGroup_id");
			 var search_volumeGroup_results = search_volumeGroup_id.data("preview");
			 search_volumeGroup_results.on("data", function() {
				 $.each(search_volumeGroup_results.data().rows, function( index, value ) {
					if(value[1]==volumeGroup[0]) {
						//console.log(value);
						utils.redirect("config_volumes?form.arrayId="+value[0]+"&form.volumeGroup="+value[1]);
					}
				});
			 });
		 }
	});
});