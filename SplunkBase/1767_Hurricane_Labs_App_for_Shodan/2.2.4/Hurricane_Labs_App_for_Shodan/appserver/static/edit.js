var app_name = "./Hurricane_Labs_App_for_Shodan";

require.config({
    paths: {
        ModalView: "../app/" + app_name + "/components/ModalView",
    },
});

require([
    'underscore',
    'backbone',
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/searchmanager',
    'ModalView',
    'splunkjs/mvc/simplexml/ready!'
], function(_, Backbone, $, mvc, SearchManager, ModalView) {

    var tokens = mvc.Components.get("submitted");

	var eventBus = _.extend({}, Backbone.Events);
	var lookupTable = mvc.Components.get("lookupTable");
	var lookupSearch = mvc.Components.get("lookupSearch");
	var removeRow = mvc.Components.get("removeRow");
	var addRow = mvc.Components.get("addRow");
	var updateRow = mvc.Components.get("updateRow");
	var current_role = '';

	var updateShodanList = new SearchManager({
		id: "updateShodanList",
		preview: true,
		cache: true,
		autostart: false,
		search: "| getshodan [|inputlookup shodan_my_subnets | stats values(ipAddress) AS ips | eval netlist=mvjoin(ips, \",\")  | table netlist] | outputlookup shodan_output"
	});

	var clearShodanList = new SearchManager({
		id: "clearShodanList",
		preview: true,
		cache: true,
		autostart: false,
		search: "| outputlookup shodan_output"
	});

	var checkJSON = new SearchManager({
		id: "checkShodanJSON",
		preview: true,
		cache: true,
		autostart: false,
		search: "| inputlookup shodan_output"
	});

	$(document).find('.dashboard-body').append('<button id="addNewRow" class="btn btn-primary">Add New</button>');

	$(document).on('click', '#addNewRow', function(e) {

		e.preventDefault();

		var obj = [{ "title" : "Add New Row", "row.Is Critical?" : "", "row.Description" : "", "row.IP Address" : "" }];

		var modal = new ModalView({ object : obj, eventBus : eventBus, mode : 'New' });
		modal.show();

	});

	lookupTable.on("click", function(e) {
        e.preventDefault();
		var target = $(e.data)[0]["click.value2"];

		if(target === 'Edit') {
			tokens.set('key_tok_update',$(e.data)[0]['row.key']);
			var modal = new ModalView({ object : $(e.data), eventBus : eventBus, mode : 'Edit' });
			modal.show();
		}

		if(target === 'Remove') {
			tokens.set('ip_address_remove_tok', $(e.data)[0]['row.IP Address']);
			tokens.set('critical_remove_tok', $(e.data)[0]['row.Is Critical?']);
			tokens.set('description_remove_tok',$(e.data)[0]['row.Description']);
			tokens.set('key_tok_remove',$(e.data)[0]['row.key']);
		}

    });

	checkJSON.startSearch();
	$(document).find("#shodanDataStatus").html("<span class=\"grey\">Checking Status...</span>");

	checkJSON.on("search:done", function(props) {
		if(props.content.resultCount === 0) {
			$(document).find("#shodanDataStatus").html("<span class=\"warn\">It looks like data has not been added to the shodan_output KV Store yet." +
			" You can try to <a href='/manager/Hurricane_Labs_App_for_Shodan/saved/searches?app=Hurricane_Labs_App_for_Shodan'>rerun the saved search</a>.</span>");
		} else {
			$(document).find("#shodanDataStatus").html("<span class=\"success\">Everything is up to date.</span>");
		}
	});

	addRow.on("search:done", function(props) {
		lookupSearch.startSearch();
		$(document).find("#shodanDataStatus").html("<span class=\"grey\">Syncing data...</span>");
	});

	removeRow.on("search:done", function(props) {
		lookupSearch.startSearch();
		$(document).find("#shodanDataStatus").html("<span class=\"grey\">Syncing data...</span>");
	});

	updateRow.on("search:done", function(props){
		lookupSearch.startSearch();
		$(document).find("#shodanDataStatus").html("<span class=\"grey\">Syncing data...</span>");
	});

	updateShodanList.on("search:done", function(props) {
		checkJSON.startSearch();
	});


	lookupSearch.on("search:done", function(props) {
		updateShodanList.startSearch();		
	});

	eventBus.on("add:row", function(e) {
		addRow.startSearch();
	});

	eventBus.on("update:row", function(e) {
		updateRow.startSearch();
	});

});