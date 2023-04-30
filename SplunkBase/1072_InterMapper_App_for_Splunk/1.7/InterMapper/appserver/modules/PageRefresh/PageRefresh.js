Splunk.namespace("Module");
Splunk.Module.PageRefresh = $.klass(Splunk.Module, {
    initialize: function($super, container) {
        $super(container);
        var timeout = (this._params['timeoutInSeconds'])*1000;
        this._timer = setInterval(this.refresh.bind(this), timeout);
        // try to refresh every time 'timeout' elapses
    },
    refresh: function() {
    	// reload page if no menus are open
    	if ($('a[class="menuOpen"]').length == 0) {
    		window.location.reload(true);
    	}
    }
});