define(function(){
    /**
     * Compares two Splunk versions. ADAPTED from core legacy splunk.js
     * Returns -1 if (versionA <  versionB),
     *          0 if (versionA == versionB),
     *          1 if (versionA >  versionB).
     *
     * @param {String} versionA Splunk version string, for example "5.0".
     * @param {String} versionB Splunk version string, for example "6.1.2".
     */
    var versionCompare = function(versionA, versionB) {
        var components1 = versionA.split(".");
        var components2 = versionB.split(".");
        var numComponents = Math.max(components1.length, components2.length);

        for (var i = 0; i < numComponents; i++) {
            var c1 = (i < components1.length) ? parseInt(components1[i], 10) : 0;
            var c2 = (i < components2.length) ? parseInt(components2[i], 10) : 0;
            if (c1 < c2) {
                return -1;
            } else if (c1 > c2) {
                return 1;
            }
        }
        return 0;
    };

    /**
     *  Returns true if platform is Android
     *  @param {String} platform Mint event platform field, e.g. 'Android', 'iOS', etc.
     */
    var isAndroid = function(platform) {
        return ((platform || "").toUpperCase() === 'ANDROID');
    };

    return {
        versionCompare: versionCompare,
        isAndroid: isAndroid
    };
});