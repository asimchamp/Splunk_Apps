var deps = [
    'underscore'
];

// mermaid is loaded globally instead of requirejs, https://github.com/knsv/mermaid/issues/37
define(deps, function (_) {
    var drawPipelineGraph = function (pipes, options) {
        options = options || {};
        var graph = 'graph TD; classDef default fill:#fff,stroke:#65a637,stroke-width:2px;';
        var prev = 0;
        var label = 'start';
        for(var i = 0; i < pipes.length; i++) {
            var command = pipes[i].replace(/\|/, ':');
            var pipeId = 'p_' + prev + '_' + (prev + 1);
            if(command) {
                label = 'show';
                var edge = _.template(' <%= start %>((<%= label %>))--><%= pipeId %>(<%= pipe %>); <%= pipeId %>--><%= end %>((<%= label %>)); click <%= end %> <%= clickPipeFunc %>; ')({
                    start: prev,
                    label: label,
                    pipe: command,
                    end: prev + 1,
                    pipeId: pipeId,
                    clickPipeFunc: options['clickPipeFunc'] || 'showPipeResult'
                });        
                graph += edge;    
            }
            
            prev++;    
        }
        return graph;
    };

    var showPipeline = function (el, pipes, options) {
        var graph = drawPipelineGraph(pipes, options);
        console.log({
            event: 'render_graph',
            graph: graph    
        });
        el.html(graph);
        el.attr('class', 'mermaid');
        el.removeAttr('data-processed');
        try {
            mermaid.init();   
        } catch (e) {
            console.log(e);
        }    
    }; 
    
    return {
        show: showPipeline
    };
});