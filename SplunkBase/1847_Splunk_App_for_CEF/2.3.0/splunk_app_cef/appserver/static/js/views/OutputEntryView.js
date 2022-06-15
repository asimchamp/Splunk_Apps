require.config({
    paths: {
        text: "../app/splunk_app_cef/js/lib/text",
        console: '../app/splunk_app_cef/js/util/Console',
        tagmanager: '../app/splunk_app_cef/js/lib/tagmanager/tagmanager',
        kvstore: "../app/splunk_app_cef/js/lib/kvstore",
        file_upload_view: '../app/splunk_app_cef/js/views/FileUploadView'
    },
    shim: {
        'tagmanager': {
            deps: ['jquery']
        },
        'kvstore': {
            deps: ['jquery', 'backbone', 'underscore']
        }
    }
});

define([
    "underscore",
    "backbone",
    "jquery",
    "splunkjs/mvc/simplesplunkview",
    "text!../app/splunk_app_cef/js/templates/OutputEntryView.html",
    "kvstore",
    "splunk.util",
    "file_upload_view",
    'models/SplunkDBase',
    "util/splunkd_utils",
    "tagmanager",
    "css!../app/splunk_app_cef/js/lib/tagmanager/tagmanager.css",
    "css!../app/splunk_app_cef/css/OutputEntryView.css",
    "console"
], function(_,
            Backbone,
            $,
            SimpleSplunkView,
            OutputEntryViewTemplate,
            KVStore,
            splunkUtil,
            FileUploadView,
            SplunkDBase,
            splunkd_utils) {

    // Make the model for the output groups
    var CEFOutputGroupModel = KVStore.Model.extend({
        collectionName: 'cef_output_groups'
    });

    var CEFOutputGroupCollection = KVStore.Collection.extend({
        collectionName: 'cef_output_groups',
        model: CEFOutputGroupModel
    });

    var Credential = SplunkDBase.extend({
        url: function(){
            return Splunk.util.make_url("/splunkd/__raw/servicesNS/nobody/splunk_app_cef/storage/passwords");
        }
    });

    var CertificateFile = Backbone.Model.extend();

    var CertificateFiles = Backbone.Collection.extend({
        url: Splunk.util.make_url("/splunkd/__raw/services/storage/cef_certs"),
        model: CertificateFile
    });

    // Define the custom view class
    var OutputEntryView = SimpleSplunkView.extend({
        className: "OutputEntryView",

        /**
         * Setup the defaults
         */
        defaults: {
            default_app: "splunk_app_cef",
            selected_output: null,
            require_ssl: false,
            saved_search: null
        },

        initialize: function() {
            // Apply the defaults
            this.options = _.extend({}, this.defaults, this.options);

            options = this.options || {};

            this.default_app = options.default_app;
            this.selected_output = options.selected_output;
            this.require_ssl = options.require_ssl;
            this.saved_search = options.saved_search;

            // This is the KV store collection
            this.output_group_collection = null;

            // This references to a map of output groups to searches
            this.output_group_search_map = null;

            // This is for the file upload views for the certificate
            this.certificate_file_upload_view = null;

            // This represents the credential
            this.credential = null;
            this.credential_exists = null;

            // Get the list of the output groups and make a map from groups to searches
            this.fetchOutputGroupMap();
        },

        events: {
            "click .new_output_group": "openDialogNewEntry",
            "click #save_new": "saveEntry",
            "click .output_entry_edit_href": "openEditDialogExistingEntry",
            "blur #hosts_input": "insertHost",
            "click .delete_output_group": "deleteEntry",
            "click #checkall": "checkOrUncheckAll",
        },

        /**
         * Insert the host if a partially filled out host is present.
         */
        insertHost: function() {
            var partial_tag = $("#hosts_input", this.$el).val();

            if (partial_tag) {
                $("#hosts_input", this.$el).tagsManager('pushTag', partial_tag);
                $("#hosts_input", this.$el).val("");
            }
        },

        /**
         * Load the SSL certificate password from secure storage.
         */
        loadCertificatePassword: function(name){
            // Get a promise ready
            var promise = jQuery.Deferred();

            // Start with the URL for _new; we will change it as needed next
            var url = splunkd_utils.fullpath('/servicesNS/nobody/splunk_app_cef/storage/passwords/_new');
            var loading_new = true;
    
            // If we are loading an existing credential, then use the name of the credential
            if(name !== undefined && name !== '' && name !== null && name !== '_new'){
                url = splunkd_utils.fullpath('/servicesNS/nobody/splunk_app_cef/storage/passwords/splunk_app_cef:' + encodeURIComponent(name) + ':');
                loading_new = false;
            }

            // Load the password
            this.credential = new Credential();

            this.credential.fetch({
                url: url
            }).done(function(){
                this.credential_exists = !loading_new;
                promise.resolve(this.credential.entry.content.attributes.clear_password);
            }.bind(this))
            .fail(function(){
                this.credential_exists = false;
                promise.resolve(null);
            });

            return promise;
        },

        /**
         * Save the SSL certificate password to secure storage.
         */
        saveCertificatePassword: function(name, password){
            var credModel = this.credential;

            if(password === ''){
                this.deleteCertificatePassword();
                // Reload the entry from _new after deleting the entry
                this.loadCertificatePassword();
                return;
            }
            else if(!this.credential_exists){

                // Make a new stored password entry
                credModel = new Credential({
                    user: 'nobody',
                    app: 'splunk_app_cef'
                });

                credModel.entry.content.set({
                    realm: 'splunk_app_cef',
                    name: name,
                    password: password
                });
            }
            else{
                credModel.entry.content.set({
                    password: password,
                });
            }

            return credModel.save();
        },

        /**
         * Delete the SSL certificate password from secure storage.
         */
        deleteCertificatePassword: function(){
            this.credential_exists = false;
            return this.credential.destroy();
        },

        /**
         * Open a dialog to edit the existing entry
         */
        openEditDialogExistingEntry: function(ev) {
            // Get the output to edit
            var i = parseInt($(ev.target).data('output-index'), 10);
            var output = this.output_group_collection.models[i];

            // Open the dialog to edit this entry
            this.openEditingDialog(output.attributes._key, output.attributes.server, output.attributes.client_cert_filename, output.attributes.ssl_cn, output.attributes.ssl_alt, output.attributes.deploy_via_icm, "app", "owner", false, this.require_ssl);
        },

        /**
         * Output group information has been updated, post the changes.
         */
        gotOutputGroups: function() {
            for (var c = 0; c < this.output_group_collection.models.length; c++) {
                // TODO: re-render the UI for output groups here
            }
        },

        /**
         * Load KV store based output groups
         */
        loadKVOutputs: function() {
            this.output_group_collection = new CEFOutputGroupCollection();
            this.output_group_collection.on('reset', this.gotOutputGroups.bind(this), this);

            // Start the loading of the output groups
            $.when(this.output_group_collection.fetch(), this.fetchOutputGroupMap()).done(function(){
                this._render();
            }.bind(this));
        },

        /**
         * Call reload on the given input.
         */
        reloadEndpoint: function(endpoint, description) {
            // Prepare the arguments
            var params = {};
            params.output_mode = 'json';

            // Make the URL
            var uri = Splunk.util.make_url(endpoint);

            var success = false;

            // Fire off the request
            $.ajax({
                url: uri,
                type: 'POST',
                async: false,
                data: params,
                success: function(result) {

                    if (result !== undefined && result.isOk === false) {
                        this.showWarning(description + " could not be reloaded: " + result.message);
                    } else {
                        console.info("Successfully reloaded the " + description);
                        success = true;
                    }

                }.bind(this),
                error: function(result) {

                    if (result.responseJSON.messages.length > 0) {
                        this.showWarning(result.responseJSON.messages[0].text);
                    } else {
                        this.showWarning(description + " could not be reloaded");
                    }
                }.bind(this)
            });

            return success;
        },

        /**
         * Save the output to the server
         */
        saveOutputToServer: function(name, hosts, certificate, certificate_password, ssl_cn, ssl_alt, deploy_via_icm, app, owner, is_new) {
            // Make the output group
            var output_group = null;

            // Make a new output-group if requested
            if (is_new) {
                output_group = new CEFOutputGroupModel({
                    _key: name,
                    'output_type': 'tcpout',
                    'server': hosts,
                    'client_cert_filename' : certificate,
                    'ssl_cn' : ssl_cn,
                    'ssl_alt' : ssl_alt,
                    'deploy_via_icm': deploy_via_icm.toString()
                }, { isNew: true });
            }

            // Otherwise, edit the existing one
            else {
                output_group = new CEFOutputGroupModel({
                    _key: name,
                    'output_type': 'tcpout',
                    'server': hosts,
                    'client_cert_filename' : certificate,
                    'ssl_cn' : ssl_cn,
                    'ssl_alt' : ssl_alt,
                    'deploy_via_icm': deploy_via_icm.toString()
                });
            }

            // Get a promise ready for the saving to the output group
            var output_group_promise = jQuery.Deferred();

            // Save the output group
            output_group.save().success(function(data) {
                this.output_group_collection.push(output_group);
                Backbone.trigger("output_group:changed", name); // Fire an event letting people know that an output group was changed
                console.info("Successfully saved an output group");
                output_group_promise.resolve(data._key);
            }.bind(this)).fail(function(model, response) {
                console.info("Failed to make the output group");

                // Detect if the output group already existed
                if (model.status === 409) {
                    output_group_promise.reject("An output group with this name already exists");
                } else {
                    output_group_promise.reject("The output group could not be saved");
                }
            }.bind(this));

            return [output_group_promise, this.saveCertificatePassword(name, certificate_password)];
        },

        /**
         * Show the warning message.
         */
        hideWarning: function() {
            $('#warning-message', this.$el).hide();
        },

        /**
         * Show the warning message.
         */
        showWarning: function(message) {
            $('#warning-message-text', this.$el).text(message);
            $('#warning-message', this.$el).show();
        },

        /**
         * Get a list of all of the cef searches and create a map of the output groups to searches.
         * 
         * This will be used to determine 
         */
        fetchOutputGroupMap: function() {
        	// Get a promise ready
            var promise = jQuery.Deferred();
            
            // Use the existing map if we have one
            if(this.output_group_search_map !== null){
                promise.resolve(this.output_group_search_map);
            }
            
            // Otherwise, make the map
            else{
                // Prepare the arguments
                var params = {};
                params.output_mode = 'json';
                params.search = 'action.cefout2=1';
                params.listDefaultActionArgs = '1';
                
                var uri = Splunk.util.make_url("/splunkd/__raw/services/saved/searches/");
                uri += '?' + Splunk.util.propToQueryString(params);
                
                // Fire off the request
                $.ajax({
                    url:     uri,
                    type:    'GET',
                    success: function(result) {
                        this.output_group_search_map = this.createOutputGroupMap(result.entry);
                        promise.resolve(this.output_group_search_map);
                    }.bind(this)
                });
            }
            
            // Return the promise
        	return promise;
        },

        /**
         * Take a list of saved searches and produce an associative array that lists the searches
         * that use the given output group.
         */
        createOutputGroupMap: function(saved_searches) {
            var new_map = {};

            for(var c = 0; c < saved_searches.length; c++) {
                var parsed_spec = JSON.parse(saved_searches[c].content["action.cefout2.spec"]);
                var output_group_name = parsed_spec.routing;
                var search_name = saved_searches[c].name;

                // Add the search to map
                if(new_map[output_group_name] === undefined) {
                    new_map[output_group_name] = [search_name];
                } else {
                    new_map[output_group_name].push(search_name);
                }
            }

            return new_map;
        },

        /**
         * Determine where the output group is being used in other searches (other than the
         * currently defined one).
         * 
         * This is important because we don't want to allow users to delete an output not realizing
         * that it was linked to another search.
         */
        getWhereUsed: function(output_group_name, search_name) {
            var searches = this.output_group_search_map[output_group_name];

            if(searches && search_name) {
                searches = _.without(searches, search_name);
            }

            return searches ? searches : [];
        },

        /**
         * Delete the selected entries
         */
        doDeleteEntries: function(to_delete_list) {
            var key = to_delete_list.pop();

            // Determine where this output group is used
            var where_used = this.getWhereUsed(key, this.saved_search);

            // Stop if this entry is linked somewhere else
            if (where_used.length > 0) {
                alert('Unable to delete output group "' + key + '" because it is being used in other searches (' + where_used.join(', ') + ')');
                return;
            }

            // Stop if there are no items to delete
            if (key === undefined) {
                alert("Please select at least one entry to delete");
                return;
            }

            // Get a reference to the model we are going to delete
            var model = new CEFOutputGroupModel({ _key: key });

            model.destroy().done(function() {
                if (to_delete_list.length === 0) {
                    // Refresh the UI
                    this.render();
                } else {
                    // Otherwise, move to the next one
                    this.doDeleteEntries(to_delete_list).bind(this);
                }

                // If we deleted the entry that is currently selected, then clear it as being selected
                if(key === this.selected_output){
                    this.selected_output = null;
                }

                // Load the certificate entry if it exists and then delete it
                $.when(this.loadCertificatePassword(key)).done(function(){
                    this.deleteCertificatePassword();
                }.bind(this));

            }.bind(this));
        },

        /**
         * Delete the selected entries
         */
        deleteEntry: function() {
            var outputs = [];

            $("input.output-group-checkbox[type='checkbox']:checked", this.$el).each(function() {
                outputs.push($(this).data("outputgroup"));
            });

            this.doDeleteEntries(outputs);

            return false; // Stop propagation so that page doesn't go back to the top
        },

        /**
         * Save the entry from the dialog
         */
        saveEntry: function() {
            // Stop of the form doesn't validate
            if (!this.validateEntry()) {
                return false;
            }

            // Get the name
            var is_new = !$('#name_input', this.$el).prop('disabled');

            var name = $('#name_input_hidden', this.$el).val();

            if (is_new) {
                name = $('#name_input', this.$el).val();
            }

            // Get the list of hosts
            var hosts = $('input[name=hidden-hosts_input]', this.$el).val();

            // Get whether this is deployed via ICM
            var deploy_via_icm = $('#deploy_type_input', this.$el).is(':checked');

            // Get the certificate information
            var certificate = this.certificate_file_upload_view.getFilename();
            var certificate_password = $('#cert_password_input', this.$el).val();
            var ssl_cn = $('#ssl_cn', this.$el).val();
            var ssl_alt = $('#ssl_alt', this.$el).val();

            // Determine the owner and app
            var owner = $('#owner_input').val();
            var app = $('#app_input').val();

            // Assign default values
            if (is_new || !owner) {
                owner = "nobody";
            }

            if (is_new || !app) {
                app = this.default_app;
            }

            // Save the output
            $.when.apply($, this.saveOutputToServer(name, hosts, certificate, certificate_password, ssl_cn, ssl_alt, deploy_via_icm, app, owner, is_new)).done(function(created_entry_key) {
                // Select the entry that was just created as the currently selected one if no entry
                // is currently selected. This prevents the user from having to clicked the entry
                // that seems obviously the one they want to use for this output.
                if(this.selected_output === null){
                    this.selected_output = created_entry_key;
                }

                // Update the UI based on whether the operation was successful
                $('#editOutputModal', this.$el).modal('hide');
                this.render();
                this.hideWarning();
            }.bind(this)).fail(function(message) {
                this.showWarning(message);
            }.bind(this));
        },

        /**
         * Open a dialog to create a new output.
         */
        openDialogNewEntry: function() {
            this.openEditingDialog("", "", "", "", "", false, "", "", true, this.require_ssl);
        },

        /**
         * Get the selected output.
         */
        getSelectedOutput: function() {
            // Get the dialog to edit
            var selected_output_el = $(".output_group_assignment:checked", this.$el);

            if (selected_output_el.length > 0) {
                var i = parseInt($(".output_group_assignment:checked", this.$el).data('output-index'), 10);
                var output = this.output_group_collection.models[i];

                return output;
            } else {
                return null;
            }
        },

        /**
         * Validate the outputs entry.
         */
        validateEntry: function() {
            // Clear the existing errors
            $(".name-input-group", this.$el).removeClass("error");
            $(".host-input-group", this.$el).removeClass("error");
            this.certificate_file_upload_view.setErrorState(false);

            var errors = 0;

            // Validate the name
            if ($('#name_input', this.$el).prop('disabled') === false) {
                var name = $('#name_input', this.$el).val();
                var name_re = /^[a-zA-Z0-9_]+$/i;

                if (!name_re.test(name)) {
                    $(".name-input-group", this.$el).addClass("error");
                    errors = errors + 1;
                }
            }

            // Get the list of hosts
            if ($('input[name=hidden-hosts_input]', this.$el).val().length === 0) {
                $('.host-input-group', this.$el).addClass('error');
                errors = errors + 1;
            }

            var hosts = $('input[name=hidden-hosts_input]', this.$el).val().split(',');
            for (var i = 0; i < hosts.length; i++) {
                var host = hosts[i];
                // For every host, verify the format is correct
                if (!this.isValidHost(host)) {
                    $('.host-input-group', this.$el).addClass('error');
                    errors = errors + 1;
                    break;
                }
            }

            // Validate the certificate file
            if(this.require_ssl && (this.certificate_file_upload_view.getFilename() === undefined || this.certificate_file_upload_view.getFilename().length === 0)){
                this.certificate_file_upload_view.setErrorState(true);
                errors = errors + 1;
            }

            return errors === 0;
        },

        /**
         * Determine if the host is valid.
         */
        isValidHost: function(entry) {
            var ip_re = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])?$/;
            var host_re = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])?$/;
            var port_re = /^[0-9]{1,6}$/;

            var parts = entry.split(':');
            if (parts.length !== 2) {
                return false;
            }

            var hostOrIp = parts[0];
            var port = parseInt(parts[1], 10);

            if (isNaN(port) || port <=0 || port > 65535) {
                return false;
            }

            if (host_re.test(hostOrIp) || ip_re.test(hostOrIp)) {
                return true;
            }

            return false;
        },

        /**
         * Open the dialog for editing the output.
         */
        openEditingDialog: function(name, hosts, certificate_file, ssl_cn, ssl_alt, deploy_via_icm, app, owner, is_new, require_ssl) {
            // Provide a default to deploy_via_icm if necessary and convert to a boolean
            if(deploy_via_icm === undefined){
                deploy_via_icm = false;
            }
            else if(deploy_via_icm === true || deploy_via_icm === 1 || deploy_via_icm === '1' || deploy_via_icm.toString().toLowerCase() === 'true'){
                deploy_via_icm = true;
            }
            else{
                deploy_via_icm = false;
            }

            // Update the hosts
            $("#hosts_input", this.$el).tagsManager('empty');
            var hosts_array = hosts.split(',');

            for (var i = 0; i < hosts_array.length; i++) {
                $("#hosts_input", this.$el).tagsManager('pushTag', hosts_array[i]);
            }

            // Update the state depending on whether this is a new entry or not
            if (is_new) {
                $("#name_input", this.$el).prop("disabled", false);
                $(".modal_new_state", this.$el).show();
                $(".modal_edit_state", this.$el).hide();
            } else {
                $("#name_input", this.$el).prop("disabled", true);
                $("#name_input_hidden", this.$el).val(name);
                $(".modal_new_state", this.$el).hide();
                $(".modal_edit_state", this.$el).show();
            }

            // Set the values
            $("#name_input", this.$el).val(name);
            $("#app_input", this.$el).val(app);
            $("#owner_input", this.$el).val(owner);
            $('#ssl_cn', this.$el).val(ssl_cn);
            $('#ssl_alt', this.$el).val(ssl_alt);
            if(deploy_via_icm){
                $('#deploy_type_input', this.$el).attr('checked', deploy_via_icm.toString()).prop('checked', true);
            }
            else{
                $('#deploy_type_input', this.$el).removeAttr('checked').prop('checked', false);
            }
            
            this.certificate_file_upload_view.setFilename(certificate_file);

            // Change the state of the UI if SSL is required
            if(require_ssl){
                this.require_ssl = require_ssl;
                this.certificate_file_upload_view.setRequired(true);
            }
            else{
                this.certificate_file_upload_view.setRequired(false);
            }

            $.when(this.loadCertificatePassword(name)).done(function(password){
                if(password){
                    $("#cert_password_input", this.$el).val(password);
                }
                else{
                    $("#cert_password_input", this.$el).val("");
                }

                // Open the dialog
                this.certificate_file_upload_view.hideUploadStatusInfo();
                $('#editOutputModal', this.$el).modal();
            }.bind(this));
        },

        /**
         * Render the page 
         */
        _render: function() {
            // Get the outputs
            var outputs = null;

            if (this.output_group_collection !== null) {
                outputs = this.output_group_collection.models;
            }

            // Render the output entry view
            this.$el.html(_.template(OutputEntryViewTemplate, {
                'outputs': outputs,
                'selected_output': this.selected_output,
                'splunkUtil': splunkUtil,
                'maxFileSize' : 5,
                'getWhereUsed' : function(output_group_name){ return this.getWhereUsed(output_group_name, this.saved_search); }.bind(this)
            }));

            // Make the list of hosts into tags
            $("#hosts_input", this.$el).tagsManager({
                delimiters: [44, 9, 13], // tab, enter, comma
                prefilled: [],
                validator: function(tag) {
                    if (this.isValidHost(tag)) {
                        $(".host-input-group", this.$el).removeClass("error");
                        return true;
                    } else {
                        $(".host-input-group", this.$el).addClass("error");
                        return false;
                    }
                }.bind(this)
            });

            // Get the certificate files
            var certificates = new CertificateFiles();
            certificates.url = Splunk.util.make_url("/splunkd/__raw/services/storage/cef_certs");
            certificates.fetch();

            // Render the file upload view for the certificate
            this.certificate_file_upload_view = new FileUploadView({
                el: ".upload_cert_container",
                title: "Certificate",
                help_block: "Select an SSL certificate file (typically a PEM file).",
                collection: certificates
            });

            this.certificate_file_upload_view.render();
            return this;
        },

        /**
         * Check or uncheck all of the items as necessary.
         */
        checkOrUncheckAll: function() {
            if ($("#checkall", this.$el).prop("checked")) {
                $("input[type='checkbox']:enabled", this.$el).attr('checked', 'true').prop('checked', true);
            } else {
                $("input[type='checkbox']", this.$el).removeAttr('checked').prop('checked', false);
            }
        },

        /**
         * Render the dialog.
         */
        render: function() {
            this.loadKVOutputs();
            this.loadCertificatePassword();
        }

    });

    return OutputEntryView;
});
