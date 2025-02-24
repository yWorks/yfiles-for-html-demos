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
  BaseClass,
  Command,
  CompactSubtreePlacer,
  CompositeLayoutData,
  delegate,
  FilteredGraphWrapper,
  Graph,
  INode,
  ITreeLayoutPortAssigner,
  LayoutAnchoringPolicy,
  LayoutAnchoringStage,
  LayoutAnchoringStageData,
  LayoutExecutor,
  Mapper,
  PlaceNodesAtBarycenterStage,
  PlaceNodesAtBarycenterStageData,
  Point,
  PortPlacementPolicy,
  TreeLayout,
  TreeLayoutData,
  TreeReductionStage,
  ViewportLimitingPolicy
} from '@yfiles/yfiles'
/**
 * A graph wrapper that can hide and show parts of a tree and keeps the layout up to date.
 *
 * It provides the following operations:
 * - {@link CollapsibleTree#executeHideChildren hide children}
 * - {@link CollapsibleTree#executeShowChildren show children}
 * - {@link CollapsibleTree#executeHideParent hide parent}
 * - {@link CollapsibleTree#executeShowParent show parent}
 * - {@link CollapsibleTree#executeShowAll show all}
 * - {@link CollapsibleTree#zoomToItem zoom to item}
 *
 * To hide and show items, the class manages a {@link FilteredGraphWrapper} and incrementally
 * applies a {@link TreeLayout} after each update.
 */
