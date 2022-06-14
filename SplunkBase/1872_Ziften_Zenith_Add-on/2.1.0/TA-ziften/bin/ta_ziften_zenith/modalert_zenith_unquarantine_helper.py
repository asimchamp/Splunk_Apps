
# encoding = utf-8

def process_event(helper, *args, **kwargs):
    """
    # IMPORTANT
    # Do not remove the anchor macro:start and macro:end lines.
    # These lines are used to generate sample code. If they are
    # removed, the sample code will not be updated when configurations
    # are updated.

    [sample_code_macro:start]

    # The following example gets the setup parameters and prints them to the log
    zenith_ar_management_host_ip = helper.get_global_setting("zenith_ar_management_host_ip")
    helper.log_info("zenith_ar_management_host_ip={}".format(zenith_ar_management_host_ip))
    zenith_ar_username = helper.get_global_setting("zenith_ar_username")
    helper.log_info("zenith_ar_username={}".format(zenith_ar_username))
    zenith_ar_api_key = helper.get_global_setting("zenith_ar_api_key")
    helper.log_info("zenith_ar_api_key={}".format(zenith_ar_api_key))

    # The following example gets the alert action parameters and prints them to the log
    zenith_ar_agent_guid = helper.get_param("zenith_ar_agent_guid")
    helper.log_info("zenith_ar_agent_guid={}".format(zenith_ar_agent_guid))

    zenith_ar_host_ip = helper.get_param("zenith_ar_host_ip")
    helper.log_info("zenith_ar_host_ip={}".format(zenith_ar_host_ip))


    # The following example adds two sample events ("hello", "world")
    # and writes them to Splunk
    # NOTE: Call helper.writeevents() only once after all events
    # have been added
    helper.addevent("hello", sourcetype="ziften:zenith:adaptiveresponse")
    helper.addevent("world", sourcetype="ziften:zenith:adaptiveresponse")
    helper.writeevents(index="summary", host="localhost", source="localhost")

    # The following example gets the events that trigger the alert
    events = helper.get_events()
    for event in events:
        helper.log_info("event={}".format(event))

    # helper.settings is a dict that includes environment configuration
    # Example usage: helper.settings["server_uri"]
    helper.log_info("server_uri={}".format(helper.settings["server_uri"]))
    [sample_code_macro:end]
    """
    helper.log_info("Alert action Zenith Un-Quarantine Windows System")
        
    extension_name = "Un-Quarantine Windows System"
    agent_guid = ""
    extension_id = ""
        
    TADIR = make_splunkhome_path(["etc","apps","TA-ziften"])
    systems_file = TADIR + "/lookups/systems.csv"
    extensions_file = TADIR + "/lookups/extensionmap.csv"
    
    zenith_ar_config_host = helper.get_global_setting("zenith_ar_management_host_ip")
    zenith_ar_config_name = helper.get_global_setting("zenith_ar_username")
    zenith_ar_config_key = helper.get_global_setting("zenith_ar_api_key")

    zc = ZiftenConnector(zenith_ar_config_name, zenith_ar_config_key, zenith_ar_config_host)

    
    agent_guid = helper.get_param("zenith_ar_agent_guid")
    hostname = helper.get_param("zenith_ar_host_ip")
    
    f = open(extensions_file, 'rt')
    try:
        reader = csv.reader(f)
        for row in reader:
            if row[1] == extension_name:
                extension_id = row[0]
    finally:
        f.close()
    
    if extension_id == "" :
        helper.log_info("Extension Not Found")
        exit(-1)
        
    #Change user input hostname/ip through lookup file
    if (agent_guid == ""):
        f = open(systems_file, 'rt')
        try:
            reader = csv.reader(f)
            for row in reader:
                print row[2]
                if row[2] == hostname:
                    agent_guid = row[0]
                    agent_guid = agent_guid[1:-1]
            print agent_guid
        finally:
            f.close()
        

    if agent_guid == "" :
        helper.log_info("Agent GUID Not Found")
        exit(-1)
    
    
    uri = "/actions?action_type_id=" + extension_id + "&agent_guid=" + agent_guid 
    print uri
    result = zc.callAPI("POST",uri,"")
    print result.getcode()

    return 0

