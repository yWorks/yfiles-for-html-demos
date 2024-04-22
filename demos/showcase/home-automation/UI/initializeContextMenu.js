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
import { GraphComponent, GraphEditorInputMode, GraphItemTypes } from 'yfiles'
import { populateContextMenu } from '../flow-context-menu/contextMenuUtils.js'
import { FlowContextMenu } from '../flow-context-menu/FlowContextMenu.js'

/**
 * @param {!GraphComponent} graphComponent
 */
export function initializeContextMenu(graphComponent) {
  const graphEditorInputMode = graphComponent.inputMode

  // This code example uses mostly the sample implementation from the Context Menu demo,
  // copied as FlowContextMenu mostly to customize items population,
  // but you can use any other context menu widget as well.
  // See the Context Menu demo for more details about working with context menus.
  const contextMenu = new FlowContextMenu(graphComponent)

  // handle context menus only for nodes
  graphEditorInputMode.contextMenuItems = GraphItemTypes.NODE

  // Add an event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  // This PopulateItemContextMenu is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
  graphEditorInputMode.addPopulateItemContextMenuListener((_, args) =>
    populateContextMenu(contextMenu, graphComponent, args)
  )

  // Register event listeners for the various "contextmenu" events of the application.
  contextMenu.addOpeningEventListeners(graphComponent, (location) => {
    // On "contextmenu" event, inform the input mode and check if the context menu may open now.
    if (
      graphEditorInputMode.contextMenuInputMode.shouldOpenMenu(
        graphComponent.toWorldFromPage(location)
      )
    ) {
      // Display the UI elements of the context menu at the given location.
      contextMenu.show(location)
    }
  })

  // Add a listener that closes the menu when the input mode requests it.
  graphEditorInputMode.contextMenuInputMode.addCloseMenuListener(() => {
    contextMenu.close()
  })

  // If the context menu closes itself, for example because a menu item was clicked,
  // we must inform the input mode to keep everything in sync.
  contextMenu.onClosedCallback = () => {
    graphEditorInputMode.contextMenuInputMode.menuClosed()
  }
}
