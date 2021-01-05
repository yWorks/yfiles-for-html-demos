/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
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
  ChannelEdgeRouter,
  ClearAreaLayout,
  ClearAreaLayoutData,
  ClearAreaStrategy,
  ComponentAssignmentStrategy,
  CompositeLayoutData,
  EdgeRouter,
  EdgeRouterScope,
  FillAreaLayout,
  FillAreaLayoutData,
  FilteredGraphWrapper,
  GivenCoordinatesStage,
  GivenCoordinatesStageData,
  GraphComponent,
  IAnimation,
  IEdge,
  IGraph,
  ILayoutAlgorithm,
  INode,
  LayoutData,
  LayoutExecutor,
  LayoutGraph,
  LayoutStageBase,
  List,
  PolylineEdgeRouterData,
  SequentialLayout,
  Size,
  TimeSpan
} from 'yfiles'
import { HidingEdgeDescriptor } from './HidingEdgeDescriptor.js'

/**
 * Calculates a new layout so that there is space at the current position of the moved or resized node.
 */
export class LayoutHelper {
  /**
   * @type {!IGraph}
   */
  get graph() {
    return this.graphComponent.graph
  }

  /**
   * Initializes the helper.
   * @param {!GraphComponent} graphComponent
   * @param {!INode} node
   */
  constructor(graphComponent, node) {
    // The control that displays the graph.
    this.graphComponent = graphComponent
    // The node that is moved or resized.
    this.node = node
    // The initial size of the node.
    this.oldSize = node.layout.toSize()
    const hashSet = new Set()
    hashSet.add(node)
    // The node that is moved and its descendants if the node is a group.
    this.nodes = hashSet
    if (this.graph.isGroupNode(node)) {
      this.graph.groupingSupport
        .getDescendants(node)
        .forEach(descendant => this.nodes.add(descendant))
    }
    const descriptor = graphComponent.graphModelManager.edgeDescriptor
    // The edges which are hidden temporally during the gesture.
    this.hiddenEdges =
      descriptor instanceof HidingEdgeDescriptor ? descriptor.hiddenEdges : new Set()
    // Performs the layout and the animation.
    this.executor = null
    // The graph layout copy that stores the original layout before the node has been changed.
    // This copy is used to restore the graph when the drag is canceled.
    this.resetToOriginalGraphStageData = null
    // The {@link FillAreaLayout} used for "GROWING" and "BOTH".
    this.fillLayout = null
    // The state of the current gesture.
    this.resizeState = 'NONE'
    // The current state of the gesture.
    this.state = 'CANCELLED'
    this.resolveFinishLayoutPromise = null
  }

  /**
   * Creates a {@link GivenCoordinatesStageData} that stores the layout of nodes and edges.
   * @param {!function} nodePredicate
   * @param {!function} edgePredicate
   * @returns {!GivenCoordinatesStageData}
   */
  createGivenCoordinatesStageData(nodePredicate, edgePredicate) {
    const data = new GivenCoordinatesStageData()
    for (const node of this.graph.nodes.filter(nodePredicate)) {
      data.nodeLocations.mapper.set(node, node.layout.topLeft)
      data.nodeSizes.mapper.set(node, node.layout.toSize())
    }
    for (const edge of this.graph.edges.filter(edgePredicate)) {
      data.edgePaths.mapper.set(edge, IEdge.getPathPoints(edge))
    }
    return data
  }

  /**
   * A {@link LayoutExecutor} that is used while dragging the node.
   * @returns {!LayoutExecutor}
   */
  getDragLayoutExecutor() {
    const oldResizeState = this.resizeState
    this.resizeState = this.getResizeState()
    return this.resizeState === oldResizeState && this.executor
      ? this.executor
      : LayoutHelper.initializer(
          new DragLayoutExecutor(
            this.graphComponent,
            this.createLayout(this.resizeState),
            this.nodes
          ),
          this.createLayoutData(this.resizeState),
          TimeSpan.fromMilliseconds(150)
        )
  }

  /**
   * @param {!DragLayoutExecutor} instance
   * @param {!LayoutData} p1
   * @param {!TimeSpan} p2
   * @returns {!DragLayoutExecutor}
   */
  static initializer(instance, p1, p2) {
    instance.layoutData = p1
    instance.duration = p2
    return instance
  }

