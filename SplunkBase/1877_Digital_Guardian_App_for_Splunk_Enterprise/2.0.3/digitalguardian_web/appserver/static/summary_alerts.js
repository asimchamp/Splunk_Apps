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
        var alertsByDay = mvc.Components.getInstance("alerts_by_day");
        var top10Computers = mvc.Components.getInstance("top_10_computers");
        var top10Users = mvc.Components.getInstance("top_10_users");
        var top10Applications = mvc.Components.getInstance("top_10_applications");
        var top10Operations = mvc.Components.getInstance("top_10_operations");
        var top10Rules = mvc.Components.getInstance("top_10_rules");
        var top10Policies = mvc.Components.getInstance("top_10_policies");

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
            search: "index=`index_macro` sourcetype=`alerts_sourcetype` $criteria$ | table _time Event_ID User_Name, Computer_Name, Application, Operation, Email_Domain, DNS_Hostname, Source_Directory, Source_File_Extension, Destination_Directory, Destination_File_Extension"
        })

        context.init({preventDoubleContext: false});
        context.attachToChart(alertsByDay, includeExcludeMenu);
        context.attachToTable(top10Computers, includeExcludeDrilldownMenu);
        context.attachToTable(top10Users, includeExcludeDrilldownMenu);
        context.attachToTable(top10Applications, includeExcludeDrilldownMenu);
        context.attachToTable(top10Operations, includeExcludeDrilldownMenu);
        context.attachToTable(top10Rules, includeExcludeDrilldownMenu);
        context.attachToTable(top10Policies, includeExcludeDrilldownMenu);
    }
});
