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
  Command,
  EdgePathLabelModel,
  EdgeSides,
  ExteriorNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphCopier,
  GraphEditorInputMode,
  GraphViewerInputMode,
  HierarchicalLayout,
  IBend,
  IEdge,
  ILabel,
  INode,
  IPort,
  LayoutExecutor,
  License,
  ModifierKeys,
  Size
} from '@yfiles/yfiles'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { bindYFilesCommand, finishLoading } from '@yfiles/demo-resources/demo-page'
import graphData from './graph-data.json'
let originalGraphComponent
let copyGraphComponent
/**
 * Bootstraps the demo.
 */
async function run() {
  License.value = await fetchLicense()
  originalGraphComponent = new GraphComponent('#graphComponent')
  copyGraphComponent = new GraphComponent('#copyGraphComponent')
  originalGraphComponent.inputMode = new GraphEditorInputMode()
  copyGraphComponent.inputMode = new GraphViewerInputMode()
  // configures default styles for newly created original graph and the copy graph elements
  initializeGraph(originalGraphComponent.graph)
  initializeGraph(copyGraphComponent.graph)
  // then build the graph from the given data set
  buildGraph(originalGraphComponent.graph, graphData)
  LayoutExecutor.ensure()
  originalGraphComponent.graph.applyLayout(new HierarchicalLayout({ minimumLayerDistance: 35 }))
  await originalGraphComponent.fitGraphBounds()
  // enable undo after the initial graph was populated since we don't want to allow undoing that
  originalGraphComponent.graph.undoEngineEnabled = true
  // bind the buttons to their functionality
  initializeUI()
}
/**
 * Iterates through the given data set and creates nodes and edges according to the given data.
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
      id: (item) => item.id
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
 * Determines if the <em>copy</em> command created in {@link #initializeUI} may be executed.
 */
function canCopyGraph() {
  return originalGraphComponent.selection.size > 0
}
/**
 * Copy the selected part of the original graph to another graph.
 */
function copyGraph() {
  const graphCopier = new GraphCopier()
  copyGraphComponent.graph.clear()
  graphCopier.copy(originalGraphComponent.graph, copyGraphComponent.graph, (item) => {
    const selection = originalGraphComponent.selection
    if (item instanceof INode || item instanceof IEdge) {
      // copy selected node or edge
      // note that only edges for which both source and edge are actually in the graph
      // are ultimately copied by the copier
      return selection.includes(item)
    } else if (item instanceof IPort || item instanceof IBend || item instanceof ILabel) {
      // ports, bends, and labels are copied if they belong to a selected item
      // note that edges are not copied if their ports are not copied also
      return selection.includes(item.owner)
    }
    return false
  })
  void copyGraphComponent.fitGraphBounds()
  return true
}
/**
 * Initializes the defaults for the styling in this demo.
 *
 * @param graph The graph.
 */
function initializeGraph(graph) {
  // set styles for this demo
  initDemoStyles(graph)
  // set sizes and locations specific for this demo
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.layoutParameter = new ExteriorNodeLabelModel({
    margins: 5
  }).createParameter('bottom')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}
/**
 * Clear the graph in the given graph component.
 */
function clearGraph(graphComponent) {
  graphComponent.graph.clear()
  void graphComponent.fitGraphBounds()
}
/**
 * Binds actions to the buttons in the tutorial's toolbar.
 */
function initializeUI() {
  document
    .querySelector('#new-in-original')
    .addEventListener('click', () => clearGraph(originalGraphComponent))
  const geim = originalGraphComponent.inputMode
  // disable edit on typing not to interfere with our key-binding
  geim.allowEditLabelOnTyping = false
  const kim = geim.keyboardInputMode
  kim.addCommandBinding(Command.COPY, copyGraph, canCopyGraph)
  kim.addKeyBinding('c', ModifierKeys.NONE, copyGraph)
  document.querySelector('#copy').addEventListener('click', () => copyGraph())
  document
    .querySelector('#new-in-copy')
    .addEventListener('click', () => clearGraph(copyGraphComponent))
  bindYFilesCommand(
    '#reset-zoom-in-copy',
    Command.ZOOM,
    copyGraphComponent,
    1.0,
    'Zoom to original size'
  )
  document
    .querySelector('#fit-graph-bounds-in-copy')
    .addEventListener('click', () => copyGraphComponent.fitGraphBounds())
}
void run().then(finishLoading)
