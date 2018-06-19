const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const time = Math.floor((new Date()).getTime() / 1000)

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: `/`,
    filename: `${time}/[name].js`
  },
  optimization: {
    minimize: true,
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
    new CopyWebpackPlugin([
      './src/assets/robots.txt',
      './src/assets/favicon.ico'
    ]),
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
      filename: `${time}/[name].css`
    }),
    new VueLoaderPlugin(),
    new LicenseWebpackPlugin({
      pattern: /.*/,
      addBanner: true,
      perChunkOutput: false,
      includePackagesWithoutLicense: true,
      additionalPackages: ['bootstrap'],
      outputFilename: `${time}/licenses.txt`
    })
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
          { loader: 'css-loader', options: { minimize: true } },
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
          { loader: 'css-loader', options: { minimize: true } }
        ]
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: 'file-loader',
        options: {
          name: `${time}/[name].[ext]`
        }
      }
    ]
  }
}
