/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  CompositeLayoutData,
  FilteredGraphWrapper,
  GivenCoordinatesLayout,
  GivenCoordinatesLayoutData,
  type GraphComponent,
  type IEdge,
  type IEnumerable,
  type IGraph,
  ILayoutAlgorithm,
  type INode,
  LayoutExecutor,
  LayoutGraphAdapter,
  List,
  type Point,
  Rect
} from '@yfiles/yfiles'

/**
 * Performs layout and animation during the drag and drop operation.
 */
export class ClearAreaLayoutHelper {
  /**
   * We use the same {@link LayoutGraphAdapter} for one drag gesture.
   */
  private executor!: LayoutExecutor

  /**
   * The control that displays the graph.
   */
  private readonly graphComponent: GraphComponent

  /**
   * The location of the last drag. Used to move the outline to the current mouse location.
   */
  private oldLocation: Point

  /**
   * The original layout before the drag and drop operation has been started.
   */
  private resetToOriginalGraphStageData!: GivenCoordinatesLayoutData

  /**
   * The location of the current drag.
   */
  public location: Point

  /**
   * The component that has been created by the drag and drop operation.
   */
  public component: IEnumerable<INode>

  /**
   * The {@link ILayoutAlgorithm} that makes space for the dropped component.
   */
  private clearAreaLayout: ClearAreaLayout | null = null

  /**
   * Components that should not be modified by the layout.
   */
  private readonly keepComponents: boolean

  /**
   * The graph that is displayed.
   */
  get graph(): IGraph {
    return this.graphComponent.graph
  }

  /**
   * Initializes the helper.
   * @param graphComponent The control that displays the graph.
   * @param component The component the is dragged.
   * @param keepComponents Defines whether or not components should not be separated by the layout algorithm.
   */
  constructor(
    graphComponent: GraphComponent,
    component: IEnumerable<INode>,
    keepComponents: boolean
  ) {
    this.graphComponent = graphComponent
    this.oldLocation = this.getCenter(component)
    this.component = component
    this.keepComponents = keepComponents

    this.location = this.oldLocation

    this.layoutIsRunning = false
    this.layoutPending = false
    this.canceled = false
    this.finished = false
  }

  /**
   * Returns the center of the {@link ClearAreaLayoutHelper.graph}.
   */
  private getCenter(nodes: IEnumerable<INode>): Point {
    const bounds = this.getRect(nodes)
    return bounds.center
  }

  /**
   * Returns the rectangle enclosing the given nodes.
   */
  private getRect(nodes: IEnumerable<INode>): Rect {
    let bounds = Rect.EMPTY
    nodes.forEach((node) => {
      bounds = Rect.add(bounds, node.layout.toRect())
    })
    return bounds
  }

  /**
   * Creates a {@link GivenCoordinatesLayoutData} that store the layout of nodes and edges.
   */
  private createGivenCoordinateStageData(): GivenCoordinatesLayoutData {
    const givenCoordinatesStageData = new GivenCoordinatesLayoutData()

    // store the initial coordinates and sizes of all nodes and bends not related to the current component
    this.graph.nodes
      .filter((node) => !this.component.includes(node))
      .forEach((node) => {
        givenCoordinatesStageData.nodeLocations.mapper.set(node, node.layout.topLeft.toPoint())
        givenCoordinatesStageData.nodeSizes.mapper.set(node, node.layout.toSize())
      })
    this.graph.edges
      .filter(
        (edge) =>
          !this.component.includes(edge.sourceNode) || !this.component.includes(edge.targetNode)
      )
      .forEach((edge) => {
        givenCoordinatesStageData.edgePaths.mapper.set(edge, this.getEdgePath(edge))
      })
    return givenCoordinatesStageData
  }

  /**
   * Gets the edge path including the source and target ports.
   */
  private getEdgePath(edge: IEdge): List<Point> {
    const points = new List<Point>()
    points.add(edge.sourcePort.location.toPoint())
    edge.bends.forEach((bend) => {
      points.add(bend.location.toPoint())
    })
    points.add(edge.targetPort.location.toPoint())
    return points
  }

