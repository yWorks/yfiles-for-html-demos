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
  Color,
  EdgeRouter,
  EdgeRouterBusDescriptor,
  EdgeRouterData,
  Fill,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphSnapContext,
  IEdge,
  IGraph,
  LayoutExecutor,
  License,
  PolylineEdgeStyle,
  Stroke
} from '@yfiles/yfiles'
import SampleData from './resources/SampleData'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
/**
 * Provides different color fills for new edge busses in this demo.
 */
class ColorUtil {
  fills = ColorUtil.newFills()
  index = 0
  /**
   * Returns a fill not yet in use.
   * @see {@link connectNodes}
   */
  nextFill() {
    if (this.index >= this.fills.length) {
      const r = Math.floor(Math.random() * 150)
      const g = Math.floor(Math.random() * 150)
      const b = Math.floor(Math.random() * 150)
      this.fills.push(Fill.from(new Color(r, g, b)))
    }
    return this.fills[this.index++]
  }
  /**
   * Returns the fills already in use.
   */
  usedFills() {
    const copy = []
    for (let i = 0; i < this.index + 1; ++i) {
      copy.push(this.fills[i])
    }
    return copy
  }
  /**
   * Creates an initial set of fills for new edges.
   */
  static newFills() {
    const fills = []
    fills.push(Fill.from('#AB2346')) // sample graph edge color
    fills.push(Fill.from('#662b00')) // sample graph edge color
    fills.push(Fill.from('#0B7189')) // sample graph edge color
    fills.push(Fill.from('#0B7189'))
    fills.push(Fill.from('#111D4A'))
    fills.push(Fill.from('#17BEBB'))
    fills.push(Fill.from('#FFC914'))
    fills.push(Fill.from('#FF6C00'))
    fills.push(Fill.from('#2E282A'))
    fills.push(Fill.from('#76B041'))
    return fills
  }
}
/**
 * Display's the demo's graph.
 */
let graphComponent = null
/**
 * State guard to prevent concurrent layout calculations.
 */
let layoutRunning = false
/**
 * Manages the different color fills for grouping edges to busses.
 */
const colorUtil = new ColorUtil()
/**
 * Runs the demo.
 */
async function run() {
  License.value = await fetchLicense()
  initializeUI()
  graphComponent = new GraphComponent('#graphComponent')
  configureUserInteraction(graphComponent)
  configureGraph(graphComponent.graph)
  loadGraph(graphComponent.graph)
  void graphComponent.fitGraphBounds()
  await routeEdges()
}
/**
 * Configures the demo's user interaction.
 * @param graphComponent The demo's graph view.
 */
function configureUserInteraction(graphComponent) {
  // create an input mode for interactive graph editing
  const mode = new GraphEditorInputMode()
  // disable interactive edge creation
  mode.allowCreateEdge = false
  // restrict marquee selection to nodes
  mode.marqueeSelectableItems = GraphItemTypes.NODE
  // disable interactive node resizing
  mode.showHandleItems = GraphItemTypes.BEND | GraphItemTypes.EDGE
  // turn on default snapping for graph elements
  mode.snapContext = new GraphSnapContext()
  graphComponent.inputMode = mode
}
/**
 * Configures default visualizations for the given graph.
 * @param graph The demo's graph.
 */
function configureGraph(graph) {
  initDemoStyles(graph)
  // increase the default node size to 50x50 pixel
  graph.nodeDefaults.size = [50, 50]
}
/**
 * Creates a sample graph structure from the demo's sample data.
 * The sample graph will have edges in three different colors (i.e. red, brown, and blue)
 * and thus start out with three edge busses.
 */
