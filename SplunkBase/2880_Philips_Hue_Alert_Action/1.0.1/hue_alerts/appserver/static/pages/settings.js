require([
    'underscore',
    'jquery',
    'splunkjs/mvc',
    'backbone',
    'app/hue_alerts/pages/_base',
    'app/hue_alerts/components/setup/BridgeStatus',
    'app/hue_alerts/components/setup/Lights',
    'app/hue_alerts/components/setup/Tabs',
    'app/hue_alerts/models/HueSetup',
    'models/services/AppLocal'
], function(_, $, mvc, Backbone, BasePage, BridgeStatus, LightsView, TabsView, HueSetupModel, AppModel) {

    BasePage.initRouter();
    BasePage.initPage({appbar: false});
    BasePage.syncState({replaceState: true});

    var state = new Backbone.Model({
        tab: 'tab-setup'
    });
    var setupModel = new HueSetupModel();

    var $tabContent = $('.tab-content');
    var bridgeStatus = new BridgeStatus({
        model: {
            state: state,
            setup: setupModel
        }
    }).render().appendTo($tabContent);

    var lightsView = new LightsView({
        model: {
            state: state,
            setup: setupModel
        }
    }).render().appendTo($tabContent);


    new TabsView({
        el: $('.settings-ct .nav-tabs'),
        model: state
    }).render();

    lightsView.$el.hide();
    state.on('change:tab', function(m, tab) {
        bridgeStatus.$el.hide();
        lightsView.$el.hide();
        if (tab == 'tab-setup') {
            bridgeStatus.$el.show();
        } else if (tab == 'tab-lights') {
            lightsView.$el.show();
        }
    });

    setupModel.on('change:status', function(model, val) {
        if (val == 'connected') {
            var localApp = new AppModel({id: 'apps/local/hue_alerts'});
            localApp.fetch().then(function() {
                localApp.entry.content.set('configured', '1');
                localApp.save();
            });
            $('li.tab-lights').removeClass('disabled');
        }
    });

    $(document.body).removeClass('preload');

});