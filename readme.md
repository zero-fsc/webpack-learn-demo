### webpack工作原理

- 输入：从文件系统读入代码文件。
- 模块递归处理：调用**Loader**转义Module内容，并将结果转换为AST，从中分析出模块依赖关系，进一步递归调用模块处理过程，直到所有依赖文件都处理完毕。
- 后处理：所有模块递归处理完毕后开始执行后处理。包括【模块合并、注入运行时、产物优化等】，最终稿输出Chunk集合。
- 输出：将Chunk写出到外部文件系统。

### 打包流程

- 根据输入配置【entry/context】找到项目入口文件
- 根据按模块处理【module/resolve/externals等】做配置的规则主意处理模块文件，处理过程包括转译、依赖分析等。
- 模块处理完毕后，最后再根据后处理相关配置项【optimization/target等】合并模块资源、注入运行时依赖、优化产物结构等。

![image-20220829143840369](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20220829143840369.png)

### Loader

#### JavaScript&TypeScript

```javascript
{
    test: /\.js$/, // 用于声明该规则的过滤条件，只有路径名命中该正则的文件才会应用这条规则。
    use: ['babel-loader'] // 用于声明这条规则的Loader处理器序列，所有命中该规则的文件都会被传入Loader序列做转义处理。
}

// TypeScript ts-loader
{
    test: /\.ts$/,
    use: ['ts-loader']
},
resolve: {
    extensions: ['.ts', '.js'] // 使用resolve.extensions声明自动解析.ts后缀文件，这意味着代码如【import "./a.ts"】可以忽略后缀声明
}
```

#### CSS&SCSS&LESS&STYLUS

> 在Webpack中处理CSS，通常需要使用 **css-loader+style-loader 或 css-loader + min-css-extract-plugin**组合

![image-20220829165340522](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20220829165340522.png)

```json
// 将CSS文件独立打包成一个新的独立的css文件
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'] // 满足从右到左策略
                // 约等于：style-loader(css-loader(css))
            },
            {
                test: /\.less$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'] // MiniCssExtractPlugin不能与style-loader同时使用，
            }
        ]
    }，
    plugins: [
    	// 提供 Loader、Plugin 组件，需要同时使用
    	new MiniCssExtractPlugin(),
		// mini-css-extract-plugin需要与html-webpack-plugin同时使用。
		// 将最终参数通过 link 标签方式插入到HTML中。
		new HtmlWebpackPlugin()
    ]
}
```

#### PostCSS

> 实现了一套将CSS源码解析为AST结构，并传入PostCSS插件做处理的流程框架。

```js
// postcss配置
module.exports = {
    plugins: [
        require('autoprefixer')
    ]
}

// webpack.config.js
module.exports = {
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [
                    'style-loader',
                    'postcss-loader'
                ]
            }
        ]
    }
}
```

> **style-loader**与 **mini-css-extract-plugin**实现的效果有什么区别
>
> style-loader主要用于开发环境，将CSS抽离并注入到HTML的style标签中，从而导致内嵌的CSS无法并行加载，会造成性能上的缺陷，从而降低页面的性能。
>
> mini-css-extract-plugin主要用于生产环境，用于将CSS抽取成单个文件，然后通过 **link**标签的形式引入页面，由于 **link**是并行加载资源，故不会造成性能缺陷。并且 mini-css-extract-plugin需要与 **html-webpack-plugin**插件同时使用才能生效。	

### Vue-loader

> Vue SFC 是使用类HTML语法描述Vue组件的自定义文件格式
>
> **<template>**指定Vue组件模板内容，支持类HTML、Pug等语法，其他内容会被预编译为JavaScript渲染函数。
>
> **<script>**用于定义组件选项对象，在Vue2中支持导出普通对象或 **defineComponent**值，Vue3之后支持 **<script setup>**方式定义组件的setup()函数。
>
> **<style>**用于定义组件样式，通过配置适当的Loader可实现对Less、Sass、Stylus等预处理器语法支持，也可以通过添加scope、module属性将样式封装在当前组件中。
>
> 

### webpack-dev-server

> - 结合webpack工作流，提供基于HTTP(S)协议的静态资源服务。
> - 提供资源热更新能力，在保持页面状态的前提下自动更新页面代码，提升开发效率。

