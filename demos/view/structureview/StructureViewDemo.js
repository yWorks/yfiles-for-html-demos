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
import {
  FoldingManager,
  Graph,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicalLayout,
  LayoutExecutor,
  License,
  StraightLineEdgeRouter
} from '@yfiles/yfiles'
import { StructureView } from './StructureView'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import { sampleData } from './resources/structure-view-data'

// Ensure that the LayoutExecutor class is not removed by build optimizers
// It is needed for the 'applyLayoutAnimated' method in this demo.
LayoutExecutor.ensure()

/**
 * Runs the demo.
 */
async function run() {
  License.value = await fetchLicense()
  const graphComponent = new GraphComponent('graphComponent')
  const graph = new Graph()
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
  await graphComponent.fitGraphBounds()

  // create the structure view
  const structureView = createStructureView(graphComponent)

  initializeUI(structureView)
}

/**
 * Creates a folding view and sets its graph as the graph component's graph.
 */
function enableFolding(graphComponent, masterGraph) {
  const view = new FoldingManager(masterGraph).createFoldingView()
  view.enqueueNavigationalUndoUnits = true

  graphComponent.graph = view.graph
}

/**
 * Creates a new StructureView instance that is bound to the given graph component.
 */
function createStructureView(graphComponent) {
  const structureView = new StructureView('#structure-view', graphComponent.graph)

  // Zoom to the node when clicking on an element in the structure view
  structureView.elementClickedCallback = async (node) => {
    const viewNode = graphComponent.graph.foldingView
      ? graphComponent.graph.foldingView.getViewItem(node)
      : node
    if (viewNode) {
      graphComponent.currentItem = viewNode
      graphComponent.selection.clear()
      graphComponent.selection.add(viewNode)
      await graphComponent.zoomToAnimated(graphComponent.zoom, viewNode.layout.center)
    }
  }

  return structureView
}

/**
 * Creates an initial sample graph.
 */
function createGraph(graph) {
  const graphBuilder = new GraphBuilder(graph)

  // create nodes
  graphBuilder.createNodesSource({
    data: sampleData.nodes.filter((item) => !item.id.startsWith('Group')),
    id: (item) => item.id,
    parentId: (item) => item.parentId,
    labels: ['id']
  })

  // create group nodes
  graphBuilder.createGroupNodesSource({
    data: sampleData.nodes.filter((item) => item.id.startsWith('Group')),
    id: (item) => item.id,
    parentId: (item) => item.parentId,
    labels: ['id']
  })

  // create edges
  graphBuilder.createEdgesSource({
    data: sampleData.edges,
    sourceId: (item) => item.from,
    targetId: (item) => item.to
  })

  graphBuilder.buildGraph()

  // apply initial layout
  const layout = new HierarchicalLayout()
  layout.minimumLayerDistance = 40
  graph.applyLayout(new StraightLineEdgeRouter(layout))
}

function createEditorInputMode() {
  return new GraphEditorInputMode({
    navigationInputMode: { autoGroupNodeAlignmentPolicy: 'top-right' }
  })
}

/**
 * Binds actions to the demo's UI controls.
 */
function initializeUI(structureView) {
  document.getElementById('sync-folding-state').addEventListener('change', (e) => {
    structureView.syncFoldingState = e.target.checked
  })
}

void run().then(finishLoading)
