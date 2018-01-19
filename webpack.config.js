const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: {
        main: './src/main.js',
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: module => {
                return module.context && module.context.indexOf('node_modules') !== -1
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
        new FaviconsWebpackPlugin({
            logo: './src/assets/logo.png',
            prefix: 'icons.[hash]/',
            inject: true,
            online: false,
            persistentCache: false,
            icons: {
                android: false,
                appleIcon: true,
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
        new webpack.HashedModuleIdsPlugin({
            hashFunction: 'md5',
            hashDigest: 'hex',
            hashDigestLength: 32
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest'
        }),
        new ExtractTextPlugin(`[name].[contenthash].css`),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ],
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    extractCSS: true,
                    loaders: {
                        html: 'pug',
                        css: 'css!stylus-loader'
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
                    name: `[name].[hash].[ext]`
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
        hashDigestLength: 32,
        filename: `[name].${process.env.NODE_ENV === 'production' ? '[chunkhash]' : '[hash]'}.js`,
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
    }
}
