var deps = [
    'mimosa/js/command_parser/pipeline',
    "mimosa/bower_components/codemirror/lib/codemirror",
    "mimosa/bower_components/codemirror/addon/mode/simple", 
    "mimosa/bower_components/codemirror/keymap/vim", 
    "mimosa/js/codemirror/spl",
];

var appName = 'mimosa';

define(deps, function (pipelineParser, CodeMirror) {
    var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
        lineNumbers: true,
        theme: 'monokai',
        vimMode: true
    });
    
    var fetchCommandDoc = function (command, callback) {
        var searchHelperUrl = 
            '../../../../en-US/api/shelper?snippet=true&snippetEmbedJS=false&namespace=' + 
            appName + '&useTypeahead=true&useAssistant=true&showCommandHelp=true&showCommandHistory=true&showFieldInfo=false&search=' + command;
        $.get(searchHelperUrl, function (data) {
            callback(data);
        });
    };
    
    var lineWidgets = {};
    editor.setOption("extraKeys", {
        'Shift-Cmd-D': function (cm) {
            var line = cm.getCursor().line;
            if(lineWidgets[line]) {
                console.log('remove line widget');
                cm.removeLineWidget(lineWidgets[line]);                    
                lineWidgets[line] = undefined;
            } else {
                console.log('add line widget');
                var components = cm.getLine(line).split(' ');
                var command = components[0] === '|' ? components[1] : components[0];
                
                fetchCommandDoc(command, function (doc) {
                    var docDiv = document.createElement("div");
                    docDiv.innerHTML = doc;
                    var widget = cm.addLineWidget(line, docDiv);
                    lineWidgets[line] = widget;         
                }); 
            }
        },
        'Shift-Cmd-L': function (cm) {
            var code = cm.getValue();
            var parsedPipeline = pipelineParser.parse(code);
            var multilinedSearch = parsedPipeline.commands.join('\n| ');
            if(parsedPipeline.leadingPipe) {
                multilinedSearch = '| ' + multilinedSearch;
            }
            cm.setValue(multilinedSearch);
        }
    });
    
    return editor;
});