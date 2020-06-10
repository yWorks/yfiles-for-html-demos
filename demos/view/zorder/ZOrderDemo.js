/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  DefaultFolderNodeConverter,
  FoldingManager,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphMLSupport,
  ICommand,
  IGraph,
  INode,
  License,
  NodeAlignmentPolicy,
  Point,
  Rect,
  Size,
  StorageLocation
} from 'yfiles'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'
import {
  ZIndexChangedEventArgs,
  ZOrderGraphEditorInputMode,
  ZOrderGraphMLIOHandler,
  ZOrderSupport
} from './ZOrderSupport.js'
import DemoStyles, {
  DemoSerializationListener,
  initDemoStyles
} from '../../resources/demo-styles.js'

/** @type {GraphComponent} */
let graphComponent = null

/** @type {ZOrderSupport} */
let zOrderSupport = null

/**
 * Bootstraps the demo.
 * @param {object} licenseData
 */
function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('#graphComponent')

  // initialize the graph
  initializeGraph()

  // initialize consistent z-order support
  zOrderSupport = new ZOrderSupport(graphComponent)

  enableGroupingOperations()

  // use a custom GraphMLIOHandler that supports writing and parsing node z-orders to/from GraphML
  const ioHandler = new ZOrderGraphMLIOHandler(zOrderSupport)
  ioHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
    DemoStyles
  )
  ioHandler.addHandleSerializationListener(DemoSerializationListener)

  // eslint-disable-next-line no-new
  new GraphMLSupport({
    graphComponent: graphComponent,
    storageLocation: StorageLocation.FILE_SYSTEM,
    graphMLIOHandler: ioHandler
  })

  const inputMode = graphComponent.inputMode
  inputMode.focusableItems = GraphItemTypes.NONE
  // prevent interactive label changes since they display the z-index in this demo
  inputMode.selectableItems = GraphItemTypes.NODE | GraphItemTypes.EDGE
  inputMode.allowEditLabel = false
  inputMode.allowAddLabel = false
  inputMode.allowEditLabelOnDoubleClick = false

  inputMode.addNodeCreatedListener((sender, evt) => {
    const node = evt.item
    updateLabel(node, zOrderSupport.getZOrder(node))
  })

  zOrderSupport.addZIndexChangedLister((sender, evt) => {
    if (evt.item instanceof INode) {
      updateLabel(evt.item, evt.newZIndex)
    }
  })

  createGraph(graphComponent.graph)

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Initializes folding and sets default styles.
 */
function initializeGraph() {
  // Enable folding
  const view = new FoldingManager().createFoldingView()
  graphComponent.graph = view.graph

  // Get the master graph instance and enable undo-ability support.
  view.manager.masterGraph.undoEngineEnabled = true
  // add undo support for expand/collapse operations
  view.enqueueNavigationalUndoUnits = true

  // set default demo styles
  initDemoStyles(graphComponent.graph)

  graphComponent.graph.nodeDefaults.size = new Size(70, 40)

  const folderNodeConverter = graphComponent.graph.foldingView.manager.folderNodeConverter
  folderNodeConverter.copyFirstLabel = true
}

/**
 * @param {IGraph} graph
 */
function createGraph(graph) {
  const g1 = graph.createGroupNode(null, new Rect(350, 300, 250, 150))
  const n1 = graph.createNodeAt(new Point(400, 400))
  const n2 = graph.createNodeAt(new Point(460, 380))
  const n3 = graph.createNodeAt(new Point(520, 360))
  graph.setParent(n1, g1)
  graph.setParent(n2, g1)
  graph.setParent(n3, g1)

  const g2 = graph.createGroupNode(null, new Rect(500, 150, 250, 200))
  const n4 = graph.createNodeAt(new Point(560, 200))
  const n5 = graph.createNodeAt(new Point(590, 230))
  const n6 = graph.createNodeAt(new Point(620, 260))
  graph.setParent(n4, g2)
  graph.setParent(n5, g2)
  graph.setParent(n6, g2)

  const g3 = graph.createGroupNode(null, new Rect(650, 225, 350, 300))
  const n7 = graph.createNodeAt(new Point(700, 280))
  const n8 = graph.createNodeAt(new Point(760, 300))
  graph.setParent(n7, g3)
  graph.setParent(n8, g3)

  const g4 = graph.createGroupNode(g3, new Rect(775, 310, 170, 190))

  const n9 = graph.createNodeAt(new Point(830, 375))
  const n10 = graph.createNodeAt(new Point(880, 405))
  const n11 = graph.createNodeAt(new Point(840, 440))
  graph.setParent(n9, g4)
  graph.setParent(n10, g4)
  graph.setParent(n11, g4)

  // normalize all z orders starting from 0
  zOrderSupport.setTempNormalizedZOrders(null)
  zOrderSupport.applyTempZOrders()

  graphComponent.fitGraphBounds()
}

/**
 * Updates the label text to show the current z-index of the node.
 * @param {INode} node
 * @param {number} zIndex
 */
function updateLabel(node, zIndex) {
  const graph = graphComponent.graph.contains(node)
    ? graphComponent.graph
    : graphComponent.graph.foldingView.manager.masterGraph

  if (node.labels.some(label => label.tag.showZIndex)) {
    graph.setLabelText(
      node.labels.find(label => label.tag.showZIndex),
      `Level: ${zIndex}`
    )
  } else {
    graph.addLabel({
      owner: node,
      text: `Level: ${zIndex}`,
      tag: { showZIndex: true }
    })
  }
}

/**
 * Enables interactive grouping operations.
 */
function enableGroupingOperations() {
  const inputMode = graphComponent.inputMode
  if (inputMode) {
    inputMode.allowGroupingOperations = true
    inputMode.navigationInputMode.autoGroupNodeAlignmentPolicy = NodeAlignmentPolicy.TOP_RIGHT
  }
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function registerCommands() {
  bindAction("button[data-command='New']", () => {
    graphComponent.graph.clear()
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  })
  bindCommand("button[data-command='Open']", ICommand.OPEN, graphComponent)
  bindCommand("button[data-command='Save']", ICommand.SAVE, graphComponent)
  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
  bindCommand("button[data-command='GroupSelection']", ICommand.GROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='UngroupSelection']", ICommand.UNGROUP_SELECTION, graphComponent)

  bindCommand("button[data-command='Raise']", ZOrderGraphEditorInputMode.RAISE, graphComponent)
  bindCommand("button[data-command='Lower']", ZOrderGraphEditorInputMode.LOWER, graphComponent)
  bindCommand("button[data-command='ToFront']", ZOrderGraphEditorInputMode.TO_FRONT, graphComponent)
  bindCommand("button[data-command='ToBack']", ZOrderGraphEditorInputMode.TO_BACK, graphComponent)
}

// start tutorial
loadJson().then(run)
