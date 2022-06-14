// This file is used in two places: in dashboard.js as part of the source code
// viewer (which is ESM and compiled by webpack); and in the XML of the
// dashboard examples themselves using `script="prettify.js"` to run. The latter
// needs an AMD module, but we also need to display this as source code...

// The prettify() function looks for all <code> blocks on the document and
// modifies them.

requirejs([
    '../app/simple_xml_examples/contrib/prettify',
    'css!../app/simple_xml_examples/contrib/prettify.css',
    'splunkjs/mvc/simplexml/ready!'
], function(prettify) {
    prettify();
});

