// Workaround the css! plugin's inability to understand '..' in
// require'd module names by defining a path that embeds the '..'
// so that css! doesn't see it.
require.config({
    paths: {
        "digitalguardian_web": "../app/digitalguardian_web"
    }
});

require([
    "splunkjs/ready!",
    "jquery",
    "digitalguardian_web/components/dendrogram/dendrogram",
    "splunkjs/mvc/simplexml/ready!"
], function(
    mvc,
    $,
    DendrogramView
) {
    new DendrogramView({
        "managerid": "dendrogram_search",
        "root_label": mvc.tokenSafe("$customer$"),
        "right": 600,
        "height": 600,
        "initial_open_lavel": 2,
        "node_outline_color": "#415e70",
        "node_close_color": "#b9d8eb",
        "el": $("#dendrogram")
    }).render();
});
