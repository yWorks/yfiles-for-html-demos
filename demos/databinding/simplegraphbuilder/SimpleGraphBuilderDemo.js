/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  AdjacencyGraphBuilder,
  Class,
  EdgeCreator,
  GraphBuilder,
  GraphComponent,
  GraphViewerInputMode,
  HierarchicLayout,
  ICommand,
  IGraph,
  LayoutExecutor,
  LayoutOrientation,
  License,
  Size,
  TemplateNodeStyle,
  TreeBuilder
} from 'yfiles'

import TreeBuilderDataJson from './tree-builder-data-json.js'
import TreeBuilderDataArray from './tree-builder-data-array.js'
import AdjacentBuilderIdDataArray from './adjacent-builder-id-data-array.js'
import GraphBuilderData from './graph-builder-data.js'
import {
  addNavigationButtons,
  bindChangeListener,
  bindCommand,
  checkLicense,
  showApp
} from '../../resources/demo-app.js'
import { initDemoStyles } from '../../resources/demo-styles.js'
import loadJson from '../../resources/load-json.js'
import { initDataView, updateDataView } from './data-view.js'

// We need to load the 'view-layout-bridge' module explicitly to prevent tree-shaking
// tools from removing this dependency which is needed for 'morphLayout'.
Class.ensure(LayoutExecutor)

/**
 * Specifier that indicates using a {@link GraphBuilder}.
 */
const TYPE_GRAPH_BUILDER = 'Graph Builder'

/**
 * Specifier that indicates using a {@link TreeBuilder} with an array input.
 */
const TYPE_TREE_BUILDER_ARRAY = 'Tree Builder (Array)'

/**
 * Specifier that indicates using a {@link TreeBuilder} with a JSON input.
 */
const TYPE_TREE_BUILDER_JSON = 'Tree Builder (JSON)'

/**
 * Specifier that indicates using a {@link AdjacencyGraphBuilder} with a JSON input.
 */
const TYPE_ADJACENT_NODES_BUILDER = 'Adjacent Nodes Graph Builder'

/**
 * Specifier that indicates using a {@link TreeBuilder} with an array input and node IDs.
 */
const TYPE_ADJACENT_NODES_BUILDER_ID_ARRAY = 'Adjacent Nodes Graph Builder (with IDs)'

const selectBox = document.querySelector("select[data-command='SelectBuilder']")

/**
 * This demo shows how to automatically build a graph from business data.
 * @param {!object} licenseData
 */
function run(licenseData) {
  License.value = licenseData

  // initialize graph component
  const graphComponent = new GraphComponent('graphComponent')

  // use the viewer input mode since this demo should not allow interactive graph editing
  graphComponent.inputMode = new GraphViewerInputMode()

  // assign the default demo styles for groups and edges
  configureGraph(graphComponent.graph)

  // initialize the source data view
  initDataView('#data-view')

  // build the graph from data
  buildGraph(graphComponent.graph, TYPE_GRAPH_BUILDER)

  arrangeGraph(graphComponent)

  // register toolbar commands
  registerCommands(graphComponent)

  showApp(graphComponent)
}

/**
 * Configures default styles for the given graph's elements.
 * @param {!IGraph} graph
 */
function configureGraph(graph) {
  // use simple and efficient styles for all graph elements
  initDemoStyles(graph)

  // ... but use a style that supports data binding for normal nodes
  graph.nodeDefaults.style = new TemplateNodeStyle('nodeTemplate')
  graph.nodeDefaults.size = new Size(260, 60)
}

/**
 * Creates and configures the {@link GraphBuilder}.
 * @param {!IGraph} graph
 * @returns {!GraphBuilder}
 */
function createGraphBuilder(graph) {
  // update the data view with the current data
  updateDataView(
    GraphBuilderData.nodesSource,
    GraphBuilderData.groupsSource,
    GraphBuilderData.edgesSource
  )

  const graphBuilder = new GraphBuilder(graph)
  graphBuilder.createNodesSource({
    // stores the nodes of the graph
    data: GraphBuilderData.nodesSource,
    // identifies the id property of a node object
    id: 'id',
    // identifies the property of a node object that contains its group's id
    parentId: 'group'
  })
  graphBuilder.createGroupNodesSource({
    // stores the group nodes of the graph
    data: GraphBuilderData.groupsSource,
    // identifies the id property of a group node object
    id: 'id',
    // identifies the property of a group node object that contains its parent group id
    parentId: 'parentGroup'
  })
  graphBuilder.createEdgesSource({
    // stores the edges of the graph
    data: GraphBuilderData.edgesSource,
    // identifies the property of an edge object that contains the source node's id
    sourceId: 'fromNode',
    // identifies the property of an edge object that contains the target node's id
    targetId: 'toNode'
  })

  return graphBuilder
}

