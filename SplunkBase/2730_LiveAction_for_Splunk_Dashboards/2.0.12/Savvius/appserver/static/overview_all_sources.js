require([
    'underscore',
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!'
], function(_, $, mvc, TableView) {
    // Translations from rangemap results to CSS class
    var ICONS = {
        severe: 'alert-circle',
        elevated: 'alert',
        low: 'check-circle'
    };
    var RangeMapIconRenderer = TableView.BaseCellRenderer.extend({
        canRender: function(cell) {
            // Only use the cell renderer for the Alerts field
            return cell.field === 'Alerts';
        },
        render: function($td, cell) {
            var icon = 'question';
            // Fetch the icon for the value
            if (ICONS.hasOwnProperty(cell.value)) {
                icon = ICONS[cell.value];
            }
            // Create the icon element and add it to the table cell
            $td.addClass('icon').html(_.template('<i class="icon-<%-icon%> <%- Alerts %>" title="<%- Alerts %>"></i>', {
                icon: icon,
                Alerts: cell.value
            }));
        }
    });
    mvc.Components.get('table1').getVisualization(function(tableView){
        // Register custom cell renderer, the table will re-render automatically
        tableView.addCellRenderer(new RangeMapIconRenderer());
    });
});

require([
    'splunkjs/mvc',
    'splunk.config',
    'splunkjs/mvc/simplexml/ready!'
], function(mvc, SplunkConfig) {

    var unsubmittedTokens = mvc.Components.getInstance('default');
    var submittedTokens = mvc.Components.getInstance('submitted');

    var version_label = SplunkConfig['VERSION_LABEL'];
    var version_arr = version_label.split(".");

    if((parseInt(version_arr[0]) >= 6) && (parseInt(version_arr[1]) >= 3)) {
        unsubmittedTokens.set('version63', version_label);
        submittedTokens.set('version63', version_label);
    } else {
        unsubmittedTokens.set('version62', version_label);
        submittedTokens.set('version62', version_label);
    }
});
