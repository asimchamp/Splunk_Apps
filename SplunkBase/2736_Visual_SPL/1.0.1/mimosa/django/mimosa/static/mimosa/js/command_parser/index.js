var deps = [
    'underscore',
    'mimosa/js/command_parser/search',
    'mimosa/js/command_parser/eval',
    'mimosa/js/command_parser/stats',
    'mimosa/js/command_parser/rename',
    'mimosa/js/command_parser/sort',
    'mimosa/js/command_parser/top',
    'mimosa/js/command_parser/fields',
    'mimosa/js/command_parser/table',
    'mimosa/js/command_parser/timechart'
];

define(deps, function (_, search, eval, stats, rename, sort, top, fields, table, timechart) {
    var commandParsers = {
        'search': search,
        'eval': eval,
        'stats': stats,
        'rename': rename,
        'sort': sort,
        'top': top,
        'fields': fields,
        'table': table,
        'timechart': timechart
    };
    return commandParsers;
});