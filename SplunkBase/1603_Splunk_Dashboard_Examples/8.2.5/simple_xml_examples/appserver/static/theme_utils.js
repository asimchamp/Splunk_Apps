// https://cd.splunkdev.com/devplat/simplexml-examples/-/commit/54f11ca96e6c6207b95529d57f5ab19cafde3d75
define([], function () {
    return {
      getCurrentTheme() {
          return window.__splunk_page_theme__ || 'light';
      }
    };
});
