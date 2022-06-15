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
    "GigamonForSplunk/components/cubism/cubism"
], function(
    mvc,
    ignored,
    $,
    _,
    CubismView
) {
    console.log("starting cubism");
    $(".cubism").each(function(index){
	el = $(this);
	data = el.data();
 	data["el"] = el;	
	data["width"] = $(window).width() - 150;
    	myTmpCubism = new CubismView(data).render();
    });
});