  /**
   * @returns {!ResizeState}
   */
  getResizeState() {
    const newSize = this.node.layout.toSize()
    const anySmaller = newSize.width < this.oldSize.width || newSize.height < this.oldSize.height
    const anyGreater = newSize.width > this.oldSize.width || newSize.height > this.oldSize.height
    return anySmaller && anyGreater
      ? 'BOTH'
      : anySmaller
      ? 'SHRINKING'
      : anyGreater
      ? 'GROWING'
      : 'NONE'
  }

  /**
   * Creates a layout algorithm suiting the <code>resizeState</code>.
   * @param {!ResizeState} resizeState
   * @returns {!ILayoutAlgorithm}
   */
  createLayout(resizeState) {
    const sequentialLayout = new SequentialLayout()
    if (resizeState === 'SHRINKING') {
      const fillAreaLayout = new FillAreaLayout()
      fillAreaLayout.componentAssignmentStrategy = ComponentAssignmentStrategy.SINGLE
      // fill the free space of the shrunken node
      this.fillLayout = fillAreaLayout
      sequentialLayout.appendLayout(this.fillLayout)
      if (this.state === 'FINISHING') {
        const edgeRouter = new EdgeRouter(null)
        edgeRouter.scope = EdgeRouterScope.ROUTE_EDGES_AT_AFFECTED_NODES
        // only route edges for the final layout
        sequentialLayout.appendLayout(edgeRouter)
      }
    } else {
      if (resizeState === 'BOTH') {
        const fillAreaLayout = new FillAreaLayout()
        fillAreaLayout.componentAssignmentStrategy = ComponentAssignmentStrategy.SINGLE
        // fill the free space of the resized node
        this.fillLayout = fillAreaLayout
        sequentialLayout.appendLayout(this.fillLayout)
      }
      const clearAreaLayout = new ClearAreaLayout()
      clearAreaLayout.componentAssignmentStrategy = ComponentAssignmentStrategy.SINGLE
      clearAreaLayout.clearAreaStrategy = ClearAreaStrategy.LOCAL
      clearAreaLayout.considerEdges = true
      if (this.state !== 'FINISHING') {
        // use fast ChannelRouter during drag
        clearAreaLayout.edgeRouter = new AffectedEdgesChannelRouter()
      }
      // clear the space of the moved/enlarged node
      sequentialLayout.appendLayout(clearAreaLayout)
    }
    return new GivenCoordinatesStage(sequentialLayout)
  }

  /**
   * Creates a layout data suiting the <code>resizeState</code>.
   * @param {!ResizeState} resizeState
   * @returns {!LayoutData}
   */
  createLayoutData(resizeState) {
    const layoutData = new CompositeLayoutData(this.resetToOriginalGraphStageData)
    if (resizeState === 'SHRINKING') {
      const fillAreaLayoutData = new FillAreaLayoutData()
      fillAreaLayoutData.fixedNodes.items = List.from(this.nodes)
      layoutData.items.add(fillAreaLayoutData)
      if (this.state === 'FINISHING') {
        const polylineEdgeRouterData = new PolylineEdgeRouterData()
        polylineEdgeRouterData.affectedNodes.items = List.from(this.nodes)
        // only route edges for the final layout
        layoutData.items.add(polylineEdgeRouterData)
      }
    } else {
      if (resizeState === 'BOTH') {
        const fillAreaLayoutData = new FillAreaLayoutData()
        fillAreaLayoutData.fixedNodes.items = List.from(this.nodes)
        layoutData.items.add(fillAreaLayoutData)
      }
      const clearAreaLayoutData = new ClearAreaLayoutData()
      clearAreaLayoutData.areaNodes.items = List.from(this.nodes)
      layoutData.items.add(clearAreaLayoutData)
    }
    return layoutData
  }

