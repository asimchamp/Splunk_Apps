/**
 * This cell renderer allows cells with MV values to be opened and closed.
 */
define(function(require, exports, module) {
	
    // Load dependencies
    var _ = require('underscore');
    var mvc = require('splunkjs/mvc');
    var $ = require('jquery');
    
    var BaseCellRenderer = require('views/shared/results_table/renderers/BaseCellRenderer');
    
    var MVFieldExpansionCellRenderer = BaseCellRenderer.extend({
		 
	     defaults: {
	            useChevrons: false
	     },
		 
	     initialize: function() {
	            
	             args = _.extend({}, this.defaults);
	    
	             for( var c = 0; c < arguments.length; c++){
	                args = _.extend(args, arguments[c]);
	             }
	    
	             // Get the arguments
	             this.useChevrons = args.useChevrons;
	     },
	     
    	 canRender: function(cell) {
    		 return true;
		 },
		 
		 render: function($td, cell) {
			 
			 var closedIconClass = "icon-plus-circle";
			 var openIconClass = "icon-minus-circle";
			 
			 if( this.useChevrons ){
				 closedIconClass = "icon-chevron-right";
				 openIconClass = "icon-chevron-down";
			 }
			 
			 // Render the MV values in the cell
			 $td.html(_.template(' \
					 <% if(mvCount > 1) { %> \
					 	<a name="<%- id %>" href=""><i style="width: 12px;" class="<%- closedIconClass %>" /> \
					 	<%- value[0] %> \
					 	<span class="truncate-description">(and <%- mvCount-1 %> more)</span> \
					 	<% for(var c = 1; c < value.length; c++) { %> \
					 		<div style="margin-left: 15px;" class="hide mv-value mv-value-additional"><%- value[c] %></div> \
					 	<% } %> \
					 	</a> \
					 <% } else { %> \
					 	<%- value %> \
					 <% } %> \
					 ', {
				 value: cell.value,
				 field: cell.field,
				 id: "mv-cell-" + Math.round(Math.random() * 100000000).toString(),
				 mvCount: Array.isArray(cell.value) ? cell.value.length : 1,
				 closedIconClass: closedIconClass,
				 openIconClass: openIconClass
				 //value_quote_escaped : cell.value.replace('"', '\\"')
			 }));
			 
			 // Stop propagation of the click handler so that the items can be opened
			 $('a', $td).click( function(event){
				 
				 event.preventDefault();
				 event.stopPropagation();
				 
				 if( $('.' + closedIconClass, $td).length > 0 ){
					 $('.mv-value-additional', $td).show();
					 $('.truncate-description', $td).hide();
					 $('.' + closedIconClass, $td).addClass(openIconClass).removeClass(closedIconClass);
				 }
				 else{
					 $('.mv-value-additional', $td).hide();
					 $('.truncate-description', $td).show();
					 $('.' + openIconClass, $td).removeClass(openIconClass).addClass(closedIconClass);
				 }
				 
			 } );
		 }
	});
    
    return MVFieldExpansionCellRenderer;
});

