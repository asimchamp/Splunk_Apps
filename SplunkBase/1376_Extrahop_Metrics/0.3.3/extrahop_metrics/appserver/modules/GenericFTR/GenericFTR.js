Splunk.namespace("Module");
Splunk.Module.GenericFTR= $.klass(Splunk.Module, {

    initialize: function($super, container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("GenericFTR.js");
        this.messenger = Splunk.Messenger.System.getInstance();
        this.popupDiv = $('.ftrPopup', this.container).get(0);
        this.redirectTo = this._params['configLink'];
        this.redirectToSVU = 'manager/sos/apps/remote?name=sideview+utils';
        this.getResults();
    },
    renderResults: function(htmlFragment, turbo) {
        if (htmlFragment.indexOf('noSVU') != -1) {
            this.popupDiv.innerHTML = '<div style="text-align:center;padding:0px 10px 0px 10px;width:520px"><br><br><h2>This instance of Splunk does not have the <a target="_blank" class="spl-icon-external-link-xsm" href="http://splunk-base.splunk.com/apps/22279/sideview-utils">Sideview Utils</a> app installed.</h2><br><p>The Splunk on Splunk app depends on custom modules from Sideview Utils in order to function.</p><br><h2>IMPORTANT!</h2><b>If you are installing this app on Splunk 4.0.x or 4.1.x, please refer to the README file in $SPLUNK_HOME/etc/apps/sos/README for special installation instructions!</b><br><br><br></div>';
            this.popup = new Splunk.Popup(this.popupDiv, {
                cloneFlag: false,
                title: _("Sideview Utilikilts Not Installed!!!!!"),
                pclass: 'configPopup',
                buttons: [
                     {
                         label: _("Install Sideview Utils"),
                         type: "primary",
                         callback: function(){
                            Splunk.util.redirect_to(this.redirectToSVU);
                         }.bind(this)
                     }
                 ]
             });
        }
        if (htmlFragment.indexOf('notConfigured') != -1) {
            this.popupDiv.innerHTML = '<div style="text-align:center;padding:0px 10px 0px 10px;width:520px"><br><br><h2>Extrahop Metrics has not been configured.</h2><br><p>This application needs to be configured in order to function. You will need to provide the login credentials for your Extrahop Device and the hostname or IP. You will also need to have an external install of Python in-order to install the modules that make this application possible.</p><br<br><br></div>';
            this.popup = new Splunk.Popup(this.popupDiv, {
                cloneFlag: false,
                title: _("Extrahop Metrics has notbeen configured!!"),
                pclass: 'configPopup',
                buttons: [
                     {
                         label: _("Configure Extrahop Metrics"),
                         type: "primary",
                         callback: function(){
                            Splunk.util.redirect_to(this.redirectTo);
                         }.bind(this)
                     }
                 ],
             });
            //Splunk.util.redirect_to(this.redirectTo);
        }

    },
});