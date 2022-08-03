/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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

import { bindCommand, showApp } from '../../resources/demo-app.js'
import { setClipboardStyles } from './ClipboardStyles.js'
import { DeferredCutClipboard } from './DeferredCutClipboard.js'
import ContextMenu from '../../utils/ContextMenu.js'
import { applyDemoTheme, initDemoStyles } from '../../resources/demo-styles.js'
import { fetchLicense } from '../../resources/fetch-license.js'

/** @type {GraphComponent} */
let graphComponent

/**
 * @returns {!Promise}
 */
async function run() {
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

  // bind the demo buttons to their commands
  registerCommands()

  // Initialize the demo application's CSS and Javascript for the description
  showApp(graphComponent)
}

/**
 * Creates a sample graph.
 * @param {!IGraph} graph
 */
function createSampleGraph(graph) {
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
  const edge1 = graph.createEdge(node1, node2)
  const edge2 = graph.createEdge(node2, node3)
  const bend1 = graph.addBend(edge2, new Point(300, 50))

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
 * @param {!GraphComponent} graphComponent
 */
function configureContextMenu(graphComponent) {
  const inputMode = graphComponent.inputMode

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

function registerCommands() {
  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)

  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
}

// noinspection JSIgnoredPromiseFromCall
run()
