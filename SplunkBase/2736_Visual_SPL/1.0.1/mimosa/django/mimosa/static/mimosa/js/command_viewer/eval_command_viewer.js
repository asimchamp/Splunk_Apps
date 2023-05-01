var deps = [
    'underscore',
    'mimosa/bower_components/d3/d3'
];

define(deps, function (_, d3) {
    var show = function (pipe, parsedCommand) {
        var evalField = _.keys(parsedCommand)[0];
        var evalExpression = parsedCommand[evalField];
        
        var html = _.template('<span class="label label-important"><%= field %></span>&lArr;<%= exp %>')({
            field: evalField,
            exp: evalExpression
        });
        return html;
    };
    return {
        show: show
    };
});