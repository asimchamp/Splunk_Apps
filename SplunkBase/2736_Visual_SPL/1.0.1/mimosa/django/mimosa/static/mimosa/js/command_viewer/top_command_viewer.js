var deps = [
    'underscore',
    'mimosa/bower_components/d3/d3'
];

define(deps, function (_, d3) {
    var merge = function (options) {
        return _.reduce(options, function (opts, option) {
            opts[_.keys(option)[0]] = _.values(option)[0];
            return opts;
        }, {});    
    };
    
    var fieldLabel = function (fields) {
        var html = _.reduce(fields, function (html, field) {
            var fieldLabelHtml = _.template('<span class="label label-important"><%= field %></span>')({
                field: field
            });        
            html += fieldLabelHtml;            
            return html;
        }, '');
        return html;
    };
    
    var show = function (pipe, parsedCommand) {
        var options = merge(parsedCommand.options || []);
        var fields = parsedCommand.fields;
        var byfields = parsedCommand.byfields;
        var showCountOption = (options['showcount'] || '').toLowerCase();
        var showPercentOption = (options['showperc'] || '').toLowerCase();
        var html = '';
        if(showCountOption !== 'f' && showCountOption !== 'false') {
            var countField = options['countfield'] || 'count';
            html += fieldLabel([countField]);
        }
        if(showPercentOption !== 'f' && showPercentOption !== 'false') {
            var percentField = options['percentfield'] || 'percent';
            html += fieldLabel([percentField]);
        }
        
        var limit = options['limit'] || 10;
        html += _.template('&lArr; return the most <%= limit %> common <%= fields %> values <% if(byfields) { %> for each <%= byfields %> <% } %>')({
            limit: limit,
            fields: fieldLabel(fields),
            byfields: fieldLabel(byfields)
        });
        return html;
    };
    return {
        show: show
    };
});