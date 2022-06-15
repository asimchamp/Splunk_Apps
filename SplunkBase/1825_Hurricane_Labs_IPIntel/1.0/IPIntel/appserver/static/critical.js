require.config({
    paths: {
        dns_cell_renderer: '../app/IPIntel/cell_renderers/DNSCellRenderer'
    }
});
require.config({
    paths: {
        port_cell_renderer: '../app/IPIntel/cell_renderers/PortCellRenderer'
    }
});
require.config({
    paths: {
        et_cell_renderer: '../app/IPIntel/cell_renderers/EmergingThreatsCellRenderer'
    }
});
require.config({
    paths: {
        et_cell_renderer: '../app/IPIntel/cell_renderers/EmergingThreatsCellRenderer'
    }
});
require.config({
    paths: {
        blacklists_cell_renderer: '../app/IPIntel/cell_renderers/BlacklistsCellRenderer'
    }
});
require.config({
    paths: {
        cins_cell_renderer: '../app/IPIntel/cell_renderers/CINSCellRenderer'
    }
});

require(['jquery','underscore','splunkjs/mvc', 'dns_cell_renderer', 'port_cell_renderer', 'et_cell_renderer', 'blacklists_cell_renderer', 'cins_cell_renderer', 'splunkjs/mvc/simplexml/ready!'],
    function($, _, mvc, DNSCellRenderer, PortCellRenderer, EmergingThreatsCellRenderer, BlacklistsCellRenderer, CINSCellRenderer){
        //Define Components
        var dnsTable = mvc.Components.get('element3');
        var portTable = mvc.Components.get('element4');
        var etTable = mvc.Components.get('element5');
        var blacklistsTable = mvc.Components.get('element6');
        var cinsTable = mvc.Components.get('element7');
        //Table Renders
        dnsTable.getVisualization(function(tableView){
            tableView.table.addCellRenderer(new DNSCellRenderer());
            tableView.table.render();
        });
        portTable.getVisualization(function(tableView){
            tableView.table.addCellRenderer(new PortCellRenderer());
            tableView.table.render();
        });
        etTable.getVisualization(function(tableView){
            tableView.table.addCellRenderer(new EmergingThreatsCellRenderer());
            tableView.table.render();
        });
        blacklistsTable.getVisualization(function(tableView){
            tableView.table.addCellRenderer(new BlacklistsCellRenderer());
            tableView.table.render();
        });
        cinsTable.getVisualization(function(tableView){
            tableView.table.addCellRenderer(new CINSCellRenderer());
            tableView.table.render();
        });
    }
);
