require.config({
    paths: {
        jquery_netapp: '../app/netapp_app_eseries_perf/js/jquery_netapp',
        underscore_utils: '../app/netapp_app_eseries_perf/js/underscore-min'
    }
});


require(['jquery_netapp','underscore_utils','splunkjs/mvc','splunkjs/mvc/searchmanager','splunkjs/mvc/simplexml/ready!'], function($,_,mvc){

    var unsubmittedTokens = mvc.Components.get('default');
    var submittedTokens = mvc.Components.get('submitted');
	var utils = require("splunkjs/mvc/utils");
	
    var arrayIdList = getUrl('form.arrayId');
    //console.log(arrayIdList);
    if(arrayIdList!=null)
    {
        var temp = arrayIdList.split(',');
        //console.log(temp);
        unsubmittedTokens.set('form.arrayId',temp);
        submittedTokens.set(unsubmittedTokens.toJSON());
    };
	var single_id = mvc.Components.get('single_id');
	 single_id.on('click', function(e){
		 e.preventDefault();
		 //console.log(unsubmittedTokens.get('form.arrayId'));	
		var arrayId=unsubmittedTokens.get('form.arrayId');
		//console.log(typeof(arrayId));
		if(typeof(arrayId)=="string"){ 
			arrayId=arrayId.split(",");
		}
		//console.log(typeof(arrayId));console.log(arrayId);
		
		 if(arrayId.length>0)
		 {
			utils.redirect("config_array?form.arrayId="+arrayId[0]);
		 }
	});
});

var getUrl = function(field,url) {
    var href = url ? url : window.location.href;
    var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
    var string = reg.exec(href);
    return string ? unescape(string[1]) : null;
};
