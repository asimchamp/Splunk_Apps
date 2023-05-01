#!/usr/bin/python
# -*- coding: utf-8 -*-
# Author: Julien Chakra-Breil <j.chakra-breil@itrust.fr>
# Copyrights (c) 2015 by ITrust

"""Provides classes for generic representation of url filtering
Expr - Abstract class
Prop - Property
Const - Constant
ListExpr - List
RangeExpr - Range
LikeOperand - Complex type for like value
LikeOperator - Generally '*'
DateOperand - Complex type representing a Date
BinaryExpr - Abstract class
CompoundExpr - Abstract class - Compounded expressions (And, Or, Concat)
Operator - Abstract class for operators
In - in operator
Nin - "not in" logical operator
Contains - "Contains all" operator
Equal - == operator
Like - like operator
Lt - < operator
Gt - > operator
Ge - >= operator
Le - <= operator
And - and logical operator
Or - or logical operator
Concat - Used to represents concatened strings
"""

from logging import getLogger


LOGGER = getLogger(__name__)


class Expr:  # FIXME: old style class is deprecated
    def evaluate(self):
        """Evaluate the expression.
        Call automatically a submethod that can be redefined
        """
        return self._evaluate()

    def _evaluate(self):
        """Abstract method, to be redefined
        """

    def to_url(self):
        """Write an url formatted representation of the expression
        Call automatically a submethod that can be redefined
        """
        return self._to_url()

    def _to_url(self):
        """Abstract method, to be redefined
        """


class Prop(Expr):
    """Represents a Property. Actually, it will always be a string.
    """

    def __init__(self, value):
        self._value = value

    def _evaluate(self):
        return self._value

    def _to_url(self):
        return str(self._value)

    def __str__(self):
        return str(self._value)


class Const(Expr):
    """Represents a Constant. It could be String or Integer
    """

    def __init__(self, value):
        self._value = value

    def _evaluate(self):
        return self._value

    def _to_url(self):
        return str(self._value)

    def __str__(self):
        return str(self._value)  # FIXME: MUST urlencode the string !!


class ListExpr(Expr):
    """Represents a List. It could contain String, Integer...
    """

    def __init__(self, *values):
        self._values = values

    def _evaluate(self):
        return self._values

    def get_exprs(self):
        return self._values

    def _to_url(self):
        #FIXME: lambda is useless
        return ','.join(list(map(lambda x: str(x), self._values)))

    def __str__(self):
        #FIXME: lambda is useless
        return '(' + ','.join(list(map(lambda x: str(x), self._values))) + ')'


class RangeExpr(Expr):
    """Represents a Range. Contains inferior bound and superior bound.
    """

    def __init__(self, *values):
        self.bound_inf = values[0]
        self.bound_sup = values[1]

    def _evaluate(self):
        return [self.bound_inf, self.bound_sup]

    def get_exprs(self):
        exprs = list([self.bound_inf, self.bound_sup])
        return exprs

    def _to_url(self):
        return "[" + str(self.bound_inf) + ";" + str(self.bound_sup) + "]"

    def __str__(self):
        return "[" + str(self.bound_inf) + ";" + str(self.bound_sup) + "]"


class LikeOperand(Expr):
    """Represents a Like value String.
    Actually represents it with an array. Empty values are where wildcard
    has to be
    """

    def __init__(self, value):
        # Value is a Concat, with Const(String) and LikeOperators
        self._value = value

    def get_expr(self):
        return self._value

    def _evaluate(self):
        return self._value.evaluate()

    def _to_url(self):
        return self._value.to_url()

    def __str__(self):
        return str(self._value)


class LikeOperator(Expr):
    """Represents the Like Operator in a Like String
    Representation may change with the compiler implementation
    """

    def _evaluate(self):
        return "*"

    def _to_url(self):
        return "*"

    def __str__(self):
        return "*"


class DateOperand(Expr):
    """Represents a Date (or Datetime).
    """

    def __init__(self, value):
        self._value = value

    def _evaluate(self):
        """
        """
        return self._value

    def _to_url(self):
        return self._value.isoformat()

    def __str__(self):
        return str(self._value)


class UnaryExpr(Expr):
    """Unary operator:
        - 1 operand
        - 1 operator
    """

    def __init__(self, expr):
        self.expr = expr

    def get_exprs(self):
        return [self.expr]


class BinaryExpr(Expr):
    """Represents a simple expression:
        - 2 operands
        - 1 operator
    """
    def __init__(self, expr1, expr2):
        self.expr1 = expr1
        self.expr2 = expr2

    def get_exprs(self):
        exprs = list([self.expr1, self.expr2])
        return exprs


