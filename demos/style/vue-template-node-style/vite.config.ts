/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import optimizer from '@yworks/optimizer/rollup-plugin'
import * as fs from 'node:fs'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const plugins: Plugin[] = [
    vue(),
    {
      name: 'resource-copy',
      writeBundle(options) {
        const resourcesDir = path.join(__dirname, 'resources')
        for (const svgFileName of fs
          .readdirSync(resourcesDir)
          .filter((name) => name.endsWith('.svg'))) {
          fs.cpSync(
            path.join(resourcesDir, svgFileName),
            path.join(options.dir!, 'resources', svgFileName)
          )
        }
      }
    }
  ]
  if (mode === 'production') {
    plugins.push(
      optimizer({
        shouldOptimize({ id }) {
          // make sure not to exclude demo-resources since it is in node_modules and uses yFiles API
          return (
            id.includes('demo-resources') ||
            id.includes('demo-utils') ||
            !id.includes('node_modules')
          )
        },
        blacklist: [
          'getValue',
          'setValue',
          'focused',
          'template',
          'content',
          'visible',
          'icon',
          'update'
        ]
      })
    )
  }
  return {
    base: './',
    plugins,
    resolve: {
      extensions: ['.ts', '.js'],
      alias: { vue: 'vue/dist/vue.esm-bundler.js' },
      preserveSymlinks: true
    }
  }
})
