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
  ClearAreaLayout,
  ClearAreaLayoutData,
  CompositeLayoutData,
  EdgeRouter,
  EdgeRouterData,
  EdgeRouterScope,
  FillAreaLayout,
  FillAreaLayoutData,
  HierarchicLayout,
  HierarchicLayoutEdgeLayoutDescriptor,
  HierarchicLayoutEdgeRoutingStyle,
  HierarchicLayoutRoutingStyle,
  IEdge,
  IEnumerable,
  IFoldingView,
  ILayoutAlgorithm,
  INode,
  INodeInsetsProvider,
  ItemEventArgs,
  LayoutData,
  LayoutExecutor,
  Maps,
  NavigationInputMode,
  NodeAlignmentPolicy,
  PartialLayoutEdgeRoutingStrategy,
  Point,
  Rect,
  SequentialLayout,
  YRectangle
} from 'yfiles'

/**
 * A helper class that customizes the {@link NavigationInputMode.ExpandGroup.expand}
 * and {@link NavigationInputMode.CollapseGroup.collapse} operations of the
 * {@link NavigationInputMode}.
 * - Expanding a group node shifts elements to avoid overlaps.
 * - Collapsing a group node additional fills up vacated space to increase compactness.
 */
export class ExpandCollapseNavigationHelper {
  private readonly navigationInputMode: NavigationInputMode

  /**
   * The layout algorithm applied to the subgraph of a folder node before it is expanded.
   * By default, the {@link HierarchicLayout} is used.
   * If no layout is set, no new layout for the subgraph is calculated.
   */
  private readonly subgraphLayout: ILayoutAlgorithm

  private readonly interEdgeRouter: EdgeRouter

  constructor(navigationInputMode: NavigationInputMode) {
    this.navigationInputMode = navigationInputMode

    // the default behavior of the navigation input mode is undesirable in our particular case
    navigationInputMode.autoGroupNodeAlignmentPolicy = NodeAlignmentPolicy.NONE
    navigationInputMode.fitContentAfterGroupActions = false

    // register handler that moves overlapping elements after expanding a group node
    navigationInputMode.addGroupExpandingListener(this.onGroupExpanding.bind(this))
    navigationInputMode.addGroupExpandedListener(this.onGroupExpanded.bind(this))

    // register handler that fills up free space after collapsing a group node
    navigationInputMode.addGroupCollapsingListener(this.onGroupCollapsing.bind(this))
    navigationInputMode.addGroupCollapsedListener(this.onGroupCollapsed.bind(this))

    this.subgraphLayout = new HierarchicLayout({
      recursiveGroupLayering: false,
      edgeLayoutDescriptor: new HierarchicLayoutEdgeLayoutDescriptor({
        routingStyle: new HierarchicLayoutRoutingStyle({
          defaultEdgeRoutingStyle: HierarchicLayoutEdgeRoutingStyle.ORTHOGONAL
        })
      })
    })

    this.interEdgeRouter = new EdgeRouter({
      scope: EdgeRouterScope.ROUTE_AFFECTED_EDGES
    })
  }

  /**
   * Prepares the layout of the content of the folded group node which is about to expand.
   */
  private onGroupExpanding(sender: object, e: ItemEventArgs<INode>): void {
    const groupNode = e.item
    const foldingView = this.navigationInputMode.graph!.foldingView
    const masterGroupNode = foldingView!.getMasterItem(groupNode)

    // layout subgraph
    this.prepareSubgraph(groupNode, foldingView!, masterGroupNode!)
  }

  /**
   * Clears the area covered by the expanded groupNode to avoid overlaps.
   */
  private onGroupExpanded(sender: object, e: ItemEventArgs<INode>): void {
    const groupNode = e.item
    // clear the area of the expanded group node from other graph items
    this.clearArea(groupNode)
  }

  /**
   * Layouts the content of the group node with {@link subgraphLayout} and calls {@link centerSubgraph}.
   */
  private prepareSubgraph(node: INode, foldingView: IFoldingView, masterGroupNode: INode): void {
    // We create a temporary second FoldingView where we already expand 'node'.
    // This tempView already has the FolderNodeStates and FoldingEdgeStates applied so we can work directly on this view
    // to get and set correct layout information.
    const tempView = foldingView.manager.createFoldingView(masterGroupNode, n =>
      foldingView.isExpanded(n)
    )

    // Apply a nice layout to the subgraph.
    if (this.subgraphLayout != null) {
      tempView.graph.applyLayout({
        layout: this.subgraphLayout
      })
    }
    tempView.localRoot = foldingView.localRoot

    // After that the group node is expanded in tempView and the subgraph is moved to its center
    tempView.expand(masterGroupNode)
    this.centerSubgraph(node, foldingView, tempView)
  }