class CompoundExpr(Expr):
    """Represents a complex expression:
        - N expressions
        - 1 logical operator (AND, OR...)
    """

    def __init__(self, *exprs):
        self.exprs = exprs

    def get_exprs(self):
        return self.exprs


class Operator(BinaryExpr):
    """Abstract class, represents an operator
    """
# FIXME: class Operator seems useless


# --- Sort expressions --- #
class SortExpr(Expr):

    def __init__(self, *exprs):
        self.exprs = exprs

    def get_exprs(self):
        return self.exprs

    def _to_url(self):
        return "sort=" + ",".join(map(lambda x: x.to_url(), self.exprs))

    def __str__(self):
        return "SortExpr(" + ",".join(map(str, self.exprs)) + ")"


class Asc(Expr):

    def __init__(self, expr):
        self.expr = expr

    def _to_url(self):
        return "+" + self.expr.to_url()

    def __str__(self):
        return "Asc(" + str(self.expr) + ")"


class Desc(Expr):

    def __init__(self, expr):
        self.expr = expr

    def _to_url(self):
        return "-" + self.expr.to_url()

    def __str__(self):
        return "Desc(" + str(self.expr) + ")"


# --- Binary operators --- #
class In(Operator):
    """Represents the 'in' operator.
    Generally, first operand is a Prop and second is a List
    """

    operator = " in "

    def _to_url(self):
        """Converts to an url valid format
            => filter=value1,value2,value3...
        """
        return self.expr1.to_url() + "=" + self.expr2.to_url()

    def __str__(self):
        return "(" + str(self.expr1) + " in " + str(self.expr2) + ")"


class Nin(Operator):
    """Represents the Not In operator
    """

    operator = None  # FIXME: it seems useless

    def _to_url(self):
        """Converts to an url valid format
            => filter=none(value1,value2,value3)...
        """
        return "{0}=none({1})".format(
            self.expr1.to_url(),
            self.expr2.to_url()
            )

    def __str__(self):
        return "Nin({0}, {1}])".format(
            str(self.expr1),
            str(self.expr2)
            )


class Contains(Operator):
    """Represents the contains all operator.
    First operand is a Prop and second is a value or a list of values expected
    to be contained by the property
    """

    operator = None  # FIXME: it seems useless

    def _to_url(self):
        """Converts to an url valid format
            => filter=all(value1,value2,value3)...
        """
        return "{0}=all({1})".format(
            self.expr1.to_url(),
            self.expr2.to_url()
            )

    def __str__(self):
        return "Contains({0}, {1}])".format(
            str(self.expr1),
            str(self.expr2)
            )


class Equal(Operator):
    """Represents the '==' operator
    Generally, first operand is a Prop and second is a Const or DateOperand
    """

    operator = " == "

    def _to_url(self):
        """Converts to an url valid format
            => filter=value
        """
        return self.expr1.to_url() + "=" + self.expr2.to_url()

    def __str__(self):
        return "(" + str(self.expr1) + " == " + str(self.expr2) + ")"


class Lt(Operator):
    """Represents the '<' operator
    Generally, first operand is a Prop and second is a Const or DateOperand
    """

    operator = " < "

    def _to_url(self):
        """Converts to an url valid format
            => filter=inf(value)
        """
        return self.expr1.to_url() + "=lt(" + self.expr2.to_url() + ")"

    def __str__(self):
        return "(" + str(self.expr1) + " < " + str(self.expr2) + ")"


class Gt(Operator):
    """Represents the '>' operator
    Generally, first operand is a Prop and second is a Const or DateOperand
    """

    operator = " > "

    def _to_url(self):
        """Converts to an url valid format
            => filter=sup(value)
        """
        return self.expr1.to_url() + "=gt(" + self.expr2.to_url() + ")"

    def __str__(self):
        return "(" + str(self.expr1) + " > " + str(self.expr2) + ")"


class Le(Operator):
    """Represents the '<=' operator
    Generally, first operand is a Prop and second is a Const or DateOperand
    """

    operator = " < "

    def _to_url(self):
        """Converts to an url valid format
            => filter=sup(value)
        """
        return self.expr1.to_url() + "=le(" + self.expr2.to_url() + ")"

    def __str__(self):
        return "(" + str(self.expr1) + " <= " + str(self.expr2) + ")"


class Ge(Operator):
    """Represents the '>=' operator
    Generally, first operand is a Prop and second is a Const or DateOperand
    """

    operator = " > "

    def _to_url(self):
        """Converts to an url valid format
            => filter=sup(value)
        """
        return self.expr1.to_url() + "=ge(" + self.expr2.to_url() + ")"

    def __str__(self):
        return "(" + str(self.expr1) + " >= " + str(self.expr2) + ")"


