/*
 * Load the jquery.dataTables.js file from static if it isn't already loaded
 */
function loadStaticFile(filename) {
	if (filename.indexOf('.js') > 0) { //if filename is a external JavaScript file
		var fileref=document.createElement('script');
		fileref.setAttribute("type","text/javascript");
		fileref.setAttribute("src", '/static/app/Splunk_for_ActiveDirectory/' + filename);
	}
	else if (filename.indexOf('.css') > 0) { //if filename is an external CSS file
		var fileref=document.createElement("link");
		fileref.setAttribute("rel", "stylesheet");
		fileref.setAttribute("type", "text/css");
		fileref.setAttribute("href", '/static/app/Splunk_for_ActiveDirectory/' + filename);
	}
	if (typeof fileref != "undefined")
		document.getElementsByTagName("head")[0].appendChild(fileref);
}

var filesNeeded = [ 'jquery.dataTables.min.js', 'jquery.dataTables.css' ];
for (var i = 0 ; i < filesNeeded.length ; i++) {
	loadStaticFile(filesNeeded[i]);
}

/*
 * The MSADTopologyReport Module
 */
Splunk.Module.MSADTopologyReport = $.klass(Splunk.Module.DispatchingModule, {

	/**
	 * Initialize the Module
	 */
	initialize: function($super, container) {
		$super(container);

		this._container = container;
		this._titleField = this.getParam("titleField");
		this._drilldownPrefix = this.getParam('drilldownPrefix');
		this.firebug = this.parseBoolean(this.getParam('firebug'), false);
	},

	parseBoolean: function(o,d) {
		if (o !== null) {
			if (typeof o === "boolean")
				return o;
			if (typeof o === "string")
				switch (o.toLowerCase()) {
				case "1": case "t": case "true": case "enable": case "enabled": case "on":
					return true;
				case "0": case "f": case "false": case "disable": case "disabled": case "off":
					return false;
				}
		}
		return d;
	},
	
	/**
	 * Called when a downstream module requests updated context
	 */
	getModifiedContext: function(context) {
		var context = context || this.getContext();

		// For the fields in the row that is clicked, specify the $click.field$ values
		for (var fld in this._selection) {
			var ctxVar = this._drilldownPrefix + '.' + fld;
			context.set(ctxVar, this._selection[fld]);
		}

		return context;
	},

	isReadyForContextPush: function($super) {
		if (!this._selection) {
			return Splunk.Module.CANCEL;
		}
		return $super();
	},
	
    pushContextToChildren: function($super, explicitContext) {
        this.withEachDescendant(function(module) {
            module.dispatchAlreadyInProgress = false;
        });
        return $super(explicitContext);
    },
    
	/* Context Change Event Handler */
	onContextChange: function(evt) {
		this.getResults();
	},

	/* Jon in flight Event Handler */
	onJobProgress: function(evt) {
		this.getResults();
	},

	/* Job Completed Event Handler */
	onJobDone: function(evt) {
		this.getResults();
	},

	/* Reset the UI */
	resetUI: function() {
		$('#MSADTopologyReport', this._container).empty();
	},

	/* 
	 * Set the Parameters needed for this search to return.  We don't need
	 * need anything since the search returns JSON to us and we alert when
	 * it comes back with the wrong thing.
	 */
	getResultParams: function($super) {
		var params = $super();
		var context = this.getContext();

		var search  = context.get("search");
		var sid     = search.job.getSearchId();
		if (!sid) {
			console.error("MSADTopologyReport::getResultParams - Assertion Failed. getResultParams was called, but searchId is missing from my job.");
			this.logger.error(this.moduleType, "Assertion Failed. getResultParams was called, but searchId is missing from my job.")
		}
		params.sid = sid;

		// Handle post-processing
		var postprocess = search.getPostProcess();
		if (postprocess)
			params.postprocess = postprocess;

		return params;
	},

	/**
	 * Construct a Results Table object based on the rows received from the backend
	 */
	buildResultsTable: function() {
		this.tables = {};
		this.tableTitles = [];
		
		if (this.firebug) console.debug("Constructing Results Table Information");
		for (var i = 0 ; i < this.results.length ; i++) {
			if (this.firebug) console.debug("TitleField = %s.  Processing %o", this._titleField, this.results[i]);
			var title = this.results[i][this._titleField];
			if (!this.tables[title]) {
				this.tables[title] = [];
				this.tableTitles.push(title);
			}
			this.tables[title].push(this.results[i]);
		}
		if (this.firebug) {
			console.debug("Results Table Information: %o", this.tables);
			console.debug("Results Table List: %o", this.tableTitles);
		}
	},
	
	/**
	 * Renders a single table based on the data in the array of objects
	 */
	renderTable: function(data) {
		var html = '<table class="MSADTopology_DataTable">';

		// Append the Headers
		html += '<thead><tr>';
		html += '<th>Host</th>';
		html += '<th>Site</th>';
		html += '<th>Operating System</th>';
		html += '<th>Version</th>';
		html += '<th>Master Roles</th>';
		html += '<th>DSA Options</th>';
		html += '<th>Services</th>';
		html += '<th>DNS Registration</th>';
		html += '<th>SYSVOL Shared</th>';
		html += '</tr></thead>';
		
		// Handle the body of the table
		html += '<tbody>';
		for (var i = 0 ; i < data.length ; i++) {
			var row = data[i];
			
			html += '<tr>';
			html += '<td><span class="host' + row['Enabled'] + '">&nbsp;</span><span class="host">' + row['host'] + '</span></td>';
			html += '<td class="center">' + row['Site'] + '</td>';
			html += '<td class="center">' + row['OperatingSystem'] + '</td>';
			html += '<td class="center">' + row['OSVersion'] + '</td>';
			
			// FSMO Roles
			var aFSMO = row['FSMORoles'].split(' ');
			if (aFSMO.length == 0) {
				html += '<td>&nbsp;</td>';
			} else {
				for (var j = 0 ; j < aFSMO.length ; j++) {
					var role = aFSMO[j];
					aFSMO[j] = '<span class="image' + role + '">&nbsp;</span>';
				}
				html += '<td class="center fsmoroles"><div class="fsmoroles">' +aFSMO.join('<span class="imageSep">&nbsp;</span>') + '</div></td>';
			}
			
			// DSA Options (Enabled, GlobalCatalog, RODC)
			var aDSA = [];
			if (row['GlobalCatalog'] == 'True') aDSA.push('<span class="imageGlobalCatalog">&nbsp;</span>');
			if (row['RODC'] == 'True')			aDSA.push('<span class="imageRODC">&nbsp;</span>');
			if (aDSA.length == 0) {
				html += '<td>&nbsp;</td>';
			} else {
				html += '<td class="center dsaoptions"><div class="dsaoptions">' + aDSA.join('<span class="imageSep">&nbsp;</span>') + '</div></td>';
			}
			
			// ProcsOK
			html += '<td class="center truefalse"><div class="image' + row['ProcsOK'] + '">&nbsp;</div></td>';
			
			// DNSRegister
			html += '<td class="center truefalse"><div class="image' + row['DNSRegister'] + '">&nbsp;</div></td>';
			
			// SYSVOLShared
			html += '<td class="center truefalse"><div class="image' + row['SYSVOLShare'] + '">&nbsp;</div></td>';
			
			// End of Row
			html += '</tr>';
		}
		html += '</tbody>';
		
		// Finish off the table and return
		html += '</table>';
		return html;
	},
	
	/**
	 * Render the results of the search
	 */
	renderResults: function($super, searchResults) {
		if (searchResults.length == 0) {
			if (this.firebug) console.debug("MSADTopologyReport::renderResults: No search response yet");
			return;
		}
		
		// Parse the JSON results
		if (this.firebug) console.debug("MSADTopologyReport::renderResults: %s", searchResults);
		this.results = JSON.parse(searchResults);
		if (this.firebug) console.debug("MSADTopologyReport::renderResults: %o", this.results);

		// Build the results table
		this.buildResultsTable();
		
		// Reset the UI First
		this.resetUI();
		
		// For each table that we are going to render:
		//		1. Render a title
		//		2. Render the table for that title
		for (var i = 0 ; i < this.tableTitles.length ; i++) {
			var title = '<h2 class="title">' + this.tableTitles[i] + '</h2>';
			var table = this.renderTable(this.tables[this.tableTitles[i]]);
			
			$('#MSADTopologyReport', this._container).append(title, table);
		}
		
		// Create the data table
		$('#MSADTopologyReport > .MSADTopology_DataTable', this._container).dataTable({
			'oLanguage':	{
							'oPaginate':	{
											'sPrevious': "",
											'sNext': ""
											}
							}
		});
		
		// Link the click to the drill-down with $click.host$ being set
		var obj = this;
		$('tr', this._container).live('click', function() {
			var hostField = $('span.host', this).text();
			if (obj.firebug) console.debug("Host Field Clicked: %s", hostField);
			
			// Now, find the host within obj.results
			for (var i = 0 ; i < obj.results.length ; i++) {
				if (obj.results[i]['host'] === hostField) {
					obj._selection = obj.results[i];
					if (obj.firebug) console.debug("Firing Context Push for host %s", hostField)
					obj.pushContextToChildren();
					return;
				}
			}
			
			if (obj.firebug) console.error("ASSERTION FAIL: No host %s in results object", hostField);
		});
	}
});

