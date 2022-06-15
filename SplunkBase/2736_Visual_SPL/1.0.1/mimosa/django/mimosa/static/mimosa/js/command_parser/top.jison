%lex
%options case-insensitive

%%
\s+                     /* skip whitespace */
"top"                   return 'TOP_CMD';
"by"                    return 'BY';
","                     return 'COMMA';
"="                     return '=';
"showcount"             return 'SHOWCOUNT_OPT';
"showperc"              return 'SHOWPERC_OPT';
"limit"                 return 'LIMIT_OPT';
"countfield"            return 'COUNTFIELD_OPT';
"percentfield"          return 'PERCENTFIELD_OPT';
"useother"              return 'USEOTHER_OPT';
"otherstr"              return 'OTHERSTR_OPT';
[0-9|a-z|A-Z|_|-|*]+    return 'IDENTIFIER';
\"[^\"]+\"              return 'QUOTED_STRING';
<<EOF>>                 return 'EOF';

/lex

%% /* language grammar */

top_command
    : TOP_CMD field_list EOF
        { return { fields: $2 }; }
    | TOP_CMD field_list by_clause EOF
        { return { fields: $2, byfields: $3 }; }
    | TOP_CMD options_list field_list EOF
        { return { options: $2, fields: $3 }; }
    | TOP_CMD options_list field_list by_clause EOF
        { return { options: $2, fields: $3, byfields: $4 }; }
    ;

options_list
    : option
        { $$ = [$1]; }
    | option options_list
        { $$ = [$1].concat($2); }
    ;
    
option
    : option_name '=' option_value
        { $$ = {}; $$[$1] = $3; }
    ;
    
option_name
    : SHOWCOUNT_OPT
    | SHOWPERC_OPT
    | LIMIT_OPT
    | COUNTFIELD_OPT
    | PERCENTFIELD_OPT
    | USEOTHER_OPT
    | OTHERSTR_OPT
    ;
    
option_value
    : IDENTIFIER
    | QUOTED_STRING
    ;
    
field_list
    : field
        { $$ = [$1]; }
    | field field_list
        { $$ = [$1].concat($2); }
    | field COMMA field_list
        { $$ = [$1].concat($3); }
    ;
    
by_clause
    : BY field_list
        { $$ = $2; }
    ;
    
field
    : IDENTIFIER 
        { $$ = yytext; }
    ;