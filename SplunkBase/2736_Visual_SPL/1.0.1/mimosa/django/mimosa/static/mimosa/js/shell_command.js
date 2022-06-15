var deps = [
    'underscore',
    'mimosa/js/util/eval',
    'mimosa/js/inspector-json/inspector-json',
    'mimosa/js/command_parser/search',
    'mimosa/js/command_viewer/search_command_viewer'
];

define(deps, function(_, Eval, InspectorJSON, searchCmdParser, searchCmdViewer) {
    var consoleDiv = $('#console');
    
    var showResult = function (vars, template) {
        template = template || '#command-template';
        var html = _.template($(template).html())(vars);
        consoleDiv.append(html);
    }
    
    var selectDataCmd = function (page, index, result, command) {
        var recordId = new Date().valueOf();
        showResult({
            command: command || 'select',
            page: page,
            index: index,
            recordId: recordId
        }, '#data-template');
        
        var inspector = new InspectorJSON({
            element: recordId,
            json: { data: result }
        });
        $.data(consoleDiv, 'data', result);
        $.data(consoleDiv, 'page', page);
        $.data(consoleDiv, 'index', index);     
    };
    
    var evalCmd = function (command) {
        var evalExpression = command.substring(4);
        var variables = $.data(consoleDiv, 'data') || {};
        var result = Eval.execute(evalExpression, variables);
        
        showResult({
            command: command,
            result: result
        });
    };
    
    var clearCmd = function (command) {
        consoleDiv.empty();    
    };
    
    var helpCmd = function (command) {
        var helpHtml = _.template($('#help-template').html())();
        showResult({
            command: command,
            result: helpHtml
        });       
    };
    
    var catCmd = function () {
        var data = $.data(consoleDiv, 'data');
        var page = $.data(consoleDiv, 'page');
        var index = $.data(consoleDiv, 'index');
        if(data) {
            selectDataCmd(page, index, data, 'cat');
        } else {
            // TODO: show data NA 
        }
    };
    
    var searchCmd = function (command) {
        var variables = $.data(consoleDiv, 'data') || {};
        var parsedCommand = searchCmdParser.parse(command);
        var html = searchCmdViewer.inspect(command, parsedCommand, variables).html;
        showResult({
            command: command,
            result: html
        }); 
    };
    
    var unsupportedCmd = function (command) {
        showResult({
            command: command,
            result: '<p>Command not found</p>'
        }); 
    };
    
    var commandRunners = {
        cat: catCmd,
        eval: evalCmd,
        help: helpCmd,
        clear: clearCmd,
        search: searchCmd,
        unsupported: unsupportedCmd
    };
    
    consoleDiv.on('rebind', function (event, page, index, result) {
        selectDataCmd(page, index, result);     
    });
    
    var run = function (command) {
        var name = command.split(' ')[0];
        if(!commandRunners[name]) {
            name = 'unsupported';
        }
        try {
            commandRunners[name](command.trim());
        } catch (e) {
            console.log(e);
            showResult({
                command: command,
                result: 'Error: ' + e.message
            });
        }
    };
    
    return {
        run: run    
    };
});