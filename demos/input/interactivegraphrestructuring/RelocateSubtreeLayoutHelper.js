/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EdgeRouterScope,
  FillAreaLayout,
  FillAreaLayoutData,
  FilteredGraphWrapper,
  GivenCoordinatesStage,
  GivenCoordinatesStageData,
  GraphComponent,
  IAnimation,
  IBend,
  ICanvasObject,
  IEdge,
  ILayoutAlgorithm,
  INode,
  IPoint,
  LayoutData,
  LayoutExecutor,
  List,
  Mapper,
  PartialLayoutOrientation,
  PortCandidate,
  PortDirections,
  StraightLineEdgeRouter,
  TimeSpan
} from 'yfiles'
import Subtree from './Subtree.js'

/**
 * This class performs the layout and the animation while relocating a subtree.
 */
export default class RelocateSubtreeLayoutHelper {
  /**
   * The layout executor that will run the layout.
   */
  executor

  /**
   * The component that displays the graph.
   */
  graphComponent

  /**
   * The graph layout copy on which the new layout is calculated while the subtree is moving.
   */
  resetToWorkingGraphStageData

  /**
   * The graph layout copy that stores the original layout before the subtree has been moved.
   * This copy is used to restore the graph when the drag is canceled.
   */
  resetToOriginalGraphStageData

  /**
   * The subgraph that is dragged.
   */
  subtree

  /**
   * The canvas object of the edge connecting the subtree with the rest of the graph.
   * This edge is hidden while the subtree is dragged.
   */
  canvasObjectEdge

  /**
   * Sibling subtrees that should not be modified by the layout.
   */
  components = new Mapper()

  /**
   *  A lock which prevents re-entrant layout execution.
   */
  layoutIsRunning = false

  /**
   * Indicates whether a layout run has been requested while a layout calculation is running.
   */
  layoutPending = false

  /**
   * The executor has been stopped.
   * The final layout for the complete tree including the edge to the dragged subtree shall be calculated.
   */
  stopped = false
  canceled = false
  initializing = false

