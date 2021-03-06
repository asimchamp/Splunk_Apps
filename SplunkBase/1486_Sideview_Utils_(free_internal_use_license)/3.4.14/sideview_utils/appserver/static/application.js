/* Copyright (C) 2010-2018 Sideview LLC.  All Rights Reserved. */
      function toggleAccordion(link){
        var contents=$('.contents',$(link).parent());
        if (contents.is(':visible')) {
          contents.hide()
        }
        else {
          contents.show();
        }
      }

$(document).ready(function() {
    var views = [   "home",
                "framework_intro",
                "search1_intro",
                "pulldown1_static",
                "pulldown2_dynamic",
                "pulldown3_dynamic_templated",
                "pulldown4_dynamic_postprocess",
                "pulldown5_dynamic_noall_notoken",
                "pulldown6_dynamic_multipleselect",
                "pulldown7_multivalued",
                "checkbox_pulldown1",
                "text_field1",
                "linking" ,
                "linking1_pulldowns" ,
                "linking2_tables",
                "drilldown1_tables",
                "back_button1",
                "post_process_intro",
                "post_process1_static",
                "post_process2_dynamic",
                "html1_static",
                "html2_dynamic_ui_tokens",
                "html3_dynamic_results",
                "html4_external",
                "html5_replacing_singlevalue",
                "pager1",
                "pager2_postprocess",
                "checkbox1",
                "switcher1_with_pulldown",
                "report1",
                "events1_intro",
                "tabs1_static",
                "tabs2_dynamic_templated",
                "custom_keys",
                "interfaces_intro",
                "tools",
                "comparison1_overview",
                "multiplexer1_intro",
                "multiplexer2_paging",
                "multiplexer3_dashboard_panels",
                "table1_intro",
                "table2_drilldown",
                "table3_drilldown_defaults",
                "table4_rendering",
                "table5_embedding",
                "gate1_blocking_search",
                "gate2_complex_drilldowns",
                "search_controls1_intro",
                "detecting_sideview_utils"
    ];
    var loc = document.location.pathname.toString();
    var currentView = loc.substring(loc.lastIndexOf("/")+1);
    // dont run this in manager.  (it can show up in the 'view' section)
    if (loc.indexOf("/manager/")!=-1) return;

    var nextView = null;
    var located = false;
    var linkText = "";
    for (var i=0,len=views.length;i<len; i++) {
        var view = views[i];
        if (located) {
            nextView = view
                i=len-1;
        }
        else if (currentView == view) {
            located = true;
            if (i==0) linkText = "On to the Examples";
            else if (i==len-1) {
                linkText = "Return Home";
                nextView = views[0];
            }
            else linkText = "Next Page (" + (i+1) + " of " + (len-1) + ")";
        }
    }
    if (nextView) {
        nextView +=  document.location.search;
        var nextLink = $("<a>")
            .attr("href",nextView)
            .html(linkText + " &raquo ")
            .css("font-size", "14px")

        var firstHeader = $(".viewHeader h1");
        var insertion = (firstHeader.length>0)? firstHeader : $("body > .HTML > h1")

        insertion
            .before(nextLink.clone()
                .css("float","right")
                .css("margin","3px 10px 0px 10px")
            );
        $("body")
            .append(nextLink.clone()
                .css("display","block")
                .css("margin","10px")
             );
        $("ol.notesList")
            .append($("<li>")
                .append(nextLink.clone())
            );

    }

    var viewsToGetNoLaunchLink = [
        "home",
        "framework_intro",
        "search1_intro"
    ];
    if ($.inArray(Sideview.utils.getCurrentView(), viewsToGetNoLaunchLink)==-1) {
        var launchLink = $("<a>")
            .attr("href", Sideview.utils.make_url("/custom/sideview_utils/view/show?app=sideview_utils&view=" + Sideview.utils.getCurrentView()))
            .attr("target", "xmlViewerWindow")
            .text("View the XML source for this view in a new window.")
        
        $("ol.notesList")
            .prepend($("<li>")
                .append(launchLink)
            );
    }
});



