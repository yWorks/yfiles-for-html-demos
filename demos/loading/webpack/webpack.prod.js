/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
'use strict'

const webpack = require('webpack')
const WebpackChunkHash = require('webpack-chunk-hash')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const merge = require('webpack-merge')
const path = require('path')
const baseConfig = require('./webpack.base')

module.exports = () => {
  console.log('Running Webpack...')

  return merge(baseConfig, {
    entry: {
      app: './build/webpack-demo.js'
    },

    resolve: {
      // where webpack will look to resolve required modules
      // https://webpack.js.org/configuration/resolve/#resolve-modules
      // In contrast to the dev configuration, the modules will be picked up from
      // ./build/ after they have been optimized using the yFiles deployment tool.
      modules: ['node_modules', path.resolve('./build'), path.resolve('./build/lib/umd/')]
    },

    plugins: [
      // The chunk hashes should be based on the file contents
      // https://webpack.js.org/guides/caching/#deterministic-hashes
      new WebpackChunkHash(),

      // Inject the bundle script tags into the html page
      new HtmlWebpackPlugin({
        inject: true,
        filename: '../index.html',
        template: path.resolve(__dirname, 'index.template.html')
      }),

      // For production, we want additional minification.
      new UglifyJsPlugin({
        uglifyOptions: {
          beautify: false,
          compress: {
            dead_code: false,
            conditionals: false
          },
          // keep the yFiles license header comments
          extractComments: false
        }
      })
    ],

    output: {
      // For production, we use hashed filenames to enable long term caching/cache busting
      // https://webpack.js.org/guides/caching/
      filename: '[name].[chunkhash].js',
      path: path.resolve(__dirname, 'dist')
    }
  })
}
