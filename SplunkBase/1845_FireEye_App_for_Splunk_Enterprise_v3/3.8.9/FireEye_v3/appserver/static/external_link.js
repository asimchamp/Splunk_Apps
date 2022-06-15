
//** The following controls the external hyperlink that provides access to VT
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

