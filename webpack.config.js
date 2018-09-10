const path = require('path');

module.exports = {
    entry: {
        index: path.join(__dirname, './src/index.js')
    },
    output: {
        path: path.join(__dirname, './dist'),
        filename: '[name].js'
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