```js
module.exports = {
    devServer: {
        hot: true, // 声明是否使用热更新能力，接受boolean
        open: true // 声明是否自动打开页面，接受boolean
    }
}
```

### SSR

![image-20220831110005802](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20220831110005802.png)

> 通过Node层调用
>
> - 调用entry-server.js 导出的工厂函数用于渲染出Vue组件结构。
> - 调用 **@vue/server-renderer**中的 **renderToString** 将组件渲染为HTML字符串。
> - 拼接HTML内容，将组件HTML字符串与entry-server.js产物路径注入到HTML中，并返回给客户端。

> SSR问题
>
> - 更高的架构复杂度，这意味着更高的维护、扩展、学习成本。
> - Node与浏览器环境完全不匹配，部分浏览器特定的代码，只能在某些生命周期钩子函数中使用，一些外部拓展库可能需要特殊处理。才能在SSR中运行。
> - 组件要求更高，需要兼容Node.js Server运行环境。
> - 服务端负载更高，毕竟相较于纯粹提供静态资源的SPA形式，SSR需要在Node进程中执行大量CPU运算以渲染HTML片段。

#### 构建NPM库

> 构建NPM库，原则
>
> - 正确导出模块内容
>
> - 不要将第三方包打包进产物中，以免与业务环境发生冲突。
> - 将CSS抽离为独立文件，以便用户自行决定实际用法。
> - 始终生成SoureMap文件，方便用户调试。

```js
module.exports = {
    output: {
        fileName: '[name].js',
        path: path.join(__dirname, './dist'),
        library: {
            name: '_', // 用于定义模块名称，在浏览器环境下使用script加载该库时，可直接使用这个名字调用模块。
            type: 'umd' // 用于编译产物的模块化方案，可选值【commonjs、umd、module、jsonP】等，其中【umd】模式兼容性更强。
        }
    }
}
```

> - 使用output.library配置项，正确导出模块内容。
>
> - 使用externals配置项，忽略第三方库。
> - 使用mini-css-extract-plugin单独打包CSS样式代码。
> - 使用devtool配置项生成Sourcemap文件，这里推荐 **devtool="source-map"**

#### 图像加载原理

##### file-loader

> 将图像引用转换为url语句并生成相应图片文件，经过 **file-loader**处理后，原始图片会被重命名并复制到产物文件夹，同时在代码中插入图片URL

```js
module.exports = {
    module: {
        rules: [
            {
                test: /\.(png|jpeg|jpg)$/,
                use: ['file-loader']
            }
        ]
    }
}
```

##### raw-loader

> 不做任何转译，只是简单将文件内容复制到产物中，适用于SVG场景

```js
module.exports = {
    module: {
        rules: [
            {
                test: /\.svg$/i,
                use: ['raw-loader']
            }
        ]
    }
}
```

#### 图像优化：压缩

常见优化方案：

- 图像压缩：减少网络上需要传输的流量；**image-webpack-loader**

```js
module.exports = {
    module: {
        rules: [
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                // type属性适用于webpack5，旧版本可使用file-loader
                type: "assets/resource",
                use: [
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            // jpeg压缩配置
                            mozjpeg: {
                                quality: 80
                            }
                        }
                    }
                ]
            }
        ]
    }
}
```



- 雪碧图：减少HTTP请求次数；**webpack-spritesmith**

```js
import SpritesmithPlugin = require('webpack-spritesmith')
module.exports = {
    resolve: {
        modules: ["node_modules", "assets"]
    },
    plugins: [
        new SpritesmithPlugin({
            src: {
                cwd: path.resolve(__dirname, "src/icons"),
                glob: "*.png"
            },
            target: {
                image: path.resolve(__dirname, 'src/assets/sprite.png'),
                css: path.resolve(__dirname, 'src/assets/sprite.less')
            }
        })
    ]
}
```



