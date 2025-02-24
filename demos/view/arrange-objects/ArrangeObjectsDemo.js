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
import { GraphBuilder, GraphComponent, GraphEditorInputMode, IGraph, License } from '@yfiles/yfiles'
import {
  alignBottom,
  alignHorizontally,
  alignLeft,
  alignRight,
  alignTop,
  alignVertically,
  distributeHorizontally,
  distributeVertically
} from './AlignmentUtils'
import SampleData from './resources/SampleData'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
/**
 * Bootstraps this demo.
 */
async function run() {
  License.value = await fetchLicense()
  // create the demo's graph component
  const graphComponent = new GraphComponent('#graphComponent')
  // enable interactive editing
  graphComponent.inputMode = new GraphEditorInputMode()
  // configure default styles for the demo's graph
  initDemoStyles(graphComponent.graph, { theme: 'demo-palette-31' })
  // create the demo's sample graph
  createSampleGraph(graphComponent.graph)
  // center the demo's graph in the demo's visible area
  graphComponent.fitGraphBounds()
  // enable undo and redo
  graphComponent.graph.undoEngineEnabled = true
  // bind the demo's new node alignment and node distribution operations to the demo's UI controls
  initializeUI(graphComponent)
}
/**
 * Creates the sample graph for this demo.
 */
function createSampleGraph(graph) {
  const data = SampleData
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: data.nodes,
    id: 'id',
    layout: 'bounds'
  })
  builder.buildGraph()
}
/**
 * Binds actions to the demo's UI controls.
 */
function initializeUI(graphComponent) {
  // bind the demo's new node alignment operations to toolbar controls
  document
    .querySelector('#align-bottom')
    .addEventListener('click', () =>
      alignBottom(graphComponent.graph, graphComponent.selection.nodes)
    )
  document
    .querySelector('#align-horizontally')
    .addEventListener('click', () =>
      alignHorizontally(graphComponent.graph, graphComponent.selection.nodes)
    )
  document
    .querySelector('#align-left')
    .addEventListener('click', () =>
      alignLeft(graphComponent.graph, graphComponent.selection.nodes)
    )
  document
    .querySelector('#align-right')
    .addEventListener('click', () =>
      alignRight(graphComponent.graph, graphComponent.selection.nodes)
    )
  document
    .querySelector('#align-top')
    .addEventListener('click', () => alignTop(graphComponent.graph, graphComponent.selection.nodes))
  document
    .querySelector('#align-vertically')
    .addEventListener('click', () =>
      alignVertically(graphComponent.graph, graphComponent.selection.nodes)
    )
  // bind the demo's new node distribution operations to toolbar controls
  document
    .querySelector('#distribute-horizontally')
    .addEventListener('click', () =>
      distributeHorizontally(graphComponent.graph, graphComponent.selection.nodes)
    )
  document
    .querySelector('#distribute-vertically')
    .addEventListener('click', () =>
      distributeVertically(graphComponent.graph, graphComponent.selection.nodes)
    )
}
run().then(finishLoading)
