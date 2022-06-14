require(['jquery',
    'underscore',
    'splunkjs/mvc',
    'splunkjs/mvc/multiselectview',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/simplexml/ready!'], 
    function($, _, mvc, MultiSelectView,SearchManager){

        new SearchManager({
            id: "mvasearch",
            earliest_time: "0",
            latest_time: "now",
            search: "index=ziften|head 1",
        });

    var mvaDataObj = splunkjs.mvc.Components.getInstance("mvasearch");
    var myResults = mvaDataObj.data("preview", { count: 1});

    mvaDataObj.on('search:progress', function(properties) {
        console.log("IN PROGRESS:", properties)
    });

    mvaDataObj.on('search:done', function(properties) {
        console.log("DONE:", properties)
        if(properties.content.resultCount <= 0) {
            console.log("NO DATA!!!");
            $("#desc1").modal();
            //alert("Install A Fucking Client Broner!")
        }
    });

    mvaDataObj.on('search:failed', function(properties) {
        console.log("FAIL:", properties)
    });

    //var MyResults = mvaDataObj.data('results', {count: 1});
    //MyResults.on('data', function() {
    //    var data = this.data();
    //    if(data.rows.length <= 0) {
    //        //MyView.$el.parents('.dashboard-cell').hide();
    //        console.log("NO DATA FOOL")
    //    }
    //});

    //var myResults = mvaDataObj.data("preview", { count: 25, offset: 10 });
    //myResults.on("data", function() {
    //        // The full data object
    //        console.log(myResults.data());
    //
    //       // Indicates whether the results model has data
    //        console.log("Has data? ", myResults.hasData());
    //
    //        // The results rows
    //        console.log("Data (rows): ", myResults.data().rows);
    //
    //     // The Backbone collection
    //        console.log("Backbone collection: ", myResults.collection());
    //});

    }
);
