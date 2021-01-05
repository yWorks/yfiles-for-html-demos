/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GraphItemTypes,
  ICommand,
  IModelItem
} from 'yfiles'

/**
 * <p>
 * Enables single selection mode for interaction.
 * </p>
 * <p>
 * All default gestures that result in more than one item selected at a time are either switched off or changed so only one item gets selected.
 * </p>
 * @public
 * @class
 */
export class SingleSelectionSupport {
  /**
   * Changes the selection mode.
   */
  enable(graphComponent: GraphComponent): void {
    const mode = graphComponent.inputMode as GraphEditorInputMode

    // disable marquee selection
    mode.marqueeSelectionInputMode.enabled = false
    // disable multi selection with Ctrl-Click
    mode.multiSelectionRecognizer = EventRecognizers.NEVER

    // deactivate commands that can lead to multi selection
    mode.availableCommands.remove(ICommand.TOGGLE_ITEM_SELECTION)
    mode.availableCommands.remove(ICommand.SELECT_ALL)

    mode.navigationInputMode.availableCommands.remove(ICommand.EXTEND_SELECTION_LEFT)
    mode.navigationInputMode.availableCommands.remove(ICommand.EXTEND_SELECTION_UP)
    mode.navigationInputMode.availableCommands.remove(ICommand.EXTEND_SELECTION_DOWN)
    mode.navigationInputMode.availableCommands.remove(ICommand.EXTEND_SELECTION_RIGHT)

    // add dummy command bindings that do nothing in order to prevent default behavior
    mode.keyboardInputMode.addCommandBinding(ICommand.EXTEND_SELECTION_LEFT)
    mode.keyboardInputMode.addCommandBinding(ICommand.EXTEND_SELECTION_UP)
    mode.keyboardInputMode.addCommandBinding(ICommand.EXTEND_SELECTION_DOWN)
    mode.keyboardInputMode.addCommandBinding(ICommand.EXTEND_SELECTION_RIGHT)

    // add custom binding for toggle item selection
    mode.keyboardInputMode.addCommandBinding(
      ICommand.TOGGLE_ITEM_SELECTION,
      (command, parameter, source) => this.toggleItemSelectionExecuted(graphComponent, parameter),
      (command, parameter, source) => this.toggleItemSelectionCanExecute(graphComponent, parameter)
    )
    // Also clear the selection - even though the setup works when more than one item is selected, it looks a bit
    // strange
    graphComponent.selection.clear()
  }

  /**
   * Checks if toggling the selection state of an item respecting the single selection policy is allowed
   * @param {GraphComponent} graphComponent The given graphComponent
   * @param {Object} parameter The given parameter
   */
  toggleItemSelectionCanExecute(graphComponent: GraphComponent, parameter: any): boolean {
    // if we have an item, the command can be executed
    const modelItem = IModelItem.isInstance(parameter) ? parameter : graphComponent.currentItem
    return modelItem !== null
  }

  /**
   * Custom command handler that allows toggling the selection state of an item
   * respecting the single selection policy.
   * @param {GraphComponent} graphComponent The given graphComponent
   * @param {Object} parameter The given parameter
   */
  toggleItemSelectionExecuted(graphComponent: GraphComponent, parameter: any): boolean {
    // get the item
    const modelItem = IModelItem.isInstance(parameter) ? parameter : graphComponent.currentItem
    const inputMode = graphComponent.inputMode as GraphEditorInputMode

    // check if it allowed to be selected
    if (
      modelItem === null ||
      !graphComponent.graph.contains(modelItem) ||
      !GraphItemTypes.itemIsOfTypes(inputMode.selectableItems, modelItem)
    ) {
      return false
    }

    const isSelected = inputMode.graphSelection!.isSelected(modelItem)
    if (isSelected) {
      // the item is selected and needs to be unselected - just clear the selection
      inputMode.graphSelection!.clear()
    } else {
      // the items is unselected - unselect all other items and select the currentItem
      inputMode.graphSelection!.clear()
      inputMode.setSelected(modelItem, true)
    }
    return true
  }
}
