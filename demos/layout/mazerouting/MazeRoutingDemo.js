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
  EdgePortCandidates,
  EdgeRouter,
  EdgeRouterData,
  EdgeRouterRoutingStyle,
  FilteredGraphWrapper,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  HandleInputMode,
  IEdge,
  IGraph,
  INode,
  InputModeEventArgs,
  LayoutExecutor,
  License,
  MoveInputMode,
  PortSides,
  ShapeNodeStyle
} from '@yfiles/yfiles'

import MazeData from './resources/maze'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import { MazeVisual } from './MazeVisual'

/**
 * The graph component that displays the demo's graph.
 */
let graphComponent

/**
 * Holds whether a layout is current running.
 */
let inLayout = false

/**
 * Holds the filtered graph. The graph consists of the maze graph nodes which are the ones that
 * form the maze and the normal graph nodes. The maze nodes are visible only during the layout to
 * simulate the maze.
 */
let filteredGraph

/**
 * Starts the demo.
 */
async function run() {
  License.value = await fetchLicense()
  // initialize the GraphComponent
  graphComponent = new GraphComponent('graphComponent')

  // set some default styles
  initDemoStyles(graphComponent.graph, { theme: 'demo-palette-31' })

  // create the input mode
  createEditorInputMode()

  // create the sample graph
  createSampleGraph(graphComponent.graph)

  // create the visualization for the edge path routing obstacles
  await createMazeVisual()

  // route edges
  await routeEdges()

  // initialize undo and redo for the demo's graph
  initializeUndoEngine(graphComponent.graph)

  // wire up the UI
  initializeUI()
}

/**
 * Initializes the input mode.
 */
function createEditorInputMode() {
  const inputMode = new GraphEditorInputMode()

  // route the newly created edge
  inputMode.createEdgeInputMode.addEventListener(
    'edge-created',
    async (evt) => await routeEdges([evt.item])
  )

  // add the listeners to route the edges affected by a node movement or node resize
  inputMode.moveSelectedItemsInputMode.addEventListener('drag-finished', onDragFinished)
  inputMode.moveUnselectedItemsInputMode.addEventListener('drag-finished', onDragFinished)
  inputMode.handleInputMode.addEventListener('drag-finished', onDragFinished)

  graphComponent.inputMode = inputMode
}

/**
 * Routes the edges affected by a node movement or resize.
 */
async function onDragFinished(_evt, inputMode) {
  const affectedEdges = inputMode.affectedItems.ofType(IEdge).toArray()
  // route the affected edges
  await routeEdges(affectedEdges)
}

/**
 * Routes only the affected edges.
 * @param affectedEdges The array of edges to be routed
 * @returns A promise which resolves after the layout is applied without errors.
 */
async function routeEdges(affectedEdges) {
  // prevent starting another layout calculation
  inLayout = true
  setUIDisabled(true)

  try {
    // configure the routing style and the edge distances
    const router = new EdgeRouter({
      defaultEdgeDescriptor: {
        routingStyle: getRoutingStyle(),
        minimumEdgeDistance: getEdgeDistance()
      }
    })

    // configure the edge ports allowed to be used by the edge router
    const edgeRouterData = new EdgeRouterData()
    const allowedPorts = getAllowedPorts()
    if (allowedPorts) {
      edgeRouterData.ports.sourcePortCandidates = allowedPorts
      edgeRouterData.ports.targetPortCandidates = allowedPorts
    }

    // if there are edges marked as affected, as a result of edge creation, node movement or
    // node resize, route only them
    if (affectedEdges && affectedEdges.length > 0) {
      edgeRouterData.scope.edges = affectedEdges
    } else {
      const routingScopeElement = document.querySelector('#router-scope').value
      const selection = graphComponent.selection
      if (routingScopeElement === 'route-edges-at-selected-nodes') {
        edgeRouterData.scope.incidentNodes = selection.nodes
      } else if (routingScopeElement === 'route-selected-edges') {
        edgeRouterData.scope.edges = selection.edges
      }
    }

    // apply the layout
    const layoutExecutor = new LayoutExecutor({
      graphComponent,
      graph: graphComponent.graph.wrappedGraph,
      layout: router,
      layoutData: edgeRouterData,
      animationDuration: '0.5s'
    })
    await layoutExecutor.start()
    inLayout = false
    setUIDisabled(false)
  } catch (error) {
    inLayout = false
    setUIDisabled(false)
  }
}

