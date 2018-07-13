'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)


//npm run dev执行 webpack-dev-server --inline --progress --config build/webpack.dev.conf.js 解释:
/* inline 
dev-server有两种模式，一种是iframe模式，一种是inline模式。
iframe模式，访问时需要 http://host:port/webpack-dev-server/path,加多一个webpack-dev-server，而inline则不用，推荐用inline

progress ：将运行进度输出到控制台
config:  指定配置文件
*/



// 这里同样也是合并基本的配置，加入开发环境的配置
// 指定devServer
const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  //指定生成那种形式的souceMap，cheap-module-eval-source-map这个是适合开发环境
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',   // 客户端报错等级
    historyApiFallback: {    // 当使用 HTML5 History API 时，下面匹配的路径，出现404 响应都可能需要被替代为 index.html
      rewrites: [
        { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
      ],
    },
    hot: true,  //启用热部署
    contentBase: false, //告诉服务观察对应目录文件更改情况，文件更改后，会触发重新加载；这里为false // since we use CopyWebpackPlugin.
    compress: true,
    host: HOST || config.dev.host,  // 指定可以访问的主机地址，默认是localhost，允许外网范围则是0.0.0.0
    port: PORT || config.dev.port,  // 端口
    open: config.dev.autoOpenBrowser,    //// 是否自动打开浏览器  默认为 false
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,   // 当出现编译器错误或警告时，在浏览器中显示全屏叠加,其实就是我们经常看到的那个报错页面
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin  //启用 quiet 后，除了初始启动信息之外的任何内容都不会被打印到控制台
    watchOptions: {  // webpack 使用文件系统(file system)获取文件改动的通知,一些情况下不生效，所有采用轮询
      poll: config.dev.poll,
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),  //当host：true时，这个插件是用来实现HRM，而且这个插件会有dev-server或者webpack自动调用，以实现热更新
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
