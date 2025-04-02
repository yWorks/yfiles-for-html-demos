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
  FreeNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphOverviewComponent,
  GraphSnapContext,
  HandlesRenderer,
  HierarchicalLayout,
  IEdge,
  IGraph,
  IModelItem,
  INode,
  LayoutExecutor,
  License,
  NodeAlignmentPolicy,
  OrthogonalEdgeEditingContext,
  PopulateItemContextMenuEventArgs,
  RenderMode,
  SmartEdgeLabelModel,
  TextBoxPlacementPolicy
} from '@yfiles/yfiles'
import { DemoStyleOverviewRenderer, initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { BrowserDetection } from '@yfiles/demo-utils/BrowserDetection'
import { configureTwoPointerPanning } from '@yfiles/demo-utils/configure-two-pointer-panning'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import graphData from './graph-data.json'
import { openGraphML, saveGraphML } from '@yfiles/demo-utils/graphml-support'
let graphComponent
let overviewComponent
/**
 * Runs the demo.
 */
async function run() {
  License.value = await fetchLicense()
  // Initialize the GraphComponent and GraphOverviewComponent
  graphComponent = new GraphComponent('graphComponent')
  overviewComponent = new GraphOverviewComponent('overviewComponent')
  overviewComponent.graphComponent = graphComponent
  // Configure and enable folding
  const foldingManager = new FoldingManager()
  const foldingView = foldingManager.createFoldingView()
  foldingView.enqueueNavigationalUndoUnits = true
  const graph = foldingView.graph
  graphComponent.graph = graph
  // Styling for the overviewComponent
  overviewComponent.graphOverviewRenderer = new DemoStyleOverviewRenderer()
  // Set up the default styles for the graph
  setDefaultStyles(graph)
  // Specify a configured input mode that enables graph editing
  graphComponent.inputMode = createEditorMode()
  // use two finger panning to allow easier editing with touch gestures
  configureTwoPointerPanning(graphComponent)
  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)
  // layout and center the graph
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(new HierarchicalLayout())
  void graphComponent.fitGraphBounds()
  // Enable the undo engine on the master graph
  foldingManager.masterGraph.undoEngineEnabled = true
  // Register functionality for the buttons in this demo
  initializeUI(graphComponent)
}
/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)
  graphBuilder.createNodesSource({
    data: graphData.nodeList.filter((item) => !item.isGroup),
    id: (item) => item.id,
    parentId: (item) => item.parentId
  })
  graphBuilder
    .createGroupNodesSource({
      data: graphData.nodeList.filter((item) => item.isGroup),
      id: (item) => item.id,
      parentId: (item) => item.parentId
    })
    .nodeCreator.createLabelBinding((item) => item.label)
  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })
  graphBuilder.buildGraph()
}
/**
 * Creates the editor input mode for this demo.
 */
function createEditorMode() {
  const mode = new GraphEditorInputMode({
    snapContext: createGraphSnapContext(),
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext({
      enabled: false
    })
  })
  mode.editLabelInputMode.textEditorInputMode.textBoxPlacementPolicy =
    TextBoxPlacementPolicy.MOVE_TEXT_BOX
  // Fix the top left location of a group node when toggling collapse/expand
  mode.navigationInputMode.autoGroupNodeAlignmentPolicy = NodeAlignmentPolicy.TOP_RIGHT
  // Make bend creation more important than moving of selected edges.
  // As a result, dragging a selected edge (not its bends) will create a new bend instead of moving all bends.
  // This is especially nicer in conjunction with orthogonal edge editing because this would create additional bends
  // every time the edge is moved otherwise
  mode.createBendInputMode.priority = mode.moveSelectedItemsInputMode.priority - 1
  // use WebGL rendering for handles if possible, otherwise the handles are rendered using SVG
  if (BrowserDetection.webGL2) {
    mode.handleInputMode.handlesRenderer = new HandlesRenderer(RenderMode.WEBGL)
  }
  // Add an event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  mode.addEventListener('populate-item-context-menu', (evt) => populateContextMenu(evt))
  return mode
}
/**
 * Creates a configured {@link GraphSnapContext} for this demo.
 */
