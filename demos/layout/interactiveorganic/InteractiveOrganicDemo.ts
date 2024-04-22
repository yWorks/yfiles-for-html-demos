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
  Animator,
  CopiedLayoutGraph,
  GraphBuilder,
  GraphComponent,
  GraphConnectivity,
  GraphEditorInputMode,
  GraphItemTypes,
  IEnumerable,
  IGraph,
  IInputMode,
  IModelItem,
  INode,
  InteractiveOrganicLayout,
  InteractiveOrganicLayoutExecutionContext,
  LayoutGraphAdapter,
  License,
  MoveInputMode,
  YNode
} from 'yfiles'

import { InteractiveOrganicFastEdgeStyle, InteractiveOrganicFastNodeStyle } from './DemoStyles'

import { applyDemoTheme } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import type { JSONGraph } from 'demo-utils/json-model'
import graphData from './graph-data.json'

/**
 * The GraphComponent.
 */
let graphComponent: GraphComponent

/**
 * How long the layout will run at most (in milliseconds).
 */
const MAX_TIME = 1000

/**
 * The layout algorithm.
 */
let layout: InteractiveOrganicLayout

/**
 * The copy of the graph used for the layout.
 */
let copiedLayoutGraph: CopiedLayoutGraph

/**
 * Holds the nodes that are moved during dragging.
 */
let movedNodes: INode[]

/**
 * The context that provides control over the layout calculation.
 */
let layoutContext: InteractiveOrganicLayoutExecutionContext

/**
 * Runs the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  graphComponent.inputMode = createEditorMode()

  const graph = graphComponent.graph

  initializeDefaultStyles(graph)

  // build the graph from the given data set
  buildGraph(graph, graphData)

  // center the graph
  graphComponent.fitGraphBounds()

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graph.undoEngineEnabled = true

  // create a copy of the graph for the layout algorithm
  copiedLayoutGraph = new LayoutGraphAdapter(graph).createCopiedLayoutGraph()

  // create and start the layout algorithm
  layout = startLayout()
  wakeUp()

  addListeners(graph)
}

/**
 * Creates nodes and edges according to the given data.
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

/**
 * Initializes default styles for the given graph.
 */
function initializeDefaultStyles(graph: IGraph): void {
  // set some defaults
  graph.nodeDefaults.style = new InteractiveOrganicFastNodeStyle()
  graph.nodeDefaults.shareStyleInstance = true
  graph.edgeDefaults.style = new InteractiveOrganicFastEdgeStyle()
  graph.edgeDefaults.shareStyleInstance = true
}

/**
 * Registers listeners that update the copied layout graph in response to structural changes
 * in the given graph.
 */
function addListeners(graph: IGraph): void {
  graph.addNodeCreatedListener((_, evt) => {
    if (layout !== null) {
      const center = evt.item.layout.center
      synchronize()
      // we nail down all newly created nodes
      const copiedNode = copiedLayoutGraph.getCopiedNode(evt.item)!
      layout.setCenter(copiedNode, center.x, center.y)
      layout.setInertia(copiedNode, 1)
      layout.setStress(copiedNode, 0)

      window.setTimeout(synchronize, MAX_TIME + 1)
    }
  })
  graph.addNodeRemovedListener(() => synchronize())
  graph.addEdgeCreatedListener(() => synchronize())
  graph.addEdgeRemovedListener(() => synchronize())
}

/**
 * Creates the input mode for the graphComponent.
 * @returns a new GraphEditorInputMode instance
 */
function createEditorMode(): IInputMode {
  // create default interaction with a number of disabled input modes.
  const mode = new GraphEditorInputMode({
    selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    marqueeSelectableItems: GraphItemTypes.NODE,
    clickSelectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    clickableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    showHandleItems: GraphItemTypes.NONE,
    allowAddLabel: false
  })
  mode.createBendInputMode.enabled = false
  mode.createEdgeInputMode.allowCreateBend = false
  mode.createEdgeInputMode.allowSelfloops = false

  // prepare the move input mode for interacting with the layout algorithm
  initMoveMode(mode.moveInputMode)

  // We could also allow direct moving of nodes, without requiring selection of the nodes, first.
  // However by default this conflicts with the edge creation gesture, which we will simply disable, here.
  // uncomment the following lines to be able to move nodes without selecting them first
  //
  // mode.moveUnselectedInputMode.enabled = true;
  // initMoveMode(mode.moveUnselectedInputMode);

  return mode
}

/**
 * Registers the listeners to the given move input mode in order to tell the organic layout what
 * nodes are moved interactively.
 * @param moveInputMode The input mode that should be observed
 */
function initMoveMode(moveInputMode: MoveInputMode): void {
  // register callbacks to notify the organic layout of changes
  moveInputMode.addDragStartedListener((dragStarted) =>
    onMoveInitialized(dragStarted.affectedItems)
  )
  moveInputMode.addDragCanceledListener(onMoveCanceled)
  moveInputMode.addDraggedListener(onMoving)
  moveInputMode.addDragFinishedListener(onMovedFinished)
}

/**
 * Called once the move operation has been initialized.
 * Calculates which components stay fixed and which nodes will be moved by the user.
 * @param affectedItems The dragged items
 */
