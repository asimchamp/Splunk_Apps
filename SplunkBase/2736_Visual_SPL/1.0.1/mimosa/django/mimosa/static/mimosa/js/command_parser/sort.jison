%lex
%options case-insensitive

%%
\s+                   /* skip whitespace */
"sort"                return 'SORT_CMD';
"d"                   return 'REVERSE';
"desc"                return 'REVERSE';
","                   return 'COMMA';
"+"                   return '+';
"-"                   return '-';
"("                   return 'OPEN_PARENTHESIS';
")"                   return 'CLOSE_PARENTHESIS';
"auto"                return 'AUTO_SORT_TYPE';
"str"                 return 'STR_SORT_TYPE';
"ip"                  return 'IP_SORT_TYPE';
"num"                 return 'NUM_SORT_TYPE';
[0-9]+                return 'INTEGER';
[0-9|a-z|A-Z|_|-|*]+  return 'IDENTIFIER';
<<EOF>>               return 'EOF';

/lex

%% /* language grammar */

sort_command
    : SORT_CMD sort_by_clause EOF
        { return { fields: $2 }; }
    | SORT_CMD count sort_by_clause EOF
        { return { count: $2, fields: $3 }; }
    | SORT_CMD sort_by_clause reversed_direction EOF
        { return { fields: $2, reversed: true }; }
    | SORT_CMD count sort_by_clause reversed_direction EOF
        { return { count: $2, fields: $3, reversed: true }; }
    ;

count
    : INTEGER
    ;
    
reversed_direction
    : REVERSE
    ;
  
sort_by_clause
    : sort_by
        { $$ = [$1]; }
    | sort_by sort_by_clause
        { $$ = [$1].concat($2); }
    | sort_by COMMA sort_by_clause
        { $$ = [$1].concat($3); }   
    ;
    
sort_by
    : sort_field
        { $$ = $1; $$.direction = 'asc'; }
    | sort_direction sort_field
        { $$ = $2; $$.direction = $1; }
    ;

sort_direction
    : '+'
        { $$ = 'asc'; }
    | '-'
        { $$ = 'desc'; }
    ;
        
sort_field
    : field 
        { $$ = { name: $1, sortType: 'auto' }; }
    | sort_type OPEN_PARENTHESIS field CLOSE_PARENTHESIS
        { $$ = { name: $3, sortType: $1 }; }
    ;

sort_type
    : AUTO_SORT_TYPE
    | STR_SORT_TYPE
    | IP_SORT_TYPE
    | NUM_SORT_TYPE
    ;
    
field
    : IDENTIFIER 
        { $$ = yytext; }
    ;