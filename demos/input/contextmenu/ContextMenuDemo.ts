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
import {
  GraphComponent,
  GraphEditorInputMode,
  IGraph,
  IModelItem,
  INode,
  License,
  Point,
  PopulateItemContextMenuEventArgs
} from '@yfiles/yfiles'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import iconCopy from '@yfiles/demo-resources/icons/copy-16.svg'
import iconCut from '@yfiles/demo-resources/icons/cut2-16.svg'
import iconDelete from '@yfiles/demo-resources/icons/delete3-16.svg'
import iconPaste from '@yfiles/demo-resources/icons/paste-16.svg'

async function run(): Promise<void> {
  License.value = await fetchLicense()
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
}

/**
 * Initializes the context menu.
 * @param graphComponent The graph component to which the context menu belongs
 */
function configureContextMenu(graphComponent: GraphComponent): void {
  const inputMode = graphComponent.inputMode as GraphEditorInputMode

  // Add an event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  inputMode.addEventListener('populate-item-context-menu', (evt) =>
    populateContextMenu(graphComponent, evt)
  )
}

/**
 * Populates the context menu based on the item the mouse hovers over.
 * @param graphComponent The given graphComponent
 * @param args The event args.
 */
function populateContextMenu(
  graphComponent: GraphComponent,
  args: PopulateItemContextMenuEventArgs<IModelItem>
): void {
  if (args.handled) {
    return
  }

  const node = args.item instanceof INode ? args.item : null
  // If the cursor is over a node select it
  updateSelection(graphComponent, node)

  const inputMode = graphComponent.inputMode as GraphEditorInputMode
  // Create the context menu items
  if (graphComponent.selection.nodes.size > 0) {
    args.contextMenu = [
      { label: 'Cut', action: () => inputMode.cut(), icon: `url("${iconCut}")` },
      { label: 'Copy', action: () => inputMode.copy(), icon: `url("${iconCopy}")` },
      { label: 'Delete', action: () => inputMode.deleteSelection(), icon: `url("${iconDelete}")` }
    ]
  } else {
    // no node has been hit
    args.contextMenu = [
      { label: 'Select all', action: () => inputMode.selectAll() },
      {
        label: 'Paste',
        action: () => inputMode.pasteAtLocation(args.queryLocation),
        icon: `url("${iconPaste}")`,
        disabled: graphComponent.clipboard.isEmpty
      }
    ]
  }
}

/**
 * Helper function that updates the node selection state when the context menu is opened on a node.
 * @param graphComponent The given graphComponent
 * @param node The node or `null`.
 */
function updateSelection(graphComponent: GraphComponent, node: INode | null): void {
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

/**
 * Creates a sample graph.
 * @param graph The input graph
 */
function createSampleGraph(graph: IGraph): void {
  graph.addLabel(graph.createNodeAt(new Point(80, 100)), '1')
  graph.addLabel(graph.createNodeAt(new Point(200, 100)), '2')
  graph.addLabel(graph.createNodeAt(new Point(320, 100)), '3')
}

run().then(finishLoading)
