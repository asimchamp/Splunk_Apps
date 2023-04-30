/**
 * Module:			MSADServerStatus
 * Search Input:
 * 		Single row from the msad-dc-health information
 * Display:
 * 		Table with the server status
 * Parameters:
 * 		firebug		true/false		Determines if the debug output is generated.
 */
Splunk.Module.MSADServerStatus = $.klass(Splunk.Module.DispatchingModule, {
	
	/**
	 * ServiceLookup			Convert the names for services to friendly names
	 */
	servicesLookup: 	{
		'dfsr':			'Distributed File Replication',
		'ismserv':		'Intersite Messaging',
		'ntfrs':		'NT File Replication',
		'kdc':			'Kerberos Distribution',
		'netlogon':		'Network Logon',
		'w32time':		'Windows Time'
	},
	
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
	resetUI:			function() { $('#MSADServerStatusWrapper', this._container).empty(); },
	
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
			console.error("MSADServerStatus::dispatch - Assertion (SearchId) in getResultParams");
		}
		params.sid = sid;
		
		// Post Processing
		if (search.getPostProcess())
			params.postprocess = search.getPostProcess();
		
		return params;
	},

	renderResults: function($super, jsonResponse) {
		if (this.firebug) console.debug("MSADServerStatus:: Entering renderResults: %s", jsonResponse);
		this.results = JSON.parse(jsonResponse);
		if (this.firebug) console.debug("MSADServerStatus:: Rendering Results %o", this.results);
		
		// Internal to rendering functions
		var makeRow = function(col1,col2) { return '<tr><td class="col1">' + col1 + '</td><td class="col2">' + col2 + '</td></tr>'; };
		var makeUrl = function(url,val)   { return '<a href="' + url + val + '">' + val + '</a>'; };
		var makeLnk = function(url,val)	  { return '<a href="' + url + '">' + val + '</a>'; };
		var divider = function()          { return '<tr class="divider"><td colspan="2">&nbsp;</td></tr>'; };
		var makeImg = function(img)		  { return '<span class="image' + img + '"/>'; };
		
		var row  = this.results[0];
		
		// Compute some specific fields
		var dsaOptions = makeImg('Enabled');
		if (row['RODC'] === 'True') 			dsaOptions += ' ' + makeImg('RODC');
		if (row['GlobalCatalog'] === 'True')	dsaOptions += ' ' + makeImg('GlobalCatalog');
		
		var aFSMORoles = row['FSMORoles'].split(" ");
		var blk_roles = [];
		for (var i = 0 ; i < aFSMORoles.length ; i++) {
			blk_roles.push(makeImg(aFSMORoles[i]));
		}
		
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
		var html = '<table class="MSADServerStatus_Table"><tbody>';

		// Block 1 - Basic Information
		html += makeRow('Server', makeUrl('ops_domain_status?DomainNetBIOSName=', row['DomainNetBIOSName']) + ' \\ ' + row['Server']);
		html += makeRow('Domain', makeUrl('ops_domain_status?DomainNetBIOSName=', row['DomainNetBIOSName']) + ' \\ ' + makeLnk('ops_domain_status?DomainNetBIOSName='+row['DomainNetBIOSName'], row['DomainDNSName']));
		html += makeRow('Site',   makeUrl('ops_site_status?Site=', row['Site']));
		html += makeRow('Forest', makeUrl('ops_forest_status?ForestName=', row['ForestName']));
		html += divider();

		// Block 2 - OS Information
		html += makeRow('Operating System', row['OperatingSystem']);
		html += makeRow('Service Pack', row['ServicePack']);
		html += makeRow('OS Version', row['OSVersion']);

		// Block 3 - Domain Controller Information
		html += makeRow('DSA Options', dsaOptions);
		html += makeRow('Master Roles', blk_roles.join('&nbsp;'));
		html += makeRow('Highest USN', row['HighestUSN']);
		html += makeRow('Schema Version', row['SchemaVersion'] + ' (' + row['SchemaName'] + ')');
		html += divider();

		html += '<tr><td class="services">Services</td><td class="col2">' + serviceRow + '</td></tr>';
		html += makeRow('SYSVOL is Shared', makeImg(row['SYSVOLShare']));
		html += makeRow('Registered in DNS', makeImg(row['DNSRegister']));

		html += '</tbody></table>';
		$('#MSADServerStatusWrapper', this._container).html(html);
	}
});
