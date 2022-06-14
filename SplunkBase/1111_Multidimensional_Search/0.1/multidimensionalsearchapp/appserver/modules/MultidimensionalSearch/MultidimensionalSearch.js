Splunk.Module.MultidimensionalSearch = $.klass(Splunk.Module.DispatchingModule, {
    initialize: function($super, container) {
        $super(container);
    },

    /**
     * need access to events in real-time searches
     */
    onBeforeJobDispatched: function(search) {
        search.setMinimumStatusBuckets(1);
        search.setRequiredFields(["*"]);
    },

    onJobProgress: function(evt) {
        var context = this.getContext();
        var search = context.get("search");
        setSearchURL(search.getUrl("events"));
    },
});
