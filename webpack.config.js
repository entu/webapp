const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: {
        main: './src/main.js',
    },
    plugins: [
        new CleanWebpackPlugin('./dist'),
        new CopyWebpackPlugin([{
            from: './src/assets/robots.txt'
        }, {
            from: './src/assets/favicon.ico'
        }]),
        new ExtractTextPlugin(`[contenthash:16]/[name].css`),
        new FaviconsWebpackPlugin({
            logo: './src/assets/logo.png',
            prefix: '[hash:16]/',
            inject: true,
            online: false,
            persistentCache: false,
            icons: {
                android: false,
                appleIcon: false,
                appleStartup: false,
                coast: false,
                favicons: true,
                firefox: false,
                opengraph: false,
                twitter: false,
                windows: false,
                yandex: false
            }
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            minify: {
                html5                          : true,
                collapseWhitespace             : true,
                minifyCSS                      : true,
                minifyJS                       : true,
                minifyURLs                     : true,
                removeAttributeQuotes          : false,
                removeComments                 : true,
                removeEmptyAttributes          : true,
                removeOptionalTags             : false,
                removeRedundantAttributes      : true,
                removeScriptTypeAttributes     : true,
                removeStyleLinkTypeAttributese : true,
                useShortDoctype                : true
            }
        }),
        new webpack.HashedModuleIdsPlugin({
            hashFunction: 'md5',
            hashDigest: 'hex'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: module => {
                return module.context && module.context.indexOf('node_modules') !== -1
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest'
        })
    ],
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    extractCSS: false,
                    cssSourceMap: true,
                    preserveWhitespace: false,
                    preLoaders: {
                        i18n: 'yaml-loader'
                    },
                    loaders: {
                        html: 'pug',
                        css: 'css!stylus-loader',
                        i18n: '@kazupon/vue-i18n-loader'
                    }
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ],
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: `[hash:16]/[name].[ext]`
                }
            }
        ]
    },
    devServer: {
        historyApiFallback: true,
        noInfo: true,
        overlay: true
    },
    output: {
        filename: `${process.env.NODE_ENV === 'production' ? '[chunkhash:16]' : '[hash:16]'}/[name].js`,
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
    }
}



if (process.env.NODE_ENV === 'production') {
    module.exports.devtool = '#source-map'
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false
            }
        })
    ])
}
