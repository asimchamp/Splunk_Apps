var deps = [
    'underscore',
    'mimosa/bower_components/d3/d3'
];

define(deps, function (_, d3) {
    var show = function (pipe, parsedCommand) {
        var from = parsedCommand[0];
        var to = parsedCommand[1];
        
        var html = _.template('<span class="label label-important"><del><%= from %></del></span>&rArr;<span class="label label-important"><%= to %></span>')({
            from: from,
            to: to
        });
        return html;
    };
    return {
        show: show
    };
});