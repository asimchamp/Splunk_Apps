var deps = [
    'underscore',
    'mimosa/bower_components/d3/d3',
    'mimosa/js/command_parser/index',
    'mimosa/js/command_viewer/index',
];

define(deps, function (_, d3, parsers, viewers) {
    var showPipeline = function (el, pipes, options) {
        var g = new dagreD3.graphlib.Graph({ compound: true })
          .setGraph({ 
            label: 'pipeline', 
            ranksep: 20,
            rankdir: "TB" })
          .setDefaultEdgeLabel(function() { return {}; });  
        
        g.setNode('r0',  { shape: 'circle', label: 'start', rx: '5', ry: '5', class: 'node-result' });
        for(var i = 0; i < pipes.length; i++) {
            var pipe = pipes[i];
            var command = pipe.split(' ')[0];
            var commandDiagram = null;
            var parsedCommand = null;
            var isSingleCommand = pipe.indexOf('|') < 0;
            if(isSingleCommand && parsers[command] && viewers[command]) {
                try {
                    parsedCommand = parsers[command].parse(pipe);
                    commandDiagram = viewers[command].show(pipe, parsedCommand);
                } catch (e) {
                    // do nothing, use common viewer
                    console.log('fail to parse command ' + command);
                    console.log(e.message);
                    console.log(e.stack);
                }
            }
            commandDiagram = viewers['common'].show(pipe, parsedCommand, commandDiagram);
            
            g.setNode('p' + i,  { labelType: 'html', label: commandDiagram, rx: '5', ry: '5', class: 'node-pipe' });
            g.setEdge('r' + i, 'p' + i);
            
            g.setNode('r' + (i + 1),  { shape: 'circle', label: (i + 1), rx: '5', ry: '5', class: 'node-result' });
            g.setEdge('p' + i, 'r' + (i + 1));
        }
        
        var render = new dagreD3.render();

        // Set up an SVG group so that we can translate the final graph.
        var svg = d3.select('#svg-canvas');
        d3.select('#svg-canvas g').remove();
        var svgGroup = svg.append('g');

        // Run the renderer. This is what draws the final graph.
        render(d3.select('#svg-canvas g'), g);

        // Center the graph
        var xCenterOffset = (parseInt(svg.attr('width')) - g.graph().width) / 2;
        svgGroup.attr('transform', 'translate(' + xCenterOffset + ', 20)');
        svg.attr('height', g.graph().height + 40);
    }; 
    
    return {
        show: showPipeline
    };    
});