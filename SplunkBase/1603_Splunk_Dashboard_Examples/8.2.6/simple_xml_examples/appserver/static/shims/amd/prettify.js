// Same logic as web_v2/search_mrsparkle/exposed/js/shim/prettify.js,
// exposes an exported function from Google's prettify that defines a window pretty print function
define(['../../contrib/prettify'], function () {
    return window.prettyPrint;
});
