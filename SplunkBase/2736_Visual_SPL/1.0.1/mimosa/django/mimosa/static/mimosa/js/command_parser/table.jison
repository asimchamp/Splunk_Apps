%lex
%options case-insensitive

%%
\s+                   /* skip whitespace */
'table'               return 'TABLE_CMD';
","                   return 'COMMA';
[0-9|a-z|A-Z|_|-|*]+  return 'IDENTIFIER';
\"[^\"]+\"            return 'QUOTED_STRING';
<<EOF>>               return 'EOF';

/lex

%% /* language grammar */

table_command
    : TABLE_CMD field_list EOF
        { return $2; }
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