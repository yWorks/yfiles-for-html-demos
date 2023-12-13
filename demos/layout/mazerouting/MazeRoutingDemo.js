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
  BaseClass,
  EdgeRouterScope,
  FilteredGraphWrapper,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  ICanvasObjectDescriptor,
  IEdge,
  IGraph,
  IModelItem,
  INode,
  IRenderContext,
  IVisualCreator,
  License,
  List,
  Point,
  ShapeNodeStyle,
  SvgVisual,
  SvgVisualGroup
} from 'yfiles'

import MazeData from './resources/maze.js'
import { OptionEditor } from 'demo-resources/demo-option-editor'
import PolylineEdgeRouterConfig from './PolylineEdgeRouterConfig.js'
import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

/**
 * The graph component that displays the demo's graph.
 * @type {GraphComponent}
 */
let graphComponent

/**
 * Holds whether a layout is current running.
 * @type {boolean}
 */
let inLayout = false

/**
 * The option editor that stores the currently selected layout configuration.
 * @type {OptionEditor}
 */
let optionEditor

/**
 * Holds the filtered graph. The graph consists of the maze graph nodes which are the ones that
 * form the maze and the normal graph nodes. The maze nodes are visible only during the layout to
 * simulate the maze.
 * @type {FilteredGraphWrapper}
 */
let filteredGraph

/**
 * Starts the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  // initialize the GraphComponent
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  // initialize the option editor
  initializeOptionEditor()

  // set some default styles
  initDemoStyles(graphComponent.graph, { theme: 'demo-palette-31' })

  // create the input mode
  createEditorInputMode()

  // create the sample graph
  createSampleGraph(graphComponent.graph)

  // create the visualization for the edge path routing obstacles
  createMazeVisual()

  // route all edges
  await routeAll()

  // initialize undo and redo for the demo's graph
  initializeUndoEngine(graphComponent.graph)

  // wire up the UI
  initializeUI()
}

/**
 * Initializes the option editor that will display the routing algorithm's settings.
 */
function initializeOptionEditor() {
  const editorElement = document.querySelector('#data-editor')
  optionEditor = new OptionEditor(editorElement)
  optionEditor.config = new PolylineEdgeRouterConfig()
}

/**
 * Initializes the input mode.
 */
function createEditorInputMode() {
  const inputMode = new GraphEditorInputMode()

  inputMode.createEdgeInputMode.addEdgeCreatedListener((_, evt) => {
    const selectedEdges = new List()
    selectedEdges.add(evt.item)
    routeAffectedEdges(selectedEdges)
  })

  inputMode.moveInputMode.addDragFinishedListener(() => {
    const graphSelection = graphComponent.selection
    if (graphSelection.size === graphSelection.selectedNodes.size) {
      // only nodes are selected
      routeEdgesAtAffectedNodes(graphSelection.selectedNodes.toList())
    } else if (graphSelection.size === graphSelection.selectedEdges.size) {
      // only edges are selected
      routeAffectedEdges(graphSelection.selectedEdges.toList())
    } else {
      const affectedEdges = new List()
      // nodes and edges are selected
      graphSelection.selectedNodes.forEach((node) => {
        // add all edges connected to the selected nodes to the affected edges' list
        graphComponent.graph.edgesAt(node).forEach((edge) => {
          affectedEdges.add(edge)
        })
      })
      // add all selected edges to the affected edges' list
      graphSelection.selectedEdges.forEach((edge) => {
        affectedEdges.add(edge)
      })
      // route the affected edges
      routeAffectedEdges(affectedEdges)
    }
  })

  inputMode.handleInputMode.addDragFinishedListener(() => {
    const affectedEdges = new List()
    const graphSelection = graphComponent.selection
    graphSelection.selectedNodes.forEach((node) => {
      // add all edges connected to the selected nodes to the affected edges' list
      graphComponent.graph.edgesAt(node).forEach((edge) => {
        affectedEdges.add(edge)
      })
    })
    // add bend owners to the affected edges' list
    graphSelection.selectedBends.forEach((bend) => {
      affectedEdges.add(bend.owner)
    })
    // route the affected edges
    routeAffectedEdges(affectedEdges)
  })

  graphComponent.inputMode = inputMode
}

