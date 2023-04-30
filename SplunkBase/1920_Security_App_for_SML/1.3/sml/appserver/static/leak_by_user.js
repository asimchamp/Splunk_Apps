require.config({
    paths: {
        "app": "../app"
    }
});

require([
    'jquery',
    'underscore',
    'splunkjs/mvc',
    'splunkjs/mvc/simplexml/ready!'
], function($, _, mvc){
    var leak_user_lists = [];
    var current_list_id = 0;

    function get_eid(sourcetype){
        var eid_str = ""; 
        if (sourcetype){
            var end = sourcetype.indexOf(" ");
            if (end == -1){
                return 0;
            }
            eid_str = sourcetype.substring(0, end);
        }else{
            var query_str = window.location.search;
            var key = "sourcetype="
            var start = query_str.indexOf(key)
            if (start == -1){
                return 0;
            }
            start += key.length

            var end = query_str.indexOf("%20", start);
            if (end == -1 || end <= start){
                return 0;
            }
            eid_str = query_str.substring(start, end);
        }
        var eid = parseInt(eid_str)
        if (isNaN(eid)){
            return 0;
        }
        return eid;
    }

    function switch_list(eid){
        _.each(leak_user_lists, function(list){
            list.$el.parents('.dashboard-cell').hide();
        });
        if (eid == 400){
            current_list_id = 0;
        }else if (eid == 0){
            current_list_id = 1;
        }else if (eid == 6){
            current_list_id = 2;
        }else if (eid == 300){
            current_list_id = 3;
        }else{
            current_list_id = 1;
        }
    }

    var leakTopUsers = mvc.Components.get('leak_top_users');
    var list_names = [
        'leak_user_mail',
        'leak_user_takeout',
        'leak_user_print',
        'leak_user_webup',
    ];
    _.each(list_names, function(name){
        leak_user_lists.push(mvc.Components.get(name));
    });
    switch_list(get_eid());

    var sourcetypes = mvc.Components.get("field1");
    sourcetypes.on("change", function(e){
        switch_list(get_eid(e));
    });
    var category = mvc.Components.get("field2");
    category.on("change", function(e){
        switch_list(get_eid());
    });

    var unsubmittedTokens = mvc.Components.get('default');
    var submittedTokens = mvc.Components.get('submitted');

    leakTopUsers.on('click', function(e) {
        e.preventDefault();
        leak_user_lists[current_list_id].$el.parents('.dashboard-cell').show();
        var newValue = e.data['row.user_account'];
        unsubmittedTokens.set('user_account', newValue);
        submittedTokens.set('user_account', newValue);
    });
});
