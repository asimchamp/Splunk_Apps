
    // ### Start of Function Definitions ###
    function genFieldTokens(mvc, tokens, searchMgrID, fields_tokens, callback){
    if (typeof(fields_tokens[0]) === 'string') {
        fields_tokens = [fields_tokens]; 
        }

        var objSearch = mvc.Components.get(searchMgrID);
        var myResults = objSearch.data("results", {count: 0, output_mode: "json"});

    myResults.on("data", function() {
            var data = myResults.data();
            var firstRow = data.results[0];

            for (var n = 0; n < fields_tokens.length; n++){ //>
	    var current_tupe = new Array;
                current_tuple = fields_tokens[n];
                var field_name = current_tuple[0];
                var token_name = current_tuple[1];
                tokens.set(token_name, firstRow[field_name]);
	}
            callback();
        });

    } //End of genFieldTokens function


    //function redirector(e, param_list, destination){
    function redirector(param_list, destination){
    //e.preventDefault();		    
    redir_params = {}
        for (var key in param_list){
            // Removed e.data[param_list[key]] 
            // to allow passing of none event variables.
	    // ---
	    // Issue around 'all time' not returning a value
            // this will check and handle appropriately.
	    if (key == "lateTime" && param_list[key] == ""){
	        param_list[key] = "now";
	    }
            if (key == "earlyTime" && param_list[key] == ""){
                param_list[key] = "1";
            }

            if (param_list[key].indexOf(" ") == -1) {
                redir_params[key] = param_list[key];
            }else{
                redir_params[key] = "*";
            }
    };

        url = window.location.protocol + "//" + window.location.host + "/dj/sentry/" + destination + '/?' + $.param(redir_params);
        var newTab = window.open(url, '_blank');
        newTab.focus();

    }  //End of redirector function

    function urlparse(tokens){
        var params = {},
            seg = window.location.search.replace(/^\?/,'').split('&'),
            len = seg.length, i = 0, s;
        for (;i<len;i++) {
            if (!seg[i]) { continue; }
            s = seg[i].split('=');
            params[s[0]] = s[1];
        }
        
        for (var key in params){
            tokens.set(key, unescape(params[key]));
        };

        return !$.isEmptyObject(params);

    } // End of urlparse function

    // Sets Epoch Time
    function setEpochTime(tokens, token) {
        time = (new Date().valueOf()) / 1000;
        tokens.set(token, time);
    };

    // ### End of Function Definitions ###

