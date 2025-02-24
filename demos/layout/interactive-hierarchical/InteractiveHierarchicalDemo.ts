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
  CanvasComponent,
  EdgePortCandidates,
  GivenLayersAssigner,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicalLayout,
  HierarchicalLayoutData,
  IBend,
  IEdge,
  IGraph,
  IHandle,
  IInputMode,
  type IMapper,
  INode,
  LayoutExecutor,
  License,
  List,
  Mapper,
  Size
} from '@yfiles/yfiles'

import { PortCandidateBendHandle } from './PortCandidateBendHandle'
import { LayerPositionHandler } from './LayerPositionHandler'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { LayerVisual } from './LayerVisual'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import type { JSONGraph } from '@yfiles/demo-utils/json-model'
import graphData from './graph-data.json'

/**
 * Sample that interactively demonstrates the usage of {@link HierarchicalLayout}.
 * This demo shows how to incrementally add nodes and edges and dynamically assign port candidates.
 * Create new nodes and observe how they are inserted into the drawing near the place they have been created.
 * Create new edges and watch the routes being calculated immediately.
 * Drag the first and last bend of an edge to interactively assign or reset port candidates.
 * Use the context menu to reroute selected edges or optimize selected nodes locations.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
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
  const hierarchicalLayout = new HierarchicalLayout({
    groupLayeringPolicy: 'ignore-groups'
  })
  const layoutData = new HierarchicalLayoutData()
  graphComponent.graph.applyLayout(hierarchicalLayout, layoutData)

  // and update the layer visualization
  layerMapper = layoutData.layerIndicesResult
  layerVisual.updateLayers(graphComponent.graph, layerMapper)

  await graphComponent.fitGraphBounds()

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

/**
 * Calls {@link createEditorMode} and registers the result as the {@link CanvasComponent.inputMode}.
 */
function initializeInputModes(): void {
  // create the interaction mode
  graphComponent.inputMode = createEditorMode()

  // display the layers
  graphComponent.renderTree.createElement(graphComponent.renderTree.backgroundGroup, layerVisual)
}

/**
 * Creates the default input mode for the {@link GraphComponent} a
 * {@link GraphEditorInputMode}.
 * @returns a specialized GraphEditorInputMode instance
 */
function createEditorMode(): IInputMode {
  const mode = new GraphEditorInputMode()
  // creating bends does not make sense because the routing is calculated
  // immediately after the creation.
  mode.createEdgeInputMode.allowCreateBend = false

  // register hooks whenever something is dragged or resized
  mode.handleInputMode.addEventListener('drag-finished', () => void updateLayout())
  mode.moveSelectedItemsInputMode.addEventListener('drag-finished', () => void updateLayout())
  mode.moveUnselectedItemsInputMode.addEventListener('drag-finished', () => void updateLayout())
  // ... and when new nodes are created interactively
  mode.addEventListener('node-created', (evt) => {
    const node = evt.item
    const newLayer = layerVisual.getLayer(node.layout.center)
    newLayerMapper.set(node, newLayer)
    void updateLayout()
  })
  // ... or edges
  mode.createEdgeInputMode.addEventListener('edge-created', (evt) => {
    incrementalEdges.add(evt.item)
    void updateLayout()
  })

  // Add an event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  mode.addEventListener('populate-item-context-menu', (evt) => {
    // see if it's a node but not a not empty group node
    const item = evt.item
    if (item instanceof INode && !evt.context.graph!.isGroupNode(item)) {
      // see if it's already selected
      const selectedNodes = graphComponent.selection.nodes
      if (!selectedNodes.includes(item)) {
        // no - make it the only selected node
        selectedNodes.clear()
      }
      // make sure the node is selected
      selectedNodes.add(item)
      graphComponent.currentItem = item
      // mark all selected nodes for incremental layout
      evt.contextMenu = [
        {
          label: 'Reinsert Incrementally',
          action: () => {
            incrementalNodes.addRange(selectedNodes)
            void updateLayout()
          }
        }
      ]
      evt.handled = true
    }
    // if it's an edge...
    if (item instanceof IEdge) {
      // update selection state
      const selectedEdges = graphComponent.selection.edges
      if (!selectedEdges.includes(item)) {
        selectedEdges.clear()
      }
      selectedEdges.add(item)
      graphComponent.currentItem = item
      // and offer option to reroute selected edges
      evt.contextMenu = [
        {
          label: 'Reroute',
          action: () => {
            incrementalEdges.addRange(selectedEdges)
            void updateLayout()
          }
        }
      ]
    }
  })

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

  const layout = new HierarchicalLayout({
    groupLayeringPolicy: 'ignore-groups',
    fromSketchMode: true,
    core: {
      fixedElementsLayerAssigner: new GivenLayersAssigner()
    }
  })

  const layoutData = new HierarchicalLayoutData({
    givenLayersIndices: layerMapper,
    ports: {
      sourcePortCandidates,
      targetPortCandidates
    },
    // now pass the incremental nodes to the layout algorithm
    incrementalNodes,
    // the same for edges
    incrementalEdges
  })

  // apply the layout
  try {
    // Ensure that the LayoutExecutor class is not removed by build optimizers
    // It is needed for the 'applyLayoutAnimated' method in this demo.
    LayoutExecutor.ensure()

    await graphComponent.applyLayoutAnimated(layout, '1s', layoutData)
    layerMapper = layoutData.layerIndicesResult
    layerVisual.updateLayers(graphComponent.graph, layoutData.layerIndicesResult)
  } finally {
    layouting = false
    ;(graphComponent.inputMode as GraphEditorInputMode).enabled = true

    // forget the incremental nodes and edges for the next run
    incrementalNodes.clear()
    incrementalEdges.clear()
  }
}

