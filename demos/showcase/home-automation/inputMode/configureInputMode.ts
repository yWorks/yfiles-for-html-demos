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
  type GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  INode,
  ItemHoverInputMode
} from '@yfiles/yfiles'
import { FlowMoveInputMode } from './FlowMoveInputMode'
import { FlowCreateEdgeInputMode } from './FlowCreateEdgeInputMode'
import { configureCreateEdgeInputMode } from '../FlowEdge/FlowEdge'

export function configureInputMode(gc: GraphComponent): void {
  // Highlight any nodes/edges being hovered, and bring them
  // to the top of their respective group (particularly important for edges).
  const itemHoverInputMode = new ItemHoverInputMode({
    enabled: true,
    hoverItems: GraphItemTypes.NODE | GraphItemTypes.EDGE
  })
  itemHoverInputMode.addEventListener('hovered-item-changed', ({ item }) => {
    const highlights = gc.highlights
    highlights.clear()
    if (item) {
      highlights.add(item)
      gc.graphModelManager.toFront(item)
    }
  })

  gc.selection.addEventListener('item-added', ({ item }) => {
    if (item instanceof INode) {
      const connectedEdges = gc.graph.edgesAt(item)
      gc.graphModelManager.toFront(connectedEdges)
    }
  })

  // Custom CreateEdgeInputMode for overwriting onMoved method
  const createEdgeInputMode = new FlowCreateEdgeInputMode()
  configureCreateEdgeInputMode(gc, createEdgeInputMode)

  // Custom MoveInputMode for overwriting onDragging method
  const moveSelectedItemsInputMode = new FlowMoveInputMode()
  const moveUnselectedItemsInputMode = new FlowMoveInputMode()

  const inputMode = new GraphEditorInputMode({
    allowCreateNode: false,
    allowEditLabel: false,
    allowReverseEdge: false,
    showHandleItems: GraphItemTypes.EDGE,
    movableSelectedItems: GraphItemTypes.NODE,
    selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    marqueeSelectableItems: GraphItemTypes.NODE,
    clickHitTestOrder: [GraphItemTypes.NODE, GraphItemTypes.EDGE, GraphItemTypes.PORT],
    moveSelectedItemsInputMode,
    moveUnselectedItemsInputMode,
    createEdgeInputMode,
    itemHoverInputMode
  })

  // Increase priority over handleInputMode to not block edge creation by dragging from ports
  inputMode.moveUnselectedItemsInputMode.priority = inputMode.handleInputMode.priority + 1
  inputMode.moveSelectedItemsInputMode.priority = inputMode.handleInputMode.priority + 1

  inputMode.marqueeSelectionInputMode.enabled = true
  inputMode.marqueeSelectionInputMode.priority = inputMode.moveUnselectedItemsInputMode.priority + 1

  gc.inputMode = inputMode
}
