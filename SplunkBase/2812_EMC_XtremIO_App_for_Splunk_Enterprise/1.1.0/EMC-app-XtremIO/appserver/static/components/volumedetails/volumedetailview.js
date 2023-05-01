require.config({
    paths: {
        underscore_utils: '../app/EMC-app-XtremIO/lib/underscore-min'
    }
});
define(function(require, exports, module) {
    // Load requirements
    var _ = require('underscore_utils');
    var SimpleSplunkView = require('splunkjs/mvc/simplesplunkview');
    var dtTotal;
    
    // Define the custom view class
    var VmdetailsView = SimpleSplunkView.extend({
        className: "volumedetailview",
       
        // Define our initial values, set the type of results to return
        options: {
            //Boolean - Whether we animate the rotation of the Doughnut
			//v_animateRotate : true,
			height : 100,
			width : 100,
            mychartid: "",   // ID for the chart
            data: "results"  // Results type
        },
        // Override this method to configure the view
        createView: function() {
            // Create a unique chart ID based on the tag's unique ID
            mychartid = this.name + "-volumedetailview";
            this.$el.html('<div id="' + mychartid + '" width="' + this.settings.get('width') + '" height="' + this.settings.get('height') + '" class="doughnut-canvas"></div>');
            return this;
        },
		
		formatResults : function(resultsModel) {
			if (!resultsModel) { return []; }
			var data = resultsModel.data();
			return this.formatData(data);
		},
		// Override this method to format the data for the donut chart
        formatData: function(dataSet) {	
			var data = dataSet['rows'];
			return dataSet;
		},
		
		// Override this method to put the Splunk data into the view
        updateView: function(viz, volume) {
            if(JSON.stringify(volume) === dtTotal) {
               return ;
            }
            dtTotal = JSON.stringify(volume);
            var prepareTable = "";
			
            _.each(volume['rows'], function(row, i){
                for (var j = 0; j < volume['fields'].length; j++) {
                    var fld_name = volume['fields'][j];
					
                    var fld_value = row[j];
                    if (fld_value==null ){
                        fld_value="";
                    }            
                    else
					{
                        prepareTable = prepareTable + "<span class='detail_view_label'>" +  fld_name + "</span> : <span class='detail_view_value'>" + fld_value + "</span><br/><br/>";    
                    }
                };
            });
            document.getElementById(mychartid).innerHTML = prepareTable;
        
		}
	});
	
	return VmdetailsView;
});
