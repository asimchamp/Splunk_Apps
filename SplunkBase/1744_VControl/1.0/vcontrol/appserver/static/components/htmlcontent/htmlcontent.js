//
//   Copyright 2014 by mathias herzog, <mathu at gmx dot ch>
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//
define(function(require, exports, module) {
    var _ = require('underscore');
    var mvc = require('splunkjs/mvc');
    var SimpleSplunkView = require('splunkjs/mvc/simplesplunkview');
    var HTMLContent = SimpleSplunkView.extend({
        className: "demoview",
        options: {
            managerid: null,   
            data: "preview",  

        },
        createView: function() {
            this.$el.html(''); 
            return true;
        },

        // Override this method to put the Splunk data into the view
        updateView: function(viz, data) {
            var valueField = this.settings.get('valueField');
            console.log("The data object: ", data);
            var myResults = data[0];  
            this.$el.html(myResults);

        }
    });
    return HTMLContent;
});
