'use strict'
require('./check-versions')()

process.env.NODE_ENV = 'production'

const ora = require('ora')  // 一个用于在命令窗口提示类似程序处理中，loading中之类文字，以起到提醒标注作用
const rm = require('rimraf')  // rm 删除目录，清空目录的工具包
const path = require('path')
const chalk = require('chalk')  // 在命令窗口输出有颜色的文字工具包
const webpack = require('webpack')
const config = require('../config')
const webpackConfig = require('./webpack.prod.conf')   //生产环境webpack配置

const spinner = ora('building for production...')       // 命令窗口会出现一个loading转圈
spinner.start()

// rm 帮我们每次构建前，清理一下之前构建好的旧文件，清理完后执行回调函数
// 回调函数里执行webpack打包
rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  if (err) throw err
  webpack(webpackConfig, (err, stats) => {   //webpack打包后执行回调函数，向控制台输出自己构建结果信息
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    if (stats.hasErrors()) {
      console.log(chalk.red('  Build failed with errors.\n'))
      process.exit(1)
    }

    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ))
  })
})
