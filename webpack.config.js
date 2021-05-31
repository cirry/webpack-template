const {resolve} = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
// optimize-css-assets-webpack-plugin
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

// 设置nodejs的环境变量
// process.env.NODE_ENV = "development"
process.env.NODE_ENV = "production"
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
        path: resolve(__dirname, 'build'),
        publicPath: "/"
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
                test: /\.(jpg|png|gif)$/, loader: "url-loader", options: {
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
                                    targets: "defaults",
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
                exclude: /\.(css|less|js|html|jpg|png|gif|json)$/, loader: "file-loader", options: {
                    name: '[name].[hash:10].[ext]',
                    outputPath: 'media'
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
        minimizer: [
            // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
            // `...`,
            new CssMinimizerPlugin(),
        ],
        // 可以将node_modules中的代码单独打包成一个chunk输出
        splitChunks: {
            chunks: "all"
        }
    },
    // 打包在内存中
    devServer: {
        contentBase: resolve(__dirname, 'build'),
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
    target: 'web',
    devtool: 'source-map',
    externals: {
        // 拒绝jquery被打包
        jquery: 'jQuery',
    }
}
