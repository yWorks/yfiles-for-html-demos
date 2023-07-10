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
  type GraphComponent,
  type GraphEditorInputMode,
  IEdge,
  type IGraphSelection,
  type IModelItem,
  INode,
  type PopulateItemContextMenuEventArgs
} from 'yfiles'
import { ContextMenu } from 'demo-utils/ContextMenu'
import { getCurrentAlgorithm } from './ui-utils'
import { copyAndReplaceTag, getTag } from '../demo-types'
import { applyAlgorithm } from '../algorithms/algorithms'

/**
 * Initializes the context menu.
 */
export function initializeContextMenu(
  inputMode: GraphEditorInputMode,
  graphComponent: GraphComponent
): void {
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

  // Add an event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  // This PopulateItemContextMenu is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
  inputMode.addPopulateItemContextMenuListener((sender, args) =>
    populateContextMenu(graphComponent, contextMenu, args)
  )

  // Add a listener that closes the menu when the input mode requests this
  inputMode.contextMenuInputMode.addCloseMenuListener(() => {
    contextMenu.close()
  })

  // If the context menu closes itself, for example, because a menu item was clicked, we must inform the input mode
  contextMenu.onClosedCallback = (): void => {
    inputMode.contextMenuInputMode.menuClosed()
  }
}

/**
 * Populates the context menu based on the item the mouse hovers over.
 */
function populateContextMenu(
  graphComponent: GraphComponent,
  contextMenu: ContextMenu,
  args: PopulateItemContextMenuEventArgs<IModelItem>
): void {
  updateSelection(graphComponent.selection, args.item)

  const currentAlgorithm = getCurrentAlgorithm()

  const needsStartNodes = currentAlgorithm.needsStartNodes ?? false
  const needsEndNodes = currentAlgorithm.needsEndNodes ?? false
  if (!needsStartNodes && !needsEndNodes) {
    return
  }

  // get the item which is located at the mouse position
  const hits = graphComponent.graphModelManager.hitElementsAt(args.queryLocation).toArray()
  // use the first hit node
  const hitNode: IModelItem | undefined = hits.find(hit => hit instanceof INode)
  const selection = graphComponent.selection
  if (hitNode) {
    selection.setSelected(hitNode, true)
  }

  const selectedNodes = selection.selectedNodes
  if (selectedNodes.size === 0) {
    return
  }

  contextMenu.clearItems()

  if (needsStartNodes) {
    contextMenu.addMenuItem('Mark as Start Node', () => {
      // clear previous start nodes
      graphComponent.graph.nodes.forEach(node => {
        if (getTag(node).type === 'start') {
          const tag = copyAndReplaceTag(node)
          delete tag.type
        }
      })

      if (!needsEndNodes) {
        // just mark one node
        const tag = copyAndReplaceTag(hitNode || selectedNodes.first())
        tag.type = 'start'
      } else {
        selectedNodes.forEach(node => {
          const tag = copyAndReplaceTag(node)
          tag.type = 'start'
        })
      }

      applyAlgorithm(graphComponent.graph)
      selectedNodes.clear()
    })
  }
  if (needsEndNodes) {
    contextMenu.addMenuItem('Mark as End Node', () => {
      graphComponent.graph.nodes.forEach(node => {
        // clear previous end nodes
        if (getTag(node).type === 'end') {
          const tag = copyAndReplaceTag(node)
          delete tag.type
        }
      })

      selectedNodes.forEach(node => {
        const tag = copyAndReplaceTag(node)
        tag.type = 'end'
      })
      applyAlgorithm(graphComponent.graph)
    })
  }

  // finally, if the context menu has at least one entry, set the showMenu flag
  if (contextMenu.element.childElementCount > 0) {
    args.showMenu = true
  }
}

/**
 * Updates the selection when an item is right-clicked for a context menu.
 */
function updateSelection(selection: IGraphSelection, item: IModelItem | null): void {
  if (!item) {
    selection.clear()
  } else if (!selection.isSelected(item)) {
    selection.clear()
    selection.setSelected(item, true)
  } else {
    if (IEdge.isInstance(item)) {
      selection.selectedNodes.clear()
    } else {
      selection.selectedEdges.clear()
    }
    selection.setSelected(item, true)
  }
}
