require.config({paths:{website_status_cell_renderer:"../app/website_monitoring/WebsiteStatusCellRenderer",info_message_view:"../app/website_monitoring/js/views/InfoMessageView",website_failure_view:"../app/website_monitoring/js/views/WebsiteFailureEditorView"}});require(["jquery","underscore","splunkjs/mvc","website_status_cell_renderer","info_message_view","splunkjs/mvc/searchmanager","website_failure_view","splunkjs/mvc/simplexml/ready!"],function(f,k,e,j,h,g,i){var b=e.Components.get("element1");b.getVisualization(function(l){l.table.addCellRenderer(new j());l.table.render()});var d=new g({id:"webping-inputs-search",earliest_time:"-48h@h",latest_time:"now",search:'| rest /services/data/inputs/web_ping | append [search sourcetype="web_ping" | head 1] | stats count',cancelOnUnload:true,autostart:false,app:"",auto_cancel:90,preview:false},{tokens:false});var a=new h({search_manager:d,message:'Create an input to monitor a website. <a target="_blank" href="../../manager/website_monitoring/adddata/selectsource?input_type=web_ping&modinput=1&input_mode=1">Create a website monitoring input now.</a>',eval_function:function(l){return l.rows[0][0]==="0"}});var c=new i({el:"#notification-options"});c.render()});