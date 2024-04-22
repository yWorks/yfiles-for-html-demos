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
  type GraphComponent,
  type GraphInputMode,
  type IModelItem,
  INode,
  type PopulateItemContextMenuEventArgs
} from 'yfiles'
import { ContextMenu } from 'demo-utils/ContextMenu'
import type { CollapsibleTree } from '../CollapsibleTree'

/**
 * Initializes the context menu.
 */
export function configureContextMenu(
  graphComponent: GraphComponent,
  orgChartGraph: CollapsibleTree
): void {
  const inputMode = graphComponent.inputMode as GraphInputMode

  // Create a context menu. In this demo, we use our sample context menu implementation, but you can use any other
  // context menu widget as well. See the Context Menu demo for more details about working with context menus.
  const contextMenu = new ContextMenu(graphComponent)

  // Add event listeners to the various events that open the context menu. These listeners then
  // call the provided callback-function which in turn asks the current ContextMenuInputMode if a
  // context menu should be shown at the current location.
  contextMenu.addOpeningEventListeners(graphComponent, (location) => {
    if (inputMode.contextMenuInputMode.shouldOpenMenu(graphComponent.toWorldFromPage(location))) {
      contextMenu.show(location)
    }
  })

  // Add an event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  // This PopulateItemContextMenu is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
  inputMode.addPopulateItemContextMenuListener((_, evt) => {
    populateContextMenu(graphComponent, orgChartGraph, contextMenu, evt)
  })

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
  orgChartGraph: CollapsibleTree,
  contextMenu: ContextMenu,
  args: PopulateItemContextMenuEventArgs<IModelItem>
): void {
  // The 'showMenu' property is set to true to inform the input mode that we actually want to show a context menu
  // for this item (or more generally, the location provided by the event args).
  // If you don't want to show a context menu for some locations, set 'false' in these cases.
  args.showMenu = true

  contextMenu.clearItems()

  const node = args.item

  // if we clicked on a node
  if (node instanceof INode) {
    graphComponent.currentItem = node
    // Create the context menu items
    if (orgChartGraph.canExecuteHideParent(node)) {
      contextMenu.addMenuItem('Hide Parent', () => orgChartGraph.executeHideParent(node))
    }
    if (orgChartGraph.canExecuteShowParent(node)) {
      contextMenu.addMenuItem('Show Parent', () => orgChartGraph.executeShowParent(node))
    }

    if (orgChartGraph.canExecuteHideChildren(node)) {
      contextMenu.addMenuItem('Hide Children', () => orgChartGraph.executeHideChildren(node))
    }
    if (orgChartGraph.canExecuteShowChildren(node)) {
      contextMenu.addMenuItem('Show Children', () => orgChartGraph.executeShowChildren(node))
    }

    if (orgChartGraph.canExecuteShowAll()) {
      contextMenu.addMenuItem('Show all', () => orgChartGraph.executeShowAll())
    }
  } else {
    // no node has been hit
    if (orgChartGraph.canExecuteShowAll())
      contextMenu.addMenuItem('Show all', () => orgChartGraph.executeShowAll())
  }
}
