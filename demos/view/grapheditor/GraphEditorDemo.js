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
  FoldingManager,
  FreeNodeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLSupport,
  GraphOverviewComponent,
  GraphSnapContext,
  ICommand,
  IEdge,
  IGraph,
  IModelItem,
  INode,
  LabelSnapContext,
  License,
  NodeAlignmentPolicy,
  OrthogonalEdgeEditingContext,
  PopulateItemContextMenuEventArgs,
  Rect,
  RenderModes,
  SmartEdgeLabelModel,
  StorageLocation
} from 'yfiles'

import { ContextMenu } from '../../utils/ContextMenu.js'
import {
  bindAction,
  bindCommand,
  configureTwoPointerPanning,
  showApp
} from '../../resources/demo-app.js'
import { DemoStyleOverviewPaintable, initDemoStyles } from '../../resources/demo-styles.js'
import { fetchLicense } from '../../resources/fetch-license.js'
import { BrowserDetection } from '../../utils/BrowserDetection.js'

/** @type {GraphComponent} */
let graphComponent

/** @type {GraphOverviewComponent} */
let overviewComponent

/**
 * Runs the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  // Initialize the GraphComponent and GraphOverviewComponent
  graphComponent = new GraphComponent('graphComponent')
  overviewComponent = new GraphOverviewComponent('overviewComponent')
  overviewComponent.graphComponent = graphComponent

  // Configure and enable folding
  const foldingManager = new FoldingManager()
  const foldingView = foldingManager.createFoldingView()
  foldingView.enqueueNavigationalUndoUnits = true
  const graph = foldingView.graph
  graphComponent.graph = graph

  // Styling for the overviewComponent
  overviewComponent.graphVisualCreator = new DemoStyleOverviewPaintable(graph)

  // Setup the default styles for the graph
  setDefaultStyles(graph)

  // Enable GraphML support
  enableGraphML(graphComponent)

  // Specify a configured input mode that enables graph editing
  graphComponent.inputMode = createEditorMode()

  // use two finger panning to allow easier editing with touch gestures
  configureTwoPointerPanning(graphComponent)

  // Create a sample graph
  createSampleGraph(graph)
  graphComponent.fitGraphBounds()

  // Enable the undo engine on the master graph
  foldingManager.masterGraph.undoEngineEnabled = true

  // Register commands for the buttons in this demo
  registerCommands(graphComponent)

  showApp(graphComponent, overviewComponent)
}

/**
 * Creates the editor input mode for this demo.
 * @returns {!GraphEditorInputMode}
 */
function createEditorMode() {
  const mode = new GraphEditorInputMode({
    snapContext: createGraphSnapContext(),
    labelSnapContext: createLabelSnapContext(),
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext({
      enabled: false
    }),
    allowGroupingOperations: true
  })

  // Fix the top left location of a group node when toggling collapse/expand
  mode.navigationInputMode.autoGroupNodeAlignmentPolicy = NodeAlignmentPolicy.TOP_RIGHT

  // Make bend creation more important than moving of selected edges.
  // As a result, dragging a selected edge (not its bends) will create a new bend instead of moving all bends.
  // This is especially nicer in conjunction with orthogonal edge editing because this would create additional bends
  // every time the edge is moved otherwise
  mode.createBendInputMode.priority = mode.moveInputMode.priority - 1

  // use WebGL rendering for handles if possible, otherwise the handles are rendered using SVG
  if (BrowserDetection.webGL) {
    mode.handleInputMode.renderMode = RenderModes.WEB_GL
  }

  // Create a context menu. In this demo, we use our sample context menu implementation but you can use any other
  // context menu widget as well. See the Context Menu demo for more details about working with context menus.
  const contextMenu = new ContextMenu(graphComponent)

  // Add event listeners to the various events that open the context menu. These listeners then
  // call the provided callback function which in turn asks the current ContextMenuInputMode if a
  // context menu should be shown at the current location.
  contextMenu.addOpeningEventListeners(graphComponent, location => {
    if (mode.contextMenuInputMode.shouldOpenMenu(graphComponent.toWorldFromPage(location))) {
      contextMenu.show(location)
    }
  })

  // Add an event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  // This PopulateItemContextMenu is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
  mode.addPopulateItemContextMenuListener((sender, args) => populateContextMenu(contextMenu, args))

  // Add a listener that closes the menu when the input mode requests this
  mode.contextMenuInputMode.addCloseMenuListener(() => {
    contextMenu.close()
  })

  // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
  contextMenu.onClosedCallback = () => {
    mode.contextMenuInputMode.menuClosed()
  }

  return mode
}

