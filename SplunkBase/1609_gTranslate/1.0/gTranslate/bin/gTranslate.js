var system = require('system');

var lang_in  = system.args[1];
var lang_out = system.args[2];
var text = encodeURI(system.args[3]);

var url = "http://translate.google.com/#"+ lang_in +"/"+ lang_out +"/"+ text;
//console.log(url);

var page = require('webpage').create();
page.settings.userAgent = 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:13.0) Gecko/20100101 Firefox/13.0';
page.onAlert = function (msg) {
     console.log(msg);
};

var called = 0;
page.open(url, function (status) {
	if (status !== 'success') {
		console.log('Unable to access network');
    	} else {

		if (called) 
			return;

		called = true; 
		page.injectJs("jquery-2.0.3.min.js");

		checkChange();
       	
		function checkChange()
		{
			window.setTimeout(function () 
			{
				if(page.evaluate(function () {

					if($('#result_box').text().trim() != ""){
						alert($('#result_box').text());
						return false;
					}
					return true;
				}))
					checkChange();
				else
					phantom.exit();
			}, 10);
		}
		window.setTimeout(function () {
			//page.render("screen.png");
			phantom.exit();
		}, 900);
		//console.log(ua);     
	}
});

