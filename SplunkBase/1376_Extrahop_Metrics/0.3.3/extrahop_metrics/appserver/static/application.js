$(document).ready(function() {
	bindHandler();
});


function bindHandler() {
	$('.mySubmitButton').bind('click', function(event) {
		addHandler(event);
	});
	$('.myUpdateButton').bind('click', function(event) {
		updateHandler(event);
	});
	$('.right_arrow').bind('click', function(event) {
		removeMetric(event);
	});
	$('.left_arrow').bind('click', function(event) {
		addMetric(event);
	});
	$('.myTemplateButton').bind('click', function(event) {
		addTemplate(event);
	});
	$('.myTemplateDeleteButton').bind('click', function(event) {
		deleteTemplate(event);
	});
	$('#Template_Name').bind('change keyup', function(event) {
		replace_chars(event);
	});
	$('#Pulldown_0_1_0_select').bind('change', function(event) {
		show_hide(event);
	});
}


function deleteTemplate(event) {
	var template_name = $.trim($('#Template_Name').val());

	var answer = confirm("Are you sure you want to delete this template?");
	if (answer) {
		var value = '| inputlookup append=t ehm_templates.csv  | where NOT (template_name="' + template_name + '")';
		value = value.concat('| outputlookup ehm_templates.csv');

		range = new Splunk.TimeRange('-1d', 'now');
		search = new Splunk.Search(value, range);
		result = search.dispatchJob()
		if (!result) {
			alert("hmm.. search failed to run");
			return false;
		}

		var relocate = function(a) {
			Splunk.util.redirect_to(['app', Splunk.util.getCurrentApp(), 'configure_templates'].join('/'));
		};

		window.setTimeout(relocate, 1500);
		return false;
	} else {
		return false;
	}
}

function show_hide(event) {
	var selected = $('#Pulldown_0_1_0_select').val();
	if (selected === 'blank') {
		$('#Pulldown_2_5_0').show();
		$('#Pulldown_3_7_0').show();
		$('#Pulldown_4_9_0').show();
	} else {
		$('#Pulldown_2_5_0').hide();
		$('#Pulldown_3_7_0').hide();
		$('#Pulldown_4_9_0').hide();
		$('#metric_type').hide();
		$('#device_type').hide();
		$('#metrics').hide();
	}
}

function replace_chars(event) {
	var template_name = $('#Template_Name').val();
	//$('#Template_Name').val(template_name);

	var regex = /[^a-zA-Z0-9_]/g;
	template_name = template_name.replace(/\s/g, "_");
	template_name = template_name.replace(regex, "");
	$('#Template_Name').val(template_name);

}

function addTemplate(event) {

	var template_name = $.trim($('#Template_Name').val());
	template_name = template_name.replace(/ /g, '_');
	var device_type = $('#device_type').text();
	var metrics = $('#metrics').text();
	var metric_type = $('#metric_type').text();

	$('#Template_Name').val(template_name);

	if (template_name.length < 1) {
		alert('Missing Template Name');
		$('#Template_Name').focus();
		return false;
	}


	if (device_type == '' || device_type == 'blank' || metric_type == 'blank' || metrics.length < 1) {
		alert("Please be sure to select a metric type, device type and some metrics.");
		return false;
	}
	// clean out "blank" from the values
	if (metrics.indexOf("blank") >= 0) {
		metrics = '"' + metrics.substring(7);
	}

	range = new Splunk.TimeRange('-1d', 'now');

	var value = ' | inputlookup append=t ehm_templates.csv  |  where NOT ( template_name="' + template_name + '") | append [stats count | eval template_name="';
	value = value.concat(template_name + '" | eval metric=' + metrics + ' | eval device="' + device_type + '" | eval metric_type="' + metric_type + '"| makemv  delim="," oid  | mvexpand template_name | fields template_name,device,metric_type,metric] | outputlookup ehm_templates.csv ');

	search = new Splunk.Search(value, range);
	result = search.dispatchJob()
	if (!result) {
		alert("hmm.. search failed to run");
		return false;
	}

	window.setTimeout('location.reload()', 1000);
	return false;
}


function addHandler(event) {

	var template_name = $('#template_name').val();
	var node_name = $('#node_name').val();
	var device_type = $('#device_type').val();
	var metrics = $('#metrics').val();
	var metric_type = $('#metric_type').val();


	if (template_name === "blank" && (node_name === "blank" || node_name.length < 2 || device_type == '' || device_type == 'blank' || metric_type == 'blank' || metrics.length < 2)) {
		alert("Please be sure to select some nodes, a metric, a metric type, a device type, and some metrics.")
		return false;
	}

	if (node_name === "blank" || node_name.length < 2) {
		alert("Please select a node or two");
		return false;
	}

	// clean out "blank" from the values
	if (metrics.indexOf("blank") >= 0) {
		metrics = '"' + metrics.substring(7);
	}
	if (node_name.indexOf("blank") >= 0) {
		node_name = node_name.substring(7);
	}

	range = new Splunk.TimeRange('-1d', 'now');

	var value = '';
	if (template_name == "blank") {
		value = ' | inputlookup append=t ehm_selected_metrics.csv  |  where NOT ( oid="' + node_name + '" AND device="' + device_type + '" ) | append [stats count | eval oid="';
		value = value.concat(node_name + '" | eval metric="' + metrics + '" | eval device="' + device_type);
		value = value.concat('" | eval metric_type="' + metric_type + '"| makemv  delim="," oid  | mvexpand oid |');
		value = value.concat('fields oid,device,metric_type,metric] | outputlookup ehm_selected_metrics.csv ');
	} else {
		value = ' | inputlookup append=t ehm_selected_metrics.csv  |  where NOT ( oid="' + node_name + '")';
		value = value.concat('| append [ | inputlookup ehm_templates.csv | where  template_name="' + template_name);
		value = value.concat('" | eval oid="' + node_name + '" | makemv  delim="," oid | mvexpand oid ]| fields oid,device,metric_type,metric');
		value = value.concat('| outputlookup ehm_selected_metrics.csv');
	}

	search = new Splunk.Search(value, range);
	result = search.dispatchJob()
	if (!result) {
		alert("hmm.. search failed to run");
		return false;
	}
	
	
	window.setTimeout('location.reload()', 2000);
	return false;
}


