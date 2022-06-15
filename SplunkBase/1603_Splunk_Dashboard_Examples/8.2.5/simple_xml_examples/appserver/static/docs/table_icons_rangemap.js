requirejs([
    '../app/simple_xml_examples/libs/underscore-1.6.0-umd-min',
    '../app/simple_xml_examples/theme_utils',
    'splunkjs/mvc',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!'
], function(_, themeUtils, mvc, TableView) {
    // Translations from rangemap results to CSS class
    var ICONS = {
        severe: 'alert-circle',
        elevated: 'alert',
        low: 'check-circle'
    };
    var RangeMapIconRenderer = TableView.BaseCellRenderer.extend({
        canRender: function(cell) {
            // Only use the cell renderer for the range field
            return cell.field === 'range';
        },
        render: function($td, cell) {
            var icon = 'question';
            var isDarkTheme = themeUtils.getCurrentTheme() === 'dark';

            // Fetch the icon for the value
            // eslint-disable-next-line no-prototype-builtins
            if (ICONS.hasOwnProperty(cell.value)) {
                icon = ICONS[cell.value];
            }
            // Create the icon element and add it to the table cell
            $td.addClass('icon').html(_.template('<i class="icon-<%-icon%> <%- range %> <%- isDarkTheme %>" title="<%- range %>"></i>', {
                icon: icon,
                range: cell.value,
                isDarkTheme: isDarkTheme ? 'dark' : ''
            }));
        }
    });
    mvc.Components.get('table1').getVisualization(function(tableView) {
        // Register custom cell renderer, the table will re-render automatically
        tableView.addCellRenderer(new RangeMapIconRenderer());
    });
});