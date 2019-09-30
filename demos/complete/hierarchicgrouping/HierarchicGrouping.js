/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/* eslint-disable no-unused-vars */
import {
  CompositeLayoutData,
  FixNodeLayoutData,
  FixNodeLayoutStage,
  FixPointPolicy,
  GivenCoordinatesStage,
  GivenCoordinatesStageData,
  GraphComponent,
  GraphEditorInputMode,
  GroupingSupport,
  HierarchicLayout,
  HierarchicLayoutData,
  HierarchicLayoutEdgeRoutingStyle,
  HierarchicLayoutRoutingStyle,
  IEdge,
  IGraph,
  IMapper,
  INode,
  IPoint,
  IRectangle,
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
  constructor() {
    /**
     * The graph component associated with this instance.
     *
     * @type {GraphComponent}
     */
    this.graphComponent = null

    /**
     * The last group node that was collapsed/expanded.
     *
     * @type {INode}
     */
    this.changedGroupNode = null

    /**
     * A mapper containing alternative bounds for the collapsed/expanded group node.
     *
     * @type {Mapper.<INode, IRectangle>}
     */
    this.alternativeGroupBounds = null

    /**
     * A mapper containing alternative bounds for the collapsed/expanded group node.
     *
     * @type {Mapper.<IEdge, IEnumerable.<IPoint>>}
     */
    this.alternativeEdgePaths = null
  }

  /**
   * The public setup method.
   *
   * @param {GraphComponent} graphComponent
   */
  setUp(graphComponent) {
    if (this.graphComponent != null) {
      // graph component is already set
      return
    }
    this.graphComponent = graphComponent

    this.alternativeGroupBounds = new Mapper()
    this.alternativeEdgePaths = new Mapper()

    this.configureInputMode(graphComponent.inputMode)
  }

  /**
   * Enables the folding commands on the <code>navigationInputMode</code> of the provided <code>inputMode</code> and
   * registers event listeners for the expand and collapse commands that trigger the automatic layout.
   *
   * @param {GraphEditorInputMode} inputMode
   *
   * @private
   */
  configureInputMode(inputMode) {
    // Create an input mode and set a group node alignment policy that makes sure that the
    // expand/collapse button of the current group node keeps its location.
    // Note that the corresponding 'fix point policy' is used for the FixNodeLayoutStage in
    // the incremental layout calculation.

    inputMode.navigationInputMode.autoGroupNodeAlignmentPolicy = NodeAlignmentPolicy.TOP_RIGHT

    // Allow folding commands
    inputMode.navigationInputMode.allowCollapseGroup = true
    inputMode.navigationInputMode.allowExpandGroup = true

    // FitContent interferes with our view port animation setup
    inputMode.navigationInputMode.fitContentAfterGroupActions = false

    inputMode.navigationInputMode.addGroupExpandingListener((sender, evt) => {
      this.beforeExpandingGroup(evt.item)
    })
    inputMode.navigationInputMode.addGroupCollapsingListener((sender, evt) => {
      this.beforeCollapsingGroup(evt.item)
    })

    inputMode.navigationInputMode.addGroupExpandedListener((sender, evt) => {
      this.afterGroupStateChanged(evt.item)
    })
    inputMode.navigationInputMode.addGroupCollapsedListener((sender, evt) => {
      this.afterGroupStateChanged(evt.item)
    })
  }

  /**
   * Stores information about the current layout before expanding a group.
   *
   * @param {INode} group The group that will be expanded.
   * @private
   */
  beforeExpandingGroup(group) {
    const graph = this.graphComponent.graph
    const layout = group.layout

    // store the expanded group node
    this.changedGroupNode = group

    // store the group bounds of the expanded group node before layout
    this.alternativeGroupBounds.clear()
    this.alternativeGroupBounds.set(graph.foldingView.getMasterItem(group), layout.toRect())

    // store all edge paths that connect to the expanded group before layout
    this.alternativeEdgePaths.clear()
    graph.edgesAt(group).forEach(edge => {
      const points = new List()
      points.add(edge.sourcePort.location)
      edge.bends.forEach(bend => points.add(bend.location))
      points.add(edge.targetPort.location)
      this.alternativeEdgePaths.set(graph.foldingView.getMasterItem(edge), points)
    })
  }

  /**
   * Stores the layout of the group node and its descendants before collapsing it.
   *
   * @param {INode} group The group that will be collapsed.
   * @private
   */
  beforeCollapsingGroup(group) {
    const graph = this.graphComponent.graph
    const layout = group.layout

    // store the collapsed group node
    this.changedGroupNode = group

    // store the group bounds of the collapsed group node before layout
    this.alternativeGroupBounds.clear()
    this.alternativeGroupBounds.set(graph.foldingView.getMasterItem(group), layout.toRect())

    // store all edge paths that connect to/into the collapsed group before layout
    this.alternativeEdgePaths.clear()
    this.getAffectedEdges(group, graph).forEach(edge => {
      const points = new List()
      points.add(edge.sourcePort.location)
      edge.bends.forEach(bend => points.add(bend.location))
      points.add(edge.targetPort.location)
      this.alternativeEdgePaths.set(graph.foldingView.getMasterItem(edge), points)
    })
  }

  /**
   * Performs an incremental layout on the graph after a group was closed/expanded interactively.
   *
   * @param {INode} group The group that was expanded or collapsed.
   * @private
   */
  afterGroupStateChanged(group) {
    // store the current locations of nodes and edges to keep them for incremental layout
    const graph = this.graphComponent.graph
    const nodesCoordinates = new Mapper()
    const nodeSizes = new Mapper()
    const edgesCoordinates = new Mapper()

    const groupingSupport = graph.groupingSupport
    if (graph.isGroupNode(group)) {
      // reset the paths and the centers of the child nodes so that morphing looks smoother
      const descendants = groupingSupport.getDescendants(group)
      const visitedEdges = new Set()
      descendants.forEach(childNode => {
        graph.edgesAt(childNode).forEach(edge => {
          // store path and clear bends afterwards
          if (!visitedEdges.has(edge)) {
            const bends = new List()
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
      const bends = new List()
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
   * @param {IMapper} nodesCoordinates the coordinates of the nodes before the layout
   * @param {IMapper} nodeSizes the sizes of the nodes before the layout
   * @param {IMapper} edgesCoordinates the coordinates of the edges before the layout
   */
  applyIncrementalLayout(nodesCoordinates, nodeSizes, edgesCoordinates) {
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
    const layoutData = new CompositeLayoutData(
      new HierarchicLayoutData({
        alternativeGroupBounds: node => {
          const masterNode = graph.foldingView.getMasterItem(node)
          return this.alternativeGroupBounds.get(masterNode)
        },
        alternativeEdgePaths: edge => {
          const masterEdge = graph.foldingView.getMasterItem(edge)
          return this.alternativeEdgePaths.get(masterEdge)
        },
        // Mark folder nodes to treat them differently than normal nodes during layout
        folderNodes: node => !graph.foldingView.isExpanded(node)
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
    layoutExecutor.start().catch(error => {
      if (typeof window.reportError === 'function') {
        window.reportError(error)
      } else {
        throw error
      }
    })
  }

  /**
   * Retrieves the affected edges when a group node is collapsed.
   * Edges are affected when they connect to the group node directly or to a descendant of the group node.
   *
   * @param {INode} group The group node which is collapsed.
   * @param {IGraph} graph The graph to which the group node belongs.
   *
   * @return {Array} An array of all affected edges.
   * @private
   */
  getAffectedEdges(group, graph) {
    const crossingEdges = []

    // Collect all edges that connect to the group node.
    graph.edgesAt(group).forEach(edge => crossingEdges.push(edge))

    // Collect all edges that cross the group node's border.
    let groupingSupport = graph.groupingSupport
    if (groupingSupport === null) {
      groupingSupport = new GroupingSupport(graph)
    }
    const descendants = groupingSupport.getDescendants(group)
    const visitedEdges = new Set()
    descendants.forEach(descendant => {
      graph.edgesAt(descendant).forEach(edge => {
        if (!visitedEdges.has(edge)) {
          if (!groupingSupport.isDescendant(edge.opposite(descendant), group)) {
            crossingEdges.push(edge)
          }
          visitedEdges.add(edge)
        }
      })
    })

    return crossingEdges
  }
}
