%lex
%options case-insensitive

%%
\s+                   return 'WHITE_SPACE';
'eval'                return 'EVAL_CMD';
"="                   return '=';
[^=\s]+               return 'EXP';
<<EOF>>               return 'EOF';

/lex

%% /* language grammar */

eval_command
    : EVAL_CMD WHITE_SPACE eval_field '=' eval_expression EOF
        { var evalCmd = {}; evalCmd[$3] = $5; return evalCmd; }
    | EVAL_CMD WHITE_SPACE eval_field WHITE_SPACE '=' eval_expression EOF
        { var evalCmd = {}; evalCmd[$3] = $6; return evalCmd; }
    ;

eval_field
    : EXP 
    ;

eval_expression
    : EXP
    | WHITE_SPACE 
    | '='
    | WHITE_SPACE eval_expression
        { $$ = $1 + $2; }
    | '=' eval_expression
        { $$ = $1 + $2; }
    | EXP eval_expression
        { $$ = $1 + $2; }
    ;
