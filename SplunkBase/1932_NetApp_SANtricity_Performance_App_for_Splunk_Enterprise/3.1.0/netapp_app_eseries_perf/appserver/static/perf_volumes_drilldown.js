require.config({
    paths: {
        jquery_netapp: '../app/netapp_app_eseries_perf/js/jquery_netapp',
        underscore_utils: '../app/netapp_app_eseries_perf/js/underscore-min'
    }
});

require(['jquery_netapp','underscore_utils','splunkjs/mvc','splunkjs/mvc/utils','splunkjs/mvc/simplexml/ready!'], function($,_,mvc){

    var SearchManager = require("splunkjs/mvc/searchmanager");
    var utils = require("splunkjs/mvc/utils");
    var unsubmittedTokens = mvc.Components.get('default');
    var submittedTokens = mvc.Components.get('submitted');
    var readIOpsM = mvc.Components.get('readIOpsM');
    var writeIOpsM = mvc.Components.get('writeIOpsM');
    var read_latency = mvc.Components.get('read_latency');
    var write_latency = mvc.Components.get('write_latency');
    var read_thru = mvc.Components.get('read_thru');
    var write_thru = mvc.Components.get('write_thru');
    
    function onClickHandeler(e) {
        //console.log("Clicked the chart: ", e.name2);
        e.preventDefault();
        var clvg = e.name2;
        //console.log(clvg);
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
                        utils.redirect("/app/netapp_app_eseries_perf/perf_drives?form.arrayId="+ arrayid +"&form.controllerLabel="+ cl +"&form.volumeGroup="+ vg); 
                        })
            //console.log(arrayid);
            //console.log(cl);
            //console.log(vg);
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

    var arrayIdList = getUrl('form.arrayId');
    //console.log(arrayIdList);
    if(arrayIdList!=null)
    {            
        var temp = arrayIdList.split(',');
        //console.log(temp);
        unsubmittedTokens.set('form.arrayId',temp);
        submittedTokens.set(unsubmittedTokens.toJSON());     
    }
	var single_id = mvc.Components.get('single_id');
	 single_id.on('click', function(e){
		 e.preventDefault();
		 //console.log("11");	
		 var arrayId = unsubmittedTokens.get('form.arrayId');
		 var controllerLabel = unsubmittedTokens.get('form.controllerLabel');
		 var volumeGroup = unsubmittedTokens.get('form.volumeGroup');
		 var volumeName = unsubmittedTokens.get('form.volumeName');
		 
		 /*console.log(arrayId);console.log(typeof(arrayId));	
		 console.log(controllerLabel);console.log(typeof(controllerLabel));	
		 console.log(volumeGroup);console.log(typeof(volumeGroup));	
		 console.log(volumeName);console.log(typeof(volumeName));	*/
		 
		var arrayId=unsubmittedTokens.get('form.arrayId');
		//console.log(typeof(arrayId));
		if(typeof(arrayId)=="string"){ 
			arrayId=arrayId.split(",");
		}
		//console.log(typeof(arrayId));console.log(arrayId);
		
		var controllerLabel=unsubmittedTokens.get('form.controllerLabel');
		//console.log(typeof(controllerLabel));
		if(typeof(controllerLabel)=="string"){ 
			controllerLabel=controllerLabel.split(",");
		}
		//console.log(typeof(controllerLabel));console.log(controllerLabel);
		
		var volumeGroup=unsubmittedTokens.get('form.volumeGroup');
		//console.log(typeof(volumeGroup));
		if(typeof(volumeGroup)=="string"){ 
			volumeGroup=volumeGroup.split(",");
		}
		//console.log(typeof(volumeGroup));console.log(volumeGroup);
		
		var volumeName=unsubmittedTokens.get('form.volumeName');
		//console.log(typeof(volumeName));
		if(typeof(volumeName)=="string"){ 
			volumeName=volumeName.split(",");
		}
		//console.log(typeof(volumeName));console.log(volumeName);
		
		
		 
		 
		 var drilldown_flg=false;
		 if(arrayId.length>0 && controllerLabel.length>0 && volumeGroup.length>0&& volumeName.length>0){
			 console.log("11");	
			 var search_volumeName_id = mvc.Components.get("search_volumeName_id");
			 var search_volumeName_results = search_volumeName_id.data("preview");
			 search_volumeName_results.on("data", function() {
				 $.each(search_volumeName_results.data().rows, function( index, value ) {
					 if(!drilldown_flg)
					 {						 
						 if(volumeName[0]=="*"){
							if(value[2]==volumeGroup[0])
							{
								//console.log(value);
								 utils.redirect("config_volumes?form.controllerLabel="+value[1]+"&form.arrayId="+value[0]+"&form.volumeGroup="+value[2]);
								 drilldown_flg=true;
							 }
						 }
						 else
						 {
							 if(value[3]==volumeName[0])
							 {
								 utils.redirect("config_volumes?form.controllerLabel="+value[1]+"&form.arrayId="+value[0]+"&form.volumeGroup="+value[2]+"&form.volume="+value[3]);
								 drilldown_flg=true;
							 }
						 }
					 }
				});
			 });

		 }		 
	});
});

var getUrl = function(field,url) {
    var href = url ? url : window.location.href;
    var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
    var string = reg.exec(href);
    return string ? unescape(string[1]) : null;
};