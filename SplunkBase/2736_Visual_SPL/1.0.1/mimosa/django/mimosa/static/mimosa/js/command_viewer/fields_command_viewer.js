var deps = [
    'underscore',
    'mimosa/bower_components/d3/d3'
];

define(deps, function (_, d3) {
    var show = function (pipe, parsedCommand) {
        var op = parsedCommand[0] || '+';
        var fields = parsedCommand[1];
        
        var opHtml = _.template('<span class="label label-<%= type %>"><%= icon %></span>')({
            type: op === '+' ? 'success' : 'warning',
            icon: op === '+' ? '&#10003;' : '&#10005;'
        });
        var html = _.reduce(fields, function (html, field) {
            var template = op === '+' 
                ? '<span class="label label-important"><%= field %></span>'
                : '<span class="label label-important"><del><%= field %></del></span>';
            html += _.template(template)({
                field: field
            });
            return html;
        }, opHtml);
        
        return html;
    };
    return {
        show: show
    };
});