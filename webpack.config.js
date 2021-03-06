'use strict'

const path = require('path')
const childProcess = require('child_process')

const CopyWebpackPlugin = require('copy-webpack-plugin')
// const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const VERSION = childProcess.execSync('git rev-parse HEAD').toString().substring(0, 7)

module.exports = {
  entry: ['@babel/polyfill', './src/main.js'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: `${VERSION}/scripts/[name].js`
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false,
        terserOptions: {
          sourceMap: true,
          format: {
            comments: false,
          }
        }
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorPluginOptions: {
          preset: ['default', { discardComments: { removeAll: true } }]
        }
      })
    ],
    splitChunks: {
      cacheGroups: {
        default: false,
        commons: {
          test: /node_modules/,
          name: 'vendor',
          chunks: 'all'
        }
      }
    },
    runtimeChunk: {
      name: 'manifest'
    }
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    historyApiFallback: true,
    noInfo: false,
    overlay: true
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/assets/robots.txt', to: path.join(__dirname, 'dist') },
        { from: './src/assets/favicons/favicon.ico', to: path.join(__dirname, 'dist') }
      ]
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: {
        html5: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
        removeAttributeQuotes: false,
        removeComments: true,
        removeEmptyAttributes: true,
        removeOptionalTags: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributese: true,
        useShortDoctype: true
      }
    }),
    new MiniCssExtractPlugin({
      filename: `${VERSION}/styles/[name].css`
    }),
    new VueLoaderPlugin(),
    // new FaviconsWebpackPlugin({
    //   logo: './src/assets/favicons/favicon.png',
    //   outputPath: `${VERSION}/favicons`,
    //   prefix: `${VERSION}/favicons`,
    //   favicons: {
    //     icons: {
    //       android: false,
    //       appleIcon: true,
    //       appleStartup: false,
    //       coast: false,
    //       favicons: true,
    //       firefox: false,
    //       windows: false,
    //       yandex: false
    //     }
    //   }
    // })
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.pug$/,
        loader: 'pug-plain-loader'
      },
      {
        test: /\.styl(us)?$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader' },
          'stylus-loader'
        ]
      },
      {
        resourceQuery: /blockType=i18n/,
        use: [
          '@kazupon/vue-i18n-loader',
          'yaml-loader'
        ]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader' }
        ]
      },
      {
        test: /\.(png|jpg)$/,
        loader: 'file-loader',
        options: {
          name: `${VERSION}/images/[name].[ext]`
        }
      },
      {
        test: /\.(svg|ttf|woff)$/,
        loader: 'file-loader',
        options: {
          name: `${VERSION}/fonts/[name].[ext]`
        }
      }
    ]
  }
}
