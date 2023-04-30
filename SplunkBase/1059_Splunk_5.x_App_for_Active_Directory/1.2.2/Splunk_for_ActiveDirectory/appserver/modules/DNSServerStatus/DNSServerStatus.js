/**
 * Module:			DNSServerStatus
 * Search Input:
 * 		Single row from the msad-dns-health information
 * Display:
 * 		Table with the server status
 * Parameters:
 * 		firebug		true/false		Determines if the debug output is generated.
 */
Splunk.Module.DNSServerStatus = $.klass(Splunk.Module.DispatchingModule, {
	
	/**
	 * ServiceLookup			Convert the names for services to friendly names
	 */
	servicesLookup: 	{
		'DNS':			'Domain Name Service',
		'Dnscache':		'DNS Client',
		'w32time':		'Windows Time'
	},
	
	// Flag for making firebug work
	firebug: true,
	
	/**
	 * Entry point for the module.  Initialization routine
	 */
	initialize:			function($super, container) {
		$super(container);
		this._container = container;
	},
	
	/**
	 * Event Handler for context changes
	 */
	onContextChange: 	function(evt) { this.getResults(); },
	
	/**
	 * Event Handler for job completion
	 */
	onJobDone: 			function(evt) { this.getResults(); },

	/**
	 * Reset the UI
	 */
	resetUI:			function() { $('#DNSServerStatusWrapper', this._container).empty(); },
	
	/**
	 * Insert parameters into the request to the back-end
	 */
	getResultParams: function($super) {
		var params = $super();
		var context = this.getContext();
		var search = context.get("search");
		
		// Search ID
		var sid = search.job.getSearchId();
		if (!sid) {
			console.error("DNSServerStatus::dispatch - Assertion (SearchId) in getResultParams");
		}
		params.sid = sid;
		
		// Post Processing
		if (search.getPostProcess())
			params.postprocess = search.getPostProcess();
		
		return params;
	},

	renderResults: function($super, jsonResponse) {
		if (this.firebug) console.debug("DNSServerStatus:: Entering renderResults: %s", jsonResponse);
		this.results = JSON.parse(jsonResponse);
		if (this.firebug) console.debug("DNSServerStatus:: Rendering Results %o", this.results);
		
		// Internal to rendering functions
		var makeRow = function(col1,col2) { return '<tr><td class="col1">' + col1 + '</td><td class="col2">' + col2 + '</td></tr>'; };
		var makeUrl = function(url,val)   { return '<a href="' + url + val + '">' + val + '</a>'; };
		var makeLnk = function(url,val)	  { return '<a href="' + url + '">' + val + '</a>'; };
		var divider = function()          { return '<tr class="divider"><td colspan="2">&nbsp;</td></tr>'; };
		var makeImg = function(img)		  { return '<span class="image' + img + '"/>'; };
		var makeRevImg = function(f) { if (f == "False") { return makeImg("True"); } else { return makeImg("False"); }};
		
		var row  = this.results[0];
				
		var ServiceList = {};
		var ServicesRunning = row['ServicesRunning'].split(",");
		for (var i = 0 ; i < ServicesRunning.length ; i++) {
			if (ServicesRunning[i] && ServicesRunning[i].length > 0) {
				ServiceList[ServicesRunning[i]] = "ServiceUp";
			}
		}
		var ServicesNotRunning = row['ServicesNotRunning'].split(",");
		for (var i = 0 ; i < ServicesNotRunning.length ; i++) {
			if (ServicesNotRunning[i] && ServicesNotRunning[i].length > 0) {
				ServiceList[ServicesNotRunning[i]] = "ServiceDown";
			}
		}
		// We now have a list of Services that are named with a true/false based on if they are running or not
		serviceRow = '<table class="svc_table"><tbody>';
		var keys = Object.keys(ServiceList).sort();
		for (var i = 0 ; i < keys.length ; i++) {
			serviceRow += '<tr><td class="svc_name">' + this.servicesLookup[keys[i]] + '</td><td class="svc_status">' + makeImg(ServiceList[keys[i]]) + '</td></tr>';
		}
		serviceRow += '</tbody></table>';

		// Start the rendering in a collecting variable
		var html = '<table class="DNSServerStatus_Table"><tbody>';

		// Block 1 - Basic Information
		html += makeRow('Server', row['Server']);
		html += makeRow('DNS Name', row['Name']);
		html += divider();

		// Block 2 - OS Information
		html += makeRow('Operating System', row['OperatingSystem']);
		html += makeRow('Service Pack', row['ServicePack']);
		html += makeRow('OS Version', row['OSVersion']);
		html += divider();

		// Block 3 - Settings
		html += makeRow('Directory Available', makeImg(row['DsAvailable']));
		html += makeRow('Auto Reverse Zones', makeRevImg(row['DisableAutoReverseZones']));
		html += makeRow('Auto Cache Update', makeImg(row['AutoCacheUpdate']));
		html += makeRow('Recursion', makeRevImg(row['NoRecursion']));
		html += makeRow('Round Robin', makeImg(row['RoundRobin']));
		html += makeRow('Local Net Priority', makeImg(row['LocalNetPriority']));
		html += makeRow('Strict File Parsing', makeImg(row['StrictFileParsing']));
		html += makeRow('Loose Wildcards', makeImg(row['LooseWildcarding']));
		html += makeRow('Bind Secondaries', makeImg(row['BindSecondaries']));
		html += makeRow('Write Authoritive NS', makeImg(row['WriteAuthorityNS']));
		html += makeRow('Secure Responses', makeImg(row['SecureResponses']));
		html += makeRow('Allow Disjoint Networks', makeImg(row['DisjointNets']));
		html += makeRow('Enable EDNS Probes', makeImg(row['EnableEDnsProbes']));
		html += makeRow('Is A Slave', makeImg(row['IsSlave']));
		html += divider();
		
		// Block 4 - Services
		html += '<tr><td class="services">Services</td><td class="col2">' + serviceRow + '</td></tr>';

		html += '</tbody></table>';
		$('#DNSServerStatusWrapper', this._container).html(html);
	}
});
