define([
    "jquery",
    "underscore",
    "backbone",
    "splunkjs/mvc/simplesplunkview",
    "views/Base"
], function ($,
            _,
            Backbone,
            SimpleSplunkView,
            BaseView) {

    var sideBarView = SimpleSplunkView.extend({
        className: "sidebar-homepage",
        output_mode: "json_rows",
        options: {
            data: "preview",
            managerid: undefined,
            title: undefined,
            html: undefined,
            view_type: undefined
        },

        initialize: function (options) {
            SimpleSplunkView.prototype.initialize.apply(this, arguments);

            options = options || {};

            this.options = _.extend({}, options, this.options);
        },

        formatDate: function timeSince(date) {

            var seconds = Math.floor((new Date() - new Date(date)) / 1000);

            var interval = Math.floor(seconds / 31536000);

            if (interval > 1) {
                return interval + " years";
            }
            interval = Math.floor(seconds / 2592000);
            if (interval > 1) {
                return interval + " months";
            }
            interval = Math.floor(seconds / 86400);
            if (interval > 1) {
                return interval + " days";
            }
            interval = Math.floor(seconds / 3600);
            if (interval > 1) {
                return interval + " hours";
            }
            interval = Math.floor(seconds / 60);
            if (interval > 1) {
                return interval + " minutes";
            }
            return Math.floor(seconds) + " seconds";
        },

        //checks if current version is the latest version
        latestVersion: function checkLatestVersion(curr_version, os, callback){
            var color, text;
            var latest_versions = {}, _this = this;
            $.ajax({
                url: "https://mint.splunk.com/releases?latest=1",
                type: "GET",
                timeout: 5000,
                success: function(data){
                    latest_versions = data;

                    if(os == 'android'){
                        if(curr_version[0][0] < latest_versions.Android.version){
                            color = 'red';
                            text = "Out of date, update to <a href=\"" + latest_versions.Android.download_url + "\" target=\"_blank\">"+ latest_versions.Android.version +"</a>";
                        } else {
                            color = 'green';
                            text = "Updated";
                        }
                    } 

                else {
                    if(curr_version[0][0] < latest_versions.iOS.version){
                        color = 'red';
                        text = "Out of date, update to <a href=\"" + latest_versions.iOS.download_url + "\" target=\"_blank\">"+ latest_versions.iOS.version +"</a>";
                    } else {
                        color = 'green';
                        text = "Updated";
                    }                
                }
                callback(color, text);             
            },
            error: function(xhr, textStatus, errorThrown){
                color = 'green';
                text = "Updated";
                callback(color, text);
            }
        });
            return curr_version;  
        },

        compileTemplate: BaseView.prototype.compileTemplate,

        formatResults: function (resultsModel) {
            if (!resultsModel) {
                return {
                    fields: [],
                    rows: [[]]
                };
            }

            var data = resultsModel.data();

            if (this.options.view_type == 'last_event') {
                data.rows = this.formatDate(data.rows);
                if (this.options.html) {
                    this.compiledTemplate = this.compileTemplate(this.options.html);
                }
            } else if (this.options.view_type == 'android') {
                    data.rows = this.latestVersion(data.rows, 'android', function callback(color, text){
                    this.options.html = '<h3>Android</h3><p class="' + color + '"><%- results %></p><span>' + text + '</span>';
                    this.compiledTemplate = this.compileTemplate(this.options.html);
                    this.renderView();
                }.bind(this));
            } else if (this.options.view_type == 'ios') {
                    data.rows = this.latestVersion(data.rows, 'ios', function callback(color, text){
                    this.options.html = '<h3>iOS</h3><p class="' + color + '"><%- results %></p><span>' + text + '</span>';
                    this.compiledTemplate = this.compileTemplate(this.options.html);
                    this.renderView();
                }.bind(this));
            } else {
                console.log('not valid option view_type');
                // do nothing
            }

            if (this.options.html) {
                this.compiledTemplate = this.compileTemplate(this.options.html);
            }
            return data.rows;
            
        },

        renderView: function () {
            this.$el.html(this.compiledTemplate({results: this._data}));

            return this.$el;
        },
        createView: function () {
            return this.renderView();
        },
        updateView: function () {
            return this.renderView();
        }
    });
    return sideBarView;
});