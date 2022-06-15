require.config({
    paths: {
        "GigamonForSplunk": "../app/GigamonForSplunk"
    }
});
require([
    "splunkjs/ready!",
    "splunkjs/mvc/simplexml/ready!",
    "jquery",
    "underscore",
    "GigamonForSplunk/components/gigamaps/gigamaps"
], function(
    mvc,
    ignored,
    $,
    _,
    GigaMapView
) {
    console.log("starting gigamaps");
    _.each($(".gigamaps"), function(el){
	console.log(el);
	myRaw = $(el).attr("gigamaps-options");
    	myOptions = JSON.parse(myRaw);
 	myOptions["el"] = $(myOptions["element"]);	
	myOptions["width"] = $(window).width() - 150;
	console.log(myOptions);
    	myTmpGigaMap = new GigaMapView(myOptions).render();
    });
});