if (typeof(Sideview)!="undefined") {
    
    Sideview.utils.declareCustomBehavior("autoSubmitWhenOnlyOneValue", function(buttonModule) {
        var methodReference = buttonModule.isReadyForContextPush.bind(buttonModule);
        
        buttonModule.isReadyForContextPush = function() {
            if (!this.allowAutoSubmit && !this.isPageLoadComplete()) {
                var context = this.getContext();
                // "series" is the value of the Pulldown's "name" param 
                var selectElement = context.get("series.element");
                if (selectElement.length>0);{
                    var numberOfOptions = selectElement[0].options.length;
                    return (numberOfOptions == 1);
                }
            }
            return methodReference();
        }
    });
    


    Sideview.utils.declareCustomBehavior("hideModuleOnPageLoad", function(htmlModule) {
        var visibilityReason = "customBehavior hides the module initially";
        htmlModule.hide(visibilityReason);
        
        // preserve the existing onContextChange method.
        var methodReference = htmlModule.onContextChange.bind(htmlModule);
        
        // now override the onContextChange method
        htmlModule.onContextChange = function() {
            var context = this.getContext();
            if (context.get("MyParam") == -1) {
                this.show(visibilityReason);
            } else {
                this.hide(visibilityReason);
            }
            // but note that we both call the original method, and we also are
            // careful to return the original method's return value.
            return methodReference();
        }
    });


    /**
     * custom behaviors used to automate part of the pulldown-load-time
     * benchmark test.
     */
    if (Sideview.utils.getCurrentView().indexOf("comparison")==0) {

        var timeStarted;
        var timeEnded;
        var deltas = [];

        Sideview.utils.declareCustomBehavior("startTimer", function(searchModule) {
            searchModule.onContextChange = function() {
                timeStarted = new Date();
            }
        });

        Sideview.utils.declareCustomBehavior("endTimer", function(searchModule) {
            searchModule.onContextChange = function() {
                timeEnded = new Date();
                var diff = (timeEnded.valueOf() - timeStarted.valueOf()) / 1000;
                deltas.push(diff);
                $("#elapsedTime").text(diff);
                $("#numberOfMeasurements").text(deltas.length);
                var total = 0;
                for (var i=0;i<deltas.length; i++) {
                    total += deltas[i];
                }
                $("#averageTime").text(total / deltas.length);

            }.bind(searchModule);
        });
        

    }

    /**
     * logic for the TextField's testcase view.
     */
    Sideview.utils.declareCustomBehavior ("sendContextKeysUpstream", function(htmlModule) {
        $(htmlModule.container).click(function(evt) {
            var a = $(evt.target);
            var href = a.attr("href").substring(a.attr("href").indexOf("#")+1);
            var pair = href.split("=");

            var context = new Splunk.Context();
            context.set(pair[0], pair[1]);
            htmlModule.passContextToParent(context);
            return false;
        });

    });

    /**
     * logic for the back button testcase views.
     */
    Sideview.utils.declareCustomBehavior ("countPushes", function(module) {
        module.onContextChange = function() {
            this.show();
            if (this.isFake) return;
            var pushes = this.pushes || 1;
            this.pushes = ++pushes;
            this.container.html("pushed: " + this.pushes  + " times")
        }

    });


    Sideview.utils.declareCustomBehavior ("customInputValidation", function(textFieldModule) {
        textFieldModule.validate = function() {
            var v = this.input.val();
            return (Sideview.utils.isInteger(v) && parseInt(v)>=0 && parseInt(v)<=100);
        };
        textFieldModule.onValidationFail = function() {
            Sideview.utils.broadcastMessage("info","*", "Note: percentiles must be between 0 and 100");
        };
        textFieldModule.onValidationPass = function() {
            Sideview.utils.clearMessages();
        };
        
    });

    Sideview.utils.declareCustomBehavior ("highlightPassesAndFails", function(htmlModule) {
        htmlModule.onHTMLRendered = function() {
            this.container.find("span.shouldBe").each(function() {
                var shouldBeValue = $(this).attr("s:shouldBe");
                var actualValue = $(this).text();
                
                if (shouldBeValue==actualValue || (!shouldBeValue && !actualValue)) {
                    $(this).addClass("hasExpectedValue");
                } else {
                    $(this).addClass("hasUnexpectedValue");
                }
                if (actualValue=="") {
                    var message = "(no value found at runtime"
                    if (shouldBeValue!="") {
                        message += ". Expected " + shouldBeValue;
                    }
                    message += ")"
                    $(this).text(message);
                }
            });
        }
    });



    function runTestCases(testCases, testFunction) {
        var output = [];
        output.push("<table class='splTable'>")
        output.push("<tr><th>input</th><th>replaced</th><th>expected</th><th>outcome</th></tr>")

        for (var i=0;i<testCases.length;i++) {
            var input = testCases[i][0];
            var replaced = testFunction(input);
            var expected = testCases[i][1];
            var outcome = (replaced==expected)?"Passed":"Failed";

            output.push("<tr><td>");
            output.push(input);
            output.push("</td><td>");
            output.push(replaced)
            output.push("</td><td>");
            output.push(expected);
            output.push("</td><td>");
            output.push(outcome);
            output.push("</td></tr>");
        }
        return output.join("\n");
        
    }
    Sideview.utils.declareCustomBehavior("testQuoteEscaping", function(customBehaviorModule) {
        var testCases = [
            ['ends with a word in "quotes"', 'ends with a word in \\"quotes\\"'],
            ['"quotes" at start' ,'\\"quotes\\" at start'],
            ['oh hai "quotes" in middle', 'oh hai \\"quotes\\" in middle']
        ];
        customBehaviorModule.getModifiedContext = function() {
            var context;
            var testFunction = function(input) {return Sideview.utils.escapeDoubleQuotes(input)}
            var output = runTestCases(testCases, testFunction);
            context = this.getContext();
            context.set("output", output);
            return context;
        }
    });

    Sideview.utils.declareCustomBehavior("testDoubleQuoteValue", function(customBehaviorModule) {
        var testCases = [
            ['ends with a word in "quotes"', '"ends with a word in \\"quotes\\""'],
            ['"quotes" at start' ,'"\\"quotes\\" at start"'],
            ['oh hai "quotes" in middle', '"oh hai \\"quotes\\" in middle"']
        ];
        customBehaviorModule.getModifiedContext = function() {
            var context;
            var testFunction = function(input) {return Sideview.utils.doubleQuoteValue(input)}
            var output = runTestCases(testCases, testFunction);
            context = this.getContext();
            context.set("output", output);
            return context;
        }
    });

    Sideview.utils.declareCustomBehavior("testGetSearchTermsFromFilters", function(customBehaviorModule) {
        var testCases = [
            [[{
                "field" : "user",
                "value" : "mildred"
            }], 'user="mildred"'],
            [[{
                "field" : "user",
                "value" : "admin"
            },{
                "field" : "action",
                "value" : "explode"
            }], 'user="admin" action="explode"'],
            [[{
                "field" : "source",
                "value" : "C:\\foo\\bar\\baz.bat"
            }], 'source="C:\\\\foo\\\\bar\\\\baz.bat"'],
            [[{
                "field" : "IHasAQuoteChar",
                "value" : "foo\"bar"
            }], 'IHasAQuoteChar="foo\\\"bar"'],
            [[{
                "negation": true,
                "field" : "user",
                "value" : "unwanted"
            }], 'NOT user="unwanted"'],
            [[{
                "operator": ">=",
                "field" : "bytes",
                "value" : "17"
            }], 'bytes>=17'],
            [[{
                "operator": "!=",
                "field" : "pony",
                "value" : "yours"
            }], 'pony!="yours"'],
            [[{
                "operator": "=",
                "field" : "equalsOperator",
                "value" : "redundantButOkFine"
            }], 'equalsOperator="redundantButOkFine"']
        ];
        conglomifiedInput = [];
        conglomifiedOutput  =[]; 
        for (var i=0;i<testCases.length;i++) {
            conglomifiedInput = conglomifiedInput.concat(testCases[i][0]);
            conglomifiedOutput.push(testCases[i][1]);
        }
        
        testCases.push([conglomifiedInput,conglomifiedOutput.join(" ")]);

        customBehaviorModule.getModifiedContext = function() {
            var context;
            var testFunction = function(input) {return Sideview.utils.getSearchTermsFromFilters(input).join(" ");}
            var output = runTestCases(testCases, testFunction);
            context = this.getContext();
            context.set("output", output);
            return context;
        }
    });


    
    
    Sideview.utils.declareCustomBehavior("fooReplacementTestCases", function(customBehaviorModule) {
        var inputMap = {
            "foo" : "I'm",
            "bar" : 37,
            "baz" : "not",
            "bat" : "old",
            "explicitArraySyntax[0]" : "no you havent",
            "mvFoo" : ["yes it is","no it isn't"],
            "mvBar" : ["an argument isn't just contradiction", "yes it is"],
            "mvBaz" : ["", "I've had enough of this"]
        }
               
        var testCases = [
            ["$bat$", "old"],
            ["$foo$ $bar$, $foo$ $baz$ $bat$", "I'm 37, I'm not old"],
            ["$bar$", "37"],
            ["$$$bar$", "$37"],
            ["$someUndefinedKey$ fred", " fred"],
            ["$someUndefinedKey$ $foo$ $baz$ $bat$", " I'm not old"],
            ["look this isn't an argument", "look this isn't an argument"],
            ["$mvFoo[0]$", "yes it is"],
            ["$mvFoo[1]$", "no it isn't"],
            ["$mvFoo[12]$ (should be empty)", " (should be empty)"],
            ["$mvFoo[]$ (should be empty)", " (should be empty)"],
            ["$mvFoo[0]no_match$ (should be empty)", " (should be empty)"],
            ["$mvBar[0]$. $mvFoo[0]$! $mvFoo[1]$!", "an argument isn't just contradiction. yes it is! no it isn't!"],
            ["$mvBaz[0]$ (should be empty)", " (should be empty)"],
            ["$mvBaz[0]$$mvBaz[1]$$mvBaz[2]$", "I've had enough of this"],
            ["$explicitArraySyntax[0]$","no you havent"]
        ];

        customBehaviorModule.getModifiedContext = function() {
            var that = this;
            var testFunction = function(input) {
                var context = that.getContext();
                for (key in inputMap) {
                    if (inputMap.hasOwnProperty(key)) {
                        context.set(key, inputMap[key]);
                    }
                }
                return Sideview.utils.replaceTokensFromContext(input,context);
            }
            var context = this.getContext();
            
            var output = runTestCases(testCases, testFunction);
            context.set("output", output);
            return context;
        }
    });


    Sideview.utils.declareCustomBehavior("make_urlTestCases", function(customBehaviorModule) {
        var rootEndpoint = "/";
        var rootEndpoint = "/zomg";
        var testCases = [
            [["foo"],"/en-US/foo"],
            [["foo","bar"],"/en-US/foo/bar"],
            [["/foo","bar"],"/en-US/foo/bar"],
            [["/foo","/bar"],"/en-US/foo/bar"],
            [["/foo/","/bar/"],"/en-US/foo/bar"],
            [["foo","bar"],"/en-US/foo/bar"],
            [["static","foo"],"/en-US/static/@123.456/foo"],
            [["static","app","sideview_utils","print.css"],"/en-US/static/@123.456:789/app/sideview_utils/print.css"],
            [["/custom/sideview_utils/editor/top?app=sideview_utils&view=example_view"], "/en-US/custom/sideview_utils/editor/top?app=sideview_utils&view=example_view"]
        ];
        for (var i=0;i<testCases.length; i++) {
            if (rootEndpoint!="/") testCases[i][1] = rootEndpoint + testCases[i][1];
        }
        Sideview.utils.getConfigValue = function(name) {
            switch (name){
                case "BUILD_NUMBER":
                    return 123;
                case "BUILD_PUSH_NUMBER":
                    return 456;
                case "APP_BUILD":
                    return 789;
                case "LOCALE":
                    return "en-US";
                case "MRSPARKLE_ROOT_PATH":
                    return rootEndpoint;
                default:
                    return "wtf";
            }
        }

        customBehaviorModule.getModifiedContext = function() {
            var that = this;
            var testFunction = function(array) {
                return Sideview.utils.make_url.apply(null,array);
            }
            var context = this.getContext();
            
            var output = runTestCases(testCases, testFunction);
            context.set("output", output);
            return context;
        }
    });


    Sideview.utils.declareCustomBehavior("stringToListTestCases", function(customBehaviorModule) {
               
        var testCases = [
            ["fred","fred"],
            ["fred,ethel,mildred","fred,ethel,mildred"],
            ["fred ethel mildred","fred,ethel,mildred"],
            ["fred, ethel ,mildred , agnes","fred,ethel,mildred,agnes"],
            ["fred,, agnes ","fred,agnes"],
            
        ];
        
        customBehaviorModule.getModifiedContext = function() {
            var that = this;
            var testFunction = function(str) {
                return Sideview.utils.stringToList(str).join(",");
            }
            var context = this.getContext();
            
            var output = runTestCases(testCases, testFunction);
            context.set("output", output);
            return context;
        }
    });

    Sideview.utils.declareCustomBehavior("normalizeBooleanTestCases", function(customBehaviorModule) {
               
        var testCases = [
            [true,true],
            ["1",true],
            ["true",true],
            ["True",true],
            //["TRUE",true],
            ["2",true],
            [1,true],
            [2,true],
            [false,false],
            [0,false],
            [-1,false],
            ["false",false],
            ["False",false],
            ["FALSE",false],
            ["No",false],
            ["no",false],
            ["omgShutItDown",false],
            ["whoseDumbIdeaWasThisFunctionAnyway",false]
        ];
        
        customBehaviorModule.getModifiedContext = function() {
            var that = this;
            var testFunction = function(input) {
                return Sideview.utils.normalizeBoolean(input);
            }
            var context = this.getContext();
            
            var output = runTestCases(testCases, testFunction);
            context.set("output", output);
            return context;
        }
    });

    Sideview.utils.declareCustomBehavior("templatizeTestCases", function(customBehaviorModule) {
        
        var testCases = [
            [['foo"bar','field="$value$"'],'field=\"foo\\\"bar\"'],
            [['foo"bar','( field="$value$" )'],'( field=\"foo\\\"bar\" )'],
            [['\\var\\log\\messages','field="$value$"'],'field=\"\\\\var\\\\log\\\\messages"'],
            [['\\var\\log\\messages','NOT $value$'],'NOT \\\\var\\\\log\\\\messages'],
            [['C:\\Program Files\\"yay windows"\\foo.conf','NOT $value$'],'NOT C:\\\\Program Files\\\\"yay windows"\\\\foo.conf'],
            [['C:\\Program Files\\"yay windows"\\foo.conf','field="$value$"'],'field="C:\\\\Program Files\\\\\\"yay windows\\"\\\\foo.conf"'],


        ];
        customBehaviorModule.getModifiedContext = function() {
            var that = this;
            var context = new Splunk.Context();
            
            var testFunction = function(input) {
                var c = that.getContext();
                return Sideview.utils.safeTemplatize(c,input[1],"field",input[0]);
            }
            
            var output = runTestCases(testCases, testFunction);
            var context = this.getContext();
            context.set("output", output);
            return context;
        }
    });

    Sideview.utils.declareCustomBehavior("checkReportModuleTestCases", function(customBehaviorModule) {
        
        customBehaviorModule.getModifiedContext = function() {
           var customBehaviorContext = this.getContext();

           var reportModuleTestCases = [
                {
                    "stat":"dc",
                    "yField" : "users",
                    "xField" : "_time",
                    "zField" : "department",
                    "xFieldBins" : null,
                    "zFieldBins": null,
                    "expected" : "timechart dc(users) by department"
                },
                {
                    "stat":"avg",
                    "yField" : "days_since_washed",
                    "xField" :"_time",
                    "zField" : null,
                    "xFieldBins" : null,
                    "zFieldBins": null,
                    "expected" : "timechart avg(days_since_washed)"
                },
                {
                    "stat":"avg",
                    "yField" : "days_since_washed",
                    "xField" :"_time",
                    "zField" : null,
                    "xFieldBins" : "200",
                    "zFieldBins": null,
                    "expected" : "timechart bins=200 avg(days_since_washed)"
                },
                {
                    "stat":"sum",
                    "yField" : "odor_alerts",
                    "xField" : "user",
                    "zField" : null,
                    "xFieldBins" : null,
                    "zFieldBins": null,
                    "expected" : "chart sum(odor_alerts) over user"
                },
                {
                    "stat":"sum",
                    "yField" : "odor_alerts",
                    "xField" : "user",
                    "zField" : "department",
                    "xFieldBins" : null,
                    "zFieldBins": null,
                    "expected" : "chart sum(odor_alerts) over user by department"
                },
                {
                    "stat":"sum",
                    "yField" : "odor_alerts",
                    "xField" : "days_since_washed",
                    "zField" : "department",
                    "xFieldBins" : "30",
                    "zFieldBins": null,
                    "expected" : "mvexpand days_since_washed | bin days_since_washed bins=30 | chart sum(odor_alerts) over days_since_washed by department | makecontinuous days_since_washed"
                },
                {
                    "stat":"perc5",
                    "yField" : "days_since_washed",
                    "xField" : "department",
                    "zField" : "odor_alerts",
                    "xFieldBins" : null,
                    "zFieldBins": "72",
                    "expected" : "mvexpand odor_alerts | bin odor_alerts bins=72 | chart perc5(days_since_washed) over department by odor_alerts limit=72"
                },
                {
                    "stat":"dc",
                    "yField" : "lice",
                    "xField" : "_time",
                    "zField" : "days_since_washed",
                    "xFieldBins" : null,
                    "zFieldBins": "50",
                    "expected" : "mvexpand days_since_washed | bin days_since_washed bins=50 | timechart dc(lice) by days_since_washed limit=50"
                },
                {
                    "stat":"dc",
                    "yField" : "lice",
                    "xField" : "odor_alerts",
                    "zField" : "days_since_washed",
                    "xFieldBins" : "20",
                    "zFieldBins": "50",
                    "expected" : "mvexpand odor_alerts | bin odor_alerts bins=20 | mvexpand days_since_washed | bin days_since_washed bins=50 | chart dc(lice) over odor_alerts by days_since_washed limit=50 | makecontinuous odor_alerts"
                },
            ];

            var reportModule = customBehaviorModule.parent;

            var failures = [];
            var successes = [];
            var testCaseContext = new Splunk.Context();
            for (var i=0; i<reportModuleTestCases.length; i++) {
                var c = reportModuleTestCases[i];
                for (var key in c) {
                    testCaseContext.set(key, c[key]);
                }
                var received = reportModule.getReportStr(testCaseContext);
                
                if (received == c["expected"]) {
                    successes.push("SUCCESS - received: <b>" + received + "</b></b>"); 
                } else {
                    failures.push("FAILURE - received: <br><b>" + received + "</b><br> but we expected: <br><b>" + c["expected"] +"</b>"); 
                }
            }
            customBehaviorContext.set("failures", failures.join("<br>"));
            customBehaviorContext.set("successes", successes.join("<br>"));
            return customBehaviorContext;
        }
    });
    
     
    
    Sideview.utils.declareCustomBehavior("inferredFieldNamesTestCases", function(customBehaviorModule) {
        customBehaviorModule.getModifiedContext = function() {
            var cases = [
                                
            {"search":"search foo=bar",
             "fields": ["foo"]},
                
            {"search":"search foo=bar baz=bat",
             "fields": ["foo","baz"]},
                
            {"search":"where foo=bar",
             "fields": ["foo","bar"]},
            {"search":"where foo=bar baz=bat",
             "fields": ["foo","bar","baz","bat"]},

            {"search":"search user=mildred",
             "fields": ["user"]},
            {"search":'search foo bar user="mildred" NOT group=finance',
             "fields": ["user","group"]},
            {"search": 'search bytes>12',
             "fields": ["bytes"]},
            {"search": 'search bytes>=12',
             "fields": ["bytes"]},
            {"search": 'where bytes>max',
             "fields": ["bytes","max"]},
            {"search": 'where bytes>=max',
             "fields": ["bytes","max"]},
            {"search": 'search user="mildred" [ dontmatch=12 | fields foo]',
             "fields": ["user"]},
            {"search": 'search user!="mildred"',
             "fields": ["user"]},
            {"search":"search user = mildred",
             "fields": ["user"]},
            {"search":"search user =mildred",
             "fields": ["user"]},
            {"search":"search user= mildred",
             "fields": ["user"]},
            {"search":"search MLQK!=0 MLQK<3",
             "fields": ["MLQK"]},
                
            {"search":'search "just a big string literal"',
             "fields": []},
            {"search":'search  "just a big string literal" "and another"',
             "fields": []},
            {"search":"search (dest_gateway=* OR orig_gateway=*) NOT (dest_gateway=* AND orig_gateway=*)",
             "fields": ["dest_gateway", "orig_gateway"]},
            {"search":'search foo="17" OR bar="17"',
             "fields": ["foo", "bar"]},
            {"search":"search foo='17' OR bar='17'",
             "fields": ["foo", "bar"]},
            {"search":"search foo=* OREGON_AWESOMENESS=*",
             "fields": ["foo", "OREGON_AWESOMENESS"]},
            {"search":"search foo=* NOT(OREGON=*)",
             "fields": ["foo", "OREGON"]},
            {"search":"search foo=* OR(OREGON=* NOT_A_NOT=8)",
             "fields": ["foo", "OREGON","NOT_A_NOT"]},
            {"search":"search foo=* NOTEWORTHY_FIELD_NAMES=*",
             "fields": ["foo", "NOTEWORTHY_FIELD_NAMES"]},
            {"search":"where fieldOne=fieldTwo",
             "fields": ["fieldOne", "fieldTwo"]},
            
            {"search":"where transfers>legs initialCallingPartyNumber=something",
             "fields": ["transfers", "legs","initialCallingPartyNumber","something"]},
            {"search":"where transfers>legs initialCallingPartyNumber= something",
             "fields": ["transfers", "legs","initialCallingPartyNumber","something"]},
            {"search":"where transfers>legs initialCallingPartyNumber =something",
             "fields": ["transfers", "legs","initialCallingPartyNumber","something"]},
            {"search":"search transfers>0 initialCallingPartyNumber= 22 foo=\"bar\"",
             "fields": ["transfers", "initialCallingPartyNumber","foo"]},
            {"search":"search transfers>0 initialCallingPartyNumber= 22*",
             "fields": ["transfers", "initialCallingPartyNumber"]}
           /*
           */
            ];
            var failures = [];
            var successes = [];
            for (var i=0; i<cases.length; i++) {
                var s = cases[i].search;
                var inferredFields = Sideview.utils.getFieldNamesFromSearchExpression(s,true).sort();
                var expectedFields = cases[i].fields.sort();
                if (inferredFields.join(",")==expectedFields.join(",")) {
                    successes.push("SUCCESS - from [" + s +  "] we extracted <b>" + inferredFields.join(",")+ "</b>"); 
                } else {
                    failures.push("FAILURE - from [" + s +  "] we extracted <b>x" + inferredFields.join(",") + "x</b> instead of <b>x" + expectedFields.join(",") + "x</b>"); 
                }
            }
            var context = this.getContext();
            context.set("failures", failures.join("<br>"));
            context.set("successes", successes.join("<br>"));
            return context;
        }
    });


            
    
    Sideview.utils.declareCustomBehavior("inferredSplitByTestCases", function(customBehaviorModule) {
        customBehaviorModule.getModifiedContext = function() {
            var context = this.getContext();
            var cases = [
            {"search":"",
             "field": false},
            {"search":"foo",
             "field": false},
            {"search":"foo | stats count",
             "field": false},
            {"search":"sourcetype=access_combined | stats count by clientip",
             "field": false},
            {"search":"sourcetype=access_combined | stats count by clientip user",
             "field": false},
            {"search":"sourcetype=access_combined | timechart count",
             "field": false},
            {"search":"sourcetype=access_combined | timechart count by clientip",
             "field": "clientip"},
            {"search":"sourcetype=access_combined | chart count by clientip",
             "field": false},
            {"search":"sourcetype=access_combined | chart count by clientip user",
             "field": "user"},
            {"search":"sourcetype=access_combined | chart count over clientip by user",
             "field": "user"},
            {"search":"sourcetype=access_combined | chart count over clientip by user ",
             "field": "user"},
            {"search":"sourcetype=access_combined |timechart count by clientip",
             "field": "clientip"},
            {"search":"sourcetype=access_combined |chart  count by clientip",
             "field": false},
            {"search":"sourcetype=access_combined |chart count by clientip user",
             "field": "user"},
            {"search":"sourcetype=access_combined |chart count over clientip by user",
             "field": "user"},
            {"search":"sourcetype=access_combined |chart count over clientip by user ",
             "field": "user"},
            {"search":"sourcetype=access_combined |chart count over clientip by  user",
             "field" : "user"},
            {"search":"sourcetype=access_combined | chart  count  over  clientip  by  user ",
             "field": "user"},
            {"search":"sourcetype=access_combined | chart count as foo sum(eps) as bar by date_minute date_second",
             "field": false},
            {"search":"* | timechart count max(date_second) by date_minute",
             "field": false},
            {"search":"sourcetype=access_combined | timechart count by date_minute date_second",
             "field": false},
            {"search":'index=* | bin _time span="1h" | stats count by sourcetype index _time | timechart count by sourcetype limit=30',
             "field": "sourcetype"},
            {"search":'index=* | timechart count by sourcetype limit="30"',
             "field": "sourcetype"},
            {"search":'index=* | timechart span="1h" count by sourcetype',
             "field": "sourcetype"},
            {"search":'index=* | timechart count by numericField span=10',
             "field": false}
            ];
            var failures = [];
            var successes = [];
            for (var i=0; i<cases.length; i++) {
                var s = new Splunk.Search(cases[i].search);
                var c = new Splunk.Context();
                c.set("search", s);
                var inferredField = Sideview.utils.getInferredSplitByField(c);
                var expectedField = cases[i].field;
                if (inferredField == expectedField) {
                    successes.push("SUCCESS - from [" + s +  "] we extracted <b>" + inferredField + "</b>"); 
                } else {
                    failures.push("FAILURE - from [" + s +  "] we extracted <b>x" + inferredField + "x</b> instead of <b>x" + expectedField + "x</b>"); 
                }
            }
            context.set("failures", failures.join("<br>"));
            context.set("successes", successes.join("<br>"));
            return context;
        }
    });

    Sideview.utils.declareCustomBehavior("measurePulldownRenderTime", function(pulldownModule) {
        
        var baseMethodReference = pulldownModule.buildOptionListFromResults.bind(pulldownModule);
        pulldownModule.buildOptionListFromResults = function(jsonStr) {
            
            this._jsonStr = jsonStr;
            var timeStarted = new Date();
            var retVal = baseMethodReference(this._jsonStr);
            var timeEnded = new Date();
            this._renderTime = (timeEnded.valueOf() - timeStarted.valueOf()) / 1000;
            return retVal;
        }

        baseGMCReference = pulldownModule.getModifiedContext.bind(pulldownModule);
        pulldownModule.getModifiedContext = function() {
            var modCon = baseGMCReference ();
            modCon.set("renderTime", this._renderTime);
            return modCon;
        }
    });

}

