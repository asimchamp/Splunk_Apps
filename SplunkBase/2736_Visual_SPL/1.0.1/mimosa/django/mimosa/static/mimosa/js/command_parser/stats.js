

define(function(require){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,16],$V1=[1,17],$V2=[1,12],$V3=[1,13],$V4=[1,14],$V5=[1,15],$V6=[1,20],$V7=[6,59],$V8=[19,20,38],$V9=[6,10,19,20,38,59],$Va=[6,10,14,19,20,38,59],$Vb=[1,32],$Vc=[1,44],$Vd=[1,34],$Ve=[1,35],$Vf=[1,36],$Vg=[1,37],$Vh=[1,38],$Vi=[1,39],$Vj=[1,40],$Vk=[1,41],$Vl=[1,42],$Vm=[1,43],$Vn=[1,45],$Vo=[1,46],$Vp=[1,47],$Vq=[1,59],$Vr=[1,57],$Vs=[6,10,15,19,20,31,32,33,38,47,48,49,50,51,52,53,54,55],$Vt=[6,10,15,19,20,31,32,33,38,47,48,49,50,51,52,53,54,55,59],$Vu=[19,20,31,32,33,38],$Vv=[1,81],$Vw=[1,82],$Vx=[1,83],$Vy=[1,84],$Vz=[6,10,16,19,20,38,59],$VA=[1,86],$VB=[26,61,62,63,64];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"stats_command":3,"STATS_CMD":4,"agg_term_list":5,"EOF":6,"by_clause":7,"options_list":8,"agg_term":9,"COMMA":10,"sparkline_agg_term":11,"stats_agg_term":12,"stats_func":13,"OPEN_PARENTHESIS":14,"CLOSE_PARENTHESIS":15,"AS":16,"field_name":17,"wc_evaled_field":18,"IDENTIFIER":19,"TS_MINUTE_OR_MINIMUM_FUNC":20,"wc_field":21,"evaled_field":22,"EVAL_FUNC":23,"EVAL_OPEN_PARENTHESIS":24,"eval_expression":25,"EVAL_CLOSE_PARENTHESIS":26,"option":27,"option_name":28,"=":29,"option_value":30,"PARTITIONS_OPT":31,"ALLNUM_OPT":32,"DELIM_OPT":33,"literal":34,"INTEGER":35,"QUOTED_STRING":36,"sparkline_agg":37,"SPARKLINE":38,"span_length":39,"time_scale":40,"ts_subseconds":41,"ts_sec":42,"ts_min":43,"ts_hr":44,"ts_day":45,"ts_month":46,"TS_SUBSECONDS_US":47,"TS_SUBSECONDS_MS":48,"TS_SUBSECONDS_CS":49,"TS_SUBSECONDS_DS":50,"TS_SECOND":51,"TS_MINUTE":52,"TS_HOUR":53,"TS_DAY":54,"TS_MONTH":55,"field":56,"non_identifier_field":57,"field_list":58,"BY":59,"eval_token":60,"EVAL_EXPRESSION":61,"EVAL_INNER_OPEN_PARENTHESIS":62,"EVAL_INNER_CLOSE_PARENTHESIS":63,"EVAL_QUOTED_STRING":64,"$accept":0,"$end":1},
terminals_: {2:"error",4:"STATS_CMD",6:"EOF",10:"COMMA",14:"OPEN_PARENTHESIS",15:"CLOSE_PARENTHESIS",16:"AS",19:"IDENTIFIER",20:"TS_MINUTE_OR_MINIMUM_FUNC",23:"EVAL_FUNC",24:"EVAL_OPEN_PARENTHESIS",26:"EVAL_CLOSE_PARENTHESIS",29:"=",31:"PARTITIONS_OPT",32:"ALLNUM_OPT",33:"DELIM_OPT",35:"INTEGER",36:"QUOTED_STRING",38:"SPARKLINE",47:"TS_SUBSECONDS_US",48:"TS_SUBSECONDS_MS",49:"TS_SUBSECONDS_CS",50:"TS_SUBSECONDS_DS",51:"TS_SECOND",52:"TS_MINUTE",53:"TS_HOUR",54:"TS_DAY",55:"TS_MONTH",59:"BY",61:"EVAL_EXPRESSION",62:"EVAL_INNER_OPEN_PARENTHESIS",63:"EVAL_INNER_CLOSE_PARENTHESIS",64:"EVAL_QUOTED_STRING"},
productions_: [0,[3,3],[3,4],[3,4],[3,5],[5,1],[5,2],[5,3],[9,1],[9,1],[12,1],[12,3],[12,5],[12,4],[12,6],[13,1],[13,1],[18,1],[18,1],[22,4],[8,1],[8,2],[27,3],[28,1],[28,1],[28,1],[30,1],[34,1],[34,1],[34,1],[11,1],[11,3],[37,4],[37,6],[37,7],[37,9],[39,1],[39,2],[40,1],[40,1],[40,1],[40,1],[40,1],[40,1],[41,1],[41,1],[41,1],[41,1],[42,1],[43,1],[43,1],[44,1],[45,1],[46,1],[17,1],[17,1],[56,1],[56,1],[21,1],[21,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[58,1],[58,2],[58,3],[7,2],[60,1],[60,1],[60,1],[60,1],[25,1],[25,2]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
 return { aggregations: $$[$0-1] }; 
break;
case 2:
 return { aggregations: $$[$0-2], by: $$[$0-1] }; 
break;
case 3:
 return { options: $$[$0-2], aggregations: $$[$0-1] }; 
break;
case 4:
 return { options: $$[$0-3], aggregations: $$[$0-2], by: $$[$0-1] }; 
break;
case 5: case 20: case 74: case 82:
 this.$ = [$$[$0]]; 
break;
case 6: case 21: case 75: case 83:
 this.$ = [$$[$0-1]].concat($$[$0]); 
break;
case 7: case 76:
 this.$ = [$$[$0-2]].concat($$[$0]); 
break;
case 8:
 this.$ = { sparkline: $$[$0] }; 
break;
case 9:
 this.$ = { func: $$[$0] }; 
break;
case 10:
 this.$ = { name: $$[$0] }; 
break;
case 11:
 this.$ = { name: $$[$0-2] }; 
break;
case 12:
 this.$ = { name: $$[$0-4], as: $$[$0] }; 
break;
case 13:
 this.$ = { name: $$[$0-3], args: $$[$0-1] }; 
break;
case 14:
 this.$ = { name: $$[$0-5], args: $$[$0-3], as: $$[$0] }; 
break;
case 17: case 18: case 30: case 77:
 this.$ = $$[$0]; 
break;
case 19:
 var exp = ''; $$[$0-1].forEach(function (t) { exp += t; }); this.$ = exp; 
break;
case 22:
 this.$ = {}; this.$[$$[$0-2]] = $$[$0]; 
break;
case 31:
 this.$ = $$[$0-2]; this.$.as = $$[$0]; 
break;
case 32:
 this.$ = { name: $$[$0-1] }; 
break;
case 33:
 this.$ = { name: $$[$0-3], span: $$[$0-1] }; 
break;
case 34:
 this.$ = { name: $$[$0-4], args: $$[$0-2] }; 
break;
case 35:
 this.$ = { name: $$[$0-6], args: $$[$0-4], span: $$[$0-1] }; 
break;
case 36:
 this.$ = $$[$0].toString() + ' ' + 'seconds'; 
break;
case 37:
 this.$ = $$[$0-1].toString() + ' ' + $$[$0]; 
break;
case 44:
 this.$ = 'microseconds'; 
break;
case 45:
 this.$ = 'milliseconds'; 
break;
case 46:
 this.$ = 'centiseconds'; 
break;
case 47:
 this.$ = 'deciseconds'; 
break;
case 48:
 this.$ = 'seconds'; 
break;
case 49: case 50:
 this.$ = 'minutes'; 
break;
case 51:
 this.$ = 'hours'; 
break;
case 52:
 this.$ = 'days'; 
break;
case 53:
 this.$ = 'months'; 
break;
}
},
table: [{3:1,4:[1,2]},{1:[3]},{5:3,8:4,9:5,11:7,12:8,13:11,19:$V0,20:$V1,27:6,28:9,31:$V2,32:$V3,33:$V4,37:10,38:$V5},{6:[1,18],7:19,59:$V6},{5:21,9:5,11:7,12:8,13:11,19:$V0,20:$V1,37:10,38:$V5},o($V7,[2,5],{9:5,11:7,12:8,37:10,13:11,5:22,10:[1,23],19:$V0,20:$V1,38:$V5}),o($V8,[2,20],{27:6,28:9,8:24,31:$V2,32:$V3,33:$V4}),o($V9,[2,8]),o($V9,[2,9]),{29:[1,25]},o($V9,[2,30],{16:[1,26]}),o($V9,[2,10],{14:[1,27]}),{29:[2,23]},{29:[2,24]},{29:[2,25]},{14:[1,28]},o($Va,[2,15]),o($Va,[2,16]),{1:[2,1]},{6:[1,29]},{19:$Vb,20:$Vc,21:31,31:$Vd,32:$Ve,33:$Vf,38:$Vg,47:$Vh,48:$Vi,49:$Vj,50:$Vk,51:$Vl,52:$Vm,53:$Vn,54:$Vo,55:$Vp,57:33,58:30},{6:[1,48],7:49,59:$V6},o($V7,[2,6]),{5:50,9:5,11:7,12:8,13:11,19:$V0,20:$V1,37:10,38:$V5},o($V8,[2,21]),{19:[1,54],30:51,34:52,35:[1,53],36:[1,55]},{17:56,19:$Vq,20:$Vc,31:$Vd,32:$Ve,33:$Vf,36:$Vr,38:$Vg,47:$Vh,48:$Vi,49:$Vj,50:$Vk,51:$Vl,52:$Vm,53:$Vn,54:$Vo,55:$Vp,56:58,57:60},{15:[1,61],18:62,19:$Vb,20:$Vc,21:63,22:64,23:[1,65],31:$Vd,32:$Ve,33:$Vf,38:$Vg,47:$Vh,48:$Vi,49:$Vj,50:$Vk,51:$Vl,52:$Vm,53:$Vn,54:$Vo,55:$Vp,57:33},{19:[1,66]},{1:[2,2]},{6:[2,77]},{6:[2,74],10:[1,68],19:$Vb,20:$Vc,21:31,31:$Vd,32:$Ve,33:$Vf,38:$Vg,47:$Vh,48:$Vi,49:$Vj,50:$Vk,51:$Vl,52:$Vm,53:$Vn,54:$Vo,55:$Vp,57:33,58:67},o($Vs,[2,58]),o($Vs,[2,59]),o($Vt,[2,60]),o($Vt,[2,61]),o($Vt,[2,62]),o($Vt,[2,63]),o($Vt,[2,64]),o($Vt,[2,65]),o($Vt,[2,66]),o($Vt,[2,67]),o($Vt,[2,68]),o($Vt,[2,69]),o($Vt,[2,70]),o($Vt,[2,71]),o($Vt,[2,72]),o($Vt,[2,73]),{1:[2,3]},{6:[1,69]},o($V7,[2,7]),o($Vu,[2,22]),o($Vu,[2,26]),o($Vu,[2,27]),o($Vu,[2,28]),o($Vu,[2,29]),o($V9,[2,31]),o($V9,[2,54]),o($V9,[2,55]),o($V9,[2,56]),o($V9,[2,57]),o($V9,[2,11],{16:[1,70]}),{15:[1,71]},{15:[2,17]},{15:[2,18]},{24:[1,72]},{10:[1,74],14:[1,75],15:[1,73]},{6:[2,75]},{19:$Vb,20:$Vc,21:31,31:$Vd,32:$Ve,33:$Vf,38:$Vg,47:$Vh,48:$Vi,49:$Vj,50:$Vk,51:$Vl,52:$Vm,53:$Vn,54:$Vo,55:$Vp,57:33,58:76},{1:[2,4]},{17:77,19:$Vq,20:$Vc,31:$Vd,32:$Ve,33:$Vf,36:$Vr,38:$Vg,47:$Vh,48:$Vi,49:$Vj,50:$Vk,51:$Vl,52:$Vm,53:$Vn,54:$Vo,55:$Vp,56:58,57:60},o($V9,[2,13],{16:[1,78]}),{25:79,60:80,61:$Vv,62:$Vw,63:$Vx,64:$Vy},o($Vz,[2,32]),{35:$VA,39:85},{19:$Vb,20:$Vc,21:87,31:$Vd,32:$Ve,33:$Vf,38:$Vg,47:$Vh,48:$Vi,49:$Vj,50:$Vk,51:$Vl,52:$Vm,53:$Vn,54:$Vo,55:$Vp,57:33},{6:[2,76]},o($V9,[2,12]),{17:88,19:$Vq,20:$Vc,31:$Vd,32:$Ve,33:$Vf,36:$Vr,38:$Vg,47:$Vh,48:$Vi,49:$Vj,50:$Vk,51:$Vl,52:$Vm,53:$Vn,54:$Vo,55:$Vp,56:58,57:60},{26:[1,89]},{25:90,26:[2,82],60:80,61:$Vv,62:$Vw,63:$Vx,64:$Vy},o($VB,[2,78]),o($VB,[2,79]),o($VB,[2,80]),o($VB,[2,81]),{15:[1,91]},{15:[2,36],20:[1,105],40:92,41:93,42:94,43:95,44:96,45:97,46:98,47:[1,99],48:[1,100],49:[1,101],50:[1,102],51:[1,103],52:[1,104],53:[1,106],54:[1,107],55:[1,108]},{15:[1,109]},o($V9,[2,14]),{15:[2,19]},{26:[2,83]},o($Vz,[2,33]),{15:[2,37]},{15:[2,38]},{15:[2,39]},{15:[2,40]},{15:[2,41]},{15:[2,42]},{15:[2,43]},{15:[2,44]},{15:[2,45]},{15:[2,46]},{15:[2,47]},{15:[2,48]},{15:[2,49]},{15:[2,50]},{15:[2,51]},{15:[2,52]},{15:[2,53]},{10:[1,111],15:[1,110]},o($Vz,[2,34]),{35:$VA,39:112},{15:[1,113]},o($Vz,[2,35])],
defaultActions: {12:[2,23],13:[2,24],14:[2,25],18:[2,1],29:[2,2],30:[2,77],48:[2,3],63:[2,17],64:[2,18],67:[2,75],69:[2,4],76:[2,76],89:[2,19],90:[2,83],92:[2,37],93:[2,38],94:[2,39],95:[2,40],96:[2,41],97:[2,42],98:[2,43],99:[2,44],100:[2,45],101:[2,46],102:[2,47],103:[2,48],104:[2,49],105:[2,50],106:[2,51],107:[2,52],108:[2,53]},
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
case 2: this.evalParen = 0; this.begin('eval'); return 23; 
break;
case 3:return 64;
break;
case 4: this.evalParen++; if(this.evalParen === 1) { return 24; } else { return 62; } 
break;
case 5: this.evalParen--; if(this.evalParen === 0) { this.popState(); return 26; } else { return 63; }  
break;
case 6:return 61;
break;
case 7:return 29;
break;
case 8:return 14;
break;
case 9:return 15;
break;
case 10:return 16;
break;
case 11:return 59;
break;
case 12:return 31;
break;
case 13:return 32;
break;
case 14:return 33;
break;
case 15:return 38;
break;
case 16:return 10;
break;
case 17:return 47;
break;
case 18:return 48;
break;
case 19:return 49;
break;
case 20:return 50;
break;
case 21:return 51;
break;
case 22:return 51;
break;
case 23:return 51;
break;
case 24:return 51;
break;
case 25:return 51;
break;
case 26:return 52;
break;
case 27:return 20;
break;
case 28:return 52;
break;
case 29:return 52;
break;
case 30:return 52;
break;
case 31:return 53;
break;
case 32:return 53;
break;
case 33:return 53;
break;
case 34:return 53;
break;
case 35:return 53;
break;
case 36:return 54;
break;
case 37:return 54;
break;
case 38:return 54;
break;
case 39:return 55;
break;
case 40:return 55;
break;
case 41:return 55;
break;
case 42:return 35;
break;
case 43:return 19;
break;
case 44:return 36;
break;
case 45:return 6;
break;
}
},
rules: [/^(?:\s+)/i,/^(?:stats\b)/i,/^(?:eval\b)/i,/^(?:"[^\"]+")/i,/^(?:\()/i,/^(?:\))/i,/^(?:[^\(\)\"]+)/i,/^(?:=)/i,/^(?:\()/i,/^(?:\))/i,/^(?:as\b)/i,/^(?:by\b)/i,/^(?:partitions\b)/i,/^(?:allnum\b)/i,/^(?:delim\b)/i,/^(?:sparkline\b)/i,/^(?:,)/i,/^(?:us\b)/i,/^(?:ms\b)/i,/^(?:cs\b)/i,/^(?:ds\b)/i,/^(?:s\b)/i,/^(?:sec\b)/i,/^(?:secs\b)/i,/^(?:second\b)/i,/^(?:seconds\b)/i,/^(?:m\b)/i,/^(?:min\b)/i,/^(?:mins\b)/i,/^(?:minute\b)/i,/^(?:minutes\b)/i,/^(?:h\b)/i,/^(?:hr\b)/i,/^(?:hrs\b)/i,/^(?:hour\b)/i,/^(?:hours\b)/i,/^(?:d\b)/i,/^(?:day\b)/i,/^(?:days\b)/i,/^(?:mon\b)/i,/^(?:month\b)/i,/^(?:months\b)/i,/^(?:[0-9]+)/i,/^(?:[0-9|a-z|A-Z|_|*]+)/i,/^(?:"[^\"]+")/i,/^(?:$)/i],
conditions: {"eval":{"rules":[3,4,5,6],"inclusive":false},"INITIAL":{"rules":[0,1,2,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
return parser;
});