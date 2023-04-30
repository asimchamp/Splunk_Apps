// Copyright (C) 2012 FileTrek Inc.  All Rights Reserved.

//
// This class implements the client side aspects of the FTResultTable module, meaning this
// runs in the browser.
//
//
Splunk.Module.FTResultTable = $.klass(Splunk.Module.DispatchingModule, {

initialize: function($super,container) {
	$super(container);
	this.resultsContainer = this.container;
},

onJobDone: function(event) {
	this.getResults();
},

getResultParams: function($super) {
        var params = $super();
        var context = this.getContext();
        var search = context.get("search");
        var sid = search.job.getSearchId();

	if (!sid) this.logger.error(this.moduleType, "Assertion Failed");

        params.sid = sid;
        return params;
},

renderResults: function($super, htmlFragment) {
	if (!htmlFragment) {
		this.resultsContainer.html('No content Available.');
		return;
	}

        var context = this.getContext();
        var rootModule = this.getRootAncestor();
        var headerHtml = "";
        
        if (typeof(rootModule.savedSearch)!=="undefined") {
        	var savedSearchName = rootModule.savedSearch.getSavedSearchName();
        	var clickValue = context.get("click.value");
            var clickName = context.get("click.name");
            headerHtml = "<div class=\"splHeader-dashboard\"><h2>"+savedSearchName+"</h2></div>";
        }
        else {
        	headerHtml = "<div class=\"splHeader-dashboard\"><h2>Results:</h2></div>";
        }
        
        var panel = $("#NullModule_0_0_0").parent();
        var result = $("#FTResultTableWrapper");
        if (result !== null && typeof(result) !== "undefined") {
                result.remove();
        }
        panel.append(htmlFragment);
        result = $("#FTResultTableWrapper");
        result.prepend(headerHtml);
}

});
