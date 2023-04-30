require.config({
    paths: {
        setup_view: "../app/splunk_app_cef/js/views/SetupView"
    }
});

require([
         "jquery",
         "setup_view",
         "splunkjs/mvc/simplexml/ready!"
     ], function(
         $,
         SetupView
     )
     {
         var setupView = new SetupView({
        	 el: $('#setup-view')
         });
         
         setupView.render();
         setupView.setConfigured();
     }
);