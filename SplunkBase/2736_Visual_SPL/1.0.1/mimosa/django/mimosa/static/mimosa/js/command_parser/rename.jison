%lex
%options case-insensitive

%%
\s+                   /* skip whitespace */
'rename'              return 'RENAME_CMD';
"as"                  return 'AS';
[0-9|a-z|A-Z|_|-|*]+  return 'IDENTIFIER';
"*"                   return 'ASTERISK';
\"[^\"]+\"            return 'QUOTED_STRING';
<<EOF>>               return 'EOF';

/lex

%% /* language grammar */

rename_command
    : RENAME_CMD wc_field 'AS' wc_field EOF
        { return [$2, $4]; }
    ;

wc_field
    : IDENTIFIER 
        { $$ = yytext; }
    | IDENTIFIER ASTERISK
        { $$ = $1 + $2; }
    | QUOTED_STRING
        { $$ = yytext; }
    ;