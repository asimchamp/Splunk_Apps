"use strict";

import * as Splunk from './splunk_helpers.js'
import * as Config from './setup_configuration.js'
import * as StoragePasswords from './storage_passwords.js'
import * as SplunkHelpers from './splunk_helpers.js'
import { promisify } from './util.js'

const CUSTOM_CONF = 'shodan'
const CUSTOM_CONF_STANZA = 'config'

const SECRET_REALM = ''
const SECRET_NAME = 'api_key'

export async function perform(splunk_js_sdk, setup_options) {
    var app_name = "Hurricane_Labs_App_for_Shodan";

    var application_name_space = {
        owner: "nobody",
        app: app_name,
        sharing: "app",
    };

    try {
        // Create the Splunk JS SDK Service object
        const splunk_js_sdk_service = Config.create_splunk_js_sdk_service(
            splunk_js_sdk,
            application_name_space,
        );

        let { token, max_pages_value } = setup_options;

        // // Get conf and do stuff to it
        await Splunk.update_configuration_file(
             splunk_js_sdk_service,
             CUSTOM_CONF,
             CUSTOM_CONF_STANZA,
             { max_pages : max_pages_value }
        )

        // Write token to passwords.conf
        await StoragePasswords.write_secret(
            splunk_js_sdk_service,
            SECRET_REALM,
            SECRET_NAME,
            token
        )

        // Completes the setup, by access the app.conf's [install]
        // stanza and then setting the `is_configured` to true
        await Config.complete_setup(splunk_js_sdk_service);

        return 'success';

        // Reloads the splunk app so that splunk is aware of the
        // updates made to the file system
        //await Config.reload_splunk_app(splunk_js_sdk_service, app_name);

        // Redirect to the Splunk App's home page
        //Config.redirect_to_splunk_app_homepage(app_name);
    } catch (error) {
        // This could be better error catching.
        // Usually, error output that is ONLY relevant to the user
        // should be displayed. This will return output that the
        // user does not understand, causing them to be confused.
        console.error('Error:', error);
        return 'error';
    }
}

export async function get_initial_state(splunk_js_sdk) {
    var app_name = "Hurricane_Labs_App_for_Shodan";

    var application_name_space = {
        owner: "nobody",
        app: app_name,
        sharing: "app",
    };

    const splunk_js_sdk_service = Config.create_splunk_js_sdk_service(
        splunk_js_sdk,
        application_name_space,
    );

    var splunk_js_sdk_service_configurations = splunk_js_sdk_service.configurations(
        {
            // Name space information not provided
        },
    );

    function get_config_file_value(
        app_config_accessor,
        stanza_name,
        key_name
      ) {
      
        let stanzas_found = app_config_accessor.list();
        let value = false;
        
        for (var index = 0; index < stanzas_found.length; index++) {
            var stanza_data = stanzas_found[index];
            var stanza_found = stanza_data.name;
            if (stanza_found === stanza_name) {
                value = stanza_data._properties[key_name];
                break;
            }
        }
      
        return value;
        
      };

    splunk_js_sdk_service_configurations = await promisify(splunk_js_sdk_service_configurations.fetch)();

      // Retrieves the configuration file accessor
    var app_config_accessor = SplunkHelpers.get_configuration_file(
        splunk_js_sdk_service_configurations,
        'app',
    );

    var shodan_config_accessor = SplunkHelpers.get_configuration_file(
        splunk_js_sdk_service_configurations,
        'shodan',
    );

    app_config_accessor = await promisify(app_config_accessor.fetch)();
    shodan_config_accessor = await promisify(shodan_config_accessor.fetch)();

    let is_configured = get_config_file_value(
        app_config_accessor, 
        'install',
        'is_configured'
    );

    let max_pages = get_config_file_value(
        shodan_config_accessor, 
        'config',
        'max_pages'
    );
    
    return {
        'is_configured' : is_configured,
        'max_pages' : max_pages
    };

}