function onMoveInitialized(affectedItems: IEnumerable<IModelItem>): void {
  if (layout !== null) {
    const copy = copiedLayoutGraph
    const componentNumber = copy.createNodeMap()
    GraphConnectivity.connectedComponents(copy, componentNumber)
    const movedComponents = new Set()
    const selectedNodes = new Set()
    movedNodes = affectedItems.ofType(INode.$class).toArray()
    for (const node of movedNodes) {
      const copiedNode = copy.getCopiedNode(node)
      if (copiedNode !== null) {
        // remember that we nailed down this node
        selectedNodes.add(copiedNode)
        // remember that we are moving this component
        movedComponents.add(componentNumber.getInt(copiedNode))
        // Update the position of the node in the CLG to match the one in the IGraph
        layout.setCenter(
          copiedNode,
          node.layout.x + node.layout.width * 0.5,
          node.layout.y + node.layout.height * 0.5
        )
        // Actually, the node itself is fixed at the start of a drag gesture
        layout.setInertia(copiedNode, 1.0)
        // Increasing has the effect that the layout will consider this node as not completely placed...
        // In this case, the node itself is fixed, but it's neighbors will wake up
        increaseHeat(copiedNode, layout, 0.5)
      }
    }

    // make all nodes that are not actively moved float freely
    for (const copiedNode of copy.nodes) {
      if (!selectedNodes.has(copiedNode)) {
        layout.setInertia(copiedNode, 0)
      }
    }

    // dispose the map
    copy.disposeNodeMap(componentNumber)

    // Notify the layout that there is new work to do...
    layout.wakeUp()
  }
}

/**
 * Notifies the layout of the new positions of the interactively moved nodes.
 */
function onMoving(): void {
  if (layout !== null) {
    const copy = copiedLayoutGraph
    for (const node of movedNodes) {
      const copiedNode = copy.getCopiedNode(node)
      if (copiedNode !== null) {
        // Update the position of the node in the CLG to match the one in the IGraph
        layout.setCenter(copiedNode, node.layout.center.x, node.layout.center.y)
        // Increasing the heat has the effect that the layout will consider these nodes as not completely placed...
        increaseHeat(copiedNode, layout, 0.05)
      }
    }
    // Notify the layout that there is new work to do...
    layout.wakeUp()
  }
}

/**
 * Resets the state in the layout when the user cancels the move operation.
 */
function onMoveCanceled(): void {
  if (layout !== null) {
    const copy = copiedLayoutGraph
    for (const node of movedNodes) {
      const copiedNode = copy.getCopiedNode(node)
      if (copiedNode !== null) {
        // Update the position of the node in the CLG to match the one in the IGraph
        layout.setCenter(copiedNode, node.layout.center.x, node.layout.center.y)
        layout.setStress(copiedNode, 0)
      }
    }
    for (const copiedNode of copy.nodes) {
      // Reset the node's inertia to be fixed
      layout.setInertia(copiedNode, 1)
      layout.setStress(copiedNode, 0)
    } // We don't want to restart the layout (since we canceled the drag anyway...)
  }
}

/**
 * Called once the interactive move is finished.
 * Updates the state of the interactive layout.
 */
function onMovedFinished(): void {
  if (layout !== null) {
    const copy = copiedLayoutGraph
    for (const node of movedNodes) {
      const copiedNode = copy.getCopiedNode(node)
      if (copiedNode !== null) {
        // Update the position of the node in the CLG to match the one in the IGraph
        layout.setCenter(copiedNode, node.layout.center.x, node.layout.center.y)
        layout.setStress(copiedNode, 0)
      }
    }
    for (const copiedNode of copy.nodes) {
      // Reset the node's inertia to be fixed
      layout.setInertia(copiedNode, 1)
      layout.setStress(copiedNode, 0)
    }
  }
}

/**
 * Creates a new layout instance and starts a new execution context for it.
 */
function startLayout(): InteractiveOrganicLayout {
  // create the layout
  const organicLayout = new InteractiveOrganicLayout({
    maximumDuration: MAX_TIME,
    // The compactness property prevents component drifting.
    compactnessFactor: 0.6
  })

  layoutContext = organicLayout.startLayout(copiedLayoutGraph)

  // use an animator that animates an infinite animation
  const animator = new Animator(graphComponent)
  animator.autoInvalidation = false
  animator.allowUserInteraction = true

  void animator.animate(() => {
    layoutContext.continueLayout(20)
    if (organicLayout.commitPositionsSmoothly(50, 0.05) > 0) {
      graphComponent.updateVisual()
    }
  }, Number.POSITIVE_INFINITY)

  return organicLayout
}

/**
 * Wakes up the layout algorithm.
 */
function wakeUp(): void {
  if (layout !== null) {
    // we make all nodes freely movable
    for (const copiedNode of copiedLayoutGraph.nodes) {
      layout.setInertia(copiedNode, 0)
    }
    // then wake up the layout
    layout.wakeUp()

    const geim = graphComponent.inputMode as GraphEditorInputMode
    // and after two seconds we freeze the nodes again...
    window.setTimeout(() => {
      if (geim.moveInputMode.isDragging) {
        // don't freeze the nodes if a node is currently being moved
        return
      }
      for (const copiedNode of copiedLayoutGraph.nodes) {
        layout.setInertia(copiedNode, 1)
      }
    }, 2000)
  }
}

/**
 * Synchronizes the structure of the graph copy with the original graph.
 */
function synchronize(): void {
  if (layout !== null) {
    layout.syncStructure()
    layoutContext.continueLayout(10)
  }
}

/**
 * Helper method that increases the heat of the neighbors of a given node by a given value.
 * This will make the layout algorithm move the neighbor nodes more quickly.
 */
function increaseHeat(
  copiedNode: YNode,
  layoutAlgorithm: InteractiveOrganicLayout,
  delta: number
): void {
  // Increase Heat of neighbors
  for (const neighbor of copiedNode.neighbors) {
    const oldStress = layoutAlgorithm.getStress(neighbor)
    layoutAlgorithm.setStress(neighbor, Math.min(1, oldStress + delta))
  }
}

run().then(finishLoading)
