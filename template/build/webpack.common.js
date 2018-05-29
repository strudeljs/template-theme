require('dotenv').config();
const dev = require('./webpack.dev');
const prod = require('./webpack.prod');
const merge = require('webpack-merge');
const path = require('path');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const { globEntries, MultipleBundlesPlugin } = require('multiple-bundles-webpack-plugin');

const entryPatterns = { js: './src/js/*/[a-z]*.js', sass: './src/sass/*/[a-z]*.scss' };
const resolve = dir => path.join(__dirname, '..', dir);

const entries = {
  ...globEntries([entryPatterns.js]),
  ...globEntries([entryPatterns.sass], { sass: true }),
};

const config = {
  entry: entries,
  output: {
    filename: 'js/[name].js',
    publicPath: '/etc/designs/zg/{{ name }}/desktop/',
    path: resolve('/'),
  },
  resolve: {
    alias: {
      assets: resolve('assets'),
      strudel: path.resolve(path.join(__dirname, '../node_modules', 'strudel'))
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: resolve('src/js'),
        exclude: [/node_modules/, /libs/],
        loader: 'eslint-loader',
        enforce: 'pre',
        options: {
          formatter: require('eslint-friendly-formatter'),
        },
      },
      {
        test: /\.js$/,
        include: resolve('src/js/'),
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.scss$/,
        include: resolve('src/sass'),
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              includePaths: ['./src/sass/core', './src/sass/utils']
            }
          }
        ],
      },
      {
        test: /\.(svg|png|woff|woff2|eot)$/,
        loader: 'file-loader',
        options: {
          emitFile: false,
          name: '[path][name].[ext]'
        }
      }
    ],
  },
  plugins: [
    new StyleLintPlugin(),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
    new MultipleBundlesPlugin({
      test: /\.js$/,
      entries: globEntries([entryPatterns.sass], { sass: true })
    }),
    new LodashModuleReplacementPlugin({
      paths: true
    }),
  ],
  optimization: {
    runtimeChunk: {
        name: 'js/vendors'
    },
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          name: 'js/vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
};

module.exports = (env) => {
  const isProduction = typeof env !== 'undefined' && env.prod;

  return isProduction ? merge(config, prod) : merge(config, dev);
};
