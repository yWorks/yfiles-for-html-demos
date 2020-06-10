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
  GraphEditorInputMode,
  GraphItemTypes,
  IEdge,
  IGraph,
  ItemDropInputMode,
  Point,
  Rect,
  VoidNodeStyle
} from 'yfiles'

/**
 * An edge drop input mode to manage the edge preview and dropping onto the canvas.
 */
export default class EdgeDropInputMode extends ItemDropInputMode {
  constructor() {
    super(IEdge.$class.name)
    this.previewNodeOffset = new Point(20, 10)
    this.previewBendOffset = new Point(0, 10)
  }

  /**
   * @returns {IEdge}
   */
  get draggedItem() {
    return this.dropData
  }

  /**
   * @param {Point} dragLocation - The location to return the drop target for.
   * @returns {IModelItem}
   */
  getDropTarget(dragLocation) {
    const parentMode = this.inputModeContext.parentInputMode
    if (parentMode instanceof GraphEditorInputMode) {
      const hitItems = parentMode.findItems(dragLocation, [
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
    if (this.showPreview && this.draggedItem) {
      // there's no dragged item when using the native drag-and-drop approach
      super.initializePreview()
    }
  }

  /**
   * @param {IGraph} previewGraph - The preview graph to fill.
   */
  populatePreviewGraph(previewGraph) {
    const graph = previewGraph
    graph.nodeDefaults.style = VoidNodeStyle.INSTANCE
    const dummyEdge = graph.createEdge(
      graph.createNode(new Rect(10, 10, 0, 0)),
      graph.createNode(new Rect(50, 30, 0, 0)),
      this.dropData.style
    )
    graph.addBend(dummyEdge, new Point(30, 10))
    graph.addBend(dummyEdge, new Point(30, 30))
  }

  /**
   * @param {IGraph} previewGraph - The preview graph to update.
   * @param {Point} dragLocation - The current drag location.
   */
  updatePreview(previewGraph, dragLocation) {
    previewGraph.setNodeCenter(
      previewGraph.nodes.elementAt(0),
      dragLocation.subtract(this.previewNodeOffset)
    )
    previewGraph.setNodeCenter(
      previewGraph.nodes.elementAt(1),
      dragLocation.add(this.previewNodeOffset)
    )
    const edge = previewGraph.edges.first()
    previewGraph.clearBends(edge)
    previewGraph.addBend(edge, dragLocation.subtract(this.previewBendOffset))
    previewGraph.addBend(edge, dragLocation.add(this.previewBendOffset))
    if (this.inputModeContext.canvasComponent !== null) {
      this.inputModeContext.canvasComponent.invalidate()
    }
  }
}
