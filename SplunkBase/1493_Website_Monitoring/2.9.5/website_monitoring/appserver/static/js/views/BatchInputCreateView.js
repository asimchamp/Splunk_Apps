require.config({paths:{text:"../app/website_monitoring/js/lib/text","bootstrap-tags-input":"../app/website_monitoring/js/lib/bootstrap-tagsinput.min"},shim:{"bootstrap-tags-input":{deps:["jquery"]}}});define(["underscore","backbone","splunkjs/mvc","util/splunkd_utils","models/SplunkDBase","jquery","splunkjs/mvc/simplesplunkview","models/services/server/ServerInfo","text!../app/website_monitoring/js/templates/BatchInputCreateView.html","bootstrap-tags-input","splunk.util","css!../app/website_monitoring/css/BatchInputCreateView.css","css!../app/website_monitoring/js/lib/bootstrap-tagsinput.css"],function(k,j,b,c,d,e,h,a,f){var i=d.extend({url:"/en-US/splunkd/services/shcluster/status",initialize:function(){d.prototype.initialize.apply(this,arguments)}});var g=h.extend({className:"BatchInputCreateView",defaults:{},events:{"click .create-inputs":"doCreateInputs","click .stop-creating-inputs":"stopCreateInputs"},initialize:function(){this.options=k.extend({},this.defaults,this.options);this.processing_queue=[];this.processed_queue=[];this.unprocessed_queue=[];this.interval=null;this.timeout=null;this.index=null;this.dont_duplicate=true;this.stop_processing=false;this.capabilities=null;this.inputs=null;this.existing_input_names=[];this.is_on_cloud=null;this.getExistingInputs()},parseURL:function(l){var m=document.createElement("a");m.href=l;return m},generateTitle:function(m){var l=this.parseURL(m);return l.hostname},generateStanza:function(n,p){if(typeof p=="undefined"||p===null){p=[]}if(p.length===0){var m=this.parseURL(n);return m.hostname.replace(/[-.]/g,"_")}var m=this.parseURL(n);var q=m.hostname.replace(/[-.]/g,"_");var l=q;var o=0;var r=false;while(true){r=false;for(var s=0;s<p.length;s++){if(p[s]===l){r=true;break}}if(!r){return l}else{o=o+1;l=q+"_"+o}}},createInput:function(o,l,n,q,m,s){var r=jQuery.Deferred();if(typeof m==="undefined"){m=null}if(typeof s=="undefined"){s=null}if(typeof n=="undefined"){n=null}if(typeof q=="undefined"||q.toString().length===0){q=null}if(m===null){m=this.generateStanza(o,this.existing_input_names)}if(s===null){s=this.generateTitle(o)}var p={url:o,interval:l,name:m,title:s};if(q!==null){p.timeout=q}if(n!==null){p.index=n}e.ajax({url:c.fullpath("/servicesNS/"+Splunk.util.getConfigValue("USERNAME")+"/website_monitoring/data/inputs/web_ping"),data:p,type:"POST",success:function(t){console.info("Input created");this.processed_queue.push(o);this.existing_input_names.push(m)}.bind(this),complete:function(t,u){if(t.status==403){console.info("Inadequate permissions");this.showWarningMessage("You do not have permission to make inputs")}else{if(t.status==409){console.info("Input already exists, skipping this one")}}r.resolve()}.bind(this),error:function(t,v,u){if(t.status!=403&&t.status!=409){console.info("Input creation failed")}this.unprocessed_queue.push(o)}.bind(this)});return r},createNextInput:function(){if(this.stop_processing){return}var m=100*((this.processed_queue.length+this.unprocessed_queue.length)/(this.processing_queue.length+this.processed_queue.length+this.unprocessed_queue.length));e(".bar",this.$el).css("width",m+"%");if(this.processing_queue.length===0){if(this.processed_queue.length>0){this.showInfoMessage("Done creating the inputs ("+this.processed_queue.length+" created)")}var n="";if(this.dont_duplicate){n=" (duplicates are being skipped)"}if(this.unprocessed_queue.length===1){this.showWarningMessage("1 input was not created"+n)}else{if(this.unprocessed_queue.length>0){this.showWarningMessage(""+this.unprocessed_queue.length+" inputs were not created"+n)}}e("#progress-modal",this.$el).modal("hide");for(var o=0;o<this.processed_queue.length;o++){e("#urls",this.$el).tagsinput("remove",this.processed_queue[o])}}else{var l=this.processing_queue.pop();if(this.dont_duplicate&&this.isAlreadyMonitored(l)){e("#urls",this.$el).tagsinput("remove",l);this.unprocessed_queue.push(l);console.info("Skipping creation of an input that already existed for "+l);this.createNextInput()}else{if(this.is_on_cloud&&l.startsWith("http://")){this.unprocessed_queue.push(l);console.info("Skipping creation of an input that doesn't use HTTPS "+l);this.createNextInput()}else{e.when(this.createInput(l,this.interval,this.index,this.timeout)).done(function(){this.createNextInput()}.bind(this))}}}},validate:function(){var l=0;if(e("#urls",this.$el).tagsinput("items").length===0){l=l+1;e(".control-group.urls",this.$el).addClass("error");e(".control-group.urls .help-inline",this.$el).show()}else{e(".control-group.urls",this.$el).removeClass("error");e(".control-group.urls .help-inline",this.$el).hide()}if(!this.isValidInterval(e("#interval",this.$el).val())){l=l+1;e(".control-group.interval",this.$el).addClass("error");e(".control-group.interval .help-inline",this.$el).show()}else{e(".control-group.interval",this.$el).removeClass("error");e(".control-group.interval .help-inline",this.$el).hide()}if(!this.isValidTimeout(e("#timeout",this.$el).val(),true)){l=l+1;e(".control-group.timeout",this.$el).addClass("error");e(".control-group.timeout .help-inline",this.$el).show()}else{e(".control-group.timeout",this.$el).removeClass("error");e(".control-group.timeout .help-inline",this.$el).hide()}return l===0},isValidInterval:function(l){var m=/^\s*([0-9]+([.][0-9]+)?)\s*([dhms])?\s*$/gi;if(m.exec(l)){return true}else{return false}},isValidTimeout:function(n,m){if(m&&!n){return true}var l=parseInt(n,10);if(l>=0){return true}else{return false}},validateURL:function(l){if(l.item.indexOf("http://")!==0&&l.item.indexOf("https://")!==0){if(this.is_on_cloud){e("#urls").tagsinput("add","https://"+l.item)}else{e("#urls").tagsinput("add","http://"+l.item)}l.cancel=true}else{if(l.item.indexOf("http://")===0&&this.is_on_cloud){this.showWarningMessage("Websites must use encryption (HTTPS) to be monitored on Splunk Cloud");l.cancel=true}}},stopCreateInputs:function(){this.stop_processing=true},doCreateInputs:function(){if(this.validate()){this.hideMessages();this.processed_queue=[];this.unprocessed_queue=[];this.processing_queue=e("#urls",this.$el).tagsinput("items");this.interval=e("#interval",this.$el).val();this.timeout=e("#timeout",this.$el).val();this.dont_duplicate=e(".dont-duplicate",this.$el).is(":checked");this.stop_processing=false;e("#progress-modal",this.$el).modal();this.createNextInput()}},hide:function(l){l.css("display","none");l.addClass("hide")},unhide:function(l){l.removeClass("hide");l.removeAttr("style")},hideMessages:function(){this.hideWarningMessage();this.hideInfoMessage()},hideWarningMessage:function(){this.hide(e("#warning-message",this.$el))},hideInfoMessage:function(){this.hide(e("#info-message",this.$el))},showWarningMessage:function(l){e("#warning-message > .message",this.$el).text(l);this.unhide(e("#warning-message",this.$el))},showInfoMessage:function(l){e("#info-message > .message",this.$el).text(l);this.unhide(e("#info-message",this.$el))},hasCapability:function(l){var m=Splunk.util.make_url("/splunkd/__raw/services/authentication/current-context?output_mode=json");if(this.capabilities===null){jQuery.ajax({url:m,type:"GET",async:false,success:function(n){if(n!==undefined){this.capabilities=n.entry[0].content.capabilities}}.bind(this)})}return e.inArray(l,this.capabilities)>=0},isAlreadyMonitored:function(l){for(var m=0;m<this.inputs.length;m++){if(this.inputs[m].content.url===l){return true}}return false},getExistingInputs:function(){var l=c.fullpath("/servicesNS/nobody/search/data/inputs/web_ping?output_mode=json");jQuery.ajax({url:l,type:"GET",async:false,success:function(m){if(m!==undefined){this.inputs=m.entry}this.existing_input_names=[];for(var n=0;n<this.inputs.length;n++){this.existing_input_names.push(this.inputs[n]["name"])}}.bind(this)})},getSHCInfo:function(){var l=jQuery.Deferred();new i().fetch({url:c.fullpath("/en-US/splunkd/services/shcluster/status"),success:function(o,m,n){this.shc_info=o;l.resolve(o)},error:function(m,o,n){this.shc_info=null;if((o.status>400&&o.status<500)||o.status===503){l.resolve(null)}else{l.reject()}}});return l},render:function(){if(this.is_on_cloud===null){this.server_info=new a()}e.when(this.getSHCInfo(),new a().fetch()).done(function(m,l){if(l[0].entry[0].content.instance_type){this.is_on_cloud=l[0].entry[0].content.instance_type==="cloud"}else{this.is_on_cloud=false}var n=["edit_modinput_web_ping","list_inputs"];var o=[];if(!$C.SPLUNKD_FREE_LICENSE){for(var p=0;p<n.length;p++){if(!this.hasCapability(n[p])){o.push(n[p])}}}this.$el.html(k.template(f,{has_permission:o.length===0,capabilities_missing:o,is_shc:m!==null,is_on_cloud:this.is_on_cloud}));e("#urls").tagsinput("items");e("#urls").on("beforeItemAdd",this.validateURL.bind(this))}.bind(this))}});return g});