/**
 * Enables and configures undo/redo for the given graph.
 * @param {!IGraph} graph
 */
function initializeUndoEngine(graph) {
  // enable the undo engine and merge undo units that occur within a specific time window (e.g. 2 seconds)
  graph.undoEngineEnabled = true
  graph.undoEngine.mergeUnits = true
}

/**
 * Applies the routing algorithm.
 * @returns {!Promise} A promise which resolves after the layout is applied without errors.
 */
async function route() {
  // prevent starting another layout calculation
  inLayout = true
  setUIDisabled(true)

  const graph = graphComponent.graph
  const layoutEdit = graph.beginEdit('layout', 'layout')

  // call to nodePredicateChanged() to insert the nodes of the maze
  filteredGraph.nodePredicateChanged()

  // don't draw maze nodes on top of the other nodes
  graph.nodes.forEach((node) => {
    if (node.tag && node.tag.maze) {
      graphComponent.graphModelManager.getCanvasObject(node).toBack()
    }
  })

  try {
    const config = optionEditor.config
    await config.apply(graphComponent)

    inLayout = false
    // call to nodePredicateChanged() to remove the nodes of the maze
    filteredGraph.nodePredicateChanged()
    layoutEdit.commit()
    setUIDisabled(false)
  } catch (error) {
    inLayout = false
    layoutEdit.cancel()
    // call to nodePredicateChanged() to remove the nodes of the maze
    filteredGraph.nodePredicateChanged()
    setUIDisabled(false)
  }
}

/**
 * Routes all edges in the demo's graph.
 * @returns {!Promise} A promise which resolves after the layout is applied without errors.
 */
async function routeAll() {
  await routeImpl(null, EdgeRouterScope.ROUTE_ALL_EDGES)
}

/**
 * Routes the edges that match the routing scope from the demo's layout settings.
 * @returns {!Promise} A promise which resolves after the layout is applied without errors.
 */
async function routeWithSettingsScope() {
  await routeImpl(null, null)
}

/**
 * Routes only the affected edges.
 * @param {!List.<IEdge>} affectedEdges The list of edges to be routed
 * @returns {!Promise} A promise which resolves after the layout is applied without errors.
 */
async function routeAffectedEdges(affectedEdges) {
  await routeImpl((edge) => affectedEdges.includes(edge), EdgeRouterScope.ROUTE_AFFECTED_EDGES)
}

/**
 * Routes only the edges connected to affected nodes.
 * @param {!List.<INode>} affectedNodes The list of nodes whose edges will be routed
 * @returns {!Promise} A promise which resolves after the layout is applied without errors.
 */
async function routeEdgesAtAffectedNodes(affectedNodes) {
  await routeImpl(
    (node) => affectedNodes.includes(node),
    EdgeRouterScope.ROUTE_EDGES_AT_AFFECTED_NODES
  )
}

/**
 * Configures the routing algorithm for the given scope of affected edges and run the algorithm
 * for those affected edges (which may be all edges in the graph).
 * @param {?function} affectedItems A predicate determining the items for the given scope. May be null.
 * @param {?EdgeRouterScope} scope The scope determining the routing algorithm's mode of operation.
 * @returns {!Promise} A promise which resolves after the layout is applied without errors.
 */
async function routeImpl(affectedItems, scope) {
  if (inLayout) {
    return Promise.reject(new Error('Edge routing already in progress'))
  }
  const config = optionEditor.config
  const oldScope = config.scopeItem
  if (scope !== null) {
    config.scopeItem = scope
  }
  config.$affectedItems = affectedItems
  try {
    await route()
  } catch (ignored) {
    // ignore
  } finally {
    config.$affectedItems = null
    config.scopeItem = oldScope
  }
}

