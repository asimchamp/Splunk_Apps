Splunk.namespace("Module");
Splunk.Module.MSADAppChecker = $.klass(Splunk.Module.DispatchingModule, {

    initialize: function($super, container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("MSADAppChecker.js");
        this.messenger = Splunk.Messenger.System.getInstance();
        this.popupDiv = $('.MSADAppCheckerPopup', this.container).get(0);
        this.getResults();
        
        this.appName = this.getParam('appName');
        this.url = this.getParam('url');
        this.minVersion = this.getParam('minVersion');
        
    },
    
    getResultParams: function($super) {
    	var params = $super();
    	params.appName = this.getParam('appName');
    	return params;
    },
    
   
    renderResults: function(htmlFragment, turbo) {
    	var appName = this.appName;
    	
    	if (!this.url) {
    		var url = "manager/launcher/apps/remote";
    		var appPageLink = appName;
    	} else {
    		var url = this.url;
    		var appPageLink = '<a target="_blank" class="spl-icon-external-link-xsm" href="' + url + '">' + appName + '</a>'
    	}
    
        if (htmlFragment.indexOf('hasAPP') === -1) {
            this.popupDiv.innerHTML = '<div style="text-align:center;padding:0px 10px 0px 10px;width:520px"><br><br><h2>This instance of Splunk does not have the ' + appPageLink + ' app installed.</h2><br><p>The Splunk for Active Directory app depends on custom modules from ' + appName + ' in order to function. If you do not install the dependent app before proceeding the app you are using <b>will not </b> be functional.</p><br><br><br></div>';
            this.popup = new Splunk.Popup(this.popupDiv, {
                cloneFlag: false,
                title: _(appName + " Not Installed!"),
                pclass: 'configPopup',
                buttons: [
                     {
                         label: _("Download " + appName),
                         type: "primary",
                         callback: function(){
                             if (this.url) {
                             	window.location = this.url;
                             } else {
                             	Splunk.util.redirect_to(url);
                             }
                         }.bind(this)
                     }
                 ]
             });
        }
    }
    

    	
});
