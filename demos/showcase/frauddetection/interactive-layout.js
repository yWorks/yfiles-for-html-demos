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
import { Animator, InteractiveOrganicLayout, LayoutGraphAdapter, Reachability } from 'yfiles'

/**
 * The graph component which contains the current graph.
 * @type {GraphComponent}
 */
let graphComponent

/**
 * The layout algorithm which runs animated on a copy of the current graph.
 * @type {InteractiveOrganicLayout}
 */
let organicLayout
/** @type {CopiedLayoutGraph} */
let copiedLayoutGraph
/** @type {Animator} */
let animator

/** Collections that help trace changes in the graph structure and update the layout graph. */
const nodesAdded = []
const edgesAdded = []
const edgesRemoved = []
const nodesRemoved = []

/**
 * Initializes the layout algorithm, animations and interaction with the current graph.
 * @param {!GraphComponent} gc The graph component
 */
export function initializeLayout(gc) {
  graphComponent = gc

  organicLayout = new InteractiveOrganicLayout({
    qualityTimeRatio: 0.2,
    preferredNodeDistance: 30
  })

  animator = new Animator({
    canvas: graphComponent,
    autoInvalidation: false,
    allowUserInteraction: true
  })

  prepareInteraction()
  prepareStructureChanges()
}

/**
 * Registers the necessary drag listeners to the input mode to configure the interactive layout
 * to respect the drag position.
 */
function prepareInteraction() {
  const inputMode = graphComponent.inputMode
  const moveUnselectedInputMode = inputMode.moveUnselectedInputMode
  moveUnselectedInputMode.addDragStartedListener((moveInputMode) => {
    restartLayout(moveInputMode.affectedItems.at(0))
  })
  moveUnselectedInputMode.addDraggedListener((moveInputMode) => {
    updateDraggedComponent(moveInputMode.affectedItems.at(0))
  })
  moveUnselectedInputMode.addDragCanceledListener((moveInputMode) => {
    setFinalNodeLocation(moveInputMode.affectedItems.at(0))
  })
  moveUnselectedInputMode.addDragFinishedListener((moveInputMode) => {
    setFinalNodeLocation(moveInputMode.affectedItems.at(0))
  })
}

/**
 * Registers the necessary listeners that react to structural changes to the graph like node/edge
 * addition/deletion so that the layout algorithm is updated accordingly.
 */
function prepareStructureChanges() {
  const graph = graphComponent.graph
  graph.addNodeCreatedListener((_, evt) => {
    addNodeToLayout(evt.item)
  })
  graph.addNodeRemovedListener((_, evt) => {
    removeNodeFromLayout(evt.item)
  })
  graph.addEdgeCreatedListener((_, evt) => {
    addEdgeToLayout(evt.item)
  })
  graph.addEdgeRemovedListener((_, evt) => {
    removeEdgeFromLayout(evt.item)
  })
}

/**
 * Starts an interactive layout and configures how much the nodes are allowed to move.
 * The concept is the following:
 * (i) new nodes can freely move until they find a good position,
 * (ii) nodes that already exist in the graph can move but only a little, so that the mental map of
 * the graph does not change a lot,
 * (iii) if an edge is added, its source/target nodes can move more to come close to each other,
 * (iv) if an edge is removed, its source/target nodes can move more to get closer to other neighboring
 * nodes that are visible in the graph.
 */
