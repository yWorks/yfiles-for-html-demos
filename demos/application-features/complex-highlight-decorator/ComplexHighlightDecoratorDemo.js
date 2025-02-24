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
  EdgeSides,
  ExteriorNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphInputMode,
  GraphItemTypes,
  GroupNodeStyle,
  HierarchicalLayout,
  IGraph,
  LabelStyle,
  LayoutExecutor,
  License,
  NodeStyleIndicatorRenderer,
  ShapeNodeShape,
  ShapeNodeStyle,
  Size
} from '@yfiles/yfiles'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import graphData from './graph-data.json'
// Ensure that the LayoutExecutor class is not removed by build optimizers
// It is needed for the 'applyLayoutAnimated' method in this demo.
LayoutExecutor.ensure()
/**
 * Bootstraps the demo.
 */
async function run() {
  License.value = await fetchLicense()
  // create graph component
  const graphComponent = new GraphComponent('#graphComponent')
  graphComponent.inputMode = new GraphEditorInputMode()
  const graph = graphComponent.graph
  // configure default styles for newly created graph elements
  initializeGraph(graph)
  // enable mouse hover effects for nodes and edges
  configureHoverHighlight(graphComponent)
  // build the graph from the given data set
  buildGraph(graph, graphData)
  // layout and center the graph
  graph.applyLayout(new HierarchicalLayout({ minimumLayerDistance: 35 }))
  await graphComponent.fitGraphBounds()
  // enable now the undo engine to prevent undoing of the graph creation
  graph.undoEngineEnabled = true
}
/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)
  graphBuilder
    .createNodesSource({
      data: graphData.nodeList.filter((item) => !item.isGroup),
      id: (item) => item.id,
      parentId: (item) => item.parentId,
      tag: (item) => item.tag
    })
    .nodeCreator.styleBindings.addBinding('shape', (item) => item.tag)
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
 * Registers highlight styles for the nodes and edges of the given graph.
 */
function configureHoverHighlight(graphComponent) {
  const inputMode = graphComponent.inputMode
  // enable hover effects for nodes and edges
  inputMode.itemHoverInputMode.enabled = true
  inputMode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE
  // specify the hover effect: highlight a node whenever the mouse hovers over the respective node
  inputMode.itemHoverInputMode.addEventListener('hovered-item-changed', (evt) => {
    const highlights = graphComponent.highlights
    highlights.clear()
    if (evt.item) {
      highlights.add(evt.item)
    }
  })
  // configure the node highlight style -> each node highlight should have the shape of the node
  graphComponent.graph.decorator.nodes.highlightRenderer.addFactory(
    (node) =>
      new NodeStyleIndicatorRenderer({
        nodeStyle: new ShapeNodeStyle({
          // the tag of each node contains information about the appropriate shape for the highlight
          shape: getShape(node.tag),
          stroke: '3px #621B00',
          fill: 'transparent'
        }),
        // the margin from the actual node to its highlight visualization
        margins: 4
      })
  )
}
/**
 * Initializes the defaults for the styling in this demo.
 *
 * @param graph The graph.
 */
function initializeGraph(graph) {
  // set styles for this demo
  initDemoStyles(graph, { shape: ShapeNodeShape.ELLIPSE })
  // set the style, label and label parameter for group nodes
  graph.groupNodeDefaults.style = new GroupNodeStyle({
    tabFill: '#46a8d5',
    stroke: '2px solid #b5dcee',
    contentAreaFill: '#b5dcee'
  })
  graph.groupNodeDefaults.labels.style = new LabelStyle({
    horizontalTextAlignment: 'left',
    textFill: '#eee'
  })
  // set sizes and locations specific for this demo
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.shareStyleInstance = false
  graph.nodeDefaults.labels.layoutParameter = new ExteriorNodeLabelModel({
    margins: 5
  }).createParameter('bottom')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}
/**
 * Determines a suitable highlight shape depending on the given tag data.
 * @param tag the tag of the node to be highlighted.
 */
function getShape(tag) {
  return tag === 'ellipse' || tag === 'triangle' ? tag : 'rectangle'
}
run().then(finishLoading)
