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
  ClearAreaLayout,
  ClearAreaLayoutData,
  ClearAreaStrategy,
  ComponentAssignmentStrategy,
  CompositeLayoutData,
  EdgeRouter,
  EdgeRouterData,
  FillAreaLayout,
  FillAreaLayoutData,
  FilteredGraphWrapper,
  GivenCoordinatesLayout,
  GivenCoordinatesLayoutData,
  GraphComponent,
  IAnimation,
  IEdge,
  IGraph,
  ILayoutAlgorithm,
  INode,
  LayoutData,
  LayoutExecutor,
  SequentialLayout,
  Size,
  TimeSpan
} from '@yfiles/yfiles'
/**
 * Calculates a new layout so that there is space at the current position of the moved or resized node.
 */
export class LayoutHelper {
  /**
   * Performs the layout and the animation.
   */
  executor
  resolveFinishLayoutPromise
  get graph() {
    return this.graphComponent.graph
  }
  /**
   * The control that displays the graph.
   */
  graphComponent
  /**
   * The graph layout copy that stores the original layout before the node has been changed.
   * This copy is used to restore the graph when the drag is canceled.
   */
  resetToOriginalGraphStageData
  /**
   * The node that is moved or resized.
   */
  node
  /**
   * The node that is moved and its descendants if the node is a group.
   */
  nodes
  /**
   * The initial size of the node.
   */
  oldSize
  /**
   * The state of the current gesture.
   */
  resizeState
  /**
   * Initializes the helper.
   */
  constructor(graphComponent, node) {
    this.graphComponent = graphComponent
    this.node = node
    this.oldSize = node.layout.toSize()
    const hashSet = new Set()
    hashSet.add(node)
    this.nodes = hashSet
    if (this.graph.isGroupNode(node)) {
      this.graph.groupingSupport
        .getDescendants(node)
        .forEach((descendant) => this.nodes.add(descendant))
    }
    this.executor = null
    this.resetToOriginalGraphStageData = null
    this.fillLayout = null
    this.resizeState = 'NONE'
    this.state = 'CANCELLED'
    this.resolveFinishLayoutPromise = null
  }
  /**
   * Creates a {@link GivenCoordinatesLayoutData} that stores the layout of nodes and edges.
   */
  createGivenCoordinatesLayoutData(nodePredicate, edgePredicate) {
    const data = new GivenCoordinatesLayoutData()
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
  static initializer(instance, p1, p2) {
    instance.layoutData = p1
    instance.animationDuration = p2
    return instance
  }
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
   * Creates a layout algorithm suiting the `resizeState`.
   */
  createLayout(resizeState) {
    const sequentialLayout = new SequentialLayout()
    if (resizeState === 'SHRINKING') {
      // fill the free space of the shrunken node
      this.fillLayout = new FillAreaLayout({
        componentAssignmentStrategy: ComponentAssignmentStrategy.SINGLE
      })
      sequentialLayout.layouts.add(this.fillLayout)
      if (this.state === 'FINISHING') {
        // only route edges for the final layout
        sequentialLayout.layouts.add(new EdgeRouter())
      }
    } else {
      if (resizeState === 'BOTH') {
        // fill the free space of the resized node
        this.fillLayout = new FillAreaLayout({
          componentAssignmentStrategy: ComponentAssignmentStrategy.SINGLE
        })
        sequentialLayout.layouts.add(this.fillLayout)
      }
      // clear the space of the moved/enlarged node
      sequentialLayout.layouts.add(
        new ClearAreaLayout({
          componentAssignmentStrategy: ComponentAssignmentStrategy.SINGLE,
          clearAreaStrategy: ClearAreaStrategy.LOCAL,
          considerEdges: true
        })
      )
    }
    return new GivenCoordinatesLayout(sequentialLayout)
  }
  /**
   * Creates a layout data suiting the `resizeState`.
   */
  createLayoutData(resizeState) {
    const layoutData = new CompositeLayoutData(this.resetToOriginalGraphStageData)
    if (resizeState === 'SHRINKING') {
      const fillAreaLayoutData = new FillAreaLayoutData({
        fixedNodes: this.nodes
      })
      layoutData.items.add(fillAreaLayoutData)
      if (this.state === 'FINISHING') {
        const edgeRouterData = new EdgeRouterData({
          scope: { incidentNodes: this.nodes }
        })
        // only route edges for the final layout
        layoutData.items.add(edgeRouterData)
      }
    } else {
      if (resizeState === 'BOTH') {
        const fillAreaLayoutData = new FillAreaLayoutData({
          fixedNodes: this.nodes
        })
        layoutData.items.add(fillAreaLayoutData)
      }
      const clearAreaLayoutData = new ClearAreaLayoutData({
        areaNodes: this.nodes
      })
      layoutData.items.add(clearAreaLayoutData)
    }
    return layoutData
  }
  /**
   * A {@link LayoutExecutor} that is used after the drag is canceled.
   *
   * All nodes and edges are pushed back into place before the drag started.
   */
  createCancelLayoutExecutor() {
    const layoutExecutor = new LayoutExecutor(this.graphComponent, new GivenCoordinatesLayout(null))
    layoutExecutor.layoutData = this.resetToOriginalGraphStageData
    layoutExecutor.animationDuration = TimeSpan.fromMilliseconds(150)
    return layoutExecutor
  }
  /**
   * A {@link LayoutExecutor} that is used after the drag is finished.
   *
   * First, all nodes and edges are pushed back into place before the drag started, except the node
   * and its descendants. Then space is made for the node and its descendants in its current position.
   * The animation morphs all elements to the calculated positions.
   */
  createFinishLayoutExecutor() {
    const state = this.getResizeState()
    const layoutExecutor = new LayoutExecutor(this.graphComponent, this.createLayout(state))
    layoutExecutor.layoutData = this.createLayoutData(state)
    layoutExecutor.animationDuration = TimeSpan.fromMilliseconds(150)
    return layoutExecutor
  }
  /**
   * The current state of the gesture.
   */
  state
  /**
   * The {@link FillAreaLayout} used for "GROWING" and "BOTH".
   */
  fillLayout
  /**
   * Starts a layout calculation if none is already running.
   */
  runLayout() {
    return LayoutRunner.INSTANCE.runLayout(this)
  }
  /**
   * Initializes the layout calculation.
   */
  initializeLayout() {
    this.resetToOriginalGraphStageData = this.createGivenCoordinatesLayoutData(
      (n) => {
        return !this.nodes.has(n)
      },
      (e) => {
        return !this.isSubgraphEdge(e)
      }
    )
    this.executor = this.getDragLayoutExecutor()
    this.state = 'DRAGGING'
  }
  /**
   * Determines whether both source and target node of the given edge is part of {@link LayoutHelper.nodes}.
   */
  isSubgraphEdge(edge) {
    return this.nodes.has(edge.sourceNode) && this.nodes.has(edge.targetNode)
  }
  /**
   * Cancels the current layout calculation.
   */
  async cancelLayout() {
    this.state = 'CANCELLING'
    await this.runLayout()
    return new Promise((resolve) => (this.resolveFinishLayoutPromise = resolve))
  }
  /**
   * Stops the current layout calculation.
   */
  async finishLayout() {
    this.state = 'FINISHING'
    await this.runLayout()
    return new Promise((resolve) => (this.resolveFinishLayoutPromise = resolve))
  }
  /**
   * Run a layout immediately.
   */
  async layoutImmediately() {
    this.resetToOriginalGraphStageData = this.createGivenCoordinatesLayoutData(
      () => false,
      () => false
    )
    this.state = 'FINISHING'
    await this.runLayout()
  }
  /**
   * Called before a layout run starts.
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
   * Called after a layout run finished.
   */
  onLayoutFinished() {
    switch (this.state) {
      case 'CANCELLED':
      case 'FINISHED':
        if (this.resolveFinishLayoutPromise) {
          this.resolveFinishLayoutPromise()
        }
        break
    }
  }
}
/**
 * Calculates the layout for the whole graph but only animates the part
 * that does not belong to the node and its descendants.
 */
class DragLayoutExecutor extends LayoutExecutor {
  /**
   * The graph that contains all elements except the subgraph.
   *
   * This is the part of the graph that is morphed after a new layout has been calculated.
   */
  filteredGraph
  constructor(graphComponent, layout, nodes) {
    super({ graphComponent: graphComponent, layout: layout, animateViewport: false })
    this.filteredGraph = new FilteredGraphWrapper(graphComponent.graph, (n) => {
      return !nodes.has(n)
    })
  }
  /**
   * Creates an {@link IAnimation} that morphs all graph elements except the node and its descendants to the new layout.
   */
  createLayoutAnimation() {
    return IAnimation.createLayoutAnimation(
      this.filteredGraph,
      this.adapter,
      this.animationDuration
    )
  }
}
/**
 * Singleton class that ensures no two layouts are running at the same time.
 */
export class LayoutRunner {
  /**
   * A lock which prevents re-entrant layout execution.
   */
  layoutIsRunning
  /**
   * Stores the pending layout. Only one layout can be pending at a time.
   */
  pendingLayout
  constructor() {
    this.layoutIsRunning = false
    this.pendingLayout = null
  }
  static instance
  /**
   * Returns the singleton instance of this class.
   */
  static get INSTANCE() {
    return LayoutRunner.instance
      ? LayoutRunner.instance
      : (LayoutRunner.instance = new LayoutRunner())
  }
  /**
   * Starts a layout calculation if none is already running.
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
