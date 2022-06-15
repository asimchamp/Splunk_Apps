define(function(require, exports, module) {
    
    // Load dependencies
    var _ = require('underscore');
    var mvc = require('splunkjs/mvc');
    var $ = require('jquery');
    var $num = 1;
    
    var BaseCellRenderer = require('views/shared/results_table/renderers/BaseCellRenderer');
    
    var BlacklistsCellRenderer = BaseCellRenderer.extend({
         canRender: function(cell) {
             return ($.inArray(cell.field, ["Blacklists"]) >= 0);
         },
         setup: function($td, cell) {
         },
         render: function($td, cell) {
             // Add the class so that the CSS can style the content
             $td.addClass(cell.value);
             //$td.addClass('critical');
             var allCols = [];
             var wrapper = $('#element6', this.$el);
             $td.html( cell.value );
             if(cell.value != "Does not appear on any blacklists.") {
                $td.addClass('skull');
             }

                $(document).ready(function() {
                    if(cell.value == "Does not appear on any blacklists.") {
                        wrapper.removeClass('critical');
                    } else {
                        wrapper.addClass('critical');
                    }
                });
             $num++;
         }
    });
    
    return BlacklistsCellRenderer;
});
