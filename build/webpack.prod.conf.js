'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const env = require('../config/prod.env')

// 利用webpack-merge 合并我们的baseWebpackConfig配置。 webpack-merge能够让你动态改变webpack配置
const webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
    // 添加chunkhash值，指每次构建的值都不一样，业务代码经常变化，添加chunkhash避免浏览器缓存使用旧代码
    // chunkhash与hash区别在于：前者是每次构建都不一样，后者是只要你的文件名是一样的，是不会变化的，一般用chunkhash多一些
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    //DefinePlugin用于在webpack构建中，定义参数，然后你可以在webpack构建配置中引用这个参数做一些配置上的判断，赋值
    new webpack.DefinePlugin({
      'process.env': env
    }),
    // js压缩插件，用于代码压缩，然后去掉注释，生成soucemap便于调试定位问题
    // 构建生产环境生成sourcemap比较耗时，一般你也可以不用，在开发环境才生成sourcemap
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false,
          drop_debugger: true,  //移除debug
          drop_console: true,    //移除console
          pure_funcs: ['console.log']   //移除console
        }
      },
      sourceMap: config.build.productionSourceMap,
      parallel: true
    }),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css'),
      // Setting the following option to `false` will not extract CSS from codesplit chunks.
      // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
      // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`, 
      // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110

      //正如上面的英文注释一样，这个插件主要是将css内容独立抽出来，而不是变成一个js模块绑如bundle中
      //官网说：这样能够加快整体构建速度，同时有利于js和css分开
      allChunks: true,
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    // 用于压缩css的插件
    new OptimizeCSSPlugin({
      cssProcessorOptions: config.build.productionSourceMap
        ? { safe: true, map: { inline: false } }
        : { safe: true }
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    // 这个是老朋友了，将我们的bundle注入到index.html,同时对html进行压缩处理
    // 这里要注意一下：
    // 1.minify压缩配置
    // 2.chunkSortMode:这个参数一般选择dependency，因为你可以把所有模块打包成一个文件，但是这样效率最低，一般我们会抽出
    //公共模块，产生多个bundle，引入bundle的顺序就由这插件来引入；选择 dependency，意思就是谁先被依赖，谁先被引入
    //3.inject: 有三种方式 true/'head'/'body',其实就是指指定你要把这些bundle在什么地方引入，跟你引入js文件的script标签放在哪里是一个意思
    new HtmlWebpackPlugin({
      filename: config.build.index,
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
    // keep module.id stable when vendor modules does not change
    new webpack.HashedModuleIdsPlugin(),
    // enable scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin(),
    // split vendor js into its own file
    //这个是指定一个公共模块插件，这个插件用于定义哪些可以算是公共模块
    //构建过程中，这插件会根据我们minChunks的配置判断哪些是公共模块，抽取出来合一个name为ventor的bundle
    // 我们可以看出：只要是从node_modules中出来的判定为公共模块
    // 另外name为什么不是'vendor[chunkhash:7]',name不加hash值是充分利用浏览器的缓存，因为我们公共模块一般不会变化(除非技术栈升级),浏览器端有了缓存就不用重复请求
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks (module) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')   //规定从node_modules使用的模块都是公共模块
          ) === 0
        )
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    }),
    // This instance extracts shared chunks from code splitted chunks and bundles them
    // in a separate chunk, similar to the vendor chunk
    // see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
    new webpack.optimize.CommonsChunkPlugin({
      name: 'app',
      async: 'vendor-async',
      children: true,
      minChunks: 3
    }),

    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