  /**
   * Centers the content of node and returns the bounds of the expanded group node.
   * @param node the node to center
   * @param foldingView the folding view
   * @param tempView the temporary folding view
   */
  protected centerSubgraph(node: INode, foldingView: IFoldingView, tempView: IFoldingView): void {
    const masterGroupNode = foldingView.getMasterItem(node)
    const tempViewGroupNode = tempView.getViewItem(masterGroupNode!)
    const tempViewDescendents = tempView.graph.groupingSupport
      .getDescendantsBottomUp(tempViewGroupNode)
      .toList()

    // calculate the bounds of all descendents
    const bounds = this.calculateSubgraphBounds(tempView, tempViewDescendents)

    // move the descendents so the bounds are centered on the 'node' center
    const center = node.layout.center
    const diffVector = center.subtract(bounds.center)
    this.moveSubgraph(tempView, tempViewDescendents, diffVector)

    // clear bends of edges attached to the expanded 'node'
    foldingView.graph.edgesAt(node).forEach(edge => {
      const masterEdge = foldingView.getMasterItem(edge)
      if (
        masterEdge!.sourceNode !== masterGroupNode &&
        masterEdge!.targetNode !== masterGroupNode
      ) {
        tempView.graph.clearBends(tempView.getViewItem(masterEdge!)!)
      }
    })

    // calculate the bounds of the expanded group node
    let groupNodeBounds = bounds.getTranslated(diffVector)
    const insetsProvider = node.lookup(INodeInsetsProvider.$class) as INodeInsetsProvider
    if (insetsProvider != null) {
      // respect the insets of the group node
      const insets = insetsProvider.getInsets(node)
      groupNodeBounds = groupNodeBounds.getEnlarged(insets)
    }
    // set the layout of the expanded state
    tempView.graph.setNodeLayout(tempViewGroupNode!, groupNodeBounds)
  }

  /**
   * Calculates the bounds of the subgraph determined by the subGraphNodes
   * living in the tempView.
   * @param tempView the folding view containing the subGraphNodes
   * @param subGraphNodes the sub graph nodes to use for bounds calculation
   */
  private calculateSubgraphBounds(tempView: IFoldingView, subGraphNodes: IEnumerable<INode>): Rect {
    // calculate the bounds of all descendents
    let bounds = Rect.EMPTY

    subGraphNodes.forEach(child => {
      bounds = Rect.add(bounds, child.layout.toRect())
      // consider node labels that may be external

      child.labels.forEach(label => {
        bounds = Rect.add(bounds, label.layout.bounds)
      })

      tempView.graph.edgesAt(child).forEach(edge => {
        if (subGraphNodes.includes(edge.opposite(child) as INode)) {
          // edge is between nodes in the subgraph, so consider its bends
          edge.bends.forEach(bend => {
            bounds = bounds.add(bend.location.toPoint())
          })
        }
      })
    })

    return bounds
  }

  /**
   * Moves the subgraph determined by the subGraphNodes living in the tempView by vectorToMove.
   * @param tempView the view containing the subgraph nodes
   * @param subGraphNodes the subgraph nodes
   * @param vectorToMove the vector to move the subgraph
   */
  private moveSubgraph(
    tempView: IFoldingView,
    subGraphNodes: IEnumerable<INode>,
    vectorToMove: Point
  ): void {
    const movedEdges = Maps.createHashSet<IEdge>()!

    subGraphNodes.forEach(tempViewDescendent => {
      tempView.graph.setNodeLayout(
        tempViewDescendent,
        tempViewDescendent.layout.toRect().getTranslated(vectorToMove)
      )

      tempView.graph.edgesAt(tempViewDescendent).forEach(edge => {
        if (!movedEdges.includes(edge)) {
          movedEdges.add(edge)
          edge.bends.forEach(bend => {
            tempView.graph.setBendLocation(bend, bend.location.toPoint().add(vectorToMove))
          })
        }
      })
    })
  }

  /**
   * Adjusts the folded node state and the paths of the attached edges to those of the
   * expanded group node which is about to collapse.
   */
  private onGroupCollapsing(sender: object, e: ItemEventArgs<INode>): void {
    const groupNode = e.item
    const foldingView = this.navigationInputMode.graph!.foldingView

    // adjust the folded node state and attached edges
    this.prepareFoldedState(groupNode, foldingView!)
  }

  /**
   * Reduces the amount of free space after the group node has been collapsed and is probably
   * smaller.
   */
  private onGroupCollapsed(sender: object, e: ItemEventArgs<INode>): void {
    const groupNode = e.item
    const foldingView = this.navigationInputMode.graph!.foldingView

    const masterGroupNode = foldingView!.getMasterItem(groupNode)
    const groupLayout = masterGroupNode!.layout.toRect()
    const folderLayout = foldingView!.manager.getFolderNodeState(masterGroupNode!).layout

    if (groupLayout.contains(folderLayout)) {
      this.fillArea(groupNode, groupLayout, foldingView!)
    } else {
      // the folder node exceeds the area of the group node
      const combinedBounds = Rect.add(groupLayout.toRect()!, folderLayout.toRect()!)
      this.clearAndFillArea(groupNode, combinedBounds, foldingView!)
    }
  }

