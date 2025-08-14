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
  CompositeLayoutData,
  GivenCoordinatesLayout,
  GivenCoordinatesLayoutData,
  GraphViewerInputMode,
  GroupPaddingProvider,
  HierarchicalLayout,
  HierarchicalLayoutData,
  IEnumerable,
  IGroupPaddingProvider,
  Insets,
  LayoutAnchoringPolicy,
  LayoutAnchoringStage,
  LayoutAnchoringStageData,
  LayoutExecutor,
  List,
  Mapper,
  NodeAlignmentPolicy,
  Point,
  Rect
} from '@yfiles/yfiles'

/**
 * Initializes the incremental layout that is automatically applied when a group node is collapsed/expanded.
 * This function registers the necessary listeners to the input mode and stores all the necessary information
 * to keep the layout as stable as possible.
 */
export function initializeInteractiveHierarchicalNestingLayout(
  graphComponent,
  nodeAlignmentPolicy = NodeAlignmentPolicy.TOP_RIGHT,
  addGroupDescendantsToGraph
) {
  const layoutHelper = new InteractiveHierarchicalNestingLayout(graphComponent)

  // configure the input mode and set a group node alignment policy that makes sure that the
  // expand/collapse button of the current group node keeps its location,
  // note that the corresponding 'anchoring policy' is used for the LayoutAnchoringStage in
  // the incremental layout calculation.
  const inputMode = graphComponent.inputMode
  const navigationInputMode = inputMode.navigationInputMode
  navigationInputMode.autoGroupNodeAlignmentPolicy = nodeAlignmentPolicy

  // enable folding commands
  navigationInputMode.allowCollapseGroup = true
  navigationInputMode.allowExpandGroup = true

  // before expanding a group node, store all relevant information about the graph
  navigationInputMode.addEventListener('group-expanding', (evt) =>
    layoutHelper.beforeExpandingGroup(evt.item)
  )

  // before collapsing a group node, store all relevant information about the graph
  navigationInputMode.addEventListener('group-collapsing', (evt) =>
    layoutHelper.beforeCollapsingGroup(evt.item)
  )

  // after expanding a group node, load all of its child nodes
  // and run the layout with the previously collected information
  navigationInputMode.addEventListener('group-expanded', async (evt) => {
    // if this group node has never been expanded before,
    // add its child nodes to the graph
    if (!layoutHelper.expandedGroups.has(evt.item)) {
      addGroupDescendantsToGraph(evt.item)
    }
    await layoutHelper.afterGroupStateChanged(evt.item)
  })

  // after collapsing a group node, configure and run the layout
  // with the previously collected information
  navigationInputMode.addEventListener(
    'group-collapsed',
    async (evt) => await layoutHelper.afterGroupStateChanged(evt.item)
  )
}

/**
 * A helper class that stores geometrical information before a group node is expanded/collapsed and
 * uses that information to apply an incremental layout after the group node is expanded/collapsed.
 */
export class InteractiveHierarchicalNestingLayout {
  graphComponent
  /**
   * The last group node that was collapsed/expanded.
   */
  changedGroupNode = null
  /**
   * A set that stores all group nodes that have been expanded at least once before.
   */
  _expandedGroups
  /**
   * A list of nodes that are marked as incremental for the layout algorithm.
   */
  incrementalNodes
  /**
   * A mapper containing alternative bounds for the collapsed/expanded group node.
   */
  alternativeGroupBounds
  /**
   * A mapper containing an alternative path for edges connecting to groups, group content or
   * folder nodes.
   */
  alternativeEdgePaths

  /**
   * Creates and initializes a new instance.
   * @param graphComponent the current graph component
   */
  constructor(graphComponent) {
    this.graphComponent = graphComponent
    this.alternativeGroupBounds = new Mapper()
    this.alternativeEdgePaths = new Mapper()
    this._expandedGroups = new Set()
    this.incrementalNodes = new List()
  }

  /**
   * Gets a set of all group nodes that have been expanded at least once before.
   */
  get expandedGroups() {
    return this._expandedGroups
  }

  /**
   * Stores information about the layout of a group before expanding the group.
   * @param group The group that will be expanded.
   */
  beforeExpandingGroup(group) {
    this.beforeGroupStateChanged(group, (graph, group) => graph.edgesAt(group))
  }

  /**
   * Stores information about the layout of a group before collapsing the group.
   * @param group The group that will be collapsed.
   */
  beforeCollapsingGroup(group) {
    this.beforeGroupStateChanged(group, (graph, group) => this.getAffectedEdges(graph, group))
  }

