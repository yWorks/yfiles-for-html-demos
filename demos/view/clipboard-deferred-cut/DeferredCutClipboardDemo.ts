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
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  EdgePathLabelModel,
  EdgeSides,
  FreeNodePortLocationModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  ICommand,
  IGraph,
  INode,
  License,
  Point,
  Rect,
  Size
} from 'yfiles'

import { setClipboardStyles } from './ClipboardStyles'
import { DeferredCutClipboard } from './DeferredCutClipboard'
import { ContextMenu } from 'demo-utils/ContextMenu'
import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

let graphComponent: GraphComponent

async function run(): Promise<void> {
  License.value = await fetchLicense()

  // add the graph component
  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // set the styles and create a sample graph
  initDemoStyles(graphComponent.graph)
  setClipboardStyles(graphComponent.graph)
  createSampleGraph(graphComponent.graph)
  graphComponent.fitGraphBounds()

  // configure the clipboard itself
  const clipboard = new DeferredCutClipboard()
  // trigger a repaint after copy since copy removed the "marked for cut" mark from the elements
  clipboard.addElementsCopiedListener(sender => graphComponent.invalidate())
  graphComponent.clipboard = clipboard

  // set up the input mode
  const mode = new GraphEditorInputMode()
  mode.marqueeSelectableItems = GraphItemTypes.NODE | GraphItemTypes.BEND
  graphComponent.inputMode = mode
  graphComponent.graph.undoEngineEnabled = true

  // for demonstration purposes we configure a context menu
  // to make it possible to paste to an arbitrary location
  configureContextMenu(graphComponent)
}

/**
 * Creates a sample graph.
 */
function createSampleGraph(graph: IGraph): void {
  graph.nodeDefaults.size = new Size(50, 50)
  const edgeLabelModel = new EdgePathLabelModel({
    autoRotation: true,
    distance: 10,
    sideOfEdge: EdgeSides.LEFT_OF_EDGE | EdgeSides.RIGHT_OF_EDGE
  })
  graph.edgeDefaults.labels.layoutParameter = edgeLabelModel.createDefaultParameter()

  const node1 = graph.createNodeAt(new Point(50, 50))
  const node2 = graph.createNodeAt(new Point(150, 50))
  const node3 = graph.createNode(new Rect(260, 180, 80, 40))
  const edge = graph.createEdge(node2, node3)
  graph.createEdge(node1, node2)
  graph.addBend(edge, new Point(300, 50))

  const port1AtNode1 = graph.addPort(node1, FreeNodePortLocationModel.NODE_CENTER_ANCHORED)
  const port1AtNode3 = graph.addPortAt(node3, new Point(node3.layout.x, node3.layout.center.y))
  const edgeAtPorts = graph.createEdge(port1AtNode1, port1AtNode3)

  graph.addLabel(node1, 'Node 1')
  graph.addLabel(node2, 'Node 2')
  graph.addLabel(node3, 'Node 3')
  graph.addLabel(edgeAtPorts, 'Edge')

  const n4 = graph.createNodeAt(new Point(50, -50))
  graph.addLabel(n4, 'Node 4')
  const n5 = graph.createNodeAt(new Point(50, -150))
  graph.addLabel(n5, 'Node 5')
  const n6 = graph.createNodeAt(new Point(-50, -50))
  graph.addLabel(n6, 'Node 6')
  const n7 = graph.createNodeAt(new Point(-50, -150))
  graph.addLabel(n7, 'Node 7')
  const n8 = graph.createNodeAt(new Point(150, -50))
  graph.addLabel(n8, 'Node 8')

  graph.createEdge(n4, node1)
  graph.createEdge(n5, n4)
  graph.createEdge(n7, n6)
  const e6_1 = graph.createEdge(n6, node1)
  graph.addBend(e6_1, new Point(-50, 50), 0)
}

/**
 * Configures a context menu.
 * This is to provide the ability to paste graph elements to an arbitrary location.
 * Developers who want to know more about using context menus should look at the
 * contextmenu demo in the input folder.
 */
function configureContextMenu(graphComponent: GraphComponent): void {
  const inputMode = graphComponent.inputMode as GraphEditorInputMode

  const contextMenu = new ContextMenu(graphComponent)
  contextMenu.addOpeningEventListeners(graphComponent, location => {
    if (inputMode.contextMenuInputMode.shouldOpenMenu(graphComponent.toWorldFromPage(location))) {
      contextMenu.show(location)
    }
  })
  inputMode.addPopulateItemContextMenuListener((sender, args) => {
    args.showMenu = true
    contextMenu.clearItems()

    if (args.item instanceof INode) {
      if (!graphComponent.selection.selectedNodes.isSelected(args.item)) {
        graphComponent.selection.clear()
        graphComponent.selection.selectedNodes.setSelected(args.item, true)
      }
    } else {
      graphComponent.selection.clear()
    }
    if (graphComponent.selection.selectedNodes.size > 0) {
      contextMenu.addMenuItem('Cut', () => ICommand.CUT.execute(null, graphComponent))
      contextMenu.addMenuItem('Copy', () => ICommand.COPY.execute(null, graphComponent))
      contextMenu.addMenuItem('Delete', () => ICommand.DELETE.execute(null, graphComponent))
    } else {
      contextMenu.addMenuItem('Paste', () =>
        ICommand.PASTE.execute(args.queryLocation, graphComponent)
      )
    }
  })
  inputMode.contextMenuInputMode.addCloseMenuListener(() => {
    contextMenu.close()
  })
  contextMenu.onClosedCallback = () => {
    inputMode.contextMenuInputMode.menuClosed()
  }
}

run().then(finishLoading)
