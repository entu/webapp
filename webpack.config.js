const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
    entry: {
        main: './src/main.js',
    },
    devtool: '#source-map',
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'all',
                },
            },
        },
        runtimeChunk: {
            name: 'manifest',
        }
    },
    plugins: [
        new CleanWebpackPlugin('./dist'),
        new CopyWebpackPlugin([
            './src/assets/robots.txt',
            './src/assets/favicon.ico'
        ]),
        new ExtractTextPlugin(`[chunkhash:16]/[name].css`),
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
        new VueLoaderPlugin(),
        new webpack.HashedModuleIdsPlugin({
            hashFunction: 'md5',
            hashDigest: 'hex'
        })
    ],
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                // test: /\.vue$/,
                // loader: 'vue-loader',
                options: {
                    extractCSS: true,
                    cssSourceMap: true,
                //     preserveWhitespace: false,
                //     preLoaders: {
                //         i18n: 'yaml-loader'
                //     },
                //     loaders: {
                //         html: 'pug',
                //         css: 'css!stylus-loader',
                //         i18n: '@kazupon/vue-i18n-loader'
                //     }
                }
            },
            {
                test: /\.pug$/,
                loader: 'pug-plain-loader'
            },
            {
                resourceQuery: /blockType=i18n/,
                use: [
                    '@kazupon/vue-i18n-loader',
                    'yaml-loader'
                ]
            },
            {
              test: /\.styl(us)?$/,
              use: [
                'vue-style-loader',
                'css-loader',
                'stylus-loader'
              ]
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'vue-style-loader',
                    use: 'css-loader'
                })
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
        publicPath: '/'
    }
}
