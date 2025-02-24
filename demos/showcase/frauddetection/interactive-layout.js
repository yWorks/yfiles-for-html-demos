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
import { InteractiveOrganicLayout, Reachability, TimeSpan } from '@yfiles/yfiles'
import { InteractiveOrganicLayoutHelper } from '../../utils/InteractiveOrganicLayoutHelper'
/**
 * Initializes the layout algorithm, animations and interaction with the current graph.
 *
 * @param graphComponent The graph component
 * @returns the methods stopLayout and startLayout methods to use for controlling the layout
 */
export function initializeLayout(graphComponent) {
  const interactiveOrganicLayoutHelper = new InteractiveOrganicLayoutHelper(graphComponent.graph, {
    // the layout configuration
    layout: () =>
      new InteractiveOrganicLayout({
        stopDuration: TimeSpan.fromMilliseconds(2000),
        compactnessFactor: 0.5
      }),
    duration: 20,
    // Since we use the FilteredGraphWrapper, we have to make sure that we create a new
    // LayoutGraphAdapter whenever the graph changes, i.e., each time that new nodes/edges
    // are added or removed. This can be done setting
    // InteractiveOrganicLayoutHelper.needsGraphAdapterUpdate to true.
    needsGraphAdapterUpdate: true
  })
  prepareInteraction()
  prepareStructureChanges()
  return { startLayout, stopLayout }
  /**
   * Registers the necessary drag listeners to the input mode to configure the interactive layout
   * to respect the drag position.
   */
  function prepareInteraction() {
    const inputMode = graphComponent.inputMode
    const moveUnselectedItemsInputMode = inputMode.moveUnselectedItemsInputMode
    let draggedComponent
    function getDraggedNode(moveInputMode) {
      return moveInputMode.affectedItems.at(0)
    }
    moveUnselectedItemsInputMode.addEventListener('drag-started', (_, moveInputMode) => {
      const draggedNode = getDraggedNode(moveInputMode)
      // find the nodes that belong to the same component as the dragged node
      const reachability = new Reachability({ directed: false, startNodes: [draggedNode] }).run(
        graphComponent.graph
      )
      draggedComponent = reachability.reachableNodes
      interactiveOrganicLayoutHelper.updateInertiaAndStressForAllNodes(0.8, 0.2)
      restartLayout(draggedNode, draggedComponent)
    })
    moveUnselectedItemsInputMode.addEventListener('dragged', (_, moveInputMode) => {
      updateDraggedComponent(getDraggedNode(moveInputMode), draggedComponent, 0.01)
    })
    moveUnselectedItemsInputMode.addEventListener('drag-canceled', (_, moveInputMode) => {
      setFinalNodeLocation(getDraggedNode(moveInputMode), draggedComponent)
      draggedComponent = null
    })
    moveUnselectedItemsInputMode.addEventListener('drag-finished', (_, moveInputMode) => {
      setFinalNodeLocation(getDraggedNode(moveInputMode), draggedComponent)
      draggedComponent = null
    })
  }
  /**
   * Registers the necessary listeners that react to structural changes to the graph like node/edge
   * addition/deletion so that the layout algorithm is updated accordingly.
   */
  function prepareStructureChanges() {
    const graph = graphComponent.graph
    graph.addEventListener('node-created', (evt) => {
      // we want the node to animate, so we don't fix it.
      interactiveOrganicLayoutHelper.addNode(evt.item, false)
    })
    graph.addEventListener('node-removed', () => {
      interactiveOrganicLayoutHelper.removeNode()
    })
    graph.addEventListener('edge-created', (evt) => {
      interactiveOrganicLayoutHelper.addEdge(evt.item)
    })
    graph.addEventListener('edge-removed', (evt) => {
      interactiveOrganicLayoutHelper.removeEdge(evt.sourcePortOwner, evt.targetPortOwner)
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
  async function startLayout() {
    await interactiveOrganicLayoutHelper.startAnimator(graphComponent)
  }
  /**
   * Stops the layout along with the animation.
   */
  function stopLayout() {
    interactiveOrganicLayoutHelper.stopLayout()
  }
  /**
   * When a node is first dragged, the interactive layout to restart and get an updated graph structure.
   */
  function restartLayout(draggedNode, draggedComponent) {
    if (isVisible(draggedNode)) {
      updateDraggedComponent(draggedNode, draggedComponent, 0.5)
      interactiveOrganicLayoutHelper.warmupNodes()
      interactiveOrganicLayoutHelper.fixNode(draggedNode)
    }
  }
  /**
   * During dragging, the dragged node has to take the position of the drag gesture.
   * All other nodes that belong to this component can be moved to adjust their positions close to the
   * moved node.
   */
  function updateDraggedComponent(draggedNode, draggedComponent, delta = 0.5) {
    if (isVisible(draggedNode)) {
      updateStressAndInertiaForOtherNodes(draggedNode, draggedComponent, delta)
      interactiveOrganicLayoutHelper.fixNode(draggedNode, 1)
    }
  }
  /**
   * The dragged node has to move to the drag position and remain there.
   */
  function setFinalNodeLocation(draggedNode, draggedComponent) {
    if (isVisible(draggedNode)) {
      interactiveOrganicLayoutHelper.fixNode(draggedNode, 1, 0)
      updateStressAndInertiaForOtherNodes(draggedNode, draggedComponent, -1)
    }
  }
  /**
   * Allow the nodes of the moved component to move close to the dragged node.
   * @param draggedNode the node that will be dragged.
   * @param draggedComponent the nodes that belong to the dragged component
   * @param delta defines what stress to add to the nodes and what inertia the *remove* from the node.
   */
  function updateStressAndInertiaForOtherNodes(draggedNode, draggedComponent, delta = 0.1) {
    draggedComponent.forEach((node) => {
      if (node !== draggedNode) {
        // allow the nodes of the moved component to move close to the dragged node
        interactiveOrganicLayoutHelper.changeStress(node, delta)
        interactiveOrganicLayoutHelper.changeInertia(node, -delta)
      }
    })
  }
  /**
   * Checks whether the given node is currently visible in the graph.
   */
  function isVisible(node) {
    return !!node && graphComponent.graph.contains(node)
  }
}
