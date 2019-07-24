const path = require('path');
var packageMetadata = require('./package.json')
var libraryName = packageMetadata.name
var libraryVersion = packageMetadata.version
var outputFile = libraryName + '.js'

module.exports = {
    entry: {
        index: path.join(__dirname, './src/index.js')
    },
    output: {
        path: path.join(__dirname, './lib'),
        filename: outputFile,
        library: libraryName,
        libraryTarget: 'umd',
        globalObject: 'this',
    },
    module: {
        rules: [
            {
                test: /.js$/,
                loader: 'babel-loader',
                exclude: [
                    path.join(__dirname, './node_modules')
                ]
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            }
        ]
    },
    mode: "production"
}