- 响应式图片：根据客户端设备情况下发适当分辨率的图片，有助于减少网络流量；**responsive-loader sharp**

  ```js
  module.exports = {
    module: {
      rules: [{
        test: /\.(png|jpg)$/,
        oneOf: [{
          type: "javascript/auto",
          resourceQuery: /sizes?/,
          use: [{
            loader: "responsive-loader",
            options: {
              adapter: require("responsive-loader/sharp"),
            },
          }],
        }, {
          type: "asset/resource",
        }],
      }],
    }
  };
  
  // 引用图片，并设置响应式参数
  import responsiveImage from './webpack.jpg?sizes[]=300,sizes[]=600,sizes[]=1024'
  
  const Picture = function () {
      return (
      	<img
          	srcSet={responsiveImage.srcSet}
  			src={responsiveImage.src}
  			sizes="(min-width: 1024px) 1024px, 100vw"
  			loading="lazy"
          />
      )
  }
  ```

  

- CDN：减少客户端到服务器之间的物理链路长度，提升传输效率。

### 配置结构详解

#### 配置结构

##### 结构属性介绍

> - entry：声明项目入口文件，Webpack会从这个文件开始递归找出所有文件依赖；
> - output：声明构建结果的存放位置；
> - target：用于配置编译产物的目标运行环境，支持 **web、node、electron**等值，不同值最终产物会有所差异。
> - mode：编译模式短语，支持 **development、production**等值，Webpack会根据该属性推断默认配置。
> - optimization：用于控制如何优化产物包体积，内置Dead Code Elimination、Scope Hoisting、代码混淆、代码压缩等功能。
> - module：用于声明模块加载规则，例如针对什么类型的资源需要使用哪些Loader进行处理。
> - plugin：Webpack插件列表

##### entry

```js
module.exports = {
    entry: {
        // 字符串形态--- 打包后的入口（key: 支持自定义）
        home: './home.js',
        // 数组形态
        shared: ['react', 'react-dom', 'redux', 'react-redux'],
        // 对象形态
        "自定义值": {
            import: './personal.js', // 声明入口文件，支持路径字符串或路径数组(多入口)；
            filename: 'pages/personal.js', // 用于声明该模块构建产物路径；
            dependOn: 'shared', // 声明该入口的前置依赖模块（依赖模块可作为公共模块使用）；效果上来说可以减少重复代码，优化构建产物质量。
            chunkLoading: 'jsonp', // 用于声明异步模块加载的技术方案，支持 false/jsonp/require/import 等值；
            asyncChunks: true // 用于声明是否支持异步模块加载，默认值为 true。
        },
        // 函数形态
        admin: function () {
            return './admin.js'
        }
    }
}
```

> entry.dependOn属性：
>
> 通过配置，将公共属性提取独立打包，其他需要使用公共属性的模块采用 **模块名: { import: "公共模块路径", dependOn: "公共模块打包的内容（main）" }** 
>
> ```js
> module.exports = {
>     entry: {
>         // 此时当公共组件为./src/home.js，且打包出来的文件为main.js
>         main: './src/home.js',
>         // 子模块，需要使用公共组件
>         foo: {
>             import: './src/foo.js',
>             // 依赖模块项
>             dependOn: 'main'
>         }
>     }
> }
> ```

> entry.runtime属性：
>
> 与entry.dependOn属性作用一样，区别是针对code runtime时，解决代码过多问题，常作为性能优化解决方案之一。
>
> ```js
> module.exports = {
>     // 主要针对code runtime
>     mode: 'development',
>     devtool: false,
>     entry: {
>     	main: { import: './src/index.js', runtime: 'common-runtime' },
>     	foo: { import: './src/foo.js', runtime: 'common-runtime' }
>     }
> }
> ```
>
> 

