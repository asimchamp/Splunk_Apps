%lex
%options case-insensitive
%x eval

%%
\s+                   /* skip whitespace */
"stats"               return 'STATS_CMD';
"eval"                { this.evalParen = 0; this.begin('eval'); return 'EVAL_FUNC'; }
<eval>\"[^\"]+\"      return 'EVAL_QUOTED_STRING';
<eval>"("             { this.evalParen++; if(this.evalParen === 1) { return 'EVAL_OPEN_PARENTHESIS'; } else { return 'EVAL_INNER_OPEN_PARENTHESIS'; } }
<eval>")"             { this.evalParen--; if(this.evalParen === 0) { this.popState(); return 'EVAL_CLOSE_PARENTHESIS'; } else { return 'EVAL_INNER_CLOSE_PARENTHESIS'; }  }
<eval>[^\(\)\"]+      return 'EVAL_EXPRESSION';
"="                   return '=';
"("                   return 'OPEN_PARENTHESIS';
")"                   return 'CLOSE_PARENTHESIS';
"as"                  return 'AS';
"by"                  return 'BY';
"partitions"          return 'PARTITIONS_OPT';
"allnum"              return 'ALLNUM_OPT';
"delim"               return 'DELIM_OPT';
"sparkline"           return 'SPARKLINE';
","                   return 'COMMA';
'us'                  return 'TS_SUBSECONDS_US';
'ms'                  return 'TS_SUBSECONDS_MS';
'cs'                  return 'TS_SUBSECONDS_CS';
'ds'                  return 'TS_SUBSECONDS_DS';
's'                   return 'TS_SECOND';
'sec'                 return 'TS_SECOND';
'secs'                return 'TS_SECOND';
'second'              return 'TS_SECOND';
'seconds'             return 'TS_SECOND';
'm'                   return 'TS_MINUTE';
'min'                 return 'TS_MINUTE_OR_MINIMUM_FUNC';
'mins'                return 'TS_MINUTE';
'minute'              return 'TS_MINUTE';
'minutes'             return 'TS_MINUTE';
'h'                   return 'TS_HOUR';
'hr'                  return 'TS_HOUR';
'hrs'                 return 'TS_HOUR';
'hour'                return 'TS_HOUR';
'hours'               return 'TS_HOUR';
'd'                   return 'TS_DAY';
'day'                 return 'TS_DAY';
'days'                return 'TS_DAY';
'mon'                 return 'TS_MONTH';
'month'               return 'TS_MONTH';
'months'              return 'TS_MONTH';
[0-9]+                return 'INTEGER';
[0-9|a-z|A-Z|_|*]+    return 'IDENTIFIER';
\"[^\"]+\"            return 'QUOTED_STRING';
<<EOF>>               return 'EOF';

/lex

%% /* language grammar */

stats_command
    : STATS_CMD agg_term_list EOF
        { return { aggregations: $2 }; }
    | STATS_CMD agg_term_list by_clause EOF
        { return { aggregations: $2, by: $3 }; }
    | STATS_CMD options_list agg_term_list EOF
        { return { options: $2, aggregations: $3 }; }
    | STATS_CMD options_list agg_term_list by_clause EOF
        { return { options: $2, aggregations: $3, by: $4 }; }
    ;
    
agg_term_list
    : agg_term
        { $$ = [$1]; }
    | agg_term agg_term_list
        { $$ = [$1].concat($2); }
    | agg_term COMMA agg_term_list
        { $$ = [$1].concat($3); }
    ;
    
agg_term
    : sparkline_agg_term
        { $$ = { sparkline: $1 }; }
    | stats_agg_term
        { $$ = { func: $1 }; }
    ;

stats_agg_term
    : stats_func
        { $$ = { name: $1 }; }
    | stats_func OPEN_PARENTHESIS CLOSE_PARENTHESIS
        { $$ = { name: $1 }; }
    | stats_func OPEN_PARENTHESIS CLOSE_PARENTHESIS AS field_name
        { $$ = { name: $1, as: $5 }; }
    | stats_func OPEN_PARENTHESIS wc_evaled_field CLOSE_PARENTHESIS
        { $$ = { name: $1, args: $3 }; }
    | stats_func OPEN_PARENTHESIS wc_evaled_field CLOSE_PARENTHESIS AS field_name
        { $$ = { name: $1, args: $3, as: $6 }; }
    ;

stats_func
    : IDENTIFIER
    | TS_MINUTE_OR_MINIMUM_FUNC
    ;
            
wc_evaled_field
    : wc_field
        { $$ = $1; }
    | evaled_field
        { $$ = $1; }
    ;
    
evaled_field
    : EVAL_FUNC EVAL_OPEN_PARENTHESIS eval_expression EVAL_CLOSE_PARENTHESIS
        { var exp = ''; $3.forEach(function (t) { exp += t; }); $$ = exp; }
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
    : PARTITIONS_OPT
    | ALLNUM_OPT
    | DELIM_OPT
    ;
    
option_value
    : literal
    ;

literal
    : INTEGER
    | IDENTIFIER /* bool */
    | QUOTED_STRING
    ;

sparkline_agg_term
    : sparkline_agg 
        { $$ = $1; }
    | sparkline_agg AS field_name
        { $$ = $1; $$.as = $3; }
    ;

sparkline_agg
    : SPARKLINE OPEN_PARENTHESIS IDENTIFIER CLOSE_PARENTHESIS
        { $$ = { name: $3 }; }
    | SPARKLINE OPEN_PARENTHESIS IDENTIFIER COMMA span_length CLOSE_PARENTHESIS
        { $$ = { name: $3, span: $5 }; }
    | SPARKLINE OPEN_PARENTHESIS IDENTIFIER OPEN_PARENTHESIS wc_field CLOSE_PARENTHESIS CLOSE_PARENTHESIS
        { $$ = { name: $3, args: $5 }; }
    | SPARKLINE OPEN_PARENTHESIS IDENTIFIER OPEN_PARENTHESIS wc_field CLOSE_PARENTHESIS COMMA span_length CLOSE_PARENTHESIS
        { $$ = { name: $3, args: $5, span: $8 }; }
    ;

span_length
    : INTEGER
        { $$ = $1.toString() + ' ' + 'seconds'; }
    | INTEGER time_scale
        { $$ = $1.toString() + ' ' + $2; }
    ;

time_scale
    : ts_subseconds
    | ts_sec
    | ts_min
    | ts_hr
    | ts_day
    | ts_month
    ;
    
ts_subseconds
    : TS_SUBSECONDS_US
        { $$ = 'microseconds'; }
    | TS_SUBSECONDS_MS
        { $$ = 'milliseconds'; }
    | TS_SUBSECONDS_CS
        { $$ = 'centiseconds'; }
    | TS_SUBSECONDS_DS
        { $$ = 'deciseconds'; }
    ;
    
ts_sec
    : TS_SECOND
        { $$ = 'seconds'; }
    ;
    
ts_min
    : TS_MINUTE
        { $$ = 'minutes'; }
    | TS_MINUTE_OR_MINIMUM_FUNC
        { $$ = 'minutes'; }
    ;
    
ts_hr
    : TS_HOUR
        { $$ = 'hours'; }
    ;
    
ts_day
    : TS_DAY
        { $$ = 'days'; }
    ;
    
ts_month
    : TS_MONTH
        { $$ = 'months'; }
    ;

field_name
    : QUOTED_STRING
    | field
    ;

field
    : IDENTIFIER
    | non_identifier_field
    ;
    
wc_field
    : IDENTIFIER
    | non_identifier_field
    ;

non_identifier_field
    : PARTITIONS_OPT
    | ALLNUM_OPT
    | DELIM_OPT
    | SPARKLINE
    | TS_SUBSECONDS_US
    | TS_SUBSECONDS_MS
    | TS_SUBSECONDS_CS
    | TS_SUBSECONDS_DS
    | TS_SECOND
    | TS_MINUTE
    | TS_MINUTE_OR_MINIMUM_FUNC
    | TS_HOUR
    | TS_DAY
    | TS_MONTH
    ;
    
field_list
    : wc_field
        { $$ = [$1]; }
    | wc_field field_list
        { $$ = [$1].concat($2); }
    | wc_field COMMA field_list
        { $$ = [$1].concat($3); }
    ;
    
by_clause
    : BY field_list
        { $$ = $2; }
    ;
    
eval_token
    : EVAL_EXPRESSION
    | EVAL_INNER_OPEN_PARENTHESIS
    | EVAL_INNER_CLOSE_PARENTHESIS
    | EVAL_QUOTED_STRING
    ;
    
eval_expression
    : eval_token
        { $$ = [$1]; }
    | eval_token eval_expression
        { $$ = [$1].concat($2); }
    ;