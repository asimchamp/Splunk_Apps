require.config({
    paths: {
        "app": "../app"
    }
});

require([
    'jquery',
    'underscore',
    'splunkjs/mvc',
    'splunkjs/mvc/simplexml/ready!'
], function($, _, mvc, BaseCellRenderer){
    require(['splunkjs/ready!'], function(){
    });

    function break_kwds(kwds){
        var no_jp_space = kwds.replace(/\u3000/g, ' ');
        var parts = no_jp_space.split(' ');
        return _.reject(parts, function(v){
            return !v;
        });
    }

    function wrap_kwd(kwd, field){
        ret = field;
        ret += '="*';
        ret += kwd.trim();
        ret += '*"';
        return ret;
    }

    function get_search_string(keywords, field){
        if (keywords == '*' || keywords.length == 0){
            return '';
        }

        var kwds = break_kwds(keywords);
        if (kwds.length == 1){
            return wrap_kwd(kwds[0], field);
        }

        var logic = $('input[name=input_andor]:radio:checked').val();

        var ret = '(';
        var first = true;
        _.each(kwds, function(kwd){
            if (first){
                first = false;
            }else{
                ret += ' ';
                ret += logic;
                ret += ' ';
            }
            ret += wrap_kwd(kwd, field);
        });
        ret += ')';

        return ret;
    }

    function update_input_kwds(val){
        var search = get_search_string(val, 'upload_filename');
        unsubmittedTokens.set('input_kwds', search);
        submittedTokens.set('input_kwds', search);
    }

    var unsubmittedTokens = mvc.Components.get('default');
    var submittedTokens = mvc.Components.get('submitted');
    var input_kwds_id = "input_kwds";
    var input_kwds= mvc.Components.get(input_kwds_id);
    if (!input_kwds){
        input_kwds_id = "field5";
        input_kwds= mvc.Components.get(input_kwds_id);
    }
    input_kwds.on('change', function(val) {
        update_input_kwds(val);
    });

    function add_andor(field, token){

        $(field + " .control").css('display', 'inline-block');

        var radio_format = '<input type="radio" name="input_andor" id="input_{0}" value="{1}" {2} style="margin-left:8px"/><span style="font-size:95%">{3}</span>';
        var input_and = radio_format
            .replace('{0}', 'and')
            .replace('{1}', 'AND')
            .replace('{2}', 'checked="checked"')
            .replace('{3}', 'AND');
        var input_or = radio_format
            .replace('{0}', 'or')
            .replace('{1}', 'OR')
            .replace('{2}', '')
            .replace('{3}', 'OR');

        var label = $(field + " label").css("display", "inline-block");
        $(input_and + input_or).insertAfter(label);
        $('input[type=radio][name=input_andor]').change(function(){
            var val = $(field + ' input[type=text]').val();
            update_input_kwds(val);
        });
    }
    add_andor("#"+input_kwds_id, "input_kwds");
});
