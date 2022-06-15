require([
    'jquery',
    'underscore',
    'splunkjs/mvc',
	'splunkjs/mvc/simplexml',
	'splunkjs/mvc/headerview',
	'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/element/table',
	 'splunkjs/mvc/timerangeview',
    'splunkjs/mvc/simplexml/ready!'
], function($, _, mvc,DashboardController,HeaderView,TableView,TableElement,TimeRangeView) {
    
   
	function removeSorts() { 
		var sorts = $('.sorts');
		if (sorts.length>0) {
			sorts.addClass('no-sorts');
			sorts.removeClass('sorts');
			sorts.off("click");
		}
		setTimeout(removeSorts,500);
		
	}

	
	var RiskRenderer = TableView.BaseCellRenderer.extend({
        canRender: function(cell) {
            // Enable this custom cell renderer for both the active_hist_searches and the active_realtime_searches field
            //return _(['Application Risk','Risk']).contains(cell.field);
			if ((cell.field === 'Application Risk') || (cell.field === 'Risk')  || (cell.field === 'Block Count')) {
				return true; 
			}
			
			return false;
        },
        render: function($td, cell) {
			// disable sorts 
			
			
            var value = cell.value.trim();
			if ((cell.field === 'Application Risk') || (cell.field === 'Risk')) {
                if (value == "Critical [5]") {
                    $td.addClass('risk-is-critical');
                }
                else if (value == "High [4]") {
                    $td.addClass('risk-is-high');
                }
                else if (value == "Medium [3]") {
                    $td.addClass('risk-is-medium');
                }
				else if (value == "Low [2]") {
                    $td.addClass('risk-is-low');
                }
				else if (value == "Very Low [1]") {
                    $td.addClass('risk-is-very-low');
                }
				else if (value == "Info") {
                    $td.addClass('risk-is-info');
                } 
				else if (value == "Undefined") {
                    $td.addClass('risk-is-undefined');
                } 
				else if (value == "Unknown") {
                    $td.addClass('risk-is-unknown');
                } 
            }
			if (cell.field === 'Block Count') {
                if (value > 20 ) {
                    $td.addClass('risk-is-critical');
					
                }
                else if (value > 10 && value < 20) {
                    $td.addClass('risk-is-high');
                }
                else if (value == "Medium") {
                    $td.addClass('risk-is-medium');
                }
				else if (value == "Low") {
                    $td.addClass('risk-is-low');
                }
				else if (value == "Very Low") {
                    $td.addClass('risk-is-very-low');
                } 
				else if (value == "Info") {
                    $td.addClass('risk-is-info');
                } 
				else if (value == "Undefined") {
                    $td.addClass('risk-is-undefined');
                } 
				else if (value == "Unknown") {
                    $td.addClass('risk-is-unknown');
                } 
				
            }
			
			
			$td.text(value);
			
        }
    });
	
    var riskRenderer = new RiskRenderer();
	$.each(["general_top_applicaions_by_risk",
	        "top_applicaions_by_risk",
			"top_applicaions_by_traffic",
			"high_risk_applications_by_destination",
			"blockedhost",
			"attacks"
			],function(idx,id) {
	    //console.log("Try id="+id);
		var view = splunkjs.mvc.Components.getInstance(id);
		if (view) {	
			//console.log("Fix id="+id);
			view.getVisualization(function (tableView) {
				tableView.table.addCellRenderer(riskRenderer);
			});
		} else {
			//console.log("No view for id="+id);
		}
	});
	removeSorts();
	
});