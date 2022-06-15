/*
 Copyright 2015 Scianta Analytics LLC   All Rights Reserved.  
 Reproduction or unauthorized use is prohibited. Unauthorized
 use is illegal. Violators will be prosecuted. This software 
 contains proprietary trade and business secrets.            

  Module: urltUtil

*/
var URLUtil = {

    request: [],

    loadURLParams: function () {
        var self = this;
        var url=window.location.href
        console.log("url=" + url);
        var pairs = url.substring(url.indexOf('?') + 1).split('&');
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split('=');
            self.request[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
            console.log("request["+decodeURIComponent(pair[0])+"]=" +decodeURIComponent(pair[1]));
        }
    },

    getURLParam: function (param) {
        var self = this;
        var result = self.request[param];
        console.log("getURLParam(" + param + ") returning " + result);
 
        return result;
    }
};
