/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Edge,
  FilteredGraphWrapper,
  FixNodeLayoutData,
  FixNodeLayoutStage,
  GraphComponent,
  ICommand,
  IComparer,
  IEdge,
  IGraph,
  ILayoutAlgorithm,
  IMapper,
  IModelItem,
  INode,
  Insets,
  ITreeLayoutPortAssignment,
  LayoutExecutor,
  LayoutGraph,
  Mapper,
  PlaceNodesAtBarycenterStage,
  PlaceNodesAtBarycenterStageData,
  StringTemplatePortStyle,
  TreeLayout,
  TreeLayoutData,
  TreeReductionStage,
  YNode,
  YPoint
} from 'yfiles'

export default class OrgChartGraph {
  private readonly hiddenNodesSet: Set<INode> = new Set()
  private readonly graphComponent: GraphComponent
  public readonly completeGraph: IGraph
  public readonly filteredGraph: FilteredGraphWrapper
  private doingLayout = false
  // once the nodes have been arranged, remember their arrangement strategy for a more stable layout upon changes
  private readonly compactNodePlacerStrategyMementos: IMapper<INode, any> = new Mapper()

  /**
   * Creates a new instance of this class.
   */
  constructor(graphComponent: GraphComponent, completeGraph: IGraph) {
    this.graphComponent = graphComponent
    this.completeGraph = completeGraph
    this.filteredGraph = new FilteredGraphWrapper(
      completeGraph,
      (node: INode): boolean => !this.hiddenNodesSet.has(node)
    )
  }

  /**
   * Hides the children of the given node or port.
   */
  async executeHideChildren(item: INode): Promise<void> {
    if (!this.canExecuteHideChildren(item)) {
      return Promise.resolve()
    }

    const wrappedGraph = this.filteredGraph.wrappedGraph!
    const incrementalNodes = OrgChartGraph.collectSubtreeNodes(wrappedGraph, item)
    // change the tag of the node to collapsed is true to change the style of the port
    incrementalNodes.concat([item]).forEach(node => {
      wrappedGraph.outEdgesAt(node).forEach(childEdge => {
        ;(childEdge.sourcePort!.style as StringTemplatePortStyle).styleTag = { collapsed: true }
      })
    })
    // remove empty groups
    OrgChartGraph.findEmptyGroups(this.filteredGraph, incrementalNodes).forEach(n => {
      this.hiddenNodesSet.add(n)
    })
    this.filteredGraph.nodePredicateChanged()
    await this.refreshLayout(item, incrementalNodes, true)
    incrementalNodes.forEach(n => {
      this.hiddenNodesSet.add(n)
    })
    // inform the filter that the predicate changed and thus the graphs needs to be updated
    this.filteredGraph.nodePredicateChanged()
  }

  /**
   * Determines whether the children of the given node or port can be hidden.
   * @return Whether the children of the given node or port can be hidden.
   */
  canExecuteHideChildren(item: INode): boolean {
    return !this.doingLayout && this.filteredGraph.outDegree(item) > 0
  }

  /**
   * Shows the children of the given node or port.
   */
  executeShowChildren(item: INode): Promise<void> {
    if (!this.canExecuteShowChildren(item)) {
      return Promise.resolve()
    }

    const wrappedGraph = this.filteredGraph.wrappedGraph!
    const incrementalNodes = OrgChartGraph.collectSubtreeNodes(wrappedGraph, item)
    wrappedGraph.outEdgesAt(item).forEach(childEdge => {
      const child = childEdge.targetNode!
      this.hiddenNodesSet.delete(child)
      OrgChartGraph.restoreGroup(this.completeGraph, this.hiddenNodesSet, child)
      // change the tag of the node to collapsed is false to change the style of the port
      ;(childEdge.sourcePort!.style as StringTemplatePortStyle).styleTag = { collapsed: false }
    })
    // inform the filter that the predicate changed and thus the graphs needs to be updated
    this.filteredGraph.nodePredicateChanged()

    return this.refreshLayout(item, incrementalNodes, false)
  }

  /**
   * Determines whether the children of the given node or port can be shown.
   * @return Whether the children of the given node or port can be shown.
   */
  canExecuteShowChildren(item: INode): boolean {
    return (
      !this.doingLayout &&
      this.filteredGraph.outDegree(item) !== this.filteredGraph.wrappedGraph!.outDegree(item)
    )
  }

  /**
   * Shows the parent of the given node.
   */
  executeShowParent(node: INode): Promise<void> {
    if (this.doingLayout) {
      return Promise.resolve()
    }
    const incrementalNodes: INode[] = []
    this.filteredGraph.wrappedGraph!.inEdgesAt(node).forEach(parentEdge => {
      const parent = parentEdge.sourceNode!
      this.hiddenNodesSet.delete(parent)
      OrgChartGraph.restoreGroup(this.completeGraph, this.hiddenNodesSet, parent)
      incrementalNodes.push(parent)
    })
    // inform the filter that the predicate changed and thus the graphs needs to be updated
    this.filteredGraph.nodePredicateChanged()

    return this.refreshLayout(node, incrementalNodes, false)
  }

