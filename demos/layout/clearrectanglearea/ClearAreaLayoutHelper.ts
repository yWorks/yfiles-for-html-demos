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
  CompositeLayoutData,
  GivenCoordinatesLayout,
  GivenCoordinatesLayoutData,
  type GraphComponent,
  type ICompoundEdit,
  IEdge,
  type IGraph,
  type ILayoutAlgorithm,
  type INode,
  type LayoutData,
  LayoutExecutor,
  type MutableRectangle,
  type Rect
} from '@yfiles/yfiles'

import type { LayoutOptions } from './LayoutOptions'

/**
 * Performs layout and animation while dragging the marquee rectangle.
 */
export class ClearAreaLayoutHelper {
  /**
   * Performs the layout and the animation.
   */
  private executor: LayoutExecutor | null = null

  /**
   * Options to control the layout behavior.
   */
  private options: LayoutOptions

  /**
   * The control that displays the graph.
   */
  private readonly graphComponent: GraphComponent

  /**
   * The graph that is displayed.
   */
  private get graph(): IGraph {
    return this.graphComponent.graph
  }

  /**
   * The graph layout copy that stores the original layout before the marquee rectangle has been dragged.
   */
  private resetToOriginalGraphStageData: GivenCoordinatesLayoutData | null = null

  /**
   * The rectangular area that can be freely moved or resized.
   */
  private clearRect: MutableRectangle

  /**
   * The layout of the rectangular area at the beginning of the gesture. Used for undo/redo.
   */
  private oldClearRect: Rect | null = null

  /**
   * The {@link ILayoutAlgorithm} that makes space for the rectangular area
   */
  private clearAreaLayout: ClearAreaLayout | null = null

  /**
   * The group node we are currently inside.
   */
  public groupNode: INode | null = null

  /**
   * Initializes the helper.
   * @param graphComponent The component that displays the graph.
   * @param clearRect The rectangle the is dragged.
   * @param options Options to control the layout behavior
   */
  constructor(graphComponent: GraphComponent, clearRect: MutableRectangle, options: LayoutOptions) {
    this.graphComponent = graphComponent
    this.clearRect = clearRect
    this.options = options
  }

  // --------------------------------------------------------------- LayoutExecutor configurations

  /**
   * Creates a {@link GivenCoordinatesLayoutData} that store the layout of nodes and edges.
   */
  private createGivenCoordinateStageData(): GivenCoordinatesLayoutData {
    const data = new GivenCoordinatesLayoutData()

    this.graph.nodes.forEach((node: INode) => {
      data.nodeLocations.mapper.set(node, node.layout.topLeft)
      data.nodeSizes.mapper.set(node, node.layout.toSize())
    })

    this.graph.edges.forEach((edge: IEdge) => {
      data.edgePaths.mapper.set(edge, IEdge.getPathPoints(edge))
    })

    return data
  }

  /**
   * A {@link LayoutExecutor} that is used while dragging the marquee rectangle.
   *
   * First, all nodes and edges are pushed back into place before the drag started. Then space
   * is made for the rectangle at its current position. The animation morphs all elements to the
   * calculated positions.
   */
  private createDraggingLayoutExecutor(): LayoutExecutor {
    return new LayoutExecutor({
      graphComponent: this.graphComponent,
      layout: this.createDraggingLayout(),
      layoutData: this.createDraggingLayoutData(),
      animationDuration: '150ms',
      animateViewport: false
    })
  }

  /**
   * A {@link LayoutExecutor} that is used after the drag is canceled.
   *
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
   * Creates a {@link ILayoutAlgorithm} used while dragging and finishing the gesture.
   */
  private createDraggingLayout(): ILayoutAlgorithm {
    this.clearAreaLayout = new ClearAreaLayout({
      componentAssignmentStrategy: this.options.componentAssignmentStrategy,
      clearAreaStrategy: this.options.clearAreaStrategy,
      considerEdges: this.options.considerEdges
    })
    return new GivenCoordinatesLayout(this.clearAreaLayout)
  }

  /**
   * Creates a {@link LayoutData} used while dragging and finishing the gesture.
   */
  private createDraggingLayoutData(): LayoutData {
    const clearAreaLayoutData = new ClearAreaLayoutData()
    clearAreaLayoutData.areaGroupNode = (node: INode): boolean => node === this.groupNode

    return new CompositeLayoutData(this.resetToOriginalGraphStageData!, clearAreaLayoutData)
  }

  // ---------------------------------------------------------------------------- Layout Execution

  /**
   * A lock which prevents re-entrant layout execution.
   */
  private layoutIsRunning = false

  /**
   * Indicates whether a layout run has been requested while running a layout calculation.
   */
  private layoutPending = false

  /**
   * Indicates that the gesture has been canceled and the original layout should be restored.
   */
  private canceled = false

  /**
   * Indicates that the gesture has been finished and the new layout should be applied.
   */
  private stopped = false

  /**
   * Creates a single unit to undo and redo the complete reparent gesture.
   */
  private layoutEdit: ICompoundEdit | null = null

  /**
   * Starts a layout calculation if none is already running.
   */
  public async runLayout(): Promise<void> {
    if (this.layoutIsRunning) {
      // if another layout is running: request a new layout and exit
      this.layoutPending = true
      return
    }

    do {
      // prevent other layouts from running
      this.layoutIsRunning = true

      // clear the pending flag: the requested layout will run now
      this.layoutPending = false

      // before the layout run
      this.onExecutorStarting()

      // start the layout
      await this.executor!.start()

      // after the layout run
      this.onExecutorFinished()

      // free the executor for the next layout
      this.layoutIsRunning = false

      // repeat if another layout has been requested in the meantime
    } while (this.layoutPending)
  }

  /**
   * Prepares the layout execution.
   */
  public initializeLayout(): void {
    // prepare undo/redo
    this.oldClearRect = this.clearRect.toRect()
    this.layoutEdit = this.graph.beginEdit('Clear Area', 'Clear Area')

    this.resetToOriginalGraphStageData = this.createGivenCoordinateStageData()
    this.executor = this.createDraggingLayoutExecutor()
  }

  /**
   * Cancels the current layout calculation.
   */
  public cancelLayout(): void {
    if (this.executor) {
      this.executor.stop()
    }
    this.canceled = true
    this.runLayout()
  }

  /**
   * Stops the current layout calculation.
   */
  public stopLayout(): void {
    if (this.executor) {
      this.executor.stop()
    }
    this.stopped = true

    this.runLayout()
  }

  /**
   * Called before the a layout run starts.
   */
  private onExecutorStarting(): void {
    if (this.canceled) {
      // use an executor that resets the graph to original layout
      this.executor = this.createCanceledLayoutExecutor()
    } else {
      this.clearAreaLayout!.area = this.clearRect.toRect()
    }
  }

  /**
   * Called after the a layout run finished.
   */
  private onExecutorFinished(): void {
    if (this.canceled) {
      if (this.layoutEdit) {
        this.layoutEdit.cancel()
      }
    } else if (this.stopped) {
      // finish undo/redo
      // save the layout of the rectangular area before and after the gesture
      const newRect = this.clearRect.toRect()
      const oldRect = this.oldClearRect
      this.graphComponent.graph.addUndoUnit(
        'Rectangle changed',
        'Rectangle changed',
        () => {
          if (oldRect) {
            this.clearRect.setShape(oldRect)
          }
        },
        () => this.clearRect.setShape(newRect)
      )

      // add all changes of the complete gesture as one undo/redo unit
      if (this.layoutEdit) {
        this.layoutEdit.commit()
      }
    }
  }
}
