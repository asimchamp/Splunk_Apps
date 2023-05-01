var deps = [
    'underscore',
    'mimosa/bower_components/d3/d3'
];

define(deps, function (_, d3) {
    
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
    
    var sortByFieldHtml = function (field) {
        var fieldHtml = fieldLabel([field.name]);
        var directionText;
        if(field.sortType === 'auto') {
            directionText = field.direction === 'desc' ? 'descending' : 'ascending';
        } else if(field.sortType === 'str') {
            directionText = '<i class="fa fa-sort-alpha-' + field.direction + '"></i>';
        } else if(field.sortType === 'num') {
            directionText = '<i class="fa fa-sort-numeric-' + field.direction + '"></i>';
        } else if(field.sortType === 'ip') {
            directionText = field.direction === 'desc' ? 'descending ip' : 'ascending ip';
        }
        return _.template('by <%= fieldHtml %> in <%= direction %> order')({ 
            fieldHtml: fieldHtml,
            direction: directionText 
        });
    };
    
    var sortByHtml = function (fields) {
        return _.reduce(fields, function (html, field) {
            var sortHtml = '';
            if(html) {
                sortHtml += '<p>, and then ';
            }
            sortHtml += sortByFieldHtml(field);
            if(html) {
                sortHtml += '</p>';
            }
            return html + sortHtml;
        }, '');
    };
    
    var show = function (pipe, parsedCommand) {
        var count = parsedCommand.count;
        var fields = parsedCommand.fields;
        var reversed = parsedCommand.reversed ? true : false;
        
        var countHtml = '';
        if(count) {
            countHtml = _.template('first <%= count %>')({ count: count });
        }
        
        var sortBy = sortByHtml(fields);
        var reversedHtml = reversed ? ' , and reverse the results in the end.' : '';
        var html = _.template('sort <%= countHtml %> results <%= sortByHtml %><%= reversedHtml %>')({
            countHtml: countHtml,
            sortByHtml: sortBy,
            reversedHtml: reversedHtml
        });
        return html;
    };
    return {
        show: show
    };
});