> - 单个配置对象
>
>   ```js
>   module.exports = {
>     entry: './src/index.js',
>     // 其它配置...
>   };
>   ```
>
> - 配置对象数组：每个数组项都是一个完整的配置对象，每个对象都会触发一次 **单独的构建**，通常用于需要为同一份代码构建多种产物的场景。
>
>   > 使用数组方式时，Webpack汇总启动后创建多个 **Compilation**实例，并行执行构建工作。**Compilaton**实例间基本不做通讯，这意味着这种并行构建对运行性能并没有任何正向收益。
>
>   ```js
>   module.exports = [
>       // 每一个对象都是一个独立的webpack配置
>       {
>           entry: './src/index.js'
>       },
>       {
>           entry: './src/index1.js'
>       }
>   ]
>   ```
>
>   > 数组方式主要用于应对 **同一份代码打包处理的多种产物**，例如：在构建Library时，通常需要同时构建出ESM/CMD/UMD等模块方案的产物。
>   >
>   > ```js
>   > module.exports = [
>   >     {
>   >         output: {
>   >             filename: './dist-amd.js',
>   >             libraryTarget: 'amd'
>   >         },
>   >         name: 'amd',
>   >         entry: './app.js',
>   >         mode: 'production'
>   >     },
>   >     {
>   >         output: {
>   >             filename: './dist-common.js',
>   >             libraryTarget: 'commonjs'
>   >         },
>   >         name: 'commonjs',
>   >         entry: './app.js',
>   >         mode: 'production'
>   >     }
>   > ]
>   > ```
>   >
>   > > 提示：在使用配置数组时，还可以通过 **--config-name="参数"**参数指定需要构建的配置对象，例如执行：**npx webpack --config-name="amd"**，则仅使用数组中的 **name="amd"**的项做构建。
>   >
>   > 使用数组时，可以借助 **webpack-merge**工具简化配置逻辑
>   >
>   > ```js
>   > const { merge } = require('webpack-merge')
>   > const baseConfig = {
>   >     output: {
>   >         path: './dist'
>   >     },
>   >     name: 'amd',
>   >     entry: './app.js',
>   >     mode: 'production'
>   > }
>   > 
>   > module.exports = [
>   >     merge(baseConfig, {
>   >         output: {
>   >             filename: "[name]-amd.js",
>   >             libraryTarget: "amd"
>   >         }
>   >     }),
>   >     merge(baseConfig, {
>   >         output: {
>   >             filename: './[name]-commonjs.js',
>   >             libraryTarget: 'commonjs'
>   >         }
>   >     })
>   > ]
>   > ```
>
> - 配置函数
>
>   > 配置函数方式要求在配置文件中导出一个函数，并在函数中返回Webpack配置对象，或者配置数组
>   >
>   > ```js
>   > /**
>   >  * @params env 通过 --env传递的命令行参数，适用于自定义参数
>   >  * @params argv 命令行Flags参数，支持entry/output-path/mode/merge等
>   >  */
>   > module.exports = function (env, argv) {
>   >     return {
>   >         entry: './src/index.js'
>   >     }
>   > }
>   > ```
>   >
>   > ![image-20220919151532176](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20220919151532176.png)
>   >
>   > > **配置函数**允许用户根据命令行参数动态创建配置对象，可用于实现简单的多环节治理策略。
>   > >
>   > > ```js
>   > > // npx webpack --env app.type=miniapp --mode=production
>   > > module.exports = function (env, argv) {
>   > >     return {
>   > >         mode: argv.mode ? "production" : "development",
>   > >         devtool: argv.mode ? "source-map" : "eval",
>   > >         output: {
>   > >             path: path.join(__dirname, `./dist/${env.app.type}`),
>   > >             filename: '[name].js'
>   > >         },
>   > >         plugins: [
>   > >             new TerserPlugin({
>   > >                 terserOptions: {
>   > >                     compress: argv.mode === 'production'
>   > >                 }
>   > >             })
>   > >         ]
>   > >     }
>   > > }
>   > > ```

##### target

> 多数时候Webpack都被用于打包Web应用，但实际上Webpack还支持构建Node、Electron等应用形态，主要通过target配置控制。
>
> ![](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20220919182308013.png)

```js
const path = require('path')
const { merge } = require('webpack-merge')

const baseConfig = {
    mode: 'development',
    target: "web",
    devtool: false,
    entry: {
        main: {
            import: './src/index.js'
        }
    },
    output: {
        clean: true,
        path: path.resolve(__dirname, "dist")
    }
}

module.exports = [
    merge(baseConfig, { target: 'web', output: { filename: 'web-[name].js' } }),
    merge(baseConfig, { target: 'node', output: { filename: 'node-[name].js' } })
]

// 从build出的文件可视，web模式下采用的是JSONP 循环加载，node模式则采用自身require直接加载。
```