class Like(Operator):
    """Represents the Like operator
    Generally, first operand is a Prop and second is a LikeOperand
    """

    operator = " like "

    def _to_url(self):
        """Converts to an url valid format
            => filter=*value or filter=value* ...
        """
        return self.expr1.to_url() + "=" + self.expr2.to_url()

    def __str__(self):
        return "(" + str(self.expr1) + " like " + str(self.expr2) + ")"


# --- Logical operators --- #
class And(CompoundExpr):
    """Represents the And operator
    Can contains N expressions
    """

    def _to_url(self):
        """Converts to an url valid format
            => filter1=value1&filter2=value2
        """
        expr_str = ""
        for exp in self.exprs:
            if expr_str == "":
                expr_str = exp.to_url()
            else:
                expr_str += '&' + exp.to_url()
        return expr_str

    def __str__(self):
        expr_str = ""
        for exp in self.exprs:
            if expr_str == "":
                expr_str = str(exp)
            else:
                expr_str += ' and ' + str(exp)

        return "(" + expr_str + ")"


class Or(CompoundExpr):
    """Represents the Or operator
    Can contains N expressions
    """

    def _to_url(self):
        """Converts to an url valid format.
            => filter=value1&filter=value2
        """
        #FIXME: invalid representation
        expr_str = ""
        for exp in self.exprs:
            if expr_str == "":
                expr_str = exp.to_url()
            else:
                expr_str += '&' + exp.to_url()
        return expr_str

    def __str__(self):
        expr_str = ""
        for exp in self.exprs:
            if expr_str == "":
                expr_str = str(exp)
            else:
                expr_str += ' or ' + str(exp)

        return "(" + expr_str + ")"


class Concat(CompoundExpr):
    """Represents the abstract representation of a string concatenation
    """

    def _to_url(self):
        """Converts to an url valid format.
            => filter=value1&filter=value2
        """
        expr_str = ""
        for exp in self.exprs:
            expr_str += exp.to_url()
        return expr_str

    def __str__(self):
        expr_str = ""
        for exp in self.exprs:
            expr_str += str(exp)

        return expr_str


