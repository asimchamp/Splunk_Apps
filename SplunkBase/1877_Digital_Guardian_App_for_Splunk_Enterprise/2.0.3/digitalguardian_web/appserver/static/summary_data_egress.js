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
        var dataEgressByChannel = mvc.Components.getInstance("data_egress_by_channel");
        var top10Users = mvc.Components.getInstance("top_10_users");
        var top10Computers = mvc.Components.getInstance("top_10_computers");
        var top10Applications = mvc.Components.getInstance("top_10_applications");

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
            search: "index=`index_macro` sourcetype=`events_sourcetype` eventtype=egress_* $criteria$ | table _time Event_ID User_Name, Computer_Name, Application, Operation, Email_Domain, DNS_Hostname, Source_Directory, Source_File_Extension, Destination_Directory, Destination_File_Extension"
        })

        context.init({preventDoubleContext: false});
        context.attachToChart(dataEgressByChannel, includeExcludeDrilldownMenu);
        context.attachToTable(top10Users, includeExcludeDrilldownMenu);
        context.attachToTable(top10Computers, includeExcludeDrilldownMenu);
        context.attachToTable(top10Applications, includeExcludeDrilldownMenu);
    }
});
