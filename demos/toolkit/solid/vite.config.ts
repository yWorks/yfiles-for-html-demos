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
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import optimizer from '@yworks/optimizer/rollup-plugin'
//import devtools from 'solid-devtools/vite'

export default defineConfig(({ mode }) => {
  return {
    base: './',
    server: { port: 3000 },
    resolve: { preserveSymlinks: true },
    plugins: [
      /*
       Uncomment the following line to enable solid-devtools.
       For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
       */
      // devtools(),
      solidPlugin(),
      mode === 'production'
        ? optimizer({
            logLevel: 'info',
            blacklist: ['template', 'render', 'effect'],
            shouldOptimize({ id }) {
              // make sure not to exclude demo-utils since it is in node_modules and uses yFiles API
              return !id.includes('node_modules')
            }
          })
        : undefined
    ]
  }
})
