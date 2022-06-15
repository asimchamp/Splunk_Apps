%lex
%options case-insensitive
%x eval

%%
\s+                     /* skip whitespace */
"timechart"             return 'TIMECHART_CMD';
"eval"                  { this.evalParen = 0; this.begin('eval'); return 'EVAL_FUNC'; }
<eval>\"[^\"]+\"        return 'EVAL_QUOTED_STRING';
<eval>"("               { this.evalParen++; if(this.evalParen === 1) { return 'EVAL_OPEN_PARENTHESIS'; } else { return 'EVAL_INNER_OPEN_PARENTHESIS'; } }
<eval>")"               { this.evalParen--; if(this.evalParen === 0) { this.popState(); return 'EVAL_CLOSE_PARENTHESIS'; } else { return 'EVAL_INNER_CLOSE_PARENTHESIS'; }  }
<eval>[^\(\)\"]+        return 'EVAL_EXPRESSION';
"="                     return '=';
"("                     return 'OPEN_PARENTHESIS';
")"                     return 'CLOSE_PARENTHESIS';
"as"                    return 'AS';
"by"                    return 'BY';
"sep"                   return 'SEP_OPT';
"format"                return 'FORMAT_OPT';
"partial"               return 'PARTIAL_OPT';
"cont"                  return 'CONT_OPT';
"limit"                 return 'LIMIT_OPT';
"usenull"               return 'USENULL_TC_OPT';
"useother"              return 'USEOTHER_TC_OPT';
"nullstr"               return 'NULLSTR_TC_OPT';
"otherstr"              return 'OTHERSTR_TC_OPT';
"agg"                   return 'AGG_OPT';
"where"                 return 'WHERE';
"in"                    return 'IN';
"notin"                 return 'NOTIN';
"<"                     return '<';
">"                     return '>';
"bins"                  return 'BUCKET_BINS_OPT';
"span"                  return 'BUCKET_SPAN_OPT';
"start"                 return 'BUCKET_START_OPT';
"end"                   return 'BUCKET_END_OPT';
","                     return 'COMMA';
[0-9|a-z|A-Z|_|-|*]+    return 'IDENTIFIER';
// TODO: 5m is parsed as INTEGER instead of IDENTIFIER for unknown reason
//[0-9]+                  return 'INTEGER';
\"[^\"]+\"              return 'QUOTED_STRING';
<<EOF>>                 return 'EOF';

/lex

%% /* language grammar */

timechart_command
    : TIMECHART_CMD aggregation_list EOF
        { return { aggregation: $2 }; }
    | TIMECHART_CMD aggregation_list split_by_clause EOF
        { return { aggregation: $2, splitBy: $3 }; }
    | TIMECHART_CMD options_list aggregation_list EOF
        { return { options: $2, aggregation: $3 }; }
    | TIMECHART_CMD options_list aggregation_list split_by_clause EOF
        { return { options: $2, aggregation: $3, splitBy: $4 }; }
    ;
    
aggregation_list
    : aggregation
        { $$ = [$1]; }
    | aggregation aggregation_list
        { $$ = [$1].concat($2); }
    | aggregation COMMA aggregation_list
        { $$ = [$1].concat($3); }
    ;

aggregation
    : aggregation_term
        { $$ = { term: $1 }; }
    | aggregation_term AS field
        { $$ = { term: $1, as: $3 }; }
    ;

aggregation_term
    : single_aggregation
        { $$ = $1; }
    | evaled_field
        { $$ = $1; }
    ;

single_aggregation
    : stats_func 
        { $$ = { name: $1 }; }
    | stats_func OPEN_PARENTHESIS wc_evaled_field CLOSE_PARENTHESIS
        { $$ = { name: $1, args: $3 }; }
    ;
    
stats_func
    : IDENTIFIER
    ;
            
wc_evaled_field
    : wc_field
        { $$ = $1; }
    | evaled_field
        { $$ = $1; }
    ;
    
evaled_field
: EVAL_FUNC EVAL_OPEN_PARENTHESIS eval_expression EVAL_CLOSE_PARENTHESIS
        { var exp = 'eval('; $3.forEach(function (t) { exp += t; }); $$ = exp + ')'; }
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
    | aggregation_option
        { $$ = $1; }
    | bucketing_option
        { $$ = $1; }
    ;

aggregation_option
    : AGG_OPT '=' single_aggregation
        { $$ = {}; $$[$1] = $3; }
    ;
        
option_name
    : SEP_OPT
    | FORMAT_OPT
    | PARTIAL_OPT
    | CONT_OPT
    | LIMIT_OPT
    ;
    
option_value
    : literal
    ;

literal
    : IDENTIFIER
    | QUOTED_STRING
    ;

field
    : IDENTIFIER
    ;
    
wc_field
    : IDENTIFIER
    ;
    
field_list
    : wc_field
        { $$ = [$1]; }
    | wc_field field_list
        { $$ = [$1].concat($2); }
    | wc_field COMMA field_list
        { $$ = [$1].concat($3); }
    ;
    
split_by_clause
    : BY split_by
        { $$ = $2; }
    ;
        
split_by
    : field 
        { $$ = { field: $1 }; }
    | field where_clause
        { $$ = { field: $1, where: $2 }; }
    | field tc_option_list 
        { $$ = { field: $1, options: $2 }; }
    | field tc_option_list where_clause
        { $$ = { field: $1, options: $2, where: $3 }; }
    ;
    
tc_option_list
    : tc_option
        { $$ = [$1]; }
    | tc_option tc_option_list
        { $$ = [$1].concat($2); }
    ;
    
tc_option
    : tc_option_name '=' option_value
        { $$ = {}; $$[$1] = $3; }
    | bucketing_option
    ;

tc_option_name
    : NULLSTR_TC_OPT
    | USEOTHER_TC_OPT
    | USENULL_TC_OPT
    | OTHERSTR_TC_OPT
    ;
    
where_clause
    : WHERE single_aggregation where_comp
        { $$ = { agg: $2, comp: $3 }; }
    ;
    
where_comp
    : wherein_comp
        { $$ = $1; }
    | wherethresh_comp
        { $$ = $1; }
    ;
    
wherein_comp
    : wherein IDENTIFIER
        { $$ = $1 + ' ' + $2; }
    ;
    
wherein
    : IN
    | NOTIN
    ;
    
wherethresh_comp
    : thresh_op IDENTIFIER
        { $$ = $1 + ' ' + $2; }
    ;

thresh_op
    : '<'
    | '>'
    ;
    
bucketing_option_list
    : bucketing_option
        { $$ = [$1]; }
    | bucketing_option bucketing_option_list
        { $$ = [$1].concat($2); }
    ;
    
bucketing_option
    : bucketing_option_name '=' option_value
        { $$ = {}; $$[$1] = $3; }
    ;

bucketing_option_name
    : BUCKET_BINS_OPT
    | BUCKET_SPAN_OPT
    | BUCKET_START_OPT
    | BUCKET_END_OPT
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