require(["splunkjs/mvc/utils"], function (SplunkUtil) {
    var app_name = SplunkUtil.getCurrentApp();  
    require.config({
        paths: {
            'jquery_isilon': '../app/' + app_name + '/js/jquery_isilon',
            'underscore_utils': '../app/' + app_name + '/js/underscore-min'
        }
});

require([
    'jquery_isilon',
    'underscore_utils',
    'splunkjs/mvc',
    'splunkjs/mvc/tableview',
    'views/shared/results_table/renderers/BaseCellRenderer',
    'splunkjs/mvc/simplexml/ready!'
], 
    function($, _, mvc, TableView, BaseCellRenderer) {
        var hdd_used = "";
        var ssd_used = "";
        var DataBarCellRenderer = BaseCellRenderer.extend({
            canRender: function(cell) {
                if (cell.field == "HDD Used") {
                    hdd_used = cell.value;
                }
                if (cell.field == "SSD Used") {
                    ssd_used = cell.value;
                }
                 return _(['HDD Used %','SSD Used %']).contains(cell.field);
        },
        render: function($td, cell) {   
                var percent = cell.value;   
                var tooltip_val = "";
                 if (cell.field == "HDD Used %") {
                    tooltip_val = hdd_used+" Used";
                }
                if (cell.field == "SSD Used %") {
                    tooltip_val = ssd_used+" Used";
                }
                $td.addClass('data-bar-cell').html(_.template(
                '<div style="width:100%;">'
                +'<div class="data-bar-wrapper"  style="border:1px solid #5479AF; background-color:#BEE0CC; width:65%;float:left;">'
                +'<div class="data-bar" style="width:<%- percent %>%"></div>'
                +'</div><div>&nbsp;<%- percent %>%</div>'
                +'</div>' ,
                {
                    percent: Math.min(Math.max(parseFloat(cell.value), 0), 100)
                }
                )).attr("title",tooltip_val);
                // $(".data-bar-cell").tooltip('enable');
                $(".data-bar-cell").tooltip = 'enable';
        }
    });

    mvc.Components.get('node_details').getVisualization(function(tableView) {
        tableView.table.addCellRenderer(new DataBarCellRenderer());
        tableView.table.render();
    });
    
});
});
