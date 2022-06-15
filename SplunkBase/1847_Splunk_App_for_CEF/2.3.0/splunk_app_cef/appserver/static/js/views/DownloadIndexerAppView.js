define([
    "underscore",
    "backbone",
    "splunkjs/mvc",
    "jquery",
    "splunkjs/mvc/simplesplunkview",
    "css!../app/splunk_app_cef/css/DownloadIndexerAppView.css",
    "console"
], function( _, Backbone, mvc, $, SimpleSplunkView ){
	
    // Define the custom view class
    var DownloadIndexerAppView = SimpleSplunkView.extend({
        className: "DownloadIndexerAppView",

        /**
         * Setup the defaults
         */
        defaults: {

        },
        
        initialize: function() {
            
            // Apply the defaults
            this.options = _.extend({}, this.defaults, this.options);
            
            options = this.options || {};
            
            //this.field = options.field;
        },
        
        events: {
        	"click .cef-ta-download-link" : "downloadTA"
        },
        
        /**
         * Download the TA.
         */
        downloadTA: function(){
        	document.location = Splunk.util.make_url("../en-US/custom/splunk_app_cef/cef_utils/downloadapp");
        },
        
        /**
         * Create a 
         */
        createTA: function(){
        	
        	// Get a promise ready
        	var promise = jQuery.Deferred();
        	
        	// Make the URL make the indexer TA
        	var uri = Splunk.util.make_url("../en-US/custom/splunk_app_cef/cef_utils/maketaforindexers");

        	// Let's do this
        	$.ajax({
            	url:     uri,
                type:    'POST',
                success: function(result) {
                	promise.resolve(result.filename);
                }.bind(this),
                error: function() {
                	promise.reject();
                }.bind(this)
            });
        	
        	return promise;
        },
        
        /**
         * Render the link of the file that can now be downloaded.
         */
        renderFileLink: function(filename){
        	$("#cef-ta-download-link", this.$el).attr("href", "../../custom/splunk_app_cef/cef_utils/downloadapp?filename=" + filename);
        	$(".show-on-ta-link-made", this.$el).show();
        	$(".making-ta-waiting", this.$el).hide();
        },
        
        renderWaiting: function(){
        	$(".show-on-ta-link-made", this.$el).hide();
        	$(".making-ta-waiting", this.$el).show();
        },
        
        /**
         * Show the download dialog.
         */
        showDialog: function(){
        	
        	// Create the TA to be downloaded.
            $.when(this.createTA()).done(function(filename){
            	console.info("Successfully created the file");
            	this.renderFileLink(filename);
      		}.bind(this));
        	
        	// Open the dialog
        	$("#download-indexer-app-modal").modal();
        },
        
        /**
         * Create the HTML template.
         */
        makeTemplate: function(){
        	return '<div tabindex="-1" id="download-indexer-app-modal" class="modal fade in hide"> \
			    <div class="modal-header"> \
			        <button type="button" class="close btn-dialog-close" data-dismiss="modal">x</button> \
			        <h3 class="text-dialog-title">Download the Splunk Add-on for CEF Output</h3> \
			    </div> \
			    <div class="modal-body form form-horizontal modal-body-scrolling"> \
        			<div class="making-ta-waiting">Generating TA...</div> \
        			<div style="display:none" class="show-on-ta-link-made output-message"> \
        				<div class="indexer-success-message-holder"> \
        					<div class="pull-left indexer-success-icon"><i class="icon-check-circle"></i></div> \
        					<div>Your CEF output configurations have been successfully packaged into the Splunk Add-on for CEF Output.</div> \
        				</div> \
        				<div style="clear:both"> \
        					Download this add-on and install it on your indexers. The add-on manages the collection and forwarding from your indexers to your destination. \
        					<div><a href="../../help?location=%5Bsplunk_app_cef:2.1.0%5DCEF_TA" target="_blank" title="Splunk help"><%- _("Learn more").t() %> <i class="icon-external"></i></a></div> \
        				</div> \
        			</div> \
			    </div> \
			    <div class="modal-footer"> \
			        <a href="#" class="btn btn-dialog-cancel label_from_data pull-left" data-dismiss="modal" style="display: inline;">Close</a> \
			        <a style="display:none" class="show-on-ta-link-made btn btn-primary pull-right" id="cef-ta-download-link" href="#">Download add-on</a> \
			    </div> \
			</div>';
        },
        
        /**
         * Render the dialog.
         */
        render: function(){
        	
            // Render the content
            this.$el.html(_.template(this.makeTemplate()));
            
            return this;
        }
        
    });
    
    return DownloadIndexerAppView;
});
