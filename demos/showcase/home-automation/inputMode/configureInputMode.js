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
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  INode,
  ItemHoverInputMode
} from 'yfiles'
import { FlowMoveInputMode } from './FlowMoveInputMode.js'
import { FlowCreateEdgeInputMode } from './FlowCreateEdgeInputMode.js'
import { configureCreateEdgeInputMode } from '../FlowEdge/FlowEdge.js'

/**
 * @param {!GraphComponent} gc
 */
export function configureInputMode(gc) {
  // Highlight any nodes/edges being hovered, and bring them
  // to the top of their respective group (particularly important for edges).
  const itemHoverInputMode = new ItemHoverInputMode({
    enabled: true,
    hoverItems: GraphItemTypes.NODE | GraphItemTypes.EDGE
  })
  itemHoverInputMode.addHoveredItemChangedListener(({ inputModeContext }, { item }) => {
    const gc = inputModeContext?.canvasComponent
    if (!(gc instanceof GraphComponent)) {
      return
    }
    gc.highlightIndicatorManager.clearHighlights()
    if (item) {
      gc.highlightIndicatorManager.addHighlight(item)
      gc.graphModelManager.toFront(item)
    }
  })

  gc.selection.addItemSelectionChangedListener((_sender, { item, itemSelected }) => {
    if (itemSelected && item instanceof INode) {
      const connectedEdges = gc.graph.edgesAt(item)
      gc.graphModelManager.toFront(connectedEdges)
    }
  })

  // Custom CreateEdgeInputMode for overwriting onMoved method
  const createEdgeInputMode = new FlowCreateEdgeInputMode()
  configureCreateEdgeInputMode(createEdgeInputMode)

  // Custom MoveInputMode for overwriting onDragging method
  const moveInputMode = new FlowMoveInputMode()
  const moveUnselectedInputMode = new FlowMoveInputMode()

  const inputMode = new GraphEditorInputMode({
    allowCreateNode: false,
    allowEditLabel: false,
    allowReverseEdge: false,
    showHandleItems: GraphItemTypes.EDGE,
    movableItems: GraphItemTypes.NODE,
    selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    marqueeSelectableItems: GraphItemTypes.NODE,
    clickHitTestOrder: [GraphItemTypes.NODE, GraphItemTypes.EDGE, GraphItemTypes.PORT],
    moveInputMode,
    moveUnselectedInputMode,
    createEdgeInputMode,
    itemHoverInputMode
  })

  inputMode.moveUnselectedInputMode.enabled = true
  // Increase priority over handleInputMode to not block edge creation by dragging from ports
  inputMode.moveUnselectedInputMode.priority = inputMode.handleInputMode.priority + 1
  inputMode.moveInputMode.priority = inputMode.handleInputMode.priority + 1

  inputMode.marqueeSelectionInputMode.enabled = true
  inputMode.marqueeSelectionInputMode.priority = inputMode.moveUnselectedInputMode.priority + 1

  gc.inputMode = inputMode
}
