define(function(require, exports, module) 
{
    // Load requirements
    var _ = require('underscore');
    var mvc = require('splunkjs/mvc');
    var SimpleSplunkView = require('splunkjs/mvc/simplesplunkview');
    
    // Define the custom view class
    var clusterdetailsview = SimpleSplunkView.extend({
        className: "clusterdetailsview",
       
        // Define our initial values, set the type of results to return
        options: 
        {
            height : 100,
            width : 100,
            mychartid: "",   // ID for the chart
            data: "results",  // Results type
            viewShow: "keyvalue",
            lnk: ""
        },

        // Override this method to configure the view
        createView: function() 
        {
            // Create a unique chart ID based on the tag's unique ID
            mychartid = this.name + "-clusterdetailsview";
            this.$el.html('<div id="' + mychartid + '" width="' + this.settings.get('width') + '" height="' + this.settings.get('height') + '"></div>');
            return this;
        },

        formatResults : function(resultsModel)
        {
            if (!resultsModel) { return []; }
            var data = resultsModel.data();
            return this.formatData(data);
        },

        // Override this method to format the data for the donut chart
        formatData: function(dataSet) 
        {
            return dataSet;
        },
        
        // Override this method to put the Splunk data into the view
        updateView: function(viz, clusterDetails) 
        {
            function getColor(fld_value)
            {
                var bgColor = "";
                if (fld_value=="operable" || fld_value=="minor")
                    bgColor = "6DDF38";
                else if (fld_value=="degraded" || fld_value=="major")
                    bgColor = "F0E90D";
                else if (fld_value=="critical" || fld_value=="inoperable")
                    bgColor = "EA0002";
                else
                    bgColor = "DDDDDD";

                return bgColor;
            }

            var prepareTable;
            if("keyvalue" === this.settings.get("viewShow"))
            {
                prepareTable = "<div style='font-size:15px;'>";
                _.each(clusterDetails['rows'], function(row, i)
                {
                    for (var j = 0; j < clusterDetails['fields'].length; j++) 
                    {
                        var fld_name = clusterDetails['fields'][j];
                        var fld_value = row[j];
                        if (fld_value==null) { fld_value=""; }
                        prepareTable = prepareTable + "<strong>" + fld_name + "</strong> : " + fld_value + "<br /><br />";

                    };
                });
            } 
             
            prepareTable = prepareTable + "</div>"
            
            if(document.getElementById(mychartid)!=null && document.getElementById(mychartid).innerHTML!= null && prepareTable!="")
            {
		    if(mychartid==this.name + "-clusterdetailsview")
		    {
                    	document.getElementById(mychartid).innerHTML = prepareTable;
		    }
            }
        }
    });
    return clusterdetailsview;
});