  /**
   * A {@link LayoutExecutor} that is used after the drag is canceled.
   *
   * All nodes and edges are pushed back into place before the drag started.
   * @returns {!LayoutExecutor}
   */
  createCancelLayoutExecutor() {
    const layoutExecutor = new LayoutExecutor(this.graphComponent, new GivenCoordinatesStage(null))
    layoutExecutor.layoutData = this.resetToOriginalGraphStageData
    layoutExecutor.duration = TimeSpan.fromMilliseconds(150)
    return layoutExecutor
  }

  /**
   * A {@link LayoutExecutor} that is used after the drag is finished.
   *
   * First, all nodes and edges are pushed back into place before the drag started, except the node
   * and its descendants. Then space is made for the node and its descendants at its current position.
   * The animation morphs all elements to the calculated positions.
   * @returns {!LayoutExecutor}
   */
  createFinishLayoutExecutor() {
    const state = this.getResizeState()
    const layoutExecutor = new LayoutExecutor(this.graphComponent, this.createLayout(state))
    layoutExecutor.layoutData = this.createLayoutData(state)
    layoutExecutor.duration = TimeSpan.fromMilliseconds(150)
    return layoutExecutor
  }

  /**
   * Starts a layout calculation if none is already running.
   * @returns {!Promise}
   */
  runLayout() {
    return LayoutRunner.INSTANCE.runLayout(this)
  }

  /**
   * Initializes the layout calculation.
   */
  initializeLayout() {
    this.resetToOriginalGraphStageData = this.createGivenCoordinatesStageData(
      n => {
        return !this.nodes.has(n)
      },
      e => {
        return !this.isSubgraphEdge(e)
      }
    )

    // hide edge path for any edge between a node in 'nodes' and a node not in 'nodes'
    this.hideInterEdges()

    this.executor = this.getDragLayoutExecutor()
    this.state = 'DRAGGING'
  }

  /**
   * Hides the inter-edges.
   */
  hideInterEdges() {
    for (const edge of this.graph.edges) {
      if (this.isInterEdge(edge)) {
        this.hiddenEdges.add(edge)
      }
    }
  }

  /**
   * Un-hides the inter-edges.
   */
  unhideInterEdges() {
    this.hiddenEdges.clear()
  }

  /**
   * Determines whether source or target node of the given edge is part of {@link LayoutHelper#nodes}.
   * @param {!IEdge} edge
   * @returns {boolean}
   */
  isInterEdge(edge) {
    const sourceInNodes = this.nodes.has(edge.sourceNode)
    const targetInNodes = this.nodes.has(edge.targetNode)
    return (sourceInNodes && !targetInNodes) || (targetInNodes && !sourceInNodes)
  }

  /**
   * Determines whether both source and target node of the given edge is part of {@link LayoutHelper#nodes}.
   * @param {!IEdge} edge
   * @returns {boolean}
   */
  isSubgraphEdge(edge) {
    return this.nodes.has(edge.sourceNode) && this.nodes.has(edge.targetNode)
  }

  /**
   * Cancels the current layout calculation.
   * @returns {!Promise}
   */
  cancelLayout() {
    this.state = 'CANCELLING'
    this.runLayout()
    return new Promise(resolve => (this.resolveFinishLayoutPromise = resolve))
  }

  /**
   * Stops the current layout calculation.
   * @returns {!Promise}
   */
  finishLayout() {
    this.state = 'FINISHING'
    this.runLayout()
    return new Promise(resolve => (this.resolveFinishLayoutPromise = resolve))
  }

  /**
   * Run a layout immediately.
   */
  layoutImmediately() {
    this.resetToOriginalGraphStageData = this.createGivenCoordinatesStageData(
      () => false,
      () => false
    )
    this.state = 'FINISHING'
    this.runLayout()
  }

  /**
   * Called before the a layout run starts.
   * @returns {!LayoutExecutor}
   */
  onLayoutStarting() {
    switch (this.state) {
      case 'DRAGGING':
        this.executor = this.getDragLayoutExecutor()
        if (this.fillLayout) {
          this.fillLayout.configureAreaOutline(this.nodes)
        }
        break
      case 'CANCELLING':
        this.executor = this.createCancelLayoutExecutor()
        this.state = 'CANCELLED'
        break
      case 'FINISHING':
        this.executor = this.createFinishLayoutExecutor()
        if (this.fillLayout) {
          this.fillLayout.configureAreaOutline(this.nodes)
        }
        this.state = 'FINISHED'
        break
    }
    return this.executor
  }

