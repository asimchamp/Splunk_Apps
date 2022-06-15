require(['jquery','underscore','splunkjs/mvc'],
	function($, _, mvc){
		$.get("/static/app/GigamonForSplunk/README.md",{"ts": $.now()}, function(data){
			$(".markdown_container").append(markdown.toHTML(data,'Maruku'));
		});
	}
);
