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
  CollectSnapResultsEventArgs,
  DragDropEffects,
  DragDropItem,
  DragSource,
  FilteredGraphWrapper,
  GraphComponent,
  GraphCopier,
  GraphItemTypes,
  GraphSnapContext,
  HighlightIndicatorManager,
  IBend,
  IGraph,
  IHitTester,
  IInputModeContext,
  IModelItem,
  INode,
  INodeSnapResultProvider,
  ItemDropInputMode,
  NodeSnapResultProvider,
  Point,
  Rect
} from '@yfiles/yfiles'

/**
 * An {@link ItemDropInputMode} specialized to drag and drop {@link IGraph graphs}.
 *
 * It can {@link ItemDropInputMode.showPreview visualize a preview} of the
 * {@link ItemDropInputMode.draggedItem dragged graph} during
 * the drag operation, and supports {@link ItemDropInputMode.snappingEnabled snapping} via the
 * {@link ItemDropInputMode.snapContext snapContext} and
 * {@link ItemDropInputMode.highlightDropTarget highlighting} of the
 * {@link ItemDropInputMode.dropTarget dropTarget} via a
 * {@link HighlightIndicatorManager}. In addition, it supports dragging nodes into
 * {@link IGraph.isGroupNode groups} and, optionally,
 * {@link IFoldingView.collapse folders}.
 */
export class GraphDropInputMode extends ItemDropInputMode {
  /**
   * Gets or sets a value indicating whether graphs can be dropped on
   * {@link IFoldingView.collapse collapsed} folder nodes.
   *
   * If this property is set to `true`, dropping a graph on collapsed folder nodes
   * will create the graph inside the folder node in the master graph. In that case the
   * {@link ItemDropInputMode.setItemCreatedListener ItemCreated} event will yield the items if the
   * graph in the {@link FoldingManager.masterGraph master graph}. The items of the graph will
   * not be {@link IGraph.contains contained} in the currently visible graph. By default this
   * feature is disabled.
   */
  allowFolderNodeAsParent

  // The center of the preview graph.
  center

  // The latest filtered graph.
  graphWrapper = null

  /**
   * Constructs a new instance of class {@link GraphDropInputMode}.
   */
  constructor() {
    super('graph')
    this.itemCreator = this.createGraph.bind(this)
    this.center = Point.ORIGIN
    this.allowFolderNodeAsParent = false
  }

  /**
   * Gets the currently dragged graph from the drop data.
   */
  get draggedItem() {
    return this.dropData
  }

  /**
   * Creates the dragged graph in the target graph after the dragged graph has been dropped.
   * This method is called by the {@link ItemDropInputMode.itemCreator} that
   * is set as default on this class.
   * @param context The context for which the graph should be created.
   * @param graph The target {@link IGraph graph} in which to create the dragged graph.
   * @param draggedGraph The graph that was dragged and should therefore be created.
   * The items of the graph will be copied into the graph of the {@link GraphComponent}.
   * @param dropTarget The {@link IModelItem} on which the graph is dropped.
   * @param dropLocation The location where the graph has been dropped.
   * @returns A newly created graph.
   */
  createGraph(context, graph, draggedGraph, dropTarget, dropLocation) {
    // move the graph to the drop location
    const delta = dropLocation.subtract(this.getCenter(draggedGraph))
    this.move(draggedGraph, delta)

    // create the graph and collect the dropped nodes
    const droppedNodes = new Set()

    let targetGraph = graph
    let parent = null
    if (dropTarget instanceof INode) {
      if (graph.isGroupNode(dropTarget)) {
        parent = dropTarget
      } else {
        const foldingView = graph.foldingView
        targetGraph = foldingView.manager.masterGraph
        parent = foldingView.getMasterItem(dropTarget)
      }
    }

    new GraphCopier().copy({
      sourceGraph: draggedGraph,
      targetGraph,
      targetRootNode: parent,
      itemCopiedCallback: (_, copy) => {
        if (copy instanceof INode) {
          droppedNodes.add(copy)
        }
      }
    })

    if (parent) {
      targetGraph.groupingSupport.enlargeGroupNode(context, parent, true)
    }

    // dispose any previous created graph instances to avoid memory leaks
    if (this.graphWrapper) {
      this.graphWrapper.dispose()
    }

    // return the dropped graph
    this.graphWrapper = new FilteredGraphWrapper(targetGraph, (node) => droppedNodes.has(node))

    return this.graphWrapper
  }

