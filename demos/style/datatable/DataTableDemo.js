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
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLSupport,
  ICommand,
  IGraph,
  INode,
  License,
  List,
  Point,
  Size,
  StorageLocation
} from 'yfiles'

import createNewRandomUserData from './UserDataFactory.js'
import DataTableLabelStyle from './DataTableLabelStyle.js'
import DataTableNodeStyle from './DataTableNodeStyle.js'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'

import { applyDemoTheme } from '../../resources/demo-styles.js'
import { fetchLicense } from '../../resources/fetch-license.js'

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  // initialize the GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  // initialize default demo styles
  initializeStyles(graphComponent.graph)

  // initialize the input mode
  initializeInputMode(graphComponent)

  // enable the graphml support for loading and saving
  enableGraphML(graphComponent)

  // create a sample graph
  createSampleGraph(graphComponent.graph, 4)

  graphComponent.fitGraphBounds()

  // enable the undo engine
  graphComponent.graph.undoEngineEnabled = true

  // wire up the UI
  registerCommands(graphComponent)

  showApp(graphComponent)
}

/**
 * Initializes the default styles for nodes and labels.
 * @param {!IGraph} graph
 */
function initializeStyles(graph) {
  // initialize node style
  graph.nodeDefaults.style = new DataTableNodeStyle()
  graph.nodeDefaults.size = new Size(170, 120)

  // initialize default label
  graph.nodeDefaults.labels.style = new DataTableLabelStyle()

  const exteriorLabelModel = new ExteriorLabelModel({ insets: 15 })

  graph.nodeDefaults.labels.layoutParameter = exteriorLabelModel.createParameter(
    ExteriorLabelModelPosition.WEST
  )
}

/**
 * Initializes the input mode.
 * @param {!GraphComponent} graphComponent
 */
function initializeInputMode(graphComponent) {
  const mode = new GraphEditorInputMode({
    // labels are added with the toolbar button and are not editable
    allowEditLabel: false,
    allowAddLabel: false
  })
  // add random user data to new nodes
  mode.addNodeCreatedListener((sender, e) => {
    e.item.tag = createNewRandomUserData()
    // check if the label should be displayed
    const exteriorLabelModel = new ExteriorLabelModel({ insets: 15 })
    onToggleNodeLabel(graphComponent.graph, e.item, exteriorLabelModel)
    graphComponent.updateContentRect()
  })
  graphComponent.inputMode = mode
}

/**
 * Enables loading and saving the graph from/to GraphML.
 * @param {!GraphComponent} graphComponent
 */
function enableGraphML(graphComponent) {
  // create a new GraphMLSupport instance that handles save and load operations
  const gs = new GraphMLSupport({
    graphComponent,
    // configure to load and save to the file system
    storageLocation: StorageLocation.FILE_SYSTEM
  })

  // enable serialization of the custom styles - without a namespace mapping, serialization will fail
  gs.graphMLIOHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/DataTableNodeStyle/1.0',
    'DataTableNodeStyle',
    DataTableNodeStyle.$class
  )
  gs.graphMLIOHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/DataTableLabelStyle/1.0',
    'DataTableLabelStyle',
    DataTableLabelStyle.$class
  )

  gs.graphMLIOHandler.addParsedListener((sender, args) => {
    onToggleLabels(args.context.graph)
  })
}

/**
 * Executed when Toggle Labels button is pressed.
 * @param {!IGraph} graph
 */
function onToggleLabels(graph) {
  const exteriorLabelModel = new ExteriorLabelModel({ insets: 15 })
  for (const node of graph.nodes) {
    onToggleNodeLabel(graph, node, exteriorLabelModel)
  }
}

/**
 * Executed for each node when Toggle Labels button is pressed.
 * @param {!IGraph} graph
 * @param {!INode} node
 * @param {!ExteriorLabelModel} exteriorLabelModel
 */
function onToggleNodeLabel(graph, node, exteriorLabelModel) {
  if (document.getElementById('ToggleLabels').checked) {
    const parameter =
      node.layout.x < 100
        ? exteriorLabelModel.createParameter(ExteriorLabelModelPosition.EAST)
        : exteriorLabelModel.createParameter(ExteriorLabelModelPosition.WEST)
    graph.addLabel(node, '', parameter)
  } else {
    // if there exist labels, remove them
    for (const label of new List(node.labels)) {
      graph.remove(label)
    }
  }
}

/**
 * Creates an initial graph.
 * @param {!IGraph} graph
 * @param {number} nodeCount
 */
function createSampleGraph(graph, nodeCount) {
  // Create nodes with random user data
  const nodes = []
  for (let i = 0; i < nodeCount; i++) {
    const x = i % 2 === 0 ? 0 : 350
    nodes[i] = graph.createNodeAt({
      location: new Point(x, i * 150),
      tag: createNewRandomUserData()
    })
  }

  // Create some edges
  if (nodes.length > 1) {
    graph.createEdge(nodes[0], nodes[1])
  }
  for (let i = 2; i < nodes.length; i++) {
    graph.createEdge(nodes[i - 1], nodes[i])
    graph.createEdge(nodes[i - 2], nodes[i])
  }
}

/**
 * Binds actions to the demo's UI controls.
 * @param {!GraphComponent} graphComponent
 */
function registerCommands(graphComponent) {
  bindAction("button[data-command='New']", () => {
    graphComponent.graph.clear()
    graphComponent.fitGraphBounds()
  })
  bindCommand("button[data-command='Open']", ICommand.OPEN, graphComponent)
  bindCommand("button[data-command='Save']", ICommand.SAVE, graphComponent)

  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)

  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)
  bindCommand("button[data-command='Delete']", ICommand.DELETE, graphComponent)

  bindAction("input[data-command='ToggleLabels']", () => {
    onToggleLabels(graphComponent.graph)
    graphComponent.updateContentRect()
  })
}

// noinspection JSIgnoredPromiseFromCall
run()
