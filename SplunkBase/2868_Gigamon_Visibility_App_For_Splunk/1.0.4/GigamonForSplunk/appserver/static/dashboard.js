require(['jquery'],
	function($){
		$("<div class='navFooter' id='nav_footer'>&nbsp;<span class='bars fa fa-bars fa-2x'></span></div>").insertBefore("#navSkip");
		$('<div id="templates" style="display:none"></div>').insertBefore(".footer");
		$(".header").slideToggle({direction: "up" }, 500);
		$('#nav_footer').click(function() {
	        	$(".header").slideToggle( { direction: 'down'}, 500);
		});
		$("#templates").load("/static/app/GigamonForSplunk/html/templates.html?ts="+_.now());
		var GigamonTemplateSettings = {
  			interpolate: /\{\{(.+?)\}\}/g
        	};
	}
);

