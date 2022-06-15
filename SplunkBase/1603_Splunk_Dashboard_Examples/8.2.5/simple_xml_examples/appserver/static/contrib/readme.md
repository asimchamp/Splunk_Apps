With the exception of prettify.js which is loaded in the dashboard XML by the
script attribute, these contrib files are only used (directly or indirectly) by
contents.js and dashboard.js. These two files are built by webpack. So the
contrib files (notably bootstrap-*) are left as ESM.
