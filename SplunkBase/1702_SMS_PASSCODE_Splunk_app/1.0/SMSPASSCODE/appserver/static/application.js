if ((Splunk.util.getCurrentView() == "Database") && Splunk.Module.SimpleResultsTable) {
    Splunk.Module.SimpleResultsTable = $.klass(Splunk.Module.SimpleResultsTable, {
        onResultsRendered: function($super) {
            var retVal = $super();
            this.myCustomHeatMapDecorator();
            return retVal;
        },
    myCustomHeatMapDecorator: function() {
            $("tr:has(td)", this.container).each(function() {
                var tr = $(this);
                if (tr.find("td:nth-child(4)").text() == "OK") {
                    tr.addClass("severityLow");
                }
                if (tr.find("td:nth-child(4)").text() == "Blacklisted") {
                    tr.addClass("severityHigh");
                }
            });
        },
    });
}