/**
 * Creates a configured {@link GraphSnapContext} for this demo.
 * @returns {!GraphSnapContext}
 */
function createGraphSnapContext() {
  return new GraphSnapContext({
    enabled: false
  })
}

/**
 * Creates a configured {@link LabelSnapContext} for this demo.
 * @returns {!LabelSnapContext}
 */
function createLabelSnapContext() {
  return new LabelSnapContext({
    enabled: false,
    snapDistance: 15,
    snapLineExtension: 100
  })
}

/**
 * Enables loading and saving the graph to GraphML.
 * @param {!GraphComponent} graphComponent
 */
function enableGraphML(graphComponent) {
  new GraphMLSupport({
    graphComponent,
    storageLocation: StorageLocation.FILE_SYSTEM
  })
}

/**
 * Sets default styles to the graph.
 * @param {!IGraph} graph The graph
 */
function setDefaultStyles(graph) {
  // Assign the default demo styles
  initDemoStyles(graph, { foldingEnabled: true })

  // Set the default node label position to centered below the node with the FreeNodeLabelModel that supports label
  // snapping
  graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.INSTANCE.createParameter(
    [0.5, 1.0],
    [0, 10],
    [0.5, 0.0],
    [0, 0],
    0
  )

  // Set the default edge label position with the SmartEdgeLabelModel that supports label snapping
  graph.edgeDefaults.labels.layoutParameter = new SmartEdgeLabelModel().createParameterFromSource(
    0,
    0,
    0.5
  )
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the demo's toolbar.
 * @param {!GraphComponent} graphComponent
 */
function registerCommands(graphComponent) {
  bindAction("button[data-command='New']", () => {
    graphComponent.graph.clear()
    graphComponent.fitGraphBounds()
  })
  bindCommand("button[data-command='Open']", ICommand.OPEN, graphComponent, null)
  bindCommand("button[data-command='Save']", ICommand.SAVE, graphComponent, null)

  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent, null)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent, null)

  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent, null)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent, null)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent, null)
  bindCommand("button[data-command='Delete']", ICommand.DELETE, graphComponent, null)

  bindCommand(
    "button[data-command='GroupSelection']",
    ICommand.GROUP_SELECTION,
    graphComponent,
    null
  )
  bindCommand(
    "button[data-command='UngroupSelection']",
    ICommand.UNGROUP_SELECTION,
    graphComponent,
    null
  )
  bindCommand("button[data-command='EnterGroup']", ICommand.ENTER_GROUP, graphComponent, null)
  bindCommand("button[data-command='ExitGroup']", ICommand.EXIT_GROUP, graphComponent, null)

  const geim = graphComponent.inputMode
  bindAction('#demo-snapping-button', () => {
    geim.snapContext.enabled = document.querySelector('#demo-snapping-button').checked
    geim.labelSnapContext.enabled = document.querySelector('#demo-snapping-button').checked
  })
  bindAction('#demo-orthogonal-editing-button', () => {
    geim.orthogonalEdgeEditingContext.enabled = document.querySelector(
      '#demo-orthogonal-editing-button'
    ).checked
  })
}

function selectAllEdges() {
  graphComponent.selection.clear()
  graphComponent.graph.edges.forEach(edge => graphComponent.selection.setSelected(edge, true))
}

function selectAllNodes() {
  graphComponent.selection.clear()
  graphComponent.graph.nodes.forEach(node => graphComponent.selection.setSelected(node, true))
}

/**
 * Populates the context menu based on the item the mouse hovers over
 * @param {!ContextMenu} contextMenu The context menu.
 * @param {!PopulateItemContextMenuEventArgs.<IModelItem>} args The event args.
 */
