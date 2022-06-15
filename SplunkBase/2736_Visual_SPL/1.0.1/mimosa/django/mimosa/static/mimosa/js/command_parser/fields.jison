%lex
%options case-insensitive

%%
\s+                   /* skip whitespace */
'fields'              return 'FIELDS_CMD';
"+"                   return '+';
"-"                   return '-';
","                   return 'COMMA';
[0-9|a-z|A-Z|_|*]+    return 'IDENTIFIER';
\"[^\"]+\"            return 'QUOTED_STRING';
<<EOF>>               return 'EOF';

/lex

%% /* language grammar */

fields_command
    : FIELDS_CMD op field_list EOF
        { return [$2, $3]; }
    ;

op
    : /* empty */ 
    | '+'
    | '-'
    ;
    
field_list
    : wc_field
        { $$ = [$1]; }
    | wc_field field_list
        { $$ = [$1].concat($2); }
    | wc_field COMMA field_list
        { $$ = [$1].concat($3); }
    ;
    
wc_field
    : IDENTIFIER 
        { $$ = yytext; }
    | QUOTED_STRING
        { $$ = yytext; }
    ;