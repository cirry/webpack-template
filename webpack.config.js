const {resolve} = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
// optimize-css-assets-webpack-plugin
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

// 设置nodejs的环境变量
process.env.NODE_ENV = "development"
const isProduction = process.env.NODE_ENV === 'production';

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
    entry: ["./src/index.js", "./src/index.html"],
    output: {
        filename: "js/build.js",
        // __dirname, nodejs的变量，代表当前文件的目录绝对路径
        path: resolve(__dirname, 'build'),
    },
    module: {
        rules: [
            {
                test: /\.css$/, use: [
                    isProduction ? MiniCssExtractPlugin.loader:'style-loader',
                    'css-loader',
                    ...CommonCSSLoader,
                ]
            },
            {
                test: /\.less$/, use: [
                    isProduction ? MiniCssExtractPlugin.loader:'style-loader',
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
                        ]
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
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            // 压缩html代码
            minify: {
                collapseWhitespace: true,
                removeComments: true,
            }
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
        //压缩css代码
        // new OptimizeCssAssetsWebpackPlugin()
    ],
    optimization: {
        minimizer: [
            // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
            // `...`,
            new CssMinimizerPlugin(),
        ],
    },
    // 打包在内存中
    devServer: {
        contentBase: resolve(__dirname, 'build'),
        compress: true,
        port: 3000,
        open: true,
        hot: true
    },
    target: 'web'
}
