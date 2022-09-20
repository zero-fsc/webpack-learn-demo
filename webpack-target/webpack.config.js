const { merge } = require('webpack-merge')

const baseConfig = {
    mode: 'development',
    devtool: false,
    entry: './src/index.js'
}

// 从build出的文件可视，web模式下采用的是JSONP 循环加载，node模式则采用自身require直接加载。

module.exports = [
    // 打包成web模式下
    merge(baseConfig, { target: 'web', output: { filename: 'web-[name].js' } }),
    // 打包成node模式下
    merge(baseConfig, { target: 'node', output: { filename: 'node-[name].js' } })
]