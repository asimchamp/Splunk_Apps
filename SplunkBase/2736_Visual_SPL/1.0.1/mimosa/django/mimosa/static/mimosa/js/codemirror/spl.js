(function (mod) {
  if (typeof exports == "object" && typeof module == "object") { // CommonJS 
    mod(require(["../../bower_components/codemirror/lib/codemirror", "../../bower_components/codemirror/addon/mode/simple"]));
  } else if (typeof define == "function" && define.amd) { // AMD
    define(["../../bower_components/codemirror/lib/codemirror", "../../bower_components/codemirror/addon/mode/simple"], mod);
  } else { // Plain browser env
    mod(CodeMirror);
  }
})(function (CodeMirror) {
"use strict";
  var defineSpl = function (CodeMirror) {
      CodeMirror.defineSimpleMode('spl', {
          start: [
          {regex: /(accum|addinfo|addtotals|amodel|analyzefields|anomalies|anomalousvalue|append|appendcols|appendpipe|arules|associate|audit|bucket|chart|cluster|collect|contingency|convert|correlate|crawl|da|dbinspect|dedup|delete|delta|diff|erex|eval|eventcount|eventstats|extract|fields|filldown|fillnull|format|gauge|gentimes|geostats|head|input|inputcsv|inputlookup|iplocation|join|kmeans|kvform|loadjob|localize|localop|lookup|makecontinuous|makemv|map|metadata|multikv|mvcombine|mvexpand|nomv|outlier|outputcsv|outputlookup|outputtext|overlap|predict|rangemap|rare|regex|relevancy|reltime|rename|replace|return|reverse|rex|savedsearch|search|searchtxn|selfjoin|sendemail|set|sichart|sirare|sistats|sitimechart|sitop|sort|spath|stats|strcat|streamstats|table|tail|timechart|top|transaction|trendline|typeahead|typelearner|typer|uniq|untable|where|x11|xmlkv|xyseries)\b/i, token: "keyword"},
          {regex: /(by|as|over)/i, token: "builtin"},
          {regex: /"(?:[^\\]|\\.)*?"/, token: "string"},
          {regex: /TRUE|FALSE/i, token: "atom"},
          {regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, token: "number"},
          {regex: /#.*/, token: "comment"},
          {regex: /[-+\/*=<>!]+/, token: "operator"},
          {regex: /[a-zA-Z0-9_$][\w$]*/, token: "variable"}
        ]
      });    
  };

  defineSpl(CodeMirror);
});
