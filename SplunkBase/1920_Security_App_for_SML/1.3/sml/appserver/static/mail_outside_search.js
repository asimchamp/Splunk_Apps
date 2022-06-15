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

        var logic = $('input[name='+field+'_andor]:radio:checked').val();

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

    function update_input_kwds(val, field){
        var search = get_search_string(val, field);
        unsubmittedTokens.set('token_'+field, search);
        submittedTokens.set('token_'+field, search);
    }

    var unsubmittedTokens = mvc.Components.get('default');
    var submittedTokens = mvc.Components.get('submitted');

    var input_subject_id = "input_subject";
    var input_subject= mvc.Components.get(input_subject_id);
    if (!input_subject){
        input_subject_id = "field6";
        input_subject= mvc.Components.get(input_subject_id);
    }
    input_subject.on('change', function(val) {
        update_input_kwds(val, 'subject');
    });

    var input_mail_attach_id = "input_mail_attach";
    var input_mail_attach= mvc.Components.get(input_mail_attach_id);
    if (!input_mail_attach){
        input_mail_attach_id = "field7";
        input_mail_attach= mvc.Components.get(input_mail_attach_id);
    }
    input_mail_attach.on('change', function(val) {
        update_input_kwds(val, 'mail_attach');
    });

    function add_andor(field, getsearch, input_id){
        var input = "#input_" + field;
        if (input_id){
            input = "#" + input_id;
        }
        var token = "token_" + field;
        $(input + " .control").css('display', 'inline-block');

        var radio_format = '<input type="radio" id="_0" name="_1" value="_3" _2 style="margin-left:8px"/><span style="font-size:95%">_3</span>';
        var input_and = radio_format
            .replace(/_0/g, field + "_and")
            .replace(/_1/g, field + "_andor")
            .replace(/_2/g, 'checked="checked"')
            .replace(/_3/g, 'AND');
        var input_or = radio_format
            .replace(/_0/g, field + "_or")
            .replace(/_1/g, field + "_andor")
            .replace(/_2/g, '')
            .replace(/_3/g, 'OR');

        var label = $(input + " label").css("display", "inline-block");
        $(input_and + input_or).insertAfter(label);
        $('input[type=radio][name='+field+'_andor]').change(function(){
            var val = $(input + ' input[type=text]').val();
            update_input_kwds(val, field);
        });
    }
    add_andor("subject", get_search_string, input_subject_id);
    add_andor("mail_attach", get_search_string, input_mail_attach_id);
});