  /**
   * Stores information about the layout of a group before collapsing or expanding the group.
   * @param group The group that will be collapsed or expanded.
   * @param edgesToBackup The edges whose paths should be stored as well.
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
   * @param group The group that was expanded or collapsed.
   */
  async afterGroupStateChanged(group) {
    // store the current locations of nodes and edges to keep them for incremental layout
    const graph = this.graphComponent.graph
    const nodesCoordinates = new Mapper()
    const nodeSizes = new Mapper()
    const edgesCoordinates = new Mapper()

    // we store the insets for each group node as we will change the size of the nodes to
    // animate the expand operation
    const padding = new Mapper()
    for (const node of graph.nodes) {
      const paddingProvider = node.lookup(IGroupPaddingProvider)
      if (paddingProvider) {
        padding.set(node, paddingProvider.getPadding())
      }
    }

    const groupingSupport = graph.groupingSupport
    if (graph.isGroupNode(group)) {
      // reset the paths and the centers of the child nodes so that morphing looks smoother
      const descendants = groupingSupport.getDescendants(group)
      const visitedEdges = new Set()
      descendants.forEach((childNode) => {
        graph.edgesAt(childNode).forEach((edge) => {
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
        nodeSizes.set(childNode, layout.toSize())
        graph.setNodeLayout(childNode, new Rect(group.layout.center.x, group.layout.center.y, 1, 1))
      })

      // if this group node is expanded for the first time, mark its child nodes as incremental
      // and remember it so that its child nodes won't be marked again next time
      if (!this.expandedGroups.has(group)) {
        this.incrementalNodes.addRange(descendants)
        this.expandedGroups.add(group)
      }
    }

    // reset the paths of the edges connected to the group node to get smoother layout transitions
    graph.edgesAt(group).forEach((edge) => {
      // store path and clear bends afterwards
      edgesCoordinates.set(edge, getPointList(edge))
      graph.clearBends(edge)
    })

    // we register a new padding provider that holds the old padding of the group nodes, before the resizing
    const chainLink = graph.decorator.nodes.groupPaddingProvider.addFactory(
      (node) => new GroupPaddingProvider(padding.get(node) ?? Insets.EMPTY)
    )

    // run the incremental layout
    await this.applyIncrementalLayout(nodesCoordinates, nodeSizes, edgesCoordinates)

    // remove the padding provider
    graph.decorator.nodes.remove(chainLink)

    // forget the incremental nodes for the next layout run
    this.incrementalNodes.clear()
  }

  /**
   * Applies the incremental layout after each expanding and collapsing.
   * @param nodesCoordinates the coordinates of the nodes before the layout
   * @param nodeSizes the sizes of the nodes before the layout
   * @param edgesCoordinates the coordinates of the edges before the layout
   */
  async applyIncrementalLayout(nodesCoordinates, nodeSizes, edgesCoordinates) {
    // configure hierarchical layout for a most stable outcome
    const layout = new HierarchicalLayout({ fromSketchMode: true })
    layout.defaultEdgeDescriptor.recursiveEdgePolicy = 'directed'

    // the LayoutAnchoringStage is used to make sure that the expanded/collapsed group stays at their location
    // note that an input mode with the corresponding 'group node alignment policy' is used, too
    const anchorNodeLayout = new LayoutAnchoringStage({ coreLayout: layout })

    const graph = this.graphComponent.graph
    const foldingView = graph.foldingView

    // configure features of the layout algorithms that require node- and/or edge-specific information
    // such as alternative paths for specific edges or which node should stay fixed
    const layoutData = new CompositeLayoutData(
      new HierarchicalLayoutData({
        alternativeGroupBounds: (node) => {
          const masterNode = foldingView.getMasterItem(node)
          return this.alternativeGroupBounds.get(masterNode)
        },
        alternativeEdgePaths: (edge) => {
          const masterEdge = foldingView.getMasterItem(edge)
          return this.alternativeEdgePaths.get(masterEdge)
        },
        // mark folder nodes to treat them differently than normal nodes during layout
        folderNodes: (node) => !foldingView.isExpanded(node),
        // pass the incremental nodes to the layout algorithm
        incrementalNodes: this.incrementalNodes
      }),
      new LayoutAnchoringStageData({
        nodeAnchoringPolicies: (node) =>
          node === this.changedGroupNode ? LayoutAnchoringPolicy.CENTER : LayoutAnchoringPolicy.NONE
      }),
      new GivenCoordinatesLayoutData({
        nodeLocations: nodesCoordinates,
        nodeSizes: nodeSizes,
        edgePaths: edgesCoordinates
      })
    )

    // the GivenCoordinatesLayout will move the nodes to their previous locations
    // to be able to run an incremental layout, all nodes inside a group node were placed at
    // the same location.
    const layoutExecutor = new LayoutExecutor({
      graphComponent: this.graphComponent,
      layout: new GivenCoordinatesLayout(anchorNodeLayout),
      layoutData,
      easedAnimation: true,
      animationDuration: '0.5s'
    })
    await layoutExecutor.start()
    this.graphComponent.updateContentBounds()
  }

  /**
   * Retrieves the affected edges when a group node is collapsed.
   * Edges are affected when they connect to the group node directly or to a descendant of the group node.
   *
   * @param graph The graph to which the group node belongs.
   * @param group The group node which is collapsed.
   * @returns An array of all affected edges.
   */
  getAffectedEdges(graph, group) {
    // collect all edges that connect to the group node.
    const crossingEdges = graph.edgesAt(group).toArray()

    // collect all edges that cross the group node's border.
    const groupingSupport = graph.groupingSupport
    const descendants = groupingSupport.getDescendants(group)
    const visitedEdges = new Set()
    descendants.forEach((descendant) => {
      graph.edgesAt(descendant).forEach((edge) => {
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
 * @param edge the edge whose control points are collected
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
