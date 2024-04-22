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
  CanvasComponent,
  GivenLayersLayerer,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicLayout,
  HierarchicLayoutData,
  IBend,
  ICanvasObjectDescriptor,
  IEdge,
  IGraph,
  IHandle,
  IInputMode,
  INode,
  LayoutMode,
  License,
  List,
  Mapper,
  MinimumNodeSizeStage,
  PortConstraint,
  Size
} from 'yfiles'

import { PortConstraintBendHandle } from './PortConstraintBendHandle'
import { LayerPositionHandler } from './LayerPositionHandler'
import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { ContextMenu } from 'demo-utils/ContextMenu'
import { LayerVisual } from './LayerVisual'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import type { JSONGraph } from 'demo-utils/json-model'
import graphData from './graph-data.json'

/**
 * Sample that interactively demonstrates the usage of {@link HierarchicLayout}.
 * This demo shows how to incrementally add nodes and edges and dynamically assign port constraints.
 * Create new nodes and observe how they are inserted into the drawing near the place they have been created.
 * Create new edges and watch the routings being calculated immediately.
 * Drag the first and last bend of an edge to interactively assign or reset port constraints.
 * Use the context menu to reroute selected edges or optimize selected nodes locations.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  graph = graphComponent.graph

  layerVisual = new LayerVisual()
  newLayerMapper = new Mapper()
  incrementalNodes = new List()
  incrementalEdges = new List()

  // initialize the input mode
  initializeInputModes()
  // initialize the graph
  initializeGraph()

  // then build the graph with the given data set
  buildGraph(graphComponent.graph, graphData)

  // calculate the initial layout
  graph.applyLayout(
    new HierarchicLayout({
      orthogonalRouting: true,
      recursiveGroupLayering: false
    }),
    new HierarchicLayoutData({
      layerIndices: layerMapper
    })
  )

  // and update the layer visualization
  layerVisual.updateLayers(graph, layerMapper)

  graphComponent.fitGraphBounds()

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true
}

/**
 * Iterates through the given data set and creates nodes and edges according to the given data.
 */
function buildGraph(graph: IGraph, graphData: JSONGraph): void {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder.createNodesSource({
    data: graphData.nodeList,
    id: (item) => item.id
  })

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })

  graphBuilder.buildGraph()
}

let graphComponent: GraphComponent

let graph: IGraph

/**
 * Calls {@link createEditorMode} and registers the result as the {@link CanvasComponent.inputMode}.
 */
function initializeInputModes(): void {
  // create the interaction mode
  graphComponent.inputMode = createEditorMode()

  // display the layers
  graphComponent.backgroundGroup.addChild(
    layerVisual,
    ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
  )
}

/**
 * Creates the default input mode for the {@link GraphComponent} a
 * {@link GraphEditorInputMode}.
 * @returns a specialized GraphEditorInputMode instance
 */
