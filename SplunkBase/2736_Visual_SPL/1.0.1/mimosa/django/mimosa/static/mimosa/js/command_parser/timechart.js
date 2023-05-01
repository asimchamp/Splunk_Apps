

define(function(require){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,26],$V1=[1,21],$V2=[1,18],$V3=[1,13],$V4=[1,14],$V5=[1,15],$V6=[1,16],$V7=[1,17],$V8=[1,22],$V9=[1,23],$Va=[1,24],$Vb=[1,25],$Vc=[1,29],$Vd=[6,41],$Ve=[20,22],$Vf=[6,10,20,22,41],$Vg=[20,22,32,33,34,35,36,37,63,64,65,66],$Vh=[6,10,12,20,22,41],$Vi=[6,10,12,20,22,32,33,34,35,36,37,41,56,57,59,60,63,64,65,66],$Vj=[1,43],$Vk=[1,50],$Vl=[1,51],$Vm=[1,60],$Vn=[1,61],$Vo=[1,62],$Vp=[1,63],$Vq=[1,70],$Vr=[1,71],$Vs=[1,72],$Vt=[1,73],$Vu=[1,66],$Vv=[6,20,22,32,33,34,35,36,37,47,48,49,50,51,63,64,65,66],$Vw=[25,68,69,70,71],$Vx=[6,51],$Vy=[6,47,48,49,50,51,63,64,65,66];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"timechart_command":3,"TIMECHART_CMD":4,"aggregation_list":5,"EOF":6,"split_by_clause":7,"options_list":8,"aggregation":9,"COMMA":10,"aggregation_term":11,"AS":12,"field":13,"single_aggregation":14,"evaled_field":15,"stats_func":16,"OPEN_PARENTHESIS":17,"wc_evaled_field":18,"CLOSE_PARENTHESIS":19,"IDENTIFIER":20,"wc_field":21,"EVAL_FUNC":22,"EVAL_OPEN_PARENTHESIS":23,"eval_expression":24,"EVAL_CLOSE_PARENTHESIS":25,"option":26,"option_name":27,"=":28,"option_value":29,"aggregation_option":30,"bucketing_option":31,"AGG_OPT":32,"SEP_OPT":33,"FORMAT_OPT":34,"PARTIAL_OPT":35,"CONT_OPT":36,"LIMIT_OPT":37,"literal":38,"QUOTED_STRING":39,"field_list":40,"BY":41,"split_by":42,"where_clause":43,"tc_option_list":44,"tc_option":45,"tc_option_name":46,"NULLSTR_TC_OPT":47,"USEOTHER_TC_OPT":48,"USENULL_TC_OPT":49,"OTHERSTR_TC_OPT":50,"WHERE":51,"where_comp":52,"wherein_comp":53,"wherethresh_comp":54,"wherein":55,"IN":56,"NOTIN":57,"thresh_op":58,"<":59,">":60,"bucketing_option_list":61,"bucketing_option_name":62,"BUCKET_BINS_OPT":63,"BUCKET_SPAN_OPT":64,"BUCKET_START_OPT":65,"BUCKET_END_OPT":66,"eval_token":67,"EVAL_EXPRESSION":68,"EVAL_INNER_OPEN_PARENTHESIS":69,"EVAL_INNER_CLOSE_PARENTHESIS":70,"EVAL_QUOTED_STRING":71,"$accept":0,"$end":1},
terminals_: {2:"error",4:"TIMECHART_CMD",6:"EOF",10:"COMMA",12:"AS",17:"OPEN_PARENTHESIS",19:"CLOSE_PARENTHESIS",20:"IDENTIFIER",22:"EVAL_FUNC",23:"EVAL_OPEN_PARENTHESIS",25:"EVAL_CLOSE_PARENTHESIS",28:"=",32:"AGG_OPT",33:"SEP_OPT",34:"FORMAT_OPT",35:"PARTIAL_OPT",36:"CONT_OPT",37:"LIMIT_OPT",39:"QUOTED_STRING",41:"BY",47:"NULLSTR_TC_OPT",48:"USEOTHER_TC_OPT",49:"USENULL_TC_OPT",50:"OTHERSTR_TC_OPT",51:"WHERE",56:"IN",57:"NOTIN",59:"<",60:">",63:"BUCKET_BINS_OPT",64:"BUCKET_SPAN_OPT",65:"BUCKET_START_OPT",66:"BUCKET_END_OPT",68:"EVAL_EXPRESSION",69:"EVAL_INNER_OPEN_PARENTHESIS",70:"EVAL_INNER_CLOSE_PARENTHESIS",71:"EVAL_QUOTED_STRING"},
productions_: [0,[3,3],[3,4],[3,4],[3,5],[5,1],[5,2],[5,3],[9,1],[9,3],[11,1],[11,1],[14,1],[14,4],[16,1],[18,1],[18,1],[15,4],[8,1],[8,2],[26,3],[26,1],[26,1],[30,3],[27,1],[27,1],[27,1],[27,1],[27,1],[29,1],[38,1],[38,1],[13,1],[21,1],[40,1],[40,2],[40,3],[7,2],[42,1],[42,2],[42,2],[42,3],[44,1],[44,2],[45,3],[45,1],[46,1],[46,1],[46,1],[46,1],[43,3],[52,1],[52,1],[53,2],[55,1],[55,1],[54,2],[58,1],[58,1],[61,1],[61,2],[31,3],[62,1],[62,1],[62,1],[62,1],[67,1],[67,1],[67,1],[67,1],[24,1],[24,2]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
 return { aggregation: $$[$0-1] }; 
break;
case 2:
 return { aggregation: $$[$0-2], splitBy: $$[$0-1] }; 
break;
case 3:
 return { options: $$[$0-2], aggregation: $$[$0-1] }; 
break;
case 4:
 return { options: $$[$0-3], aggregation: $$[$0-2], splitBy: $$[$0-1] }; 
break;
case 5: case 18: case 34: case 42: case 59: case 70:
 this.$ = [$$[$0]]; 
break;
case 6: case 19: case 35: case 43: case 60: case 71:
 this.$ = [$$[$0-1]].concat($$[$0]); 
break;
case 7: case 36:
 this.$ = [$$[$0-2]].concat($$[$0]); 
break;
case 8:
 this.$ = { term: $$[$0] }; 
break;
case 9:
 this.$ = { term: $$[$0-2], as: $$[$0] }; 
break;
case 10: case 11: case 15: case 16: case 21: case 22: case 37: case 51: case 52:
 this.$ = $$[$0]; 
break;
case 12:
 this.$ = { name: $$[$0] }; 
break;
case 13:
 this.$ = { name: $$[$0-3], args: $$[$0-1] }; 
break;
case 17:
 var exp = 'eval('; $$[$0-1].forEach(function (t) { exp += t; }); this.$ = exp + ')'; 
break;
case 20: case 23: case 44: case 61:
 this.$ = {}; this.$[$$[$0-2]] = $$[$0]; 
break;
case 38:
 this.$ = { field: $$[$0] }; 
break;
case 39:
 this.$ = { field: $$[$0-1], where: $$[$0] }; 
break;
case 40:
 this.$ = { field: $$[$0-1], options: $$[$0] }; 
break;
case 41:
 this.$ = { field: $$[$0-2], options: $$[$0-1], where: $$[$0] }; 
break;
case 50:
 this.$ = { agg: $$[$0-1], comp: $$[$0] }; 
break;
case 53: case 56:
 this.$ = $$[$0-1] + ' ' + $$[$0]; 
break;
}
},
table: [{3:1,4:[1,2]},{1:[3]},{5:3,8:4,9:5,11:7,14:11,15:12,16:20,20:$V0,22:$V1,26:6,27:8,30:9,31:10,32:$V2,33:$V3,34:$V4,35:$V5,36:$V6,37:$V7,62:19,63:$V8,64:$V9,65:$Va,66:$Vb},{6:[1,27],7:28,41:$Vc},{5:30,9:5,11:7,14:11,15:12,16:20,20:$V0,22:$V1},o($Vd,[2,5],{9:5,11:7,14:11,15:12,16:20,5:31,10:[1,32],20:$V0,22:$V1}),o($Ve,[2,18],{26:6,27:8,30:9,31:10,62:19,8:33,32:$V2,33:$V3,34:$V4,35:$V5,36:$V6,37:$V7,63:$V8,64:$V9,65:$Va,66:$Vb}),o($Vf,[2,8],{12:[1,34]}),{28:[1,35]},o($Vg,[2,21]),o($Vg,[2,22]),o($Vh,[2,10]),o($Vh,[2,11]),{28:[2,24]},{28:[2,25]},{28:[2,26]},{28:[2,27]},{28:[2,28]},{28:[1,36]},{28:[1,37]},o($Vi,[2,12],{17:[1,38]}),{23:[1,39]},{28:[2,62]},{28:[2,63]},{28:[2,64]},{28:[2,65]},o([6,10,12,17,20,22,32,33,34,35,36,37,41,56,57,59,60,63,64,65,66],[2,14]),{1:[2,1]},{6:[1,40]},{13:42,20:$Vj,42:41},{6:[1,44],7:45,41:$Vc},o($Vd,[2,6]),{5:46,9:5,11:7,14:11,15:12,16:20,20:$V0,22:$V1},o($Ve,[2,19]),{13:47,20:$Vj},{20:$Vk,29:48,38:49,39:$Vl},{14:52,16:20,20:$V0},{20:$Vk,29:53,38:49,39:$Vl},{15:56,18:54,20:[1,57],21:55,22:$V1},{24:58,67:59,68:$Vm,69:$Vn,70:$Vo,71:$Vp},{1:[2,2]},{6:[2,37]},{6:[2,38],31:69,43:64,44:65,45:67,46:68,47:$Vq,48:$Vr,49:$Vs,50:$Vt,51:$Vu,62:19,63:$V8,64:$V9,65:$Va,66:$Vb},o([6,10,20,22,41,47,48,49,50,51,63,64,65,66],[2,32]),{1:[2,3]},{6:[1,74]},o($Vd,[2,7]),o($Vf,[2,9]),o($Vg,[2,20]),o($Vv,[2,29]),o($Vv,[2,30]),o($Vv,[2,31]),o($Vg,[2,23]),o($Vv,[2,61]),{19:[1,75]},{19:[2,15]},{19:[2,16]},{19:[2,33]},{25:[1,76]},{24:77,25:[2,70],67:59,68:$Vm,69:$Vn,70:$Vo,71:$Vp},o($Vw,[2,66]),o($Vw,[2,67]),o($Vw,[2,68]),o($Vw,[2,69]),{6:[2,39]},{6:[2,40],43:78,51:$Vu},{14:79,16:20,20:$V0},o($Vx,[2,42],{62:19,45:67,46:68,31:69,44:80,47:$Vq,48:$Vr,49:$Vs,50:$Vt,63:$V8,64:$V9,65:$Va,66:$Vb}),{28:[1,81]},o($Vy,[2,45]),{28:[2,46]},{28:[2,47]},{28:[2,48]},{28:[2,49]},{1:[2,4]},o($Vi,[2,13]),o([6,10,12,19,20,22,41],[2,17]),{25:[2,71]},{6:[2,41]},{52:82,53:83,54:84,55:85,56:[1,87],57:[1,88],58:86,59:[1,89],60:[1,90]},o($Vx,[2,43]),{20:$Vk,29:91,38:49,39:$Vl},{6:[2,50]},{6:[2,51]},{6:[2,52]},{20:[1,92]},{20:[1,93]},{20:[2,54]},{20:[2,55]},{20:[2,57]},{20:[2,58]},o($Vy,[2,44]),{6:[2,53]},{6:[2,56]}],
defaultActions: {13:[2,24],14:[2,25],15:[2,26],16:[2,27],17:[2,28],22:[2,62],23:[2,63],24:[2,64],25:[2,65],27:[2,1],40:[2,2],41:[2,37],44:[2,3],55:[2,15],56:[2,16],57:[2,33],64:[2,39],70:[2,46],71:[2,47],72:[2,48],73:[2,49],74:[2,4],77:[2,71],78:[2,41],82:[2,50],83:[2,51],84:[2,52],87:[2,54],88:[2,55],89:[2,57],90:[2,58],92:[2,53],93:[2,56]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        function lex() {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};

/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {"case-insensitive":true},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:return 4;
break;
case 2: this.evalParen = 0; this.begin('eval'); return 22; 
break;
case 3:return 71;
break;
case 4: this.evalParen++; if(this.evalParen === 1) { return 23; } else { return 69; } 
break;
case 5: this.evalParen--; if(this.evalParen === 0) { this.popState(); return 25; } else { return 70; }  
break;
case 6:return 68;
break;
case 7:return 28;
break;
case 8:return 17;
break;
case 9:return 19;
break;
case 10:return 12;
break;
case 11:return 41;
break;
case 12:return 33;
break;
case 13:return 34;
break;
case 14:return 35;
break;
case 15:return 36;
break;
case 16:return 37;
break;
case 17:return 49;
break;
case 18:return 48;
break;
case 19:return 47;
break;
case 20:return 50;
break;
case 21:return 32;
break;
case 22:return 51;
break;
case 23:return 56;
break;
case 24:return 57;
break;
case 25:return 59;
break;
case 26:return 60;
break;
case 27:return 63;
break;
case 28:return 64;
break;
case 29:return 65;
break;
case 30:return 66;
break;
case 31:return 10;
break;
case 32:return 20;
break;
case 33:return 39;
break;
case 34:return 6;
break;
}
},
rules: [/^(?:\s+)/i,/^(?:timechart\b)/i,/^(?:eval\b)/i,/^(?:"[^\"]+")/i,/^(?:\()/i,/^(?:\))/i,/^(?:[^\(\)\"]+)/i,/^(?:=)/i,/^(?:\()/i,/^(?:\))/i,/^(?:as\b)/i,/^(?:by\b)/i,/^(?:sep\b)/i,/^(?:format\b)/i,/^(?:partial\b)/i,/^(?:cont\b)/i,/^(?:limit\b)/i,/^(?:usenull\b)/i,/^(?:useother\b)/i,/^(?:nullstr\b)/i,/^(?:otherstr\b)/i,/^(?:agg\b)/i,/^(?:where\b)/i,/^(?:in\b)/i,/^(?:notin\b)/i,/^(?:<)/i,/^(?:>)/i,/^(?:bins\b)/i,/^(?:span\b)/i,/^(?:start\b)/i,/^(?:end\b)/i,/^(?:,)/i,/^(?:[0-9|a-z|A-Z|_|-|*]+)/i,/^(?:"[^\"]+")/i,/^(?:$)/i],
conditions: {"eval":{"rules":[3,4,5,6],"inclusive":false},"INITIAL":{"rules":[0,1,2,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
return parser;
});