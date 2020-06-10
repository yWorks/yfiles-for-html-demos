/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ICommand,
  IRenderContext,
  IVisualCreator,
  License,
  List,
  Point,
  Rect,
  ShapeNodeStyle,
  SvgVisual,
  SvgVisualGroup
} from 'yfiles'

import MazeData from './resources/maze.js'
import { initDemoStyles } from '../../resources/demo-styles.js'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import { OptionEditor } from '../../resources/demo-option-editor.js'
import loadJson from '../../resources/load-json.js'
import { PolylineEdgeRouterConfig } from './PolylineEdgeRouterConfig.js'

/**
 * The GraphComponent.
 * @type {GraphComponent}
 */
let graphComponent = null

/**
 * Holds whether a layout is current running.
 * @type {boolean}
 */
let inLayout = false

/**
 * The option editor that stores the currently selected layout configuration.
 * @type {OptionEditor}
 */
let optionEditor = null

/**
 * Holds the filtered graph. The graph consists of the maze graph nodes which are the ones that
 * form the maze and the normal graph nodes. The maze nodes are visible only during the layout to
 * simulate the maze.
 * @type {FilteredGraphWrapper}
 */
let filteredGraph = null

/**
 * Starts the demo.
 */
function run(licenseData) {
  License.value = licenseData
  // initialize the GraphComponent
  graphComponent = new GraphComponent('graphComponent')

  // initialize the side option editor
  initializeOptionEditor()

  // initialize the graph
  initializeGraph()

  // create the input mode
  createEditorInputMode()

  // create the sample graph
  createSampleGraph()

  // wire up the UI
  registerCommands()

  // initialize the demo
  showApp(graphComponent)
}

/**
 * Initializes the side option editor that will display the routing algorithms settings.
 */
function initializeOptionEditor() {
  const editorElement = window.document.getElementById('data-editor')
  optionEditor = new OptionEditor(editorElement)
  optionEditor.config = new PolylineEdgeRouterConfig()
}

/**
 * Initializes the graph instance and sets the default styles.
 */
function initializeGraph() {
  const graph = graphComponent.graph
  // enable the undo engine and merge undo units that occur within a specific time window (e.g. 2 seconds)
  graph.undoEngineEnabled = true
  graph.undoEngine.mergeUnits = true

  // set some defaults styles
  initDemoStyles(graph)
}

/**
 * Initializes the input mode.
 */
function createEditorInputMode() {
  const inputMode = new GraphEditorInputMode()

  inputMode.createEdgeInputMode.addEdgeCreatedListener((sender, args) => {
    const selectedEdges = new List()
    selectedEdges.add(args.item)
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
      graphSelection.selectedNodes.forEach(node => {
        // add all edges adjacent to the selected nodes to the affected edges' list
        graphComponent.graph.edgesAt(node).forEach(edge => {
          affectedEdges.add(edge)
        })
      })
      // add all selected edges to the affected edges' list
      graphSelection.selectedEdges.forEach(edge => {
        affectedEdges.add(edge)
      })
      // route the affected edges
      routeAffectedEdges(affectedEdges)
    }
  })

  inputMode.handleInputMode.addDragFinishedListener(() => {
    const affectedEdges = new List()
    const graphSelection = graphComponent.selection
    graphSelection.selectedNodes.forEach(node => {
      // add all edges adjacent to the selected nodes to the affected edges' list
      graphComponent.graph.edgesAt(node).forEach(edge => {
        affectedEdges.add(edge)
      })
    })
    // add bend owners to the affected edges' list
    graphSelection.selectedBends.forEach(bend => {
      affectedEdges.add(bend.owner)
    })
    // route the affected edges
    routeAffectedEdges(affectedEdges)
  })

  graphComponent.inputMode = inputMode
}

/**
 * Wires up the UI.
 */
function registerCommands() {
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)
  bindCommand("button[data-command='Delete']", ICommand.DELETE, graphComponent)

  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)

  bindAction("button[data-command='RouteEdgesCommand']", routeAll)

  bindAction("button[data-command='ResetConfigCommand']", () => {
    optionEditor.config = new PolylineEdgeRouterConfig()
  })
}

/**
 * Applies the routing algorithm.
 * @param {boolean} clearUndo True if the undo engine should be cleared, false otherwise
 * @return {Promise} A promise which resolves after the layout is applied without errors.
 */
async function route(clearUndo) {
  const config = optionEditor.config
  const graph = graphComponent.graph
  // prevent starting another layout calculation
  inLayout = true
  setUIDisabled(true)
  const layoutEdit = graph.beginEdit('layout', 'layout')

  // call to nodePredicateChanged() to insert the nodes of the maze
  filteredGraph.nodePredicateChanged()
  // don't draw maze nodes on top of the other nodes
  graph.nodes.forEach(node => {
    if (node.tag && node.tag.maze) {
      graphComponent.graphModelManager.getCanvasObject(node).toBack()
    }
  })

  try {
    const result = await config.apply(graphComponent)
    inLayout = false
    // call to nodePredicateChanged() to remove the nodes of the maze
    filteredGraph.nodePredicateChanged()
    layoutEdit.commit()
    if (clearUndo) {
      graph.undoEngine.clear()
    }
    setUIDisabled(false)
    return result
  } catch (ignored) {
    layoutEdit.cancel()
    if (clearUndo) {
      graph.undoEngine.clear()
    }
  }
}

