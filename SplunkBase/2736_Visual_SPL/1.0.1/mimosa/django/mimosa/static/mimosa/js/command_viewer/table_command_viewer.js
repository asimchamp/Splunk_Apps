var deps = [
    'underscore',
    'mimosa/bower_components/d3/d3'
];

define(deps, function (_, d3) {
    var show = function (pipe, parsedCommand) {
        var fields = parsedCommand;
        
        var tableTemplate = '<table><thead><tr><%= theadHtml %></tr></thead></table>';
        var html = _.reduce(fields, function (html, field) {
            var template = '<th><span class="label label-important"><%= field %></span></th>';
            html += _.template(template)({
                field: field
            });
            return html;
        }, '');
        
        html = _.template(tableTemplate)({
            theadHtml: html
        });
        return html;
    };
    return {
        show: show
    };
});