  /**
   * Called after the a layout run finished.
   */
  onLayoutFinished() {
    switch (this.state) {
      case 'CANCELLED':
      case 'FINISHED':
        this.unhideInterEdges()
        if (this.resolveFinishLayoutPromise) {
          this.resolveFinishLayoutPromise()
        }
        break
    }
  }
}

/**
 * Calculates the layout for the whole graph but only animates the part that does not belong to node and its descendants.
 */
class DragLayoutExecutor extends LayoutExecutor {
  /**
   * @param {!GraphComponent} graphComponent
   * @param {!ILayoutAlgorithm} layout
   * @param {!Set.<INode>} nodes
   */
  constructor(graphComponent, layout, nodes) {
    super(graphComponent, layout)
    // The graph that contains all elements except the subgraph.
    // This is the part of the graph that is morphed after a new layout has been calculated.
    this.filteredGraph = new FilteredGraphWrapper(
      graphComponent.graph,
      n => {
        return !nodes.has(n)
      },
      null
    )
  }

  /**
   * Creates an {@link IAnimation} that morphs all graph elements except the node and its descendants to the new layout.
   * @returns {!IAnimation}
   */
  createMorphAnimation() {
    return IAnimation.createLayoutAnimation(this.filteredGraph, this.layoutGraph, this.duration)
  }
}

class AffectedEdgesChannelRouter extends LayoutStageBase {
  constructor() {
    super()
    this.channelEdgeRouter = new ChannelEdgeRouter()
  }

  /**
   * @param {!LayoutGraph} graph
   */
  applyLayout(graph) {
    const routedEdges = graph.getDataProvider(ClearAreaLayout.ROUTE_EDGE_DP_KEY)
    graph.addDataProvider(ChannelEdgeRouter.AFFECTED_EDGES_DP_KEY, routedEdges)
    this.channelEdgeRouter.applyLayout(graph)
    graph.removeDataProvider(ChannelEdgeRouter.AFFECTED_EDGES_DP_KEY)
  }
}

/**
 * Singleton class that ensures no two layouts are running at the same time.
 */
export class LayoutRunner {
  constructor() {
    // A lock which prevents re-entrant layout execution.
    this.layoutIsRunning = false
    // Stores the pending layout. Only one layout can be pending at a time.
    this.pendingLayout = null
  }

  /** @type {LayoutRunner} */
  static get instance() {
    return LayoutRunner.$instance
  }

  /** @type {LayoutRunner} */
  static set instance(instance) {
    LayoutRunner.$instance = instance
  }

  /**
   * Returns the singleton instance of this class.
   * @type {!LayoutRunner}
   */
  static get INSTANCE() {
    return this.instance ? this.instance : (this.instance = new LayoutRunner())
  }

  /**
   * Starts a layout calculation if none is already running.
   * @param {!PendingLayout} layout
   * @returns {!Promise}
   */
  async runLayout(layout) {
    this.pendingLayout = layout
    if (this.layoutIsRunning) {
      // if another layout is running: request a new layout and exit
      return
    }
    do {
      // prevent other layouts from running
      this.layoutIsRunning = true
      // clear the pending flag: the requested layout will run now
      const layout = this.pendingLayout
      this.pendingLayout = null
      // start the layout
      const executor = layout.onLayoutStarting()
      await executor.start()
      layout.onLayoutFinished()
      // free the executor for the next layout
      this.layoutIsRunning = false
      // repeat if another layout has been requested in the meantime
    } while (this.pendingLayout)
  }
}

/**
 * @typedef {Object} PendingLayout
 * @property {Function} onLayoutStarting
 * @property {Function} onLayoutFinished
 */
/**
 * The states of the gesture.
 * @typedef {('DRAGGING'|'CANCELLING'|'CANCELLED'|'FINISHING'|'FINISHED')} GestureState
 */
/**
 * The states of the size change of the modified node.
 * @typedef {('NONE'|'GROWING'|'SHRINKING'|'BOTH')} ResizeState
 */
