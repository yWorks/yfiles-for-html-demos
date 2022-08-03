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
  ChannelEdgeRouter,
  ClearAreaLayout,
  ClearAreaLayoutData,
  ClearAreaStrategy,
  ComponentAssignmentStrategy,
  CompositeLayoutData,
  EdgeRouter,
  EdgeRouterData,
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
  SequentialLayout,
  Size,
  TimeSpan
} from 'yfiles'
import { HidingEdgeDescriptor } from './HidingEdgeDescriptor'

/**
 * Calculates a new layout so that there is space at the current position of the moved or resized node.
 */
export class LayoutHelper implements PendingLayout {
  /**
   * Performs the layout and the animation.
   */
  private executor: LayoutExecutor | null
  private resolveFinishLayoutPromise: ((value?: PromiseLike<void> | void) => void) | null

  private get graph(): IGraph {
    return this.graphComponent.graph
  }

  /**
   * The control that displays the graph.
   */
  private readonly graphComponent: GraphComponent

  /**
   * The graph layout copy that stores the original layout before the node has been changed.
   * This copy is used to restore the graph when the drag is canceled.
   */
  private resetToOriginalGraphStageData: GivenCoordinatesStageData | null

  /**
   * The node that is moved or resized.
   */
  private node: INode

  /**
   * The node that is moved and its descendants if the node is a group.
   */
  private readonly nodes: Set<INode>

  /**
   * The initial size of the node.
   */
  private oldSize: Size

  /**
   * The state of the current gesture.
   */
  private resizeState: ResizeState

  /**
   * The edges which are hidden temporally during the gesture.
   */
  private hiddenEdges: Set<IEdge>

  /**
   * Initializes the helper.
   */
  constructor(graphComponent: GraphComponent, node: INode) {
    this.graphComponent = graphComponent
    this.node = node
    this.oldSize = node.layout.toSize()
    const hashSet = new Set<INode>()
    hashSet.add(node)
    this.nodes = hashSet
    if (this.graph.isGroupNode(node)) {
      this.graph.groupingSupport
        .getDescendants(node)
        .forEach(descendant => this.nodes.add(descendant))
    }
    const descriptor = graphComponent.graphModelManager.edgeDescriptor
    this.hiddenEdges =
      descriptor instanceof HidingEdgeDescriptor ? descriptor.hiddenEdges : new Set<IEdge>()
    this.executor = null
    this.resetToOriginalGraphStageData = null
    this.fillLayout = null
    this.resizeState = 'NONE'
    this.state = 'CANCELLED'
    this.resolveFinishLayoutPromise = null
  }

