require.config({
    paths: {
        jquery_netapp: '../app/netapp_app_eseries_perf/js/jquery_netapp',
        underscore_utils: '../app/netapp_app_eseries_perf/js/underscore-min'
    }
});


require(['jquery_netapp','underscore_utils','splunkjs/mvc','splunkjs/mvc/searchmanager','splunkjs/mvc/utils','splunkjs/mvc/simplexml/ready!'], function($,_,mvc){

    var SearchManager = require("splunkjs/mvc/searchmanager");
    var utils = require("splunkjs/mvc/utils");
    var readIOpsM = mvc.Components.get('readIOpsM');
    var writeIOpsM = mvc.Components.get('writeIOpsM');
    var read_latency = mvc.Components.get('read_latency');
    var write_latency = mvc.Components.get('write_latency');
    var read_thru = mvc.Components.get('read_thru');
    var write_thru = mvc.Components.get('write_thru');
    var perf_array_drilldown= mvc.Components.get('perf_array_drilldown');
    var unsubmittedTokens = mvc.Components.get('default');
    var submittedTokens = mvc.Components.get('submitted');

    var arrayId = getUrl('form.arrayId');
    var controllerLabel = getUrl('form.controllerLabel');

    if(arrayId==null && controllerLabel!=null)
    {
        controllerLabel = controllerLabel.split('/ ').pop();
            var searchString = '| inputlookup nesa_controllers | dedup controllerLabel,arrayId | search controllerLabel="'+ controllerLabel +'" | table arrayId controllerLabel';
                    var mySearchManager =  new SearchManager(
                    {
                        id: "cacheSearch",
                        autostart: true,
                        search: searchString,
                        preview: true,
                        cache: false
                    });    
                    var myResults = mySearchManager.data("results"); // get the data from that search
                   myResults.on("data", function() 
                    {
                            resultArray = myResults.data().rows;
                            // Create Dynamic table from result set
                            $.each(resultArray, function( index, value ) 
                            {
                                arrayId = value[0];
                            });
                         unsubmittedTokens.set('form.arrayId',arrayId);
                         unsubmittedTokens.set('form.controllerLabel',controllerLabel);
                         submittedTokens.set(unsubmittedTokens.toJSON());     
                        })
    }
    else if (arrayId!=null && controllerLabel!=null) {
        var arrayList = arrayId.split(",");
        var controllerList = controllerLabel.split(",");
        unsubmittedTokens.set('form.arrayId',arrayList);
        unsubmittedTokens.set('form.controllerLabel',controllerList);
        submittedTokens.set(unsubmittedTokens.toJSON());     
    }
    function onClickHandeler(e) {
        e.preventDefault();
        var clvg = e.name2;
        var temp = clvg.split(' / ');
        var arrayid = "";
        var cl = temp[1];
        var vg = temp[2];
        
        var drilldownString = '| inputlookup nesa_controllers | dedup controllerLabel,arrayId | search controllerLabel="'+ cl +'" | table arrayId controllerLabel';
        var drilldownSearchManager =  new SearchManager(
        {
            id: "drilldownSearch",
            autostart: true,
            search: drilldownString,
            preview: true,
            cache: false
        });    
        var drilldownResults = drilldownSearchManager.data("results"); // get the data from that search
       drilldownResults.on("data", function() 
        {
                resultArray = drilldownResults.data().rows;
                // Create Dynamic table from result set
                $.each(resultArray, function( index, value ) 
                {
                    arrayid = value[0];
                });
                utils.redirect("/app/netapp_app_eseries_perf/perf_volumes?form.arrayId="+ arrayid +"&form.controllerLabel="+ cl +"&form.volumeGroup="+ vg); 
            })
    }
    readIOpsM.on('click:chart', function(e) {
        onClickHandeler(e);
    });
    readIOpsM.on('click:legend', function(e) {
        onClickHandeler(e);
    });
    writeIOpsM.on('click:chart', function(e) {
        onClickHandeler(e);
    });
    writeIOpsM.on('click:legend', function(e) {
        onClickHandeler(e);
    });
    read_latency.on('click:chart', function(e) {
        onClickHandeler(e);
    });
    read_latency.on('click:legend', function(e) {
        onClickHandeler(e);
    });
    write_latency.on('click:chart', function(e) {
        onClickHandeler(e);
    });
    write_latency.on('click:legend', function(e) {
        onClickHandeler(e);
    });
    read_thru.on('click:chart', function(e) {
        onClickHandeler(e);
    });
    read_thru.on('click:legend', function(e) {
        onClickHandeler(e);
    });
    write_thru.on('click:chart', function(e) {
        onClickHandeler(e);
    });
    write_thru.on('click:legend', function(e) {
        onClickHandeler(e);
    });
	
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