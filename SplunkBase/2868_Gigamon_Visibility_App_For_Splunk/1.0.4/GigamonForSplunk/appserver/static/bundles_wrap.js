require.config({
    paths: {
	"AppBase" : "../app/GigamonForSplunk",
	"d3" :  "../app/GigamonForSplunk/js/d3.min",
	"bundles" : "../app/GigamonForSplunk/components/bundles/bundles"
    },
    shim: {
	"d3": {exports:"d3"}, 
	"bundles":{ deps:["d3"]} 
    }
});
require([
    "splunkjs/ready!",
    "splunkjs/mvc/simplexml/ready!",
    "jquery",
    "underscore",
    "bundles",
    "d3"
], function(
    mvc,
    ignored,
    $,
    _,
    BundleView,
    d3Ignore
) {
    console.log("starting bundles");
    console.log(d3);
    _.each($(".bundles"), function(el){
	console.log(el);
	console.log("pulling json");
	myRaw = $(el).attr("bundle-options");
	console.log("parsing json");
    	myOptions = JSON.parse(myRaw);
	console.log("jquery element call");
 	myOptions["el"] = $(myOptions["element"]);	
	console.log("starting object instantiation");
	myOptions["width"] = $(window).width() - 150;
	console.log(myOptions);
    	myTmp = new BundleView(myOptions).render();
    });
});