/**
 * Routes all graph edges.
 * @param {boolean} clearUndo True if the undo engine should be cleared, false otherwise
 * @return {Promise} A promise which resolves after the layout is applied without errors.
 */
function routeAll(clearUndo) {
  if (inLayout) {
    return Promise.reject(new Error('Edge routing already in progress'))
  }
  // configure the routing algorithm
  optionEditor.config.createConfiguredLayout(graphComponent)
  return route(clearUndo)
}

/**
 * Routes only the affected edges.
 * @param {List} affectedEdges The list of edges to be routed
 * @return {Promise} A promise which resolves after the layout is applied without errors.
 */
async function routeAffectedEdges(affectedEdges) {
  if (inLayout) {
    return Promise.reject(new Error('Edge routing already in progress'))
  }
  const config = optionEditor.config
  const oldScope = config.scopeItem
  config.scopeItem = EdgeRouterScope.ROUTE_AFFECTED_EDGES
  const layoutData = config.createConfiguration(graphComponent)
  // overwrite the default implementation that uses only the selected edges
  layoutData.affectedEdges = edge => affectedEdges.includes(edge)
  try {
    await route(false)
  } catch (e) {}
  config.scopeItem = oldScope
}

/**
 * Routes only the edges adjacent to affected nodes.
 * @param {List} affectedNodes The list of nodes whose edges will be routed
 * @return {Promise} A promise which resolves after the layout is applied without errors.
 */
async function routeEdgesAtAffectedNodes(affectedNodes) {
  if (inLayout) {
    return Promise.reject(new Error('Edge routing already in progress'))
  }
  const config = optionEditor.config
  const oldScope = config.scopeItem
  config.scopeItem = EdgeRouterScope.ROUTE_EDGES_AT_AFFECTED_NODES
  const layoutData = config.createConfiguration(graphComponent)
  // overwrite the default implementation that routes the edges only from the selected nodes
  layoutData.affectedEdges = node => affectedNodes.includes(node)
  try {
    await route(false)
  } catch (e) {}
  config.scopeItem = oldScope
}

/**
 * Enables/disables the UI elements.
 * @param {boolean} disabled True if the elements should be disabled, false otherwise
 */
function setUIDisabled(disabled) {
  document.getElementById('route-edges-button').disabled = disabled
  document.getElementById('reset-button').disabled = disabled
  // enable/disable input so that no use interactions occur on the graphComponent when a layout is running
  graphComponent.inputMode.waiting = disabled
}

/**
 * Creates the sample graph. The graph consists of the maze graph nodes which are the ones that
 * form the maze and the normal graph nodes. The maze nodes are visible only during the layout to
 * simulate the maze.
 */
function createSampleGraph() {
  const mazeNodeStyle = new ShapeNodeStyle({
    fill: 'rgb(102, 153, 204)',
    stroke: null
  })

  const builder = new GraphBuilder(graphComponent.graph)
  builder.createNodesSource({
    data: MazeData.nodes,
    id: 'id',
    layout: data => Rect.from(data),
    style: data => {
      if (data.maze) {
        return mazeNodeStyle
      }
    },
    tag: data => ({ maze: data.maze })
  })
  builder.createEdgesSource(MazeData.edges, 'from', 'to')
  const graph = builder.buildGraph()

  graph.edges.forEach(edge => {
    if (edge.tag.sourcePort) {
      graph.setPortLocation(edge.sourcePort, Point.from(edge.tag.sourcePort))
      graph.setPortLocation(edge.targetPort, Point.from(edge.tag.targetPort))
    }

    const bends = edge.tag.bends
    bends.forEach(bend => {
      graph.addBend(edge, Point.from(bend))
    })
  })

  // adds the maze visual
  const mazeNodes = graph.nodes.filter(node => node.tag.maze)
  const mazeVisual = new MazeVisual(mazeNodes)
  graphComponent.backgroundGroup.addChild(mazeVisual, ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE)

  graphComponent.fitGraphBounds()

  filteredGraph = new FilteredGraphWrapper(
    graphComponent.graph,
    node => inLayout || !node.tag || !node.tag.maze,
    edge => true
  )
  graphComponent.graph = filteredGraph

  // route all edges and clear the undo engine
  routeAll(true)
}

/**
 * This class implements the Maze Visual based on the nodes that form the maze.
 */
class MazeVisual extends BaseClass(IVisualCreator) {
  /**
   * Creates a new instance of MazeVisual.
   * @param {Array} nodes
   */
  constructor(nodes) {
    super()
    this.nodes = nodes
  }

  /**
   * Creates the maze visual.
   * @param {IRenderContext} context The render context
   * @return {SvgVisual} The maze visual
   */
  createVisual(context) {
    const visualGroup = new SvgVisualGroup()
    this.nodes.forEach(node => {
      const nodeVisual = node.style.renderer
        .getVisualCreator(node, node.style)
        .createVisual(context)
      visualGroup.add(nodeVisual)
    })
    return visualGroup
  }

  /**
   * Updates the maze visual. As the maze cannot be changed in this demo, the old visual is
   * returned.
   * @param {IRenderContext} context The render context
   * @param {SvgVisual} oldVisual The old visual
   * @return {SvgVisual} The updated visual
   */
  updateVisual(context, oldVisual) {
    return oldVisual
  }
}

// runs the demo
loadJson().then(run)
