/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  IEdge,
  IEnumerable,
  IGraph,
  IMapper,
  INode,
  INodeInsetsProvider,
  Insets,
  IPoint,
  IRectangle,
  ISize,
  LayoutExecutor,
  LayoutMode,
  List,
  Mapper,
  NodeAlignmentPolicy,
  NodeInsetsProvider,
  Point,
  Rect,
  RecursiveEdgeStyle,
  Size
} from 'yfiles'
import { reportDemoError } from '../../resources/demo-app.js'

export default class HierarchicGrouping {
  /**
   * @param {!GraphComponent} graphComponent
   */
  constructor(graphComponent) {
    this.graphComponent = graphComponent

    // The last group node that was collapsed/expanded.
    this.changedGroupNode = null

    // A mapper containing alternative bounds for the collapsed/expanded group node.
    this.alternativeGroupBounds = new Mapper()
    // A mapper containing alternative path for the edges connecting to groups,
    // group content or folder nodes.
    this.alternativeEdgePaths = new Mapper()

    this.configureInputMode(graphComponent.inputMode)
  }

  /**
   * Enables the folding commands on the `navigationInputMode` of the provided `inputMode` and
   * registers event listeners for the expand and collapse commands that trigger the automatic layout.
   *
   * @param {!GraphInputMode} inputMode The input mode to be configured.
   */
  configureInputMode(inputMode) {
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

    navigationInputMode.addGroupExpandedListener(
      async (sender, evt) => await this.afterGroupStateChanged(evt.item)
    )
    navigationInputMode.addGroupCollapsedListener(
      async (sender, evt) => await this.afterGroupStateChanged(evt.item)
    )
  }

  /**
   * Stores information about the layout of a group before expanding the group.
   *
   * @param {!INode} group The group that will be expanded.
   */
  beforeExpandingGroup(group) {
    const edgesToBackup = (graph, group) => graph.edgesAt(group)
    this.beforeGroupStateChanged(group, edgesToBackup)
  }

  /**
   * Stores information about the layout of a group before collapsing the group.
   *
   * @param {!INode} group The group that will be collapsed.
   */
  beforeCollapsingGroup(group) {
    const edgesToBackup = (graph, group) => this.getAffectedEdges(graph, group)
    this.beforeGroupStateChanged(group, edgesToBackup)
  }

  /**
   * Stores information about the layout of a group before collapsing or expanding the group.
   *
   * @param {!INode} group The group that will be collapsed or expanded.
   * @param {!function} edgesToBackup The edges whose paths should be stored as well.
   */
  beforeGroupStateChanged(group, edgesToBackup) {
    const graph = this.graphComponent.graph
    const foldingView = graph.foldingView
    const layout = group.layout

    // store the collapsed group node
    this.changedGroupNode = group

    // store the group bounds of the collapsed group node before layout
    this.alternativeGroupBounds.clear()
    this.alternativeGroupBounds.set(foldingView.getMasterItem(group), layout.toRect())

    // store all edge paths that connect to/into the collapsed group before layout
    this.alternativeEdgePaths.clear()
    for (const edge of edgesToBackup(graph, group)) {
      this.alternativeEdgePaths.set(foldingView.getMasterItem(edge), getPointList(edge))
    }
  }

