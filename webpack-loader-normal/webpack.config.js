const {
    merge
} = require('webpack-merge')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const baseConfig = {
    entry: './src/index.js',
    mode: 'development',
}

module.exports = [
    // 常规模式 css未独立打包
    merge(baseConfig, {
        output: {
            path: path.join(__dirname, './base')
        },
        module: {
            // 加载loader
            rules: [{
                    // 正则匹配文件后缀名
                    test: /\.ts$/i,
                    use: ['ts-loader']
                },
                {
                    test: /\.js$/i,
                    use: ['babel-loader']
                },
                {
                    test: /\.s[ac]ss$/i,
                    // loader执行机制，从右到左的解析顺序，估需要先转为css->style
                    use: ['style-loader', 'css-loader', 'sass-loader']
                },
                {
                    test: /\.less$/i,
                    use: ['style-loader', 'css-loader', 'less-loader']
                },
                {
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader']
                }
            ]
        }
    }),
    // 采用MiniCssExtractPlugin
    merge(baseConfig, {
        output: {
            path: path.join(__dirname, './dist')
        },

        module: {
            // 加载loader
            rules: [{
                    // 正则匹配文件后缀名
                    test: /\.ts$/i,
                    use: ['ts-loader']
                },
                {
                    test: /\.js$/i,
                    use: ['babel-loader']
                },
                {
                    test: /\.s[ac]ss$/i,
                    // loader执行机制，从右到左的解析顺序，估需要先转为css->style
                    use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
                },
                {
                    test: /\.less$/i,
                    use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
                },
                {
                    test: /\.css$/i,
                    use: [MiniCssExtractPlugin.loader, 'css-loader']
                }
            ]
        },
        // 加载插件
        plugins: [
            new MiniCssExtractPlugin()
        ]
    })
]