/**
 * Enables/disables the UI elements.
 * @param {boolean} disabled True if the elements should be disabled, false otherwise
 */
function setUIDisabled(disabled) {
  document.querySelector('#route-edges-button').disabled = disabled
  document.querySelector('#reset-button').disabled = disabled
  // enable/disable input so that no use interactions occur on the graphComponent when a layout is running
  graphComponent.inputMode.waiting = disabled
}

/**
 * Creates the sample graph. The graph consists of maze graph nodes which are the ones that
 * form the maze and normal graph nodes. The maze nodes are only "live" during the layout
 * calculations to serve as obstacles for edge path routing (thereby simulating the maze).
 * @param {!IGraph} graph
 */
function createSampleGraph(graph) {
  const mazeNodeStyle = new ShapeNodeStyle({
    fill: '#242265',
    stroke: null
  })

  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: MazeData.nodes,
    id: 'id',
    layout: (data) => data,
    style: (data) => {
      if (data.maze) {
        return mazeNodeStyle
      } else {
        return null
      }
    },
    tag: (data) => ({ maze: data.maze })
  })
  builder.createEdgesSource(MazeData.edges, 'from', 'to')
  builder.buildGraph()

  for (const edge of graph.edges) {
    if (edge.tag.sourcePort) {
      graph.setPortLocation(edge.sourcePort, Point.from(edge.tag.sourcePort))
      graph.setPortLocation(edge.targetPort, Point.from(edge.tag.targetPort))
    }

    for (const bend of edge.tag.bends) {
      graph.addBend(edge, bend)
    }
  }
}

/**
 * Creates the visualization for the obstacles that affect edge path routing.
 */
function createMazeVisual() {
  const graph = graphComponent.graph

  // determine the nodes that model the obstacles
  const mazeNodes = graph.nodes.filter((node) => node.tag.maze)
  // add the maze visualization for the obstacle nodes
  const mazeVisual = new MazeVisual(mazeNodes)
  graphComponent.backgroundGroup.addChild(mazeVisual, ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE)

  // center the graph in the visible area
  graphComponent.fitGraphBounds()

  // "hide" the obstacle nodes from the current view to prevent users from interacting with
  // the obstacles
  filteredGraph = new FilteredGraphWrapper(
    graphComponent.graph,
    (node) => inLayout || !node.tag || !node.tag.maze,
    (edge) => true
  )
  graphComponent.graph = filteredGraph
}

/**
 * Wires up the UI.
 */
function initializeUI() {
  document
    .querySelector('#route-edges-button')
    .addEventListener('click', () => routeWithSettingsScope())

  document.querySelector('#reset-button').addEventListener('click', () => {
    optionEditor.reset()
    optionEditor.refresh()
  })
}

/**
 * This class implements the maze visualization based on the nodes that form the maze.
 */
class MazeVisual extends BaseClass(IVisualCreator) {
  /**
   * Creates a new instance of MazeVisual.
   * @param {!Iterable.<INode>} nodes
   */
  constructor(nodes) {
    super()
    this.nodes = nodes
  }

  /**
   * Creates the maze visual.
   * @param {!IRenderContext} context The render context
   * @returns {!SvgVisual} The maze visual
   */
  createVisual(context) {
    const visualGroup = new SvgVisualGroup()
    for (const node of this.nodes) {
      const nodeVisual = node.style.renderer
        .getVisualCreator(node, node.style)
        .createVisual(context)
      visualGroup.add(nodeVisual)
    }
    return visualGroup
  }

  /**
   * Updates the maze visual. As the maze cannot be changed in this demo, the old visual is
   * returned.
   * @param {!IRenderContext} context The render context
   * @param {!SvgVisual} oldVisual The old visual
   * @returns {!SvgVisual} The updated visual
   */
  updateVisual(context, oldVisual) {
    return oldVisual
  }
}

run().then(finishLoading)
