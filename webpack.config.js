const path = require("path")
const webpack = require("webpack")
const HappyPack = require("happypack")

module.exports = {
  devtool: "source-map",
  entry: "./metge.js",
  output: {
    filename: "bundle.js",
    path: __dirname,
    sourceMapFilename: "bundle.map.js",
    
  },
  
  module: {
    loaders: [
    {
      test: /\.js/,
      exclude: /(node_modules|bower_components)/,
      loader: 'happypack/loader',
    }
  ],
  },
  plugins: [
    new webpack.DefinePlugin({
      BROWSER: true,
      NODE: false
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new HappyPack({
      loaders: ["babel"]
    })
    ]
}