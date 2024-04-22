/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  DefaultPortCandidate,
  GraphEditorInputMode,
  GraphItemTypes,
  IEdge,
  IModelItem,
  INode,
  ItemDropInputMode,
  Point,
  Rect,
  VoidNodeStyle
} from 'yfiles'

/**
 * An edge drop input mode to manage the edge preview and dropping onto the canvas.
 *
 * Should be added to a {@link GraphEditorInputMode} using {@link GraphEditorInputMode.add}.
 */
export class EdgeDropInputMode extends ItemDropInputMode {
  previewNodeOffset = new Point(20, 10)
  previewBendOffset = new Point(0, 10)

  constructor() {
    super(IEdge.$class.name)
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!ConcurrencyController} controller
   */
  install(context, controller) {
    super.install(context, controller)
    let originalEdgeDefaultStyle

    this.itemCreator = (ctx, graph, draggedItem, dropTarget, dropLocation) => {
      if (!(draggedItem instanceof IEdge)) {
        return null
      }
      // Use the dropped edge style for changed/created edges.
      const style = draggedItem.style

      if (dropTarget instanceof IEdge) {
        // Set the style of the edge at the drop location to the dropped style.
        graph.setStyle(dropTarget, style)
      } else {
        // Look for a node at the drop location.
        const node = dropTarget instanceof INode ? dropTarget : graph.createNodeAt(dropLocation)
        // Start the creation of an edge from the node at a suitable port candidate
        // for the drop location with the dropped edge style.
        const candidateLocation = graph.nodeDefaults.ports.getLocationParameterInstance(node)
        const candidate = new DefaultPortCandidate(node, candidateLocation)

        const graphEditorInputMode = ctx.canvasComponent.inputMode
        const createEdgeInputMode = graphEditorInputMode.createEdgeInputMode

        // store the previous edge style
        originalEdgeDefaultStyle = createEdgeInputMode.edgeDefaults.style
        // change the edge style only for the one dropped onto the canvas
        createEdgeInputMode.edgeDefaults.style = style
        // change the edge style only for the one dropped onto the canvas
        createEdgeInputMode.dummyEdgeGraph.setStyle(createEdgeInputMode.dummyEdge, style)

        void createEdgeInputMode.doStartEdgeCreation(candidate)
      }
      ctx.canvasComponent.focus()
      return null
    }

    const graphEditorInputMode = context.parentInputMode
    const createEdgeInputMode = graphEditorInputMode.createEdgeInputMode
    const resetEdgeDefaultStyle = () => {
      if (originalEdgeDefaultStyle) {
        createEdgeInputMode.edgeDefaults.style = originalEdgeDefaultStyle
        originalEdgeDefaultStyle = null
      }
    }
    createEdgeInputMode.addGestureFinishedListener(resetEdgeDefaultStyle)
    createEdgeInputMode.addGestureCanceledListener(resetEdgeDefaultStyle)
  }

  /**
   * @type {!IEdge}
   */
  get draggedItem() {
    return this.dropData
  }

  /**
   * @param {!Point} dragLocation The location to return the drop target for.
   * @returns {?IModelItem}
   */
  getDropTarget(dragLocation) {
    if (
      this.inputModeContext &&
      this.inputModeContext.parentInputMode instanceof GraphEditorInputMode
    ) {
      const parentInputMode = this.inputModeContext.parentInputMode
      const hitItems = parentInputMode.findItems(dragLocation, [
        GraphItemTypes.NODE,
        GraphItemTypes.EDGE
      ])
      if (hitItems.size > 0) {
        return hitItems.first()
      }
    }
    return null
  }

  initializePreview() {
    if (!(this.dropData instanceof IModelItem)) {
      // When using the native drag-and-drop approach, the data will
      // be a string and not an IModelItem and we will not populate the preview graph.
      return
    }
    super.initializePreview()
  }

  /**
   * @param {!IGraph} previewGraph The preview graph to fill.
   */
  populatePreviewGraph(previewGraph) {
    const graph = previewGraph
    graph.nodeDefaults.style = VoidNodeStyle.INSTANCE
    const dummyEdge = graph.createEdge(
      graph.createNode(new Rect(10, 10, 0, 0)),
      graph.createNode(new Rect(50, 30, 0, 0)),
      this.draggedItem.style
    )
    graph.addBend(dummyEdge, new Point(30, 10))
    graph.addBend(dummyEdge, new Point(30, 30))
  }

  /**
   * @param {!IGraph} previewGraph The preview graph to update.
   * @param {!Point} dragLocation The current drag location.
   */
  updatePreview(previewGraph, dragLocation) {
    const edge = previewGraph.edges.first()
    previewGraph.setNodeCenter(edge.sourceNode, dragLocation.subtract(this.previewNodeOffset))
    previewGraph.setNodeCenter(edge.targetNode, dragLocation.add(this.previewNodeOffset))

    previewGraph.setBendLocation(edge.bends.at(0), dragLocation.subtract(this.previewBendOffset))
    previewGraph.setBendLocation(edge.bends.at(1), dragLocation.add(this.previewBendOffset))

    this.inputModeContext?.canvasComponent?.invalidate()
  }
}
