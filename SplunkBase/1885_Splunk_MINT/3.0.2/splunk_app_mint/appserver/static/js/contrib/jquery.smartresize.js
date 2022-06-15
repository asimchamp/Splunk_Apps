/*
 *  micro jQuery plugin that acts like a polyfill for window.resize event
 *  in order to get the same behavior across all major browser
 *
 *  Code written by Paul Irish,
 *  more detail can be found here: http://www.paulirish.com/2009/throttled-smartresize-jquery-event-handler/
 * */
(function($,sr){

  var debounce = function (func, threshold, execAsap) {
      var timeout;

      return function debounced () {
          var obj = this, args = arguments;
          function delayed () {
              if (!execAsap)
                  func.apply(obj, args);
              timeout = null;
          };

          if (timeout)
              clearTimeout(timeout);
          else if (execAsap)
              func.apply(obj, args);

          timeout = setTimeout(delayed, threshold || 100);
      };
  }

  jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

})(jQuery,'smartresize');

