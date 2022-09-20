const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const {
    merge
} = require('webpack-merge')
const baseConfig = {
    mode: 'development',
    plugins: [
        new HtmlWebpackPlugin()
    ]
}

module.exports = [
    // dependOn
    merge(baseConfig, {
        entry: {
            public: './src/utils/utils.js',
            test: {
                import: './src/javascripts/test.js',
                dependOn: 'public'
            },
            main: {
                import: './src/javascripts/main.js',
                dependOn: 'test'
            },
            index: {
                import: './src/index.js',
                dependOn: 'main'
            }
        },
        output: {
            path: path.join(__dirname, './dependOn')
        }
    }),

    // runtime
    merge(baseConfig, {
        devtool: false,
        entry: {
            test: {
                import: './src/javascripts/test.js',
                runtime: 'common-runtime'
            },
            main: {
                import: './src/javascripts/main.js',
                runtime: 'common-runtime'
            },
            index: {
                import: './src/index.js',
                runtime: 'common-runtime'
            }
        },
        output: {
            path: path.join(__dirname, './runtime')
        }
    })
]