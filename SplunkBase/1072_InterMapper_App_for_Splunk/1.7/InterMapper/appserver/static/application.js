if (Splunk.Module.SingleValue) {
    Splunk.Module.SingleValue = $.klass(Splunk.Module.SingleValue, {
        renderResults: function($super, result) {
            var retVal = $super(result);
            if (result=="N/A") {
                $(this._result_element).text("No Data Available");
            }
            return retVal;
        }
    });
}

switch (Splunk.util.getCurrentView()) {
	case "devices":
		if (Splunk.Module.SimpleResultsTable) {
		    Splunk.Module.SimpleResultsTable = $.klass(Splunk.Module.SimpleResultsTable, {
		        onResultsRendered: function($super) {
		            var retVal = $super();
		            this.myCustomHeatMapDecorator();
					this.idCollapser();
		            return retVal;
		        },
		        myCustomHeatMapDecorator: function() {
		            $("tr:has(td)", this.container).each(function() {
		                var tr = $(this);
		                if (tr.find("td:nth-child(10)").text() == "1 - Down") {
		                    tr.addClass("downClass");
		                }
		                if (tr.find("td:nth-child(10)").text() == "4 - Warning") {
		                    tr.addClass("warnClass");
		                }
		                if (tr.find("td:nth-child(10)").text() == "3 - Alarm") {
		                    tr.addClass("alarmClass");
		                }
		                if (tr.find("td:nth-child(10)").text() == "2 - Critical") {
		                    tr.addClass("criticalClass");
		                }
		            });
		        },
				idCollapser: function() {
					// we need the Device ID column to exist to correctly link the user to device dashboards, but we don't want to see it
		            $("tr:has(td)", this.container).each(function() {
		                var tr = $(this);
		                tr.find("td:nth-child(2)").addClass("idClass");
						
		            });
					$("tr:has(th)", this.container).each(function() {
		                var tr = $(this);
		                tr.find("th:nth-child(2)").addClass("idClass");
		            });
		        }
		    });
		}
	break;
}


