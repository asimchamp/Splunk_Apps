Before copying and pasting the dashboard example to your source code, check that you have all required third-party Javascript libraries such as jQuery, Backbone, and Underscore. To import the necessary libraries, you need to save the libraries directly into your app directory. Then, load them using the [RequireJS module loader](https://requirejs.org/docs/api.html) and reference each library by its relative path.

Do not load the libraries by name. You must use a full relative path when referencing libraries using the RequireJS module in the Splunk codebase. For example, "../path/to/your/library".

Find the libraries used by SimpleXML Examples under `appserver/static/libs`. The following are direct links to these library files.

- [jQuery 3.6.0](/static/app/simple_xml_examples/libs/jquery-3.6.0-umd-min.js)
- [Backbone 1.1.2](/static/app/simple_xml_examples/libs/backbone-1.1.2-umd-min.js)
- [Underscore 1.6.0](/static/app/simple_xml_examples/libs/underscore-1.6.0-umd-min.js)
