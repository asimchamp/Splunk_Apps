var deps = [
    'mimosa/js/search_control',
    'mimosa/js/codemirror/editor',
    'mimosa/js/pipeline_viewer',
    'mimosa/js/pipelined_search'
];

var globalSearchResult;
var globalSearchManager;
var calc;

var showPipeResult = function (pipeId) {
    var intermediateSearch = globalSearchResult.search;
    if(pipeId <= globalSearchResult.teeFiles.length) {
        var teeFile = globalSearchResult.teeFiles[pipeId - 1];
        //var teeFilePath = 'dispatch/' + jobId + '/' + teeFile;
        intermediateSearch = '| inputcsv events=True ' + teeFile;
    }
    globalSearchManager.settings.set('search', intermediateSearch);
};

require(deps, function(mvc, editor, pipelineViewer, pipedSearch) {
    var searchManager = mvc.searchManager;
    
    editor.on('change', function(cm, changeObj) {
        var code = cm.getValue();
        var search = pipedSearch.asPipedSearch(code, true);
        
        globalSearchResult = search;
        globalSearchManager = searchManager;
        
        searchManager.settings.set('search', search.search);
        var teeFiles = search.teeFiles;
        
        var pipes = pipedSearch.asPipeline(code);
        pipelineViewer.show($('#pipeline-diagram'), pipes);
    });
});