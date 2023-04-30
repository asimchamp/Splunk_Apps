/* Simple parser for DAVID */

Editor.Parser = (function() {
  var tokenizeDAVID = (function() {
    function normal(source, setState) {
      var ch = source.next();
      if (ch == "\"") {
	  setState(inString(ch, "david-string"));
	  return null;
      }
      if (ch == "[") {
	  setState(inString("]", "david-subsearch"));
	  return null;
      }
      if (ch == "|") { 
	  source.nextWhileMatches(/[\w_-]/);
	  while (!source.endOfLine()) {
	      var ch = source.next();
	      if (ch != ' ')
		  break;
	  }
	  while (!source.endOfLine()) {
	      var ch = source.next();
	      if (ch == ' ')
		  break;
	  }
	  return "david-command";
      }
      source.nextWhileMatches(/[\w\\\-_]/);
      return "david-identifier";
    }

    function inString(quote, stylename) {
      return function(source, setState) {
        var escaped = false;
        while (!source.endOfLine()) {
          var ch = source.next();
          if (ch == quote && !escaped)
            break;
          escaped = !escaped && ch == "\\";
        }
        if (!escaped)
          setState(normal);
        return stylename;
      };
    }

    return function(source, startState) {
      return tokenizer(source, startState || normal);
    };
  })();

keywords = [
"and", "as", "by", "dd", "from", "groupby", "hh", "like", "mm", "not", "or", "output", "outputnew", "ss", "where", "xor", "yy", "_metainclude", "abs", "abstract", "accum", "action", "add", "addinfo", "addtime", "addtotals", "af", "agg", "allnum", "allowempty", "allrequired", "annotate", "anomalies", "anomalousvalue", "append", "appendcols", "appendpipe", "artifact_offset", "as", "associate", "attr", "attribute", "attrn", "audit", "auto", "autoregress", "avg", "bcc", "bins", "blacklist", "blacklistthreshold", "bottom", "bucket", "bucketdir", "buffer_span", "by", "c", "case", "cb", "cc", "cfield", "chart", "chunk", "chunksize", "cidrmatch", "cityblock", "classfield", "clean_keys", "cluster", "cmd", "coalesce", "cocur", "col", "collapse", "collect", "commands", "concurrency", "connected", "consecutive", "cont", "context", "contingency", "convert", "copyattrs", "copyresults", "correlate", "cos", "cosine", "count", "counterexamples", "countfield", "crawl", "create_empty", "createinapp", "createrss", "cs", "csv", "ctime", "current", "d", "day", "days", "daysago", "dbinspect", "dc", "debug", "dedup", "default", "delete", "delim", "delims", "delta", "desc", "descr", "dest", "dictionary", "diff", "diffheader", "discard", "dispatch", "distinct", "distinct-count", "distinct_count", "ds", "dt", "dur", "duration", "earlier", "earliest", "east", "editinfo", "ema", "end", "end_time", "enddaysago", "endhoursago", "endminutesago", "endmonthsago", "endswith", "endtime", "erex", "estdc", "estdc_error", "eval", "eventcount", "events", "eventsonly", "eventstats", "eventtype", "eventtypetag", "exact", "exactperc", "examples", "exp", "extract", "false", "field", "fieldformat", "fieldname", "fields", "fieldstr", "fieldsummary", "file", "files", "filldown", "fillnull", "filter", "findtypes", "first", "floor", "folderize", "force", "forceheader", "foreach", "form", "format", "from", "fromfield", "gauge", "gentimes", "geocluster", "global", "graceful", "grouped", "h", "head", "high", "highest", "highlight", "hilite", "history", "host", "hosts", "hosttag", "hour", "hours", "hoursago", "hr", "hrs", "html", "iconify", "id", "if", "ifnull", "ignore_running", "improv", "in", "inclname", "inclvalue", "increment", "index", "inline", "inner", "input", "inputcsv", "inputlookup", "internalinputcsv", "intersect", "ip", "iplocation", "iqr", "isbool", "isint", "isnotnull", "isnull", "isnum", "isstr", "job_delegate", "join", "k", "keepempty", "keepevents", "keepevicted", "keeplast", "keeporphans", "keepresults", "keepsingle", "keyset", "kmeans", "kvform", "l", "label", "labelfield", "labelonly", "last", "latest", "left", "len", "like", "limit", "link", "list", "ln", "loadjob", "local", "localize", "localop", "log", "logchange", "lookup", "low", "lower", "lowest", "ltrim", "m", "makecontinuous", "makemv", "map", "marker", "match", "matchseg", "matchstr", "max", "max_buffer_size", "max_match", "max_terms", "max_time", "maxanofreq", "maxchars", "maxclusters", "maxcols", "maxcount", "maxevents", "maxfolders", "maxinputs", "maxiters", "maxlen", "maxlines", "maxopenevents", "maxopentxn", "maxout", "maxpause", "maxresolution", "maxresults", "maxrows", "maxsample", "maxsearches", "maxspan", "maxterms", "maxtime", "maxtrainers", "maxvals", "maxvalues", "md", "mean", "median", "memk", "metadata", "metasearch", "min", "mincolcover", "minfolders", "minnormfreq", "minrowcover", "mins", "minspan", "minsupcount", "minsupfreq", "minute", "minutes", "minutesago", "mktime", "mode", "mon", "month", "months", "monthsago", "ms", "msg_debug", "msg_error", "msg_info", "msg_warn", "mstime", "multikv", "multisearch", "multitable", "mv_add", "mvappend", "mvcombine", "mvcount", "mvexpand", "mvfilter", "mvindex", "mvjoin", "mvlist", "mvrange", "mvraw", "mvzip", "name", "name-terms", "namespace", "network", "newseriesfilter", "ngramset", "noheader", "nokv", "nomv", "none", "norm", "normalize", "north", "nosubstitution", "not", "notcovered", "notin", "now", "null", "nullif", "nullstr", "num", "optimize", "or", "otherstr", "outer", "outfield", "outlier", "output", "outputcsv", "outputfield", "outputlookup", "outputraw", "outputrawr", "outputtext", "over", "overlap", "override", "overwrite", "p", "param", "partial", "path", "pathfield", "per_day", "per_hour", "per_minute", "per_second", "perc", "percentfield", "percint", "perl", "pi", "position", "pow", "predict", "prefix", "prerun", "prestats", "preview", "priority", "private-terms", "proc", "pthresh", "public-terms", "python", "random", "range", "rangemap", "rare", "raw", "rawstats", "readlevel", "regex", "relative_time", "relevancy", "reload", "reltime", "remove", "rename", "replace", "reps", "required", "resample", "rescan", "rest", "return", "reverse", "rex", "rm", "rmcomma", "rmorig", "rmunit", "roll", "round", "row", "rtorder", "rtrim", "run_in_preview", "runshellscript", "s", "sample", "savedsearch", "savedsplunk", "script", "scrub", "search", "searchkeys", "searchmatch", "searchtimespandays", "searchtimespanhours", "searchtimespanminutes", "searchtimespanmonths", "searchtxn", "sec", "second", "seconds", "secs", "sed", "segment", "select", "selfjoin", "sendemail", "sendpdf", "sendresults", "sep", "server", "set", "setfields", "setsv", "showargs", "showcount", "showperc", "sichart", "sid", "sigfig", "singlefile", "sirare", "sistats", "sitimechart", "sitop", "size", "sizefield", "sleep", "sma", "sort", "sortby", "source", "sources", "sourcetype", "sourcetypes", "south", "span", "sparkline", "spath", "spawn_process", "split", "splunk_server", "spool", "sq", "sqeuclidean", "sqrt", "squashcase", "start", "start_time", "startdaysago", "starthoursago", "startminutesago", "startmonthsago", "startswith", "starttime", "starttimeu", "stats", "stdev", "stdevp", "str", "strcat", "streamedcsv", "streaming", "streamstats", "strftime", "strptime", "substr", "sum", "summary", "sumsq", "supcnt", "supfreq", "surrounding", "sync", "t", "table", "tag", "tagcreate", "tagdelete", "tags", "tagset", "tail", "termlist", "termset", "testmode", "text", "tf", "threshold", "time", "timeafter", "timebefore", "timechart", "timeconfig", "timeformat", "timeout", "to", "tokenizer", "tol", "top", "tostring", "totalstr", "transaction", "transform", "transpose", "trendline", "trim", "true", "tscollect", "tstats", "ttl", "type", "typeahead", "typelearner", "typeof", "typer", "unifyends", "union", "uniq", "untable", "update", "upper", "upperperc", "urldecode", "us", "use_disjunct", "uselower", "usenull", "useother", "useraw", "usetime", "usetotal", "usexml", "validate", "value", "values", "var", "varp", "west", "where", "width_sort_columns", "window", "with", "wma", "x", "xmlkv", "xmlunescape", "xpath", "xyseries"
]
var re1 = /^\s\s*/;
var re2 = /\s\s*$/
function ourTrim(str) {
    if (str.trim) return str.trim();
    return str.replace(re1, '').replace(re2, '');
}


  function parseDAVID(source, basecolumn) {
    basecolumn = basecolumn || 0;
    var tokens = tokenizeDAVID(source);
    var inBraces = false, inRule = false;

    var iter = {
      next: function() {
        var token = tokens.next(), style = token.style, content = token.content;
        
        tok = ourTrim(token.value).toLowerCase()
        //tok = token.value.toLowerCase()
	for (var i = 0; i < keywords.length; i++) {
	    if ((tok == keywords[i]) && token.style == "david-identifier") {
		token.style = "david-keyword";
	        break;
	    }
	}
        return token;
      },

      copy: function() {
        var _inBraces = inBraces, _inRule = inRule, _tokenState = tokens.state;
        return function(source) {
          tokens = tokenizeDAVID(source, _tokenState);
          inBraces = _inBraces;
          inRule = _inRule;
          return iter;
        };
      }
    };
    return iter;
  }

  return {make: parseDAVID, electricChars: "}"};
})();
