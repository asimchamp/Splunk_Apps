var deps = [
    'underscore'
];

var pipe = ' | ';

var hasLeadingPipe = function (line) {
    return /^\|/.test(line);   
};

var isCommentLine = function (line) {
    return /^#/.test(line);   
};

var removeLeadingPipe = function (line) {
    if(hasLeadingPipe(line)) {
        line = line.substring(1).trim();
    }
    return line;
};

var hashCode = function(s) {
    return s.split('').reduce(function (a,b) {a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
}

define(deps, function (_) {
    var asPipeline = function (search) {
        var lines = search.trim().split('\n');
        lines = _(lines)
                    .map(function (line) { return line.trim(); })
                    .filter(function (line) { return !isCommentLine(line); })
                    .map(function (line) { return removeLeadingPipe(line); });
            
        return lines;
    };
    
    var asTeeSearch = function (pipeline, teeEnabled) {
        var search = '';
        if(pipeline.length > 0) {
            search = pipeline[0];
        }
        var teeFiles = [];
        
        var searchId = hashCode(search);
        for(var i = 1; i < pipeline.length; i++) {
            var separator = ' | ';
            if(teeEnabled !== false) {
                teeFile = _.template('tee_<%= sessionId %>_<%= searchId %>_<%= time %>_<%= seq %>.csv')({
                    sessionId: '',
                    searchId: searchId,
                    time: new Date().getTime(),
                    seq: i
                });
                teeFiles.push(teeFile)
                var teeCmd = _.template(' | outputcsv create_empty=true <%= teeFile %> | ')({
                    teeFile: teeFile    
                });   
                separator = teeCmd; 
            }
            
            search = search + separator + pipeline[i];
        }
        return {
            search: search,
            teeFiles: teeFiles
        };
    };
    
    var asPipedSearch = function (search, teeEnabled) {
        var pipeline = asPipeline(search);
        var pipedSearch = asTeeSearch(pipeline, teeEnabled);
        return pipedSearch;    
    };
    
    return {
        asPipeline: asPipeline,
        asTeeSearch: asTeeSearch,
        asPipedSearch: asPipedSearch   
    };
});