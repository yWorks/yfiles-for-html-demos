/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
  ClearAreaLayout,
  ClearAreaLayoutData,
  ClearAreaStrategy,
  ComponentAssignmentStrategy,
  CompositeLayoutData,
  GivenCoordinatesStage,
  GivenCoordinatesStageData,
  GraphComponent,
  IEdge,
  IEnumerable,
  IGraph,
  ILayoutAlgorithm,
  INode,
  LayoutExecutor,
  LayoutGraphAdapter,
  List,
  Point,
  Rect,
  FilteredGraphWrapper
} from 'yfiles'

/**
 * Performs layout and animation during the drag and drop operation.
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
   * @param {!GraphComponent} graphComponent The control that displays the graph.
   * @param {!IEnumerable.<INode>} component The component the is dragged.
   * @param {boolean} keepComponents Defines whether or not components should not be separated by the layout algorithm.
   */
  constructor(graphComponent, component, keepComponents) {
    // The {@link ILayoutAlgorithm} that makes space for the dropped component.
    this.clearAreaLayout = null

    // The control that displays the graph.
    this.graphComponent = graphComponent
    // The location of the last drag. Used to move the outline to the current mouse location.
    this.oldLocation = this.getCenter(component)
    // The component that has been created by the drag and drop operation.
    this.component = component
    // Components that should not be modified by the layout.
    this.keepComponents = keepComponents

    // The location of the current drag.
    this.location = this.oldLocation

    // A lock which prevents re-entrant layout execution.
    this.layoutIsRunning = false
    // Indicates whether a layout run has been requested while running a layout calculation.
    this.layoutPending = false
    // Indicates that the executor has been canceled and the original layout should be restored.
    this.canceled = false
    // Indicates that the final layout should be calculated.
    this.finished = false
  }

  /**
   * Returns the center of the {@link ClearAreaLayoutHelper#graph}.
   * @param {!IEnumerable.<INode>} nodes
   * @returns {!Point}
   */
  getCenter(nodes) {
    const bounds = this.getRect(nodes)
    return bounds.center
  }

  /**
   * Returns the rectangle enclosing the given nodes.
   * @param {!IEnumerable.<INode>} nodes
   * @returns {!Rect}
   */
  getRect(nodes) {
    let bounds = Rect.EMPTY
    nodes.forEach(node => {
      bounds = Rect.add(bounds, node.layout.toRect())
    })
    return bounds
  }

  /**
   * Creates a {@link GivenCoordinatesStageData} that store the layout of nodes and edges.
   * @returns {!GivenCoordinatesStageData}
   */
  createGivenCoordinateStageData() {
    const givenCoordinatesStageData = new GivenCoordinatesStageData()

    // store the initial coordinates and sizes of all nodes and bends not related to the current component
    this.graph.nodes
      .filter(node => !this.component.includes(node))
      .forEach(node => {
        givenCoordinatesStageData.nodeLocations.mapper.set(node, node.layout.topLeft.toPoint())
        givenCoordinatesStageData.nodeSizes.mapper.set(node, node.layout.toSize())
      })
    this.graph.edges
      .filter(
        edge =>
          !this.component.includes(edge.sourceNode) || !this.component.includes(edge.targetNode)
      )
      .forEach(edge => {
        givenCoordinatesStageData.edgePaths.mapper.set(edge, this.getEdgePath(edge))
      })
    return givenCoordinatesStageData
  }

  /**
   * Gets the edge path including the source and target ports.
   * @param {!IEdge} edge
   * @returns {!List.<Point>}
   */
  getEdgePath(edge) {
    const points = new List()
    points.add(edge.sourcePort.location.toPoint())
    edge.bends.forEach(bend => {
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
   * @returns {!LayoutExecutor}
   */
  createDraggingLayoutExecutor() {
    const clearAreaLayout = new ClearAreaLayout({
      componentAssignmentStrategy: ComponentAssignmentStrategy.CUSTOMIZED,
      clearAreaStrategy: ClearAreaStrategy.PRESERVE_SHAPES
    })

    clearAreaLayout.configureAreaOutline(this.component, 10)
    const layout = new GivenCoordinatesStage(clearAreaLayout)
    this.clearAreaLayout = clearAreaLayout

    const layoutData = new CompositeLayoutData(
      this.resetToOriginalGraphStageData,
      new ClearAreaLayoutData({
        componentIds: node => (this.keepComponents ? node.tag.component : null)
      })
    )

    return new LayoutExecutor({
      graphComponent: this.graphComponent,
      graph: new FilteredGraphWrapper(
        this.graphComponent.graph,
        node => !this.component.includes(node),
        () => true
      ),
      layout: layout,
      layoutData: layoutData,
      duration: '150ms'
    })
  }

  /**
   * A {@link LayoutExecutor} that is used after the drag and drop operation has been
   * canceled.
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
   * A {@link LayoutExecutor} that is used after the drag and drop operation is finished.
   * All nodes and edges are pushed back into place before the drag started. Then space is made
   * for the component that has been dropped.
   * @returns {!LayoutExecutor}
   */
  createFinishedLayoutExecutor() {
    const layout = new GivenCoordinatesStage(
      new ClearAreaLayout({
        componentAssignmentStrategy: ComponentAssignmentStrategy.CUSTOMIZED,
        clearAreaStrategy: ClearAreaStrategy.PRESERVE_SHAPES
      })
    )

    const layoutData = new CompositeLayoutData(this.resetToOriginalGraphStageData)
    layoutData.items.add(
      new ClearAreaLayoutData({
        areaNodes: this.component,
        componentIds: node => (this.keepComponents ? node.tag.component : null)
      })
    )

    return new LayoutExecutor({
      graphComponent: this.graphComponent,
      layout,
      layoutData,
      duration: '150ms'
    })
  }

  /**
   * Starts a layout calculation if none is already running.
   */
  runLayout() {
    if (this.layoutIsRunning) {
      // if another layout is running: request a new layout and exit
      this.layoutPending = true
      return
    }
    this.runLayoutCore()
  }

  /**
   * @returns {!Promise}
   */
  async runLayoutCore() {
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
  initializeLayout() {
    this.resetToOriginalGraphStageData = this.createGivenCoordinateStageData()
    this.executor = this.createDraggingLayoutExecutor()
  }

  /**
   * Cancels the current layout calculation.
   */
  cancelLayout() {
    this.executor.stop()
    this.canceled = true
    this.runLayout()
  }

  /**
   * Finishes the current layout calculation.
   */
  finishLayout() {
    this.executor.stop()
    this.finished = true
    this.runLayout()
  }

  /**
   * Moves the {@link ClearAreaLayout#areaOutline} to the current drag location.
   */
  updateOutline() {
    if (this.location !== this.oldLocation) {
      const delta = this.location.subtract(this.oldLocation)
      this.clearAreaLayout.moveAreaOutline(delta)
      this.oldLocation = this.location
    }
  }
}