function loadGraph(graph) {
  // the style to be used for red edges
  const red = newEdgeStyle()
  // the style to be used for brown edges
  const brown = newEdgeStyle()
  // the default style to be used for all edges that are neither red nor brown
  const blue = newEdgeStyle()
  // the demo's sample data
  const data = SampleData
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: data.nodes, // array of { id: string, bounds: number[] }
    id: 'id', // uses the 'id' property to uniquely identify each created node
    layout: 'bounds' // uses the 'bounds' property to determine each node's geometry
  })
  builder.createEdgesSource({
    data: data.edges, // array of { source: string, target: string, color: string }
    sourceId: 'source', // uses the 'source' property to determine the source node for each created edge
    targetId: 'target', // uses the 'target' property to determine the target node for each created edge
    style: (item) => {
      // uses the 'color' property to determine the style for each created edge
      if ('#AB2346' === item.color) {
        return red
      } else if ('#662b00' === item.color) {
        return brown
      } else {
        return blue
      }
    }
  })
  builder.buildGraph()
}
/**
 * Triggers a new layout calculation for the edges associated to the given scope.
 * @param edgesToRoute Determines which edges to route. If provided only these edges are routed,
 * otherwise all edges are routed.
 */
async function routeEdges(edgesToRoute = null) {
  // prevent concurrent layout calculations or animations
  if (layoutRunning) {
    return
  }
  layoutRunning = true
  disableUI(true)
  try {
    await routeEdgesCore(edgesToRoute)
  } finally {
    layoutRunning = false
    disableUI(false)
  }
}
/**
 * Routes the edges associated to the given scope and applies the result in an animated fashion.
 * @param edgesToRoute Determines which edges to route. If provided only these edges are routed,
 * otherwise all edges are routed.
 */
async function routeEdgesCore(edgesToRoute) {
  // configure bus structures
  const layoutData = new EdgeRouterData()
  if (edgesToRoute && edgesToRoute.length > 0) {
    // affected edges are all the edges created in the last connectNodes action
    // mark those edges for routing ...
    layoutData.scope.edges = edgesToRoute
    // ... and assign those edges to a new edge bus
    layoutData.buses.add(new EdgeRouterBusDescriptor({ multipleBackboneSegments: false })).items =
      edgesToRoute
  } else {
    // affected edges are all edges
    // assign each edge to a bus depending on the edge's color
    for (const fill of colorUtil.usedFills()) {
      layoutData.buses.add(
        new EdgeRouterBusDescriptor({ multipleBackboneSegments: false })
      ).predicate = (edge) => {
        const edgeFill = edge.style.stroke.fill
        return fill.hasSameValue(edgeFill)
      }
    }
  }
  // the algorithm used for edge routing
  const algorithm = new EdgeRouter()
  // Ensure that the LayoutExecutor class is not removed by build optimizers
  // It is needed for the 'applyLayoutAnimated' method in this demo.
  LayoutExecutor.ensure()
  // calculate the new edge routes and apply the result in an animated fashion
  await graphComponent.applyLayoutAnimated({ layout: algorithm, layoutData: layoutData })
}
/**
 * Connects all the currently selected nodes and routes the new edges.
 * All new edges will have the same color and thus will be assigned to the same edge bus.
 */
async function connectNodes() {
  // prevent previously created edges from being routed as well
  const edgesToRoute = []
  // determine the currently selected nodes
  const nodes = graphComponent.selection.nodes.toArray()
  const n = nodes.length
  if (n < 1) {
    return
  }
  // create a new style with an as-to-now unused color
  const style = newEdgeStyle()
  // connect the selected nodes; assign each new edge the new style
  for (let i = 0; i < n; ++i) {
    for (let j = i + 1; j < n; ++j) {
      edgesToRoute.push(graphComponent.graph.createEdge(nodes[i], nodes[j], style))
    }
  }
  // route the new edges and only the new edges
  await routeEdges(edgesToRoute)
}
/**
 * Creates a new edge style with an as-to-now unused color fill.
 */
function newEdgeStyle() {
  return new PolylineEdgeStyle({
    stroke: new Stroke(colorUtil.nextFill(), 2),
    // since EdgeRouter creates and works with orthogonal edge routes,
    // ensure interactive edge editing will keep edges orthogonal
    orthogonalEditing: true
  })
}
/**
 * Helper function to disable UI during layout animation
 */
function disableUI(disabled) {
  const connect = document.querySelector('#connect')
  connect.disabled = disabled
  const layout = document.querySelector('#route')
  layout.disabled = disabled
}
/**
 * Binds actions to the buttons in the toolbar.
 */
function initializeUI() {
  document.querySelector('#route').addEventListener('click', () => routeEdges())
  document.querySelector('#connect').addEventListener('click', connectNodes)
}
run().then(finishLoading)
