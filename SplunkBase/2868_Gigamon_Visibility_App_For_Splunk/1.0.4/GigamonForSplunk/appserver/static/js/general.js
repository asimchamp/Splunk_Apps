var validate = function(assert,value){
	if ( "defined" == assert ) {
		if ( value ) { return true; } else { return false; }
	}
};

var getLocation = function(href) {
    var l = document.createElement("a");
    l.href = href;
    return l;
};

var getCurrentHost = function() {
	var l = getLocation(window.location);
	return l.hostname;
};

var objectifySearchResults = function(_,results){
	return _.map(results.data().rows,function(row){
  		rowObj = {};
  		_.each(row,function(rowItem,rowItemIndex){
  			rowObj[results.data().fields[rowItemIndex]] = rowItem;
  		});
  		return rowObj;
  	});
};
