/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
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
import { bindChangeListener, bindCommand, showApp } from '../../resources/demo-app.js'
import { initDemoStyles } from '../../resources/demo-styles.js'
import loadJson from '../../resources/load-json.js'

/**
 * This demo shows how to automatically build a graph from business data.
 */
function run(licenseData) {
  License.value = licenseData
  // Initialize graph component
  graphComponent = new GraphComponent('graphComponent')

  // Use the viewer input mode since this demo should not allow interactive graph editing
  graphComponent.inputMode = new GraphViewerInputMode()

  // Assign the default demo styles for groups and edges
  initDemoStyles(graphComponent.graph)
  // But use a different style for normal nodes
  graphComponent.graph.nodeDefaults.style = new TemplateNodeStyle('nodeTemplate')
  graphComponent.graph.nodeDefaults.size = new Size(260, 60)

  // Build the graph from data
  builderType = TYPE_GRAPH_BUILDER
  buildGraph()

  // register toolbar commands
  registerCommands()

  showApp(graphComponent)
}

/**
 * The current graph component.
 * @type {GraphComponent}
 */
let graphComponent = null

/**
 * The current builder type.
 * @type {string}
 */
let builderType = null

/**
 * @type {HTMLSelectElement}
 */
const selectBox = document.querySelector("select[data-command='SelectBuilder']")

/**
 * Specifier that indicates using a {@link GraphBuilder}.
 * @type {string}
 */
const TYPE_GRAPH_BUILDER = 'Graph Builder'

/**
 * Specifier that indicates using a {@link TreeBuilder} with an array input.
 * @type {string}
 */
const TYPE_TREE_BUILDER_ARRAY = 'Tree Builder (Array)'

/**
 * Specifier that indicates using a {@link TreeBuilder} with a JSON input.
 * @type {string}
 */
const TYPE_TREE_BUILDER_JSON = 'Tree Builder (JSON)'

/**
 * Specifier that indicates using a {@link AdjacencyGraphBuilder} with a JSON input.
 * @type {string}
 */
const TYPE_ADJACENT_NODES_BUILDER = 'Adjacent Nodes Graph Builder'

/**
 * Specifier that indicates using a {@link TreeBuilder} with an array input and node IDs.
 * @type {string}
 */
const TYPE_ADJACENT_NODES_BUILDER_ID_ARRAY = 'Adjacent Nodes Graph Builder (with IDs)'

/**
 * Creates and configures the {@link GraphBuilder}.
 * @return {GraphBuilder}
 */
function createGraphBuilder() {
  const graphBuilder = new GraphBuilder(graphComponent.graph)
  graphBuilder.createNodesSource({
    // Stores the nodes of the graph
    data: GraphBuilderData.nodesSource,
    // Identifies the id property of a node object
    id: 'id',
    // Identifies the property of a node object that contains its group's id
    parentId: 'group'
  })
  graphBuilder.createGroupNodesSource({
    // Stores the group nodes of the graph
    data: GraphBuilderData.groupsSource,
    // Identifies the id property of a group node object
    id: 'id',
    // Identifies the property of a group node object that contains its parent group id
    parentId: 'parentGroup'
  })
  graphBuilder.createEdgesSource({
    // Stores the edges of the graph
    data: GraphBuilderData.edgesSource,
    // Identifies the property of an edge object that contains the source node's id
    sourceId: 'fromNode',
    // Identifies the property of an edge object that contains the target node's id
    targetId: 'toNode'
  })

  return graphBuilder
}

/**
 * Creates and configures the {@link TreeBuilder}.
 * @return {TreeBuilder}
 */
function createTreeBuilder() {
  const treeBuilder = new TreeBuilder(graphComponent.graph)

  let nodesSource
  // Set the properties of TreeSource that specify your custom data
  if (builderType === TYPE_TREE_BUILDER_ARRAY) {
    nodesSource = TreeBuilderDataArray.nodesSource
  } else if (builderType === TYPE_TREE_BUILDER_JSON) {
    nodesSource = TreeBuilderDataJson.nodesSource
  }

  // Identifies the property of a node object that contains its child nodes
  const rootNodesSource = treeBuilder.createRootNodesSource(nodesSource)
  // Configure the recursive tree structure
  rootNodesSource.addChildNodesSource(data => data.children, rootNodesSource)

  return treeBuilder
}

/**
 * Creates and configures the {@link AdjacencyGraphBuilder}.
 * @return {AdjacencyGraphBuilder}
 */
function createAdjacencyGraphBuilder() {
  const adjacencyGraphBuilder = new AdjacencyGraphBuilder(graphComponent.graph)

  if (builderType === TYPE_ADJACENT_NODES_BUILDER) {
    // Stores the nodes of the graph
    const adjacencyNodesSource = adjacencyGraphBuilder.createNodesSource(
      TreeBuilderDataArray.nodesSource
    )
    // Configure the successor nodes
    adjacencyNodesSource.addSuccessorsSource(
      data => data.children,
      adjacencyNodesSource,
      new EdgeCreator()
    )
  } else if (builderType === TYPE_ADJACENT_NODES_BUILDER_ID_ARRAY) {
    // Stores the nodes of the graph
    const adjacencyNodesSource = adjacencyGraphBuilder.createNodesSource(
      AdjacentBuilderIdDataArray.nodesSource,
      'id'
    )
    // Configure the successor nodes
    adjacencyNodesSource.addSuccessorIds(data => data.children, new EdgeCreator())
  }

  return adjacencyGraphBuilder
}

// We need to load the 'view-layout-bridge' module explicitly to prevent tree-shaking
// tools it from removing this dependency which is needed for 'morphLayout'.
Class.ensure(LayoutExecutor)

/**
 * Builds the graph using the selected builder type.
 * After building the graph, a hierarchic layout is applied.
 */
async function buildGraph() {
  // Clear the current graph
  graphComponent.graph.clear()

  // Create the builder
  let builder
  if (builderType === TYPE_GRAPH_BUILDER) {
    builder = createGraphBuilder()
  } else if (
    builderType === TYPE_ADJACENT_NODES_BUILDER ||
    builderType === TYPE_ADJACENT_NODES_BUILDER_ID_ARRAY
  ) {
    builder = createAdjacencyGraphBuilder()
  } else {
    builder = createTreeBuilder()
  }

  // Build the graph from the data...
  graphComponent.graph = builder.buildGraph()
  // ... and make sure it is centered in the view (this is the initial state of the layout animation)
  graphComponent.fitGraphBounds()

  // Layout the graph with the hierarchic layout style
  const hl = new HierarchicLayout()
  hl.layoutOrientation = LayoutOrientation.LEFT_TO_RIGHT

  selectBox.disabled = true
  await graphComponent.morphLayout(hl, '1s')
  selectBox.disabled = false
}

/**
 * Registers the commands for the tool bar buttons during the creation of this application.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindChangeListener("select[data-command='SelectBuilder']", selectedValue => {
    builderType = selectedValue
    // Build graph from new data
    buildGraph()
  })
}

// run the demo
loadJson().then(run)