var SideviewApp = {};



if (typeof(Sideview)!="undefined") {
    // in this simple implementation there can only be one of these per page.
    
    // we just define a simple variable.
    var primaryTableModule;
    
    // and then use a customBehavior to just point our variable at the first table.
    Sideview.utils.declareCustomBehavior("closeButtonHidesAllChildrenAndClearsSelection", function(tableModule) {
        primaryTableModule = tableModule;
    });
    
    // then we use a customBehavior on the HTML module that will set up an 
    // event handler on the close button, that folds up all the drilldown
    // config and clears the selection.
    Sideview.utils.declareCustomBehavior("closeButtonContractsDrilldownTable", function(htmlModule) {
        var existingMethodReference = htmlModule.renderHTML.bind(htmlModule);
        htmlModule.renderHTML = function(context) {
            existingMethodReference(context);
            $(".splIcon-close",this.container).click(function() {
                // step 1 - tell the first table to hide all it's descendants. 
                var visibilityMode = primaryTableModule.drilldownVisibilityKey + primaryTableModule.moduleId;
                primaryTableModule.hideDescendants(visibilityMode);
                // step 2 - clear the highlighted row.
                primaryTableModule.clearSelection();
                // step 3 - call reset on all the descendants. 
                primaryTableModule.withEachDescendant(function(module) {
                    module.reset();
                });
            });
        }
    });

    Sideview.utils.declareCustomBehavior("confirmationPopup", function(buttonModule) {
        buttonModule.customClickHandler = function() {
            return window.confirm("are you sure?");
        }
    });

}

