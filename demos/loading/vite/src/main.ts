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
import '@yfiles/demo-app/loading-demo.css'
import {
  CanvasComponent,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicalLayout,
  License
} from '@yfiles/yfiles'
import licenseValue from './license.json'

import { addLayoutButton, removeLayoutButton } from './layout-button'

import {
  createGroupedSampleGraph,
  initializeBasicDemoStyles,
  initializeFolding
} from '@yfiles/demo-utils/sample-graph'

License.value = licenseValue

// OPTIONALLY use Vite's Hot Module Replacement (HMR) API https://vitejs.dev/guide/api-hmr.html
// This HMR code is a simple example of how to wire up HMR and is NOT necessary in general.
// It may be removed together with the if-clauses regarding the GraphComponent's initialization.
//
// With HMR enabled, note how changes in the source files do not trigger an entire page reload during
// development but are almost immediate reflected in the running dev-server.
if (import.meta.hot) {
  // accept any source code change without reloading the entire page
  import.meta.hot.accept()
  // remove any state that results from (re-)loading this module
  import.meta.hot.dispose(() => {
    removeLayoutButton()
    graphComponent.graph.clear()
  })
}

// Instantiate or re-use (in case of HMR) a GraphComponent.
const oldGc = CanvasComponent.getComponent(document.querySelector('#graphComponent')!)
let graphComponent: GraphComponent
if (oldGc instanceof GraphComponent) {
  // re-use the existing GraphComponent during HMR
  graphComponent = oldGc
} else {
  // upon first load, create a new GraphComponent and assign an input mode
  graphComponent = new GraphComponent('#graphComponent')
  graphComponent.inputMode = new GraphEditorInputMode()
}

// create and fit an initial graph
initializeFolding(graphComponent)
initializeBasicDemoStyles(graphComponent.graph)
createGroupedSampleGraph(graphComponent.graph)

// initial layout is left-to-right, pressing the button uses top-top-bottom
graphComponent.graph.applyLayout(new HierarchicalLayout({ layoutOrientation: 'left-to-right' }))
void graphComponent.fitGraphBounds()

// wire up an automatic layout that is performed asynchronous on a Web Worker
const button = document.querySelector<HTMLButtonElement>('#layout')!
addLayoutButton(button, graphComponent)