class Compiler:
    """Class used to compile abstract expressions
    Compile an abstract expression to a format that can be redefined
    """

    Compilers = dict()

    def url_compile(self, expr):
        """Returns the URL representation of the given expression
        """
        return expr.to_url()

    def compile(self, expr):
        """Compile an abstract expression to the needed format
        """
        return self._compile(expr)

    def _compile(self, expr):
        """Call the appropriated compile based on the expression's type
        """
        exprtype = type(expr)
        return self.Compilers[exprtype](self, expr)

    def _do_sort(self, expr):
        """Manages the SortExpr expressions
        """
        results = map(self._compile, expr.get_exprs())
        return self._do_sort_impl(*results)

    Compilers[SortExpr] = _do_sort

    def _do_asc(self, expr):
        """Manages the Asc expressions
        """
        result = self._compile(expr.expr)
        return self._do_asc_impl(result)

    Compilers[Asc] = _do_asc

    def _do_desc(self, expr):
        """Manages the Desc expressions
        """
        result = self._compile(expr.expr)
        return self._do_desc_impl(result)

    Compilers[Desc] = _do_desc

    def _do_and(self, expr):
        """Manages the And expressions
        """
        results = list()
        for exp in expr.get_exprs():
            results.append(self._compile(exp))
        return self._do_and_impl(*results)

    Compilers[And] = _do_and

    def _do_equal(self, expr):
        """Manages the Equal expressions
        """
        results = list()
        for exp in expr.get_exprs():
            results.append(self._compile(exp))
        return self._do_equal_impl(*results)

    Compilers[Equal] = _do_equal

    def _do_lt(self, expr):
        """Manages the Inf expressions
        """
        results = list()
        for exp in expr.get_exprs():
            results.append(self._compile(exp))
        return self._do_lt_impl(*results)

    Compilers[Lt] = _do_lt

    def _do_gt(self, expr):
        """Manages the Sup expressions
        """
        results = list()
        for exp in expr.get_exprs():
            results.append(self._compile(exp))
        return self._do_gt_impl(*results)

    Compilers[Gt] = _do_gt

    def _do_le(self, expr):
        """Manages the Inf expressions
        """
        results = list()
        for exp in expr.get_exprs():
            results.append(self._compile(exp))
        return self._do_le_impl(*results)

    Compilers[Le] = _do_le

    def _do_ge(self, expr):
        """Manages the Sup expressions
        """
        results = list()
        for exp in expr.get_exprs():
            results.append(self._compile(exp))
        return self._do_ge_impl(*results)

    Compilers[Ge] = _do_ge

    def _do_in(self, expr):
        """Manages the In expressions
        """
        results = list()
        for exp in expr.get_exprs():
            results.append(self._compile(exp))
        return self._do_in_impl(*results)

    Compilers[In] = _do_in

    def _do_nin(self, expr):
        """Manages the Nin expressions
        """
        results = list()
        for exp in expr.get_exprs():
            results.append(self._compile(exp))
        return self._do_nin_impl(*results)

    Compilers[Nin] = _do_nin

    def _do_contains(self, expr):
        """Manages the Contains expressions
        """
        results = list()
        for exp in expr.get_exprs():
            results.append(self._compile(exp))
        return self._do_contains_impl(*results)

    Compilers[Contains] = _do_contains

    def _do_like(self, expr):
        """Manages the Like expressions
        """
        results = list()
        for exp in expr.get_exprs():
            results.append(self._compile(exp))
        return self._do_like_impl(*results)

    Compilers[Like] = _do_like

    def _do_or(self, expr):
        """Manages the Or expressions
        """
        results = list()
        for exp in expr.get_exprs():
            results.append(self._compile(exp))
        return self._do_or_impl(*results)

    Compilers[Or] = _do_or

    def _do_prop(self, prop_compiled):
        """Manages the Prop expressions
        """
        return self._do_prop_impl(prop_compiled)

    Compilers[Prop] = _do_prop

    def _do_const(self, const_compiled):
        """Manages the Const expressions
        """
        return self._do_const_impl(const_compiled)

    Compilers[Const] = _do_const

    def _do_likeoperand(self, operand):
        """Manages the LikeOperand expressions
        """
        concat_compiled = self._compile(operand.get_expr())
        return self._do_likeoperand_impl(concat_compiled)

    Compilers[LikeOperand] = _do_likeoperand

    def _do_likeoperator(self, operand):
        """Manages the LikeOperand expressions
        """
        return self._do_likeoperator_impl(operand)

    Compilers[LikeOperator] = _do_likeoperator

    def _do_dateoperand(self, operand):
        """Manages the DateOperand expressions
        """
        return self._do_dateoperand_impl(operand)

    Compilers[DateOperand] = _do_dateoperand

    def _do_list(self, expr):
        """Manages the List expressions
        """
        parts = list()
        for exp in expr.get_exprs():
            parts.append(self._compile(exp))
        return self._do_list_impl(parts)

    Compilers[ListExpr] = _do_list

    def _do_range(self, expr):
        """Manages the Range expressions
        """
        bounds = list()
        for exp in expr.get_exprs():
            bounds.append(self._compile(exp))
        return self._do_range_impl(*bounds)

    Compilers[RangeExpr] = _do_range

    def _do_concat(self, expr):
        """Manages the Concat expressions
        """
        values = list()
        for exp in expr.get_exprs():
            values.append(self._compile(exp))
        return self._do_concat_impl(*values)

    Compilers[Concat] = _do_concat

    def _do_and_impl(self, *exprs):
        """
        """
        return ' and '.join(exprs)

    def _do_equal_impl(self, oper0, oper1):
        """
        """
        return ' == '.join([oper0, oper1])

    def _do_lt_impl(self, oper0, oper1):
        """
        """
        return ' < '.join([oper0, oper1])

    def _do_gt_impl(self, oper0, oper1):
        """
        """
        return ' > '.join([oper0, oper1])

    def _do_le_impl(self, oper0, oper1):
        """
        """
        return ' <= '.join([oper0, oper1])

    def _do_ge_impl(self, oper0, oper1):
        """
        """
        return ' >= '.join([oper0, oper1])

    def _do_in_impl(self, oper0, oper1):
        """
        """
        return ' in '.join([oper0, oper1])

    def _do_like_impl(self, oper0, oper1):
        """
        """
        return ' like '.join([oper0, oper1])

    def _do_or_impl(self, *exprs):
        """
        """
        return ' or '.join(exprs)

    def _do_prop_impl(self, prop_compiled):
        """
        """
        return str(prop_compiled)

    def _do_const_impl(self, const_compiled):
        """
        """
        return str(const_compiled)

    def _do_likeoperand_impl(self, concat_compiled):
        """
        """
        return str(operand)

    def _do_likeoperator_impl(self, operand):
        """
        """
        return str(operand)

    def _do_dateoperand_impl(self, operand):
        """
        """
        return str(operand)

    def _do_list_impl(self, exprs):
        """
        """
        return "(" + ",".join(exprs) + ")"

    def _do_range_impl(self, oper0, oper1):
        """
        """
        return "[" + ";".join([oper0, oper1]) + "]"

    def _do_concat_impl(self, *exprs):
        """
        """
        return ''.join(exprs)
