/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ICommand,
  IGraph,
  INode,
  License,
  Point,
  PopulateItemContextMenuEventArgs
} from 'yfiles'
import ContextMenu from '../../utils/ContextMenu.js'
import { showApp } from '../../resources/demo-app.js'
import { initDemoStyles } from '../../resources/demo-styles.js'
import loadJson from '../../resources/load-json.js'

function run(licenseData) {
  License.value = licenseData
  // initialize the GraphComponent
  const graphComponent = new GraphComponent('graphComponent')

  // initialize the demo styles
  initDemoStyles(graphComponent.graph)

  // create a default editor input mode
  graphComponent.inputMode = new GraphEditorInputMode()

  // initialize the context menu
  configureContextMenu(graphComponent)

  // create the sample graph
  createSampleGraph(graphComponent.graph)

  graphComponent.fitGraphBounds()

  showApp(graphComponent)
}

/**
 * Initializes the context menu.
 * @param {GraphComponent} graphComponent The graph component to which the context menu belongs
 */
function configureContextMenu(graphComponent) {
  const inputMode = graphComponent.inputMode

  // Create a context menu. In this demo, we use our sample context menu implementation but you can use any other
  // context menu widget as well. See the Context Menu demo for more details about working with context menus.
  const contextMenu = new ContextMenu(graphComponent)

  // Add event listeners to the various events that open the context menu. These listeners then
  // call the provided callback function which in turn asks the current ContextMenuInputMode if a
  // context menu should be shown at the current location.
  contextMenu.addOpeningEventListeners(graphComponent, location => {
    if (inputMode.contextMenuInputMode.shouldOpenMenu(graphComponent.toWorldFromPage(location))) {
      contextMenu.show(location)
    }
  })

  // Add and event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  // This PopulateItemContextMenu is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
  inputMode.addPopulateItemContextMenuListener((sender, args) =>
    populateContextMenu(contextMenu, graphComponent, args)
  )

  // Add a listener that closes the menu when the input mode requests this
  inputMode.contextMenuInputMode.addCloseMenuListener(() => {
    contextMenu.close()
  })

  // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
  contextMenu.onClosedCallback = () => {
    inputMode.contextMenuInputMode.menuClosed()
  }
}

/**
 * Populates the context menu based on the item the mouse hovers over.
 *
 * @param {GraphComponent} graphComponent The given graphComponent
 * @param {ContextMenu} contextMenu The context menu.
 * @param {PopulateItemContextMenuEventArgs} args The event args.
 */
function populateContextMenu(contextMenu, graphComponent, args) {
  // The 'showMenu' property is set to true to inform the input mode that we actually want to show a context menu
  // for this item (or more generally, the location provided by the event args).
  // If you don't want to show a context menu for some locations, set 'false' in this cases.
  args.showMenu = true

  contextMenu.clearItems()

  const node = INode.isInstance(args.item) ? args.item : null
  // If the cursor is over a node select it
  updateSelection(graphComponent, node)

  // Create the context menu items
  if (graphComponent.selection.selectedNodes.size > 0) {
    contextMenu.addMenuItem('Cut', () => ICommand.CUT.execute(null, graphComponent))
    contextMenu.addMenuItem('Copy', () => ICommand.COPY.execute(null, graphComponent))
    contextMenu.addMenuItem('Delete', () => ICommand.DELETE.execute(null, graphComponent))
  } else {
    // no node has been hit
    contextMenu.addMenuItem('Select all', () => ICommand.SELECT_ALL.execute(null, graphComponent))
    contextMenu.addMenuItem('Paste', () =>
      ICommand.PASTE.execute(args.queryLocation, graphComponent)
    )
  }
}

/**
 * Helper function that updates the node selection state when the context menu is opened on a node.
 * @param {GraphComponent} graphComponent The given graphComponent
 * @param {INode} node The node or <code>null</code>.
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

/**
 * Creates a sample graph.
 * @param {IGraph} graph The input graph
 */
function createSampleGraph(graph) {
  graph.addLabel(graph.createNodeAt(new Point(80, 100)), '1')
  graph.addLabel(graph.createNodeAt(new Point(200, 100)), '2')
  graph.addLabel(graph.createNodeAt(new Point(320, 100)), '3')
}

// Runs the demo
loadJson().then(run)
