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
import { INode } from '@yfiles/yfiles'
/**
 * Configure the context menu for this demo.
 */
export function configureContextMenu(graphComponent, setAsRootNode) {
  const inputMode = graphComponent.inputMode
  // Add a listener that populates the context menu for the hit elements or cancels showing a menu.
  // This PopulateItemContextMenu event is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
  inputMode.addEventListener('populate-item-context-menu', (evt) => {
    const item = evt.item
    if (!item || item instanceof INode) {
      populateContextMenu(graphComponent, setAsRootNode, evt, item ?? undefined)
    }
  })
}
/**
 * Populates the context menu based on the item for which the menu was opened.
 */
function populateContextMenu(graphComponent, setAsRootNode, evt, node) {
  // select the node
  updateSelection(graphComponent, node)
  // create the context menu items
  if (node && !graphComponent.graph.isGroupNode(node)) {
    evt.contextMenu = [
      { label: 'Set as root node', action: () => setAsRootNode(graphComponent, node) }
    ]
  } else {
    // no normal node has been hit
    evt.contextMenu = [{ label: 'Clear root node', action: () => setAsRootNode(graphComponent) }]
  }
}
/**
 * Updates the node selection state when the context menu is opened for a node.
 */
function updateSelection(graphComponent, node) {
  if (!node) {
    // clear the selection
    graphComponent.selection.clear()
  } else if (!graphComponent.selection.nodes.includes(node)) {
    // clear the selection
    graphComponent.selection.clear()
    // and select the node
    graphComponent.selection.nodes.add(node)
    // also update the current item
    graphComponent.currentItem = node
  }
}