  /**
   * Creates a {@link GivenCoordinatesStageData} that stores the layout of nodes and edges.
   */
  private createGivenCoordinatesStageData(
    nodePredicate: (obj: INode) => boolean,
    edgePredicate: (obj: IEdge) => boolean
  ): GivenCoordinatesStageData {
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
   */
  private getDragLayoutExecutor(): LayoutExecutor {
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

  private static initializer(
    instance: DragLayoutExecutor,
    p1: LayoutData,
    p2: TimeSpan
  ): DragLayoutExecutor {
    instance.layoutData = p1
    instance.duration = p2
    return instance
  }

  private getResizeState(): ResizeState {
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
  private createLayout(resizeState: ResizeState): ILayoutAlgorithm {
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
   * Creates a layout data suiting the `resizeState`.
   */
  private createLayoutData(resizeState: ResizeState): LayoutData {
    const layoutData = new CompositeLayoutData(this.resetToOriginalGraphStageData!)
    if (resizeState === 'SHRINKING') {
      const fillAreaLayoutData = new FillAreaLayoutData()
      fillAreaLayoutData.fixedNodes.items = List.from(this.nodes)
      layoutData.items.add(fillAreaLayoutData)
      if (this.state === 'FINISHING') {
        const polylineEdgeRouterData = new EdgeRouterData()
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
   */
  private createCancelLayoutExecutor(): LayoutExecutor {
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
   */
  private createFinishLayoutExecutor(): LayoutExecutor {
    const state = this.getResizeState()
    const layoutExecutor = new LayoutExecutor(this.graphComponent, this.createLayout(state))
    layoutExecutor.layoutData = this.createLayoutData(state)
    layoutExecutor.duration = TimeSpan.fromMilliseconds(150)
    return layoutExecutor
  }

  /**
   * The current state of the gesture.
   */
  private state: GestureState

  /**
   * The {@link FillAreaLayout} used for "GROWING" and "BOTH".
   */
  private fillLayout: FillAreaLayout | null

  /**
   * Starts a layout calculation if none is already running.
   */
  public runLayout(): Promise<void> {
    return LayoutRunner.INSTANCE.runLayout(this)
  }

  /**
   * Initializes the layout calculation.
   */
  public initializeLayout(): void {
    this.resetToOriginalGraphStageData = this.createGivenCoordinatesStageData(
      (n: INode) => {
        return !this.nodes.has(n)
      },
      (e: IEdge) => {
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
  private hideInterEdges(): void {
    for (const edge of this.graph.edges) {
      if (this.isInterEdge(edge)) {
        this.hiddenEdges.add(edge)
      }
    }
  }

  /**
   * Un-hides the inter-edges.
   */
  private unhideInterEdges(): void {
    this.hiddenEdges.clear()
  }

  /**
   * Determines whether source or target node of the given edge is part of {@link LayoutHelper.nodes}.
   */
  private isInterEdge(edge: IEdge): boolean {
    const sourceInNodes = this.nodes.has(edge.sourceNode!)
    const targetInNodes = this.nodes.has(edge.targetNode!)
    return (sourceInNodes && !targetInNodes) || (targetInNodes && !sourceInNodes)
  }

  /**
   * Determines whether both source and target node of the given edge is part of {@link LayoutHelper.nodes}.
   */
  private isSubgraphEdge(edge: IEdge): boolean {
    return this.nodes.has(edge.sourceNode!) && this.nodes.has(edge.targetNode!)
  }

  /**
   * Cancels the current layout calculation.
   */
  public cancelLayout(): Promise<void> {
    this.state = 'CANCELLING'
    this.runLayout()
    return new Promise(resolve => (this.resolveFinishLayoutPromise = resolve))
  }

  /**
   * Stops the current layout calculation.
   */
  public finishLayout(): Promise<void> {
    this.state = 'FINISHING'
    this.runLayout()
    return new Promise(resolve => (this.resolveFinishLayoutPromise = resolve))
  }

  /**
   * Run a layout immediately.
   */
  public layoutImmediately(): void {
    this.resetToOriginalGraphStageData = this.createGivenCoordinatesStageData(
      () => false,
      () => false
    )
    this.state = 'FINISHING'
    this.runLayout()
  }

  /**
   * Called before the a layout run starts.
   */
  public onLayoutStarting(): LayoutExecutor {
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
    return this.executor!
  }

  /**
   * Called after the a layout run finished.
   */
  public onLayoutFinished(): void {
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
   * The graph that contains all elements except the subgraph.
   *
   * This is the part of the graph that is morphed after a new layout has been calculated.
   */
  private readonly filteredGraph: FilteredGraphWrapper

  constructor(graphComponent: GraphComponent, layout: ILayoutAlgorithm, nodes: Set<INode>) {
    super(graphComponent, layout)
    this.filteredGraph = new FilteredGraphWrapper(
      graphComponent.graph,
      (n: INode) => {
        return !nodes.has(n)
      },
      null
    )
  }

  /**
   * Creates an {@link IAnimation} that morphs all graph elements except the node and its descendants to the new layout.
   */
  public createMorphAnimation(): IAnimation {
    return IAnimation.createLayoutAnimation(this.filteredGraph, this.layoutGraph, this.duration)
  }
}

class AffectedEdgesChannelRouter extends LayoutStageBase {
  private readonly channelEdgeRouter: ChannelEdgeRouter

  constructor() {
    super()
    this.channelEdgeRouter = new ChannelEdgeRouter()
  }

  applyLayout(graph: LayoutGraph): void {
    const routedEdges = graph.getDataProvider(ClearAreaLayout.ROUTE_EDGE_DP_KEY)
    graph.addDataProvider(ChannelEdgeRouter.AFFECTED_EDGES_DP_KEY, routedEdges!)
    this.channelEdgeRouter.applyLayout(graph)
    graph.removeDataProvider(ChannelEdgeRouter.AFFECTED_EDGES_DP_KEY)
  }
}

/**
 * Singleton class that ensures no two layouts are running at the same time.
 */
export class LayoutRunner {
  /**
   * A lock which prevents re-entrant layout execution.
   */
  private layoutIsRunning: boolean

  /**
   * Stores the pending layout. Only one layout can be pending at a time.
   */
  private pendingLayout: PendingLayout | null

  private constructor() {
    this.layoutIsRunning = false
    this.pendingLayout = null
  }

  private static instance?: LayoutRunner

  /**
   * Returns the singleton instance of this class.
   */
  public static get INSTANCE(): LayoutRunner {
    return this.instance ? this.instance : (this.instance = new LayoutRunner())
  }

  /**
   * Starts a layout calculation if none is already running.
   */
  public async runLayout(layout: PendingLayout): Promise<void> {
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

interface PendingLayout {
  onLayoutStarting(): LayoutExecutor
  onLayoutFinished(): void
}

/**
 * The states of the gesture.
 */
type GestureState = 'DRAGGING' | 'CANCELLING' | 'CANCELLED' | 'FINISHING' | 'FINISHED'

/**
 * The states of the size change of the modified node.
 */
type ResizeState = 'NONE' | 'GROWING' | 'SHRINKING' | 'BOTH'
