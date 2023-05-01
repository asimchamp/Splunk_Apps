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
    var cluster;
    var Cluster;
    
    // Define the custom view class
    var VmdetailsView = SimpleSplunkView.extend({
        className: "clusterdetailview",
       
        // Define our initial values, set the type of results to return
        options: {
            //Boolean - Whether we animate the rotation of the Doughnut
			//v_animateRotate : true,
			height : 100,
			width : 100,
            mychartid: "",   // ID for the chart
            data: "results" ,
	        cluster_name: ""
        },
        

        // Override this method to configure the view
        createView: function() {
            Cluster=this.settings.get('cluster_name') ; 
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
        updateView: function(viz, cluster) {
            if(JSON.stringify(cluster) === dtTotal) {
               return ;
            }
            
            dtTotal = JSON.stringify(cluster);
            var prepareTable = "";
			
            _.each(cluster['rows'], function(row, i){
                for (var j = 0; j < cluster['fields'].length; j++) {
                    var fld_name = cluster['fields'][j];
					
                    var fld_value = row[j];
                    if (fld_value==null){
                        fld_value="";
                    }
                    else
		            {
		                prepareTable = prepareTable + "<span class='detail_view_label'>" + fld_name + "</span> : <span class='detail_view_value'>" + fld_value + "</span><br/><br/>";    
                    }
                };
            });
            this.$el.html(prepareTable);
		}
	});
	return VmdetailsView;
});
