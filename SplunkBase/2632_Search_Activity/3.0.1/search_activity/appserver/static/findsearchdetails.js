require([
	"splunkjs/mvc",
	"splunkjs/mvc/utils",
	"splunkjs/mvc/tokenutils",
	"splunkjs/mvc/searchmanager",
	'splunkjs/mvc/simplexml/ready!'
	],
	function(
		mvc,
		utils,
		TokenUtils,
		SearchManager
		) {
	
            

        var mainSearch = splunkjs.mvc.Components.getInstance("search2");
        var myResults = mainSearch.data('results', { output_mode:'json', count:0 });

        mainSearch.on('search:done', function(properties) {
            // clear div elements of previous result



            if(mainSearch.attributes.data.resultCount == 0) {
              return;
            }       

            myResults.on("data", function() {
                var data = myResults.data().results;
                console.log("Here are my results: ", data, data[0].value)  
                for (var i = data.length - 1; i >= 0; i--) {
	                if(data[i].Field == "actualsearch"){
	                	document.getElementById("searchstringplaceholder").innerHTML = data[i].Value
	                	document.getElementById("searchstringencoded").href="/app/search/search?q=" + data[i].Value
	                }
	            }	
            });
          });

});

