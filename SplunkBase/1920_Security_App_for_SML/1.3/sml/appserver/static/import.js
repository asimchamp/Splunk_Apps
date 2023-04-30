require.config({
    paths: {
        "app": "../app"
    }
});

require([
    'jquery',
    'underscore',
    'splunkjs/mvc',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!',
    'splunkjs/ready!'
], function($, _, mvc){
    function format_fsize(fsize){
        if (fsize > 1<<20){
            return (fsize / (1<<20)).toFixed(1) + " MB";
        }else if (fsize > 1<<10){
            return (fsize / (1<<10)).toFixed(1) + " KB";
        }else{
            return fsize + " Bytes";
        }
    }

    function format_data(data){
        var output = "";
        var first = true;
        _.each(data.zips, function(zip){
            _.each(zip.salts, function(salt){
                if (first){
                    first = false;
                }else{
                    output += "?";
                }

                output += zip.dt;
                output += ':';
                output += zip.seq;
                output += ':';
                output += zip.zip || '-';
                output += ':';
                output += salt.cabname;
                output += ':';
                output += format_fsize(salt.plainsize);
            });
        });
        return output;
    }

    function show_hit_list(data){
        var search = '| hitlist data=""';
        if (data){
            search = '| hitlist data="' + 
                format_data(data) + '" | table date seq zip salt plainsize';
        }
        hit_list_search.settings.attributes.search = search
        hit_list_search.startSearch(true);
    }

    function update_label(id, val){
        var selector = "#element" + id + " .after-label";
        $(selector).html(val);
    }

    function update_number(id, val){
        var selector = "#element" + id + " .single-result";
        $(selector).html(val);
    }

    var search_base_url = "http://localhost:8090/v1/search?account=";
    var year = "";
    var account = "";

    function make_query(base_url){
        return base_url + account + "&start=" + year + "&end=" + year
    }

    function search_rest(){
        year = input_year.val(); 
        account = input_account.val();
        if (!account.length){
            return;
        }

        $("#search_btn button").prop("disabled", true);
        $("#import_btn").prop("disabled", true);
        update_number(1, 0);
        update_number(2, 0);
        update_number(3, 0);
        update_number(4, 0);
        show_hit_list();

        var start = new Date();
        $.ajax({
            url: make_query(search_base_url) 
        }).done(function(data){

            var end = new Date();
            var time_elapsed = ((end - start)/1000).toFixed(3);
            update_number(1, time_elapsed);
            update_number(2, data.zip_count);
            update_number(3, data.salt_count);

            var fsize = format_fsize(data.plain_size);
            var parts = fsize.split(" ");
            update_number(4, parts[0]);
            update_label(4, parts[1]);

            show_hit_list(data);

            $("#search_btn button").prop("disabled", false);
        }).fail(function(jqXHR, stat){
            $("#search_btn button").prop("disabled", false);
            console.log("ajax error: " + stat + " url: " + make_query(search_base_url));
        });
    }

    var is_first_change = [true, true];
    var input_year = mvc.Components.get("field1");
    input_year.on('change', function(e) {
        if (is_first_change[0]) {
            is_first_change[0] = false;
        }else{
            search_rest();
        }
    });

    var input_account = mvc.Components.get("field2");
    input_account.on('change', function(e) {
        if (is_first_change[1]) {
            is_first_change[1] = false;
        }else{
            search_rest();
        }
    });


    $("#search_btn button").click(function(){
        search_rest();
    });

    var hit_list = mvc.Components.get("element5");
    var hit_list_search = mvc.Components.get(hit_list.managerid);
    hit_list.on('rendered', function(obj) {
        $("#import_btn").prop("disabled", false);
    });
    var import_selector = '<button id="import_btn" class="btn btn-primary pull-right" style="margin-bottom: 2px">Import</button>';
    $(import_selector).insertAfter(".dashboard-row1")
        .prop("disabled", true)
        .click(function(){
            import_rest();
        });

    var import_base_url = "http://localhost:8090/v1/import?account=";
    function import_rest(){
        $("#search_btn button").prop("disabled", true);
        $("#import_btn").prop("disabled", true);
        $("#import_error").remove();

        var start = new Date();
        $.ajax({
            url: make_query(import_base_url) 
        }).done(function(data){
            $("#search_btn button").prop("disabled", false);
            $("#import_btn").prop("disabled", false);

            if (!data.import_result){
                $('<div id="import_error" class="alert alert-error" ><i class="icon-alert"></i>Import failed.</div>').insertBefore("#import_btn");
            }else{
                alert("Import Finished.");
            }

        }).fail(function(jqXHR, stat){
            $("#search_btn button").prop("disabled", false);
            $("#import_btn").prop("disabled", false);
            $('<div id="import_error" class="alert alert-error" ><i class="icon-alert"></i>Import failed.</div>').insertBefore("#import_btn");

            console.log("ajax error: " + stat + " url: " + make_query(import_base_url));
        });
    }
});