export class CollapsibleTree {
  graphComponent
  completeGraph
  hiddenNodesSet = new Set()
  filteredGraph
  doingLayout = false
  // once the nodes have been arranged, remember their arrangement strategy for a more stable layout upon changes
  compactSubtreePlacerStrategyMementos = new Mapper()
  graphUpdatedListener = null
  collapsedStateUpdatedListener = null
  /**
   * Optional predicate that determines whether a node is an assistant. This affects the
   * placement of a node. See also {@link TreeLayoutData#assistantNodes}.
   */
  isAssistantNode = () => false
  /**
   * Optional mapping of a node to its type affecting the order of nodes in the layout.
   * See also {@link TreeLayoutData.nodeTypes}.
   */
  nodeTypesMapping = null
  /**
   * Optional comparer to determine the order of subtrees in the layout.
   * See also {@link TreeLayoutData.childOrder.outEdgeComparison}.
   */
  outEdgeComparison = () => () => 0
  constructor(graphComponent, completeGraph = new Graph()) {
    this.graphComponent = graphComponent
    this.completeGraph = completeGraph
    const nodeFilter = (node) => !this.hiddenNodesSet.has(node)
    this.filteredGraph = new FilteredGraphWrapper(completeGraph, nodeFilter)
    this.graphComponent.viewportLimiter.policy = ViewportLimitingPolicy.TOWARDS_LIMIT
  }
  /**
   * Adds an event listener to the graphUpdated event that is fired after the filtered graph
   * has changed and the layout was updated.
   */
  setGraphUpdatedListener(listener) {
    this.graphUpdatedListener = delegate.combine(this.graphUpdatedListener, listener)
  }
  removeGraphUpdatedListener(listener) {
    this.graphUpdatedListener = delegate.remove(this.graphUpdatedListener, listener)
  }
  /**
   * Adds an event listener to the collapsedStateUpdated event that is fired when the collapsed
   * state of a port has changed.
   */
  setCollapsedStateUpdatedListener(listener) {
    this.collapsedStateUpdatedListener = delegate.combine(
      this.collapsedStateUpdatedListener,
      listener
    )
  }
  removeCollapsedStateUpdatedListener(listener) {
    this.collapsedStateUpdatedListener = delegate.remove(
      this.collapsedStateUpdatedListener,
      listener
    )
  }
  /**
   * Hides the children of the given node and updates the layout.
   */
  async executeHideChildren(item) {
    if (!this.canExecuteHideChildren(item)) {
      return Promise.resolve()
    }
    const descendants = CollapsibleTree.collectDescendants(this.completeGraph, item)
    for (const node of descendants) {
      this.updateCollapsedState(node, true)
    }
    this.updateCollapsedState(item, true)
    this.removeEmptyGroups(descendants)
    this.filteredGraph.nodePredicateChanged()
    await this.refreshLayout(item, descendants, true)
    this.addToHiddenNodes(descendants)
    this.filteredGraph.nodePredicateChanged()
    this.onGraphUpdated()
  }
  /**
   * @returns Whether the children of the given node can be hidden.
   */
  canExecuteHideChildren(node) {
    return !!node && !this.doingLayout && this.filteredGraph.outDegree(node) > 0
  }
  /**
   * Shows the children of the given node and updates the layout.
   */
  async executeShowChildren(node) {
    if (!this.canExecuteShowChildren(node)) {
      return Promise.resolve()
    }
    this.showChildren(node)
    // inform the filter that the predicate changed, and thus the graph needs to be updated
    this.filteredGraph.nodePredicateChanged()
    const incrementalNodes = CollapsibleTree.collectDescendants(this.completeGraph, node)
    await this.refreshLayout(node, incrementalNodes, false)
    this.updateCollapsedState(node, false)
    this.onGraphUpdated()
  }
  showChildren(node) {
    for (const childEdge of this.completeGraph.outEdgesAt(node)) {
      const child = childEdge.targetNode
      this.hiddenNodesSet.delete(child)
      CollapsibleTree.restoreGroup(this.completeGraph, this.hiddenNodesSet, child)
      this.onCollapsedStateUpdated(childEdge.sourcePort, false)
    }
  }
  /**
   * @returns Whether the children of the given node can be shown.
   */
  canExecuteShowChildren(node) {
    return (
      !!node &&
      !this.doingLayout &&
      this.filteredGraph.outDegree(node) !== this.completeGraph.outDegree(node)
    )
  }
  /**
   * Shows the parent of the given node and updates the layout.
   *
   * In contrast to {@link executeHideParent}, it only shows the
   * direct parent and not any of its children.
   */
  async executeShowParent(node) {
    if (!this.canExecuteShowParent(node)) {
      return Promise.resolve()
    }
    const incrementalNodes = new Set()
    this.showParents(node, incrementalNodes)
    this.filteredGraph.nodePredicateChanged()
    await this.refreshLayout(node, incrementalNodes, false)
    this.onGraphUpdated()
  }
  showParents(node, incrementalNodes) {
    for (const parentEdge of this.completeGraph.inEdgesAt(node)) {
      const parent = parentEdge.sourceNode
      this.hiddenNodesSet.delete(parent)
      CollapsibleTree.restoreGroup(this.completeGraph, this.hiddenNodesSet, parent)
      incrementalNodes.add(parent)
    }
  }
  /**
   * @returns Whether the parent of the given node can be shown.
   */
  canExecuteShowParent(node) {
    return (
      !!node &&
      !this.doingLayout &&
      this.filteredGraph.inDegree(node) === 0 &&
      this.completeGraph.inDegree(node) > 0
    )
  }
  /**
   * Hides the parent of the given node and updates the layout.
   *
   * In contrast to {@link executeShowParent}, this method also hides all ancestors
   * and their descendants and other isolated trees leaving only the node and its descendants
   * in the graph.
   */
  async executeHideParent(node) {
    if (!this.canExecuteHideParent(node)) {
      return Promise.resolve()
    }
    const nodes = CollapsibleTree.collectAllNodesExceptSubtree(this.completeGraph, node)
    this.removeEmptyGroups(nodes)
    this.filteredGraph.nodePredicateChanged()
    await this.refreshLayout(node, nodes, true)
    this.addToHiddenNodes(nodes)
    this.filteredGraph.nodePredicateChanged()
    this.onGraphUpdated()
  }
  /**
   * @returns Whether the parent of the given node can be hidden.
   */
  canExecuteHideParent(node) {
    return !!node && !this.doingLayout && this.filteredGraph.inDegree(node) > 0
  }
  /**
   * Shows all nodes and updates the layout.
   */
  async executeShowAll() {
    if (!this.canExecuteShowAll()) {
      return Promise.resolve()
    }
    const incrementalNodes = new Set(this.hiddenNodesSet)
    this.hiddenNodesSet.clear()
    for (const edge of this.completeGraph.edges) {
      this.onCollapsedStateUpdated(edge.sourcePort, false)
    }
    // inform the filter that the predicate changed, and thus the graph needs to be updated
    this.filteredGraph.nodePredicateChanged()
    await this.refreshLayout(this.graphComponent.currentItem, incrementalNodes, false)
    this.onGraphUpdated()
  }
  /**
   * @returns Whether {@link executeShowAll} can be executed.
   */
  canExecuteShowAll() {
    return this.hiddenNodesSet.size !== 0 && !this.doingLayout
  }
  /**
   * Applies the initial layout to the graph.
   */
  applyInitialLayout() {
    if (this.doingLayout) {
      return
    }
    this.hiddenNodesSet.clear()
    // inform the filter that the predicate changed, and thus the graph needs to be updated
    this.filteredGraph.nodePredicateChanged()
    this.filteredGraph.applyLayout(
      this.createConfiguredLayout(),
      this.createConfiguredLayoutData(this.filteredGraph)
    )
    void this.graphComponent.fitGraphBounds()
    this.graphComponent.updateContentBounds(100)
  }
  /**
   * Focuses the given item.
   *
   * If the item is currently not visible, it will be unhidden together with its descendants.
   */
  zoomToItem(item) {
    if (!(item instanceof INode)) {
      return
    }
    if (!this.filteredGraph.nodes.includes(item)) {
      // the given node is hidden, make it visible
      this.showItem(item)
    }
    this.graphComponent.currentItem = item
    this.graphComponent.executeCommand(Command.ZOOM_TO_CURRENT_ITEM)
    this.graphComponent.focus()
  }
  showItem(item) {
    // un-hide all nodes ...
    this.hiddenNodesSet.clear()
    // ... except the node to be displayed and all its descendants
    this.addToHiddenNodes(CollapsibleTree.collectAllNodesExceptSubtree(this.completeGraph, item))
    // inform the filter that the predicate changed, and thus the graph needs to be updated
    this.filteredGraph.nodePredicateChanged()
    this.filteredGraph.applyLayout(
      this.createConfiguredLayout(),
      this.createConfiguredLayoutData(this.filteredGraph)
    )
    this.graphComponent.updateContentBounds(100)
    this.onGraphUpdated()
  }
  /**
   * Refreshes the node after modifications on the tree.
   * @returns a promise which is resolved when the layout has been executed.
   */
  async refreshLayout(centerNode, incrementalNodes, collapse) {
    if (this.doingLayout) {
      return Promise.resolve()
    }
    this.doingLayout = true
    if (!collapse) {
      // move the incremental nodes between their neighbors before expanding for a smooth animation
      this.prepareSmoothExpandLayoutAnimation(incrementalNodes)
    }
    // configure the tree layout
    const layout = new LayoutAnchoringStage(this.createConfiguredLayout())
    const layoutData = new CompositeLayoutData()
    if (centerNode) {
      // we mark a node as the center node to fix it in the coordinate system
      const fixNodeLayoutData = new LayoutAnchoringStageData()
      fixNodeLayoutData.nodeAnchoringPolicies.mapper.set(centerNode, LayoutAnchoringPolicy.CENTER)
      layoutData.items.add(fixNodeLayoutData)
    }
    if (collapse) {
      // configure PlaceNodesAtBarycenterStage for a smooth animation
      layoutData.items.add(
        new PlaceNodesAtBarycenterStageData({
          affectedNodes: incrementalNodes
        })
      )
    }
    layoutData.items.add(
      this.createConfiguredLayoutData(
        this.filteredGraph,
        incrementalNodes.size > 0,
        collapse ? incrementalNodes : undefined
      )
    )
    // configure a LayoutExecutor
    const executor = new LayoutExecutor({
      graphComponent: this.graphComponent,
      layout,
      layoutData,
      animateViewport: centerNode === null,
      easedAnimation: true,
      animationDuration: '0.5s',
      portPlacementPolicies: PortPlacementPolicy.KEEP_PARAMETER
    })
    await executor.start()
    this.graphComponent.updateContentBounds(100)
    this.doingLayout = false
  }
  /**
   * Moves incremental nodes to a location between their neighbors before expanding for a smooth animation.
   */
  prepareSmoothExpandLayoutAnimation(incrementalNodes) {
    const graph = this.graphComponent.graph
    // mark the new nodes and place them between their neighbors
    const layoutData = new PlaceNodesAtBarycenterStageData({
      affectedNodes: incrementalNodes
    })
    const layout = new PlaceNodesAtBarycenterStage()
    graph.applyLayout(layout, layoutData)
  }
  /**
   * Creates a {@link TreeLayoutData} for the tree layout
   */
  createConfiguredLayoutData(graph = null, fromSketch = false, incrementalNodes = new Set()) {
    const hasIncrementalParent = (node) =>
      graph.inDegree(node) > 0 && incrementalNodes.has(graph.predecessors(node).at(0))
    const incrementalEdgesComparison = () => {
      return (edge1, edge2) => {
        const y1 = edge1.targetNode.layout.center.y
        const y2 = edge2.targetNode.layout.center.y
        if (y1 === y2) {
          const x1 = edge1.targetNode.layout.center.x
          const x2 = edge2.targetNode.layout.center.x
          if (x1 === x2) {
            return 0
          }
          return x1 < x2 ? -1 : 1
        }
        return y1 < y2 ? -1 : 1
      }
    }
    return new TreeLayoutData({
      assistantNodes: (node) =>
        this.isAssistantNode(node) && graph.inDegree(node) > 0 && !hasIncrementalParent(node),
      nodeTypes: this.nodeTypesMapping,
      compactSubtreePlacerStrategyMementos: this.compactSubtreePlacerStrategyMementos,
      childOrder: {
        outEdgeComparators: fromSketch ? incrementalEdgesComparison : this.outEdgeComparison
      }
    })
  }
  /**
   * Creates a tree layout that handles assistant nodes and stack leaf nodes.
   * @returns A configured TreeLayout.
   */
  createConfiguredLayout() {
    const treeLayout = new TreeLayout()
    treeLayout.defaultPortAssigner = new (class extends BaseClass(ITreeLayoutPortAssigner) {
      assignPorts(graph, node) {
        const inEdge = node.inEdges.at(0)
        if (inEdge) {
          inEdge.targetPortOffset = Point.ORIGIN
        }
        const halfHeight = node.layout.height / 2
        for (const outEdge of node.outEdges) {
          outEdge.sourcePortOffset = new Point(0, halfHeight)
        }
      }
    })()
    // we let the CompactSubtreePlacer arrange the nodes
    treeLayout.defaultSubtreePlacer = new CompactSubtreePlacer()
    // layout stages used to place nodes at barycenter for smoother layout animations
    treeLayout.layoutStages.append(new PlaceNodesAtBarycenterStage())
    return new TreeReductionStage(treeLayout)
  }
  addToHiddenNodes(nodes) {
    for (const node of nodes) {
      this.hiddenNodesSet.add(node)
    }
  }
  /**
   * Set the collapsed state to all the node's ports.
   */
  updateCollapsedState(node, collapsed) {
    for (const outEdge of this.completeGraph.outEdgesAt(node)) {
      this.onCollapsedStateUpdated(outEdge.sourcePort, collapsed)
    }
  }
  /**
   * Restores the group containing the given node if needed.
   */
  static restoreGroup(graph, hiddenNodesSet, node) {
    const parent = graph.getParent(node)
    if (parent && hiddenNodesSet.has(parent)) {
      hiddenNodesSet.delete(parent)
    }
  }
  /**
   * Removes all groups in the given graph that will be empty after removing the given nodes.
   */
  removeEmptyGroups(nodesToHide) {
    const emptyGroups = CollapsibleTree.findEmptyGroups(this.filteredGraph, nodesToHide).toArray()
    for (const group of emptyGroups) {
      this.hiddenNodesSet.add(group)
    }
  }
  static findEmptyGroups(graph, nodesToHide) {
    return graph.nodes.filter(
      (node) =>
        graph.isGroupNode(node) &&
        graph.degree(node) === 0 &&
        graph.getChildren(node).every((child) => nodesToHide.has(child))
    )
  }
  /**
   * @returns all descendants of the passed node excluding the node itself.
   */
  static collectDescendants(graph, root) {
    const nodes = new Set()
    const queue = [root]
    while (queue.length > 0) {
      const node = queue.pop()
      for (const outEdge of graph.outEdgesAt(node)) {
        queue.unshift(outEdge.targetNode)
        nodes.add(outEdge.targetNode)
      }
    }
    return nodes
  }
  /**
   * Creates an array of all nodes excluding the nodes in the subtree rooted in the excluded sub-root.
   */
  static collectAllNodesExceptSubtree(graph, excludedRoot) {
    const subtree = CollapsibleTree.collectDescendants(graph, excludedRoot)
    subtree.add(excludedRoot)
    return new Set(graph.nodes.filter((node) => !subtree.has(node)))
  }
  /**
   * Informs the listener that the graph was updated.
   */
  onGraphUpdated() {
    this.graphUpdatedListener?.()
  }
  /**
   * Informs the listener that the collapsed state was updated.
   */
  onCollapsedStateUpdated(port, collapsed) {
    this.collapsedStateUpdatedListener?.(port, collapsed)
  }
}