export function startLayout() {
  const graph = graphComponent.graph
  const adapter = new LayoutGraphAdapter(graph)
  copiedLayoutGraph = adapter.createCopiedLayoutGraph()

  organicLayout = new InteractiveOrganicLayout({
    qualityTimeRatio: 0.2,
    preferredNodeDistance: 30
  })

  const layoutContext = organicLayout.startLayout(copiedLayoutGraph)

  // make the nodes unmovable at the beginning,
  // so that the layout of the graph is maintained as it is in the initial layout
  copiedLayoutGraph.nodes.forEach((node) => {
    organicLayout.setInertia(node, 1)
  })

  void animator.animate(() => {
    if (nodesAdded.length > 0 || edgesAdded.length > 0 || edgesRemoved.length > 0) {
      organicLayout.syncStructure()
      layoutContext.continueLayout(10)
    }

    // configure how the new edges with their source/target node can move when an edge is added in the graph
    if (edgesAdded.length > 0) {
      edgesAdded.forEach((edge) => {
        const copiedSource = copiedLayoutGraph.getCopiedNode(edge.sourceNode)
        const copiedTarget = copiedLayoutGraph.getCopiedNode(edge.targetNode)

        if (copiedSource) {
          // if the source node is also added to the graph, allow it to move fast and farther from its initial position
          // otherwise it can move only a little
          if (nodesAdded.includes(edge.sourceNode)) {
            organicLayout.setInertia(copiedSource, 0)
            organicLayout.setStress(copiedSource, 1)
          } else {
            organicLayout.setInertia(copiedSource, 0.7)
            organicLayout.setStress(copiedSource, 0.5)
          }
        }

        if (copiedTarget) {
          // if the target node is also added to the graph, allow it to move fast and farther from its initial position
          // otherwise it can only move a little
          if (nodesAdded.includes(edge.targetNode)) {
            organicLayout.setInertia(copiedTarget, 0)
            organicLayout.setStress(copiedTarget, 1)
          } else {
            organicLayout.setInertia(copiedTarget, 0.7)
            organicLayout.setStress(copiedTarget, 0.5)
          }
        }
      })

      edgesAdded.length = 0
    }

    // configure how the new node can move when they are added in the graph
    if (nodesAdded.length > 0) {
      // configure how the new nodes can be moved
      graph.nodes.forEach((node) => {
        if (nodesAdded.includes(node)) {
          const copiedNode = copiedLayoutGraph.getCopiedNode(node)
          if (copiedNode) {
            organicLayout.setInertia(copiedNode, 0.8)
            // set a high stress to allow the new nodes to move farther away from their initial position
            organicLayout.setStress(copiedNode, 1)
          }
        }
      })

      nodesAdded.length = 0
    }

    // configure how the source/target nodes of an edge can move when an edge is removed from the graph
    if (edgesRemoved.length > 0) {
      edgesRemoved.forEach((edge) => {
        const sourceNode = edge.sourceNode
        if (graph.contains(sourceNode)) {
          const copiedSource = copiedLayoutGraph.getCopiedNode(sourceNode)
          if (copiedSource) {
            // the source node can move as fast as possible so that it goes next to other neighbors that exist in the graph
            organicLayout.setInertia(copiedSource, 0)
            organicLayout.setStress(copiedSource, 0.5)
          }
        }
        const targetNode = edge.targetNode
        if (graph.contains(targetNode)) {
          const copiedTarget = copiedLayoutGraph.getCopiedNode(targetNode)
          if (copiedTarget) {
            // the target node can move as fast as possible so that it goes next to other neighbors that exist in the graph
            organicLayout.setInertia(copiedTarget, 0)
            organicLayout.setStress(copiedTarget, 0.5)
          }
        }
      })

      edgesRemoved.length = 0
    }

    layoutContext.continueLayout(10)
    // if some significant movement has occurred, pass the new layout positions to the graph and update
    if (organicLayout.commitPositionsSmoothly(50, 0.05) > 0) {
      graphComponent.invalidate()
    }
  }, Number.POSITIVE_INFINITY)
}

/**
 * Stops the layout along with the animation.
 */
export function stopLayout() {
  animator.stop()
  organicLayout.stop()
}

/**
 * When a new node is added, it will be moved at a point close to its existing neighbors
 * that are already visible in the graph.
 * The layout calculation has to restart.
 * @param {!INode} addedNode
 */
function addNodeToLayout(addedNode) {
  if (organicLayout.stopped) {
    return
  }
  setInitialCoordinates(addedNode)
  nodesAdded.push(addedNode)
  organicLayout.wakeUp()
}

/**
 * When a node is removed, the layout calculation has to restart.
 * @param {!INode} removedNode
 */
function removeNodeFromLayout(removedNode) {
  if (organicLayout.stopped) {
    return
  }
  nodesRemoved.push(removedNode)
  organicLayout.wakeUp()
}

/**
 * When an edge is added, the layout calculation has to restart.
 * @param {!IEdge} addedEdge
 */
