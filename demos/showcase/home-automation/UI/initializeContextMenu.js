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
import { GraphItemTypes, INode } from '@yfiles/yfiles'
import DeleteIcon from '../../../demo-app/icons/delete3-16.svg'
import CopyIcon from '../../../demo-app/icons/copy-16.svg'
import PasteIcon from '../../../demo-app/icons/paste-16.svg'
import CutIcon from '../../../demo-app/icons/cut2-16.svg'
import UndoIcon from '../../../demo-app/icons/undo-16.svg'
import RedoIcon from '../../../demo-app/icons/redo-16.svg'
import FitContentIcon from '../../../demo-app/icons/fit-16.svg'
import { runAutoLayout } from '../utils/customTriggers'
import LayoutIcon from '../../../demo-app/icons/play2-16.svg'

export function initializeContextMenu(graphComponent) {
  const graphEditorInputMode = graphComponent.inputMode

  // handle context menus only for nodes
  graphEditorInputMode.contextMenuItems = GraphItemTypes.NODE

  // Add an event listener that populates the context menu according to the hit elements,
  // or cancels showing a menu.
  graphEditorInputMode.addEventListener('populate-item-context-menu', (args) =>
    populateContextMenu(graphComponent, args)
  )
}

function populateContextMenu(graphComponent, evt) {
  const item = evt.item
  // Only show the context menu on nodes and the empty canvas.
  if (item === null || item instanceof INode) {
    updateSelection(graphComponent, item)
    evt.contextMenu = getMenuComponent(graphComponent, item, evt.queryLocation)
  }
  return
}

function getMenuComponent(graphComponent, node, queryLocation) {
  const menuDiv = document.createElement('div')
  menuDiv.classList.add('flow-context-menu')

  const contextMenuInputMode = graphComponent.inputMode.contextMenuInputMode

  const inputMode = graphComponent.inputMode
  if (graphComponent.selection.nodes.size > 0) {
    menuDiv.appendChild(
      createMenuItem(
        contextMenuInputMode,
        'Delete Node',
        () => graphComponent.graph.remove(node),
        false,
        DeleteIcon
      )
    )

    menuDiv.appendChild(createSeparator())
    menuDiv.appendChild(
      createMenuItem(contextMenuInputMode, 'Copy', () => inputMode.copy(), false, CopyIcon)
    )
    menuDiv.appendChild(
      createMenuItem(
        contextMenuInputMode,
        'Paste',
        () => inputMode.pasteAtLocation(queryLocation),
        graphComponent.clipboard.isEmpty,
        PasteIcon
      )
    )
    menuDiv.appendChild(
      createMenuItem(contextMenuInputMode, 'Cut', () => inputMode.cut(), false, CutIcon)
    )
  } else {
    // no node has been hit
    menuDiv.appendChild(
      createMenuItem(
        contextMenuInputMode,
        'Paste',
        () => inputMode.pasteAtLocation(queryLocation),
        graphComponent.clipboard.isEmpty,
        PasteIcon
      )
    )
  }

  menuDiv.appendChild(createSeparator())
  const undoEngine = graphComponent.graph.undoEngine
  menuDiv.appendChild(
    createMenuItem(
      contextMenuInputMode,
      'Undo',
      () => undoEngine?.undo(),
      !undoEngine?.canUndo(),
      UndoIcon
    )
  )
  menuDiv.appendChild(
    createMenuItem(
      contextMenuInputMode,
      'Redo',
      () => undoEngine?.redo(),
      !undoEngine?.canRedo(),
      RedoIcon
    )
  )
  menuDiv.appendChild(createSeparator())
  menuDiv.appendChild(
    createMenuItem(
      contextMenuInputMode,
      'Fit Content',
      () => graphComponent.fitContent(),
      false,
      FitContentIcon
    )
  )
  menuDiv.appendChild(
    createMenuItem(
      contextMenuInputMode,
      'Auto Layout',
      () => runAutoLayout(graphComponent),
      undefined,
      LayoutIcon
    )
  )

  return menuDiv
}

function createSeparator() {
  const separator = document.createElement('div')
  separator.setAttribute('class', 'flow-context-menu__separator')
  return separator
}

function createMenuItem(contextMenuInputMode, label, clickListener, disabled, icon) {
  const menuButton = document.createElement('button')
  menuButton.classList.add('flow-context-menu__item')
  if (disabled) {
    menuButton.classList.add('flow-context-menu__item-disabled')
  }

  if (clickListener !== null) {
    menuButton.addEventListener(
      'click',
      (e) => {
        clickListener(e)
        contextMenuInputMode.closeMenu()
      },
      false
    )
  }

  const iconItem = document.createElement('div')
  iconItem.classList.add('flow-context-menu__item-icon')
  if (icon) {
    iconItem.style.backgroundImage = `url("${icon}")`
  }
  menuButton.appendChild(iconItem)

  const buttonText = document.createElement('span')
  buttonText.innerHTML = label
  menuButton.appendChild(buttonText)

  return menuButton
}

/**
 * Updates the selection of the given node.
 */
function updateSelection(graphComponent, node) {
  if (node === null) {
    // clear the whole selection
    graphComponent.selection.clear()
  } else if (!graphComponent.selection.nodes.includes(node)) {
    // no - clear the remaining selection
    graphComponent.selection.clear()
    // and select the node
    graphComponent.selection.nodes.add(node)
    // also update the current item
    graphComponent.currentItem = node
  }
}
