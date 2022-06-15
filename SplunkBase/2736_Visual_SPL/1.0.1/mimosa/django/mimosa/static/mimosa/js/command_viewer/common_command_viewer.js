var deps = [
    'underscore',
    'mimosa/bower_components/d3/d3'
];

var splunkCommandDocUrl = 'http://docs.splunk.com/Documentation/Splunk/latest/SearchReference';
define(deps, function (_, d3) {
    var show = function (pipe, parsedCommand, commandDiagram) {
        var command = pipe.split(' ')[0];
        var html = _.template('<table><tbody><tr><td><span class="label label-success text-center"><a href="<%= url %>/<%= command %>" target="_blank" class="text-highlight"><%= command %></a></span></td><td><%= diagram %></td></tr></tbody></table>')({
            url: splunkCommandDocUrl,
            command: command, 
            diagram: commandDiagram ? commandDiagram : pipe
        });
        return html;
    };
    return {
        show: show
    };
});