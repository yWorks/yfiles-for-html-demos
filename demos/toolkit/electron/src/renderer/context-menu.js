/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GraphEditorInputMode,
  ICommand,
  IEdge,
  INode,
  Point,
  PopulateItemContextMenuEventArgs
} from 'yfiles'
import { remote } from 'electron'

// use the menu items by Electron
const { Menu, MenuItem } = remote

/**
 * A simple context menu implementation for the Electron demo. This implementation uses the
 * electron menu items to dynamically build the context menu.
 */
export default class ContextMenu {
  constructor(graphComponent) {
    this.graphComponent = graphComponent
    // An Electron menu instance that is used as context menu in the application
    this.contextMenu = new Menu()
  }

  /**
   * Registers a context menu listener and wires it up with the input mode of the GraphComponent.
   * @param {GraphEditorInputMode} inputMode
   */
  initializeListeners(inputMode) {
    // listen for the contextmenu event
    window.addEventListener(
      'contextmenu',
      e => {
        e.preventDefault()
        if (
          inputMode.contextMenuInputMode.shouldOpenMenu(
            inputMode.graphComponent.toWorldFromPage(new Point(e.pageX, e.pageY))
          )
        ) {
          this.contextMenu.popup({ window: remote.getCurrentWindow() })
        }
      },
      false
    )

    // Add an event listener that populates the context menu according to the hit elements, or cancels showing a menu.
    // This PopulateItemContextMenu is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
    inputMode.addPopulateItemContextMenuListener((sender, args) => this.populateContextMenu(args))

    // Add a listener that closes the menu when the input mode requests this
    inputMode.contextMenuInputMode.addCloseMenuListener(() => {
      this.contextMenu.closePopup()
    })

    // If the context menu closes itself, for example when a menu item was clicked, we must inform the input mode
    this.contextMenu.on('menu-will-close', () => {
      inputMode.contextMenuInputMode.menuClosed()
    })
  }

  /**
   * Populates the context menu based on the item the mouse hovers over
   * @param {PopulateItemContextMenuEventArgs} args The event args.
   */
  populateContextMenu(args) {
    // The 'showMenu' property is set to true to inform the input mode that we actually want to show a context menu
    // for this item (or more generally, the location provided by the event args).
    // If you don't want to show a context menu for some locations, set 'false' in this cases.
    args.showMenu = true

    // start with an empty context menu
    this.contextMenu.clear()

    // In this demo, we use the following custom hit testing to prefer nodes.
    const hits = this.graphComponent.graphModelManager.hitElementsAt(args.queryLocation)

    // Check whether a node was it. If it was, we prefer it over edges
    const hit = hits.find(item => INode.isInstance(item)) || hits.firstOrDefault()

    const graphSelection = this.graphComponent.selection
    if (INode.isInstance(hit)) {
      // if a node or an edge is hit: provide 'Select All Nodes' or 'Select All Edges', respectively
      // and select the hit item
      this.contextMenu.append(
        new MenuItem({
          label: 'Select All Nodes',
          click: () => this.selectAllNodes()
        })
      )
      if (!graphSelection.isSelected(hit)) {
        graphSelection.clear()
      }
      graphSelection.setSelected(hit, true)
    } else if (IEdge.isInstance(hit)) {
      this.contextMenu.append(
        new MenuItem({
          label: 'Select All Edges',
          click: () => this.selectAllEdges()
        })
      )
      if (!graphSelection.isSelected(hit)) {
        graphSelection.clear()
      }
      graphSelection.setSelected(hit, true)
    } else {
      // if another type of item or the empty canvas is hit: provide 'Select All'
      this.contextMenu.append(
        new MenuItem({
          label: 'Select All',
          click: () => ICommand.SELECT_ALL.execute(null, this.graphComponent)
        })
      )
    }

    // if one or more nodes are selected: add options to cut and copy
    if (graphSelection.selectedNodes.size > 0) {
      this.contextMenu.append(
        new MenuItem({
          label: 'Cut',
          click: () => ICommand.CUT.execute(null, this.graphComponent)
        })
      )
      this.contextMenu.append(
        new MenuItem({
          label: 'Copy',
          click: () => ICommand.COPY.execute(null, this.graphComponent)
        })
      )
    }
    if (!this.graphComponent.clipboard.empty) {
      // clipboard is not empty: add option to paste
      this.contextMenu.append(
        new MenuItem({
          label: 'Paste',
          click: () => ICommand.PASTE.execute(null, this.graphComponent)
        })
      )
    }
  }

  /**
   * Helper function to select all edges.
   */
  selectAllEdges() {
    this.graphComponent.selection.clear()
    this.graphComponent.graph.edges.forEach(edge =>
      this.graphComponent.selection.setSelected(edge, true)
    )
  }

  /**
   * Helper function to select all nodes.
   */
  selectAllNodes() {
    this.graphComponent.selection.clear()
    this.graphComponent.graph.nodes.forEach(node =>
      this.graphComponent.selection.setSelected(node, true)
    )
  }
}
