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
import { ContextMenu } from 'demo-utils/ContextMenu'
import { INode } from 'yfiles'

/**
 * Configure the context menu for this demo.
 * @param {!GraphComponent} graphComponent
 * @param {!function} setAsRootNode
 */
export function configureContextMenu(graphComponent, setAsRootNode) {
  const inputMode = graphComponent.inputMode

  // Create a context menu. In this demo, we use our sample context menu implementation, but you can use any other
  // context menu widget as well. See the Context Menu demo for more details about working with context menus.
  const contextMenu = new ContextMenu(graphComponent)

  // Add event listeners to the various events that open the context menu. These listeners then
  // call the provided callback-function which in turn asks the current ContextMenuInputMode if a
  // context menu should be shown at the current location.
  contextMenu.addOpeningEventListeners(graphComponent, location => {
    if (inputMode.contextMenuInputMode.shouldOpenMenu(graphComponent.toWorldFromPage(location))) {
      contextMenu.show(location)
    }
  })

  // Add a listener that populates the context menu for the hit elements or cancels showing a menu.
  // This PopulateItemContextMenu event is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
  inputMode.addPopulateItemContextMenuListener((_, evt) => {
    const item = evt.item
    if (!item || item instanceof INode) {
      populateContextMenu(contextMenu, graphComponent, setAsRootNode, item ?? undefined)
      evt.showMenu = true
    }
  })

  // Add a listener that closes the menu when the input mode requests this
  inputMode.contextMenuInputMode.addCloseMenuListener(() => contextMenu.close())

  // If the context menu closes itself, for example, because a menu item was clicked, notify the input mode
  contextMenu.onClosedCallback = () => inputMode.contextMenuInputMode.menuClosed()
}

/**
 * Populates the context menu based on the item for which the menu was opened.
 * @param {!ContextMenu} contextMenu
 * @param {!GraphComponent} graphComponent
 * @param {!function} setAsRootNode
 * @param {!INode} [node]
 */
function populateContextMenu(contextMenu, graphComponent, setAsRootNode, node) {
  // select the node
  updateSelection(graphComponent, node)

  contextMenu.clearItems()

  // create the context menu items
  if (node && !graphComponent.graph.isGroupNode(node)) {
    contextMenu.addMenuItem('Set as root node', () => setAsRootNode(graphComponent, node))
  } else {
    // no normal node has been hit
    contextMenu.addMenuItem('Clear root node', () => setAsRootNode(graphComponent, undefined))
  }
}

/**
 * Updates the node selection state when the context menu is opened for a node.
 * @param {!GraphComponent} graphComponent
 * @param {!INode} [node]
 */
function updateSelection(graphComponent, node) {
  if (!node) {
    // clear the selection
    graphComponent.selection.clear()
  } else if (!graphComponent.selection.selectedNodes.isSelected(node)) {
    // clear the selection
    graphComponent.selection.clear()
    // and select the node
    graphComponent.selection.selectedNodes.setSelected(node, true)
    // also update the current item
    graphComponent.currentItem = node
  }
}