/**
 * Creates and configures the {@link TreeBuilder}.
 * @param {!IGraph} graph
 * @param {!string} builderType
 * @returns {!TreeBuilder}
 */
function createTreeBuilder(graph, builderType) {
  const treeBuilder = new TreeBuilder(graph)

  const nodesSource =
    builderType === TYPE_TREE_BUILDER_ARRAY
      ? TreeBuilderDataArray.nodesSource
      : TreeBuilderDataJson.nodesSource

  // update the data view with the current data
  updateDataView(nodesSource)

  // identifies the property of a node object that contains its child nodes
  const rootNodesSource = treeBuilder.createRootNodesSource(nodesSource)
  // configure the recursive tree structure
  rootNodesSource.addChildNodesSource(data => data.children, rootNodesSource)

  return treeBuilder
}

/**
 * Creates and configures the {@link AdjacencyGraphBuilder}.
 * @param {!IGraph} graph
 * @param {!string} builderType
 * @returns {!AdjacencyGraphBuilder}
 */
function createAdjacencyGraphBuilder(graph, builderType) {
  const adjacencyGraphBuilder = new AdjacencyGraphBuilder(graph)

  if (builderType === TYPE_ADJACENT_NODES_BUILDER) {
    // update the data view with the current data
    updateDataView(TreeBuilderDataArray.nodesSource)

    // stores the nodes of the graph
    const adjacencyNodesSource = adjacencyGraphBuilder.createNodesSource(
      TreeBuilderDataArray.nodesSource
    )

    // configure the successor nodes
    adjacencyNodesSource.addSuccessorsSource(
      data => data.children,
      adjacencyNodesSource,
      new EdgeCreator()
    )
  } else if (builderType === TYPE_ADJACENT_NODES_BUILDER_ID_ARRAY) {
    // update the data view with the current data
    updateDataView(AdjacentBuilderIdDataArray.nodesSource)

    // stores the nodes of the graph
    const adjacencyNodesSource = adjacencyGraphBuilder.createNodesSource(
      AdjacentBuilderIdDataArray.nodesSource,
      'id'
    )
    // Configure the successor nodes
    adjacencyNodesSource.addSuccessorIds(data => data.children, new EdgeCreator())
  }

  return adjacencyGraphBuilder
}

/**
 * Builds the graph using the selected builder type.
 * @param {!IGraph} graph
 * @param {!string} builderType
 */
function buildGraph(graph, builderType) {
  // Clear the current graph
  graph.clear()

  // Create the builder
  let builder
  if (builderType === TYPE_GRAPH_BUILDER) {
    builder = createGraphBuilder(graph)
  } else if (
    builderType === TYPE_ADJACENT_NODES_BUILDER ||
    builderType === TYPE_ADJACENT_NODES_BUILDER_ID_ARRAY
  ) {
    builder = createAdjacencyGraphBuilder(graph, builderType)
  } else {
    builder = createTreeBuilder(graph, builderType)
  }

  // Build the graph from the data...
  builder.buildGraph()
}

/**
 * Arranges the graph of the given graph component and applies the new layout in an animated
 * fashion.
 * @param {!GraphComponent} graphComponent
 * @returns {!Promise}
 */
async function arrangeGraph(graphComponent) {
  // make sure the graph is centered in the view before arranging it
  // (this is the initial state of the layout animation)
  graphComponent.fitGraphBounds()

  const algorithm = new HierarchicLayout()
  algorithm.layoutOrientation = LayoutOrientation.LEFT_TO_RIGHT

  selectBox.disabled = true
  // arrange the graph with the chosen layout algorithm
  await graphComponent.morphLayout(algorithm, '1s')
  selectBox.disabled = false
}

/**
 * Registers the commands for the tool bar buttons during the creation of this application.
 * @param {!GraphComponent} graphComponent
 */
function registerCommands(graphComponent) {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindChangeListener("select[data-command='SelectBuilder']", async selectedValue => {
    // build graph from new data
    selectBox.disabled = true
    buildGraph(graphComponent.graph, selectedValue)
    await arrangeGraph(graphComponent)
    selectBox.disabled = false
  })
  addNavigationButtons(selectBox)
}

// run the demo
loadJson().then(checkLicense).then(run)