  /**
   * Determines whether the parent of the given node can be shown.
   * @return Whether the parent of the given node can be shown.
   */
  canExecuteShowParent(node: INode): boolean {
    return (
      !this.doingLayout &&
      this.filteredGraph.inDegree(node) === 0 &&
      this.filteredGraph.wrappedGraph!.inDegree(node) > 0
    )
  }

  /**
   * Hides the parent of the given node.
   */
  async executeHideParent(node: INode): Promise<void> {
    if (this.doingLayout) {
      return Promise.resolve()
    }
    const nodes = OrgChartGraph.collectAllNodesExceptSubtree(this.filteredGraph.wrappedGraph!, node)
    // remove empty groups
    OrgChartGraph.findEmptyGroups(this.filteredGraph, nodes).forEach(n => {
      this.hiddenNodesSet.add(n)
    })
    this.filteredGraph.nodePredicateChanged()
    await this.refreshLayout(node, nodes, true)

    nodes.forEach(n => {
      this.hiddenNodesSet.add(n)
    })
    // inform the filter that the predicate changed and thus the graphs needs to be updated
    this.filteredGraph.nodePredicateChanged()
  }

  /**
   * Determines whether the parent of the given node can be hidden.
   * @return Whether the parent of the given node can be hidden.
   */
  canExecuteHideParent(node: INode): boolean {
    return !this.doingLayout && this.filteredGraph.inDegree(node) > 0
  }

  /**
   * Shows all nodes.
   */
  executeShowAll(): Promise<void> {
    if (this.doingLayout) {
      return Promise.resolve()
    }
    const incrementalNodes = Array.from(this.hiddenNodesSet)
    this.hiddenNodesSet.clear()

    // set the collapsed tag as false for all source ports for the edge in the original graph, so that the style for
    // the all ports will be MINUS
    this.filteredGraph.wrappedGraph!.edges.forEach(edge => {
      ;(edge.sourcePort!.style as StringTemplatePortStyle).styleTag = { collapsed: false }
    })

    // inform the filter that the predicate changed and thus the graphs needs to be updated
    this.filteredGraph.nodePredicateChanged()

    return this.refreshLayout(
      this.graphComponent.currentItem as INode | null,
      incrementalNodes,
      false
    )
  }

  /**
   * Determines whether 'show all' can be executed.
   * @return Whether 'show all' can be executed.
   */
  canExecuteShowAll(): boolean {
    return this.hiddenNodesSet.size !== 0 && !this.doingLayout
  }

