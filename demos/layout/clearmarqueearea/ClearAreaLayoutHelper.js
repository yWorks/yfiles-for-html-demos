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
  IEdge,
  LayoutExecutor
} from '@yfiles/yfiles'

/**
 * Performs layout and animation while dragging the marquee rectangle.
 */
export class ClearAreaLayoutHelper {
  /**
   * Performs the layout and the animation.
   */
  executor

  /**
   * The graph that is displayed.
   */
  get graph() {
    return this.graphComponent.graph
  }

  /**
   * The control that displays the graph.
   */
  graphComponent

  /**
   * The graph layout copy that stores the original layout before the marquee rectangle has been dragged.
   */
  resetToOriginalGraphStageData

  /**
   * The marquee rectangle.
   */
  clearRectangle

  /**
   * The group node within which the marquee was created, otherwise null.
   */
  groupNode

  /**
   * The {@link ILayoutAlgorithm} that makes space for the marquee rectangle.
   */
  clearAreaLayout
  componentAssignmentStrategy
  clearAreaStrategy

  /**
   * Initializes the helper.
   */
  constructor(
    graphComponent,
    clearRectangle,
    groupNode,
    componentAssignmentStrategy,
    clearAreaStrategy
  ) {
    this.graphComponent = graphComponent
    this.clearRectangle = clearRectangle
    this.groupNode = groupNode
    this.componentAssignmentStrategy = componentAssignmentStrategy
    this.clearAreaStrategy = clearAreaStrategy
    this.canceled = false
    this.layoutIsRunning = false
    this.layoutPending = false
    this.stopped = false
    this.clearAreaLayout = null
    this.layoutEdit = null
    this.executor = null
    this.resetToOriginalGraphStageData = null
  }

  /**
   * Creates a {@link GivenCoordinatesLayoutData} that store the layout of nodes and edges.
   */
  createGivenCoordinateStageData() {
    const data = new GivenCoordinatesLayoutData()
    for (const node of this.graph.nodes) {
      data.nodeLocations.mapper.set(node, node.layout.topLeft)
      data.nodeSizes.mapper.set(node, node.layout.toSize())
    }
    for (const edge of this.graph.edges) {
      data.edgePaths.mapper.set(edge, IEdge.getPathPoints(edge))
    }
    return data
  }

  /**
   * A {@link LayoutExecutor} that is used while dragging the marquee rectangle.
   *
   * First, all nodes and edges are pushed back into place before the drag started. Then space
   * is made for the rectangle at its current position. The animation morphs all elements to the
   * calculated positions.
   */
  createDraggingLayoutExecutor() {
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
  createCanceledLayoutExecutor() {
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
  createDraggingLayout() {
    this.clearAreaLayout = new ClearAreaLayout({
      componentAssignmentStrategy: this.componentAssignmentStrategy,
      clearAreaStrategy: this.clearAreaStrategy,
      considerEdges: true
    })
    return new GivenCoordinatesLayout(this.clearAreaLayout)
  }

  /**
   * Creates a {@link LayoutData} used while dragging and finishing the gesture.
   */
  createDraggingLayoutData() {
    return new CompositeLayoutData(
      this.resetToOriginalGraphStageData,
      new ClearAreaLayoutData({ areaGroupNode: (node) => node === this.groupNode })
    )
  }

  /**
   * A lock which prevents re-entrant layout execution.
   */
  layoutIsRunning

  /**
   * Indicates whether a layout run has been requested while running a layout calculation.
   */
  layoutPending

  /**
   * Indicates that the gesture has been canceled and the original layout should be restored.
   */
  canceled

  /**
   * Indicates that the gesture has been finished and the new layout should be applied.
   */
  stopped

  /**
   * Creates a single unit to undo and redo the complete reparent gesture.
   */
  layoutEdit

  /**
   * Starts a layout calculation if none is already running.
   */
  async runLayout() {
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
      await this.executor.start()
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
  initializeLayout() {
    this.layoutEdit = this.graph.beginEdit('Clear Area', 'Clear Area')
    this.resetToOriginalGraphStageData = this.createGivenCoordinateStageData()
    this.executor = this.createDraggingLayoutExecutor()
  }

  /**
   * Cancels the current layout calculation.
   */
  async cancelLayout() {
    await this.executor.stop()
    this.canceled = true
    await this.runLayout()
  }

  /**
   * Stops the current layout calculation.
   */
  async stopLayout() {
    await this.executor.stop()
    this.stopped = true
    await this.runLayout()
  }

  /**
   * Called before a layout run starts.
   */
  onExecutorStarting() {
    if (this.canceled) {
      // reset to original graph layout
      this.executor = this.createCanceledLayoutExecutor()
    } else {
      this.clearAreaLayout.area = this.clearRectangle
    }
  }

  /**
   * Called after the a layout run finished.
   */
  onExecutorFinished() {
    if (this.canceled) {
      this.layoutEdit.cancel()
    } else if (this.stopped) {
      this.layoutEdit.commit()
    }
  }
}
