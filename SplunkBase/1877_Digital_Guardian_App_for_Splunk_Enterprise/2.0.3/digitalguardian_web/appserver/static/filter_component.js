define(function(require, exports, module) {
    var mvc = require("splunkjs/mvc/mvc");

    require("bootstrap_tagsinput");

    var FilterComponent = {
        initialize: function() {
            var defaultTokens = mvc.Components.getInstance("default");
            var submittedTokens = mvc.Components.getInstance("submitted");

            // Facade that reads & writes to both the "default" and "submitted" token
            // models. This is necessary to send token values to both searches and to
            // other attributes.
            var tokens = {
                get: function(tokenName) {
                    return defaultTokens.get(tokenName);
                },

                set: function(tokenName, tokenValue) {
                    defaultTokens.set(tokenName, tokenValue);
                    submittedTokens.set(tokenName, tokenValue);
                }
            };

            //set default for filters
            tokens.set("filter", "");
            tokens.set("exclude", "");

            //initalize time picker and radio controls
            var timerange = mvc.Components.get("timerange");

            $(document).on("click:menu", function(e) {
                action = e.action;
                if (e.drilldown_search != "") {
                    base_search = e.drilldown_search;
                    earliest = timerange.val().earliest_time;
                    latest = timerange.val().latest_time;
                }
                else {
                    // TODO: Looks like private API usage. Rewrite to avoid.
                    base_search = e.splunk_data.component.manager.search.attributes.search + " | " + e.splunk_data.component.manager.settings.attributes.search
                    earliest = e.splunk_data.component.manager.search.attributes.data.searchEarliestTime;
                    latest = e.splunk_data.component.manager.search.attributes.data.searchLatestTime;
                }

                if (e.splunk_data.data) {
                    name = e.splunk_data.data["click.name"];
                    value = e.splunk_data.data["click.value"];
                }
                else {
                    name = e.splunk_data.name;
                    value = e.splunk_data.value;
                    //timechart check
                    if (name == "_time") {
                        name = "command";
                        value = e.splunk_data.name2;
                    }
                }

		value= value.replace(/\\/g,"\\\\");

                if (action == "include") {
                    FilterComponent._filter(tokens, name, value);
                }
                if (action == "exclude") {
                    FilterComponent._exclude(tokens, name, value);
                }
                if (action == "drilldown") {
                    FilterComponent._drilldown(tokens, base_search, name, value, earliest, latest);
                }
            });

            $("#filter_tags_input").tagsinput({
                itemText: 'text',
                itemValue: 'field_value',
                tagClass: function(item) {
                    return (item.action == "filter" ? 'label filter' : 'label exclude');
                },
                freeInput: false
            });

            $('#filter_tags_input').on('itemRemoved', function(event) {
                if (event.item.action == "filter") {
		    filter_string = tokens.get("filter")
                    filter_string = filter_string.replace(event.item.field_name + "=\"" + event.item.field_value + "\"","")
                    if (filter_string == "") filter_string="*";
                    tokens.set("filter",filter_string);
                }
                else {
		    filter_string = tokens.get("exclude")
                    filter_string = filter_string.replace("NOT " + event.item.field_name + "=\"" + event.item.field_value + "\"","")
                    if (filter_string == "") filter_string="*";
                    tokens.set("exclude",filter_string);
                }
            });
        },

        _filter: function(tokens, field_name, field_value) {
	    var filter_search = "";
    	    var terms = field_name + "=\"" + field_value + "\""
    	    filter_search = tokens.get("filter");
    	    if (filter_search=="*") filter_search="";
    	    filter_search += terms;
    	    tokens.set("filter", filter_search);
            $("#filter_tags_input").tagsinput('add', {
                "action": "filter",
                "field_name": field_name,
                "field_value": field_value,
                "text": terms
            });
        },

        _exclude: function(tokens, field_name, field_value) {
	    var exclude_search = "";
    	    var terms = "NOT " + field_name + "=\"" + field_value + "\"";
    	    exclude_search = tokens.get("exclude");
    	    if (exclude_search=="*") exclude_search="";
    	    exclude_search += terms;
    	    tokens.set("exclude",exclude_search)
            $("#filter_tags_input").tagsinput('add', {
                "action": "exclude",
                "field_name": field_name,
                "field_value": field_value,
                "text": terms
            });
        },

        _drilldown: function(tokens, base_search, field_name, field_value, earliest, latest) {
	    if (field_name == "Channel") {
	        field_name = "eventtype";
        	field_value = "egress_" + field_value;
    	    }
    	    var exclude = tokens.get("exclude");
      	    var include = tokens.get("filter");
    	    exclude = exclude.replace("Channel=\"","eventtype=\"egress_");
    	    include = include.replace("Channel=\"","eventtype=\"egress_");
    	    var terms = field_name + "=\"" + field_value + "\""
    	    var terms = terms + " " + tokens.get("wildcard");
    	    var search = base_search.replace("$criteria$",terms +" " + include + " " + exclude);
	    var encode_search = encodeURIComponent(search);
	    var url = "search?earliest=" + earliest + "&latest=" + latest + "&q=" + encode_search;
    	    window.open(url);
        }
    };

    return FilterComponent;
});
