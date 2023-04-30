require(['splunkjs/mvc','splunkjs/mvc/utils','splunkjs/mvc/simplexml/ready!'], function(mvc, utils){

	var defaultTokenModel = mvc.Components.getInstance('default', {create: true});
	var submittedTokenModel = mvc.Components.getInstance('submitted', {create: true});
	if(typeof(defaultTokenModel.get("controllerLabelvolumeGroup"))!="undefined" || defaultTokenModel.get("controllerLabelvolumeGroup")!="") {
		submittedTokenModel.set("controllerLabelvolumeGroup", defaultTokenModel.get("controllerLabelvolumeGroup"));
	}

	if(defaultTokenModel.get("controllerLabelvolumeGroup")=="" || typeof(defaultTokenModel.get("controllerLabelvolumeGroup"))=="undefined") {
		var clvg_id = mvc.Components.get("clvg_id");
		var clvg_results = clvg_id.data("preview");
		clvg_results.on("data", function() {
			var ctrl = submittedTokenModel.get("form.controllerLabel");
			var vg = submittedTokenModel.get("form.volumeGroup");
			if(typeof(ctrl)!="undefined" && typeof(vg)!="undefined") {
				var clvgid = mvc.Components.get("clvgid");
				clvgid.settings.set("default", vg + ' (' + ctrl + ')');
				submittedTokenModel.set("controllerLabelvolumeGroup", 'controllerLabel="' + ctrl + '" volumeGroup="' + vg + '"');
			}
		});
	}
		
    var tokens = mvc.Components.getInstance("default");
	var submitted = mvc.Components.get("submitted");
	submitted.on("change:controllerLabelvolumeGroup", function() {
		var clvg_val = submitted.get("controllerLabelvolumeGroup");
		var pattern = new RegExp(/^(\w+)="(.*?)"\s(\w+)="(.*?)"$/);
		var res = clvg_val.match(pattern);
		tokens.set(res[1], res[2]);
		tokens.set(res[3], res[4]);
                    submitted.set(res[1], res[2]);
                    submitted.set(res[3], res[4]);

	});
});

