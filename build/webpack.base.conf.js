'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}



module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: {
    // app: './src/main.js'     //wabpack检测唯一入口文件
    app: ["babel-polyfill", "./src/main.js"]
  },
  output: {
    path: config.build.assetsRoot,    //打包后的文件存放的目录
    filename: '[name].js',     //打包后的文件名称
    publicPath: process.env.NODE_ENV === 'production'    // 开发环境/生产环境    build.js文件申明了 process.env.NODE_ENV = 'production'，执行build就为生产环境
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json', '.less'],   //配置省略扩展名 如：import * from 'test.js' 可以写成 import * from 'test'
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src')    //配置引入模块路径简写   '@/'表示匹配'src/'目录
    }
  },
  //wabpack的loader工具，对不同的模块文件定义不同的处理规则，都定义在module.rules中    webpack只认识javascript，不认识的文件都被当成模块，并且处理成wabpack能识别的文件
  module: {
    rules: [
      {
        test: /\.vue$/,    //正则匹配，匹配.vue后缀的文件名
        loader: 'vue-loader',  //.vue文件处理loader
        options: vueLoaderConfig   //处理规则
      },
      {
        test: /\.js$/,
        loader: 'babel-loader', //.js文件处理loader 可以用es6/es7  根据.babelrc配置文件对js做处理
        include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
      },
      {
        test: /\.less$/,  //.less文件处理loader 
        loader: 'style-loader!css-loader!less-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,   //匹配资源文件
        loader: 'url-loader',     //对资源文件做base64编码
        options: {
          limit: 100000,    //规定文件大小的值，<limit，则会生成类似于缓存(base64)，避免浏览器请求图片，直接取本地的   （不限于图片，包括字体、视频等）
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}
