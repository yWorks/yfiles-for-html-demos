/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  ICommand,
  IEdge,
  IGraph,
  IModelItem,
  INode,
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

import MazeData from './resources/maze'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app'
import { OptionEditor } from '../../resources/demo-option-editor'
import PolylineEdgeRouterConfig from './PolylineEdgeRouterConfig'
import { applyDemoTheme, initDemoStyles } from '../../resources/demo-styles'
import { fetchLicense } from '../../resources/fetch-license'

/**
 * The graph component that displays the demo's graph.
 */
let graphComponent: GraphComponent

/**
 * Holds whether a layout is current running.
 */
let inLayout = false

/**
 * The option editor that stores the currently selected layout configuration.
 */
let optionEditor: OptionEditor

/**
 * Holds the filtered graph. The graph consists of the maze graph nodes which are the ones that
 * form the maze and the normal graph nodes. The maze nodes are visible only during the layout to
 * simulate the maze.
 */
let filteredGraph: FilteredGraphWrapper

/**
 * Starts the demo.
 */
async function run(): Promise<void> {
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
  registerCommands()

  // initialize the demo
  showApp(graphComponent)
}

/**
 * Initializes the option editor that will display the routing algorithm's settings.
 */
function initializeOptionEditor(): void {
  const editorElement = document.getElementById('data-editor') as HTMLDivElement
  optionEditor = new OptionEditor(editorElement)
  optionEditor.config = new PolylineEdgeRouterConfig()
}

/**
 * Initializes the input mode.
 */
