var config = require("./webpack.config.js");
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
config.entry.app.unshift('webpack-dev-server/client?http://'+  config.host + ':' + config.port + '/');
var compiler = webpack(config);
var server = new WebpackDevServer(compiler, {
  quiet      : true,
  noInfo     : true,
  hot        : true,
  inline     : true,
  lazy       : false,
  publicPath : config.output.publicPath,
  headers    : {'Access-Control-Allow-Origin': '*'},
  contentBase: './public',
  stats: {
    modules: false,
    cached: false,
    colors: true,
    chunk: false
  }
});
server.listen(config.port);