/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
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
  Class,
  DefaultGraph,
  FoldingManager,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicLayout,
  ICommand,
  LayoutExecutor,
  License,
  NodeAlignmentPolicy,
  StraightLineEdgeRouter
} from 'yfiles'
import { StructureView } from './StructureView.js'
import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import { sampleData } from './resources/structure-view-data.js'

// We need to load the 'view-layout-bridge' module explicitly to prevent tree-shaking
// tools it from removing this dependency which is needed for 'applyLayout'.
Class.ensure(LayoutExecutor)

/**
 * Runs the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  const graph = new DefaultGraph()
  // set demo styles ...
  initDemoStyles(graph, { foldingEnabled: true })
  // ... and create a sample graph
  createGraph(graph)
  graph.undoEngineEnabled = true

  // enable collapsing/expanding group nodes
  enableFolding(graphComponent, graph)

  // enable interactive editing
  graphComponent.inputMode = createEditorInputMode()

  // center the sample graph in the view
  graphComponent.fitGraphBounds()

  // create the structure view
  const structureView = createStructureView(graphComponent)

  initializeUI(structureView)
}

/**
 * Creates a folding view and sets its graph as the graph component's graph.
 * @param {!GraphComponent} graphComponent
 * @param {!IGraph} masterGraph
 */
function enableFolding(graphComponent, masterGraph) {
  const view = new FoldingManager(masterGraph).createFoldingView()
  view.enqueueNavigationalUndoUnits = true

  graphComponent.graph = view.graph
}

/**
 * Creates a new StructureView instance that is bound to the given graph component.
 * @param {!GraphComponent} graphComponent
 * @returns {!StructureView}
 */
function createStructureView(graphComponent) {
  const structureView = new StructureView('#structure-view', graphComponent.graph)

  // Zoom to the node when clicking on an element in the structure view
  structureView.elementClickedCallback = node => {
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
  const graphBuilder = new GraphBuilder(graph)

  // create nodes
  graphBuilder.createNodesSource({
    data: sampleData.nodes.filter(item => !item.id.startsWith('Group')),
    id: item => item.id,
    parentId: item => item.parentId,
    labels: ['id']
  })

  // create group nodes
  graphBuilder.createGroupNodesSource({
    data: sampleData.nodes.filter(item => item.id.startsWith('Group')),
    id: item => item.id,
    parentId: item => item.parentId,
    labels: ['id']
  })

  // create edges
  graphBuilder.createEdgesSource({
    data: sampleData.edges,
    sourceId: item => item.from,
    targetId: item => item.to
  })

  graphBuilder.buildGraph()

  // apply initial layout
  const layout = new HierarchicLayout()
  layout.minimumLayerDistance = 40
  graph.applyLayout(new StraightLineEdgeRouter(layout))
}

/**
 * @returns {!GraphEditorInputMode}
 */
function createEditorInputMode() {
  const inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })
  inputMode.navigationInputMode.autoGroupNodeAlignmentPolicy = NodeAlignmentPolicy.TOP_RIGHT
  return inputMode
}

/**
 * Binds actions to the demo's UI controls.
 * @param {!StructureView} structureView
 */
function initializeUI(structureView) {
  document.getElementById('sync-folding-state').addEventListener('change', e => {
    structureView.syncFoldingState = e.target.checked
  })
}

void run().then(finishLoading)
