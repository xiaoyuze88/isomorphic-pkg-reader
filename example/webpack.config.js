'use strict';

// Modules
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
var host = 'localhost';
var port = 3000;

module.exports = {
  host: host,
  port: port,
  entry    : {
    app: [
      './example/client/index.js'
    ]
  },
  output   : {
    path: __dirname + '/public',
    publicPath: 'http://' + host + ':' + port + '/',
    filename: 'static/js/[name].bundle.js',
    chunkFilename: 'static/js/[name].bundle.js'
  },
  devtool  : 'inline-source-map',
  module   : {
    preLoaders: [],
    loaders   : []
  },
  plugins  : [
    new HtmlWebpackPlugin({
      template: './example/client/index.html',
      inject  : 'body',
      chunks  : ['app']
    }),
    new webpack.optimize.DedupePlugin()
  ],
  devServer: {
    contentBase: './public',
    stats: {
      modules: false,
      cached : false,
      colors : true,
      chunk  : false
    },
    proxy: {
      '/api/*': {
        target: 'http://' + host + ':' + (port + 1),
        secure: false,
        bypass: function (req, res, proxyOptions) {
        }
      }
    }
  }
};