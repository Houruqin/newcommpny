const
  path = require('path'),
  fs = require('fs'),
  argv = require('yargs').argv,
  webpack = require('webpack'),
  CleanWebpackPlugin = require('clean-webpack-plugin'),
  ExtractTextPlugin = require('extract-text-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin');

const config = {
  distDir: 'dist',
  staticDir: 'static',
  publicPath: argv.env === 'local' ? '/' : '/pc',
  port: 8888,
  host: '0.0.0.0'
};

module.exports = {
  devtool: '#source-map',
  entry: {
    [`${config.staticDir}/index`]: ['babel-polyfill', './index.js']
  },
  output: {
    path: path.join(__dirname, config.distDir),
    filename: `[name].js`,
    publicPath: config.publicPath,
    chunkFilename: `${config.staticDir}/[name].[chunkhash:5].js`,
    devtoolModuleFilenameTemplate: '[resource-path]'
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.vue$/, loader: 'vue-loader' },
      { test: /\.pug$/, loader: `pug-loader?pretty` },
      { test: /\.html$/, loader: 'html-loader' },
      { test: /\.(?:yml|yaml)$/, loader: 'json-loader!yaml-loader' },
      { test: /\.(?:png|jpg|jpeg|gif|ico|svg|eot|ttf|woff|otf)$/, loader: `url-loader?limit=10240&name=${config.staticDir}/[name].[hash:5].[ext]` },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.less$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader!postcss-loader!less-loader' }) }
    ]
  },
  resolve: {
    extensions: ['.js', '.vue', '.json', '.less'],
    alias: {
      '@': path.join(__dirname),
      config$: path.join(__dirname, `config/${argv.env}`)
    }
  },
  plugins: [
    new CleanWebpackPlugin([config.distDir]),
    new ExtractTextPlugin('[name].css'),
    new webpack.optimize.CommonsChunkPlugin(`${config.staticDir}/common`),
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, './static'),
      to: config.staticDir,
      ignore: ['.*']
    }]),
    new HtmlWebpackPlugin({
      template: `./index.html`,
      filename: `index.html`,
      hash: true
    })
  ],
  devServer: {
    port: config.port || 80,
    host: config.host || '0.0.0.0',
    historyApiFallback: { rewrites: [ { from: /.*/, to: path.posix.join(config.publicPath, `index.html`) } ] }
  }
}
