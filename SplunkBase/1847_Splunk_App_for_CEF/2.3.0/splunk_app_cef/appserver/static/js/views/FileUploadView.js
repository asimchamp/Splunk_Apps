require.config({
    paths: {
        text: "../app/splunk_app_cef/js/lib/text"
    }
});

define([
    "underscore",
    "backbone",
    "splunkjs/mvc",
    "jquery",
    "splunkjs/mvc/simplesplunkview",
    "splunkjs/mvc/simpleform/input/dropdown",
    "util/splunkd_utils",
    "splunkjs/mvc/utils",
    "splunk.util",
    "views/shared/waitspinner/Master",
    "text!../app/splunk_app_cef/js/templates/FileUploadView.html",
    "css!../app/splunk_app_cef/css/FileUploadView.css",
], function(
    _,
    Backbone,
    mvc,
    $,
    SimpleSplunkView,
    DropdownInput,
    splunkd_utils,
    mvc_utils,
    splunkUtil,
    WaitSpinner,
    FileUploadViewTemplate
){
    return SimpleSplunkView.extend({
        className: "FileUploadView",

        /**
         * Setup the defaults
         */
        defaults: {
        	title: "File",
            help_block: "Select a file",
            max_file_size: 5 * 1024 * 1024,
            max_file_size_readable: "5 MB",
            filename: "",
            available_files: []
        },

        events: {
            "change #file_input" : "handleUploadedFile"
        },
        
        initialize: function() {
            this.output_searches = null;
            
            // Apply the defaults
            this.options = _.extend({}, this.defaults, this.options);        
            
            // Get the custom parameters
            this.title = this.options.title;
            this.help_block = this.options.help_block;
            this.max_file_size = this.options.max_file_size;
            this.max_file_size_readable = this.options.max_file_size_readable;
            this.filename = this.options.filename;
            this.available_files = this.options.available_files;

            // Stores the name of the uploaded file
            this.stored_filename = null;

            // This will show the user that the upload is happening
            this.waitSpinner = new WaitSpinner();

            // This keeps a reference to the dropdown for selecting the files
            this.file_select_input = null;
            this.file_select_input_id = null;

            // Watch the model for changes in order to show new entries
            this.collection.on("sync", function(newValue) {
                console.info("Fetched the collection");
                var files_list = _.map(this.collection.models, function(model){return model.attributes.name;});
                var choices = this.convertListToChoices(files_list);

                mvc.Components.getInstance(this.file_select_input_id).settings.set("choices", choices);
            }.bind(this));

            // Create the dropdown for the file-list
            this.file_select_input_id = "file_select_input_" + this.id;

            this.file_select_input = new DropdownInput({
                "id": this.file_select_input_id,
                "choices": this.convertListToChoices(this.available_files),
                "selectFirstChoice": false,
                "showClearButton": true,
				"width": "206"
            }, {tokens: true});
            
            this.file_select_input.on("change", function(newValue) {
                this.filename = newValue;
            }.bind(this));
        },

        /**
         * For some reason the backbone handlers don't work.
         */
        setupDragDropHandlers: function () {
            // Setup a handler for handling files dropped on the import dialog
            drop_zone2 = document.getElementById('file_upload_box_' + this.id);
            this.setupDragDropHandlerOnElement(drop_zone2);
        },

        /**
         * Setup drag & drop handlers on the given drop-zone.
         */
        setupDragDropHandlerOnElement: function (drop_zone) {
            if(drop_zone === null){
                console.warn("No dropzone provided to setup");
                return;
            }

            drop_zone.ondragover = function (e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
            }.bind(this);

            drop_zone.ondrop = function (e) {
                e.preventDefault();
                this.handleUploadedFile(e);
                return false;
            }.bind(this);
        },

        /**
         * Indicate that a file is being uploaded
         */
        showUploadProgress: function(is_done){
            if(is_done){
                this.$('.upload-in-progress').hide();
                this.$('.upload-done').show();
            }
            else{
                this.$('.upload-in-progress').show();
                this.$('.upload-done').hide();
            }
        },

        /**
         * Hide the fule upload status messages.
         */
        hideUploadStatusInfo: function(){
            this.$('.upload-in-progress').hide();
            this.$('.upload-done').hide();
        },

        /**
        * Handle the event that occurs when a file is uploaded
        */
        handleUploadedFile: function (evt) {
            // Stop if the browser doesn't support processing files in Javascript
            if (!window.FileReader) {
                alert("Your browser doesn't support file reading in Javascript; thus, I cannot parse your uploaded file");
                return false;
            }

            var files = [];

            // Get the files from an input widget if available
            if (evt.target.files && evt.target.files.length > 0) {
                files = evt.target.files;
            }

            // Get the files from the drag & drop if available
            else if (evt.dataTransfer && evt.dataTransfer.files.length > 0) {
                files = evt.dataTransfer.files;
            }

            // Stop if no files where provided (user likely pressed cancel)
            if (files.length > 0) {

                // Get the file name
                var file_size = files[0].size;

                // Check if file is larger than 5MB
                if (file_size > this.max_file_size) {
                    alert("File is too large, must be less than " + this.max_file_size_readable);
                    this.hideUploadStatusInfo();
                    return false;
                }

                // Get a reader so that we can read in the file
                var reader = new FileReader();

                // Show the progress bar
                this.showUploadProgress(false);

                // Setup an onload handler that will process the file
                reader.onload = function (evt) {

                    // Stop if the ready state isn't "loaded"
                    if (evt.target.readyState != 2) {
                        this.hideUploadStatusInfo();
                        return;
                    }

                    // Stop if the file could not be processed
                    if (evt.target.error) {
                        alert("File could not be processed");
                        this.hideUploadStatusInfo();
                        return;
                    }

                    // Get the file contents
                    var file_content = evt.target.result;

                    // Upload the file contents
                    $.when(this.uploadFile(files[0], file_content)).done(function (file_name) {
                        this.setFilename(file_name);
                        console.info("File successfully uploaded");
                        this.showUploadProgress(true);
                    }.bind(this))
                    .fail(function() {
                        this.hideUploadStatusInfo();
                    }.bind(this));

                }.bind(this);

                // Start the process of processing file
                reader.readAsBinaryString(files[0]);
            }
            else {
                alert("No file object was found");
                this.hideUploadStatusInfo();
                return false;
            }

            return true;
        },

        /**
         * Upload the given file to Splunk
         */
        uploadFile: function (file, file_content) {
            var promise = jQuery.Deferred();

            var file_uri = Splunk.util.make_url("/splunkd/__raw/services/storage/cef_certs");
            var file_name = file.name;

            var data = {
                'file_name': file_name,
                'file_contents': file_content
            };

            $.ajax({
                url: file_uri,
                data: data,
                type: 'POST',

                success: function (result) {

                    // Save the information about the certificate
                    this.filename = result.filename;
                    this.stored_filename = result.stored_filename;

                    console.info("Successfully uploaded the file");
                    promise.resolve(this.stored_filename);

                    // Update the list
                    this.collection.fetch();
                }.bind(this),

                error: function (jqXHR, textStatus, errorThrown) {
                    if(jqXHR.responseJSON.message){
                        alert('Unable to upload the file: ' + jqXHR.responseJSON.message);
                        promise.reject(jqXHR.responseJSON.message);
                    }
                    else{
                        console.error("Unable to save the file");
                        promise.reject("Unable to save the file");
                    }
                    
                }
            });

            return promise;
        },

        /**
         * Indicate that the input is required.
         */
        setRequired: function(required){
            if(required){
                this.$('.required').show();
            }
            else{
                this.$('.required').hide();
            }
        },

        /**
         * Set the error state to show that the content is invalid.
         */
        setErrorState: function(show_error){
            if(show_error){
                $('.control-group', this.$el).addClass('error');
            }
            else{
                $('.control-group', this.$el).removeClass('error');
            }
        },

        setFilename: function(filename){
            this.filename = filename;
            mvc.Components.getInstance(this.file_select_input_id).val(filename);
        },

        getFilename: function(){
            return mvc.Components.getInstance(this.file_select_input_id).val();
        },

        /**
         * Convert a flat list to one that can be displayed in a choices list
         */
        convertListToChoices: function(list){
        	
        	var choices = [];
        	
        	for(var c = 0; c < list.length; c++){
        		choices.push( { 
        			'label' : list[c],
        			'value' : list[c]
        		} );
        	}
        	
        	return choices;
        },

        render: function () {
            this.$el.html(_.template(FileUploadViewTemplate, {
                'splunkUtil': splunkUtil,
                'maxFileSize' : 5,
                'title': this.title,
                'help_block': this.help_block,
                'dropzone_id': 'file_upload_box_' + this.id,
                'filename': this.filename
            }));

            this.$('.upload-spinner-container').append(this.waitSpinner.render().$el);
            this.waitSpinner.start();
            this.setupDragDropHandlers();

            // Render the dropdown for the file-list
            this.$('#file_select_input').append(this.file_select_input.render().$el);
        }
    });
});