function createEditorMode(): IInputMode {
  const mode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })
  // creating bends does not make sense because the routing is calculated
  // immediately after the creation.
  mode.createEdgeInputMode.allowCreateBend = false

  // register hooks whenever something is dragged or resized
  mode.handleInputMode.addDragFinishedListener(() => {
    void updateLayout()
  })
  mode.moveInputMode.addDragFinishedListener(() => {
    void updateLayout()
  })
  // ... and when new nodes are created interactively
  mode.addNodeCreatedListener((_, evt) => {
    const newLayer = layerVisual.getLayer(evt.item.layout.center)
    newLayerMapper.set(evt.item, newLayer)
    void updateLayout()
  })
  // ... or edges
  mode.createEdgeInputMode.addEdgeCreatedListener((_, evt) => {
    incrementalEdges.add(evt.item)
    void updateLayout()
  })

  // Create a context menu. In this demo, we use our sample context menu implementation, but you can use any other
  // context menu widget as well. See the Context Menu demo for more details about working with context menus.
  const contextMenu = new ContextMenu(graphComponent)

  // Add event listeners to the various events that open the context menu. These listeners then
  // call the provided callback function which in turn asks the current ContextMenuInputMode if a
  // context menu should be shown at the current location.
  contextMenu.addOpeningEventListeners(graphComponent, (location) => {
    if (mode.contextMenuInputMode.shouldOpenMenu(graphComponent.toWorldFromPage(location))) {
      contextMenu.show(location)
    }
  })

  // Add an event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  // This PopulateItemContextMenu is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
  mode.addPopulateItemContextMenuListener((_, evt) => {
    contextMenu.clearItems()
    // see if it's a node but not a not empty group node
    const item = evt.item
    if (item instanceof INode && !graph.isGroupNode(item)) {
      // see if it's already selected
      const selectedNodes = graphComponent.selection.selectedNodes
      if (!selectedNodes.isSelected(item)) {
        // no - make it the only selected node
        selectedNodes.clear()
      }
      // make sure the node is selected
      selectedNodes.setSelected(item, true)
      graphComponent.currentItem = item
      // mark all selected nodes for incremental layout
      contextMenu.addMenuItem('Reinsert Incrementally', () => {
        incrementalNodes.addRange(selectedNodes)
        void updateLayout()
      })
      evt.handled = true
    }
    // if it's an edge...
    if (item instanceof IEdge) {
      // update selection state
      const selectedEdges = graphComponent.selection.selectedEdges
      if (!selectedEdges.isSelected(item)) {
        selectedEdges.clear()
      }
      selectedEdges.setSelected(item, true)
      graphComponent.currentItem = item
      // and offer option to reroute selected edges
      contextMenu.addMenuItem('Reroute', () => {
        incrementalEdges.addRange(selectedEdges)
        void updateLayout()
      })
      evt.handled = true
    }
  })

  // Add a listener that closes the menu when the input mode requests this
  mode.contextMenuInputMode.addCloseMenuListener(() => {
    contextMenu.close()
  })

  // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
  contextMenu.onClosedCallback = (): void => {
    mode.contextMenuInputMode.menuClosed()
  }
  return mode
}

/**
 * Core method that recalculates and updates the layout.
 */
async function updateLayout() {
  // make sure we are not re-entrant
  if (layouting) {
    return
  }
  layouting = true
  // disable the input mode during the layout calculation
  ;(graphComponent.inputMode as GraphEditorInputMode).enabled = false

  // update the layers for moved nodes
  updateMovedNodes()

  const layout = new HierarchicLayout({
    orthogonalRouting: true,
    recursiveGroupLayering: false,
    fixedElementsLayerer: new GivenLayersLayerer(),
    layoutMode: LayoutMode.INCREMENTAL
  })
  // we need to add hints for incremental nodes and edges, so create a mapper that holds the hints
  const hintMapper = new Mapper()
  // and a factory for the hints
  const hintsFactory = layout.createIncrementalHintsFactory()
  // now mark incremental nodes with the corresponding hints
  incrementalNodes.forEach((incrementalNode) => {
    hintMapper.set(incrementalNode, hintsFactory.createLayerIncrementallyHint(incrementalNode))
  })
  // and forget the nodes for the next run
  incrementalNodes.clear()

  // the same for edges
  incrementalEdges.forEach((incrementalEdge) => {
    hintMapper.set(incrementalEdge, hintsFactory.createSequenceIncrementallyHint(incrementalEdge))
  })
  // reset...
  incrementalEdges.clear()

  const layoutData = new HierarchicLayoutData({
    incrementalHints: hintMapper,
    givenLayersLayererIds: layerMapper,
    layerIndices: layerMapper,
    sourcePortConstraints: sourcePortConstraints,
    targetPortConstraints: targetPortConstraints
  })

  // apply the layout
  try {
    await graphComponent.morphLayout(new MinimumNodeSizeStage(layout), '1s', layoutData)
    layerVisual.updateLayers(graph, layerMapper)
  } finally {
    layouting = false
    ;(graphComponent.inputMode as GraphEditorInputMode).enabled = true
  }
}