  /**
   * Fills the specified graph that is used to preview the dragged graph.
   * @param previewGraph The preview graph to fill.
   */
  populatePreviewGraph(previewGraph) {
    const draggedGraph = this.draggedItem
    if (!draggedGraph) {
      return
    }

    // copy the dragged items into the preview graph
    new GraphCopier().copy(draggedGraph, previewGraph)
    this.center = this.getCenter(previewGraph)
  }

  /**
   * Updates the {@link GraphDropInputMode.previewGraph preview graph} so the dragged graph is
   * displayed at the specified {@link GraphDropInputMode.setDragLocation}.
   * @param previewGraph The preview graph to update.
   * @param dragLocation The current drag location.
   */
  updatePreview(previewGraph, dragLocation) {
    // move the preview graph to the drag location
    const delta = dragLocation.subtract(this.center)
    this.move(previewGraph, delta)
    this.center = dragLocation

    this.repaintCanvas()
  }

  repaintCanvas() {
    if (this.parentInputModeContext && this.parentInputModeContext.canvasComponent) {
      this.parentInputModeContext.canvasComponent.invalidate()
    }
  }

  /**
   * Returns the center of the given graph.
   */
  getCenter(graph) {
    return graph.nodes
      .map((node) => node.layout.toRect())
      .reduce((total, bounds) => Rect.add(total, bounds), Rect.EMPTY).center
  }

  /**
   * Moves the given graph by the given delta.
   */
  move(graph, delta) {
    const moveNode = (node) => graph.setNodeLayout(node, node.layout.toRect().getTranslated(delta))
    const moveBend = (bend) => graph.setBendLocation(bend, bend.location.toPoint().add(delta))

    graph.nodes.forEach(moveNode)
    graph.edges.flatMap((edge) => edge.bends).forEach(moveBend)
  }

  getDropTarget(dragLocation) {
    const validDrag =
      !this.lastDragEventArgs || this.lastDragEventArgs.dropEffect !== DragDropEffects.NONE
    if (!this.parentInputModeContext || !this.parentInputModeContext.graph || !validDrag) {
      return null
    }

    return this.getDropTargetParentNode(
      this.parentInputModeContext,
      this.parentInputModeContext.graph,
      dragLocation
    )
  }

  /**
   * Returns a valid parent node at the current mouse location to drop the dragged graph onto or null.
   */
  getDropTargetParentNode(context, graph, dragLocation) {
    const hitTestEnumerator = context.lookup(IHitTester)
    // hit testing needs to be done with a context whose parent input mode is this mode,
    return (
      hitTestEnumerator
        ?.enumerateHits(this.createInputModeContext(), dragLocation, GraphItemTypes.NODE)
        .find((node) => this.isValidDropTargetParentNode(graph, node)) ?? null
    )
  }

  /**
   * Checks whether the given node is a valid parent node to drop the dragged graph onto.
   */
  isValidDropTargetParentNode(graph, node) {
    return (
      graph.contains(node) &&
      (graph.isGroupNode(node) || (this.allowFolderNodeAsParent && this.isFolderNode(graph, node)))
    )
  }

  /**
   * Checks whether the given node is a folder node.
   */
  isFolderNode(graph, node) {
    const isGroupNodeInViewGraph = graph.isGroupNode(node)
    const foldingView = graph.foldingView
    const masterNode = foldingView.getMasterItem(node)
    const isGroupNodeInMasterGraph = masterNode
      ? foldingView.manager.masterGraph.isGroupNode(masterNode)
      : false
    return !isGroupNodeInViewGraph && isGroupNodeInMasterGraph
  }

  collectSnapResults(evt, snapContext) {
    if (!this.previewGraph || !this.draggedItem) {
      return
    }
    this.previewGraph.nodes.forEach((node) => {
      const suggestedLayout = this.getNodeLayoutAt(node, evt.newLocation)
      const provider = node.lookup(INodeSnapResultProvider) ?? NodeSnapResultProvider.INSTANCE
      provider.collectSnapResults(snapContext, evt, suggestedLayout, node)
    })
  }

  /**
   * Gets the layout of a given node at the given location.
   */
  getNodeLayoutAt(node, location) {
    const delta = location.subtract(this.center)
    return node.layout.toRect().getTranslated(delta)
  }

  /**
   * Initializes the information for a drag and drop operation from the graph palette and starts the operation.
   */
  static startDrag(
    dragSource,
    graph,
    dragDropEffects = DragDropEffects.ALL,
    useCssCursors = true,
    dragPreview = null
  ) {
    const source = new DragSource(dragSource)
    source.startDrag(new DragDropItem('graph', graph), dragDropEffects, useCssCursors, dragPreview)
    return source
  }
}
