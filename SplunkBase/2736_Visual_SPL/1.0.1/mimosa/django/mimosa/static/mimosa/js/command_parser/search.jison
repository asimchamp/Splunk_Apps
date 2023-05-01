%lex
%options flex case-insensitive
%%

\s+                         /* skip whitespace */
'search'                    return 'SEARCH_CMD';
"<"                         return '<';
">"                         return '>';
"<="                        return '<=';
">="                        return '>=';
"!="                        return '!=';
"="                         return '=';
"NOT"                       return 'NOT';
"AND"                       return 'AND';
"OR"                        return 'OR';
"("                         return 'OPEN_PARENTHESIS';
")"                         return 'CLOSE_PARENTHESIS';
\"[^\"]+\"                  return 'QUOTED_STRING';
[0-9|a-z|A-Z|_|-|*]+        return 'IDENTIFIER';
[^\s=\|\"\(\)><!]+          return 'NON_QUOTED_STRING';
<<EOF>>                     return 'EOF';

/lex

%% /* language grammar */

search_command
    : SEARCH_CMD logical_exp EOF
        { return $2; }
    ;

logical_exp
    : and_exp
        { $$ = $1; }
    ;

and_exp
    : or_exp
        { $$ = $1; }
    | or_exp and_exp
        { 
            $$ = { op: 'and', exp: [$1] }; 
            if(Array.isArray($2)) { 
                $$.exp = $$.exp.concat($2); 
            } else {
                $$.exp.push($2);
            }
        }
    ;

or_exp
    : boolean_term
        { $$ = $1; }
    | boolean_term OR or_exp
        { 
            $$ = { op: 'or', exp: [$1] }; 
            if(Array.isArray($3)) { 
                $$.exp = $$.exp.concat($3); 
            } else {
                $$.exp.push($3);
            }
        }
    ;
    
boolean_term
    : NOT boolean_test
        { $$ = '!' + $2; }
    | boolean_test
    ;

boolean_test
    : OPEN_PARENTHESIS and_exp CLOSE_PARENTHESIS 
        { $$ = $2; }
    | predicate
    ;
    
predicate
    : comparison_predicate
    | search_term
    ;

search_term
    : QUOTED_STRING
    | NON_QUOTED_STRING
    | field
    | directive
    ;

directive
    : case_directive
    | term_directive
    ;
    
case_directive
    : 'CASE' OPEN_PARENTHESIS directive_value CLOSE_PARENTHESIS
    ;
    
term_directive
    : 'TERM' OPEN_PARENTHESIS directive_value CLOSE_PARENTHESIS
    ;
    
directive_value
    : field
    | QUOTED_STRING
    | NON_QUOTED_STRING
    ;
    
comparison_predicate
    : field compare_op comparison_value
        { $$ = { op: $2, operands: [$1, $3] }; }
    ;
    
comparison_value
    : field
    | literal_value
    ;
    
literal_value
    : QUOTED_STRING
    | NON_QUOTED_STRING
        { $$ = yytext; }
    ;

field
    : IDENTIFIER
    ;
        
compare_op
    : '<'
    | '>'
    | '<='
    | '>='
    | '!='
    | '='
    ;
