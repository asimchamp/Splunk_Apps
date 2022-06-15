Splunk.namespace("Module");
// adding a jQuery selector function to do "exact contains"
$.expr[":"].econtains = function(obj, index, meta, stack){
	return $.trim((obj.textContent || obj.innerText || $(obj).text() || "")) === $.trim(meta[3]);
};
Splunk.Module.DeviceDashboardRedirector = $.klass(Splunk.Module, {
	// unsure if this initialize is necessary, but leaving it in
    initialize: function($super, container) {
        $super(container);
    },
    onContextChange: function() {
    	var name = this.getContext().get("click.name");
    	var val = this.getContext().get("click.value");
		var dbHref = "/app/InterMapper/imdevice" + val;
		myRef = window.open(dbHref);
    	/*if (name == "Device Name") {
    		// get the first menu link to a dashboard with the same device name
    		var dbHref = $('a:econtains("' + val + '")').first().attr('href');
    		// open the href from that link
			var dbHref = "/app/InterMapper/" + val;
    		myRef = window.open(dbHref);
    	}*/
    }
});
