// place app-level require config overrides here
require.config({
    paths: {
        'jquery.smartresize': '../app/splunk_app_mint/js/contrib/jquery.smartresize',
        'highcharts': '../app/splunk_app_mint/js/contrib/highcharts-4.0.4/highcharts-custom',
        'mint': '../app/splunk_app_mint/js/contrib/mint'
    },
    shim: {
        "jquery.smartresize": {
            deps: ['jquery']
        },
        highcharts: {
            deps: ['jquery'],
            exports: 'Highcharts'
        },
        "splunkjs/mvc/d3chart/d3/d3.v2": {
            deps: [],
            exports: "d3"
        }
    }
});
