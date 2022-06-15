/**
 * Module Javascript for ColumnSelector
 * Copyright (C) 2012 Splunk, Inc.
 * All Rights Reserved
 */
Splunk.Module.ColumnSelector = $.klass(Splunk.Module.DispatchingModule, {
	/**
	 * Called then the module first initializes.
	 */
	initialize: function($super, container) {

		// Call the super class
		$super(container);
		this._container = $('#'+container.id + '> #ColumnSelectorWrapper');
		this.defaults = {
				count:				5,
				drilldownPrefix:	'click',
				autoSelector:		'none',
				defaultSelected:	true,
				loadFromCookie:		false,
				cookieName:			'ColumnSelector'
		};

		// Grab the parameters from the module definition
		this.defaults['count'] 				= parseInt(this.getParam("count"));
		this.defaults['drilldownPrefix'] 	= this.getParam("drilldownPrefix");
		this.defaults['autoSelector']  		= this.getParam("autoSelector");
		this.defaults['defaultSelected']	= this.toBoolean(this.getParam("defaultState"), true);
		this.defaults['loadFromCookie']		= this.toBoolean(this.getParam("loadFromCookie"), false);
		this.defaults['cookieName']			= this.getParam('cookieName');
		this.columnDefinitions = this.getParam("columns");

		// Ensure autoSelector is correct
		var autoSelectorValidValues = [ 'none', 'rtl', 'ltr', 'both'];
		if (this.defaults.autoSelector == null) {
			this.defaults.autoSelector = 'none';
		} else if (autoSelectorValidValues.indexOf(this.defaults.autoSelector) == -1) {
			alert("ColumnSelector: autoSelector has a bad value - setting to 'none'");
			this.defaults.autoSelector = 'none';
		}

		// If there is an index param, then it's a weighting for the column order.  Lower
		// numbered indices get pushed first, with later indices pushed last.  If there
		// is no index, then the index is 65535
		var columnSort = [];
		for (var column in this.columnDefinitions) {
			// If there is no weight, then add one specifically
			if (!this.columnDefinitions[column].hasOwnProperty("weight")) {
				this.columnDefinitions[column].weight = 65535;
			} else {
				this.columnDefinitions[column].weight = parseInt(this.columnDefinitions[column].weight)
			}

			// If there is no title, make it the same as the name
			if (!this.columnDefinitions[column].hasOwnProperty("title")) {
				this.columnDefinitions[column].title = column;
			}

			// Establish the primary columnSort field for sorting.
			columnSort.push(this.columnDefinitions[column].weight.toString() + "," + column);
		}

		// We've established a columnSort field that contains both the weight and the name,
		// so we can sort on both.  Sort on weight then name, and then put the results into
		// a list of only the names.
		columnSort.sort(this.columnSortFunction);
		this.columnSort = [];
		for (var i = 0 ; i < columnSort.length ; i++) {
			var vArr = columnSort[i].split(",");
			this.columnSort.push(vArr[1]);
		}

		// Create the basic layout for the control.  This will be devoid of data, but will have the
		// selects and the titles.
		var columnWidth = 100 / this.columnSort.length; 
		for (var i = 0 ; i < this.columnSort.length ; i++) {
			// Create the containing DIV for the column
			var coldiv = $('<div/>').attr("id", "COL_" + i).addClass("column").width(columnWidth+'%');
			var titlediv = $('<div/>').addClass("columntitle").text(this.columnDefinitions[this.columnSort[i]].title);
			var selectdiv = $('<select/>').attr("id", "SELECT_"+i).attr("size",this.defaults.count).attr("multiple","multiple").addClass("columnselect");
			coldiv.append(titlediv); coldiv.append(selectdiv);
			this._container.append(coldiv);
		}
	}, /* initialize() */

	/**
	 * Sort function for the column sort
	 */
	columnSortFunction: function(a,b) {
		var aArr = a.split(",");
		var bArr = b.split(",");

		var aIndex = parseInt(aArr[0]);
		var bIndex = parseInt(bArr[0]);
		if (aIndex < bIndex) {
			return -1;
		}
		if (aIndex > bIndex) {
			return 1;
		}

		// If aIndex == bIndex, we turn to aArr[1] and bArr[1]
		return a.localeCompare(b);

	}, /* columnSortFunction */

	/**
	 * Event handler for handling when the context changes
	 */
	onContextChange: function(evt) {
		this.getResults();
	}, /* onContextChange() */

	/**
	 * Event handler for handling when the upstread search is complte
	 */
	onJobDone: function(evt) {
		this.getResults();
	}, /* onJobDone() */

	/**
	 * Called when the UI needs to completely reset
	 */
	resetUI: function() {

		var optlist = $('.columnselect', this._container).find('option');

		if (optlist.length > 0) {
			optlist.remove();
		}
	}, /* resetUI() */

	/** 
	 * Set the Parameters needed for this search to return.  We don't need
	 * need anything since the search returns JSON to us and we alert when
	 * it comes back with the wrong thing.
	 */
	getResultParams: function($super) {
		var params = $super();
		var context = this.getContext();

		var search  = context.get("search");
		var sid     = search.job.getSearchId();

		if (!sid) this.logger.error(this.moduleType, "Assertion Failed. getResultParams was called, but searchId is missing from my job.")
		params.sid = sid;

		// Handle post-processing
		var postprocess = search.getPostProcess();
		if (postprocess)
			params.postprocess = postprocess;
		return params;
	}, /* getResultParams() */

	/**
	 * Called when the results are in and we need to render the UI
	 */
	renderResults: function($super, jsonResponse) {

		// Our first order of business is to clean out the old data (if any)
		for (var key in this.columnDefinitions) {
			if (this.columnDefinitions[key].hasOwnProperty("data")) {
				delete this.columnDefinitions[key].data;
			}			
		}

		// Next, we convert the data we got into the data objects
		this.searchResults = JSON.parse(jsonResponse);
		for (var i = 0 ; i < this.searchResults.length ; i++) {
			for (var key in this.searchResults[i]) {
				if (this.columnDefinitions.hasOwnProperty(key)) {
					this.addToColumn(key, this.searchResults[i][key]);
				}
			}
		}

		// Remove all the existing entries from our UI
		this.resetUI();

		// Load the cookie.
		var cookieData = this.loadFromCookie();

		// For each column, add in the options.
		for (var i = 0 ; i < this.columnSort.length ; i++) {
			var column = this.columnSort[i];
			var data   = this.columnDefinitions[column].data.sort();
			for (var j = 0 ; j < data.length ; j++) {
				var opt = $('<option/>').attr("value", data[j]).text(data[j]);

				// Default value for this option.
				//		1 - if specified on the URL, then select it
				//		2 - if specified in the COOKIE, then select it
				//		3 - if #1 and #2 are not met, then use the 
				var selected = this.defaults.defaultSelected;
				if (cookieData != null) {
					selected = (cookieData[column].indexOf(data[j]) != -1);
				}

				if (selected) {
					opt.attr("selected", "selected");
				}
				$('#SELECT_'+i, this._container).append(opt);

				// While we are in this loop, let's wire our selection change code
				// into the SELECT box.  Note that the event is not fired within
				// the context of the object, so we need to pass the object as well.
				var obj = this;
				$('#SELECT_'+i, this._container).change(function(evt) { obj.onSelectionChange(evt); });
			}
		}

		// Finally, we need to push the context to the downstream modules
		this.pushContextToChildren();
	}, /* renderResults() */

	/**
	 * Event Handler for when a selection changes
	 */
	onSelectionChange: function(evt) {

		// We need to ensure we don't "over-event" ourselves.  We do this by setting the
		// inChangeHandler on the current object.
		if (this.inSelectionChangeHandler == true) {
			return;
		}
		this.inSelectionChangeHandler = true;

		// Find the column # that we are in
		var column = parseInt(evt.target.id.replace('SELECT_', ''));
		var columnName = this.columnSort[column];

		// Obtain the current Selection
		var currentSelection = [];
		for (var i = 0 ; i < evt.target.options.length ; i++) {
			if (evt.target.options[i].selected === true) {
				currentSelection.push(evt.target.options[i].value);
			}
		}

		// There are multiple types of selection, controlled by the autoSelector parameter
		//		autoSelector = none
		//			When a selection is made, just that selection is made - no other
		//			adjustments are done
		//		autoSelector = ltr
		//			When a selection is made, do a search on the original search results,
		//			and select anything to the right that matches
		//		autoSelector = rtl
		//			When a selection is made, do a search on the original search results,
		//			and select anything to the left that matches
		//		autoSelector = both
		//			When a selection is made, do a search on the original search results,
		//			and select anything in both directions that matches
		if (this.defaults.autoSelector != 'none') {
			var selectionResults = [];
			for (var i = 0 ; i < this.searchResults.length ; i++) {
				if (currentSelection.indexOf(this.searchResults[i][columnName]) != -1) {
					selectionResults.push(this.searchResults[i]);
				}
			}

			// Handle LTR autoSelector
			if (this.defaults.autoSelector == 'ltr' || this.defaults.autoSelector == 'both') {
				if (column == (this.columnSort.length - 1)) {
				} else {
					for (var c = column+1 ; c < this.columnSort.length ; c++) {
						var columnName = this.columnSort[c];
						var selectionSlice = selectionResults.map(function(x) { return x[columnName]; });
						$('#SELECT_'+c+' option', this._container).each(function() { this.selected = (selectionSlice.indexOf($(this).val()) != -1); });
					}
				}
			}

			// Handle RTL autoSelector
			if (this.defaults.autoSelector == 'rtl' || this.defaults.autoSelector == 'both') {
				if (column == 0) {
				} else {
					for (var c = column-1 ; c >= 0 ; c--) {
						var columnName = this.columnSort[c];
						var selectionSlice = selectionResults.map(function(x) { return x[columnName]; });
						$('#SELECT_'+c+' option', this._container).each(function() { this.selected = (selectionSlice.indexOf($(this).val()) != -1); });
					}
				}
			}
		}

		// Push the Context to the Child Modules.
		this.pushContextToChildren();

		// Store in the cookie
		if (this.defaults.loadFromCookie) 
			this.saveToCookie();

		// Reset the inSelectionChangeHandler
		this.inSelectionChangeHandler = false;
	},

	/**
	 * Called by downstream (child) modules to determine the new context.  The context is
	 * 
	 * 1) click.field = '<field>!="*"' if there are no selections
	 * 2) click.field = 'field="<val>" if there is one selection
	 * 3) click.field = '(field="<val1>" OR field="<val2>") if there is more than one selection
	 */
	getModifiedContext: function(context) {
		var context = context || this.getContext();

		for (var c = 0 ; c < this.columnSort.length ; c++) {
			var colName = this.columnSort[c];
			var colSelection = [];
			$('#SELECT_'+c+' option:selected', this._container).each(function() { colSelection.push(colName + '="' + $(this).val() + '"'); });

			var vCtx = this.defaults.drilldownPrefix+'.'+colName;
			var lCtx = colName + '!="*"';
			if (colSelection.length > 0) {
				lCtx = '(' + colSelection.join(' OR ') + ')';
			}
			context.set(vCtx, lCtx);
		}

		return context;
	},

	/**
	 * called when we have to send new context data to downstream modules.
	 */
	pushContextToChildren: function($super, explicitContext) {
		this.withEachDescendant(function(module) {
			module.dispatchAlreadyInProgress = false;
		});
		return $super(explicitContext);
	},	

	/**
	 * called to load the data from cookie.  If the cookie does not exist, then return
	 * null, otherwise return an object with column names and the settings.
	 */
	loadFromCookie: function() {
		if (this.defaults.loadFromCookie === false)
			return null;

		var cookieJar = document.cookie.split(";");
		var thisCookie = this.defaults.cookieName + '=';
		for (var i=0 ; i < cookieJar.length ; i++) {
			var cookie = cookieJar[i];

			while (cookie.charAt(0) == ' ')
				cookie = cookie.substring(1, cookie.length);
			if (cookie.indexOf(thisCookie) == 0) {
				var cookieVal = cookie.substring(thisCookie.length, cookie.length);
				var cookieData = eval("(" + unescape(cookieVal) + ")");
				return cookieData;
			}
		}
		return null;
	},

	/**
	 * Save the current context to a cookie
	 */
	saveToCookie: function() {
		var cookieData = {};

		// Get the object
		for (var c = 0 ; c < this.columnSort.length ; c++) {
			var colName = this.columnSort[c];
			var colSelection = [];
			$('#SELECT_'+c+' option:selected', this._container).each(function() { colSelection.push($(this).val()); });
			cookieData[colName] = colSelection;
		}

		// Convert the object to JSON
		var cookieVal = JSON.stringify(cookieData);

		// Store the cookie as a session cookie
		document.cookie = this.defaults.cookieName + "=" + escape(cookieVal) + "; path=/";
	},

	/**
	 * Convert a string to a boolean
	 */
	toBoolean: function(v, def) {
		if (v === "true" || v === "t" || v =="on" || v === "1" || v === 1 || v === true) {
			return true;
		}
		if (v === "false" || v === "f" || v == "off" || v === "0" || v === 0 || v === false) {
			return false;
		}
		return def;
	}, /* toBoolean() */

	/**
	 * Add an element to a specific 
	 */
	addToColumn: function(k, v) {
		if (!this.columnDefinitions[k].hasOwnProperty("data")) {
			this.columnDefinitions[k]['data'] = new Array();
		}

		// Only add if the column doesn't already contain the data
		if (this.columnDefinitions[k]['data'].indexOf(v) == -1) {
			this.columnDefinitions[k]['data'].push(v);
		}
	}, /* addToColumn */

	/**
	 * Flag to say if we are already in the SelectionChange handler
	 */
	inSelectionChangeHandler: false
});