/**
 * Updates the layers for moved nodes.
 */
function updateMovedNodes(): void {
  if (newLayerMapper.entries.some()) {
    // spread out existing layers
    graphComponent.graph.nodes.forEach((node) => {
      layerMapper.set(node, layerMapper.get(node)! * 2)
    })
    newLayerMapper.entries.forEach((pair) => {
      const node = pair.key
      // if a node has been moved, reinsert the adjacent edges incrementally and not from sketch
      incrementalEdges.addRange(graphComponent.graph.edgesAt(node))
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
  const graph = graphComponent.graph
  graph.nodeDefaults.size = new Size(60, 30)

  // set some nice defaults
  initDemoStyles(graph, { theme: 'demo-palette-21' })

  // create mappers for the layers
  layerMapper = new Mapper<INode, number>()
  // and the port candidates
  sourcePortCandidates = new Mapper<IEdge, EdgePortCandidates>()
  targetPortCandidates = new Mapper<IEdge, EdgePortCandidates>()

  // register a custom PositionHandler for the nodes.
  // this enables interactive layer reassignment with layer preview
  graph.decorator.nodes.positionHandler.addWrapperFactory(
    (node) => !graph.groupingSupport.hasGroupNodes() || !graph.isGroupNode(node),
    (node, positionHandler) =>
      new LayerPositionHandler(positionHandler!, layerVisual, node!, newLayerMapper)
  )

  // register custom handles for the first and last bends of an edge
  // this enables interactive port candidate assignment.
  graph.decorator.bends.handle.addWrapperFactory(
    (bend: IBend) => bend.owner.bends.get(0) === bend || bend!.owner.bends.at(-1) === bend,
    (bend: IBend, baseHandle: IHandle | null) =>
      bend!.owner.bends.get(0) === bend
        ? new PortCandidateBendHandle(baseHandle!, true, bend, sourcePortCandidates)
        : bend!.owner.bends.at(-1) === bend
          ? new PortCandidateBendHandle(baseHandle!, false, bend, targetPortCandidates)
          : baseHandle
  )
}

/**
 * Visualizes the layers and manages layer regions and contains tests.
 */
let layerVisual: LayerVisual

/**
 * holds for each node the layer
 */
let layerMapper: IMapper<INode, number>

/**
 * whether a layout is currently running
 */
let layouting = false

/**
 * holds temporary layer reassignments that will be assigned during the next layout
 */
let newLayerMapper: Mapper<INode, number>

/**
 * holds for each edge the port candidates for the source end
 */
let sourcePortCandidates: Mapper<IEdge, EdgePortCandidates>

/**
 * holds for each edge the port candidates for the target end
 */
let targetPortCandidates: Mapper<IEdge, EdgePortCandidates>

/**
 * holds a list of nodes to insert incrementally during the next layout
 */
let incrementalNodes: List<INode>

/**
 * holds a list of edges to reroute incrementally during the next layout
 */
let incrementalEdges: List<IEdge>

run().then(finishLoading)
