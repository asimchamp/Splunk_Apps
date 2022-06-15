// Copyright (C) 2012 FileTrek Inc.  All Rights Reserved.

//
// This class implements the client side aspects of the FTReportLauncher module, meaning this
// runs in the browser.
//
// Consider execution (aside from initialation) to start with the onContextChange() method.
//
Splunk.Module.FTReportLauncher = $.klass(Splunk.Module, {

initialize: function($super,container) {
	$super(container);
	this.arg = {};
	for (var p in this._params) {
		if (p.indexOf("arg") == 0) {
                	this.args[p.substring(4)] = this._params[p];
           	} //if
	} //for 
},

onJobDone: function(event) {
},

getResultParams: function($super) {
	// This code somehow initializes the context. It needs to be here.
        var params = $super();
        var context = this.getContext();
        var search = context.get("search");
        var sid = search.job.getSearchId();
        params.sid = sid;
        return params;
},

renderResults: function($super, htmlFragment) {
	// This is where we handle the result of the getResults() call.
	// the htmlFragment argument will contain the value of the
	// filetrek server url stored in ftsetup.conf on the splunk server.
        var base = htmlFragment;
	if (base.indexOf("/", base.length - 1) === -1) base += "/";
        var type = this.getParam("type");
        var uuid = this.getContext().get('click2.value');
	if (uuid === null) uuid = this.getContext().get('click.value');
        //var url = base + "map/" +type+"1.html?"+uuid;
        var url = base + "reports/" + type + "/" + "file1.html?" + uuid;
        window.open(url, "_blank");
},

onContextChange: function() {
	// The page load completes call "getResults()" which is an inherited function.
	// It will cause the splunk server to invoke the FTReportLauncher.py code.
	// The server side code will deliver the base FileTrek server URL as a response.
	// That response is handled in renderResults.
        if (!this.isPageLoadComplete()) {
            this.logger.info(this.moduleType + ".onContextChange() called but page is still loading. Aborting redirect.");
            return false;
        }
        this.getResults();
}

});