/**
 * Updates the layers for moved nodes.
 */
function updateMovedNodes(): void {
  if (newLayerMapper.entries.some()) {
    // spread out existing layers
    graph.nodes.forEach((node) => {
      layerMapper.set(node, layerMapper.get(node)! * 2)
    })
    newLayerMapper.entries.forEach((pair) => {
      const node = pair.key
      // if a node has been moved, reinsert the adjacent edges incrementally and not from sketch
      incrementalEdges.addRange(graph.edgesAt(node))
      const newLayerIndex = pair.value
      if (newLayerIndex === Number.MAX_SAFE_INTEGER) {
        // the node has been dragged outside - mark it as incremental
        incrementalNodes.add(node)
      } else if (newLayerIndex < 0) {
        const beforeLayer = -(newLayerIndex + 1)
        layerMapper.set(node, beforeLayer * 2 - 1)
      } else {
        layerMapper.set(node, newLayerIndex * 2)
      }
    })
    newLayerMapper.clear()
  }
}

/**
 * Initializes the graph instance setting default styles
 * and creating a small sample graph.
 */
function initializeGraph(): void {
  graph.nodeDefaults.size = new Size(60, 30)

  // set some nice defaults
  initDemoStyles(graph, { theme: 'demo-palette-21' })

  // create mappers for the layers
  layerMapper = new Mapper<INode, number>()
  // and the port constraints
  sourcePortConstraints = new Mapper<IEdge, PortConstraint>()
  targetPortConstraints = new Mapper<IEdge, PortConstraint>()

  // register a custom PositionHandler for the nodes.
  // this enables interactive layer reassignment with layer preview
  graph.decorator.nodeDecorator.positionHandlerDecorator.setImplementationWrapper(
    (node) => !graph.groupingSupport.hasGroupNodes() || !graph.isGroupNode(node),
    (node, positionHandler) =>
      new LayerPositionHandler(positionHandler!, layerVisual, node!, newLayerMapper)
  )

  // register custom handles for the first and last bends of an edge
  // this enables interactive port constraint assignment.
  graph.decorator.bendDecorator.handleDecorator.setImplementationWrapper(
    (bend) =>
      bend.owner!.bends.get(0) === bend ||
      bend.owner!.bends.get(bend.owner!.bends.size - 1) === bend,
    createBendHandle
  )
}

/**
 * Callback that creates the bend IHandle for the first and last bends.
 * @param bend The bend.
 * @param baseHandle The original implementation to delegate to.
 * @returns The new handle that allows for interactively assign the port constraints.
 */
function createBendHandle(bend: IBend | null, baseHandle: IHandle | null): IHandle | null {
  if (bend!.owner!.bends.get(0) === bend) {
    // decorate first bend
    baseHandle = new PortConstraintBendHandle(baseHandle!, true, bend, sourcePortConstraints)
  }
  if (bend!.owner!.bends.get(bend!.owner!.bends.size - 1) === bend) {
    // decorate last bend - could be both first and last
    baseHandle = new PortConstraintBendHandle(baseHandle!, false, bend, targetPortConstraints)
  }
  return baseHandle
}

/**
 * Visualizes the layers and manages layer regions and contains tests.
 */
let layerVisual: LayerVisual

/**
 * holds for each node the layer
 */
let layerMapper: Mapper<INode, number>

/**
 * whether a layout is currently running
 */
let layouting = false

/**
 * holds temporary layer reassignments that will be assigned during the next layout
 */
let newLayerMapper: Mapper<INode, number>

/**
 * holds for each edge a port constraint for the source end
 */
let sourcePortConstraints: Mapper<IEdge, PortConstraint>

/**
 * holds for each edge a port constraint for the target end
 */
let targetPortConstraints: Mapper<IEdge, PortConstraint>

/**
 * holds a list of nodes to insert incrementally during the next layout
 */
let incrementalNodes: List<INode>

/**
 * holds a list of edges to reroute incrementally during the next layout
 */
let incrementalEdges: List<IEdge>

run().then(finishLoading)