function updateHandler(event) {
	var node_name = $('#oid').attr('value');
	var metrics = $('#metrics').val();
	var device_type = $('#device').text();
	var metric_type = $('#metric_type').text();



	if (metrics.length < 1 && !($('#delete_device_type').is(':checked'))) {
		alert("No changes were made");
		return false;
	}

	var value = '';
	if ($('#delete_device_type').is(':checked')) {
		var answer = confirm("Are you sure you want to delete this node and stop collecting metrics?");
		if (answer) {
			value = value.concat(' | inputlookup append=t ehm_selected_metrics.csv   |   where NOT (oid="' + node_name + '" AND device="' + device_type + '") ');
		} else {
			$('#delete_device_type').prop("checked", false);
			return false;
		}
	} else {
		value = value.concat(' | inputlookup append=t ehm_selected_metrics.csv   |   where NOT (oid="' + node_name + '" AND device="' + device_type + '")');
		value = value.concat('| append [stats count | eval oid="');
		value = value.concat(node_name + '" | eval metric="' + metrics + '" | eval device="' + device_type + '" | eval metric_type="' + metric_type + '"|makemv  delim="," oid  | mvexpand oid | fields oid,device,metric_type,metric] ');
	}
	value = value.concat('| outputlookup ehm_selected_metrics.csv');

	//alert(value);
	range = new Splunk.TimeRange('-1d', 'now');
	search = new Splunk.Search(value, range);
	result = search.dispatchJob()
	if (!result) {
		alert("hmm.. search failed to run");
		return false;
	}


	var relocate = function(a) {
		Splunk.util.redirect_to(['app', Splunk.util.getCurrentApp(), 'configure_inputs'].join('/'));
	};
	
	window.setTimeout(relocate, 2000);
	return false;
}





if (Splunk.util.getCurrentView() == "configure_inputs") {
	Splunk.Module.SimpleResultsTable = $.klass(Splunk.Module.SimpleResultsTable, {
		renderResults: function($super, data) {
			$super(data);
			$('td:nth-child(2),th:nth-child(2)', this.container).hide();
		}
	});
}

if (Splunk.util.getCurrentView() == "edit_input") {
	window.setTimeout('updateSelected()', 3500);
}


function GetURLParameter(sParam) {
	var sPageURL = window.location.search.substring(1);
	var sURLVariables = sPageURL.split('&');
	for (var i = 0; i < sURLVariables.length; i++) {
		var sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] == sParam) {
			return sParameterName[1];
		}
	}
}

$(window).bind("load", function() {

if (Splunk.util.getCurrentView() == "configure_templates") {
	var template_name = GetURLParameter('template_name');
	
	if (typeof template_name != 'undefined') {
		$('#myTemplateDeleteButton').show();
		$('#Template_Name').prop("disabled",true);
	}
	else {
		$('#myTemplateDeleteButton').hide();
		$('#Template_Name').prop("disabled",false);
	}
}

});


function addMetric(event) {
	$('#Pulldown_1_3_0_select option').each(function(idx, el) {

		if ($(el).is(':selected')) {
			var val = $(el).val();
			var foo = "#Pulldown_1_3_0_select option[value='" + val + "']";
			$(foo).remove();
			var spl = val.split(":", 1);
			var bar = '<option value="' + val + '">' + spl + '</option>';
			$("#Pulldown_0_2_0_select").prepend(bar);
		}
	});

	updateSelected();
}

function removeMetric(event) {
	$('#Pulldown_0_2_0_select option').each(function(idx, el) {

		if ($(el).is(':selected')) {
			var val = $(el).val();
			var foo = "#Pulldown_0_2_0_select option[value='" + val + "']";
			$(foo).remove();
			var spl = val.split(":", 1);
			var bar = '<option value="' + val + '">' + spl + '</option>';
			$("#Pulldown_1_3_0_select").prepend(bar);
		}

	});
	updateSelected();
}

function updateSelected() {
	var selected_display = '';
	var selected = '"';
	i = 0;
	$('#Pulldown_0_2_0_select option').each(function(idx, el) {
		if (i > 0) {
			selected = selected.concat(',' + $(el).val());
		} else {
			selected = selected.concat($(el).val());
		}
		var spl = $(el).val().split(":", 1);
		selected_display = selected_display.concat('<li>' + spl + '</li>');

		i++;
	});
	selected = selected.concat('"');

	$('#metrics').val(selected);
	$('#metrics_display').html(selected_display);
}