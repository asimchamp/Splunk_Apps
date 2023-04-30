var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: 'visualization_source',
    mode: 'production',
    resolve: {
        modules: [path.resolve(__dirname, 'src'), 'node_modules']
    },
    output: {
        filename: 'visualization.js',
        path: path.resolve(__dirname, ''),
        libraryTarget: 'amd'
    },
    externals: [
        'api/SplunkVisualizationBase',
        'api/SplunkVisualizationUtils'
    ]
};