function createGraphSnapContext() {
  return new GraphSnapContext({
    enabled: false
  })
}
/**
 * Sets default styles to the graph.
 * @param graph The graph
 */
function setDefaultStyles(graph) {
  // Assign the default demo styles
  initDemoStyles(graph, { foldingEnabled: true, orthogonalEditing: true })
  // Set the default node label position to centered below the node with the FreeNodeLabelModel that supports label
  // snapping
  graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.INSTANCE.createParameter(
    [0.5, 1.0],
    [0, 10],
    [0.5, 0.0],
    [0, 0],
    0
  )
  // Set the default edge label position with the SmartEdgeLabelModel that supports label snapping
  graph.edgeDefaults.labels.layoutParameter = new SmartEdgeLabelModel().createParameterFromSource(
    0,
    0,
    0.5
  )
}
/**
 * Binds various actions to buttons in the demo's toolbar.
 */
function initializeUI(graphComponent) {
  document.querySelector('#open-file-button').addEventListener('click', async () => {
    await openGraphML(graphComponent)
  })
  document.querySelector('#save-button').addEventListener('click', async () => {
    await saveGraphML(graphComponent, 'graphEditor.graphml')
  })
  const geim = graphComponent.inputMode
  const snappingButton = document.querySelector('#demo-snapping-button')
  snappingButton.addEventListener('click', () => {
    geim.snapContext.enabled = snappingButton.checked
  })
  const orthogonalEditingButton = document.querySelector('#demo-orthogonal-editing-button')
  orthogonalEditingButton.addEventListener('click', () => {
    geim.orthogonalEdgeEditingContext.enabled = orthogonalEditingButton.checked
  })
}
function selectAllEdges() {
  graphComponent.selection.clear()
  graphComponent.graph.edges.forEach((edge) => graphComponent.selection.add(edge))
}
function selectAllNodes() {
  graphComponent.selection.clear()
  graphComponent.graph.nodes.forEach((node) => graphComponent.selection.add(node))
}
/**
 * Populates the context menu based on the item the mouse hovers over
 */
function populateContextMenu(args) {
  if (args.handled) {
    return
  }
  // In this demo, we use the following custom hit testing to prefer nodes.
  const hits = graphComponent.graphModelManager.hitElementsAt(args.queryLocation)
  // Check whether a node was it. If it was, we prefer it over edges
  const hit = hits.find((item) => item instanceof INode) || hits.at(0)
  const menuItems = []
  const graphSelection = graphComponent.selection
  if (hit instanceof INode) {
    // if a node or an edge is hit: provide 'Select All Nodes' or 'Select All Edges', respectively
    // and select the hit item
    menuItems.push({ label: 'Select All Nodes', action: selectAllNodes })
    if (!graphSelection.includes(hit)) {
      graphSelection.clear()
    }
    graphSelection.add(hit)
  } else if (hit instanceof IEdge) {
    menuItems.push({ label: 'Select All Edges', action: selectAllEdges })
    if (!graphSelection.includes(hit)) {
      graphSelection.clear()
    }
    graphSelection.add(hit)
  } else {
    // if another type of item or the empty canvas is hit: provide 'Select All'
    menuItems.push({
      label: 'Select All',
      action: () => {
        graphComponent.graph.nodes.forEach((node) => graphSelection.add(node))
        graphComponent.graph.edges.forEach((edge) => graphSelection.add(edge))
      }
    })
  }
  const inputMode = graphComponent.inputMode
  // if one or more nodes are selected: add options to cut and copy
  if (graphSelection.nodes.size > 0) {
    menuItems.push({
      label: 'Cut',
      action: () => {
        inputMode.cut()
      }
    })
    menuItems.push({
      label: 'Copy',
      action: () => {
        inputMode.copy()
      }
    })
  }
  if (!graphComponent.clipboard.isEmpty) {
    // clipboard is not empty: add option to paste
    menuItems.push({
      label: 'Paste',
      action: () => {
        inputMode.pasteAtLocation(args.queryLocation)
      }
    })
  }
  if (menuItems.length > 0) {
    args.contextMenu = menuItems
  }
}
run().then(finishLoading)
