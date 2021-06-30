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
  ChannelEdgeRouter,
  ClearAreaLayout,
  ClearAreaLayoutData,
  CompositeLayoutData,
  GivenCoordinatesStage,
  GivenCoordinatesStageData,
  GraphComponent,
  ICompoundEdit,
  IEdge,
  IGraph,
  ILayoutAlgorithm,
  INode,
  LayoutData,
  LayoutExecutor,
  LayoutGraph,
  LayoutStageBase,
  MutableRectangle,
  Rect
} from 'yfiles'

import { LayoutOptions } from './LayoutOptions.js'

/**
 * Performs layout and animation while dragging the marquee rectangle.
 */
export class ClearAreaLayoutHelper {
  /**
   * The graph that is displayed.
   * @type {!IGraph}
   */
  get graph() {
    return this.graphComponent.graph
  }

  /**
   * Initializes the helper.
   * @param {!GraphComponent} graphComponent The component that displays the graph.
   * @param {!MutableRectangle} clearRect The rectangle the is dragged.
   * @param {!LayoutOptions} options Options to control the layout behavior
   */
  constructor(graphComponent, clearRect, options) {
    // Performs the layout and the animation.
    this.executor = null

    // The graph layout copy that stores the original layout before the marquee rectangle has been dragged.
    this.resetToOriginalGraphStageData = null

    // The layout of the rectangular area at the beginning of the gesture. Used for undo/redo.
    this.oldClearRect = null

    // The {@link ILayoutAlgorithm} that makes space for the rectangular area
    this.clearAreaLayout = null

    // The group node we are currently inside.
    this.groupNode = null

    // ---------------------------------------------------------------------------- Layout Execution
    // A lock which prevents re-entrant layout execution.
    this.layoutIsRunning = false

    // Indicates whether a layout run has been requested while running a layout calculation.
    this.layoutPending = false

    // Indicates that the gesture has been canceled and the original layout should be restored.
    this.canceled = false

    // Indicates that the gesture has been finished and the new layout should be applied.
    this.stopped = false

    // Creates a single unit to undo and redo the complete reparent gesture.
    this.layoutEdit = null

    // The control that displays the graph.
    this.graphComponent = graphComponent
    // The rectangular area that can be freely moved or resized.
    this.clearRect = clearRect
    // Options to control the layout behavior.
    this.options = options
  }

  // --------------------------------------------------------------- LayoutExecutor configurations

  /**
   * Creates a {@link GivenCoordinatesStageData} that store the layout of nodes and edges.
   * @returns {!GivenCoordinatesStageData}
   */
  createGivenCoordinateStageData() {
    const data = new GivenCoordinatesStageData()

    this.graph.nodes.forEach(node => {
      data.nodeLocations.mapper.set(node, node.layout.topLeft)
      data.nodeSizes.mapper.set(node, node.layout.toSize())
    })

    this.graph.edges.forEach(edge => {
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
   * @returns {!LayoutExecutor}
   */
  createDraggingLayoutExecutor() {
    return new LayoutExecutor({
      graphComponent: this.graphComponent,
      layout: this.createDraggingLayout(),
      layoutData: this.createDraggingLayoutData(),
      duration: '150ms'
    })
  }

  /**
   * A {@link LayoutExecutor} that is used after the drag is canceled.
   *
   * All nodes and edges are pushed back into place before the drag started.
   * @returns {!LayoutExecutor}
   */
  createCanceledLayoutExecutor() {
    return new LayoutExecutor({
      graphComponent: this.graphComponent,
      layout: new GivenCoordinatesStage(),
      layoutData: this.resetToOriginalGraphStageData,
      duration: '150ms'
    })
  }

  /**
   * Creates a {@link ILayoutAlgorithm} used while dragging and finishing the gesture.
   * @returns {!ILayoutAlgorithm}
   */
  createDraggingLayout() {
    this.clearAreaLayout = new ClearAreaLayout({
      componentAssignmentStrategy: this.options.componentAssignmentStrategy,
      clearAreaStrategy: this.options.clearAreaStrategy,
      considerEdges: this.options.considerEdges
    })
    this.clearAreaLayout.edgeRouter = new AffectedEdgesChannelRouter()
    return new GivenCoordinatesStage(this.clearAreaLayout)
  }

  /**
   * Creates a {@link LayoutData} used while dragging and finishing the gesture.
   * @returns {!LayoutData}
   */
  createDraggingLayoutData() {
    const clearAreaLayoutData = new ClearAreaLayoutData()
    clearAreaLayoutData.areaGroupNode.delegate = node => node === this.groupNode

    return new CompositeLayoutData(this.resetToOriginalGraphStageData, clearAreaLayoutData)
  }

  /**
   * Starts a layout calculation if none is already running.
   * @returns {!Promise}
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

      // start the layout
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
    // prepare undo/redo
    this.oldClearRect = this.clearRect.toRect()
    this.layoutEdit = this.graph.beginEdit('Clear Area', 'Clear Area')

    this.resetToOriginalGraphStageData = this.createGivenCoordinateStageData()
    this.executor = this.createDraggingLayoutExecutor()
  }

  /**
   * Cancels the current layout calculation.
   */
  cancelLayout() {
    if (this.executor) {
      this.executor.stop()
    }
    this.canceled = true
    this.runLayout()
  }

  /**
   * Stops the current layout calculation.
   */
  stopLayout() {
    if (this.executor) {
      this.executor.stop()
    }
    this.stopped = true

    // noinspection JSIgnoredPromiseFromCall
    this.runLayout()
  }

  /**
   * Called before the a layout run starts.
   */
  onExecutorStarting() {
    if (this.canceled) {
      // use an executor that resets the graph to original layout
      this.executor = this.createCanceledLayoutExecutor()
    } else {
      this.clearAreaLayout.area = this.clearRect.toRect().toYRectangle()
    }
  }

  /**
   * Called after the a layout run finished.
   */
  onExecutorFinished() {
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
            this.clearRect.reshape(oldRect)
          }
        },
        () => this.clearRect.reshape(newRect)
      )

      // add all changes of the complete gesture as one undo/redo unit
      if (this.layoutEdit) {
        this.layoutEdit.commit()
      }
    }
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