  /**
   * Adjusts the folded node state and the paths of the attached edges to those of the expanded group node.
   */
  private prepareFoldedState(groupNode: INode, foldingView: IFoldingView): void {
    // use a second folding view where group node can already be collapsed so we can easily adjust its layout and attached edges
    const tempView = foldingView.manager.createFoldingView(foldingView.localRoot, node =>
      foldingView.isExpanded(node)
    )

    const masterGroupNode = foldingView.getMasterItem(groupNode)
    tempView.collapse(masterGroupNode!)

    // move the folder node layout to the center of the expanded group node state
    const tempViewFolderNode = tempView.getViewItem(masterGroupNode!)
    tempView.graph.setNodeCenter(tempViewFolderNode!, groupNode.layout.center)

    // transfer path of edges on folder node
    tempView.graph.edgesAt(tempViewFolderNode!).forEach(tempEdge => {
      const masterEdge = tempView.getMasterItem(tempEdge)
      const viewEdge = foldingView.getViewItem(masterEdge!)

      tempView.graph.clearBends(tempEdge)
      viewEdge!.bends.forEach(bend => {
        tempView.graph.addBend(tempEdge, bend.location.toPoint())
      })
    })
  }

  /**
   * Clears the area of the groupNode of graph items other then group node and its descendents.
   * @param groupNode The group node whose area should be cleared.
   */
  protected clearArea(groupNode: INode): void {
    // configure ClearAreaLayout to make a clear area using the bounds of the group node
    const layout = ExpandCollapseNavigationHelper.createClearAreaLayout()
    const layoutData = ExpandCollapseNavigationHelper.createClearAreaLayoutData(groupNode)
    // noinspection JSIgnoredPromiseFromCall
    this.runLayout(layout, layoutData)
  }

  /**
   * Reduces the empty space in area by moving outer nodes closer to and into it.
   */
  protected fillArea(groupNode: INode, area: Rect, foldingView: IFoldingView): void {
    const layout = this.createFillAreaLayout(area)
    const layoutData = ExpandCollapseNavigationHelper.createFillAreaLayoutData(
      groupNode,
      foldingView
    )
    // noinspection JSIgnoredPromiseFromCall
    this.runLayout(layout, layoutData)
  }

  /**
   * Clears the area of the groupNode layout of graph items other then group node and its
   * descendents and reduces empty space afterwards.
   */
  protected clearAndFillArea(groupNode: INode, area: Rect, foldingView: IFoldingView): void {
    const layout = new SequentialLayout()
    layout.appendLayout(ExpandCollapseNavigationHelper.createClearAreaLayout())
    layout.appendLayout(this.createFillAreaLayout(area))

    const layoutData = new CompositeLayoutData(
      ExpandCollapseNavigationHelper.createClearAreaLayoutData(groupNode),
      ExpandCollapseNavigationHelper.createFillAreaLayoutData(groupNode, foldingView)
    )

    // noinspection JSIgnoredPromiseFromCall
    this.runLayout(layout, layoutData)
  }

  /**
   * Creates a {@link ClearAreaLayout} that clears the area of an expanded group node by
   * moving intersecting elements. The location of the group node and its descendants are not
   * changed. The group node is specified in {@link createClearAreaLayoutData}.
   */
  private static createClearAreaLayout(): ILayoutAlgorithm {
    return new ClearAreaLayout({
      spacing: 20,
      considerNodeLabels: false,
      edgeRoutingStrategy: PartialLayoutEdgeRoutingStrategy.ORTHOGONAL,
      fixPorts: false
    })
  }

  /**
   * Creates a {@link ClearAreaLayoutData} that specifies that the area covered by
   * groupNode must be cleared.
   */
  private static createClearAreaLayoutData(groupNode: INode): LayoutData {
    return new ClearAreaLayoutData({
      areaNodes: groupNode
    })
  }

  /**
   * Creates an {@link ILayoutAlgorithm} that fills the area covered by the expanded group node
   * (that is now collapsed and probably smaller) with other graph elements by moving nearby
   * elements towards it. In addition, it  re-routes the adjacent edges of the group node.
   * @param area the area to be filled
   */
  private createFillAreaLayout(area: Rect): ILayoutAlgorithm {
    const fillAreaLayout = new FillAreaLayout({
      area: new YRectangle(area.x, area.y, area.width, area.height),
      spacing: 20
    })
    const layout = new SequentialLayout()
    layout.appendLayout(this.interEdgeRouter)
    layout.appendLayout(fillAreaLayout)
    return layout
  }

  /**
   * Creates a {@link LayoutData} which specifies that the {@link createFillAreaLayout}
   * should keep the location of collapsed group node fixed and that the adjacent edges of the
   *group should be re-routed.
   */
  private static createFillAreaLayoutData(groupNode: INode, foldingView: IFoldingView): LayoutData {
    return new CompositeLayoutData(
      new FillAreaLayoutData({ fixedNodes: groupNode }),
      new EdgeRouterData({ affectedEdges: foldingView.graph.edgesAt(groupNode) })
    )
  }

  private async runLayout(layout: ILayoutAlgorithm, layoutData: LayoutData): Promise<void> {
    const layoutExecutor = new LayoutExecutor({
      graphComponent: this.navigationInputMode.graphComponent!,
      layout: layout,
      layoutData: layoutData,
      duration: '150ms'
    })
    await layoutExecutor.start()
  }
}
