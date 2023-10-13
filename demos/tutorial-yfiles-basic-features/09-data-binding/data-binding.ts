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
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  IModelItem,
  INode,
  ItemEventArgs,
  Point,
  PopulateItemContextMenuEventArgs,
  QueryItemToolTipEventArgs,
  Rect
} from 'yfiles'
import { ContextMenu } from 'demo-utils/ContextMenu'

/**
 * Sets up simple data binding by storing the creation date in the node tag.
 */
export function enableDataBinding(
  graphComponent: GraphComponent,
  graphEditorInputMode: GraphEditorInputMode
): void {
  const graph = graphComponent.graph

  // typically you specify the tag of an item at creation time:
  // Store the current time as node creation time
  graph.createNode({ layout: new Rect(0, 80, 30, 30), tag: new Date() })

  // In this example we subscribe to the low-level node creation event to record the node creation time.
  graph.addNodeCreatedListener((_, evt): void => {
    // Store the current time as node creation time
    const node = evt.item
    // if there is no tag associated with the node, already, add one
    if (node.tag === null) {
      node.tag = new Date()
    }
  })

  graphEditorInputMode.addNodeCreatedListener((_, evt): void => {
    // Store the current time as node creation time
    const node = evt.item
    node.tag = new Date()
  })
}

/**
 * Setup tooltips that return the value that is stored in the mapper.
 * Dynamic tooltips are implemented by adding a tooltip provider as an event handler for
 * the {@link MouseHoverInputMode.addQueryToolTipListener QueryToolTip} event of the
 * GraphEditorInputMode using the
 * {@link ToolTipQueryEventArgs} parameter.
 * The {@link ToolTipQueryEventArgs} parameter provides three relevant properties:
 * Handled, QueryLocation, and ToolTip. The Handled property is a flag which indicates
 * whether the tooltip was already set by one of possibly several tooltip providers. The
 * QueryLocation property contains the mouse position for the query in world coordinates.
 * The tooltip is set by setting the ToolTip property.
 */
export function setupTooltips(
  graphEditorInputMode: GraphEditorInputMode
): void {
  graphEditorInputMode.toolTipItems = GraphItemTypes.NODE
  graphEditorInputMode.addQueryItemToolTipListener((_, evt): void => {
    if (evt.handled) {
      // Tooltip content has already been assigned -> nothing to do
      return
    }
    const item = evt.item
    if (item instanceof INode) {
      const node = item
      // Set the tooltip content
      evt.toolTip = node.tag ? node.tag.toLocaleString() : 'Not set'

      // Indicate that the tooltip content has been set
      evt.handled = true
    }
  })

  // Add a little offset to the tooltip such that it is not obscured by the mouse pointer.
  graphEditorInputMode.mouseHoverInputMode.toolTipLocationOffset = new Point(
    20,
    20
  )
}

/**
 * Adds a context menu for nodes.
 */
export function setupContextMenu(
  graphComponent: GraphComponent,
  graphEditorInputMode: GraphEditorInputMode
): void {
  graphEditorInputMode.contextMenuItems = GraphItemTypes.NODE

  // In this demo, we use our sample context menu implementation but you can use any other context menu widget as
  // well. See the Context Menu demo for more details about working with context menus
  const contextMenu = new ContextMenu(graphComponent)

  // Add event listeners to the various events that open the context menu. These listeners then
  // call the provided callback function which in turn asks the current ContextMenuInputMode if a
  // context menu should be shown at the current location.
  contextMenu.addOpeningEventListeners(
    graphComponent,
    (location: Point): void => {
      const worldLocation = graphComponent.toWorldFromPage(location)

      // Inform the input mode that a context menu should be opened.
      // Eventually, this will fire the events GraphEditorInputMode.PopulateItemContextMenu and
      // ContextMenuInputMode.PopulateMenu
      const showMenu =
        graphEditorInputMode.contextMenuInputMode.shouldOpenMenu(worldLocation)

      // Check whether showing the context menu is permitted and if so show the menu
      if (showMenu) {
        contextMenu.show(location)
      }
    }
  )

  // Add item-specific menu entries
  graphEditorInputMode.addPopulateItemContextMenuListener((_, evt): void => {
    contextMenu.clearItems()
    if (INode.isInstance(evt.item)) {
      // The 'showMenu' property is set to true to inform the input mode that we actually want to show a context menu
      // for this item (or more generally, the location provided by the event args).
      // If you don't want to show a context menu for some locations, set 'false' in this cases.
      evt.showMenu = true

      contextMenu.addMenuItem('Set to now', (): void => {
        const node = evt.item as INode
        node.tag = new Date()
      })
    }
  })

  // Add a listener that closes the menu when the input mode requests this
  graphEditorInputMode.contextMenuInputMode.addCloseMenuListener((): void => {
    contextMenu.close()
  })

  // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
  contextMenu.onClosedCallback = (): void => {
    graphEditorInputMode.contextMenuInputMode.menuClosed()
  }
}
