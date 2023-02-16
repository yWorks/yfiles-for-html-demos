/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import {
  FoldingManager,
  GraphComponent,
  GraphEditorInputMode,
  ICommand,
  IGraph,
  License,
  Rect
} from 'yfiles'
import StructureView from './StructureView.js'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import { applyDemoTheme, initDemoStyles } from '../../resources/demo-styles.js'
import { fetchLicense } from '../../resources/fetch-license.js'

/**
 * Runs the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  // setup support for folding
  const foldingManager = new FoldingManager()
  const foldingView = foldingManager.createFoldingView()
  foldingView.enqueueNavigationalUndoUnits = true

  // configure default styles ...
  initDemoStyles(foldingView.graph, { foldingEnabled: true })
  // ... and build an initial sample graph
  createGraph(foldingView.graph)

  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  graphComponent.graph = foldingView.graph

  // enable interactive editing
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })

  // center the sample graph in the view
  graphComponent.fitGraphBounds()

  // enable undo and redo
  foldingManager.masterGraph.undoEngineEnabled = true

  // create the structure view
  const structureView = createStructureView(graphComponent)

  registerCommands(graphComponent, structureView)

  showApp(graphComponent)
}

/**
 * Creates a new StructureView instance that is bound to the given graph component.
 * @param {!GraphComponent} graphComponent
 * @returns {!StructureView}
 */
function createStructureView(graphComponent) {
  const structureView = new StructureView('#structure-view')
  structureView.graph = graphComponent.graph
  structureView.onElementClicked = node => {
    const viewNode = graphComponent.graph.foldingView
      ? graphComponent.graph.foldingView.getViewItem(node)
      : node
    if (viewNode) {
      graphComponent.currentItem = viewNode
      graphComponent.selection.clear()
      graphComponent.selection.setSelected(viewNode, true)
      ICommand.ZOOM_TO_CURRENT_ITEM.execute(null, graphComponent)
    }
  }
  return structureView
}

/**
 * Creates an initial sample graph.
 * @param {!IGraph} graph
 */
function createGraph(graph) {
  const n1 = graph.createNode({
    layout: new Rect(126, 0, 30, 30),
    labels: ['N1']
  })
  const n2 = graph.createNode({
    layout: new Rect(126, 72, 30, 30),
    labels: ['N2']
  })
  const n3 = graph.createNode({
    layout: new Rect(75, 147, 30, 30),
    labels: ['N3']
  })
  const n4 = graph.createNode({
    layout: new Rect(177.5, 147, 30, 30),
    labels: ['N4']
  })
  const n5 = graph.createNode({
    layout: new Rect(110, 249, 30, 30),
    labels: ['N5']
  })
  const n6 = graph.createNode({
    layout: new Rect(177.5, 249, 30, 30),
    labels: ['N6']
  })
  const n7 = graph.createNode({
    layout: new Rect(110, 299, 30, 30),
    labels: ['N7']
  })
  const n8 = graph.createNode({
    layout: new Rect(177.5, 299, 30, 30),
    labels: ['N8']
  })
  const n9 = graph.createNode({
    layout: new Rect(110, 359, 30, 30),
    labels: ['N9']
  })
  const n10 = graph.createNode({
    layout: new Rect(47.5, 299, 30, 30),
    labels: ['N10']
  })
  const n11 = graph.createNode({
    layout: new Rect(20, 440, 30, 30),
    labels: ['N11']
  })
  const n12 = graph.createNode({
    layout: new Rect(110, 440, 30, 30),
    labels: ['N12']
  })
  const n13 = graph.createNode({
    layout: new Rect(20, 515, 30, 30),
    labels: ['N13']
  })
  const n14 = graph.createNode({
    layout: new Rect(80, 515, 30, 30),
    labels: ['N14']
  })
  const n15 = graph.createNode({
    layout: new Rect(140, 515, 30, 30),
    labels: ['N15']
  })
  const n16 = graph.createNode({
    layout: new Rect(20, 569, 30, 30),
    labels: ['N16']
  })

  const group1 = graph.createGroupNode({
    layout: new Rect(25, 45, 202.5, 353),
    labels: ['Group 1']
  })
  graph.groupNodes(group1, [n2, n3, n4, n9, n10])

  const group2 = graph.createGroupNode({
    parent: group1,
    layout: new Rect(98, 222, 119.5, 116),
    labels: ['Group 2']
  })
  graph.groupNodes(group2, [n5, n6, n7, n8])

  const group3 = graph.createGroupNode({
    layout: new Rect(10, 413, 170, 141),
    labels: ['Group 3']
  })
  graph.groupNodes(group3, [n11, n12, n13, n14, n15])

  graph.createEdge(n1, n2)
  graph.createEdge(n2, n3)
  graph.createEdge(n2, n4)
  graph.createEdge(n3, n5)
  graph.createEdge(n3, n10)
  graph.createEdge(n5, n7)
  graph.createEdge(n7, n9)
  graph.createEdge(n4, n6)
  graph.createEdge(n6, n8)
  graph.createEdge(n10, n11)
  graph.createEdge(n10, n12)
  graph.createEdge(n11, n13)
  graph.createEdge(n13, n16)
  graph.createEdge(n12, n14)
  graph.createEdge(n12, n15)
}

/**
 * Binds actions to the demo's UI controls.
 * @param {!GraphComponent} graphComponent
 * @param {!StructureView} structureView
 */
function registerCommands(graphComponent, structureView) {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent, null)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent, null)

  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent, null)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent, null)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent, null)
  bindCommand("button[data-command='Delete']", ICommand.DELETE, graphComponent, null)

  bindCommand(
    "button[data-command='GroupSelection']",
    ICommand.GROUP_SELECTION,
    graphComponent,
    null
  )
  bindCommand(
    "button[data-command='UngroupSelection']",
    ICommand.UNGROUP_SELECTION,
    graphComponent,
    null
  )
  bindCommand("button[data-command='EnterGroup']", ICommand.ENTER_GROUP, graphComponent, null)
  bindCommand("button[data-command='ExitGroup']", ICommand.EXIT_GROUP, graphComponent, null)

  bindAction('#sync-folding-state', e => (structureView.syncFoldingState = e.target.checked))
}

// noinspection JSIgnoredPromiseFromCall
run()
