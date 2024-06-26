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
import {
  Class,
  DefaultLabelStyle,
  EdgePathLabelModel,
  EdgeSides,
  ExteriorLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphInputMode,
  GraphItemTypes,
  GroupNodeStyle,
  HierarchicLayout,
  IGraph,
  LayoutExecutor,
  License,
  ShapeNodeShape,
  Size
} from 'yfiles'

import { NodeHighlightManager } from './NodeHighlightManager.js'
import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import graphData from './graph-data.json'

/**
 * Bootstraps the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  // create graph component
  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })

  const graph = graphComponent.graph

  // configure default styles for newly created graph elements
  initializeGraph(graph)

  // enable mouse hover effects for nodes and edges
  configureHoverHighlight(graphComponent)

  // build the graph from the given data set
  buildGraph(graph, graphData)

  // layout and center the graph
  Class.ensure(LayoutExecutor)
  graph.applyLayout(new HierarchicLayout({ orthogonalRouting: true, minimumLayerDistance: 35 }))
  graphComponent.fitGraphBounds()

  // enable now the undo engine to prevent undoing of the graph creation
  graph.undoEngineEnabled = true
}

/**
 * Creates nodes and edges according to the given data.
 * @param {!IGraph} graph
 * @param {!JSONGraph} graphData
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
 * @param {!GraphComponent} graphComponent
 */
function configureHoverHighlight(graphComponent) {
  const inputMode = graphComponent.inputMode

  // enable hover effects for nodes and edges
  inputMode.itemHoverInputMode.enabled = true
  inputMode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE
  inputMode.itemHoverInputMode.discardInvalidItems = false

  // specify the hover effect: highlight a node whenever the mouse hovers over the respective node
  inputMode.itemHoverInputMode.addHoveredItemChangedListener((hoverInputMode, evt) => {
    const highlightManager =
      hoverInputMode.inputModeContext.canvasComponent.highlightIndicatorManager
    highlightManager.clearHighlights()
    const item = evt.item
    if (item) {
      highlightManager.addHighlight(item)
    }
  })

  graphComponent.highlightIndicatorManager = new NodeHighlightManager()
}

/**
 * Initializes the defaults for the styling in this demo.
 *
 * @param {!IGraph} graph The graph.
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
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'left',
    textFill: '#eee'
  })

  // set sizes and locations specific for this demo
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.shareStyleInstance = false
  graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 5
  }).createParameter('south')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}

run().then(finishLoading)
