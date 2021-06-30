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
  CompositeLayoutData,
  FixNodeLayoutData,
  FixNodeLayoutStage,
  FixPointPolicy,
  GivenCoordinatesStage,
  GivenCoordinatesStageData,
  GraphComponent,
  GraphInputMode,
  GroupingSupport,
  HierarchicLayout,
  HierarchicLayoutData,
  HierarchicLayoutEdgeRoutingStyle,
  HierarchicLayoutRoutingStyle,
  IBend,
  IEdge,
  IEnumerable,
  IGraph,
  IMapper,
  INode,
  IPoint,
  IRectangle,
  ISize,
  LayoutExecutor,
  LayoutMode,
  List,
  Mapper,
  NodeAlignmentPolicy,
  Point,
  Rect,
  RecursiveEdgeStyle,
  Size
} from 'yfiles'

export default class HierarchicGrouping {
  /**
   * The graph component associated with this instance.
   */
  graphComponent: GraphComponent
  /**
   * The last group node that was collapsed/expanded.
   */
  changedGroupNode: INode = null!
  /**
   * A mapper containing alternative bounds for the collapsed/expanded group node.
   */
  alternativeGroupBounds: Mapper<INode, IRectangle>
  /**
   * A mapper containing alternative path for the edges connecting to groups,
   * group content or folder nodes.
   */
  alternativeEdgePaths: Mapper<IEdge, List<IPoint>>

  constructor(graphComponent: GraphComponent) {
    this.graphComponent = graphComponent

    this.alternativeGroupBounds = new Mapper()
    this.alternativeEdgePaths = new Mapper()

    this.configureInputMode(graphComponent.inputMode as GraphInputMode)
  }

  /**
   * Enables the folding commands on the <code>navigationInputMode</code> of the provided <code>inputMode</code> and
   * registers event listeners for the expand and collapse commands that trigger the automatic layout.
   *
   * @param inputMode The input mode to be configured.
   * @private
   */
  configureInputMode(inputMode: GraphInputMode): void {
    // Create an input mode and set a group node alignment policy that makes sure that the
    // expand/collapse button of the current group node keeps its location.
    // Note that the corresponding 'fix point policy' is used for the FixNodeLayoutStage in
    // the incremental layout calculation.
    const navigationInputMode = inputMode.navigationInputMode
    navigationInputMode.autoGroupNodeAlignmentPolicy = NodeAlignmentPolicy.TOP_RIGHT

    // Allow folding commands
    navigationInputMode.allowCollapseGroup = true
    navigationInputMode.allowExpandGroup = true

    // FitContent interferes with our view port animation setup
    navigationInputMode.fitContentAfterGroupActions = false

    navigationInputMode.addGroupExpandingListener((sender, evt) =>
      this.beforeExpandingGroup(evt.item)
    )
    navigationInputMode.addGroupCollapsingListener((sender, evt) =>
      this.beforeCollapsingGroup(evt.item)
    )

    navigationInputMode.addGroupExpandedListener((sender, evt) =>
      this.afterGroupStateChanged(evt.item)
    )
    navigationInputMode.addGroupCollapsedListener((sender, evt) =>
      this.afterGroupStateChanged(evt.item)
    )
  }

  /**
   * Stores information about the current layout before expanding a group.
   *
   * @param group The group that will be expanded.
   * @private
   */
  beforeExpandingGroup(group: INode): void {
    const graph = this.graphComponent.graph
    const foldingView = graph.foldingView!
    const layout = group.layout

    // store the expanded group node
    this.changedGroupNode = group

    // store the group bounds of the expanded group node before layout
    this.alternativeGroupBounds.clear()
    this.alternativeGroupBounds.set(foldingView.getMasterItem(group), layout.toRect())

    // store all edge paths that connect to the expanded group before layout
    this.alternativeEdgePaths.clear()
    graph.edgesAt(group).forEach(edge => {
      const points = new List<IPoint>()
      points.add(edge.sourcePort!.location)
      edge.bends.forEach(bend => points.add(bend.location))
      points.add(edge.targetPort!.location)
      this.alternativeEdgePaths.set(foldingView.getMasterItem(edge), points)
    })
  }

  /**
   * Stores the layout of the group node and its descendants before collapsing it.
   *
   * @param group The group that will be collapsed.
   * @private
   */
  beforeCollapsingGroup(group: INode): void {
    const graph = this.graphComponent.graph
    const foldingView = graph.foldingView!
    const layout = group.layout

    // store the collapsed group node
    this.changedGroupNode = group

    // store the group bounds of the collapsed group node before layout
    this.alternativeGroupBounds.clear()
    this.alternativeGroupBounds.set(foldingView.getMasterItem(group), layout.toRect())

    // store all edge paths that connect to/into the collapsed group before layout
    this.alternativeEdgePaths.clear()
    this.getAffectedEdges(group, graph).forEach(edge => {
      const points = new List<IPoint>()
      points.add(edge.sourcePort!.location)
      edge.bends.forEach((bend: IBend) => points.add(bend.location))
      points.add(edge.targetPort!.location)
      this.alternativeEdgePaths.set(foldingView.getMasterItem(edge), points)
    })
  }