/**
 * Returns the selected routing style.
 */
function getRoutingStyle() {
  const routingStyleElement = document.querySelector('#router-style').value
  return routingStyleElement === 'orthogonal'
    ? EdgeRouterRoutingStyle.ORTHOGONAL
    : EdgeRouterRoutingStyle.OCTILINEAR
}

/**
 * Checks whether the {@link EdgeRouter} should use specific ports,
 * and creates {@link EdgePortCandidates} for them.
 */
function getAllowedPorts() {
  const allowedPortsElement = document.querySelector('#router-ports').value
  if (allowedPortsElement === 'left-right') {
    return new EdgePortCandidates()
      .addFreeCandidate(PortSides.LEFT)
      .addFreeCandidate(PortSides.RIGHT)
  } else if (allowedPortsElement === 'top-bottom') {
    return new EdgePortCandidates()
      .addFreeCandidate(PortSides.TOP)
      .addFreeCandidate(PortSides.BOTTOM)
  }
  return null
}

/**
 * Returns the minimum distance between a pair of edges.
 */
function getEdgeDistance() {
  const routingDistance = document.querySelector('#router-edge-distance').value
  return parseInt(routingDistance)
}

/**
 * Enables/disables the UI elements.
 * @param disabled True if the elements should be disabled, false otherwise
 */
function setUIDisabled(disabled) {
  document.querySelector('#route-edges').disabled = disabled
  graphComponent.inputMode.waiting = disabled
}

/**
 * Enables and configures undo/redo for the given graph.
 */
function initializeUndoEngine(graph) {
  // enable the undo engine and merge undo units that occur within a specific time window
  // (e.g., 2 seconds)
  graph.undoEngineEnabled = true
  graph.undoEngine.mergeUnits = true
}

/**
 * Creates the sample graph. The graph consists of maze graph nodes which are the ones that
 * form the maze and normal graph nodes. The maze nodes are only "live" during the layout
 * calculations to serve as obstacles for edge path routing (thereby simulating the maze).
 */
function createSampleGraph(graph) {
  const mazeNodeStyle = new ShapeNodeStyle({ fill: '#242265', stroke: null })

  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: MazeData.nodes,
    id: 'id',
    layout: (data) => data,
    style: (data) => (data.maze ? mazeNodeStyle : graph.nodeDefaults.style),
    tag: (data) => ({ maze: data.maze })
  })
  builder.createEdgesSource(MazeData.edges, 'from', 'to')
  builder.buildGraph()
}

/**
 * Creates the visualization for the obstacles that affect edge path routing.
 */
async function createMazeVisual() {
  const graph = graphComponent.graph

  // determine the nodes that model the obstacles
  const mazeNodes = graph.nodes.filter((node) => node.tag.maze)
  // add the maze visualization for the obstacle nodes
  const mazeVisual = new MazeVisual(mazeNodes)
  graphComponent.renderTree.createElement(graphComponent.renderTree.backgroundGroup, mazeVisual)

  // route the edges according to the configured polylineEdgeRouter
  await routeEdges()

  // center the graph in the visible area
  await graphComponent.fitGraphBounds()

  // "hide" the obstacle nodes from the current view to prevent users from interacting with
  // the obstacles
  filteredGraph = new FilteredGraphWrapper(
    graphComponent.graph,
    (node) => inLayout || !node.tag || !node.tag.maze,
    () => true
  )
  graphComponent.graph = filteredGraph
}

/**
 * Wires up the UI.
 */
function initializeUI() {
  document.querySelector('#route-edges').addEventListener('click', async () => await routeEdges())
}

run().then(finishLoading)
