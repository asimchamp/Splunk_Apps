require.config({paths:{ValidationView:"../app/website_input/js/views/ValidationView"}});define(["underscore","backbone","splunkjs/mvc","jquery","models/SplunkDBase","collections/SplunkDsBase","ValidationView","util/splunkd_utils","models/services/server/ServerInfo","splunkjs/mvc/utils"],function(l,k,e,h,g,a,m,f,b,j){var d=g.extend({initialize:function(){g.prototype.initialize.apply(this,arguments)}});var n=g.extend({url:"storage/passwords",initialize:function(){g.prototype.initialize.apply(this,arguments)}});var i=a.extend({url:"storage/passwords",model:n,initialize:function(){a.prototype.initialize.apply(this,arguments)}});return m.extend({className:"SetupView",defaults:{app_name:null},formProperties:{},initialize:function(){this.options=l.extend({},this.defaults,this.options);m.prototype.initialize.apply(this,[this.options]);this.app_name=this.options.app_name;this.is_app_configured=null;this.app_config=null;this.encrypted_credential=null;this.capabilities=null;this.is_using_free_license=$C.SPLUNKD_FREE_LICENSE;this.getAppConfig();this.getInputStanza();this.credentials=null;this.setupProperties()},isOnCloud:function(){if(typeof this.is_on_cloud==="undefined"){this.is_on_cloud=null}var o=jQuery.Deferred();if(this.is_on_cloud!==null){o.resolve(this.is_on_cloud)}new b().fetch().done(function(p){if(p.entry[0].content.instance_type){this.is_on_cloud=p.entry[0].content.instance_type==="cloud"}else{this.is_on_cloud=false}o.resolve(this.is_on_cloud)});return o},getAppConfig:function(){if(this.app_name===null||this.app_name===undefined){this.app_name=j.getCurrentApp()}this.app_config=new d();this.app_config.fetch({url:f.fullpath("/servicesNS/nobody/system/apps/local/"+this.app_name),success:function(q,o,p){console.info("Successfully retrieved the app configuration");this.is_app_configured=q.entry.associated.content.attributes.configured}.bind(this),error:function(){console.warn("Unable to retrieve the app configuration")}.bind(this)})},getInputStanza:function(){var o=jQuery.Deferred();if(this.input_stanza===null||this.input_stanza===undefined){return}new d().fetch({url:f.fullpath("/servicesNS/nobody/system/admin/conf-inputs/"+this.input_stanza),success:function(r,p,q){console.info("Successfully retrieved the default input stanza configuration");this.default_input=r.entry.associated.content.attributes;o.resolve(this.default_input)}.bind(this),error:function(){console.warn("Unable to retrieve the default input stanza configuration");o.reject()}.bind(this)});return o},escapeColons:function(o){return o.replace(":","\\:")},makeStorageEndpointStanza:function(p,o){if(this.isEmpty(o)){o=""}return this.escapeColons(o)+":"+this.escapeColons(p)+":"},capitolizeFirstLetter:function(o){return o.charAt(0).toUpperCase()+o.slice(1)},setupProperty:function(q,o){var p="set"+this.capitolizeFirstLetter(q);var r="get"+this.capitolizeFirstLetter(q);if(this[p]===undefined){this[p]=function(s){h(o,this.$el).val(s)}}if(this[r]===undefined){this[r]=function(s){return h(o,this.$el).val()}}},setupProperties:function(){for(var o in this.formProperties){this.setupProperty(o,this.formProperties[o])}},getEncryptedCredentialByRealm:function(o,p){if(typeof p==="undefined"){p=false}var q=jQuery.Deferred();credentials=new i();credentials.fetch({success:function(r){console.info("Successfully retrieved the list of credentials");var s=r.models[c].filter(function(t){return r.models[c].entry.content.attributes.realm===o});if(p){q.resolve(s)}else{if(s.length>0){q.resolve(s[0])}else{q.resolve(null)}}},error:function(){console.error("Unable to fetch the credential");q.reject()}});return q},getEncryptedCredential:function(q,o){if(typeof o==="undefined"){o=false}var p=jQuery.Deferred();this.encrypted_credential=new n();this.encrypted_credential.fetch({url:f.fullpath("/services/storage/passwords/"+encodeURIComponent(q)),success:function(t,r,s){console.info("Successfully retrieved the encrypted credential");p.resolve(t)}.bind(this),error:function(){if(o){p.resolve(null)}else{console.warn("Unable to retrieve the encrypted credential");p.reject()}}.bind(this)});return p},credentialSuccessfullySaved:function(o){},getAppName:function(){if(this.app_name===null){return j.getCurrentApp()}else{return this.app_name}},isEmpty:function(o,p){if(typeof p=="undefined"){p=false}if(typeof o=="undefined"){return true}else{if(o===null){return true}else{if(o===""&&!p){return true}}}return false},deleteEncryptedCredential:function(q,o){if(typeof o==="undefined"){o=false}var p=jQuery.Deferred();h.when(this.getEncryptedCredential(q)).done(function(r){r.destroy().done(function(){p.resolve()}.bind(this))}.bind(this)).fail(function(){if(o){p.resolve()}else{p.reject()}}.bind(this));return p},saveEncryptedCredential:function(s,p,o){var r=jQuery.Deferred();if(this.isEmpty(s)){alert("The username field cannot be empty");r.reject("The username field cannot be empty");return r}if(this.isEmpty(p,true)){alert("The password field cannot be empty");r.reject("The password field cannot be empty");return r}var q=this.makeStorageEndpointStanza(s,o);h.when(this.getEncryptedCredential(q)).done(function(t){h.when(this.postEncryptedCredential(t,s,p,o)).done(function(){this.credentialSuccessfullySaved(false);r.resolve()}.bind(this))}.bind(this)).fail(function(){credentialModel=new n({user:"nobody",app:this.getAppName()});h.when(this.postEncryptedCredential(credentialModel,s,p,o)).done(function(){this.credentialSuccessfullySaved(true);r.resolve()}.bind(this))}.bind(this));return r},postEncryptedCredential:function(p,t,r,o){var s=jQuery.Deferred();if(this.app_name===null){this.app_name=j.getCurrentApp()}p.entry.content.set({name:t,password:r,username:t,realm:o},{silent:true});var q=p.save();if(q){q.done(function(w,u,v){console.info("Credential was successfully saved");s.resolve(w,u,v)}.bind(this)).fail(function(u){console.warn("Credential was not successfully updated");s.reject(u)}.bind(this))}return s},redirectIfNecessary:function(o){if(Splunk.util.getParameter("redirect_to_custom_setup")==="1"){document.location=o}},setConfigured:function(){if(this.is_app_configured){console.info("App is already set as configured; no need to update it");return}this.app_config.entry.content.set({configured:true},{silent:true});var o=this.app_config.save();if(o){o.done(function(r,p,q){console.info("App configuration was successfully updated")}.bind(this)).fail(function(p){console.warn("App configuration was not successfully updated")}.bind(this))}},hasCapability:function(o){var p=Splunk.util.make_url("/splunkd/__raw/services/authentication/current-context?output_mode=json");if(this.capabilities===null){jQuery.ajax({url:p,type:"GET",async:false,success:function(q){if(q!==undefined){this.capabilities=q.entry[0].content.capabilities}}.bind(this)})}if(this.is_using_free_license){return true}else{return h.inArray(o,this.capabilities)>=0}},userHasAdminAllObjects:function(){return this.hasCapability("admin_all_objects")}})});