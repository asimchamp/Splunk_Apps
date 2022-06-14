// Define a fake require module "bootstrap_tagsinput" that wraps the
// non-require-compatible 3rd-party bootstrap_tagsinput.js JQuery plugin.
require.config({
    paths: {
        "bootstrap_tagsinput": "../app/digitalguardian_web/bootstrap_tagsinput",
    },
    shim: {
        "bootstrap_tagsinput": {
            deps: ["jquery"]
        }
    }
});

require([
    "splunkjs/ready!",
    "splunkjs/mvc/simplexml/ready!",
    "underscore",
    "../app/digitalguardian_web/filter_component",  // depends on bootstrap_tagsinput
    "../app/digitalguardian_web/context",
], function(
    mvc,
    ignored,
    _,
    FilterComponent,
    context
) {
    // Setup a custom contextual menu that appears when clicking on
    // the Trend chart, the Top Users table, and the Top Documents table.
    //
    // The contextual menu emits "click:menu" events on the root
    // document object when menuitems are selected.
    setupPopupMenus();

    // Listen for "click:menu" events and take the appropriate action,
    // usually adding items to the custom Filter Criteria panel.
    FilterComponent.initialize(mvc);

    // Refetch page every 5 minutes automatically
    window.setInterval(function() {
        window.location.reload();
    }, 5*60*1000);

    function setupPopupMenus() {
        var emailsByHourDay = mvc.Components.getInstance("emails_by_hour_day");
        var emailDetailsByHourDay = mvc.Components.getInstance("email_details_by_hour_day");
        var top10Computers = mvc.Components.getInstance("top_10_computers");
        var top10Users = mvc.Components.getInstance("top_10_users");
        var top10Applications = mvc.Components.getInstance("top_10_applications");
        var top10EmailDomains = mvc.Components.getInstance("top_10_email_domains");
        var top10RecipientTypes = mvc.Components.getInstance("top_10_recipient_types");
        var top10SourceDirectories = mvc.Components.getInstance("top_10_source_directories");
        var top10ExtensionsCount = mvc.Components.getInstance("top_10_extensions_count");
        var top10ExtensionsSize = mvc.Components.getInstance("top_10_extensions_size");

        var includeExcludeMenu = [
            {
                text: 'Include',
                splunk_action: 'include'
            },
            {
                text: 'Exclude',
                splunk_action: 'exclude'
            },
        ];

        var includeExcludeDrilldownMenu = _.clone(includeExcludeMenu);
        includeExcludeDrilldownMenu.push({
            text: 'Drilldown',
            splunk_action: 'drilldown',
            search: "index=`index_macro` sourcetype=`events_sourcetype` eventtype=egress_email $criteria$ | table _time Event_ID User_Name, Computer_Name, Application, Operation, Email_Domain, DNS_Hostname, Source_Directory, Source_File_Extension, Destination_Directory, Destination_File_Extension"
        })

        context.init({preventDoubleContext: false});
        context.attachToChart(emailDetailsByHourDay, includeExcludeMenu);
        context.attachToChart(emailsByHourDay, includeExcludeDrilldownMenu);
        context.attachToTable(top10Computers, includeExcludeDrilldownMenu);
        context.attachToTable(top10Users, includeExcludeDrilldownMenu);
        context.attachToTable(top10Applications, includeExcludeDrilldownMenu);
        context.attachToTable(top10EmailDomains, includeExcludeDrilldownMenu);
        context.attachToTable(top10SourceDirectories, includeExcludeDrilldownMenu);
        context.attachToTable(top10RecipientTypes, includeExcludeDrilldownMenu);
        context.attachToTable(top10ExtensionsSize, includeExcludeDrilldownMenu);
        context.attachToTable(top10ExtensionsCount, includeExcludeDrilldownMenu);
    }
});