function populateContextMenu(contextMenu, args) {
  // The 'showMenu' property is set to true to inform the input mode that we actually want to show a context menu
  // for this item (or more generally, the location provided by the event args).
  // If you don't want to show a context menu for some locations, set 'false' in this cases.
  args.showMenu = true

  contextMenu.clearItems()

  // In this demo, we use the following custom hit testing to prefer nodes.
  const hits = graphComponent.graphModelManager.hitElementsAt(args.queryLocation)

  // Check whether a node was it. If it was, we prefer it over edges
  const hit = hits.find(item => INode.isInstance(item)) || hits.at(0)

  const graphSelection = graphComponent.selection
  if (INode.isInstance(hit)) {
    // if a node or an edge is hit: provide 'Select All Nodes' or 'Select All Edges', respectively
    // and select the hit item
    contextMenu.addMenuItem('Select All Nodes', selectAllNodes)
    if (!graphSelection.isSelected(hit)) {
      graphSelection.clear()
    }
    graphSelection.setSelected(hit, true)
  } else if (IEdge.isInstance(hit)) {
    contextMenu.addMenuItem('Select All Edges', selectAllEdges)
    if (!graphSelection.isSelected(hit)) {
      graphSelection.clear()
    }
    graphSelection.setSelected(hit, true)
  } else {
    // if another type of item or the empty canvas is hit: provide 'Select All'
    contextMenu.addMenuItem('Select All', () => {
      ICommand.SELECT_ALL.execute(null, graphComponent)
    })
  }

  // if one or more nodes are selected: add options to cut and copy
  if (graphSelection.selectedNodes.size > 0) {
    contextMenu.addMenuItem('Cut', () => {
      ICommand.CUT.execute(null, graphComponent)
    })
    contextMenu.addMenuItem('Copy', () => {
      ICommand.COPY.execute(null, graphComponent)
    })
  }
  if (!graphComponent.clipboard.empty) {
    // clipboard is not empty: add option to paste
    contextMenu.addMenuItem('Paste', () => {
      ICommand.PASTE.execute(args.queryLocation, graphComponent)
    })
  }
}

/**
 * Creates the initial graph.
 * @param {!IGraph} graph
 */
function createSampleGraph(graph) {
  graph.clear()

  const n1 = graph.createNode(new Rect(126, 0, 30, 30))
  const n2 = graph.createNode(new Rect(126, 72, 30, 30))
  const n3 = graph.createNode(new Rect(75, 147, 30, 30))
  const n4 = graph.createNode(new Rect(177.5, 147, 30, 30))
  const n5 = graph.createNode(new Rect(110, 249, 30, 30))
  const n6 = graph.createNode(new Rect(177.5, 249, 30, 30))
  const n7 = graph.createNode(new Rect(110, 299, 30, 30))
  const n8 = graph.createNode(new Rect(177.5, 299, 30, 30))
  const n9 = graph.createNode(new Rect(110, 359, 30, 30))
  const n10 = graph.createNode(new Rect(47.5, 299, 30, 30))
  const n11 = graph.createNode(new Rect(20, 440, 30, 30))
  const n12 = graph.createNode(new Rect(110, 440, 30, 30))
  const n13 = graph.createNode(new Rect(20, 515, 30, 30))
  const n14 = graph.createNode(new Rect(80, 515, 30, 30))
  const n15 = graph.createNode(new Rect(140, 515, 30, 30))
  const n16 = graph.createNode(new Rect(20, 569, 30, 30))

  const group1 = graph.createGroupNode({
    layout: new Rect(25, 45, 202.5, 353),
    labels: ['Group 1']
  })
  graph.groupNodes(group1, [n2, n3, n4, n9, n10])

  const group2 = graph.createGroupNode({
    parent: group1,
    layout: new Rect(98, 222, 119.5, 116),
    labels: ['Group 2']
  })
  graph.groupNodes(group2, [n5, n6, n7, n8])

  const group3 = graph.createGroupNode({
    layout: new Rect(10, 413, 170, 141),
    labels: ['Group 3']
  })
  graph.groupNodes(group3, [n11, n12, n13, n14, n15])

  graph.createEdge(n1, n2)
  graph.createEdge(n2, n3)
  graph.createEdge(n2, n4)
  graph.createEdge(n3, n5)
  graph.createEdge(n3, n10)
  graph.createEdge(n5, n7)
  graph.createEdge(n7, n9)
  graph.createEdge(n4, n6)
  graph.createEdge(n6, n8)
  graph.createEdge(n10, n11)
  graph.createEdge(n10, n12)
  graph.createEdge(n11, n13)
  graph.createEdge(n13, n16)
  graph.createEdge(n12, n14)
  graph.createEdge(n12, n15)
}

// noinspection JSIgnoredPromiseFromCall
run()