  /**
   * Performs an incremental layout on the graph after a group was closed/expanded interactively.
   *
   * @param {!INode} group The group that was expanded or collapsed.
   * @returns {!Promise}
   */
  async afterGroupStateChanged(group) {
    // store the current locations of nodes and edges to keep them for incremental layout
    const graph = this.graphComponent.graph
    const nodesCoordinates = new Mapper()
    const nodeSizes = new Mapper()
    const edgesCoordinates = new Mapper()

    // we store the insets for each group node as we will change the size of the nodes to
    // animate the expand operation
    const insets = new Mapper()
    for (const node of graph.nodes) {
      const insetsProvider = node.lookup(INodeInsetsProvider.$class)
      if (insetsProvider) {
        insets.set(node, insetsProvider.getInsets(node))
      }
    }

    const groupingSupport = graph.groupingSupport
    if (graph.isGroupNode(group)) {
      // reset the paths and the centers of the child nodes so that morphing looks smoother
      const descendants = groupingSupport.getDescendants(group)
      const visitedEdges = new Set()
      descendants.forEach(childNode => {
        graph.edgesAt(childNode).forEach(edge => {
          // store path and clear bends afterwards
          if (!visitedEdges.has(edge)) {
            edgesCoordinates.set(edge, getPointList(edge))
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
      edgesCoordinates.set(edge, getPointList(edge))
      graph.clearBends(edge)
    })

    // we register a new insets provider that holds the old insets of the group nodes, before the resizing
    const chainLink = graph.decorator.nodeDecorator.insetsProviderDecorator.setFactory(
      node => new NodeInsetsProvider(insets.get(node) ?? new Insets(0))
    )

    // run the incremental layout
    await this.applyIncrementalLayout(nodesCoordinates, nodeSizes, edgesCoordinates)

    // remove the insets provider
    graph.decorator.nodeDecorator.remove(chainLink)
  }

  /**
   * Applies the incremental layout after each expanding and collapsing.
   * @param {!IMapper.<INode,IPoint>} nodesCoordinates the coordinates of the nodes before the layout
   * @param {!IMapper.<INode,ISize>} nodeSizes the sizes of the nodes before the layout
   * @param {!IMapper.<IEdge,IEnumerable.<IPoint>>} edgesCoordinates the coordinates of the edges before the layout
   * @returns {!Promise}
   */
  async applyIncrementalLayout(nodesCoordinates, nodeSizes, edgesCoordinates) {
    // Configure hierarchic layout for a most stable outcome
    const layout = new HierarchicLayout()
    layout.recursiveGroupLayering = true
    layout.layoutMode = LayoutMode.INCREMENTAL
    layout.edgeLayoutDescriptor.routingStyle = new HierarchicLayoutRoutingStyle(
      HierarchicLayoutEdgeRoutingStyle.ORTHOGONAL
    )
    layout.edgeLayoutDescriptor.recursiveEdgeStyle = RecursiveEdgeStyle.DIRECTED

    // The FixNodeLayoutStage is used to make sure that the expanded/collapsed group stays at their location.
    // Note that an input mode with the corresponding 'group node alignment policy' is used, too.
    const fixNodeLayout = new FixNodeLayoutStage(layout)
    fixNodeLayout.fixPointPolicy = FixPointPolicy.UPPER_RIGHT

    // Prepare graph so the layout will consider which node is fixed and what bounds to use for from-sketch placement
    const graph = this.graphComponent.graph
    const foldingView = graph.foldingView
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
    try {
      await layoutExecutor.start()
    } catch (error) {
      reportDemoError(error)
    }
    this.graphComponent.updateContentRect()
  }

  /**
   * Retrieves the affected edges when a group node is collapsed.
   * Edges are affected when they connect to the group node directly or to a descendant of the group node.
   *
   * @param {!IGraph} graph The graph to which the group node belongs.
   * @param {!INode} group The group node which is collapsed.
   *
   * @returns {!Array.<IEdge>} An array of all affected edges.
   */
  getAffectedEdges(graph, group) {
    // Collect all edges that connect to the group node.
    const crossingEdges = graph.edgesAt(group).toArray()

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

/**
 * Returns the control points of the given edge.
 * The control points of an edge are its source port location, its bend locations, and its target
 * port location.
 * @param {!IEdge} edge the edge whose control points are collected.
 * @returns {!List.<IPoint>}
 */
function getPointList(edge) {
  const points = new List()
  points.add(edge.sourcePort.location)
  for (const bend of edge.bends) {
    points.add(bend.location)
  }
  points.add(edge.targetPort.location)
  return points
}