/*
 * THE FOLLOWING IS AN ADVANCED PROTOTYPE AND NOT CORE FUNCTIONALITY. 
 * IF YOU DO NOT FULLY UNDERSTAND IT AND FEEL COMFORTABLE WITH BEING 
 * RESPONSIBLE FOR ITS PRESENCE ON YOUR PRODUCTION SYSTEMS, DO NOT USE. 
 * 
 * see "testcases_for_link_rewrite_custom_behavior.xml" in Sideview Utils.
 * 
 * Advanced customBehavior and other custom code to implement a feature 
 * whereby several views can have one or more pulldowns,  where even if 
 * the user navigates away from the view to another random view,  if the 
 * pulldown(s) are present in the new view,  the selected value is always
 * passed from the first view to the second.  Again, this behavior happens
 * even if the user uses the app navigation bar to switch views. 
 * As such the implementation involves actively rewriting the href 
 * attributes of the actual link elements in the HTML.
 */
if (typeof(Sideview)!="undefined") {
    var fieldsToPreserve = ["test1", "host"];
    function rewriteLinks(argDict) {
        // We start by getting a collection of all the link elements within the
        // AppBar module (aka the app navigation menus).
        var linksToRewrite  = $("div.AppBar a");
        
        // depending on version the submenus of the AppBar may not actually be
        // in the AppBar module's container div.
        var splunkVersion = Sideview.utils.getConfigValue("VERSION_LABEL");

        if (Sideview.utils.compareVersions(splunkVersion,"4.3") > -1) {
            var extraMenuLinks = $("body .outerMenuWrapper .innerMenuWrapper a");
            linksToRewrite = linksToRewrite.add(extraMenuLinks);
        }
        
        linksToRewrite.each(function(i) {
            var a = $(this);
            var href = a.attr("href");
            // dont mess with these links. They might have their own args.
            if (a.text() == "Help" || a.text() == "About" || href.charAt(0)=="#") return true;

            // dont mess with these links either. Especially with the patch to
            // get all the links that 4.3 puts at the bottom of the page, we're
            // going to be iterating through links that are from a number of 
            // other modules that have action menus.
            if (href.substring(0,11)=="javascript:") return true;

            // nor do we touch links that go to other apps.
            if (href.indexOf("/app/" + Sideview.utils.getCurrentApp() + "/")==-1) return true;

            var newArgDict = {};
            if (href.indexOf("?")!=-1) {
                // make sure to preserve any existing args (uncommon but important).
                var existingArgDict = Sideview.utils.stringToDict(a.attr("href").substring(href.indexOf("?")+1));
                
                // well not all of them. We're about to write new definitive 
                // values for our "fieldsToPreserve" ones, so we throw the 
                // old values away. 
                for (var i=0,len=fieldsToPreserve.length;i<len;i++) {
                    delete existingArgDict[fieldsToPreserve[i]];
                }
                $.extend(argDict,existingArgDict);
                // clean all the old qs args off the string.
                href = href.substring(0,href.indexOf("?"));
            }
            href += "?"+Sideview.utils.dictToString(argDict);
            $(this).attr("href",href);
        });

    };


    Sideview.utils.declareCustomBehavior("addSelectionToAllLinksOnPage", function(customBehaviorModule) {
        customBehaviorModule.onContextChange = function() {
            var context = this.getContext();
            var args ={};
            for (var i=0,len=fieldsToPreserve.length;i<len;i++) {
                var f = fieldsToPreserve[i];
                // get the untemplated value if there is one.
                var value = context.get(f + ".rawValue") || context.get(f);
                if (value) {
                    args[f] = value;
                }
            }
            // an option you might also need is to preserve the current 
            // timerange as seen from the customBehavior module.
            //var range = context.get("search").getTimeRange();
            //if (range.getEarliestTimeTerms()) args["earliest"] = range.getEarliestTimeTerms();
            //if (range.getLatestTimeTerms())   args["latest"]   = range.getLatestTimeTerms();
            rewriteLinks(args);
        }.bind(customBehaviorModule);
    });

    // this rewrites the page links initially, so that they're set before even 
    // the first context push hits our CustomBehavior.  We have to wait until
    // allModulesInHierarchy is fired or else the AppBar's menus wont exist.
    $(document).bind("allModulesInHierarchy", function() {
        var qsDict = Sideview.utils.stringToDict(document.location.search.substring(1));
        rewriteLinks(qsDict);
    });

    Sideview.utils.declareCustomBehavior("bounceUpToFiltersExample", function(module) {
        module.onContextChange = function() {
            var context = this.getContext();
            var xField = context.get("click.name");
            var upwardContext = new Splunk.Context();

            var currentFilters = JSON.parse(context.get("filters.json") || "[]");
            
            if (xField=="_time") {
                var search = new Splunk.Search("*");
                search.setTimeRange(context.get("search").getTimeRange());
                upwardContext.set("search",search);
            } 

            var clickFilters = JSON.parse(context.get("row.filters") || "[]");
            
            // don't just concat them or you'll get duplicates.
            currentFilters = Sideview.utils.combineFilters(currentFilters,clickFilters);
            upwardContext.set("filters", JSON.stringify(currentFilters));

            this.passContextToParent(upwardContext);
        }
    });



    Sideview.utils.declareCustomBehavior("addToFilters", function(module) {
        module.onContextChange = function() {
            var context = this.getContext();
            var xField = context.get("row.name");
            var upwardContext = new Splunk.Context();
            var currentFilters = JSON.parse(context.get("filters.json") || "[]");
            if (xField=="_time") {
                var search = new Splunk.Search("*");
                search.setTimeRange(context.get("search").getTimeRange());
                upwardContext.set("search",search);
            } 
            var clickFilters = JSON.parse(context.get("row.filters") || "[]");
            // don't just concat them or you'll get duplicates.
            currentFilters = Sideview.utils.combineFilters(currentFilters,clickFilters);
            upwardContext.set("filters", JSON.stringify(currentFilters));
            this.passContextToParent(upwardContext);
        }
    });


    Sideview.utils.declareCustomBehavior("addLinkToFilters", function(module) {
        module.onContextChange = function() {
            var context = this.getContext();
            var field = this.getParam("arg.field");
            
            var upwardContext = new Splunk.Context();

            
            var currentFilters = JSON.parse(context.get("filters.json") || "[]");

            var clickFilters = [{
                    "field":field,
                    "operator": "=",
                    "value":context.get(field)
                }] || [];
            // don't just concat them or you'll get duplicates.
            currentFilters = Sideview.utils.combineFilters(currentFilters,clickFilters);

            console.error(Sideview.utils.getSearchTermsFromFilters(currentFilters));
            upwardContext.set("filters", JSON.stringify(currentFilters));
            this.passContextToParent(upwardContext);
        }
    });

    

    Sideview.utils.declareCustomBehavior("insertNewPanelWithinEaiData", function(module) {
        
        module.getFirstMatchingChild = function(xmlNode, tagNameArr) {
            var child = false;
            for (var i=0; i<xmlNode.childNodes.length;i++) {
                var tagName = xmlNode.childNodes[i].tagName;
                if (tagName && tagNameArr.indexOf(tagName)!=-1) {
                    return xmlNode.childNodes[i];
                }
            }
        }

        module.onContextChange = function() {
            var context = this.getContext();
            var eaiData = context.get("eaiData");
            var parser  = new DOMParser();

            var xmlDoc = parser.parseFromString(eaiData, "text/xml");
            var newRow = parser.parseFromString(context.get("newRow"), "text/xml").documentElement;

            // because DOM methods are pretty awful.  This allows us to 
            // proceed very carefully and insert our new row into the right place 
            // without many assumptions.
            var rootNode = this.getFirstMatchingChild(xmlDoc, ["dashboard","form"]);
            var firstRow = this.getFirstMatchingChild(rootNode, ["row"]);
            
            xmlDoc.documentElement.insertBefore(newRow,firstRow);
            var serializery = new XMLSerializer();
            this.newPanel = serializery.serializeToString(xmlDoc);
        }

        module.getModifiedContext = function() {
            var context = this.getContext();
            context.set("eaiData",this.newPanel);
            return context;
        }
    });

}