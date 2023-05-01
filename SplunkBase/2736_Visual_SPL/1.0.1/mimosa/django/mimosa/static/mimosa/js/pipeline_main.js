var deps = [
    'underscore',
    'mimosa/js/search_table',
    'mimosa/js/codemirror/editor',
    'mimosa/js/dagre_pipeline_viewer',
    'mimosa/js/pipelined_search',
    'mimosa/bower_components/jquery.scrollTo/jquery.scrollTo.min',
    'mimosa/js/shell_command'
];

var showPipeResult = function (pipeId) {
    console.log(pipeId);
};

var showPipeline = function (pipedSearch, code, pipelineViewer) {
    var pipes = pipedSearch.asPipeline(code);
    pipelineViewer.show($('#pipeline-diagram'), pipes);
    
    var search = pipedSearch.asPipedSearch(code, false);
    return search;
};

var normalizeCode = function (code) {
    code = code.trim();
    if(code.indexOf('search') !== 0 && code.indexOf('|') !== 0) {
        code = 'search ' + code;
    }
    return code;
}

$(window).bind('beforeunload', function (){
    return 'Bye for now';
});
    
$(document).ready(function () {
    
    var layout = $('#everything').layout({
        center__paneSelector:   ".outer-center",   
        west__paneSelector:     ".outer-west",   
        east__paneSelector:     ".outer-east",   
        south__paneSelector:    ".outer-south",
        closable: true,
        autoResize: true,
        west__size: 0.40,
        east__size: 0.20,
        south__size: 0.28,
        south__childOptions: {
            center__paneSelector:   ".south-center",   
            east__paneSelector:     ".south-east",
            east__size: 0.20
        }
    });    
    $('.outer-south').layout().close('east');
});

require(deps, function(_, mvc, editor, pipelineViewer, pipedSearch, scrollTo, cmd) {
    
    $(document).ready(function () {
        var consoleDiv = $('#console');
        var cliInput = $('#cli');
        
        var commandHistory = [];
        var current = 0;
        cliInput.keyup(function (e){
            if(e.keyCode === 13) {
                var command = cliInput.val();
                cmd.run(command);
                cliInput.val('');
                commandHistory.push(command);
                current = commandHistory.length;
            } else if (e.keyCode === 38) {
                if(current > 0) {
                    current--;
                    cliInput.val(commandHistory[current]);
                }
            } else if (e.keyCode === 40) {
                if(current < commandHistory.length) {
                    current++;
                    cliInput.val(commandHistory[current]);
                }
            }
        });
        
        var chartTypeSelect = $('#chart-type');
        chartTypeSelect.change(function () {
            var chartType = chartTypeSelect.val();
            mvc.updateChartType(chartType);    
        });
    });
    
    var searchManager = mvc.searchManager;
    
    var code = normalizeCode(editor.doc.cm.getValue());
    var search = showPipeline(pipedSearch, code, pipelineViewer);
    
    searchManager.settings.set('search', search.search);
    
    editor.setSize('100%', '68%');
    editor.on('change', function(cm, changeObj) {
        code = normalizeCode(cm.getValue());
        search = showPipeline(pipedSearch, code, pipelineViewer);
        
        searchManager.settings.set('search', search.search);
    });
    
    var scrollView = function (doc) {
        var line = doc.getCursor().line;
        $('.outer-west').scrollTo($('#svg-canvas .node-pipe')[line], 150);
    };
    
    editor.on('cursorActivity', function(doc) {
        scrollView(doc);
    });
    
});