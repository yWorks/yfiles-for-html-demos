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
  EdgePathLabelModel,
  ExteriorNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  IEdge,
  IGraph,
  ILabel,
  INode,
  LayoutExecutor,
  License,
  OrganicLayout,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  Size
} from '@yfiles/yfiles'
import { ContextualToolbar } from './ContextualToolbar'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import graphData from './graph-data.json'
let graphComponent
let contextualToolbar
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  graphComponent.graph.undoEngineEnabled = true
  initializeInputMode()
  // initialize the contextual toolbar
  contextualToolbar = new ContextualToolbar(
    graphComponent,
    document.getElementById('contextualToolbar')
  )
  initializeDefaultStyles(graphComponent.graph)
  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)
  // layout and center the graph
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(
    new OrganicLayout({
      defaultMinimumNodeDistance: 50,
      automaticGroupNodeCompaction: true,
      layoutOrientation: 'bottom-to-top'
    })
  )
  void graphComponent.fitGraphBounds()
  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngine?.clear()
}
/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)
  const nodesSource = graphBuilder.createNodesSource({
    data: graphData.nodeList,
    id: (item) => item.id
  })
  nodesSource.nodeCreator.createLabelBinding((item) => item.label)
  nodesSource.nodeCreator.styleBindings.addBinding('shape', (item) => item.tag)
  const colorProvider = (item) =>
    item.id === 0 || item.id === 4
      ? '#DC143C'
      : item.id === 2 || item.id === 7
        ? '#336699'
        : undefined
  nodesSource.nodeCreator.styleBindings.addBinding('fill', colorProvider)
  nodesSource.nodeCreator.styleBindings.addBinding('stroke', colorProvider)
  const edgesSource = graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })
  edgesSource.edgeCreator.createLabelBinding((item) => item.label)
  graphBuilder.buildGraph()
}
/**
 * Initializes the default styles.
 */
function initializeDefaultStyles(graph) {
  graph.nodeDefaults.style = new ShapeNodeStyle({ fill: '#228B22', stroke: '#228B22' })
  graph.nodeDefaults.size = new Size(45, 45)
  graph.nodeDefaults.shareStyleInstance = false
  graph.nodeDefaults.labels.layoutParameter = new ExteriorNodeLabelModel({
    margins: 5
  }).createParameter('top')
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: 'thick #333',
    targetArrow: '#333 large triangle'
  })
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5
  }).createRatioParameter()
}
/**
 * Creates and configures an editor input mode for the GraphComponent of this demo.
 */
function initializeInputMode() {
  const mode = new GraphEditorInputMode()
  // update the contextual toolbar when the selection changes ...
  mode.addEventListener('multi-selection-finished', (evt) => {
    // this implementation of the contextual toolbar only supports nodes, edges and labels
    contextualToolbar.selectedItems = evt.selection
      .filter((item) => item instanceof INode || item instanceof ILabel || item instanceof IEdge)
      .toArray()
  })
  // ... or when an item is right-clicked
  mode.addEventListener('item-right-clicked', (evt) => {
    // this implementation of the contextual toolbar only supports nodes, edges and labels
    graphComponent.selection.clear()
    graphComponent.selection.add(evt.item)
    contextualToolbar.selectedItems = [evt.item]
  })
  graphComponent.inputMode = mode
  // if an item is deselected or deleted, we remove that element from the selectedItems
  graphComponent.selection.addEventListener('item-removed', (evt) => {
    // remove the element from the selectedItems of the contextual toolbar
    const idx = contextualToolbar.selectedItems.findIndex((item) => item === evt.item)
    const newSelection = contextualToolbar.selectedItems.slice()
    newSelection.splice(idx, 1)
    contextualToolbar.selectedItems = newSelection
  })
}
run().then(finishLoading)
