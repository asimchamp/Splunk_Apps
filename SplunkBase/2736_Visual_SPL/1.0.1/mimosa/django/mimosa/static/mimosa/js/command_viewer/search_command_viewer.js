var deps = [
    'underscore',
    'mimosa/bower_components/d3/d3'
];

define(deps, function (_, d3) {
    var compareFunctionMap = {
        '>': function (op1, op2) {
            return op1 > op2;
        },
        '<': function (op1, op2) {
            return op1 < op2;
        },
        '>=': function (op1, op2) {
            return op1 >= op2;
        },
        '<=': function (op1, op2) {
            return op1 <= op2;
        },
        '!=': function (op1, op2) {
            return op1 !== op2;
        },
        '=': function (op1, op2) {
            return op1 === op2;
        }
    };
    
    var comparisionExpNode = function (exp, variables) {
        var html = _.template('<%= lop %><%= op %><%= rop %>')({
            lop: exp.operands[0],
            op: exp.op,
            rop: exp.operands[1]
        }); 
        
        var node = {
            html: html,
            value: true  
        };
        
        if(variables) {
            var fieldValue = variables[exp.operands[0]];
            var op = exp.op;
            var compareValue = variables[exp.operands[1]] || exp.operands[1];
            if(compareFunctionMap[op]) {
                node.value = compareFunctionMap[op](fieldValue, compareValue);
            } else {
                node.value = false;
            }
        }
        return node;
    };
    
    var termNode = function (term, variables) {
        var node = {
            html: term,
            value: true
        };
        if(variables) {
            var raw = variables['_raw'];
            node.value = raw ? raw.indexOf(term) > -1 : false;
        }
        return node;
    };
    
    var andExp = function (exps, variables) {
        var node = {
            html: '',
            value: true
        };
        var series = '<table class="search-command-table"><tbody><tr><%= andExpsHtml %></tr></tbody></table>';    
        var andNode = _.reduce(exps, function (all, exp) {
            var subNode;
            if(exp.op === 'and') {
                subNode = andExp(exp.exp, variables);    
            } else if(exp.op === 'or') {
                subNode = orExp(exp.exp, variables);    
            } else if(exp.op) {
                subNode = comparisionExpNode(exp, variables);
            } else {
                subNode = termNode(exp, variables);
            }
            all.html = all.html + _.template('<td class="<%= nodeValue %>-search-node"><%= expHtml %></td>')({
                expHtml: subNode.html,
                nodeValue: subNode.value
            });
            all.value = all.value && subNode.value;
            return all;
        }, { html: '', value: true });
        node.html = _.template(series)({
            andExpsHtml: andNode.html
        });
        node.value = andNode.value;
        return node;
    };

    var orExp = function (exps, variables) {
        var node = {
            html: '',
            value: true
        };
        
        var parallel = '<table class="search-command-table"><tbody><%= orExpsHtml %></tbody></table>';    
        var orNode = _.reduce(exps, function (all, exp) {
            var subNode;
            if(exp.op === 'and') {
                subNode = andExp(exp.exp, variables);    
            } else if(exp.op === 'or') {
                subNode = orExp(exp.exp, variables);    
            } else if(exp.op) {
                subNode = comparisionExpNode(exp, variables);
            } else {
                subNode = termNode(exp, variables);
            }
            
            all.html = all.html + _.template('<tr><td class="<%= nodeValue %>-search-node"><%= expHtml %></td></tr>')({
                expHtml: subNode.html,
                nodeValue: subNode.value
            });
            all.value = all.value || subNode.value;
            return all;
        }, { html: '', value: false });
        node.html = _.template(parallel)({
            orExpsHtml: orNode.html
        });    
        node.value = orNode.value;
        return node;
    };

    var inspect = function (pipe, parsedCommand, variables) {
        var node;
        if(parsedCommand.op === 'and') {
            node = andExp(parsedCommand.exp, variables);
        } else if(parsedCommand.op === 'or') {
            node = orExp(parsedCommand.exp, variables);
        } else if(parsedCommand.op) {
            node = comparisionExpNode(parsedCommand, variables); 
        } else {
            node = termNode(parsedCommand, variables);
        }      
        
        node.html = _.template('<table class="search-command-table"><tbody><tr><td class="<%= nodeValue %>-search-node"><%= nodeHtml %></td></tr></tbody></table>')({
            nodeHtml: node.html,
            nodeValue: node.value   
        });
        return node;
    };
    
    var show = function (pipe, parsedCommand, variables) {
        var html = inspect(pipe, parsedCommand, variables).html;
        return html;
    };
    
    return {
        inspect: inspect,
        show: show
    };
});