  /**
   * Performs an incremental layout on the graph after a group was closed/expanded interactively.
   *
   * @param group The group that was expanded or collapsed.
   * @private
   */
  afterGroupStateChanged(group: INode): void {
    // store the current locations of nodes and edges to keep them for incremental layout
    const graph = this.graphComponent.graph
    const nodesCoordinates = new Mapper<INode, IPoint>()
    const nodeSizes = new Mapper<INode, ISize>()
    const edgesCoordinates = new Mapper<IEdge, List<IPoint>>()

    const groupingSupport = graph.groupingSupport
    if (graph.isGroupNode(group)) {
      // reset the paths and the centers of the child nodes so that morphing looks smoother
      const descendants = groupingSupport.getDescendants(group)
      const visitedEdges = new Set()
      descendants.forEach(childNode => {
        graph.edgesAt(childNode).forEach(edge => {
          // store path and clear bends afterwards
          if (!visitedEdges.has(edge)) {
            const bends = new List<IPoint>()
            edge.bends.forEach(bend => {
              bends.add(bend.location)
            })
            edgesCoordinates.set(edge, bends)
            graph.clearBends(edge)
            visitedEdges.add(edge)
          }
        })
        // store coordinates and center node afterwards
        const layout = childNode.layout
        nodesCoordinates.set(childNode, Point.from(layout))
        nodeSizes.set(childNode, Size.from(layout))
        graph.setNodeLayout(childNode, new Rect(group.layout.center.x, group.layout.center.y, 1, 1))
      })
    }

    // reset adjacent edge paths to get smoother layout transitions
    graph.edgesAt(group).forEach(edge => {
      // store path and clear bends afterwards
      const bends = new List<IPoint>()
      edge.bends.forEach(bend => {
        bends.add(bend.location)
      })
      edgesCoordinates.set(edge, bends)
      graph.clearBends(edge)
    })

    this.applyIncrementalLayout(nodesCoordinates, nodeSizes, edgesCoordinates)
  }

  /**
   * Applies the incremental layout after each expanding and collapsing.
   * @param nodesCoordinates the coordinates of the nodes before the layout
   * @param nodeSizes the sizes of the nodes before the layout
   * @param edgesCoordinates the coordinates of the edges before the layout
   */
  async applyIncrementalLayout(
    nodesCoordinates: IMapper<INode, IPoint>,
    nodeSizes: IMapper<INode, ISize>,
    edgesCoordinates: IMapper<IEdge, IEnumerable<IPoint>>
  ): Promise<void> {
    // Configure hierarchic layout for a most stable outcome
    const layout = new HierarchicLayout()
    layout.recursiveGroupLayering = true
    layout.layoutMode = LayoutMode.INCREMENTAL
    layout.edgeLayoutDescriptor.routingStyle = new HierarchicLayoutRoutingStyle(
      HierarchicLayoutEdgeRoutingStyle.ORTHOGONAL
    )
    layout.edgeLayoutDescriptor.recursiveEdgeStyle = RecursiveEdgeStyle.DIRECTED
    layout.prependStage(new GivenCoordinatesStage())

    // The FixNodeLayoutStage is used to make sure that the expanded/collapsed group stays at their location.
    // Note that an input mode with the corresponding 'group node alignment policy' is used, too.
    const fixNodeLayout = new FixNodeLayoutStage(layout)
    fixNodeLayout.fixPointPolicy = FixPointPolicy.UPPER_RIGHT

    // Prepare graph so the layout will consider which node is fixed and what bounds to use for from-sketch placement
    const graph = this.graphComponent.graph
    const foldingView = graph.foldingView!
    const layoutData = new CompositeLayoutData(
      new HierarchicLayoutData({
        alternativeGroupBounds: node => {
          const masterNode = foldingView.getMasterItem(node)
          return this.alternativeGroupBounds.get(masterNode)
        },
        alternativeEdgePaths: edge => {
          const masterEdge = foldingView.getMasterItem(edge)
          return this.alternativeEdgePaths.get(masterEdge)
        },
        // Mark folder nodes to treat them differently than normal nodes during layout
        folderNodes: node => !foldingView.isExpanded(node)
      }),
      new FixNodeLayoutData({
        fixedNodes: this.changedGroupNode
      }),
      new GivenCoordinatesStageData({
        nodeLocations: nodesCoordinates,
        nodeSizes: nodeSizes,
        edgePaths: edgesCoordinates
      })
    )

    // The GivenCoordinatesStage will move the nodes to their previous locations to be able to run an incremental
    // layout although all nodes inside a group node were placed at the same location.
    const layoutExecutor = new LayoutExecutor({
      graphComponent: this.graphComponent,
      layout: new GivenCoordinatesStage(fixNodeLayout),
      layoutData,
      easedAnimation: true,
      duration: '0.5s'
    })
    await layoutExecutor.start().catch(error => {
      if (typeof (window as any).reportError === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        ;(window as any).reportError(error)
      } else {
        throw error
      }
    })
    this.graphComponent.updateContentRect()
  }

  /**
   * Retrieves the affected edges when a group node is collapsed.
   * Edges are affected when they connect to the group node directly or to a descendant of the group node.
   *
   * @param group The group node which is collapsed.
   * @param graph The graph to which the group node belongs.
   *
   * @return An array of all affected edges.
   * @private
   */
  getAffectedEdges(group: INode, graph: IGraph): IEdge[] {
    // Collect all edges that connect to the group node.
    const crossingEdges = graph.edgesAt(group).toArray()

    // Collect all edges that cross the group node's border.
    let groupingSupport: GroupingSupport = graph.groupingSupport
    if (groupingSupport === null) {
      groupingSupport = new GroupingSupport(graph)
    }
    const descendants = groupingSupport.getDescendants(group)
    const visitedEdges = new Set()
    descendants.forEach(descendant => {
      graph.edgesAt(descendant).forEach(edge => {
        if (!visitedEdges.has(edge)) {
          if (!groupingSupport.isDescendant(edge.opposite(descendant) as INode, group)) {
            crossingEdges.push(edge)
          }
          visitedEdges.add(edge)
        }
      })
    })

    return crossingEdges
  }
}
