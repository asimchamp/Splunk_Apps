import * as SplunkHelpers from './splunk_helpers.js'

async function create_custom_configuration_file(
  splunk_js_sdk_service,
  api_url,
) {
  var custom_configuration_file_name = "setup_page_example";
  var stanza_name = "example_stanza";
  var properties_to_update = {
      api_url: api_url,
  };

  await SplunkHelpers.update_configuration_file(
      splunk_js_sdk_service,
      custom_configuration_file_name,
      stanza_name,
      properties_to_update,
  );
};

async function complete_setup(splunk_js_sdk_service) {
  var configuration_file_name = "app";
  var stanza_name = "install";
  var properties_to_update = {
      is_configured: 1,
  };

  await SplunkHelpers.update_configuration_file(
      splunk_js_sdk_service,
      configuration_file_name,
      stanza_name,
      properties_to_update,
  );
};

async function reload_splunk_app(
  splunk_js_sdk_service,
  app_name,
) {
  var splunk_js_sdk_apps = splunk_js_sdk_service.apps();
  await splunk_js_sdk_apps.fetch();

  var current_app = splunk_js_sdk_apps.item(app_name);
  current_app.reload();
};

async function save_api_keys(
  app_name, api_keys
) {
    var redirect_url = "../../custom/" + app_name + "/encrypt_creds/encrypt_creds"
    // var redirect_url = "../../custom/" + app_name + "/encrypt_creds/encrypt_creds?args="+JSON.stringify(api_keys);
    //window.location.href = redirect_url;
    // var redirect_url = "../../custom/" + app_name + "/encrypt_creds/encrypt_creds?args="+JSON.stringify(api_keys);
    // const response = await fetch(redirect_url);
    // const status = await response.json();
    const response = await httpGet(redirect_url, JSON.stringify(api_keys))
    return status
};

async function redirect_to_splunk_app_homepage(
  app_name,
) {

    var redirect_url = "../../custom/" + app_name + "/config_app/setup"
    const response = await fetch(redirect_url);
    const status = await response.json();
    return status
};


async function httpGet(url,key){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false );
    xmlHttp.setRequestHeader("Api-Keys",key);
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

function create_splunk_js_sdk_service(
  splunk_js_sdk,
  application_name_space,
) {
  var http = new splunk_js_sdk.SplunkWebHttp();

  var splunk_js_sdk_service = new splunk_js_sdk.Service(
      http,
      application_name_space,
  );

  return splunk_js_sdk_service;
};

export {
  create_custom_configuration_file,
  complete_setup,
  reload_splunk_app,
  save_api_keys,
  redirect_to_splunk_app_homepage,
  create_splunk_js_sdk_service,
}
