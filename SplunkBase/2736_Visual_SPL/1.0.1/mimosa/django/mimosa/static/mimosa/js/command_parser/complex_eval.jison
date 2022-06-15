%lex

%%
\s+                   /* skip whitespace */
'eval'                return 'EVAL_CMD';
"+"                   return 'PLUS_OP';
"-"                   return 'SUBSTRACT_OP';
"*"                   return 'MULTIPLY_OP';
"/"                   return 'DIVIDE_OP';
"%"                   return 'MOD_OP';
"<"                   return '<';
">"                   return '>';
"<="                  return '<=';
">="                  return '>=';
"!="                  return '!=';
"="                   return '=';
"=="                  return '==';
"LIKE"                return 'LIKE_OP';
"NOT"                 return 'NOT';
"!"                   return 'NOT';
"AND"                 return 'AND';
"OR"                  return 'OR';
"XOR"                 return 'XOR';
[0-9]+                return 'NUMBER';
"("                   return 'OPEN_PARENTHESIS';
")"                   return 'CLOSE_PARENTHESIS';

[0-9|a-z|A-Z|_]+      return 'IDENTIFIER';
<<EOF>>               return 'EOF';

/lex

%% /* language grammar */

eval_command
    : EVAL_CMD eval_field '=' eval_expression EOF
        { return $2; }
    ;

eval_field
    : field 
        { $$ = yytext; }
    ;

eval_expression
    : eval_operand
    | eval_math_exp
    | eval_bool_exp
    ;

eval_operand
    : field
    | NUMBER
    ;

field
    : IDENTIFIER
    ;
           
eval_math_exp
    : eval_operand (math_op eval_expression)+
    ;  
    
eval_bool_exp
    : or_exp
    ;

or_exp
    : xor_exp
    | xor_exp (OR xor_exp)+
    ;

xor_exp
    : and_exp
    | and_exp (XOR and_exp)+
    ;
    
and_exp
    : boolean_term
    | boolean_term (AND boolean_term)+
    ;
    
boolean_term
    : NOT boolean_test
    | boolean_test
    ;

boolean_test
    : predicate
    ;
    
predicate
    : comparison_predicate
    ;
    
comparison_predicate
    : eval_operand compare_op eval_operand
    ;
    
math_op
    : PLUS_OP
    | SUBSTRACT_OP
    | MULTIPLY_OP
    | DIVIDE_OP
    | MOD_OP
    ;

compare_op
    : '<'
    | '>'
    | '<='
    | '>='
    | '!='
    | '=='
    | LIKE_OP
    ;
