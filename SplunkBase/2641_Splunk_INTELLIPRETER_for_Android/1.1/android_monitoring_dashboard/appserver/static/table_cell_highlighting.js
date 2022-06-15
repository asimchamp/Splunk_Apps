    require([
    'underscore',
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!'
    ], function(_, $, mvc, TableView) {
    // Row Coloring Example with custom, client-side range interpretation
    var CustomRangeRenderer = TableView.BaseCellRenderer.extend({
    canRender: function(cell) {

    return _(['PACKAGE NAME','APP VERSION NAME', 'MODEL', 'ANDROID VERSION', 'RELEASE ID', 'ERROR COUNT']).contains(cell.field);
    },
    render: function($td, cell) {
    // Add a class to the cell based on the returned value
    //var value = parseFloat(cell.value);
    var value = cell.value;


    var re_positive = /^\+?\d.*/i
    var re_negative = /^-\d.*/i



    // CHANGE MANAGEMENT

	if (cell.field == 'PACKAGE NAME') {
    $td.addClass('range-cell').addClass('range-pckg_name');
    }
    if (cell.field == 'changeType' && value == 'PACKAGE NAME') {
    $td.addClass('range-cell').addClass('range-pckg_name');
    }
    if (cell.field == 'value' && value == 'PACKAGE NAME') {
    $td.addClass('range-cell').addClass('range-pckg_name');
    }
	
	if (cell.field == 'APP VERSION NAME') {
    $td.addClass('range-cell').addClass('range-app_ver_name');
    }
    if (cell.field == 'changeType' && value == 'APP VERSION NAME') {
    $td.addClass('range-cell').addClass('range-app_ver_name');
    }
    if (cell.field == 'value' && value == 'APP VERSION NAME') {
    $td.addClass('range-cell').addClass('range-app_ver_name');
    }
	
    if (cell.field == 'MODEL') {
    $td.addClass('range-cell').addClass('range-model');
    }
    if (cell.field == 'changeType' && value == 'MODEL') {
    $td.addClass('range-cell').addClass('range-model');
    }
    if (cell.field == 'value' && value == 'MODEL') {
    $td.addClass('range-cell').addClass('range-model');
    }

    if (cell.field == 'ANDROID VERSION') {
    $td.addClass('range-cell').addClass('range-and_ver');
    }
    if (cell.field == 'changeType' && value == 'ANDROID VERSION') {
    $td.addClass('range-cell').addClass('range-and_ver');
    }
    if (cell.field == 'value' && value == 'ANDROID VERSION') {
    $td.addClass('range-cell').addClass('range-and_ver');
    }

    if (cell.field == 'RELEASE ID') {
    $td.addClass('range-cell').addClass('range-rel_id');
    }
    if (cell.field == 'changeType' && value == 'RELEASE ID') {
    $td.addClass('range-cell').addClass('range-rel_id');
    }
    if (cell.field == 'value' && value == 'RELEASE ID') {
    $td.addClass('range-cell').addClass('range-rel_id');
    }

	if (cell.field == 'ERROR COUNT') {
    $td.addClass('range-cell').addClass('range-error_count');
    }
    if (cell.field == 'changeType' && value == 'ERROR COUNT') {
    $td.addClass('range-cell').addClass('range-error_count');
    }
    if (cell.field == 'value' && value == 'ERROR COUNT') {
    $td.addClass('range-cell').addClass('range-error_count');
    }
	
    // Update the cell content
    $td.text(value);

    //numeric changes for landing page
    var icon;
        if(re_positive.test(value)) {
            icon = 'icon-triangle-up-small';
        } else if(re_negative.test(value)) {
            icon = 'icon-triangle-down-small';
        } else {
            icon = 'icon-minus';
        }
    if (cell.field == 'change') {
    $td.addClass('icon-inline numeric').html(_.template('<i class="<%- icon %>"></i> <%- text %>', {
                icon: icon,
                text: value
            }));
    }


    }
    });


  
    if (mvc.Components.get(['highlight1'])){
    mvc.Components.get(['highlight1']).getVisualization(function(tableView) {
    // Add custom cell renderer
    tableView.table.addCellRenderer(new CustomRangeRenderer());
    // Force the table to re-render
    tableView.table.render();
    });
    }

    });