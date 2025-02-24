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
  Animator,
  InteractiveOrganicLayout,
  InteractiveOrganicLayoutData,
  IPortOwner,
  LayoutExecutor,
  LayoutGraphAdapter,
  TimeSpan
} from '@yfiles/yfiles'
export class InteractiveOrganicLayoutHelper {
  graph
  config
  needsStructureUpdate = true
  layout
  layoutData
  duration = 0
  currentAnimator
  currentInterval
  layoutGraphAdapter
  /**
   * Creates a new {@link InteractiveOrganicLayoutHelper} instance.
   * If the graphComponent's graph is an instance of {@link FilteredGraphWrapper}, we have to
   * make sure that we create a new {@link LayoutGraphAdapter} whenever the graph changes,
   * i.e., each time that new nodes/edges are added or removed
   * @param graph - the given graph
   * @param config - the configuration options for the {@link InteractiveOrganicLayoutHelper}.
   */
  constructor(graph, config) {
    this.graph = graph
    this.config = config
    this.duration = this.config.duration ?? 20
  }
  /**
   * Gets the node handle which holds the data for a given node, creating it if non-existent
   * @param node the node to retrieve the handle for
   * @private
   */
  getNodeHandle(node) {
    return this.layoutData?.nodeHandles.get(node)
  }
  /**
   *  Creates the layout data that is always provided when starting the {@link InteractiveOrganicLayout}
   *  via the {@link  LayoutExecutor} - it defines a handle/information instance for each node and
   *  each edge, which is important to interactively write back updates to the actual {@link  IGraph}.
   */
  createAdapter() {
    const adapter = new LayoutGraphAdapter(this.graph)
    adapter.initialize()
    if (!this.layoutData) {
      this.layoutData = new InteractiveOrganicLayoutData()
    }
    // adds the layoutData to the layoutGraph context, to be passed to the layout algorithm afterward
    adapter.applyLayoutData(this.layoutData)
    return adapter
  }
  /**
   * Creates a new {@link InteractiveOrganicLayout} instance and starts it.
   */
  startLayout() {
    if (!this.layoutGraphAdapter || this.config.needsGraphAdapterUpdate) {
      this.layoutGraphAdapter = this.createAdapter()
    }
    this.layout = this.config.layout
      ? this.config.layout()
      : new InteractiveOrganicLayout({ stopDuration: TimeSpan.fromMilliseconds(2000) })
    this.prepareNodesForLayout()
    // starts the layout calculation
    this.layout.startLayout(this.layoutGraphAdapter.layoutGraph, this.duration)
  }
  /**
   * Stops the {@link InteractiveOrganicLayout}.
   */
  stopLayout() {
    this.layout?.stopLayout()
    this.layout = null
  }
  /**
   * Starts the layout using {@link requestAnimationFrame} via an {@link Animator}.
   * Can only be used in the UI thread.
   * @param graphComponent The GraphComponent with the graph to animate.
   */
  startAnimator(graphComponent) {
    // stop the previous layout calculation if one is already running
    this.stopLayout()
    // clean up previous animator
    this.currentAnimator?.stop()
    // force recreation of context
    this.needsStructureUpdate = true
    // fix all nodes in their locations
    this.updateInertiaAndStressForAllNodes()
    // create a new one
    const animator = new Animator({
      canvasComponent: graphComponent,
      autoInvalidation: true,
      allowUserInteraction: true
    })
    this.currentAnimator = animator
    // run an infinite animation that continues the layout operation in between updates
    return animator.animate(() => {
      // we might have to recreate the layout instance when the graph structure changes.
      if (this.needsStructureUpdate) {
        this.needsStructureUpdate = false
        this.stopLayout()
        this.startLayout()
      }
      // progresses the layout calculation
      this.layout?.continueLayout(this.duration)
      // update the locations of the nodes and cause re-rendering, if required.
      if (this.layoutData.updateNodeCenters(this.graph) > 0) {
        graphComponent.updateVisual()
      }
    }, TimeSpan.MAX_VALUE)
  }
  /**
   * Starts the layout using {@link setInterval}. Can be used in a worker thread.
   */
  startInterval() {
    // stop the previous layout calculation if one is already running
    this.stopLayout()
    // clean up previous animator
    clearInterval(this.currentInterval)
    // force recreation of context
    this.needsStructureUpdate = true
    // fix all nodes in their locations
    this.updateInertiaAndStressForAllNodes()
    this.currentInterval = setInterval(() => {
      // we might have to recreate the layout instance when the graph structure changes.
      if (this.needsStructureUpdate) {
        this.needsStructureUpdate = false
        this.stopLayout()
        this.startLayout()
      }
      // progresses the layout calculation
      this.layout?.continueLayout(this.duration)
      this.layoutData.updateNodeCenters(this.graph)
    }, this.duration)
  }
  /**
   * Helper method that updates the inertia and stress for all nodes of the graph.
   * By default, it fixes all nodes, setting their inertia to 1 and stress to 0
   */
  updateInertiaAndStressForAllNodes(inertia = 1, stress = 0) {
    this.graph.nodes.forEach((node) => {
      this.fixNode(node, inertia, stress)
    })
  }
  /**
   * Handles necessary layout data updates when a new node is created in the original graph.
   * <p>
   *   The node will be nailed down by assigning a high inertia and low stress value to it.
   *   Furthermore, a new {@link InteractiveOrganicNodeHandle} is created for the node.
   * </p>
   * @param node - The new node.
   * @param fixed - whether the node should be fixed in the coordinate system, initially, or freely movable
   */
  addNode(node, fixed = true) {
    const nodeHandle = this.getNodeHandle(node)
    if (!nodeHandle) {
      return
    }
    // we nail down all newly created, fixed nodes
    if (fixed) {
      nodeHandle.inertia = 1
      nodeHandle.stress = 0
    } else {
      // ... and make the others freely movable
      nodeHandle.inertia = 0
      nodeHandle.stress = 1
    }
    this.needsStructureUpdate = true
  }
  /**
   * Handles necessary layout data updates when a new edge is created in the original graph.
   * <p>
   *   A new {@link InteractiveOrganicEdgeHandle} is created for the edge without special settings.
   * </p>
   * @param edge - The new edge.
   */
  addEdge(edge) {
    // make it possible for the source and target to move
    this.changeStress(edge.sourceNode, 0.5)
    this.changeInertia(edge.sourceNode, -0.3)
    this.changeStress(edge.targetNode, 0.5)
    this.changeInertia(edge.targetNode, -0.3)
    this.needsStructureUpdate = true
  }
  /**
   * Handles necessary layout data updates when an edge is removed from the original graph.
   * <p>
   *   This triggers a restart of the layout without the edge in the next update.
   * </p>
   * @param sourcePortOwner - The owner of the removed edge's source port.
   * @param targetPortOwner - The owner of the removed edge's target port.
   */
  removeEdge(sourcePortOwner, targetPortOwner) {
    // make it possible for the source and target to move
    this.changeStress(sourcePortOwner, 0.2)
    this.changeInertia(sourcePortOwner, -0.3)
    this.changeStress(targetPortOwner, 0.2)
    this.changeInertia(targetPortOwner, -0.3)
    this.needsStructureUpdate = true
  }
  /**
   * Handles necessary layout data updates when a node is removed from the original graph.
   * <p>
   *   This triggers a restart of the layout without the node in the next update.
   * </p>
   */
  removeNode() {
    this.needsStructureUpdate = true
  }
  /**
   * Fixes a given node by increasing the heat of the neighbor nodes and optionally setting the inertia
   * and stress of the node itself to the given values.
   *
   * @param node - The node to update.
   * @param inertia - The inertia value to set for the node.
   * @param stress - The stress value to set for the node.
   */
  fixNode(node, inertia = -1, stress = -1) {
    const nodeHandle = this.getNodeHandle(node)
    if (!nodeHandle) {
      return
    }
    nodeHandle.setCenter(node.layout.centerX, node.layout.centerY)
    // Actually, the node itself is fixed at the start of a drag gesture
    if (inertia >= 0) {
      nodeHandle.inertia = inertia
    }
    if (stress >= 0) {
      nodeHandle.stress = stress
    }
    // Increasing has the effect that the layout will consider this node as not completely placed...
    // In this case, the node itself is fixed, but its neighbors will wake up
    this.increaseNeighborStress(node, 0.5)
  }
  /**
   * Schedules an update of the inertia for the given node.
   *
   * @param node - The node to update.
   * @param delta - The inertia delta value for the node.
   */
  changeInertia(node, delta) {
    const nodeHandle = this.getNodeHandle(node)
    if (!nodeHandle) {
      return
    }
    nodeHandle.inertia = Math.min(1, Math.max(0, nodeHandle.inertia + delta))
  }
  /**
   * Schedules an update of the stress for the given node.
   *
   * @param node - The node to update.
   * @param delta - The stress delta value for the node.
   */
  changeStress(node, delta) {
    const nodeHandle = this.getNodeHandle(node)
    if (!nodeHandle) {
      return
    }
    nodeHandle.stress = Math.min(1, Math.max(0, nodeHandle.stress + delta))
  }
  /**
   * Increases the heat of the neighbors of a given node by a given value.
   * <p>
   *   This will make the layout move the neighbor nodes more quickly.
   * </p>
   * @param node - The node whose neighbors' stress will be increased.
   * @param delta - The amount to increase the heat by.
   */
  increaseNeighborStress(node, delta) {
    // Increase Heat of neighbors
    for (const neighbor of this.graph.neighbors(node)) {
      const nodeHandle = this.getNodeHandle(neighbor)
      if (!nodeHandle) {
        return
      }
      nodeHandle.stress = Math.min(1, nodeHandle.stress + delta)
    }
  }
  /**
   * Warms-up all nodes in the graph by increasing their stress value in the force-directed layout, which
   * has the effect that they want to move more.
   */
  warmupNodes(minStress = 0.5) {
    for (const node of this.graph.nodes) {
      const nodeHandle = this.getNodeHandle(node)
      if (!nodeHandle) {
        return
      }
      nodeHandle.stress = Math.max(minStress, nodeHandle.stress)
    }
  }
  /**
   * Unfix nodes to prepare them for a layout calculation. Meant to be used if some nodes have been
   * previously fixed for some reason, e.g., during a dragging operation.
   */
  prepareNodesForLayout(inertia = 0.1) {
    for (const node of this.graph.nodes) {
      const nodeHandle = this.getNodeHandle(node)
      if (!nodeHandle) {
        return
      }
      nodeHandle.inertia = Math.min(inertia, nodeHandle.inertia)
    }
  }
}
