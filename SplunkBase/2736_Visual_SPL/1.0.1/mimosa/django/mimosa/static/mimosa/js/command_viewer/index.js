var deps = [
    'underscore',
    'mimosa/js/command_viewer/common_command_viewer',
    'mimosa/js/command_viewer/search_command_viewer',
    'mimosa/js/command_viewer/eval_command_viewer',
    'mimosa/js/command_viewer/stats_command_viewer',
    'mimosa/js/command_viewer/rename_command_viewer',
    'mimosa/js/command_viewer/sort_command_viewer',
    'mimosa/js/command_viewer/top_command_viewer',
    'mimosa/js/command_viewer/fields_command_viewer',
    'mimosa/js/command_viewer/table_command_viewer',
    'mimosa/js/command_viewer/timechart_command_viewer'
];

define(deps, function (_, common, search, eval, stats, rename, sort, top, fields, table, timechart) {
    var commandViewers = {
        'common': common,
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
    return commandViewers;
});