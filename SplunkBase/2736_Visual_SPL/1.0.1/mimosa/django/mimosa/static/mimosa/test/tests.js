QUnit.config.autostart = false;

var deps = [
    'mimosa/js/pipelined_search',
    'mimosa/js/command_parser/eval',
    'mimosa/js/command_parser/search',
    'mimosa/js/command_parser/stats',
    'mimosa/js/command_parser/rename',
    'mimosa/js/command_parser/timechart',
    'mimosa/js/command_parser/sort',
    'mimosa/js/command_parser/top',
    'mimosa/js/command_parser/fields',
    'mimosa/js/command_parser/table',
    'mimosa/js/command_viewer/search_command_viewer',
    'mimosa/js/command_parser/pipeline'
];
require(deps, function (ps, parser, searchParser, statsParser, renameParser, 
    timechartParser, sortParser, topParser, fieldsParser, tableParser, searchCmdViewer,
    pipelineParser) {
    QUnit.module('pipelined_search.asPipeline');
    QUnit.test('asPipeline for one command search', function (assert) {
        var pipeline = ps.asPipeline('index=_internal');
        assert.equal(pipeline.length, 1, 'One pipeline search');
    });   
    
    QUnit.test('asPipeline for two commands search in same line', function (assert) {
        var search = 'index=_internal | top host';
        var pipeline = ps.asPipeline(search);
        assert.equal(pipeline.length, 1, 
            'Two commands in the same line should be taken as one step');
        assert.equal(pipeline[0], search);
    });   
    
    QUnit.test('asPipeline for two commands search in two lines', function (assert) {
        var pipeline = ps.asPipeline('index=_internal \n| top host');
        assert.equal(pipeline.length, 2, 'Two pipeline groups in search');
        assert.equal(pipeline[0], 'index=_internal', 'First command in search');
        assert.equal(pipeline[1], 'top host', 'Second command in search');
    });   
    
    QUnit.test('asPipeline for search with comments', function (assert) {
        var pipeline = ps.asPipeline('index=_internal \n # this is a comment \n| top host');
        assert.equal(pipeline.length, 2, 'Two commands with one line comment');
        assert.equal(pipeline[0], 'index=_internal', 'First command in search');
        assert.equal(pipeline[1], 'top host', 'Second command in search');
    }); 
    
    QUnit.module('pipelined_search.asTeeSearch');
    QUnit.test('asTeeSearch for one pipe', function (assert) {
        var teeSearch = ps.asTeeSearch(['index=_internal']);
        assert.equal(teeSearch.search, 'index=_internal', 'One pipe without tee');
        assert.equal(teeSearch.teeFiles.length, 0, 'One pipe without tee files');
    });  
    
    QUnit.test('asTeeSearch for two pipes', function (assert) {
        var teeSearch = ps.asTeeSearch(['index=_internal', 'top host']);
        assert.ok(teeSearch.search.indexOf('outputcsv') > 0);
        assert.equal(teeSearch.teeFiles.length, 1, 'Two pipes contain one tee file');
    });  
    
    QUnit.module('command parsers');
    QUnit.test('eval command field = field', function (assert) {
        var result = parser.parse('eval host=date');
        assert.ok(result);
        assert.equal(result.host, 'date', 'eval field should be extracted');
    });  
    
    QUnit.test('eval command field = number', function (assert) {
        var result = parser.parse('eval host=20');
        assert.ok(result);
        assert.equal(result.host, 20, 'eval field should be extracted');
    });  
    
    QUnit.test('eval command field name with underscore', function (assert) {
        var result = parser.parse('eval m_day=20');
        assert.ok(result);
        assert.equal(result.m_day, '20', 'eval field should be extracted');
    });  
    
    
    QUnit.test('eval command field = field * number', function (assert) {
        var result = parser.parse('eval host=date * 20');
        assert.ok(result);
        assert.equal(result.host, 'date * 20', 'eval field should be extracted');
    });  
    
    QUnit.test('eval command field = field < number', function (assert) {
        var result = parser.parse('eval host=mday < 20');
        assert.ok(result);
        assert.equal(result.host, 'mday < 20', 'eval field should be extracted');
    });  
    
    QUnit.test('eval command bool exp field = NOT field < number', function (assert) {
        var result = parser.parse('eval host=NOT mday < 20');
        assert.ok(result);
        assert.equal(result.host, 'NOT mday < 20', 'eval field should be extracted');
    });  
    
    QUnit.test('eval command bool exp AND', function (assert) {
        var result = parser.parse('eval host=mday < 20 AND mday < 21');
        assert.ok(result);
        assert.equal(result.host, 'mday < 20 AND mday < 21', 'eval field should be extracted');
    });  
    
    QUnit.test('eval command if statement', function (assert) {
        var result = parser.parse('eval network=if(cidrmatch("192.0.0.0/16", clientip), "local", "other")');
        assert.ok(result);
        assert.equal(result.network, 'if(cidrmatch("192.0.0.0/16", clientip), "local", "other")');
    });  
    
    QUnit.test('eval command complex AND', function (assert) {
        var result = parser.parse('eval Description=case(depth<=70, "Shallow", depth>70 AND depth<=300, "Mid", depth>300, "Deep")');
        assert.ok(result);
        assert.equal(result.Description, 'case(depth<=70, "Shallow", depth>70 AND depth<=300, "Mid", depth>300, "Deep")', 'eval field should be extracted');
    });  
    
    QUnit.test('eval command with function', function (assert) {
        var result = parser.parse('eval phone=coalesce(number,subscriberNumber)');
        assert.ok(result);
        assert.equal(result.phone, 'coalesce(number,subscriberNumber)', 'eval field should be extracted');
    });  
    
    QUnit.test('eval command with @', function (assert) {
        var result = parser.parse('eval accountname=split(mailfrom,"@")');
        assert.ok(result);
        assert.equal(result.accountname, 'split(mailfrom,"@")', 'eval field should be extracted');
    });  
    
    QUnit.test('eval command with regular expression', function (assert) {
        var result = parser.parse('eval location=if(match(from_domain, "[^\n\r\s]+\.(com|net|org)"), "local", "abroad")');
        assert.ok(result);
        assert.equal(result.location, 'if(match(from_domain, "[^\n\r\s]+\.(com|net|org)"), "local", "abroad")', 'eval field should be extracted');
    });  
    
    QUnit.test('eval command with quoted string', function (assert) {
        var result = parser.parse('eval durationstr=tostring(duration,"duration")');
        assert.ok(result);
        assert.equal(result.durationstr, 'tostring(duration,"duration")', 'eval field should be extracted');
    });  
    
    QUnit.test('eval command with multiple functions', function (assert) {
        var result = parser.parse('eval sum_of_areas = pi() * pow(radius_a, 2) + pi() * pow(radius_b, 2)');
        assert.ok(result);
        assert.equal(result['sum_of_areas'], ' pi() * pow(radius_a, 2) + pi() * pow(radius_b, 2)', 'eval field should be extracted');
    });  
    
    QUnit.test('eval command with concatenation', function (assert) {
        var result = parser.parse('eval full_name = first_name." ".last_nameSearch');
        assert.ok(result);
        assert.equal(result.full_name, ' first_name." ".last_nameSearch', 'eval field should be extracted');
    });  
    
    QUnit.test('search command field = field', function (assert) {
        var result = searchParser.parse('search host=date');
        assert.ok(result);
    });  
    
    QUnit.test('search command with dot in comparision value', function (assert) {
        var result = searchParser.parse('search host=example.com');
        assert.ok(result);
        assert.deepEqual(result, { op: '=', operands: ['host', "example.com"] });
    });  
    
    QUnit.test('search command number literal', function (assert) {
        var result = searchParser.parse('search 500');
        assert.ok(result);
        assert.deepEqual(result, '500');
    });  
    
    QUnit.test('search command field = number', function (assert) {
        var result = searchParser.parse('search host=2');
        assert.ok(result);
        assert.deepEqual(result, { op: '=', operands: ['host', "2"] });
    });  
    
    QUnit.test('search command with wildcard', function (assert) {
        var result = searchParser.parse('search index=m*');
        assert.ok(result);
        assert.deepEqual(result, { op: '=', operands: ['index', "m*"] });
    });  
    
    QUnit.test('search command with quoted string', function (assert) {
        var result = searchParser.parse('search host="example.com"');
        assert.ok(result);
    });  
    
    QUnit.test('search command without comparison', function (assert) {
        var result = searchParser.parse('search host=123 hello');
        assert.ok(result);
    });  
    
    QUnit.test('search command with comparision separated by non comparison', function (assert) {
        var result = searchParser.parse('search host=123 hello source=abc');
        assert.ok(result);
    });
    
    QUnit.test('search command with AND', function (assert) {
        var result = searchParser.parse('search host="example.com" source=211');
        assert.ok(result);
        assert.equal(result.op, 'and');
        assert.equal(result.exp.length, 2);
        assert.deepEqual(result.exp[0], { op: '=', operands: ['host', '"example.com"'] });
        assert.deepEqual(result.exp[1], { op: '=', operands: ['source', "211"] });
    });  
    
    QUnit.test('search command with multiple AND', function (assert) {
        var result = searchParser.parse('search host="example.com" source=211 sourcetype="abc"');
        assert.ok(result);
    });  
    
    QUnit.test('search command with OR', function (assert) {
        var result = searchParser.parse('search host="example.com" source=211 OR sourcetype="abc"');
        assert.ok(result);
    });  
    
    QUnit.test('search command with simple parenthesis', function (assert) {
        var result = searchParser.parse('search (source=211)');
        assert.ok(result);
    });
    
    QUnit.test('search command with greater than comparision', function (assert) {
        var result = searchParser.parse('search source>=211');
        assert.ok(result);
    });
    
    QUnit.test('search command with ip address', function (assert) {
        var result = searchParser.parse('search src="10.9.165.*" OR dst="10.9.165.8"');
        assert.ok(result);
    });
    
    QUnit.test('search command with CASE directive', function (assert) {
        var result = searchParser.parse('search CASE(hello)');
        assert.ok(result);
    });
    
    QUnit.test('search command with CASE directive with quotes', function (assert) {
        var result = searchParser.parse('search CASE("hello")');
        assert.ok(result);
    });
    
    QUnit.test('search command with TERM directive', function (assert) {
        var result = searchParser.parse('search TERM(hello)');
        assert.ok(result);
    });
    
    QUnit.test('search command with wildcard comparision value', function (assert) {
        var result = searchParser.parse('search host=webserver* (status=4* OR status=5*)');
        assert.ok(result);
    });
    
    QUnit.test('search command with parenthesis', function (assert) {
        var result = searchParser.parse('search host="example.com" (source=211 OR sourcetype="abc")');
        assert.ok(result);
        assert.equal(result.op, 'and');
        assert.equal(result.exp.length, 2);
        assert.deepEqual(result.exp[0], { op: '=', operands: ['host', '"example.com"'] });
        assert.equal(result.exp[1].op, 'or');
        assert.equal(result.exp[1].exp.length, 2);
        assert.deepEqual(result.exp[1].exp[0], { op: '=', operands: ['source', "211"] });
        assert.deepEqual(result.exp[1].exp[1], { op: '=', operands: ['sourcetype', '"abc"'] });
    });  
    
    QUnit.test('stats command with sparkline', function (assert) {
        var result = statsParser.parse('stats sparkline(count)');
        assert.ok(result);
        assert.ok(result.aggregations);
        assert.ok(result.aggregations[0].sparkline);
        assert.equal(result.aggregations[0].sparkline.name, 'count');
    });  
    
    QUnit.test('stats command with by', function (assert) {
        var result = statsParser.parse('stats sum(b) as b by _time, pool, s, st, h, idx');
        assert.ok(result);
    });  
    
    QUnit.test('stats command with sparkline count', function (assert) {
        var result = statsParser.parse('stats sparkline(count(source))');
        assert.ok(result);
        assert.ok(result.aggregations[0]);
        assert.ok(result.aggregations[0].sparkline);
        assert.equal(result.aggregations[0].sparkline.name, 'count');
        assert.equal(result.aggregations[0].sparkline.args, 'source');
    });  
    
    QUnit.test('stats command with sparkline function', function (assert) {
        var result = statsParser.parse('stats sparkline(dc(source))');
        assert.ok(result);
        assert.equal(result.aggregations[0].sparkline.name, 'dc');
        assert.equal(result.aggregations[0].sparkline.args, 'source');
    });  
    
    QUnit.test('stats command with timescale', function (assert) {
        var result = statsParser.parse('stats sparkline(dc(source), 5m)');
        assert.ok(result);
        assert.equal(result.aggregations[0].sparkline.name, 'dc');
        assert.equal(result.aggregations[0].sparkline.args, 'source');
        assert.equal(result.aggregations[0].sparkline.span, '5 minutes');
    });  
    
    QUnit.test('stats command with options', function (assert) {
        var result = statsParser.parse('stats allnum=true sparkline(dc(source))');
        assert.ok(result);
        assert.ok(result.options);
        assert.equal(result.aggregations[0].sparkline.name, 'dc');
        assert.equal(result.aggregations[0].sparkline.args, 'source');
    });  
    
    QUnit.test('stats command with two options', function (assert) {
        var result = statsParser.parse('stats partitions=2 allnum=true sparkline(dc(source))');
        assert.ok(result);
        assert.ok(result.options);
        assert.equal(result.aggregations[0].sparkline.name, 'dc');
        assert.equal(result.aggregations[0].sparkline.args, 'source');
        assert.deepEqual(result.options, [{ 'partitions': '2' }, { 'allnum': 'true' }]);
    });  
    
    QUnit.test('stats command with by clause', function (assert) {
        var result = statsParser.parse('stats sparkline(dc(source)) by sourcetype');
        assert.ok(result);
    });  
    
    QUnit.test('stats command with options and by clause', function (assert) {
        var result = statsParser.parse('stats allnum=true sparkline(dc(source)) by sourcetype');
        assert.ok(result);
        assert.deepEqual(result.options, [{ 'allnum': 'true' }]);
    });  
    
    QUnit.test('stats command with stats function', function (assert) {
        var result = statsParser.parse('stats avg(kbps)');
        assert.ok(result);
    });  
    
    QUnit.test('stats command with wildcard field', function (assert) {
        var result = statsParser.parse('stats stdev(*delay)');
        assert.ok(result);
    });  
    
    QUnit.test('stats command with stats function and new field', function (assert) {
        var result = statsParser.parse('stats avg(kbps) as average_kbps');
        assert.ok(result);
    });  
    
    QUnit.test('stats command with evaled field', function (assert) {
        var result = statsParser.parse('stats count(eval(sourcetype="splunkd"))');
        assert.ok(result);
        assert.equal(result.aggregations[0].func.name, 'count');
        assert.deepEqual(result.aggregations[0].func.args, 'sourcetype="splunkd"');
    });  
    
    QUnit.test('stats command with two evaled fields', function (assert) {
        var result = statsParser.parse('stats count(eval(method="GET")) as GET, count(eval(method="POST")) as POST by host');
        assert.ok(result);
        assert.equal(result.aggregations[0].func.name, 'count');
        assert.deepEqual(result.aggregations[0].func.args, 'method="GET"');
    });  
    
    QUnit.test('stats command with multiple aggregations', function (assert) {
        var result = statsParser.parse('stats count, max(mag), min(mag), range(mag), avg(mag) by magType');
        assert.ok(result);
        assert.equal(result.aggregations.length, 5);
        assert.equal(result.aggregations[0].func.name, 'count');
        assert.ok(!result.aggregations[0].func.args);
        assert.equal(result.aggregations[4].func.name, 'avg');
        assert.ok(result.aggregations[4].func.args, 'mag');
    });  
    
    QUnit.test('stats command with uppper case AS', function (assert) {
        var result = statsParser.parse('stats sum(price) AS Revenue');
        assert.ok(result);
        assert.equal(result.aggregations.length, 1);
    });  
    
    QUnit.test('stats command with quoted new field', function (assert) {
        var result = statsParser.parse('stats sum(price) as "Revenue"');
        assert.ok(result);
        assert.equal(result.aggregations.length, 1);
    });  
    
    QUnit.test('stats command with multiple as', function (assert) {
        var result = statsParser.parse('stats values(categoryId) AS Type, values(productName) AS Name, sum(price) AS "Revenue" by productId');
        assert.ok(result);
        assert.equal(result.aggregations.length, 3);
    });  
    
    QUnit.test('stats command with wildcard field', function (assert) {
        var result = statsParser.parse('stats avg(*lay) BY date_hour');
        assert.ok(result);
        assert.equal(result.aggregations.length, 1);
    });  
    
    QUnit.test('stats command with parenthesis in eval', function (assert) {
        var result = statsParser.parse('stats count(eval(match(from_domain, ".com")))');
        assert.ok(result);
        assert.equal(result.aggregations.length, 1);
    });  
    
    QUnit.test('stats command with unbalanced parenthesis in quoted string in eval', function (assert) {
        var result = statsParser.parse('stats count(eval(NOT match(from_domain, "(com"))) AS "other"');
        assert.ok(result);
        assert.equal(result.aggregations.length, 1);
    });  
    
    QUnit.test('rename command with two fields', function (assert) {
        var result = renameParser.parse('rename foo as bar');
        assert.ok(result);
        assert.equal(result[0], 'foo');
        assert.equal(result[1], 'bar');
    });  
    
    QUnit.test('rename command with one string field', function (assert) {
        var result = renameParser.parse('rename foo as "hello world"');
        assert.ok(result);
        assert.equal(result[0], 'foo');
        assert.equal(result[1], '"hello world"');
    });  
    
    QUnit.test('rename command with two string fields', function (assert) {
        var result = renameParser.parse('rename "foo bar" as "hello world"');
        assert.ok(result);
        assert.equal(result[0], '"foo bar"');
        assert.equal(result[1], '"hello world"');
    });  
    
    QUnit.test('rename command with wildcard string fields', function (assert) {
        var result = renameParser.parse('rename foo* as bar*');
        assert.ok(result);
        assert.equal(result[0], 'foo*');
        assert.equal(result[1], 'bar*');
    });  
    
    QUnit.test('top command with one field', function (assert) {
        var result = topParser.parse('top host');
        assert.ok(result);
        assert.deepEqual(result.fields, ['host']);
    });  
    
    QUnit.test('top command with two fields', function (assert) {
        var result = topParser.parse('top host source');
        assert.ok(result);
        assert.deepEqual(result.fields, ['host', 'source']);
    });  
    
    QUnit.test('top command with two comma separated fields', function (assert) {
        var result = topParser.parse('top host, source');
        assert.ok(result);
        assert.deepEqual(result.fields, ['host', 'source']);
    });  
    
    QUnit.test('top command with options', function (assert) {
        var result = topParser.parse('top limit=20 host');
        assert.ok(result);
        assert.deepEqual(result.fields, ['host']);
        assert.deepEqual(result.options, [{ limit: '20' }]);
    });  
    
    QUnit.test('top command with multiple options', function (assert) {
        var result = topParser.parse('top showcount=true limit=20 host');
        assert.ok(result);
        assert.deepEqual(result.fields, ['host']);
        assert.deepEqual(result.options, [{ showcount: 'true' }, { limit: '20' }]);
    });  
    
    QUnit.test('top command with by clause', function (assert) {
        var result = topParser.parse('top host by source');
        assert.ok(result);
        assert.deepEqual(result.fields, ['host']);
        assert.deepEqual(result.byfields, ['source']);
    });  
    
    QUnit.test('top command with multiple by fields', function (assert) {
        var result = topParser.parse('top host by source, sourcetype');
        assert.ok(result);
        assert.deepEqual(result.fields, ['host']);
        assert.deepEqual(result.byfields, ['source', 'sourcetype']);
    });  
    
    QUnit.test('top command with all', function (assert) {
        var result = topParser.parse('top countfield="c" limit=20 host, ip by source, sourcetype');
        assert.ok(result);
        assert.deepEqual(result.fields, ['host', 'ip']);
        assert.deepEqual(result.options, [{ countfield: '"c"' }, { limit: '20' }]);
        assert.deepEqual(result.byfields, ['source', 'sourcetype']);
    });  
    
    QUnit.test('fields command with single field', function (assert) {
        var result = fieldsParser.parse('fields host');
        assert.ok(result);
        assert.equal(result[0], undefined);
        assert.deepEqual(result[1], ['host']);
    });  
    
    QUnit.test('fields command with single wildcard', function (assert) {
        var result = fieldsParser.parse('fields *');
        assert.ok(result);
        assert.equal(result[0], undefined);
        assert.deepEqual(result[1], ['*']);
    });  
    
    QUnit.test('fields command with two fields', function (assert) {
        var result = fieldsParser.parse('fields host, source');
        assert.ok(result);
        assert.equal(result[0], undefined);
        assert.deepEqual(result[1], ['host', 'source']);
    });  
    
    QUnit.test('fields command with wildcard', function (assert) {
        var result = fieldsParser.parse('fields host, _*');
        assert.ok(result);
        assert.equal(result[0], undefined);
        assert.deepEqual(result[1], ['host', '_*']);
    });  
    
    QUnit.test('fields command with + op', function (assert) {
        var result = fieldsParser.parse('fields + host, source');
        assert.ok(result);
        assert.equal(result[0], '+');
        assert.deepEqual(result[1], ['host', 'source']);
    });  
    
    QUnit.test('fields command with - op', function (assert) {
        var result = fieldsParser.parse('fields - host, source');
        assert.ok(result);
        assert.equal(result[0], '-');
        assert.deepEqual(result[1], ['host', 'source']);
    });  
    
    QUnit.test('table command with single field', function (assert) {
        var result = tableParser.parse('table host');
        assert.ok(result);
        assert.deepEqual(result, ['host']);
    });  
    
    QUnit.test('table command with two fields', function (assert) {
        var result = tableParser.parse('table host source');
        assert.ok(result);
        assert.deepEqual(result, ['host', 'source']);
    });  
    
    QUnit.test('table command with two comma separated fields', function (assert) {
        var result = tableParser.parse('table host, source');
        assert.ok(result);
        assert.deepEqual(result, ['host', 'source']);
    });  
    
    QUnit.test('table command with wildcard fields', function (assert) {
        var result = tableParser.parse('table host, source, foo*');
        assert.ok(result);
        assert.deepEqual(result, ['host', 'source', 'foo*']);
    });  
    
    QUnit.test('table command with asterisk field', function (assert) {
        var result = tableParser.parse('table *');
        assert.ok(result);
        assert.deepEqual(result, ['*']);
    });  
    
    QUnit.test('timechart command with single aggregation', function (assert) {
        var result = timechartParser.parse('timechart avg(delay)');
        assert.ok(result);
        assert.ok(result.aggregation);
        assert.equal(result.aggregation.length, 1);
        var agg = result.aggregation[0].term;
        assert.equal(agg.name, 'avg');
        assert.equal(agg.args, 'delay');
    });  
    
    QUnit.test('timechart command with single aggregation with new field', function (assert) {
        var result = timechartParser.parse('timechart avg(delay) as avg_delay');
        assert.ok(result);
        assert.equal(result.aggregation[0].as, 'avg_delay');
    });  
    
    QUnit.test('timechart command with option', function (assert) {
        var result = timechartParser.parse('timechart limit=20 avg(thruput)');
        assert.ok(result);
        assert.deepEqual(result.options[0], { 'limit': '20' });
    });  
    
    QUnit.test('timechart command with agg option', function (assert) {
        var result = timechartParser.parse('timechart agg=avg(date_mday) avg(thruput)');
        assert.ok(result);
        assert.ok(result.options[0]);
    });  
    
    QUnit.test('timechart command with split by', function (assert) {
        var result = timechartParser.parse('timechart avg(thruput) by host');
        assert.ok(result);
        assert.equal(result.splitBy.field, 'host');
    });  
    
    QUnit.test('timechart command with evaled field', function (assert) {
        var result = timechartParser.parse('timechart eval(1 + 2) by host');
        assert.ok(result);
    });  
    
    QUnit.test('timechart command with bucket bins option', function (assert) {
        var result = timechartParser.parse('timechart span=5m avg(delay) by host');
        assert.ok(result);
        assert.deepEqual(result.options[0], { 'span': '5m' });
    });  
    
    QUnit.test('timechart command with where clause', function (assert) {
        var result = timechartParser.parse('timechart avg(delay) by host where min in top5');
        assert.ok(result);
        assert.equal(result.splitBy.field, 'host');
        assert.ok(result.splitBy.where);
        
        assert.deepEqual(result.splitBy.where, { agg: { name: 'min' }, comp: 'in top5' });
    });  
    
    QUnit.test('timechart command with time scale option', function (assert) {
        var result = timechartParser.parse('timechart per_hour(price) by productName usenull=f useother=f');
        assert.ok(result);
    });  
    
    QUnit.test('timechart command with option and time scale option', function (assert) {
        var result = timechartParser.parse('timechart span=1d count by categoryId usenull=f');
        assert.ok(result);
    });  
    
    QUnit.test('timechart command with comma separated evals', function (assert) {
        var result = timechartParser.parse('timechart per_hour(eval(method="GET")) AS Views, per_hour(eval(action="purchase")) AS Purchases');
        assert.ok(result);
    });  
    
    QUnit.test('timechart command for eval with parenthesis', function (assert) {
        var result = timechartParser.parse('timechart span=1h sum(eval(if(log_level=="INFO",1,0))) by source WHERE sum > 100');
        assert.ok(result);
    });  
    
    QUnit.test('timechart command for eval math', function (assert) {
        var result = timechartParser.parse('timechart span=1m eval(avg(CPU) * avg(MEM)) by host');
        assert.ok(result);
    });  
    
    QUnit.test('timechart command for eval with three level parenthesis', function (assert) {
        var result = timechartParser.parse('timechart eval(round(avg(cpu_seconds),2)) by processor');
        assert.ok(result);
    });  
    
    QUnit.test('timechart command with where comparision', function (assert) {
        var result = timechartParser.parse('timechart span=1h count by source WHERE count > 100');
        assert.ok(result);
    });  
    
    QUnit.test('sort command one field', function (assert) {
        var result = sortParser.parse('sort host');
        assert.ok(result);
        assert.deepEqual(result.fields, [{ name: 'host', direction: 'asc', sortType: 'auto' }]);
    });  
    
    QUnit.test('sort command multiple fields', function (assert) {
        var result = sortParser.parse('sort host, source');
        assert.ok(result);
        assert.deepEqual(result.fields, [{ name: 'host', direction: 'asc', sortType: 'auto' },
                                         { name: 'source', direction: 'asc', sortType: 'auto' }]);
    });  
    
    QUnit.test('sort command with sort direction', function (assert) {
        var result = sortParser.parse('sort -host, +source');
        assert.ok(result);
        assert.deepEqual(result.fields, [{ name: 'host', direction: 'desc', sortType: 'auto' },
                                         { name: 'source', direction: 'asc', sortType: 'auto' }]);
    });  
    
    QUnit.test('sort command with count', function (assert) {
        var result = sortParser.parse('sort 100 host, +source');
        assert.ok(result);
        assert.equal(result.count, 100);
        assert.deepEqual(result.fields, [{ name: 'host', direction: 'asc', sortType: 'auto' },
                                         { name: 'source', direction: 'asc', sortType: 'auto' }]);
    });  
    
    QUnit.test('sort command with sort type', function (assert) {
        var result = sortParser.parse('sort 100 source, str(host), ip(private_ip)');
        assert.ok(result);
        assert.equal(result.count, 100);
        assert.deepEqual(result.fields, [{ name: 'source', direction: 'asc', sortType: 'auto' },
                                         { name: 'host', direction: 'asc', sortType: 'str' },
                                         { name: 'private_ip', direction: 'asc', sortType: 'ip' }]);
    });  
    
    QUnit.test('sort command with reversed results', function (assert) {
        var result = sortParser.parse('sort 100 source desc');
        assert.ok(result);
        assert.equal(result.count, 100);
        assert.deepEqual(result.fields, [{ name: 'source', direction: 'asc', sortType: 'auto' }]);
        assert.equal(result.reversed, true);
    });  
    
    QUnit.module('search command viewer');
    var inspectSearchCommand = function (command, vars) {
        var parsedCommand = searchParser.parse(command);
        return searchCmdViewer.inspect(command, parsedCommand, vars);
    };
    
    QUnit.test('inspect AND two false equal comparison', function (assert) {
        var node = inspectSearchCommand('search host=123 source=abc', {});
        assert.equal(node.value, false);
    });   
    
    QUnit.test('inspect AND one false and one true equal comparison', function (assert) {
        var node = inspectSearchCommand('search host=123 source=abc', { host: '123' });
        assert.equal(node.value, false);
    });   
    
    QUnit.test('inspect AND two true equal comparison', function (assert) {
        var node = inspectSearchCommand('search host=123 source=abc', { host: '123', source: 'abc' });
        assert.equal(node.value, true);
    });   
    
    QUnit.test('inspect OR two false equal comparison', function (assert) {
        var node = inspectSearchCommand('search host=123 OR source=abc', {});
        assert.equal(node.value, false);
    });   
    
    QUnit.test('inspect OR one false and one true equal comparison', function (assert) {
        var node = inspectSearchCommand('search host=123 OR source=abc', { host: '123' });
        assert.equal(node.value, true);
    });   
    
    QUnit.test('inspect OR two true equal comparison', function (assert) {
        var node = inspectSearchCommand('search host=123 OR source=abc', { host: '123', source: 'abc' });
        assert.equal(node.value, true);
    }); 
    
    QUnit.test('inspect AND OR mixed comparison', function (assert) {
        var node = inspectSearchCommand('search ip=xyz host=123 OR source=abc', { source: 'abc' });
        assert.equal(node.value, false);
    });
    
    QUnit.module('pipelined parser');
    QUnit.test('parser single command', function (assert) {
        var pipeline = pipelineParser.parse('search abc');
        assert.equal(pipeline.commands.length, 1);
        assert.equal(pipeline.leadingPipe, false);
        assert.equal(pipeline.commands[0], 'search abc');
    });
    
    QUnit.test('parser piped commands', function (assert) {
        var pipeline = pipelineParser.parse('search abc | fields host');
        assert.equal(pipeline.commands.length, 2);
        assert.equal(pipeline.leadingPipe, false);
        assert.equal(pipeline.commands[0], 'search abc');
        assert.equal(pipeline.commands[1], 'fields host');
    });
    
    QUnit.test('parser piped commands with leading pipe', function (assert) {
        var pipeline = pipelineParser.parse('| search abc | fields host');
        assert.equal(pipeline.commands.length, 2);
        assert.equal(pipeline.leadingPipe, true);
        assert.equal(pipeline.commands[0], 'search abc');
        assert.equal(pipeline.commands[1], 'fields host');
    });
    
    QUnit.test('parser single command with leading pipe', function (assert) {
        var pipeline = pipelineParser.parse('| search abc');
        assert.equal(pipeline.leadingPipe, true);
        assert.equal(pipeline.commands.length, 1);
        assert.equal(pipeline.commands[0], 'search abc');
    });
    
    QUnit.test('parser command with quoted pipe', function (assert) {
        var pipeline = pipelineParser.parse('stats eval("com|net|org")');
        assert.equal(pipeline.commands.length, 1);
        assert.equal(pipeline.leadingPipe, false);
        assert.equal(pipeline.commands[0], 'stats eval("com|net|org")');
    });
    
    QUnit.test('parser command with empty quoted string', function (assert) {
        var pipeline = pipelineParser.parse('search ""');
        assert.equal(pipeline.commands.length, 1);
        assert.equal(pipeline.leadingPipe, false);
        assert.equal(pipeline.commands[0], 'search ""');
    });
    
    QUnit.test('parser piped commands with quoted pipe', function (assert) {
        var pipeline = pipelineParser.parse('search abc | stats count(eval(NOT match(from_domain, "[^\n\r\s]+\.(com|net|org)")))');
        assert.equal(pipeline.commands.length, 2);
        assert.equal(pipeline.leadingPipe, false);
        assert.equal(pipeline.commands[0], 'search abc');
        assert.equal(pipeline.commands[1], 'stats count(eval(NOT match(from_domain, "[^\n\r\s]+\.(com|net|org)")))');
    });
    
    QUnit.test('parser piped commands with line feed', function (assert) {
        var pipeline = pipelineParser.parse('search abc \n| fields host');
        assert.equal(pipeline.commands.length, 2);
        assert.equal(pipeline.leadingPipe, false);
        assert.equal(pipeline.commands[0], 'search abc');
        assert.equal(pipeline.commands[1], 'fields host');
    });
    
    
    QUnit.test('parser piped commands with trailing back slash', function (assert) {
        var pipeline = pipelineParser.parse('search abc \\\n| fields host\\\n|table *');
        assert.equal(pipeline.commands.length, 3);
        assert.equal(pipeline.leadingPipe, false);
        assert.equal(pipeline.commands[0], 'search abc');
        assert.equal(pipeline.commands[1], 'fields host');
        assert.equal(pipeline.commands[2], 'table *');
    });
            
    QUnit.start();
});


