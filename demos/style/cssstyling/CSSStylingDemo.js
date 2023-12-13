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
  CircularLayout,
  Class,
  DefaultLabelStyle,
  ExteriorLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphOverviewCanvasVisualCreator,
  GraphOverviewComponent,
  GraphSnapContext,
  IEdge,
  ILabel,
  INode,
  IPort,
  LabelSnapContext,
  LayoutExecutor,
  License,
  Visualization
} from 'yfiles'
import { createDemoEdgeStyle, createDemoNodeStyle } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import CSS3NodeStyleWrapper from './CSS3NodeStyleWrapper.js'
import graphData from './graph-data.json'

/** @type {GraphComponent} */
let graphComponent

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  graphComponent = new GraphComponent('graphComponent')
  const overviewComponent = new GraphOverviewComponent('overviewComponent', graphComponent)

  // add a custom visualization for the elements in the overview
  overviewComponent.graphVisualCreator = new GraphOverviewVisualCreator(overviewComponent.graph)

  configureInputMode()
  initializeGraph(graphComponent.graph)

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  Class.ensure(LayoutExecutor)
  graphComponent.graph.applyLayout(
    new CircularLayout({
      layoutStyle: 'single-cycle',
      componentLayoutEnabled: false,
      integratedNodeLabeling: true,
      nodeLabelingPolicy: 'ray-like'
    })
  )
  graphComponent.fitGraphBounds()

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true
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
      data: graphData.nodeList,
      id: (item) => item.id
    })
    .nodeCreator.createLabelBinding((data) => data.label)

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })

  graphBuilder.buildGraph()
}

/**
 * Configures an input mode to allow the operations which use the templates that were styled with CSS.
 */
function configureInputMode() {
  const graphEditorInputMode = new GraphEditorInputMode({
    // enable snapping
    snapContext: new GraphSnapContext({
      enabled: true,
      snapDistance: 10,
      visualizeSnapResults: true
    }),
    labelSnapContext: new LabelSnapContext(),
    // allow focusing all graph elements
    focusableItems: GraphItemTypes.ALL
  })

  // allow hovering of all graph elements
  graphEditorInputMode.itemHoverInputMode.hoverItems = GraphItemTypes.ALL

  // enable tooltips
  const mouseHoverInputMode = graphEditorInputMode.mouseHoverInputMode
  mouseHoverInputMode.toolTipLocationOffset = [15, 15]
  mouseHoverInputMode.delay = '500ms'
  mouseHoverInputMode.duration = '5s'

  // show an indicator for the current label position
  graphEditorInputMode.moveLabelInputMode.visualization = Visualization.GHOST

  // add a tooltip for hovered items
  graphEditorInputMode.addQueryItemToolTipListener((_, evt) => {
    if (evt.handled) {
      return
    }
    evt.toolTip = createTooltipContent(evt.item)
    evt.handled = true
  })

  // add a highlight for hovered items
  graphEditorInputMode.itemHoverInputMode.addHoveredItemChangedListener((_, evt) => {
    if (evt.oldItem) {
      graphComponent.highlightIndicatorManager.removeHighlight(evt.oldItem)
    }
    if (evt.item) {
      graphComponent.highlightIndicatorManager.addHighlight(evt.item)
    }
  })

  // whenever the user creates a node, we set a created flag on its tag data object, which will then be used
  // by the custom node style to set the appropriate CSS classes
  graphEditorInputMode.addNodeCreatedListener((_, evt) => {
    const node = evt.item
    node.tag = { created: true }
  })

  graphComponent.inputMode = graphEditorInputMode
}

/**
 * Creates a tooltip text depending on the class of the item.
 * @param {!IModelItem} item
 * @returns {?string}
 */
function createTooltipContent(item) {
  if (item instanceof INode) {
    return 'Node Tooltip'
  } else if (item instanceof IEdge) {
    return 'Edge Tooltip'
  } else if (item instanceof IPort) {
    return 'Port Tooltip'
  } else if (item instanceof ILabel) {
    return 'Label Tooltip'
  }
  return null
}

/**
 * Initializes the defaults for the styling in this demo.
 * @param {!IGraph} graph
 */
function initializeGraph(graph) {
  const demoNodeStyle = createDemoNodeStyle()
  demoNodeStyle.stroke = '1.5px #3c4253'
  demoNodeStyle.fill = 'white'

  const demoEdgeStyle = createDemoEdgeStyle({ showTargetArrow: false })
  demoEdgeStyle.stroke = '1.5px white'

  const demoLabelStyle = new DefaultLabelStyle({
    textFill: 'white',
    insets: [3, 5, 3, 5],
    backgroundFill: 'rgba(60, 66, 83, 0.5)'
  })

  graph.nodeDefaults.style = new CSS3NodeStyleWrapper(demoNodeStyle)
  graph.edgeDefaults.style = demoEdgeStyle
  graph.nodeDefaults.labels.style = demoLabelStyle
  graph.edgeDefaults.labels.style = demoLabelStyle
  graph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.SOUTH
}

class GraphOverviewVisualCreator extends GraphOverviewCanvasVisualCreator {
  /**
   * Paints the path of the edge in a very light gray.
   * @param {!IRenderContext} _renderContext
   * @param {!CanvasRenderingContext2D} ctx
   * @param {!IEdge} edge
   */
  paintEdge(_renderContext, ctx, edge) {
    ctx.strokeStyle = '#f7f7f7'
    ctx.beginPath()
    ctx.moveTo(edge.sourcePort.location.x, edge.sourcePort.location.y)
    edge.bends.forEach((bend) => ctx.lineTo(bend.location.x, bend.location.y))
    ctx.lineTo(edge.targetPort.location.x, edge.targetPort.location.y)
    ctx.stroke()
  }

  /**
   * Paints the outline of the group node in a very light gray.
   * @param {!IRenderContext} _renderContext
   * @param {!CanvasRenderingContext2D} ctx
   * @param {!INode} node
   */
  paintGroupNode(_renderContext, ctx, node) {
    ctx.strokeStyle = '#f7f7f7'
    ctx.strokeRect(node.layout.x, node.layout.y, node.layout.width, node.layout.height)
  }

  /**
   * Paints the rectangle of the node in a very light gray
   * @param {!IRenderContext} _renderContext
   * @param {!CanvasRenderingContext2D} ctx
   * @param {!INode} node
   */
  paintNode(_renderContext, ctx, node) {
    ctx.fillStyle = '#f7f7f7'
    ctx.fillRect(node.layout.x, node.layout.y, node.layout.width, node.layout.height)
  }
}

void run().then(finishLoading)