  /**
   * Creates a new instance of {@link RelocateSubtreeLayoutHelper}.
   * @param {!GraphComponent} graphComponent The given graphComponent
   * @param {!Subtree} subtree The subtree to be moved
   */
  constructor(graphComponent, subtree) {
    this.graphComponent = graphComponent
    this.subtree = subtree
    this.components = new Mapper()
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
      this.onLayoutStarting()
      await this.executor.start()
      this.onLayoutFinished()
      // free the executor for the next layout
      this.layoutIsRunning = false
      // repeat if another layout has been requested in the meantime
    } while (this.layoutPending)
  }

  /**
   * Initializes the current layout calculation.
   */
  initializeLayout() {
    this.initializing = true
    this.runLayout()
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
   * Stops the current layout calculation.
   */
  stopLayout() {
    this.executor.stop()
    this.stopped = true
    this.runLayout()
  }

  /**
   * Called before the layout run starts.
   */
  onLayoutStarting() {
    const highlightIndicatorManager = this.graphComponent.highlightIndicatorManager
    if (this.initializing) {
      this.resetToOriginalGraphStageData = this.createGivenCoordinatesStageData(
        () => true,
        () => true
      )
      this.executor = this.createInitializingLayoutExecutor()

      // highlight the parent of the current subtree and make the connection to the root invisible
      if (this.subtree.parent) {
        this.canvasObjectEdge = this.graphComponent.graphModelManager.getCanvasObject(
          this.subtree.parentToRootEdge
        )
        this.canvasObjectEdge.visible = false

        this.subtree.newParent = this.subtree.parent
        this.updateComponents()
        highlightIndicatorManager.addHighlight(this.subtree.newParent)
      }
    } else if (this.stopped) {
      // before the last run starts, we have to re-parent the subtree
      this.applyNewParent()

      // last layout run also includes subtree
      this.executor = this.createFinishedLayoutExecutor()

      // remove highlight
      if (this.subtree.newParent) {
        highlightIndicatorManager.removeHighlight(this.subtree.newParent)
      }
      // make root edge visible
      if (this.subtree.parent === this.subtree.newParent && this.canvasObjectEdge) {
        this.canvasObjectEdge.visible = true
      }
    } else if (this.canceled) {
      // make root edge visible
      if (this.canvasObjectEdge) {
        this.canvasObjectEdge.visible = true
      }
      // remove highlight
      if (this.subtree.newParent) {
        highlightIndicatorManager.removeHighlight(this.subtree.newParent)
      }
      // reset to original graph layout
      this.executor = this.createCanceledLayoutExecutor()
    }
  }

  /**
   * Called after the layout run finished.
   */
  onLayoutFinished() {
    if (this.initializing) {
      this.resetToWorkingGraphStageData = this.createGivenCoordinatesStageData(
        (n) => !this.subtree.nodes.has(n),
        (e) => !this.subtree.edges.has(e)
      )
      this.executor = this.createDraggingLayoutExecutor()
      this.initializing = false
    } else if (!this.stopped && !this.canceled) {
      // check for a new parent candidate
      this.updateNewParent()
    }
  }

  /**
   *  Checks if the moved subtree root is near another parent.
   */
  updateNewParent() {
    // If so, we use that node as new parent of the subtree.
    const candidate = this.getParentCandidate()
    if (candidate !== this.subtree.newParent) {
      if (this.subtree.newParent) {
        this.graphComponent.highlightIndicatorManager.removeHighlight(this.subtree.newParent)
      }

      if (candidate) {
        this.graphComponent.highlightIndicatorManager.addHighlight(candidate)
      }
      this.subtree.newParent = candidate
      this.updateComponents()
    }
  }

  /**
   * Creates a mapping to specify the components which should not be modified by the method clearAreaLayout().
   */
  updateComponents() {
    const graph = this.graphComponent.graph
    this.components.clear()
    if (this.subtree.newParent) {
      graph.outEdgesAt(this.subtree.newParent).forEach((edge) => {
        const siblingSubtree = new Subtree(graph, edge.targetNode)
        siblingSubtree.nodes.forEach((node) => {
          this.components.set(node, siblingSubtree)
        })
      })
    }
  }

  /**
   * Determines the node that is nearest to the subtree root.
   * @returns {?INode}
   */
  getParentCandidate() {
    const graph = this.graphComponent.graph
    const nodesOnTop = new List()
    const rootY = this.subtree.root.layout.y
    let maxY = Number.NEGATIVE_INFINITY
    graph.nodes.forEach((node) => {
      const nodeMaxY = node.layout.maxY
      if (!this.subtree.nodes.has(node) && nodeMaxY < rootY) {
        maxY = Math.max(maxY, nodeMaxY)
        nodesOnTop.add(node)
      }
    })

    let minDist = Number.POSITIVE_INFINITY
    let result = null
    const rootCenter = this.subtree.root.layout.center
    nodesOnTop.forEach((node) => {
      if (node.layout.maxY > maxY - 30) {
        const dist = rootCenter.distanceTo(node.layout.center)
        if (dist < minDist) {
          minDist = dist
          result = node
        }
      }
    })
    return result
  }

  /**
   * Relocates the edge to the subtree root to the new parent node.
   */
  applyNewParent() {
    const graph = this.graphComponent.graph
    if (this.subtree.parent !== this.subtree.newParent) {
      if (this.subtree.parent) {
        graph.remove(this.subtree.parentToRootEdge)
      }
      if (this.subtree.newParent) {
        graph.createEdge(this.subtree.newParent, this.subtree.root)
      }
      this.subtree.parent = this.subtree.newParent
    }
  }

  /**
   * Creates a {@link GivenCoordinatesStageData} that stores the layout of nodes and edges.
   * @param {!function} nodePredicate Determines the nodes to store
   * @param {!function} edgePredicate Determines the edges to store
   * @returns {!GivenCoordinatesStageData} The {@link GivenCoordinatesStageData}
   */
  createGivenCoordinatesStageData(nodePredicate, edgePredicate) {
    const layoutData = new GivenCoordinatesStageData()
    const graph = this.graphComponent.graph
    graph.nodes
      .filter((node) => nodePredicate(node))
      .forEach((node) => {
        const layout = node.layout
        layoutData.nodeLocations.mapper.set(node, layout.topLeft)
        layoutData.nodeSizes.mapper.set(node, layout.toSize())
      })

    graph.edges
      .filter((edge) => edgePredicate(edge))
      .forEach((edge) => {
        const points = new List()
        points.add(edge.sourcePort.location)
        points.addRange(edge.bends.map((bend) => bend.location.toPoint()))
        points.add(edge.targetPort.location)
        layoutData.edgePaths.mapper.set(edge, points)
      })

    return layoutData
  }

  /**
   * A {@link LayoutExecutor} that is used when the subtree dragging starts.
   * When the drag begins, the {@link FillAreaLayout} fills up the space that was covered by the subtree.
   * This state is the initial layout for the {@link ClearAreaLayout} during the drag.
   * @returns {!LayoutExecutor}
   */
  createInitializingLayoutExecutor() {
    return new LayoutExecutor({
      graphComponent: this.graphComponent,
      // the FillAreaLayout is only applied to the part of the tree that does not belong to the subtree
      graph: new FilteredGraphWrapper(
        this.graphComponent.graph,
        (n) => !this.subtree.nodes.has(n),
        () => true
      ),
      layout: new FillAreaLayout({
        area: this.subtree.bounds.toYRectangle(),
        layoutOrientation: PartialLayoutOrientation.TOP_TO_BOTTOM,
        componentAssignmentStrategy: ComponentAssignmentStrategy.CUSTOMIZED,
        spacing: 50
      }),
      layoutData: new FillAreaLayoutData({
        componentIds: this.components
      }),
      duration: TimeSpan.fromMilliseconds(150)
    })
  }

  /**
   * A {@link LayoutExecutor} that is used while dragging the subtree.
   * First, all nodes and edges are pushed back into place before the drag started, except the
   * elements of the subtree. Then space is made for the subtree at its current position. The
   * animation morphs all elements, except those in the subtree, to the calculated positions.
   * @returns {!LayoutExecutor}
   */
  createDraggingLayoutExecutor() {
    const draggingLayoutExecutor = new DraggingLayoutExecutor(
      this.graphComponent,
      RelocateSubtreeLayoutHelper.createClearAreaLayout(true),
      this.subtree.nodes
    )
    draggingLayoutExecutor.layoutData = this.createClearAreaLayoutData()
    draggingLayoutExecutor.duration = TimeSpan.fromMilliseconds(150)
    return draggingLayoutExecutor
  }

  /**
   * A {@link LayoutExecutor} that is used after the drag is finished.
   * First, all nodes and edges are pushed back into place before the drag started, except the
   * element of the subtree. Then space is made for the subtree at its current position. The
   * animation morphs all elements to the calculated positions.
   * @returns {!LayoutExecutor}
   */
  createFinishedLayoutExecutor() {
    return new LayoutExecutor({
      graphComponent: this.graphComponent,
      layout: RelocateSubtreeLayoutHelper.createClearAreaLayout(false),
      duration: TimeSpan.fromMilliseconds(150),
      layoutData: this.createClearAreaLayoutData()
    })
  }

  /**
   * A {@link LayoutExecutor} that is used after the drag is canceled.
   * All nodes and edges are pushed back into place before the drag started.
   * @returns {!LayoutExecutor}
   */
  createCanceledLayoutExecutor() {
    return new LayoutExecutor({
      graphComponent: this.graphComponent,
      layout: new GivenCoordinatesStage(),
      layoutData: this.resetToOriginalGraphStageData,
      duration: TimeSpan.fromMilliseconds(150)
    })
  }

  /**
   * Creates the {@link ILayoutAlgorithm} used while dragging and finishing the gesture.
   * @param {boolean} dragging
   * @returns {!ILayoutAlgorithm}
   */
  static createClearAreaLayout(dragging) {
    if (dragging) {
      return new GivenCoordinatesStage(
        new ClearAreaLayout({
          componentAssignmentStrategy: ComponentAssignmentStrategy.CUSTOMIZED,
          clearAreaStrategy: ClearAreaStrategy.PRESERVE_SHAPES,
          layoutOrientation: PartialLayoutOrientation.TOP_TO_BOTTOM,
          edgeRouter: new StraightLineEdgeRouter({
            scope: EdgeRouterScope.ROUTE_AFFECTED_EDGES
          })
        })
      )
    } else {
      return new GivenCoordinatesStage(
        new ClearAreaLayout({
          componentAssignmentStrategy: ComponentAssignmentStrategy.CUSTOMIZED,
          clearAreaStrategy: ClearAreaStrategy.PRESERVE_SHAPES,
          layoutOrientation: PartialLayoutOrientation.TOP_TO_BOTTOM
        })
      )
    }
  }

  /**
   * Creates the {@link LayoutData} used while dragging and finishing the gesture.
   * @returns {!LayoutData}
   */
  createClearAreaLayoutData() {
    return new CompositeLayoutData(
      this.resetToWorkingGraphStageData,
      new ClearAreaLayoutData({
        areaNodes: (node) => this.subtree.nodes.has(node),
        componentIds: this.components,
        // force the router to let edges leave the nodes at the center of the south side
        // and to let enter the nodes in the center of the north side
        sourcePortCandidates: [PortCandidate.createCandidate(0, 0, PortDirections.SOUTH)],
        targetPortCandidates: [PortCandidate.createCandidate(0, 0, PortDirections.NORTH)]
      })
    )
  }
}

/**
 * A class that calculates the layout for the whole graph but animates only the part that does not
 * belong to the subtree.
 */
class DraggingLayoutExecutor extends LayoutExecutor {
  /**
   * The graph that contains all elements except the subgraph. This is the part of the graph that is
   * morphed after a new layout has been calculated.
   */
  filteredGraph

  /**
   * Creates a new instance of {@link DraggingLayoutExecutor}.
   * @param {!GraphComponent} graphComponent The given graphComponent
   * @param {!ILayoutAlgorithm} layout The layout algorithm to apply
   * @param {!Set.<INode>} nodes The subgraph on which the layout will be applied
   */
  constructor(graphComponent, layout, nodes) {
    super(graphComponent, layout)
    this.filteredGraph = new FilteredGraphWrapper(
      graphComponent.graph,
      (n) => !nodes.has(n),
      () => true
    )
  }

  /**
   * Creates an {@link IAnimation} that morphs all graph elements except the subgraph to
   * the new layout.
   * @returns {!IAnimation}
   */
  createMorphAnimation() {
    return IAnimation.createLayoutAnimation(this.filteredGraph, this.layoutGraph, this.duration)
  }
}
