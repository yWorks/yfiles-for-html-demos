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
  EdgeDirectionPolicy,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphSnapContext,
  INode,
  NodeDropInputMode,
  SimpleNode
} from '@yfiles/yfiles'
import { getNodeHighlightInfo } from './NodeHighlightInfo'
import { configureTwoPointerPanning } from '@yfiles/demo-utils/configure-two-pointer-panning'
import { runLayout } from './logicgates-layout'
/**
 * Creates the input mode to highlight source and target ports on hover and configures
 * drag and drop behavior.
 */
export function createInputMode(graphComponent) {
  const mode = new GraphEditorInputMode({
    // enable snapping for easier orthogonal edge editing
    snapContext: new GraphSnapContext(),
    // don't allow nodes to be created using a mouse click
    allowCreateNode: false,
    // disable node resizing
    showHandleItems: GraphItemTypes.ALL & ~GraphItemTypes.NODE,
    // don't allow moving unselected items
    moveUnselectedItemsInputMode: { enabled: false }
  })
  // allow reversed edge creation depending on what kind of port the drag starts
  mode.createEdgeInputMode.edgeDirectionPolicy = EdgeDirectionPolicy.DETERMINE_FROM_PORT_CANDIDATES
  // allow edge creation by dragging from anywhere on a node instead of only from port candidates
  mode.createEdgeInputMode.startOverCandidateOnly = false
  mode.createEdgeInputMode.priority = 45
  mode.moveSelectedItemsInputMode.priority = 40
  // layout the graph on edge creation if auto-layout is checked
  const autoLayout = document.querySelector('#auto-layout-checkbox')
  mode.createEdgeInputMode.addEventListener('edge-created', () => {
    if (autoLayout.checked) {
      // wait for next frame to make sure the gesture has completely finished
      setTimeout(() => {
        void runLayout(graphComponent, false, false)
      }, 0)
    }
  })
  mode.addEventListener('edge-ports-changed', () => {
    if (autoLayout.checked) {
      // wait for next frame to make sure the gesture has completely finished
      setTimeout(() => {
        void runLayout(graphComponent, false, false)
      }, 0)
    }
  })
  // we want to get reports of the mouse being hovered over nodes and edges
  // first enable queries
  mode.itemHoverInputMode.enabled = true
  // set the items to be reported
  mode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE
  // whenever the currently hovered item changes call our method
  mode.itemHoverInputMode.addEventListener('hovered-item-changed', ({ item, oldItem }) => {
    if (oldItem instanceof INode) {
      const highlightInfo = getNodeHighlightInfo(oldItem)
      highlightInfo.sourceHighlight = false
      highlightInfo.targetHighlight = false
    }
    if (item instanceof INode) {
      const highlightInfo = getNodeHighlightInfo(item)
      highlightInfo.sourceHighlight = true
      highlightInfo.targetHighlight = true
    }
    graphComponent.invalidate()
  })
  configureNodeDropInputMode(mode)
  graphComponent.inputMode = mode
  // use two finger panning to allow easier editing with touch gestures
  configureTwoPointerPanning(graphComponent)
}
/**
 * Creates a new node drop input mode and configure the drop be
 */
function configureNodeDropInputMode(mode) {
  // create a new NodeDropInputMode to configure the drag and drop operation
  mode.nodeDropInputMode = new NodeDropInputMode({
    // enables the display of the dragged element during the drag
    showPreview: true,
    // by default the mode available in GraphEditorInputMode is disabled, so first enable it
    enabled: true
  })
  const originalNodeCreator = mode.nodeDropInputMode.itemCreator
  mode.nodeDropInputMode.itemCreator = (context, graph, draggedNode, dropTarget, point) => {
    if (draggedNode instanceof INode) {
      const modelItem = new SimpleNode({ style: draggedNode.style, layout: draggedNode.layout })
      const newNode = originalNodeCreator(context, graph, modelItem, dropTarget, point)
      // copy the ports
      for (const port of draggedNode.ports) {
        graph.addPort(newNode, port.locationParameter, port.style, port.tag)
      }
      return newNode
    }
    // fallback
    return originalNodeCreator(context, graph, draggedNode, dropTarget, point)
  }
}
