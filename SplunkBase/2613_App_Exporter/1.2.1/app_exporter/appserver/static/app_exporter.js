// Copyright (C) 2016 Consist Software Solutions GmbH. All Rights Reserved. Version 1.2.0, 2020-01-10.
// This work is licensed under the Creative Commons Attribution 3.0 Unported License. To view
// a copy of this license, visit http://creativecommons.org/licenses/by/3.0/ or send a letter to
// Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.
require([
    'underscore',
    'jquery',
    'splunkjs/mvc',
	'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!'
], function(_, $, mvc, TableView) {
	var tokens_submitted = mvc.Components.getInstance('submitted');
	var tokens_default = mvc.Components.getInstance('default');
	var local_apps = mvc.Components.get(mvc.Components.get('local_apps').settings.get("managerid"));
	
	mvc.Components.get(mvc.Components.get('toggle').settings.get("managerid")).on('search:done', function() {
		tokens_submitted.unset('toggle_app');
		tokens_default.unset('toggle_app');
	    local_apps.startSearch();
	});
	
	$('#export_button').on('click', function() {
        tokens_submitted.set('trigger', new Date());
	});
	
	
	var ExportIconRenderer = TableView.BaseCellRenderer.extend({
	    canRender: function(cell) {
		    return cell.field === 'export';
        },
        
		render: function($td, cell) {
			if(cell.value == '1') {
				$td.html('<i class="icon-export icon-large"></i>');
			}
		}
	});
	
	mvc.Components.get('local_apps').getVisualization(function(tableView) {
		tableView.table.addCellRenderer(new ExportIconRenderer());
		tableView.table.render();
	});
});