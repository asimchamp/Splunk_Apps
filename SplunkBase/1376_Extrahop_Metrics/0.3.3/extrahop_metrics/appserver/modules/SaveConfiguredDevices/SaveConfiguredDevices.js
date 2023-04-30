Splunk.namespace("Module");
Splunk.Module.SaveConfiguredDevices = $.klass(Splunk.Module, {

    initialize: function($super, container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("SaveConfiguredDevices.js");
        this.messenger = Splunk.Messenger.System.getInstance();
        //this.popupDiv = $('.ftrPopup', this.container).get(0);
        //this.redirectTo = this._params['configLink'];
        //this.redirectToSVU = 'manager/sos/apps/remote?name=sideview+utils';
        this.getResults();
    },
});