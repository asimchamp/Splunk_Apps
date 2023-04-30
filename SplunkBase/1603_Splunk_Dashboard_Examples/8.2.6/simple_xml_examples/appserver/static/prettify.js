// This file is used in the XML of the dashboard examples themselves using `script="prettify.js"` to run.
// The dashboard examples needs an AMD module to display as source code.

// The prettify() function looks for all <code> blocks with a class of "prettyprint" in the document and
// modifies them.

requirejs([
    '../app/simple_xml_examples/shims/amd/prettify',
    'css!../app/simple_xml_examples/contrib/prettify.css',
    'splunkjs/mvc/simplexml/ready!'
], function(prettify) {
    prettify();
});

