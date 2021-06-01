const {resolve} = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
// optimize-css-assets-webpack-plugin
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin')

// 设置nodejs的环境变量
// process.env.NODE_ENV = "development"
// process.env.NODE_ENV = "production"
const isProduction = process.env.NODE_ENV === 'production';

// css兼容性配置
const CommonCSSLoader = [
    {
        loader: "postcss-loader",
        options: {
            postcssOptions: {
                ident: 'postcss',
                //打包后有兼容性样式代码，只处理css文件，不处理less文件
                plugins: [
                    require('postcss-preset-env')
                ],
            }
        }
    },
]

module.exports = {
    mode: "development",
    // 下面这个是开启全部的js兼容性方式，开启的话需删除js中的按需加载
    // entry: ["@babel/polyfill", "./src/index.js"],
    // 第一个入口是js，第二个是html，这样再修改js和html都可以做到热更新
    entry: ["./src/index.js", "./src/index.html"],
    output: {
        filename: "js/[name].[contenthash:10].js",
        // __dirname, nodejs的变量，代表当前文件的目录绝对路径
        // path: resolve(__dirname, 'build'),
        publicPath: "/",
        chunkFilename: "js/[name].[contenthash:10]_chunk.js"
    },
    module: {
        rules: [
            {
                test: /\.css$/, use: [
                    isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                    'css-loader',
                    ...CommonCSSLoader,
                ]
            },
            {
                test: /\.less$/, use: [
                    isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                    'css-loader',
                    ...CommonCSSLoader,
                    'less-loader',
                ]
            },
            // 仅能处理css中的引入的图片
            {
                test: /\.(jpg|png|gif|jpe?g)$/, loader: "url-loader", options: {
                    // 小于8kb的图片会被处理为base64
                    limit: 8 * 1024,
                    name: '[name].[hash:10].[ext]',
                    outputPath: 'image'
                }
            },
            // 处理html文件中的img图片（负责引入img，从而能被url-loader进行处理）
            {
                test: /\.html$/, loader: "html-loader", options: {
                    // 问题： 因为url-loader默认使用es6模块化解析，而html-loader引入图片使用的是common.js[解析时会出问题]
                    esModule: false
                }
            },
            //npm install -D babel-loader @babel/core @babel/preset-env webpack
            // 只处理基本的js语法，全部js兼容性处理：@babel/polyfill
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env',
                                {
                                    // 指定兼容性做到哪个版本的浏览器,使用默认，配置方式跟browserList差不多
                                    "targets": {
                                        "ie": 7,
                                        "edge": "17",
                                        "firefox": "60",
                                        "chrome": "67",
                                        "safari": "11.1",
                                    },
                                    // 按需加载
                                    useBuiltIns: "usage",
                                    // 指定corejs版本
                                    corejs: {
                                        version: 3
                                    }
                                }
                            ]
                        ],
                        cacheDirectory: true
                    }
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 1024 * 8,
                    name: "[name].[hash:10].[ext]",
                    outputPath: "fonts"
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 1024 * 8 * 5,
                    name: "[name].[hash:10].[ext]",
                    outputPath: "media"
                }
            },
        ],
    },
    plugins: [
        // 在内存中创建index.html文件，并自动引入js和css文件，html模板为template路径的页面
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            // 压缩html代码
            minify: {
                collapseWhitespace: true,
                removeComments: true,
            }
        }),
        // 提取css代码为单独的文件，默认会被压缩在js文件中
        new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash:10].css',
        }),
        //压缩css代码
        new OptimizeCssAssetsWebpackPlugin()
    ],
    optimization: {
        // 配置生产环境的压缩方案，压缩js和css
        minimizer: [
            // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
            // `...`,
            new CssMinimizerPlugin(),
            new TerserPlugin()
        ],
        // 可以将node_modules中的代码单独打包成一个chunk输出
        splitChunks: {
            chunks: "all",
            //下面所有的属性都是默认值，不用写
            // minSize: 30 * 1024, // 小于30kb不分割
            // maxSize: 0, // 最大没有限制
            // minChunks: 1, // 要提取的chunks最少被引用1次
            // maxAsyncRequests: 5, // 按需加载时，并行加载文件的最大数量
            // maxInitialRequests: 3, //入口js文件，最大并行请求数量
            // automaticNameDelimiter: "~", // 名称连接符
            // name: true, // 可以使用命名规则
            // cacheGroups: { // 分割chunk的组
            //     // node_modules文件中的文件会被打包到vendors组的chunk中 --> vendors~xxx.ks，连接符号是波浪线是因为前面的automaticNameDelimiter属性
            //     // 满足上面的公共规则，如大小超过30kb，至少被引用一次
            //     vendors: {
            //         test: /[\\/]node_modeuls[\\/]/,
            //         // 优先级
            //         priority: -10
            //     },
            //     default:{
            //         // 要提取的chunk最少被引用两次
            //         minChunks: 2,
            //         priority: -20,
            //         // 如果当前要打包的模块，和之前已经被提取的模块是同一个，就会被复用，而不是重新打包模块
            //         reuseExistingChunk: true
            //     }
            // }
        },
        // 将当前模块的记录其他模块的hash单独打包为一个文件，叫runtime文件
        // 解决：修改a文件导致b文件的contenthash变化
        runtimeChunk: {
            name: (entrypoint) => `runtime~${entrypoint.name}`,
        },
    },
    // 打包在内存中, 自动编译,自动打开浏览器,自动刷新
    devServer: {
        contentBase: resolve(__dirname, 'dist'), // 运行的目录,不是源代码,而是构建后的目录
        compress: true,
        host: 'localhost',
        port: 3000,
        open: true,
        hot: true,
        // 没有跨域问题，忽略proxy配置
        proxy: {
            // 一旦devServer（3000）服务器接收到/api/xxx的请求，就会把请求转发到另外一个服务器（5000）上
            '/api': {
                target: 'http://localhost:5000',
                // 发送请求时，请求路径重写： 将/api/xxx -->/xxx
                pathRewrite: {
                    '^/api': ''
                }
            }
        }
    },
    // 热更新需要属性
    target: 'web',
    // 开发生产坏境报错需要
    devtool: 'source-map',
    // 排除jquery不打包
    externals: {
        // 拒绝jquery被打包
        jquery: 'jQuery',
    }
}