function createEditorInputMode(): void {
  const inputMode = new GraphEditorInputMode()

  inputMode.createEdgeInputMode.addEdgeCreatedListener((sender, args) => {
    const selectedEdges = new List<IEdge>()
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
      const affectedEdges = new List<IEdge>()
      // nodes and edges are selected
      graphSelection.selectedNodes.forEach(node => {
        // add all edges connected to the selected nodes to the affected edges' list
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
    const affectedEdges = new List<IEdge>()
    const graphSelection = graphComponent.selection
    graphSelection.selectedNodes.forEach(node => {
      // add all edges connected to the selected nodes to the affected edges' list
      graphComponent.graph.edgesAt(node).forEach(edge => {
        affectedEdges.add(edge)
      })
    })
    // add bend owners to the affected edges' list
    graphSelection.selectedBends.forEach(bend => {
      affectedEdges.add(bend.owner as IEdge)
    })
    // route the affected edges
    routeAffectedEdges(affectedEdges)
  })

  graphComponent.inputMode = inputMode
}

/**
 * Enables and configures undo/redo for the given graph.
 */
function initializeUndoEngine(graph: IGraph): void {
  // enable the undo engine and merge undo units that occur within a specific time window (e.g. 2 seconds)
  graph.undoEngineEnabled = true
  graph.undoEngine!.mergeUnits = true
}

/**
 * Applies the routing algorithm.
 * @returns A promise which resolves after the layout is applied without errors.
 */
async function route(): Promise<void> {
  // prevent starting another layout calculation
  inLayout = true
  setUIDisabled(true)

  const graph = graphComponent.graph
  const layoutEdit = graph.beginEdit('layout', 'layout')

  // call to nodePredicateChanged() to insert the nodes of the maze
  filteredGraph.nodePredicateChanged()

  // don't draw maze nodes on top of the other nodes
  graph.nodes.forEach(node => {
    if (node.tag && node.tag.maze) {
      graphComponent.graphModelManager.getCanvasObject(node)!.toBack()
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
 * @returns A promise which resolves after the layout is applied without errors.
 */
async function routeAll(): Promise<void> {
  await routeImpl(null, EdgeRouterScope.ROUTE_ALL_EDGES)
}

/**
 * Routes the edges that match the routing scope from the demo's layout settings.
 * @returns A promise which resolves after the layout is applied without errors.
 */
async function routeWithSettingsScope(): Promise<void> {
  await routeImpl(null, null)
}

/**
 * Routes only the affected edges.
 * @param affectedEdges The list of edges to be routed
 * @returns A promise which resolves after the layout is applied without errors.
 */
async function routeAffectedEdges(affectedEdges: List<IEdge>): Promise<void> {
  await routeImpl(
    edge => affectedEdges.includes(edge as IEdge),
    EdgeRouterScope.ROUTE_AFFECTED_EDGES
  )
}

/**
 * Routes only the edges connected to affected nodes.
 * @param affectedNodes The list of nodes whose edges will be routed
 * @returns A promise which resolves after the layout is applied without errors.
 */
async function routeEdgesAtAffectedNodes(affectedNodes: List<INode>): Promise<void> {
  await routeImpl(
    node => affectedNodes.includes(node as INode),
    EdgeRouterScope.ROUTE_EDGES_AT_AFFECTED_NODES
  )
}

/**
 * Configures the routing algorithm for the given scope of affected edges and run the algorithm
 * for those affected edges (which may be all edges in the graph).
 * @param affectedItems A predicate determining the items for the given scope. May be null.
 * @param scope The scope determining the routing algorithm's mode of operation.
 * @returns A promise which resolves after the layout is applied without errors.
 */
async function routeImpl(
  affectedItems: ((item: IModelItem) => boolean) | null,
  scope: EdgeRouterScope | null
): Promise<void> {
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
 * @param disabled True if the elements should be disabled, false otherwise
 */
function setUIDisabled(disabled: boolean): void {
  ;(document.getElementById('route-edges-button') as HTMLButtonElement).disabled = disabled
  ;(document.getElementById('reset-button') as HTMLButtonElement).disabled = disabled
  // enable/disable input so that no use interactions occur on the graphComponent when a layout is running
  ;(graphComponent.inputMode as GraphEditorInputMode).waiting = disabled
}

/**
 * Creates the sample graph. The graph consists of maze graph nodes which are the ones that
 * form the maze and normal graph nodes. The maze nodes are only "live" during the layout
 * calculations to serve as obstacles for edge path routing (thereby simulating the maze).
 */
function createSampleGraph(graph: IGraph): void {
  const mazeNodeStyle = new ShapeNodeStyle({
    fill: '#242265',
    stroke: null
  })

  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: MazeData.nodes,
    id: 'id',
    layout: data => Rect.from(data),
    style: data => {
      if (data.maze) {
        return mazeNodeStyle
      } else {
        return null
      }
    },
    tag: data => ({ maze: data.maze })
  })
  builder.createEdgesSource(MazeData.edges, 'from', 'to')
  builder.buildGraph()

  for (const edge of graph.edges) {
    if (edge.tag.sourcePort) {
      graph.setPortLocation(edge.sourcePort!, Point.from(edge.tag.sourcePort))
      graph.setPortLocation(edge.targetPort!, Point.from(edge.tag.targetPort))
    }

    for (const bend of edge.tag.bends) {
      graph.addBend(edge, Point.from(bend))
    }
  }
}

/**
 * Creates the visualization for the obstacles that affect edge path routing.
 */
function createMazeVisual(): void {
  const graph = graphComponent.graph

  // determine the nodes that model the obstacles
  const mazeNodes = graph.nodes.filter(node => node.tag.maze)
  // add the maze visualization for the obstacle nodes
  const mazeVisual = new MazeVisual(mazeNodes)
  graphComponent.backgroundGroup.addChild(mazeVisual, ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE)

  // center the graph in the visible area
  graphComponent.fitGraphBounds()

  // "hide" the obstacle nodes from the current view to prevent users from interacting with
  // the obstacles
  filteredGraph = new FilteredGraphWrapper(
    graphComponent.graph,
    (node: INode) => inLayout || !node.tag || !node.tag.maze,
    (edge: IEdge) => true
  )
  graphComponent.graph = filteredGraph
}

/**
 * Wires up the UI.
 */
function registerCommands(): void {
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

  bindAction("button[data-command='RouteEdgesCommand']", () => routeWithSettingsScope())

  bindAction("button[data-command='ResetConfigCommand']", () => {
    optionEditor.reset()
    optionEditor.refresh()
  })
}

/**
 * This class implements the maze visualization based on the nodes that form the maze.
 */
class MazeVisual extends BaseClass<IVisualCreator>(IVisualCreator) implements IVisualCreator {
  /**
   * Creates a new instance of MazeVisual.
   */
  constructor(private readonly nodes: Iterable<INode>) {
    super()
  }

  /**
   * Creates the maze visual.
   * @param context The render context
   * @returns The maze visual
   */
  createVisual(context: IRenderContext): SvgVisual {
    const visualGroup = new SvgVisualGroup()
    for (const node of this.nodes) {
      const nodeVisual = node.style.renderer
        .getVisualCreator(node, node.style)
        .createVisual(context)
      visualGroup.add(nodeVisual as SvgVisual)
    }
    return visualGroup
  }

  /**
   * Updates the maze visual. As the maze cannot be changed in this demo, the old visual is
   * returned.
   * @param context The render context
   * @param oldVisual The old visual
   * @returns The updated visual
   */
  updateVisual(context: IRenderContext, oldVisual: SvgVisual): SvgVisual {
    return oldVisual
  }
}

// noinspection JSIgnoredPromiseFromCall
run()