  /**
   * Applies the initial layout to the graph, without
   */
  applyInitialLayout(): void {
    if (this.doingLayout) {
      return
    }
    this.hiddenNodesSet.clear()
    // inform the filter that the predicate changed and thus the graphs needs to be updated
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
   */
  zoomToItem(item: IModelItem): void {
    if (!(item instanceof INode)) {
      return
    }
    if (!this.filteredGraph.nodes.includes(item)) {
      // the given node is hidden, make it visible

      // un-hide all nodes ...
      this.hiddenNodesSet.clear()
      // ... except the node to be displayed and all its descendants
      OrgChartGraph.collectAllNodesExceptSubtree(this.filteredGraph.wrappedGraph!, item).forEach(
        n => {
          this.hiddenNodesSet.add(n)
        }
      )
      // inform the filter that the predicate changed and thus the graphs needs to be updated
      this.filteredGraph.nodePredicateChanged()

      this.filteredGraph.applyLayout(
        this.createConfiguredLayout(false),
        this.createConfiguredLayoutData(this.filteredGraph)
      )
      this.limitViewport()
    }

    this.graphComponent.currentItem = item
    ICommand.ZOOM_TO_CURRENT_ITEM.execute(null, this.graphComponent)
  }

  /**
   * Refreshes the node after modifications on the tree.
   * @return a promise which is resolved when the layout has been executed.
   */
  async refreshLayout(
    centerNode: INode | null,
    incrementalNodes: INode[],
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
          affectedNodes: (node: INode): boolean => incrementalNodes.indexOf(node) >= 0
        })
      )
    }

    layoutData.items.add(
      this.createConfiguredLayoutData(this.filteredGraph, collapse ? incrementalNodes : [])
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

    try {
      await executor.start()
      this.limitViewport()
      // the commands CanExecute state might have changed - trigger a requery
      ICommand.invalidateRequerySuggested()
    } catch (error) {
      if (typeof (window as any).reportError === 'function') {
        ;(window as any).reportError(error)
      } else {
        throw error
      }
    }
    this.doingLayout = false
  }

  /**
   * Moves incremental nodes to a location between their neighbors before expanding for a smooth animation.
   * @private
   */
  prepareSmoothExpandLayoutAnimation(incrementalNodes: INode[]): void {
    const graph = this.graphComponent.graph

    // mark the new nodes and place them between their neighbors
    const layoutData = new PlaceNodesAtBarycenterStageData({
      affectedNodes: (node: INode): boolean => incrementalNodes.indexOf(node) >= 0
    })

    const layout = new PlaceNodesAtBarycenterStage()
    graph.applyLayout(layout, layoutData)
  }

  /**
   * Creates a tree layout data for the tree layout
   * @return A configured TreeLayoutData.
   * @private
   */
  createConfiguredLayoutData(
    graph: IGraph = null!,
    incrementalNodes: INode[] = []
  ): TreeLayoutData {
    const hasIncrementalParent = (node: INode) =>
      graph.inDegree(node) > 0 && incrementalNodes.indexOf(graph.predecessors(node).first()) !== -1
    const firstLevelOutEdgeComparer = (edge1: IEdge, edge2: IEdge): number => {
      // order of the first level person names
      const firstLevelOrder = [
        'Mildred Shark',
        'Amy Kain',
        'David Kerry',
        'Richard Fuller',
        'Angela Haase'
      ]
      const targetNode1 = edge1.targetNode!
      const targetNode2 = edge2.targetNode!
      if (targetNode1.tag && targetNode2.tag) {
        const name1 = targetNode1.tag.name
        const name2 = targetNode2.tag.name
        const name1Idx = firstLevelOrder.indexOf(name1)
        const name2Idx = firstLevelOrder.indexOf(name2)
        if (name1Idx !== -1 && name2Idx !== -1) {
          return name1Idx - name2Idx
        }
      }
      return 0
    }
    return new TreeLayoutData({
      assistantNodes: (node: INode): boolean =>
        node.tag && node.tag.assistant && graph.inDegree(node) > 0 && !hasIncrementalParent(node),
      outEdgeComparers: (node: INode): ((edge1: IEdge, edge2: IEdge) => number) => {
        if (node.tag && node.tag.name === 'Eric Joplin') {
          return firstLevelOutEdgeComparer
        }
        return (): number => 0
      },
      nodeTypes: (node: INode): string | null =>
        node.tag && node.tag.status ? node.tag.status : null,
      compactNodePlacerStrategyMementos: this.compactNodePlacerStrategyMementos
    })
  }

  /**
   * Creates a tree layout that handles assistant nodes and stack leaf nodes.
   * @return A configured TreeLayout.
   * @private
   */
  createConfiguredLayout(incremental: boolean): ILayoutAlgorithm {
    const treeLayout = new TreeLayout()
    treeLayout.defaultPortAssignment = new (class extends BaseClass(ITreeLayoutPortAssignment) {
      assignPorts(graph: LayoutGraph, node: YNode): void {
        const inEdge = node.firstInEdge
        if (inEdge) {
          graph.setTargetPointRel(inEdge, YPoint.ORIGIN)
        }
        const halfHeight = graph.getSize(node).height / 2
        node.outEdges.forEach(outEdge => {
          graph.setSourcePointRel(outEdge, new YPoint(0, halfHeight))
        })
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
   * Setup a ViewportLimiter that makes sure that the explorable region doesn't exceed the graph size.
   */
  limitViewport(): void {
    this.graphComponent.updateContentRect(new Insets(100))
    const limiter = this.graphComponent.viewportLimiter
    limiter.honorBothDimensions = false
    limiter.bounds = this.graphComponent.contentRect
  }

  /**
   * Restores the group of the given node if needed.
   */
  static restoreGroup(graph: IGraph, hiddenNodesSet: Set<INode>, node: INode): void {
    const parent = graph.getParent(node)
    if (parent != null && hiddenNodesSet.has(parent)) {
      hiddenNodesSet.delete(parent)
    }
  }

  /**
   * Returns all groups in the given graph that will be empty after removing the given nodes.
   */
  static findEmptyGroups(graph: IGraph, nodesToHide: INode[]): INode[] {
    return graph.nodes
      .filter(
        node =>
          graph.isGroupNode(node) &&
          graph.degree(node) === 0 &&
          graph.getChildren(node).every(child => nodesToHide.indexOf(child) !== -1)
      )
      .toArray()
  }

  /**
   * Creates an array containing all nodes of the subtree rooted by the given node.
   */
  static collectSubtreeNodes(graph: IGraph, root: INode): INode[] {
    const nodes: INode[] = []
    const stack = [root]
    while (stack.length > 0) {
      const node = stack.pop() as INode
      graph.outEdgesAt(node).forEach(outEdge => {
        stack.unshift(outEdge.targetNode!)
        nodes.push(outEdge.targetNode!)
      })
    }
    return nodes
  }

  /**
   * Creates an array of all nodes except of the nodes in the subtree rooted in the excluded sub-root.
   * @private
   */
  static collectAllNodesExceptSubtree(graph: IGraph, excludedRoot: INode): INode[] {
    const nodes = []
    let root: INode = excludedRoot
    while (graph.inDegree(root) > 0) {
      root = graph.inEdgesAt(root).first().sourceNode!
    }

    const stack = [root]
    while (stack.length > 0) {
      const node = stack.pop() as INode
      if (node !== excludedRoot) {
        nodes.push(node)
        graph.outEdgesAt(node).forEach(outEdge => {
          stack.unshift(outEdge.targetNode!)
        })
      }
    }

    return nodes
  }
}
