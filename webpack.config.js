const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanCSSPlugin = require('less-plugin-clean-css');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  context: __dirname,
  entry: {
    index: path.resolve(__dirname, 'src/web/src/index.tsx'),
    mobile: path.resolve(__dirname, 'src/mobile/src/index.tsx'),
    custom_sound: path.resolve(__dirname, 'src/web/src/addons/custom_sound/index.ts'),
    socket: path.resolve(__dirname, 'src/web/src/addons/socket.io/index.ts'),
    livemap: path.resolve(__dirname, 'src/web/src/addons/livemap/index.ts'),
  },
  output: {
    path: path.resolve(__dirname, 'web/web'),
    filename: 'js/[name].js',
    publicPath: '',
  },

  mode: process.env.NODE_ENV,
  devtool: 'source-map',

  resolve: {
    alias: {
      components: path.resolve(__dirname, 'src/web/src/components'),
      assets: path.resolve(__dirname, 'src/web/assets'),
      actions: path.resolve(__dirname, 'src/web/src/actions'),
      api: path.resolve(__dirname, 'src/web/src/api'),
    },
    modules: ['node_modules'],
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },

  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: [
          /node_modules/,
          path.resolve(__dirname, 'src/server'),
          path.resolve(__dirname, 'src/client'),
        ],
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              experimentalWatchApi: true,
              configFile: path.resolve(__dirname, 'tsconfig-react.json'),
            },
          },
        ],
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
      },
      {
        test: /\.json$/,
        exclude: /node_modules/,
        use: {
          loader: 'json-loader',
        },
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
            },
            {
              loader: 'less-loader',
              options: {
                plugins: [
                  new CleanCSSPlugin({
                    advanced: true,
                  }),
                ],
              },
            },
          ],
        }),
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        }),
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[hash].[ext]',
              outputPath: 'img/',
            },
          },
        ],
      },
      {
        test: /\.(mp3|wav|ogg|mpe?g)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'sounds/',
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new ExtractTextPlugin('styles.css', {
      disable: true,
    }),
    new HtmlWebpackPlugin({
      template: 'src/web/assets/_webpack_tpl.html',
      chunks: ['index'],
    }),
    new HtmlWebpackPlugin({
      template: 'src/web/assets/_mobile_tpl.html',
      filename: 'mobile.html',
      chunks: ['mobile'],
    }),
    new HtmlWebpackPlugin({
      template: 'src/web/assets/_sound_tpl.html',
      filename: 'custom_sound.html',
      chunks: ['custom_sound'],
    }),
    new HtmlWebpackPlugin({
      template: 'src/web/assets/_socket_tpl.html',
      filename: 'socket.html',
      chunks: ['socket'],
    }),
    new HtmlWebpackPlugin({
      template: 'src/web/assets/_livemap_tpl.html',
      filename: 'livemap.html',
      chunks: ['livemap'],
    }),
    new CopyPlugin([
      { from: path.resolve(__dirname, 'src/web/src/addons/custom_sound/sounds/'), to: path.resolve(__dirname, 'web/web/sounds/') }
    ]),
    new CopyPlugin([
      {
        from: path.resolve(__dirname, 'src/web/src/addons/livemap/images/'),
        to: path.resolve(__dirname, 'web/web/livemap/images')
      }
    ]),
    new CopyPlugin([
      {
        from: path.resolve(__dirname, 'src/web/src/addons/livemap/style.css'),
        to: path.resolve(__dirname, 'web/web/livemap/style.css')
      }
    ]),
    new CopyPlugin([
      {
        from: path.resolve(__dirname, 'src/web/src/addons/livemap/fontawesome-all.min.css'),
        to: path.resolve(__dirname, 'web/web/livemap/fontawesome-all.min.css')
      }
    ]),
  ],

  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        parallel: true,
      }),
    ],
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
    // splitChunks: {
    //   cacheGroups: {
    //     vendor: {
    //       test: /node_modules/,
    //       chunks: 'initial',
    //       name: 'vendor',
    //       enforce: true,
    //     },
    //   },
    // },
  },
};
