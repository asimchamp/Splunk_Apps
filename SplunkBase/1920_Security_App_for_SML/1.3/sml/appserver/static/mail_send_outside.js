require.config({
    paths: {
        "app": "../app"
    }
});

require([
    'jquery',
    'underscore',
    'splunkjs/mvc',
    'views/shared/results_table/renderers/BaseCellRenderer',
    'splunkjs/mvc/simplexml/ready!'
], function($, _, mvc, BaseCellRenderer){
    require(['splunkjs/ready!'], function(){
        // The splunkjs/ready loader script will automatically instantiate all elements
        // declared in the dashboard's HTML.
    });

    var DataBarCellRenderer = BaseCellRenderer.extend({
        canRender: function(cell) {
            return (cell.field === 'percent');
        },
        render: function($td, cell) {
            $td.addClass('data-bar-cell').html(_.template('<div class="data-bar-wrapper"><div class="data-bar" style="width:<%- percent %>%"></div></div>', {
                percent: Math.min(Math.max(parseFloat(cell.value), 0), 100)
            }));
        }
    });
    mvc.Components.get('to_domain_table').getVisualization(function(tableView) {
        tableView.table.addCellRenderer(new DataBarCellRenderer());
        tableView.table.render();
    });
});
