%lex
%options case-insensitive

%%
\"[^\"]*\"            return 'QUOTED_STRING';
"|"                   return 'PIPE';
[^|\"]+               return 'IDENTIFIER';
<<EOF>>               return 'EOF';

/lex

%% /* language grammar */

pipeline
    : search_command_list EOF
        { return { leadingPipe: false, commands: $1 };}
    | leading_pipe_search_command_list EOF
        { return { leadingPipe: true, commands: $1 };}
    ;

leading_pipe_search_command_list
    : PIPE search_command
        { $$ = [normalize($2)]; }
    | PIPE search_command PIPE search_command_list
        { $$ = [normalize($2)].concat($4); }    
    ;
    
search_command_list
    : search_command
        { $$ = [normalize($1)]; }
    | search_command PIPE search_command_list
        { $$ = [normalize($1)].concat($3); }    
    ;

search_command
    : search_command_component
        { $$ = $1; }
    | search_command_component search_command
        { $$ = $1 + $2; }
    ;

search_command_component
    : IDENTIFIER
    | QUOTED_STRING
    ;

%%

function normalize(command) {
    return removeTrailingBackSlash(command.trim()).trim();
}

function removeTrailingBackSlash(command) {
    var backSlash = '\\';
    if(command.indexOf(backSlash, command.length - backSlash.length) !== -1) {
        command = command.substring(0, command.length - backSlash.length);
    }   
    return command;
}