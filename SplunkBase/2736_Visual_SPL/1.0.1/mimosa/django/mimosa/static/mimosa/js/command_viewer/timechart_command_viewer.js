var deps = [
    'underscore',
    'mimosa/bower_components/d3/d3'
];

define(deps, function (_, d3) {
    
    var groupByHtml = function (byClause) {
        var groupByHtml = '';
        if(byClause) {
            var byFieldHtml = fieldLabelHtml(byClause.field);
            groupByHtml = _.template(' for each <%= byField %>, ')({
                byField: byFieldHtml
            });
        } 
        return groupByHtml;
    };
    
    var includeSeriesHtml = function (where) {
        var html = '';
        // if(where) {
        //     html = _.template('<div>only including data series where <%= where %></div>')({
        //         where: where
        //     });
        // }
        return html;
    };
    
    var fieldLabelHtml = function (field) {
        return _.template('<span class="label label-important"><%= field %></span>')({
            field: field
        });   
    };
    
    var functionDescriptions = {
        'estdc': 'The estimated count of the distinct values of the field.',
        'estdc_error': 'The theoretical error of the estimated count of the distinct values of the field, where the error represents a ratio of abs(estimate_value - real_value)/real_value',
        'c': 'The count of the occurrences of the field.',
        'count': 'The count of the occurrences of the field.',
        'dc': 'The count of distinct values of the field.',
        'distinct_count': 'The count of distinct values of the field.',
        'mean': 'The arithmetic mean of the field.',
        'avg': 'The arithmetic mean of the field.',
        'stdev': 'The {sample, population} standard deviation of the field',
        'stdevp': 'The {sample, population} standard deviation of the field',
        'var': 'The {sample, population} variance of the field.',
        'varp': 'The {sample, population} variance of the field.',
        'sum': 'The sum of the values of the field.',
        'sumsq': 'The sum of the square of the values of the field.',
        'min': 'The minimum value of the field (lexicographic, if non-numeric).',
        'max': 'The maximum value of the field (lexicographic, if non-numeric).',
        'range': 'The difference between max and min (only if numeric)',
        'mode': 'The most frequent value of the field.',
        'median': 'The middle-most value of the field.',
        'first': 'The first seen value of the field. <br/>In general the first seen value of the field is the chronologically most recent instance of this field.',
        'last': 'The last seen value of the field.',
        // NOTE: perc is not here
        'list': 'List of all values of this field as a multi-value entry.  Order of values reflects order of input events.',
        'values': 'List of all distinct values of this field as a multi-value entry.  Order of values is lexigraphical.',
        'var': 'The sample variance of the field',
        'median': 'The middle-most value of the field',
        'latest': 'The chronologically latest seen occurrence of a value of a field',
        'earliest': 'The chronologically earliest seen occurrence of a value of a field'
    };
        
    var timechartFunctionDescription = function (func) {
        return functionDescriptions[func];
    };
    
    var timechartFunctionDescriptionHtml = function (func) {
        var html = '';
        var description = timechartFunctionDescription(func);
        if(description) {
            html = _.template('<div style="margin-top: 3px; margin-bottom: 0px;"><span class="badge badge-success"><%= func %></span><%= description %></div>')({
                func: func,
                description: description
            });   
        }
        return html; 
    };
    
    var aggregationHtml = function (aggregation, byClause) {
        var html = '';
        var term = aggregation.term;
        
        var byHtml = groupByHtml(byClause);
        
        if(term.name) {
            // a function call
            var funcHtml = _.template('create chart with data <%= name %>(<%= args %>)')({
                name: term.name,
                args: term.args
            });
            
            var functionDescriptionHtml = timechartFunctionDescriptionHtml(term.name);
            html = byHtml + funcHtml + functionDescriptionHtml;    
        } else {
            // an evaled field
            var evaledFieldHtml = _.template('create chart with data <%= term %>)')({
                term: term
            });
            
            html = byHtml + evaledFieldHtml;
        }
        
        return html;
    };
    
    var show = function (pipe, parsedCommand) {
        var html = _.reduce(parsedCommand.aggregation, function (html, agg) {
            var aggHtml = aggregationHtml(agg, parsedCommand.splitBy); 
            html += _.template('<div><%= aggHtml %></div>')({
                aggHtml: aggHtml
            });
            return html;
        }, '');
        
        if(parsedCommand.splitBy) {
            var whereHtml = includeSeriesHtml(parsedCommand.splitBy.where);
            html += whereHtml;
        }
        return html;
    };
    return {
        show: show
    };
});