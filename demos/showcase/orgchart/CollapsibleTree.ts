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
  type Edge,
  FilteredGraphWrapper,
  FixNodeLayoutData,
  FixNodeLayoutStage,
  type GraphComponent,
  ICommand,
  IComparer,
  type IEdge,
  type IEnumerable,
  type IGraph,
  type ILayoutAlgorithm,
  type IMapper,
  type IModelItem,
  INode,
  Insets,
  type IPort,
  type ItemMapping,
  type ItemMappingConvertible,
  ITreeLayoutPortAssignment,
  LayoutExecutor,
  type LayoutGraph,
  Mapper,
  PlaceNodesAtBarycenterStage,
  PlaceNodesAtBarycenterStageData,
  TreeLayout,
  TreeLayoutData,
  TreeReductionStage,
  type YNode,
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
  private readonly hiddenNodesSet: Set<INode> = new Set()
  readonly filteredGraph: FilteredGraphWrapper

  private doingLayout = false
  // once the nodes have been arranged, remember their arrangement strategy for a more stable layout upon changes
  private readonly compactNodePlacerStrategyMementos: IMapper<INode, unknown> = new Mapper()

  private graphUpdatedListener: (() => void) | null = null
  private collapsedStateUpdatedListener: ((port: IPort, collapsed: boolean) => void) | null = null

  /**
   * Optional predicate that determines whether a node is an assistant. This affects the
   * placement of a node. See also {@link TreeLayoutData#assistantNodes}.
   */
  isAssistantNode: (node: INode) => boolean = () => false

  /**
   * Optional mapping of a node to its type affecting the order of nodes in the layout.
   * See also {@link TreeLayoutData.nodeTypes}.
   */
  nodeTypesMapping: ItemMapping<INode, unknown> | ItemMappingConvertible<INode, unknown> = null

  /**
   * Optional comparer to determine the order of subtrees in the layout.
   * See also {@link TreeLayoutData.outEdgeComparers}.
   */
  outEdgeComparers:
    | ItemMapping<INode, (edge1: IEdge, edge2: IEdge) => number>
    | ItemMappingConvertible<INode, (edge1: IEdge, edge2: IEdge) => number> = () => (): number => 0

  constructor(
    private readonly graphComponent: GraphComponent,
    readonly completeGraph: IGraph = new DefaultGraph()
  ) {
    const nodeFilter = (node: INode): boolean => !this.hiddenNodesSet.has(node)
    this.filteredGraph = new FilteredGraphWrapper(completeGraph, nodeFilter)
  }

  /**
   * Adds an event listener to the graphUpdated event that is fired after the filtered graph
   * has changed and the layout was updated.
   */
  addGraphUpdatedListener(listener: () => void): void {
    this.graphUpdatedListener = delegate.combine(this.graphUpdatedListener, listener)
  }

  removeGraphUpdatedListener(listener: () => void): void {
    this.graphUpdatedListener = delegate.remove(this.graphUpdatedListener, listener)
  }

  /**
   * Adds an event listener to the collapsedStateUpdated event that is fired when the collapsed
   * state of a port has changed.
   */
  addCollapsedStateUpdatedListener(listener: (port: IPort, collapsed: boolean) => void): void {
    this.collapsedStateUpdatedListener = delegate.combine(
      this.collapsedStateUpdatedListener,
      listener
    )
  }

  removeCollapsedStateUpdatedListener(listener: (port: IPort, collapsed: boolean) => void): void {
    this.collapsedStateUpdatedListener = delegate.remove(
      this.collapsedStateUpdatedListener,
      listener
    )
  }

  /**
   * Hides the children of the given node and updates the layout.
   */
  async executeHideChildren(item: INode): Promise<void> {
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
  canExecuteHideChildren(item: INode): boolean {
    return !this.doingLayout && this.filteredGraph.outDegree(item) > 0
  }

  /**
   * Shows the children of the given node and updates the layout.
   */
  async executeShowChildren(item: INode): Promise<void> {
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

  private showChildren(node: INode): void {
    for (const childEdge of this.completeGraph.outEdgesAt(node)) {
      const child = childEdge.targetNode!
      this.hiddenNodesSet.delete(child)
      CollapsibleTree.restoreGroup(this.completeGraph, this.hiddenNodesSet, child)
      this.onCollapsedStateUpdated(childEdge.sourcePort!, false)
    }
  }

  /**
   * @returns Whether the children of the given node can be shown.
   */
  canExecuteShowChildren(item: INode): boolean {
    return (
      !this.doingLayout && this.filteredGraph.outDegree(item) !== this.completeGraph.outDegree(item)
    )
  }

  /**
   * Shows the parent of the given node and updates the layout.
   *
   * In contrast to {@link executeHideParent}, it only shows the
   * direct parent and not any of its children.
   */
  async executeShowParent(node: INode): Promise<void> {
    if (this.doingLayout) {
      return Promise.resolve()
    }

    const incrementalNodes = new Set<INode>()
    this.showParents(node, incrementalNodes)
    this.filteredGraph.nodePredicateChanged()

    await this.refreshLayout(node, incrementalNodes, false)

    this.onGraphUpdated()
  }

  private showParents(node: INode, incrementalNodes: Set<INode>): void {
    for (const parentEdge of this.completeGraph.inEdgesAt(node)) {
      const parent = parentEdge.sourceNode!
      this.hiddenNodesSet.delete(parent)
      CollapsibleTree.restoreGroup(this.completeGraph, this.hiddenNodesSet, parent)
      incrementalNodes.add(parent)
    }
  }

  /**
   * @returns Whether the parent of the given node can be shown.
   */
  canExecuteShowParent(node: INode): boolean {
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
   */
  async executeHideParent(node: INode): Promise<void> {
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
   * @returns Whether the parent of the given node can be hidden.
   */
  canExecuteHideParent(node: INode): boolean {
    return !this.doingLayout && this.filteredGraph.inDegree(node) > 0
  }

  /**
   * Shows all nodes and updates the layout.
   */
  async executeShowAll(): Promise<void> {
    if (this.doingLayout) {
      return Promise.resolve()
    }
    const incrementalNodes = new Set(this.hiddenNodesSet)
    this.hiddenNodesSet.clear()

    for (const edge of this.completeGraph.edges) {
      this.onCollapsedStateUpdated(edge.sourcePort!, false)
    }

    // inform the filter that the predicate changed, and thus the graph needs to be updated
    this.filteredGraph.nodePredicateChanged()

    await this.refreshLayout(
      this.graphComponent.currentItem as INode | null,
      incrementalNodes,
      false
    )

    this.onGraphUpdated()
  }

  /**
   * @returns Whether {@link executeShowAll} can be executed.
   */
  canExecuteShowAll(): boolean {
    return this.hiddenNodesSet.size !== 0 && !this.doingLayout
  }

  /**
   * Applies the initial layout to the graph.
   */
  applyInitialLayout(): void {
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
   */
  zoomToItem(item: IModelItem): void {
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

  private showItem(item: INode): void {
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
   * @returns a promise which is resolved when the layout has been executed.
   */
  private async refreshLayout(
    centerNode: INode | null,
    incrementalNodes: Set<INode>,
    collapse: boolean
  ): Promise<void> {
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
   */
  private prepareSmoothExpandLayoutAnimation(incrementalNodes: Set<INode>): void {
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
  private createConfiguredLayoutData(
    graph: IGraph = null!,
    incrementalNodes: Set<INode> = new Set()
  ): TreeLayoutData {
    const hasIncrementalParent = (node: INode): boolean =>
      graph.inDegree(node) > 0 && incrementalNodes.has(graph.predecessors(node).first())

    return new TreeLayoutData({
      assistantNodes: (node: INode): boolean =>
        this.isAssistantNode(node) && graph.inDegree(node) > 0 && !hasIncrementalParent(node),
      outEdgeComparers: this.outEdgeComparers,
      nodeTypes: this.nodeTypesMapping,
      compactNodePlacerStrategyMementos: this.compactNodePlacerStrategyMementos
    })
  }

  /**
   * Creates a tree layout that handles assistant nodes and stack leaf nodes.
   * @returns A configured TreeLayout.
   */
  private createConfiguredLayout(incremental: boolean): ILayoutAlgorithm {
    const treeLayout = new TreeLayout()
    treeLayout.defaultPortAssignment = new (class extends BaseClass(ITreeLayoutPortAssignment) {
      assignPorts(graph: LayoutGraph, node: YNode): void {
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
      treeLayout.defaultOutEdgeComparer = IComparer.create<Edge>(
        (edge1: Edge, edge2: Edge): number => {
          const y1 = (edge1.graph as LayoutGraph).getCenterY(edge1.target)
          const y2 = (edge2.graph as LayoutGraph).getCenterY(edge2.target)
          if (y1 === y2) {
            const x1 = (edge1.graph as LayoutGraph).getCenterX(edge1.target)
            const x2 = (edge2.graph as LayoutGraph).getCenterX(edge2.target)
            if (x1 === x2) {
              return 0
            }
            return x1 < x2 ? -1 : 1
          }
          return y1 < y2 ? -1 : 1
        }
      )
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
  private limitViewport(): void {
    this.graphComponent.updateContentRect(new Insets(100))
    const limiter = this.graphComponent.viewportLimiter
    limiter.honorBothDimensions = false
    limiter.bounds = this.graphComponent.contentRect
  }

  private addToHiddenNodes(nodes: Iterable<INode>): void {
    for (const node of nodes) {
      this.hiddenNodesSet.add(node)
    }
  }

  /**
   * Set the collapsed state to all the node's ports.
   */
  private updateCollapsedState(node: INode, collapsed: boolean): void {
    for (const outEdge of this.completeGraph.outEdgesAt(node)) {
      this.onCollapsedStateUpdated(outEdge.sourcePort!, collapsed)
    }
  }

  /**
   * Restores the group containing the given node if needed.
   */
  private static restoreGroup(graph: IGraph, hiddenNodesSet: Set<INode>, node: INode): void {
    const parent = graph.getParent(node)
    if (parent && hiddenNodesSet.has(parent)) {
      hiddenNodesSet.delete(parent)
    }
  }

  /**
   * Removes all groups in the given graph that will be empty after removing the given nodes.
   */
  private removeEmptyGroups(nodesToHide: Set<INode>): void {
    const emptyGroups = CollapsibleTree.findEmptyGroups(this.filteredGraph, nodesToHide).toArray()
    for (const group of emptyGroups) {
      this.hiddenNodesSet.add(group)
    }
  }

  private static findEmptyGroups(graph: IGraph, nodesToHide: Set<INode>): IEnumerable<INode> {
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
  private static collectDescendants(graph: IGraph, root: INode): Set<INode> {
    const nodes = new Set<INode>()
    const queue = [root]
    while (queue.length > 0) {
      const node = queue.pop()!
      for (const outEdge of graph.outEdgesAt(node)) {
        queue.unshift(outEdge.targetNode!)
        nodes.add(outEdge.targetNode!)
      }
    }
    return nodes
  }

  /**
   * Creates an array of all nodes excluding the nodes in the subtree rooted in the excluded sub-root.
   */
  private static collectAllNodesExceptSubtree(graph: IGraph, excludedRoot: INode): Set<INode> {
    const subtree = CollapsibleTree.collectDescendants(graph, excludedRoot)
    subtree.add(excludedRoot)
    return new Set(graph.nodes.filter((node) => !subtree.has(node)))
  }

  /**
   * Informs the listener that the graph was updated.
   */
  private onGraphUpdated(): void {
    this.graphUpdatedListener?.()
  }

  /**
   * Informs the listener that the collapsed state was updated.
   */
  private onCollapsedStateUpdated(port: IPort, collapsed: boolean): void {
    this.collapsedStateUpdatedListener?.(port, collapsed)
  }
}