function addEdgeToLayout(addedEdge) {
  if (organicLayout.stopped) {
    return
  }
  edgesAdded.push(addedEdge)
  organicLayout.wakeUp()
}

/**
 * When an edge is removed, the layout calculation has to restart.
 * @param {!IEdge} removedEdge
 */
function removeEdgeFromLayout(removedEdge) {
  if (organicLayout.stopped) {
    return
  }

  edgesRemoved.push(removedEdge)
  organicLayout.wakeUp()
}

/**
 * When a node is first dragged, the interactive layout to restart and get an updated graph structure.
 * @param {!INode} [draggedNode]
 */
function restartLayout(draggedNode) {
  if (isVisible(draggedNode)) {
    copiedLayoutGraph.syncStructure()
    organicLayout.wakeUp()
  }
}

/**
 * During dragging, the dragged node has to take the position of the drag gesture.
 * All other nodes that belong to this component can be moved to adjust their positions close to the
 * moved node.
 * @param {!INode} [draggedNode]
 */
function updateDraggedComponent(draggedNode) {
  if (isVisible(draggedNode)) {
    const copiedMovedNode = copiedLayoutGraph.getCopiedNode(draggedNode)
    if (copiedMovedNode) {
      const { x, y } = draggedNode.layout.center
      organicLayout.setCenter(copiedMovedNode, x, y)
      organicLayout.setInertia(copiedMovedNode, 1)
      updateStressAndInertiaForOtherNodes(draggedNode)
    }
  }
}

/**
 * The dragged node has to move to the drag position and remain there.
 * @param {!INode} [draggedNode]
 */
function setFinalNodeLocation(draggedNode) {
  if (isVisible(draggedNode)) {
    const copiedMovedNode = copiedLayoutGraph.getCopiedNode(draggedNode)
    if (copiedMovedNode) {
      const { x, y } = draggedNode.layout.center
      organicLayout.setCenter(copiedMovedNode, x, y)
      organicLayout.setStress(copiedMovedNode, 0)
    }
  }
}

/**
 * Allow the nodes of the moved component to move close to the dragged node.
 * @param {!INode} draggedNode
 */
function updateStressAndInertiaForOtherNodes(draggedNode) {
  const copiedMovedNode = copiedLayoutGraph.getCopiedNode(draggedNode)

  const movedComponent = new Reachability({ directed: false, startNodes: [draggedNode] }).run(
    graphComponent.graph
  )

  movedComponent.reachableNodes.forEach((node) => {
    const copiedNode = copiedLayoutGraph.getCopiedNode(node)
    if (copiedNode && copiedNode !== copiedMovedNode) {
      // allow the nodes of the moved component to move close to the dragged node
      organicLayout.setStress(copiedNode, 0.5)
      organicLayout.setInertia(copiedNode, 0.5)
    }
  })
}

/**
 * Sets the initial coordinates for the node which will bring it near to its visible neighbors.
 * If no-one exists, new nodes appear at their initial/last location.
 * @param {!INode} node
 */
function setInitialCoordinates(node) {
  const visited = new Set()
  const stack = [node]
  let coordinates = undefined
  while (stack.length > 0) {
    const stackNode = stack.pop()
    if (!visited.has(stackNode)) {
      const incidentEdges = getIncidentEdges(stackNode)
      for (const edge of incidentEdges) {
        const opposite = edge.opposite(stackNode)
        if (isVisible(opposite)) {
          coordinates = opposite.layout.center
        } else {
          stack.push(opposite)
        }
      }
      visited.add(stackNode)
    }

    if (coordinates) {
      graphComponent.graph.setNodeCenter(node, coordinates)
    }
  }
}

/**
 * Collects all incident edges to the given node including those that are currently hidden.
 * @param {!INode} node
 * @returns {!Iterable.<IEdge>}
 */
function getIncidentEdges(node) {
  return graphComponent.graph.wrappedGraph.edgesAt(node)
}

/**
 * Checks whether the given node is currently visible in the graph.
 * @param {!INode} [node]
 * @returns {boolean}
 */
function isVisible(node) {
  return !!node && graphComponent.graph.contains(node)
}
