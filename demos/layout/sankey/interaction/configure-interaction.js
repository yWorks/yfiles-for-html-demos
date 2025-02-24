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
import { EventRecognizers, GraphEditorInputMode, GraphItemTypes, IEdge } from '@yfiles/yfiles'
import { runLayout, updateStylesAndLayout } from '../sankey-layout'
import { getThickness, updateEdgeThickness } from '../edge-thickness'
/**
 * Precompiled Regex matcher used to allow only labels with positive numbers as text.
 */
const validationPattern = new RegExp('^(0*[1-9][0-9]*(\\.[0-9]+)?|0+\\.[0-9]*[1-9][0-9]*)$')
/**
 * Initializes and customizes the input mode for this demo.
 * Various options must be set to custom values to ensure desired behaviour.
 */
export function configureInteraction(graphComponent) {
  const mode = new GraphEditorInputMode({
    selectableItems: GraphItemTypes.LABEL,
    deletableItems: GraphItemTypes.NONE,
    focusableItems: GraphItemTypes.NONE,
    movableSelectedItems: GraphItemTypes.NODE,
    clickableItems: GraphItemTypes.NODE | GraphItemTypes.LABEL,
    contextMenuItems: GraphItemTypes.NODE,
    allowCreateEdge: false,
    allowCreateNode: false,
    allowAddLabel: false
  })
  // validate the label text before the label is added so that only positive numbers are allowed as text
  const editLabelInputMode = mode.editLabelInputMode
  editLabelInputMode.addEventListener('validate-label-text', (evt) => {
    if (evt.label.owner instanceof IEdge) {
      evt.validatedText = validationPattern.test(evt.newText) ? evt.newText : null
    }
  })
  editLabelInputMode.addEventListener('label-edited', async (evt) => {
    const label = evt.item
    if (label.owner instanceof IEdge) {
      // calculate the new thickness from the label text and update the edge's data
      updateEdgeThickness(label.owner, getThickness(label.text), graphComponent)
      // update the edge style and the layout
      await updateStylesAndLayout(graphComponent, true)
    }
  })
  editLabelInputMode.autoRemoveEmptyLabels = false
  allowMovingUnselectedNodes(mode, graphComponent)
  graphComponent.inputMode = mode
}
/**
 * Allows the movement of nodes even if they are not selected.
 */
function allowMovingUnselectedNodes(mode, graphComponent) {
  mode.moveSelectedItemsInputMode.enabled = false
  mode.moveUnselectedItemsInputMode.addEventListener('drag-finished', async () => {
    await runLayout(graphComponent, true)
  })
  mode.marqueeSelectionInputMode.enabled = false
  mode.moveViewportInputMode.beginRecognizer = EventRecognizers.MOUSE_DOWN
}
