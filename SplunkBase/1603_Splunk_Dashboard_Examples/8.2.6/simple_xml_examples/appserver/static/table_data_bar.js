requirejs([
    '../app/simple_xml_examples/libs/underscore-1.6.0-umd-min',
    'splunkjs/mvc',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!'
], function(_, mvc, TableView) {
    var DataBarCellRenderer = TableView.BaseCellRenderer.extend({
        canRender: function(cell) {
            return (cell.field === 'percent');
        },
        render: function($td, cell) {
            $td.addClass('data-bar-cell').html(_.template('<div class="data-bar-wrapper"><div class="data-bar" style="width:<%- percent %>%"></div></div>', {
                percent: Math.min(Math.max(parseFloat(cell.value), 0), 100)
            }));
        }
    });
    mvc.Components.get('table1').getVisualization(function(tableView) {
        tableView.addCellRenderer(new DataBarCellRenderer());
    });
});
