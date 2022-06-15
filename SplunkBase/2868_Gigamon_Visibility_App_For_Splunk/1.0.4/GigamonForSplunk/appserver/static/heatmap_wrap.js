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
    "GigamonForSplunk/components/heatmap/heatmap"
], function(
    mvc,
    ignored,
    $,
    _,
    HeatMapView
) {
    console.log("starting heatmaps");
    _.each($(".heatmap"), function(el){
	console.log(el);
	console.log("pulling json");
	myRaw = $(el).attr("heatmap-options");
	console.log("parsing json");
	console.log(myRaw);
    	myOptions = JSON.parse(myRaw);
	console.log("jquery element call");
 	myOptions["el"] = $(myOptions["element"]);	
	console.log("starting object instantiation");
	myOptions["width"] = $(window).width() - 150;
	console.log(myOptions);
    	new HeatMapView(myOptions).render();
    });
});
