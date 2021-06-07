const {resolve} = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin')

const isProduction = process.env.NODE_ENV === 'production';
const CommonCSSLoader = [
    {
        loader: "postcss-loader",
        options: {
            postcssOptions: {
                ident: 'postcss',
                plugins: [
                    require('postcss-preset-env')
                ],
            }
        }
    },
]

module.exports = {
    mode: "development",
    entry: ["./src/index.js", "./src/index.html"],
    output: {
        filename: "js/[name].[contenthash:10].js",
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
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // 将 JS 字符串生成为 style 节点
                    isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                    // 将 CSS 转化成 CommonJS 模块
                    "css-loader",
                    ...CommonCSSLoader,
                    // 将 Sass 编译成 CSS
                    "sass-loader",
                ],
            },
            {
                test: /\.(jpg|png|gif|jpe?g)$/, loader: "url-loader", options: {
                    limit: 8 * 1024,
                    name: '[name].[hash:10].[ext]',
                    outputPath: 'image'
                }
            },
            {test: /\.html$/, loader: "html-loader", options: {esModule: false}},
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env',
                                {
                                    "targets": {
                                        "ie": 7,
                                        "edge": "17",
                                        "firefox": "60",
                                        "chrome": "67",
                                        "safari": "11.1",
                                    },
                                    useBuiltIns: "usage",
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
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/, loader: 'url-loader',
                options: {
                    limit: 1024 * 8,
                    name: "[name].[hash:10].[ext]",
                    outputPath: "fonts"
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/, loader: 'url-loader',
                options: {
                    limit: 1024 * 8 * 5,
                    name: "[name].[hash:10].[ext]",
                    outputPath: "media"
                }
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            minify: {
                collapseWhitespace: true,
                removeComments: true,
            }
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash:10].css',
        }),
        new OptimizeCssAssetsWebpackPlugin()
    ],
    optimization: {
        minimizer: [
            new CssMinimizerPlugin(),
            new TerserPlugin()
        ],
        splitChunks: {
            chunks: "all",
        },
        runtimeChunk: {
            name: (entrypoint) => `runtime~${entrypoint.name}`,
        },
    },
    devServer: {
        contentBase: resolve(__dirname, 'dist'),
        compress: true,
        host: 'localhost',
        port: 3000,
        open: true,
        hot: true,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                pathRewrite: {
                    '^/api': ''
                }
            }
        }
    },
    target: 'web',
    devtool: 'source-map',
    externals: {
        jquery: 'jQuery',
    }
}
