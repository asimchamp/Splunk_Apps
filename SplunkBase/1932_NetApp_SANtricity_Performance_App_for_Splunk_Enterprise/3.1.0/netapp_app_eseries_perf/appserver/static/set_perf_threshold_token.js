require(['splunkjs/mvc','splunkjs/mvc/utils','splunkjs/mvc/simplexml/ready!'], function(mvc, utils){
        var unsubmittedTokens = mvc.Components.getInstance('default');
        var submittedTokens = mvc.Components.getInstance('submitted');

        // Set the token $perfThreshold$ to the name of the current app
        unsubmittedTokens.set('perfThreshold', '0');
        submittedTokens.set('perfThreshold', '0');
/*
        $('input[type=text]').change(function(){
                var unsubmittedTokens = mvc.Components.getInstance('default');
                var submittedTokens = mvc.Components.getInstance('submitted');

                // Set the token $perfThreshold$
                unsubmittedTokens.set('perfThreshold', $(this).val());

                // Submit the tokeni $perfThreshold$
                submittedTokens.set('perfThreshold', $(this).val());
        });*/
});

