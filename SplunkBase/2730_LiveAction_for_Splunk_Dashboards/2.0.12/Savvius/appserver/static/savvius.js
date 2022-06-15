require([
     'jquery',
     'splunkjs/mvc/simplexml/ready!'
 ], function($) {
    $(document).ready(function() {
        $('input:text').keyup(function(event) {
            if(event.which == 13)
            {
                $(this).trigger('change');
            }
        });
    });
});
