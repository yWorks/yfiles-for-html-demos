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
  EventRecognizers,
  GraphComponent,
  GraphEditorInputMode,
  GraphInputMode,
  GraphItemTypes,
  ICommand,
  IModelItem
} from 'yfiles'

/**
 * Disables the selection of multiple graph items using mouse/keyboard gestures.
 * Only one item may be selected at a time.
 * @param {!GraphComponent} graphComponent
 */
export function useSingleSelection(graphComponent) {
  const mode = graphComponent.inputMode

  // disable marquee selection
  mode.marqueeSelectionInputMode.enabled = false

  // disable multi selection with Ctrl-Click
  mode.multiSelectionRecognizer = EventRecognizers.NEVER

  // deactivate commands that can lead to multi selection
  mode.availableCommands.remove(ICommand.TOGGLE_ITEM_SELECTION)
  mode.availableCommands.remove(ICommand.SELECT_ALL)

  // deactivate commands that can extend the selection
  mode.navigationInputMode.availableCommands.remove(ICommand.EXTEND_SELECTION_LEFT)
  mode.navigationInputMode.availableCommands.remove(ICommand.EXTEND_SELECTION_UP)
  mode.navigationInputMode.availableCommands.remove(ICommand.EXTEND_SELECTION_DOWN)
  mode.navigationInputMode.availableCommands.remove(ICommand.EXTEND_SELECTION_RIGHT)

  // add custom binding for toggle item selection
  mode.keyboardInputMode.addCommandBinding(
    ICommand.TOGGLE_ITEM_SELECTION,
    (command, parameter) => toggleItemSelectionExecuted(graphComponent, parameter),
    (command, parameter) => toggleItemSelectionCanExecute(graphComponent, parameter)
  )
}

/**
 * Determines whether toggling the selection state of an item,
 * respecting the single selection policy, is allowed.
 * @param {!GraphComponent} graphComponent
 * @param {*} parameter
 * @returns {boolean}
 */
function toggleItemSelectionCanExecute(graphComponent, parameter) {
  const modelItem = parameter instanceof IModelItem ? parameter : graphComponent.currentItem
  return !!modelItem
}

/**
 * Custom command handler that allows toggling the selection state of an item
 * respecting the single selection policy.
 * @param {!GraphComponent} graphComponent
 * @param {*} parameter
 * @returns {boolean}
 */
function toggleItemSelectionExecuted(graphComponent, parameter) {
  // get the item
  const modelItem = parameter instanceof IModelItem ? parameter : graphComponent.currentItem
  const inputMode = graphComponent.inputMode

  // check if it allowed to be selected
  if (
    !modelItem ||
    !graphComponent.graph.contains(modelItem) ||
    !GraphItemTypes.itemIsOfTypes(inputMode.selectableItems, modelItem) ||
    !inputMode.graphSelection
  ) {
    return false
  }

  const isSelected = inputMode.graphSelection.isSelected(modelItem)
  if (isSelected) {
    // the item is selected and needs to be unselected - just clear the selection
    inputMode.graphSelection.clear()
  } else {
    // the item is unselected - unselect all other items and select the currentItem
    inputMode.graphSelection.clear()
    inputMode.setSelected(modelItem, true)
  }
  return true
}
