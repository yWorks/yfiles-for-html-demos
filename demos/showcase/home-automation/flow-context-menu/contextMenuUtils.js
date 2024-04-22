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
  GraphComponent,
  ICommand,
  IModelItem,
  INode,
  PopulateItemContextMenuEventArgs
} from 'yfiles'
import { runAutoLayout } from '../utils/customTriggers.js'
import { FlowContextMenu } from './FlowContextMenu.js'
import CutIcon from 'demo-resources/icons/cut2-16.svg'
import PasteIcon from 'demo-resources/icons/paste-16.svg'
import CopyIcon from 'demo-resources/icons/copy-16.svg'
import DeleteIcon from 'demo-resources/icons/delete3-16.svg'
import RedoIcon from 'demo-resources/icons/redo-16.svg'
import UndoIcon from 'demo-resources/icons/undo-16.svg'
import FitContentIcon from 'demo-resources/icons/fit-16.svg'
import LayoutIcon from 'demo-resources/icons/play2-16.svg'

/**
 * Populates the context menu based on the item that was clicked.
 * @param {!FlowContextMenu} contextMenu
 * @param {!GraphComponent} graphComponent
 * @param {!PopulateItemContextMenuEventArgs.<IModelItem>} args
 */
export function populateContextMenu(contextMenu, graphComponent, args) {
  // The 'showMenu' property is set to true to inform the input mode that we actually want to show a context menu
  // for this item (or more generally, the location provided by the event args).
  // If you don't want to show a context menu for some locations, set 'false' in these cases.
  args.showMenu = true

  contextMenu.clearItems()

  const node = args.item
  // If the cursor is over a node select it
  updateSelection(graphComponent, node)

  // Create the context menu items
  if (graphComponent.selection.selectedNodes.size > 0) {
    contextMenu.addMenuItem(
      'Delete Node',
      () => ICommand.DELETE.execute(null, graphComponent),
      !ICommand.DELETE.canExecute(null, graphComponent),
      DeleteIcon
    )
    contextMenu.addSeparator()
    contextMenu.addMenuItem(
      'Copy',
      () => ICommand.COPY.execute(null, graphComponent),
      !ICommand.COPY.canExecute(null, graphComponent),
      CopyIcon
    )
    contextMenu.addMenuItem(
      'Paste',
      () => ICommand.PASTE.execute(args.queryLocation, graphComponent),
      !ICommand.PASTE.canExecute(args.queryLocation, graphComponent),
      PasteIcon
    )
    contextMenu.addMenuItem(
      'Cut',
      () => ICommand.CUT.execute(null, graphComponent),
      !ICommand.CUT.canExecute(null, graphComponent),
      CutIcon
    )
  } else {
    // no node has been hit
    contextMenu.addMenuItem(
      'Paste',
      () => ICommand.PASTE.execute(args.queryLocation, graphComponent),
      !ICommand.PASTE.canExecute(args.queryLocation, graphComponent),
      PasteIcon
    )
  }

  contextMenu.addSeparator()
  contextMenu.addMenuItem(
    'Undo',
    () => ICommand.UNDO.execute(null, graphComponent),
    !ICommand.UNDO.canExecute(null, graphComponent),
    UndoIcon
  )
  contextMenu.addMenuItem(
    'Redo',
    () => ICommand.REDO.execute(null, graphComponent),
    !ICommand.REDO.canExecute(null, graphComponent),
    RedoIcon
  )
  contextMenu.addSeparator()
  contextMenu.addMenuItem(
    'Fit Content',
    () => ICommand.FIT_CONTENT.execute(null, graphComponent),
    !ICommand.FIT_CONTENT.canExecute(null, graphComponent),
    FitContentIcon
  )
  contextMenu.addMenuItem('Auto Layout', () => runAutoLayout(graphComponent), undefined, LayoutIcon)
}

/**
 * Updates the selection of the given node.
 * @param {!GraphComponent} graphComponent
 * @param {?INode} node
 */
function updateSelection(graphComponent, node) {
  if (node === null) {
    // clear the whole selection
    graphComponent.selection.clear()
  } else if (!graphComponent.selection.selectedNodes.isSelected(node)) {
    // no - clear the remaining selection
    graphComponent.selection.clear()
    // and select the node
    graphComponent.selection.selectedNodes.setSelected(node, true)
    // also update the current item
    graphComponent.currentItem = node
  }
}