  /**
   * A {@link LayoutExecutor} that is used during the drag and drop operation.
   * First, all nodes and edges are pushed back into place before the drag started. Then space
   * is made for the component at its current position. The animation morphs all elements to the
   * calculated positions.
   */
  private createDraggingLayoutExecutor(): LayoutExecutor {
    const clearAreaLayout = new ClearAreaLayout({
      clearAreaStrategy: ClearAreaStrategy.PRESERVE_SHAPES
    })

    clearAreaLayout.configureAreaOutline(this.component, 10)
    const layout = new GivenCoordinatesLayout(clearAreaLayout)
    this.clearAreaLayout = clearAreaLayout

    const layoutData = new CompositeLayoutData(
      this.resetToOriginalGraphStageData,
      new ClearAreaLayoutData({
        componentIds: (node: INode): number | null =>
          this.keepComponents ? node.tag.component : null
      })
    )

    return new LayoutExecutor({
      graphComponent: this.graphComponent,
      graph: new FilteredGraphWrapper(
        this.graphComponent.graph,
        (node) => !this.component.includes(node),
        () => true
      ),
      layout: layout,
      layoutData: layoutData,
      animationDuration: '150ms',
      animateViewport: false
    })
  }

  /**
   * A {@link LayoutExecutor} that is used after the drag and drop operation has been
   * canceled.
   * All nodes and edges are pushed back into place before the drag started.
   */
  private createCanceledLayoutExecutor(): LayoutExecutor {
    return new LayoutExecutor({
      graphComponent: this.graphComponent,
      layout: new GivenCoordinatesLayout(),
      layoutData: this.resetToOriginalGraphStageData,
      animationDuration: '150ms'
    })
  }

  /**
   * A {@link LayoutExecutor} that is used after the drag and drop operation is finished.
   * All nodes and edges are pushed back into place before the drag started. Then space is made
   * for the component that has been dropped.
   */
  private createFinishedLayoutExecutor(): LayoutExecutor {
    const layout = new GivenCoordinatesLayout(
      new ClearAreaLayout({ clearAreaStrategy: ClearAreaStrategy.PRESERVE_SHAPES })
    )

    const layoutData = new CompositeLayoutData(this.resetToOriginalGraphStageData)
    layoutData.items.add(
      new ClearAreaLayoutData({
        areaNodes: this.component,
        componentIds: (node: INode): number | null =>
          this.keepComponents ? node.tag.component : null
      })
    )

    return new LayoutExecutor({
      graphComponent: this.graphComponent,
      layout,
      layoutData,
      animationDuration: '150ms'
    })
  }

  /**
   * A lock which prevents re-entrant layout execution.
   */
  private layoutIsRunning: boolean

  /**
   * Indicates whether a layout run has been requested while running a layout calculation.
   */
  private layoutPending: boolean

  /**
   * Indicates that the executor has been canceled and the original layout should be restored.
   */
  private canceled: boolean

  /**
   * Indicates that the final layout should be calculated.
   */
  private finished: boolean

  /**
   * Starts a layout calculation if none is already running.
   */
  public runLayout(): void {
    if (this.layoutIsRunning) {
      // if another layout is running: request a new layout and exit
      this.layoutPending = true
      return
    }
    this.runLayoutCore()
  }

  private async runLayoutCore(): Promise<void> {
    do {
      // prevent other layouts from running
      this.layoutIsRunning = true
      // clear the pending flag: the requested layout will run now
      this.layoutPending = false
      // start the layout
      if (this.canceled) {
        // reset to original graph layout
        this.executor = this.createCanceledLayoutExecutor()
      } else if (this.finished) {
        // calculate the final layout
        this.executor = this.createFinishedLayoutExecutor()
      } else {
        // update the location of the components outline
        this.updateOutline()
      }
      await this.executor.start()
      // free the executor for the next layout
      this.layoutIsRunning = false
      // repeat if another layout has been requested in the meantime
    } while (this.layoutPending)
  }

  /**
   * Prepares the layout execution.
   */
  public initializeLayout(): void {
    this.resetToOriginalGraphStageData = this.createGivenCoordinateStageData()
    this.executor = this.createDraggingLayoutExecutor()
  }

  /**
   * Cancels the current layout calculation.
   */
  public cancelLayout(): void {
    this.executor.stop()
    this.canceled = true
    this.runLayout()
  }

  /**
   * Finishes the current layout calculation.
   */
  public finishLayout(): void {
    this.executor.stop()
    this.finished = true
    this.runLayout()
  }

  /**
   * Moves the {@link ClearAreaLayout.areaOutline} to the current drag location.
   */
  private updateOutline(): void {
    if (this.location !== this.oldLocation) {
      const delta = this.location.subtract(this.oldLocation)
      this.clearAreaLayout!.moveAreaOutline(delta)
      this.oldLocation = this.location
    }
  }
}
