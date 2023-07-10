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
  CompactNodePlacer,
  CompositeLayoutData,
  DefaultGraph,
  delegate,
  FilteredGraphWrapper,
  FixNodeLayoutData,
  FixNodeLayoutStage,
  ICommand,
  IComparer,
  INode,
  Insets,
  ITreeLayoutPortAssignment,
  LayoutExecutor,
  Mapper,
  PlaceNodesAtBarycenterStage,
  PlaceNodesAtBarycenterStageData,
  TreeLayout,
  TreeLayoutData,
  TreeReductionStage,
  YPoint
} from 'yfiles'

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
  hiddenNodesSet = new Set()
  filteredGraph

  doingLayout = false
  // once the nodes have been arranged, remember their arrangement strategy for a more stable layout upon changes
  compactNodePlacerStrategyMementos = new Mapper()

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
   * See also {@link TreeLayoutData.outEdgeComparers}.
   */
  outEdgeComparers = () => () => 0

  /**
   * @param {!GraphComponent} graphComponent
   * @param {!IGraph} completeGraph
   */
  constructor(graphComponent, completeGraph = new DefaultGraph()) {
    this.completeGraph = completeGraph
    this.graphComponent = graphComponent
    const nodeFilter = node => !this.hiddenNodesSet.has(node)
    this.filteredGraph = new FilteredGraphWrapper(completeGraph, nodeFilter)
  }

  /**
   * Adds an event listener to the graphUpdated event that is fired after the filtered graph
   * has changed and the layout was updated.
   * @param {!function} listener
   */
  addGraphUpdatedListener(listener) {
    this.graphUpdatedListener = delegate.combine(this.graphUpdatedListener, listener)
  }

  /**
   * @param {!function} listener
   */
  removeGraphUpdatedListener(listener) {
    this.graphUpdatedListener = delegate.remove(this.graphUpdatedListener, listener)
  }

  /**
   * Adds an event listener to the collapsedStateUpdated event that is fired when the collapsed
   * state of a port has changed.
   * @param {!function} listener
   */
  addCollapsedStateUpdatedListener(listener) {
    this.collapsedStateUpdatedListener = delegate.combine(
      this.collapsedStateUpdatedListener,
      listener
    )
  }

  /**
   * @param {!function} listener
   */
  removeCollapsedStateUpdatedListener(listener) {
    this.collapsedStateUpdatedListener = delegate.remove(
      this.collapsedStateUpdatedListener,
      listener
    )
  }

  /**
   * Hides the children of the given node and updates the layout.
   * @param {!INode} item
   * @returns {!Promise}
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
   * @returns {boolean} Whether the children of the given node can be hidden.
   * @param {!INode} item
   */
  canExecuteHideChildren(item) {
    return !this.doingLayout && this.filteredGraph.outDegree(item) > 0
  }

  /**
   * Shows the children of the given node and updates the layout.
   * @param {!INode} item
   * @returns {!Promise}
   */
  async executeShowChildren(item) {
    if (!this.canExecuteShowChildren(item)) {
      return Promise.resolve()
    }

    this.showChildren(item)

    // inform the filter that the predicate changed, and thus the graph needs to be updated
    this.filteredGraph.nodePredicateChanged()

    const incrementalNodes = CollapsibleTree.collectDescendants(this.completeGraph, item)
    await this.refreshLayout(item, incrementalNodes, false)

    this.updateCollapsedState(item, false)

    this.onGraphUpdated()
  }

  /**
   * @param {!INode} node
   */
  showChildren(node) {
    for (const childEdge of this.completeGraph.outEdgesAt(node)) {
      const child = childEdge.targetNode
      this.hiddenNodesSet.delete(child)
      CollapsibleTree.restoreGroup(this.completeGraph, this.hiddenNodesSet, child)
      this.onCollapsedStateUpdated(childEdge.sourcePort, false)
    }
  }

  /**
   * @returns {boolean} Whether the children of the given node can be shown.
   * @param {!INode} item
   */
  canExecuteShowChildren(item) {
    return (
      !this.doingLayout && this.filteredGraph.outDegree(item) !== this.completeGraph.outDegree(item)
    )
  }

  /**
   * Shows the parent of the given node and updates the layout.
   *
   * In contrast to {@link executeHideParent}, it only shows the
   * direct parent and not any of its children.
   * @param {!INode} node
   * @returns {!Promise}
   */
  async executeShowParent(node) {
    if (this.doingLayout) {
      return Promise.resolve()
    }

    const incrementalNodes = new Set()
    this.showParents(node, incrementalNodes)
    this.filteredGraph.nodePredicateChanged()

    await this.refreshLayout(node, incrementalNodes, false)

    this.onGraphUpdated()
  }

  /**
   * @param {!INode} node
   * @param {!Set.<INode>} incrementalNodes
   */
  showParents(node, incrementalNodes) {
    for (const parentEdge of this.completeGraph.inEdgesAt(node)) {
      const parent = parentEdge.sourceNode
      this.hiddenNodesSet.delete(parent)
      CollapsibleTree.restoreGroup(this.completeGraph, this.hiddenNodesSet, parent)
      incrementalNodes.add(parent)
    }
  }

  /**
   * @returns {boolean} Whether the parent of the given node can be shown.
   * @param {!INode} node
   */
  canExecuteShowParent(node) {
    return (
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
   * @param {!INode} node
   * @returns {!Promise}
   */
  async executeHideParent(node) {
    if (this.doingLayout) {
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
   * @returns {boolean} Whether the parent of the given node can be hidden.
   * @param {!INode} node
   */
  canExecuteHideParent(node) {
    return !this.doingLayout && this.filteredGraph.inDegree(node) > 0
  }

  /**
   * Shows all nodes and updates the layout.
   * @returns {!Promise}
   */
  async executeShowAll() {
    if (this.doingLayout) {
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
   * @returns {boolean} Whether {@link executeShowAll} can be executed.
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
      this.createConfiguredLayout(false),
      this.createConfiguredLayoutData(this.filteredGraph)
    )
    this.graphComponent.fitGraphBounds()
    this.limitViewport()
  }

  /**
   * Focuses the given item.
   *
   * If the item is currently not visible, it will be unhidden together with its descendants.
   * @param {!IModelItem} item
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
    ICommand.ZOOM_TO_CURRENT_ITEM.execute(null, this.graphComponent)
    this.graphComponent.focus()
  }

  /**
   * @param {!INode} item
   */
  showItem(item) {
    // un-hide all nodes ...
    this.hiddenNodesSet.clear()
    // ... except the node to be displayed and all its descendants
    this.addToHiddenNodes(CollapsibleTree.collectAllNodesExceptSubtree(this.completeGraph, item))
    // inform the filter that the predicate changed, and thus the graph needs to be updated
    this.filteredGraph.nodePredicateChanged()

    this.filteredGraph.applyLayout(
      this.createConfiguredLayout(false),
      this.createConfiguredLayoutData(this.filteredGraph)
    )
    this.limitViewport()

    this.onGraphUpdated()
  }

  /**
   * Refreshes the node after modifications on the tree.
   * @returns {!Promise} a promise which is resolved when the layout has been executed.
   * @param {?INode} centerNode
   * @param {!Set.<INode>} incrementalNodes
   * @param {boolean} collapse
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
    const treeLayout = this.createConfiguredLayout(true)

    // create the layout (with a stage that fixes the center node in the coordinate system)
    const layout = new FixNodeLayoutStage(new TreeReductionStage(treeLayout))

    const layoutData = new CompositeLayoutData()
    if (centerNode) {
      // we mark a node as the center node
      layoutData.items.add(new FixNodeLayoutData({ fixedNodes: centerNode }))
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
      this.createConfiguredLayoutData(this.filteredGraph, collapse ? incrementalNodes : undefined)
    )

    // configure a LayoutExecutor
    const executor = new LayoutExecutor({
      graphComponent: this.graphComponent,
      layout,
      layoutData,
      animateViewport: centerNode === null,
      easedAnimation: true,
      duration: '0.5s',
      fixPorts: true
    })

    await executor.start()
    this.limitViewport()
    // the commands CanExecute state might have changed - trigger a requery
    ICommand.invalidateRequerySuggested()
    this.doingLayout = false
  }

  /**
   * Moves incremental nodes to a location between their neighbors before expanding for a smooth animation.
   * @param {!Set.<INode>} incrementalNodes
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
   * @param {!IGraph} graph
   * @param {!Set.<INode>} incrementalNodes
   * @returns {!TreeLayoutData}
   */
  createConfiguredLayoutData(graph = null, incrementalNodes = new Set()) {
    const hasIncrementalParent = node =>
      graph.inDegree(node) > 0 && incrementalNodes.has(graph.predecessors(node).first())

    return new TreeLayoutData({
      assistantNodes: node =>
        this.isAssistantNode(node) && graph.inDegree(node) > 0 && !hasIncrementalParent(node),
      outEdgeComparers: this.outEdgeComparers,
      nodeTypes: this.nodeTypesMapping,
      compactNodePlacerStrategyMementos: this.compactNodePlacerStrategyMementos
    })
  }

  /**
   * Creates a tree layout that handles assistant nodes and stack leaf nodes.
   * @returns {!ILayoutAlgorithm} A configured TreeLayout.
   * @param {boolean} incremental
   */
  createConfiguredLayout(incremental) {
    const treeLayout = new TreeLayout()
    treeLayout.defaultPortAssignment = new (class extends BaseClass(ITreeLayoutPortAssignment) {
      /**
       * @param {!LayoutGraph} graph
       * @param {!YNode} node
       */
      assignPorts(graph, node) {
        const inEdge = node.firstInEdge
        if (inEdge) {
          graph.setTargetPointRel(inEdge, YPoint.ORIGIN)
        }
        const halfHeight = graph.getSize(node).height / 2
        for (const outEdge of node.outEdges) {
          graph.setSourcePointRel(outEdge, new YPoint(0, halfHeight))
        }
      }
    })()

    if (incremental) {
      treeLayout.defaultOutEdgeComparer = IComparer.create((edge1, edge2) => {
        const y1 = edge1.graph.getCenterY(edge1.target)
        const y2 = edge2.graph.getCenterY(edge2.target)
        if (y1 === y2) {
          const x1 = edge1.graph.getCenterX(edge1.target)
          const x2 = edge2.graph.getCenterX(edge2.target)
          if (x1 === x2) {
            return 0
          }
          return x1 < x2 ? -1 : 1
        }
        return y1 < y2 ? -1 : 1
      })
    }

    // we let the CompactNodePlacer arrange the nodes
    treeLayout.defaultNodePlacer = new CompactNodePlacer()

    // layout stages used to place nodes at barycenter for smoother layout animations
    treeLayout.appendStage(new PlaceNodesAtBarycenterStage())

    return new TreeReductionStage(treeLayout)
  }

  /**
   * Set up a ViewportLimiter that makes sure that the explorable region doesn't exceed the graph size.
   */
  limitViewport() {
    this.graphComponent.updateContentRect(new Insets(100))
    const limiter = this.graphComponent.viewportLimiter
    limiter.honorBothDimensions = false
    limiter.bounds = this.graphComponent.contentRect
  }

  /**
   * @param {!Iterable.<INode>} nodes
   */
  addToHiddenNodes(nodes) {
    for (const node of nodes) {
      this.hiddenNodesSet.add(node)
    }
  }

  /**
   * Set the collapsed state to all the node's ports.
   * @param {!INode} node
   * @param {boolean} collapsed
   */
  updateCollapsedState(node, collapsed) {
    for (const outEdge of this.completeGraph.outEdgesAt(node)) {
      this.onCollapsedStateUpdated(outEdge.sourcePort, collapsed)
    }
  }

  /**
   * Restores the group containing the given node if needed.
   * @param {!IGraph} graph
   * @param {!Set.<INode>} hiddenNodesSet
   * @param {!INode} node
   */
  static restoreGroup(graph, hiddenNodesSet, node) {
    const parent = graph.getParent(node)
    if (parent && hiddenNodesSet.has(parent)) {
      hiddenNodesSet.delete(parent)
    }
  }

  /**
   * Removes all groups in the given graph that will be empty after removing the given nodes.
   * @param {!Set.<INode>} nodesToHide
   */
  removeEmptyGroups(nodesToHide) {
    const emptyGroups = CollapsibleTree.findEmptyGroups(this.filteredGraph, nodesToHide).toArray()
    for (const group of emptyGroups) {
      this.hiddenNodesSet.add(group)
    }
  }

  /**
   * @param {!IGraph} graph
   * @param {!Set.<INode>} nodesToHide
   * @returns {!IEnumerable.<INode>}
   */
  static findEmptyGroups(graph, nodesToHide) {
    return graph.nodes.filter(
      node =>
        graph.isGroupNode(node) &&
        graph.degree(node) === 0 &&
        graph.getChildren(node).every(child => nodesToHide.has(child))
    )
  }

  /**
   * @returns {!Set.<INode>} all descendants of the passed node excluding the node itself.
   * @param {!IGraph} graph
   * @param {!INode} root
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
   * @param {!IGraph} graph
   * @param {!INode} excludedRoot
   * @returns {!Set.<INode>}
   */
  static collectAllNodesExceptSubtree(graph, excludedRoot) {
    const subtree = this.collectDescendants(graph, excludedRoot)
    subtree.add(excludedRoot)
    return new Set(graph.nodes.filter(node => !subtree.has(node)))
  }

  /**
   * Informs the listener that the graph was updated.
   */
  onGraphUpdated() {
    this.graphUpdatedListener?.()
  }

  /**
   * Informs the listener that the collapsed state was updated.
   * @param {!IPort} port
   * @param {boolean} collapsed
   */
  onCollapsedStateUpdated(port, collapsed) {
    this.collapsedStateUpdatedListener?.(port, collapsed)
  }
}
