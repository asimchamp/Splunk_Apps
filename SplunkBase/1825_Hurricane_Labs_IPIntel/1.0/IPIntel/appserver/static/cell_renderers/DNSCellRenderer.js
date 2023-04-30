define(function(require, exports, module) {
    
    // Load dependencies
    var _ = require('underscore');
    var mvc = require('splunkjs/mvc');
    var $ = require('jquery');
    var $num = 1;
    
    var BaseCellRenderer = require('views/shared/results_table/renderers/BaseCellRenderer');
    
    var DNSCellRenderer = BaseCellRenderer.extend({
         canRender: function(cell) {
             return ($.inArray(cell.field, ["Known DNS Names"]) >= 0);
         },
         setup: function($td, cell) {
         },
         render: function($td, cell) {
             // Add the class so that the CSS can style the content
             $td.addClass(cell.value);
             //$td.addClass('critical');
             var allCols = [];
             var wrapper = $('#element3', this.$el);
             $td.html( cell.value );

                $(document).ready(function() {
                    if($num > 8) {
                        wrapper.addClass('critical');
                    } 
                    if(cell.value == "No hostnames found.") {
                        wrapper.removeClass('critical');
                    }
                });
             $num++;
         }
    });
    
    return DNSCellRenderer;
});
