define(['underscore', './eval/parser', './eval/expr'], function(_, EvalParser, EvalExpressions) {

    function EvalContext(variableBindings) {
        this._vars = variableBindings;
    }

    _.extend(EvalContext.prototype, {
        getVar: function(name) {
            return this._vars[name];
        },
        extend: function(overrides) {
            return new EvalContext(_.extend({}, this._vars, overrides));
        }
    });

    var BINARY_OPERATOR_MAP = {
        '+': EvalExpressions.Addition,
        '-': EvalExpressions.Subtraction,
        '*': EvalExpressions.Multiplication,
        '/': EvalExpressions.Division,
        '%': EvalExpressions.Modulo,
        '>': EvalExpressions.GreaterThan,
        '>=': EvalExpressions.GreaterThanOrEquals,
        '<': EvalExpressions.LessThan,
        '<=': EvalExpressions.LessThanOrEquals,
        '=': EvalExpressions.Equals,
        '==': EvalExpressions.Equals,
        '!=': EvalExpressions.NotEquals,
        '.': EvalExpressions.Concat,
        'like': EvalExpressions.Like,
        'LIKE': EvalExpressions.Like
    };

    var LOGICAL_OPERATOR_MAP = {
        'AND': EvalExpressions.And,
        'and': EvalExpressions.And,
        'OR': EvalExpressions.Or,
        'or': EvalExpressions.Or,
        'XOR': EvalExpressions.Xor,
        'xor': EvalExpressions.Xor
    };

    var UNARY_OPERATOR_MAP = {
        'NOT': EvalExpressions.Not,
        'not': EvalExpressions.Not,
        '!': EvalExpressions.Not,
        '-': EvalExpressions.Negate,
        '+': EvalExpressions.Plus
    };

    function buildExpr(node) {
        switch (node.type) {
            case 'Literal':
                return new EvalExpressions.Literal(node.value);
            case 'Identifier':
                return new EvalExpressions.Variable(node.name);
            case 'BinaryExpression':
                var BinaryExpression = BINARY_OPERATOR_MAP[node.operator];
                return new BinaryExpression(buildExpr(node.left), buildExpr(node.right));
            case 'LogicalExpression':
                var LogicalExpression = LOGICAL_OPERATOR_MAP[node.operator];
                return new LogicalExpression(buildExpr(node.left), buildExpr(node.right));
            case 'UnaryExpression':
                var UnaryExpression = UNARY_OPERATOR_MAP[node.operator];
                return new UnaryExpression(buildExpr(node.argument));
            case 'CallExpression':
                if (node.callee.type !== 'Identifier') {
                    throw new Error('Invalid function call with ' + node.callee.type);
                }
                var name = node.callee.name;
                var args = _(node['arguments']).map(buildExpr);
                return new EvalExpressions.Function(name, args);
            default:
                throw new Error('Invalid node type ' + node.type);
        }
    }

    function compileEvalExpression(evalStr) {
        return buildExpr(EvalParser.parse(evalStr));
    }

    var compileEvalExpressionMemo = _.memoize(compileEvalExpression);

    function executeEvalExpression(evalStr, binding, memo) {
        binding || (binding = {});
        evalStr && (evalStr = evalStr.trim());
        var compiled = memo ? compileEvalExpressionMemo(evalStr) : compileEvalExpression(evalStr);
        var context = new EvalContext(binding);
        return compiled.evaluate(context);
    }

    return {
        "compile": compileEvalExpression,
        "execute": executeEvalExpression
    };
});
