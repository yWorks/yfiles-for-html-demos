/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import 'demo-resources/style/loading-demo.css'

import {
  Class,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicLayout,
  ICommand,
  LayoutExecutor,
  License
} from 'yfiles'

import {
  createGroupedSampleGraph,
  initializeBasicDemoStyles,
  initializeFolding
} from 'utils/sample-graph'

import licenseData from './license.json'

License.value = licenseData

const graphComponent = new GraphComponent('graphComponent')

graphComponent.inputMode = new GraphEditorInputMode()

// add a sample graph
initializeFolding(graphComponent)
initializeBasicDemoStyles(graphComponent.graph)
createGroupedSampleGraph(graphComponent.graph)

registerCommands()

layout().then(() => {
  graphComponent.fitGraphBounds()
})

// We need to load the 'view-layout-bridge' module explicitly to prevent tree-shaking
// tools it from removing this dependency which is needed for 'morphLayout'.
Class.ensure(LayoutExecutor)

function layout() {
  const layoutAlgorithm = new HierarchicLayout({
    layoutOrientation: 'top-to-bottom'
  })
  return graphComponent.morphLayout(layoutAlgorithm, '2s')
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function registerCommands() {
  document.getElementById('zoom-in-btn')!.addEventListener('click', () => {
    ICommand.INCREASE_ZOOM.execute(null, graphComponent)
  })
  document.getElementById('zoom-out-btn')!.addEventListener('click', () => {
    ICommand.DECREASE_ZOOM.execute(null, graphComponent)
  })
  document.getElementById('reset-zoom-btn')!.addEventListener('click', () => {
    ICommand.ZOOM.execute(1, graphComponent)
  })
  document.getElementById('fit-zoom-btn')!.addEventListener('click', () => {
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  })
  document.getElementById('apply-layout-btn')!.addEventListener('click', () => {
    layout()
  })
}
