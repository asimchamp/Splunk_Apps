"use strict";

define(
    ["backbone", "jquery", "splunkjs/splunk"],
    function(Backbone, jquery, splunk_js_sdk) {
        var SetupView = Backbone.View.extend({
            app_name: "xmatters_alert_action",
            application_name_space: {
                owner: "nobody",
                app: app_name,
                sharing: "app",
            },
            custom_configuration_file_name: "alert_actions",
            stanza_name: "xmatters",

            // -----------------------------------------------------------------
            // Backbone Functions, These are specific to the Backbone library
            // -----------------------------------------------------------------
            initialize: function initialize() {
                Backbone.View.prototype.initialize.apply(this, arguments);
            },

            events: {
                "click .save_button": "trigger_setup",
            },

            render: function() {
                return this.get_init_values(splunk_js_sdk)
                .then(initial_params => {
                    this.el.innerHTML = this.get_template(initial_params);
                    return this;
                });
            },

            // -----------------------------------------------------------------
            // Custom Functions, These are unrelated to the Backbone functions
            // -----------------------------------------------------------------
            get_init_values: async function get_init_values(splunk_js_sdk) {
                var initial_params = {endpoint_url: "", username: ""};

                var splunk_js_sdk_service = this.create_splunk_js_sdk_service(
                    splunk_js_sdk,
                    this.application_name_space,
                );

                // Retrieve the accessor used to get a configuration file
                var splunk_js_sdk_service_configurations = splunk_js_sdk_service.configurations(
                    {
                        // Name space information not provided
                    },
                );
                await splunk_js_sdk_service_configurations.fetch();

                var configuration_file_accessor = this.get_configuration_file(
                    splunk_js_sdk_service_configurations,
                    this.custom_configuration_file_name,
                );
                await configuration_file_accessor.fetch();

                var configuration_stanza_accessor = this.get_configuration_file_stanza(
                    configuration_file_accessor,
                    this.stanza_name,
                );
                await configuration_stanza_accessor.fetch();

                var init_endpoint = this.get_configuration_file_stanza_property(configuration_stanza_accessor, "param.endpoint_url");
                if (init_endpoint !== undefined && init_endpoint !== "") {
                    initial_params.endpoint_url = init_endpoint;
                }

                var init_username = this.get_configuration_file_stanza_property(configuration_stanza_accessor, "param.username");
                if (init_username !== undefined && init_username !== "") {
                    initial_params.username = init_username;
                }

                return initial_params;
            },

            // ----------------------------------
            // Main Setup Logic
            // ----------------------------------
            // This performs some sanity checking and cleanup on the inputs that
            // the user has provided before kicking off main setup process
            trigger_setup: function trigger_setup() {
                // Used to hide the error output, when a setup is retried
                this.display_error_output([]);
                this.display_success_output("");

                console.log("Triggering setup");
                var endpoint_url_input_element = jquery("input[name=endpoint_url]");
                var endpoint_url = endpoint_url_input_element.val();
                var sanitized_endpoint_url = this.sanitize_string(endpoint_url);

                var username_key_input_element = jquery("input[name=username]");
                var username_key = username_key_input_element.val();
                var sanitized_username_key = this.sanitize_string(username_key);

                var password_key_input_element = jquery("input[name=password]");
                var password_key = password_key_input_element.val();
                var sanitized_password_key = this.sanitize_string(password_key);

                var confirm_password_key_input_element = jquery("input[name=confirm_password]");
                var confirm_password_key = confirm_password_key_input_element.val();
                var sanitized_confirm_password_key = this.sanitize_string(confirm_password_key);

                var error_messages_to_display = this.validate_inputs(
                    sanitized_endpoint_url,
                    sanitized_username_key,
                    sanitized_password_key,
                    sanitized_confirm_password_key
                );

                var did_error_messages_occur = error_messages_to_display.length > 0;
                if (did_error_messages_occur) {
                    // Displays the errors that occurred input validation
                    this.display_error_output(error_messages_to_display);
                } else {
                    this.display_error_output([]);
                    this.perform_setup(
                        splunk_js_sdk,
                        sanitized_endpoint_url,
                        sanitized_username_key,
                        sanitized_password_key,
                    );
                }
            },

            // This is where the main setup process occurs
            perform_setup: async function perform_setup(splunk_js_sdk, endpoint_url, username, password) {
                try {
                    // Create the Splunk JS SDK Service object
                    var splunk_js_sdk_service = this.create_splunk_js_sdk_service(
                        splunk_js_sdk,
                        this.application_name_space,
                    );
                    // Creates the custom configuration file of this Splunk App
                    // All required information for this Splunk App is placed in
                    // there
                    await this.create_custom_configuration_file(
                        splunk_js_sdk_service,
                        endpoint_url,
                        username,
                    );

                    // Creates the passwords.conf stanza that is the encryption
                    // of the password provided by the user
                    await this.store_password(splunk_js_sdk_service, password);

                    // Completes the setup, by access the app.conf's [install]
                    // stanza and then setting the `is_configured` to true
                    await this.complete_setup(splunk_js_sdk_service);

                    // Reloads the splunk app so that splunk is aware of the
                    // updates made to the file system
                    await this.reload_splunk_app(splunk_js_sdk_service, this.app_name);

                    // Redirect to the Splunk App's home page
                    this.display_success_output("Settings successfully updated.");
                } catch (error) {
                    // This could be better error catching.
                    // Usually, error output that is ONLY relevant to the user
                    // should be displayed. This will return output that the
                    // user does not understand, causing them to be confused.
                    var error_messages_to_display = [];
                    if (
                        error !== null &&
                        typeof error === "object" &&
                        error.hasOwnProperty("responseText")
                    ) {
                        var response_object = JSON.parse(error.responseText);
                        error_messages_to_display = this.extract_error_messages(
                            response_object.messages,
                        );
                    } else {
                        // Assumed to be string
                        error_messages_to_display.push(error);
                    }

                    this.display_error_output(error_messages_to_display);
                }
            },

            create_custom_configuration_file: async function create_custom_configuration_file(
                splunk_js_sdk_service,
                endpoint_url,
                username,
            ) {
                var properties_to_update = {
                    "param.endpoint_url": endpoint_url,
                    "param.username": username,
                };

                await this.update_configuration_file(
                    splunk_js_sdk_service,
                    this.custom_configuration_file_name,
                    this.stanza_name,
                    properties_to_update,
                );
            },

            get_custom_config: async function get_custom_config(
                splunk_js_sdk_service,
            ) {
                var properties_to_update = {
                    "param.endpoint_url": endpoint_url,
                    "param.username": username,
                };

                await this.update_configuration_file(
                    splunk_js_sdk_service,
                    this.custom_configuration_file_name,
                    this.stanza_name,
                    properties_to_update,
                );
            },

            store_password: async function store_password(
                splunk_js_sdk_service,
                password,
            ) {
                // /servicesNS/<NAMESPACE_USERNAME>/<SPLUNK_APP_NAME>/storage/passwords/<REALM>%3A<USERNAME>%3A
                var realm = "";
                var username = "xmatters_password";

                var storage_passwords_accessor = splunk_js_sdk_service.storagePasswords(
                    {
                        // No namespace information provided
                    },
                );
                await storage_passwords_accessor.fetch();

                var does_storage_password_exist = this.does_storage_password_exist(
                    storage_passwords_accessor,
                    realm,
                    username,
                );

                if (does_storage_password_exist) {
                    await this.delete_storage_password(
                        storage_passwords_accessor,
                        realm,
                        username,
                    );
                }

                if (password !== undefined && password !== "") {
                    await storage_passwords_accessor.fetch();

                    await this.create_storage_password_stanza(
                        storage_passwords_accessor,
                        realm,
                        username,
                        password,
                    );
                }
            },

            complete_setup: async function complete_setup(splunk_js_sdk_service) {
                var configuration_file_name = "app";
                var stanza_name = "install";
                var properties_to_update = {
                    is_configured: "true",
                };

                await this.update_configuration_file(
                    splunk_js_sdk_service,
                    configuration_file_name,
                    stanza_name,
                    properties_to_update,
                );
            },

            reload_splunk_app: async function reload_splunk_app(
                splunk_js_sdk_service,
                app_name,
            ) {
                var splunk_js_sdk_apps = splunk_js_sdk_service.apps();
                await splunk_js_sdk_apps.fetch();

                var current_app = splunk_js_sdk_apps.item(app_name);
                current_app.reload();
            },

            // ----------------------------------
            // Splunk JS SDK Helpers
            // ----------------------------------
            // ---------------------
            // Process Helpers
            // ---------------------
            update_configuration_file: async function update_configuration_file(
                splunk_js_sdk_service,
                configuration_file_name,
                stanza_name,
                properties,
            ) {
                // Retrieve the accessor used to get a configuration file
                var splunk_js_sdk_service_configurations = splunk_js_sdk_service.configurations(
                    {
                        // Name space information not provided
                    },
                );
                await splunk_js_sdk_service_configurations.fetch();

                // Check for the existence of the configuration file being editect
                var does_configuration_file_exist = this.does_configuration_file_exist(
                    splunk_js_sdk_service_configurations,
                    configuration_file_name,
                );

                // If the configuration file doesn't exist, create it
                if (!does_configuration_file_exist) {
                    await this.create_configuration_file(
                        splunk_js_sdk_service_configurations,
                        configuration_file_name,
                    );
                }

                // Retrieves the configuration file accessor
                var configuration_file_accessor = this.get_configuration_file(
                    splunk_js_sdk_service_configurations,
                    configuration_file_name,
                );
                await configuration_file_accessor.fetch();

                // Checks to see if the stanza where the inputs will be
                // stored exist
                var does_stanza_exist = this.does_stanza_exist(
                    configuration_file_accessor,
                    stanza_name,
                );

                // If the configuration stanza doesn't exist, create it
                if (!does_stanza_exist) {
                    await this.create_stanza(configuration_file_accessor, stanza_name);
                }
                // Need to update the information after the creation of the stanza
                await configuration_file_accessor.fetch();

                // Retrieves the configuration stanza accessor
                var configuration_stanza_accessor = this.get_configuration_file_stanza(
                    configuration_file_accessor,
                    stanza_name,
                );
                await configuration_stanza_accessor.fetch();

                // We don't care if the stanza property does or doesn't exist
                // This is because we can use the
                // configurationStanza.update() function to create and
                // change the information of a property
                await this.update_stanza_properties(
                    configuration_stanza_accessor,
                    properties,
                );
            },

            // ---------------------
            // Existence Functions
            // ---------------------
            does_configuration_file_exist: function does_configuration_file_exist(
                configurations_accessor,
                configuration_file_name,
            ) {
                var was_configuration_file_found = false;

                var configuration_files_found = configurations_accessor.list();
                for (var index = 0; index < configuration_files_found.length; index++) {
                    var configuration_file_name_found =
                        configuration_files_found[index].name;
                    if (configuration_file_name_found === configuration_file_name) {
                        was_configuration_file_found = true;
                    }
                }

                return was_configuration_file_found;
            },

            does_stanza_exist: function does_stanza_exist(
                configuration_file_accessor,
                stanza_name,
            ) {
                var was_stanza_found = false;

                var stanzas_found = configuration_file_accessor.list();
                for (var index = 0; index < stanzas_found.length; index++) {
                    var stanza_found = stanzas_found[index].name;
                    if (stanza_found === stanza_name) {
                        was_stanza_found = true;
                    }
                }

                return was_stanza_found;
            },

            does_stanza_property_exist: function does_stanza_property_exist(
                configuration_stanza_accessor,
                property_name,
            ) {
                var was_property_found = false;

                for (const [key, value] of Object.entries(
                    configuration_stanza_accessor.properties(),
                )) {
                    if (key === property_name) {
                        was_property_found = true;
                    }
                }

                return was_property_found;
            },

            does_storage_password_exist: function does_storage_password_exist(
                storage_passwords_accessor,
                realm_name,
                username,
            ) {
                var storage_passwords = storage_passwords_accessor.list();
                var storage_passwords_found = [];

                for (var index = 0; index < storage_passwords.length; index++) {
                    var storage_password = storage_passwords[index];
                    var storage_password_stanza_name = storage_password.name;
                    storage_passwords_found.push(storage_password);
                }
                var does_storage_password_exist = storage_passwords_found.length > 0;

                return does_storage_password_exist;
            },

            // ---------------------
            // Retrieval Functions
            // ---------------------
            get_configuration_file: function get_configuration_file(
                configurations_accessor,
                configuration_file_name,
            ) {
                var configuration_file_accessor = configurations_accessor.item(
                    configuration_file_name,
                    {
                        // Name space information not provided
                    },
                );

                return configuration_file_accessor;
            },

            get_configuration_file_stanza: function get_configuration_file_stanza(
                configuration_file_accessor,
                configuration_stanza_name,
            ) {
                var configuration_stanza_accessor = configuration_file_accessor.item(
                    configuration_stanza_name,
                    {
                        // Name space information not provided
                    },
                );

                return configuration_stanza_accessor;
            },

            get_configuration_file_stanza_property: function get_configuration_file_stanza_property(
                configuration_stanza_accessor,
                configuration_property_name,
            ) {
                var configuration_file_stanza_property = "";
                var properties = configuration_stanza_accessor.properties();
                if (properties[configuration_property_name]) {
                    configuration_file_stanza_property = properties[configuration_property_name];
                }

                return configuration_file_stanza_property;
            },

            // ---------------------
            // Creation Functions
            // ---------------------
            create_splunk_js_sdk_service: function create_splunk_js_sdk_service(
                splunk_js_sdk,
                application_name_space,
            ) {
                var http = new splunk_js_sdk.SplunkWebHttp();

                var splunk_js_sdk_service = new splunk_js_sdk.Service(
                    http,
                    application_name_space,
                );

                return splunk_js_sdk_service;
            },

            create_configuration_file: function create_configuration_file(
                configurations_accessor,
                configuration_file_name,
            ) {
                var parent_context = this;

                return configurations_accessor.create(configuration_file_name, function(
                    error_response,
                    created_file,
                ) {
                    // Do nothing
                });
            },

            create_stanza: function create_stanza(
                configuration_file_accessor,
                new_stanza_name,
            ) {
                var parent_context = this;

                return configuration_file_accessor.create(new_stanza_name, function(
                    error_response,
                    created_stanza,
                ) {
                    // Do nothing
                });
            },

            update_stanza_properties: function update_stanza_properties(
                configuration_stanza_accessor,
                new_stanza_properties,
            ) {
                var parent_context = this;

                return configuration_stanza_accessor.update(
                    new_stanza_properties,
                    function(error_response, entity) {
                        // Do nothing
                    },
                );
            },

            create_storage_password_stanza: function create_storage_password_stanza(
                splunk_js_sdk_service_storage_passwords,
                realm,
                username,
                value_to_encrypt,
            ) {
                var parent_context = this;

                return splunk_js_sdk_service_storage_passwords.create(
                    {
                        name: username,
                        password: value_to_encrypt,
                        realm: realm,
                    },
                    function(error_response, response) {
                        // Do nothing
                    },
                );
            },

            // ----------------------------------
            // Deletion Methods
            // ----------------------------------
            delete_storage_password: function delete_storage_password(
                storage_passwords_accessor,
                realm,
                username,
            ) {
                return storage_passwords_accessor.del(realm + ":" + username + ":");
            },

            // ----------------------------------
            // Input Cleaning and Checking
            // ----------------------------------
            sanitize_string: function sanitize_string(string_to_sanitize) {
                var sanitized_string = string_to_sanitize.trim();

                return sanitized_string;
            },

            validate_endpoint_url_input: function validate_endpoint_url_input(hostname) {
                var error_messages = [];
                var error_message = "";

                var is_string_empty = typeof hostname === "undefined" || hostname === "";
                var does_string_start_with_https_protocol = hostname.startsWith(
                    "https://",
                );

                if (is_string_empty) {
                    error_message =
                        "The `Inbound Integration URL` specified was empty. Please provide" + " a value.";
                    error_messages.push(error_message);
                }

                if (!does_string_start_with_https_protocol) {
                    error_message =
                        "The `Inbound Integration URL` specified is not using `https://` at the" +
                        " beginning of it.";
                    error_messages.push(error_message);
                }

                return error_messages;
            },

            validate_text_input: function validate_text_input(value, label) {
                var error_messages = [];

                var is_string_empty = typeof value === "undefined" || value === "";

                if (is_string_empty) {
                    var error_message = "The " + label + " specified was empty. Please provide a value.";
                    error_messages.push(error_message);
                }

                return error_messages;
            },

            validate_password_match: function validate_password_match(password, confirm_password) {
                var error_messages = [];

                if (password !== confirm_password) {
                    var error_message = "The passwords provided do not match. Please check the entries and try again.";
                    error_messages.push(error_message);
                }

                return error_messages;
            },

            validate_inputs: function validate_inputs(hostname, username, password, confirm_password) {
                var error_messages = [];

                var endpoint_url_errors = this.validate_endpoint_url_input(hostname);
                error_messages = error_messages.concat(endpoint_url_errors);

                var username_errors = this.validate_text_input(username, 'Username');
                error_messages = error_messages.concat(username_errors);

                var password_errors = this.validate_text_input(password, 'Password');
                error_messages = error_messages.concat(password_errors);

                var confirm_password_errors = this.validate_text_input(confirm_password, 'Confirm Password');
                error_messages = error_messages.concat(confirm_password_errors);

                var password_match_errors = this.validate_password_match(password, confirm_password);
                error_messages = error_messages.concat(password_match_errors);

                return error_messages;
            },

            // ----------------------------------
            // GUI Helpers
            // ----------------------------------
            extract_error_messages: function extract_error_messages(error_messages) {
                // A helper function to extract error messages

                // Expects an array of messages
                // [
                //     {
                //         type: the_specific_error_type_found,
                //         text: the_specific_reason_for_the_error,
                //     },
                //     ...
                // ]

                var error_messages_to_display = [];
                for (var index = 0; index < error_messages.length; index++) {
                    var error_message = error_messages[index];
                    var error_message_to_display =
                        error_message.type + ": " + error_message.text;
                    error_messages_to_display.push(error_message_to_display);
                }

                return error_messages_to_display;
            },

            redirect_to_splunk_app_homepage: function redirect_to_splunk_app_homepage(
                app_name,
            ) {
                var redirect_url = "/app/" + app_name + "/setup_view_dashboard";

                window.location.href = redirect_url;
            },

            // ----------------------------------
            // Display Functions
            // ----------------------------------
            display_error_output: function display_error_output(error_messages) {
                // Hides the element if no messages, shows if any messages exist
                var did_error_messages_occur = error_messages.length > 0;

                var error_output_element = jquery(".setup.container .error.output");

                if (did_error_messages_occur) {
                    var new_error_output_string = "";
                    new_error_output_string += "<ul>";
                    for (var index = 0; index < error_messages.length; index++) {
                        new_error_output_string +=
                            "<li>" + error_messages[index] + "</li>";
                    }
                    new_error_output_string += "</ul>";

                    error_output_element.html(new_error_output_string);
                    error_output_element.stop();
                    error_output_element.fadeIn();
                } else {
                    error_output_element.stop();
                    error_output_element.fadeOut({
                        complete: function() {
                            error_output_element.html("");
                        },
                    });
                }
            },

            display_success_output: function display_success_output(message) {
                // Hides the element if no messages, shows if any messages exist
                var success_output_element = jquery(".setup.container .success.output");

                if (message && message.length > 0) {
                    success_output_element.html(message);
                    success_output_element.stop();
                    success_output_element.fadeIn();
                } else {
                    success_output_element.stop();
                    success_output_element.fadeOut({
                        complete: function() {
                            success_output_element.html("");
                        },
                    });
                }
            },

            get_template: function get_template(initial_params) {
                var endpoint_string = initial_params.endpoint_url ? " value='" + initial_params.endpoint_url + "'" : "";
                var username_string = initial_params.username ? " value='" + initial_params.username + "'" : "";

                var template_string =
                    "<div class='title'>" +
                    "    <h1>xMatters Alerts</h1>" +
                    "</div>" +
                    "<div class='setup container'>" +
                    "    <h2>xMatters Configuration Settings</h2>" +
                    "    <div class='field endpoint_url'>" +
                    "        <div class='title'>" +
                    "            <div>" +
                    "                <h3>Inbound Integration URL (required)</h3>" +
                    "            </div>" +
                    "        </div>" +
                    "        <div class='user_input'>" +
                    "            <div class='text'>" +
                    "                <input type='text' name='endpoint_url'" + endpoint_string + " placeholder='https://<company>.xmatters.com/api/integration/1/functions/<uuid>/triggers'></input>" +
                    "            </div>" +
                    "        </div>" +
                    "    </div>" +
                    "    <h2>xMatters Credentials</h2>" +
                    "    <div class='field username'>" +
                    "        <div class='title'>" +
                    "            <h3>Username</h3>" +
                    "        </div>" +
                    "        <div class='user_input'>" +
                    "            <div class='text'>" +
                    "                <input type='text' name='username'" + username_string + "></input>" +
                    "            </div>" +
                    "        </div>" +
                    "    </div>" +
                    "    <div class='field password'>" +
                    "        <div class='title'>" +
                    "            <h3>Password</h3>" +
                    "        </div>" +
                    "        <div class='user_input'>" +
                    "            <div class='text'>" +
                    "                <input type='password' name='password'></input>" +
                    "            </div>" +
                    "        </div>" +
                    "    </div>" +
                    "    <div class='field password'>" +
                    "        <div class='title'>" +
                    "            <h3>Confirm password</h3>" +
                    "        </div>" +
                    "        <div class='user_input'>" +
                    "            <div class='text'>" +
                    "                <input type='password' name='confirm_password'></input>" +
                    "            </div>" +
                    "        </div>" +
                    "    </div>" +
                    "    <br/>" +
                    "    <div class='save_button_field'>" +
                    "        <button name='save_button' class='save_button'>" +
                    "            Save" +
                    "        </button>" +
                    "    </div>" +
                    "    <br/>" +
                    "    <div class='error output'>" +
                    "    </div>" +
                    "    <br/>" +
                    "    <div class='success output'>" +
                    "    </div>" +
                    "</div>";

                return template_string;
            },
        });

        return SetupView;
    },
);
