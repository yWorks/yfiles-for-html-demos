/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  DragDropEffects,
  DragDropItem,
  DragSource,
  FilteredGraphWrapper,
  GraphCopier,
  IGraph,
  IInputModeContext,
  IModelItem,
  INode,
  ItemDropInputMode,
  Point,
  Rect
} from 'yfiles'

/**
 * An {@linkItemDropInputMode} specialized to drag and drop {@link IGraph components}.
 * Each component is stored and handled as an {@link IGraph} instance
 * where all nodes and edges belong solely to that component.
 */
export class ComponentDropInputMode extends ItemDropInputMode {
  /**
   * Constructs a new instance of class {@link ComponentDropInputMode}.
   */
  constructor() {
    super('component')
    this.itemCreator = this.createComponent
    // The center of the preview graph.
    this.center = Point.ORIGIN
  }

  /**
   * Gets the currently dragged component from the drop data.
   * @type {IGraph}
   */
  get draggedItem() {
    return this.dropData
  }

  /**
   * Creates the component in the graph after it has been dropped.
   * This method is called by the  {@link ItemDropInputMode#itemCreator} that
   * is set as default on this class.
   * @param {IInputModeContext} context The context for which the component should be created.
   * @param {IGraph} graph The  {@link IGraph Graph} in which to create the component.
   * @param {*} draggedGraph The component that was dragged and should therefore be created.
   * The nodes and edges of the component will be copied into the {@link ComponentDropInputMode#graph}.
   * @param {?IModelItem} dropTarget The  {@link IModelItem} on which the component is dropped. This is ignored here.
   * @param {Point} dropLocation The location where the component has been dropped.
   * @returns {?IGraph} A newly created component.
   */
  createComponent(context, graph, draggedGraph, dropTarget, dropLocation) {
    // move the component to the drop location
    const delta = dropLocation.subtract(this.getCenter(draggedGraph))

    this.move(draggedGraph, delta)

    // create the component and collect the dropped nodes
    const droppedNodes = new Set()
    new GraphCopier().copy(
      draggedGraph,
      () => true,
      graph,
      Point.ORIGIN,
      (original, copy) => {
        const node = copy

        if (node !== null) {
          droppedNodes.add(node)
        }
      }
    )

    // return the dropped component
    return new FilteredGraphWrapper(
      graph,
      node => droppedNodes.has(node),
      () => true
    )
  }

  /**
   * Fills the specified graph that is used to preview the dragged component.
   * @param {IGraph} previewGraph The preview graph to fill.
   */
  populatePreviewGraph(previewGraph) {
    const draggedGraph = this.draggedItem

    if (draggedGraph === null) {
      return
    }

    // copy the component into the preview graph
    new GraphCopier().copy(draggedGraph, previewGraph)
    this.center = this.getCenter(previewGraph)
  }

  /**
   * Updates the {@link ComponentDropInputMode#previewGraph preview graph} so the dragged component is
   * displayed at the specified {@link ComponentDropInputMode#setDragLocation}.
   * @param {IGraph} previewGraph The preview graph to update.
   * @param {Point} dragLocation The current drag location.
   */
  updatePreview(previewGraph, dragLocation) {
    // move the preview graph to the drag location
    const delta = dragLocation.subtract(this.center)

    this.move(previewGraph, delta)

    this.center = dragLocation

    // trigger a repaint
    const canvas = this.inputModeContext.canvasComponent

    if (canvas !== null) {
      canvas.invalidate()
    }
  }

  /**
   * Returns the center of the {@link ComponentDropInputMode#graph}.
   * @param {IGraph} graph
   * @returns {Point}
   */
  getCenter(graph) {
    let bounds = Rect.EMPTY

    graph.nodes.forEach(node => {
      bounds = Rect.add(bounds, node.layout.toRect())
    })

    return bounds.center
  }

  /**
   * Moves the {@link ComponentDropInputMode#graph} by {@link ComponentDropInputMode#delta}.
   * @param {IGraph} graph
   * @param {Point} delta
   */
  move(graph, delta) {
    graph.nodes.forEach(node => {
      return graph.setNodeLayout(node, node.layout.toRect().getTranslated(delta))
    })
  }

  /**
   * Initializes the information for a drag and drop operation from the component palette and starts the operation.
   * @param {HTMLElement} dragSource
   * @param {IGraph} component
   * @param {DragDropEffects} dragDropEffects
   * @param {boolean} [useCssCursors=true]
   * @param {?HTMLElement} [dragPreview=null]
   * @returns {DragSource}
   */
  static startDrag(
    dragSource,
    component,
    dragDropEffects = DragDropEffects.ALL,
    useCssCursors = true,
    dragPreview = null
  ) {
    const source = new DragSource(dragSource)
    source.startDrag(
      new DragDropItem('component', component),
      dragDropEffects,
      useCssCursors,
      dragPreview
    )
    return source
  }
}
