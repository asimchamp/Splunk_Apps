//** The following JavaScript controls the detailed pane in the Analysis section of the application.  It will hide the details table when not in use.

require(['jquery','underscore','splunkjs/mvc','util/console','splunkjs/mvc/simplexml/ready!'], function($, _, mvc, console){
    // Get a reference to the dashboard panels
    var masterView = mvc.Components.get('master');
    var detailView = mvc.Components.get('detail');

    var unsubmittedTokens = mvc.Components.get('default');
    var submittedTokens = mvc.Components.get('submitted');
    var urlTokens = mvc.Components.get('url');

    if(!submittedTokens.has('ID')) {
        // if there's no value for the $sourcetype$ token yet, hide the dashboard panel of the detail view
        detailView.$el.parents('.dashboard-panel').hide();
    }

    submittedTokens.on('change:ID', function(){
        // When the token changes...
        if(!submittedTokens.get('ID')) {
            // ... hide the panel if the token is not defined
            detailView.$el.parents('.dashboard-panel').hide();
        } else {
            // ... show the panel if the token has a value
            detailView.$el.parents('.dashboard-panel').show();
        }
    });

    masterView.on('click', function(e) {
        e.preventDefault();
        var newValue = e.data['row.ID'];

        // Submit the value for the sourcetype field
        unsubmittedTokens.set('form.ID', newValue);
        submittedTokens.set(unsubmittedTokens.toJSON());
        urlTokens.saveOnlyWithPrefix('form\\.', unsubmittedTokens.toJSON(), {
            replaceState: false
        });

    });
});


//** The following controls the external hyperlink that provides access to the event in the FireEye device

require([
    'underscore',
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!'
], function(_, $, mvc, TableView) {
    var CustomLinkRenderer = TableView.BaseCellRenderer.extend({
        canRender: function(cell) {
            return cell.field === 'Event Link';
        },
        render: function($td, cell) {
            var link = cell.value;
            if(link){
            link = link.replace('\\=', '='); 
            }

            var a = $('<a>').attr("href", link).text(link);
            $td.addClass('table-link').empty().append(a);

            a.click(function(e) {
              e.preventDefault();
              //window.location = $(e.currentTarget).attr('href');
              // or for popup:
              window.open($(e.currentTarget).attr('href'));
            });
        }
    });

        // Get the table view by id
        mvc.Components.get('detail').getVisualization(function(tableView){
        // Register custom cell renderer
        tableView.table.addCellRenderer(new CustomLinkRenderer());
        // Force the table to re-render
        tableView.table.render();
    });
});


//** The following controls the VirusTotal Lookup

require(['splunkjs/mvc','splunkjs/mvc/utils','splunkjs/mvc/simplexml/ready!'], function(mvc, utils){
    var unsubmittedTokens = mvc.Components.getInstance('default');
    var submittedTokens = mvc.Components.getInstance('submitted');
    // Set the token $app$ to the name of the current app
    unsubmittedTokens.set('app', utils.getCurrentApp());
    // Set the token $view$ to the name of the current view
    unsubmittedTokens.set('view', utils.getPageInfo().page);
    
    // Submit the new tokens
    submittedTokens.set(unsubmittedTokens.toJSON());
}); 

