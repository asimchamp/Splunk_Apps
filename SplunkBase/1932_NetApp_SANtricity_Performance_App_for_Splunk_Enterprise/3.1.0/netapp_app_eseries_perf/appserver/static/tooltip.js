require.config({
    paths: {
		jquery_netapp: '../app/netapp_app_eseries_perf/js/jquery_netapp',
        underscore_utils: '../app/netapp_app_eseries_perf/js/underscore-min'
    }
});


require([
    'jquery_netapp',
    'underscore_utils',
    'splunkjs/mvc',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!',
], function($, _, mvc, TableView) {
	
	var tooltipMap = {
                "encryption": "Full Disk Encryption; self-encrypting drives. A status of “Capable-Secured” indicates the drives support encryption and it is in use.",
                "data assurance": "T10 PI (Protection Information)",
                "unallocated capacity (gib)": "Physical capacity that is available for configuration into volumes. Does not include drives that are not part of a volume group or disk pool.",
                "allocated capacity (gib)": "Actual physical capacity that has been configured into volumes",
                "preservation capacity": "Distributed spare capacity",
                "background priority": "Long-running operations such as expansion or initialization that run in the background at a priority level that can be tuned to favor application I/O or operation completion."
        };

	// Giving tooltip For individual td cell in a Column
	var CustomTooltipRendererEncryption = TableView.BaseCellRenderer.extend({
		canRender: function(cell) {
			return typeof(tooltipMap[cell.field.toLowerCase()]) != "undefined";
        	},
       		render: function($td, cell) {
			var message = cell.value;
			var tip = tooltipMap[cell.field.toLowerCase()];

			$td.html(_.template('<a href="#" data-toggle="tooltip" data-placement="right" title="<%- tip%>"><%- message%></a>', {
				tip: tip,
				message: message
			}));
            
			if(mvc.Components.get('chkShowToolTip').val() == 'true') {
				// This line wires up the Bootstrap tooltip to the cell markup
				$td.children('[data-toggle="tooltip"]').tooltip('enable');
			} else {
				// This line wires up the Bootstrap tooltip to the cell markup
                                $td.children('[data-toggle="tooltip"]').tooltip('disable');
			}
        	}
	});
    
	mvc.Components.get('tblConfArrayVolumeGroupsPools').getVisualization(function(tableView) {
		// Register custom cell renderer and force table re-render
		tableView.table.addCellRenderer(new CustomTooltipRendererEncryption());
		tableView.table.render();
	});

	mvc.Components.get('tblConfArrayDiskPools').getVisualization(function(tableView) {
		// Register custom cell renderer and force table re-render
		tableView.table.addCellRenderer(new CustomTooltipRendererEncryption());
		tableView.table.render();
	});
});

window.disableTooltip = function(state) {
	$("#tbltitleUnassignedDrives").tooltip(state);
};

require([
    'jquery_netapp',
    'underscore_utils',
    'splunkjs/mvc',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!',
    'splunkjs/mvc/checkboxgroupview'],
function($, _, mvc, CheckBoxGroupView,SearchManager){
	mvc.Components.get('chkShowToolTip').on('change', function() {
		if(mvc.Components.get('chkShowToolTip').val() == 'true'){
                        disableTooltip('enable');
		} else {
			disableTooltip('disable');
		}

        	mvc.Components.get('tblConfArrayVolumeGroupsPools').getVisualization(function(tableView) {
                	// force table re-render
	                tableView.table.render();
	        });

        	mvc.Components.get('tblConfArrayDiskPools').getVisualization(function(tableView) {
                	// force table re-render
	                tableView.table.render();
	        });
        });
});
