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
  AdjacencyGraphBuilder,
  EdgeCreator,
  GraphBuilder,
  GraphComponent,
  GraphViewerInputMode,
  HierarchicalLayout,
  IGraph,
  LayoutExecutor,
  License,
  Size,
  TreeBuilder
} from '@yfiles/yfiles'
import TreeBuilderDataJson from './tree-builder-data-json'
import TreeBuilderDataArray from './tree-builder-data-array'
import AdjacentBuilderIdDataArray from './adjacent-builder-id-data-array'
import GraphBuilderData from './graph-builder-data'
import GraphBuilderWithImplicitGroupsData from './graph-builder-with-grouping-data'
import { initDataView, updateDataView } from './data-view'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { addNavigationButtons, finishLoading } from '@yfiles/demo-resources/demo-page'
import { nodeTemplate } from './style-templates'
import { LitNodeStyle } from '@yfiles/demo-utils/LitNodeStyle'
// @ts-ignore Import via URL
// eslint-disable-next-line import/no-unresolved
import { nothing, svg } from 'lit-html'
/**
 * Specifier that indicates using a {@link GraphBuilder}.
 */
const TYPE_GRAPH_BUILDER = 'Graph Builder'
/**
 * Specifier that indicates using a {@link GraphBuilder} with child lists.
 */
const TYPE_GRAPH_BUILDER_PARENTS_AND_CHILDREN = 'Graph Builder (Implicit Grouping)'
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
const selectBox = document.querySelector('#select-builder')
/**
 * This demo shows how to automatically build a graph from business data.
 */
async function run() {
  License.value = await fetchLicense()
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
  // register toolbar actions
  initializeUI(graphComponent)
}
/**
 * Configures default styles for the given graph's elements.
 */
function configureGraph(graph) {
  // use simple and efficient styles for all graph elements
  initDemoStyles(graph)
  // ... but use a style that supports data binding for normal nodes
  graph.nodeDefaults.style = new LitNodeStyle(createRenderFunction(nodeTemplate))
  graph.nodeDefaults.size = new Size(260, 60)
}
function createRenderFunction(template) {
  return new Function(
    'const svg = arguments[0]; const nothing = arguments[1]; const renderFunction = ' +
      '({layout, tag}) => svg`\n' +
      template +
      '`' +
      '\n return renderFunction'
  )(svg, nothing)
}
/**
 * Creates and configures the {@link GraphBuilder}.
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
  // This sample provides explicit objects for the groups
  const groupsSource = graphBuilder.createGroupNodesSource({
    // stores the group nodes of the graph
    data: GraphBuilderData.groupsSource,
    // identifies the id property of a group node object
    id: 'id',
    // identifies the property of a group node object that contains its parent group id
    parentId: 'parentGroup'
  })
  // Add some labels to the group nodes
  groupsSource.nodeCreator.createLabelBinding((group) => group.id)
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
 * Creates and configures the {@link GraphBuilder} defining children and parents of a {@link NodesSource}.
 */
function createGraphBuilderWithImplicitGrouping(graph) {
  // Choose the right source data
  // update the data view with the current data
  updateDataView(
    GraphBuilderWithImplicitGroupsData.nodesSource,
    null,
    GraphBuilderWithImplicitGroupsData.edgesSource
  )
  const graphBuilder = new GraphBuilder(graph)
  // In this sample, our core objects are the groups, that have
  // both a list of members (employees) and an additional attribute specifying the
  // location which gets turned into another hierarchy
  const nodesSource = graphBuilder.createNodesSource({
    // stores the nodes of the graph
    data: GraphBuilderWithImplicitGroupsData.nodesSource,
    // identifies the id property of a node object
    id: 'id'
  })
  // The children of each group are defined directly in the data
  const childSource = nodesSource.createChildNodesSource(
    // specifies how to retrieve the children for each group
    (group) => group.members,
    // specifies how the child nodes are identified globally
    (item) => item.id
  )
  // And the groups are additionally grouped again by location
  const parentSource = nodesSource.createParentNodesSource((group) => group.location)
  // We want to set up reasonable defaults for the styles.
  // Since the entities in the nodesSource and the parentsSource are both group nodes, they
  // are styled with a group node
  nodesSource.nodeCreator.defaults.style = parentSource.nodeCreator.defaults.style =
    graph.groupNodeDefaults.style
  // We also show labels for the groups
  nodesSource.nodeCreator.createLabelBinding((group) => group.id)
  parentSource.nodeCreator.createLabelBinding((location) => location)
  nodesSource.nodeCreator.defaults.labels = parentSource.nodeCreator.defaults.labels =
    graph.groupNodeDefaults.labels
  // The nodes in the childSource are just plain leaf nodes and are styles with a normal node style
  childSource.nodeCreator.defaults.style = graph.nodeDefaults.style
  // The edges are defined as for the sample with explicit groups
  // even though the objects don't appear in the nodesSource
  graphBuilder.createEdgesSource({
    // stores the edges of the graph
    data: GraphBuilderWithImplicitGroupsData.edgesSource,
    // identifies the property of an edge object that contains the source node's id
    sourceId: 'fromNode',
    // identifies the property of an edge object that contains the target node's id
    targetId: 'toNode'
  })
  return graphBuilder
}
/**
 * Creates and configures the {@link TreeBuilder}.
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
  const rootNodesSource = treeBuilder.createRootNodesSource(nodesSource, null)
  // configure the recursive tree structure
  rootNodesSource.addChildNodesSource((data) => data.children, rootNodesSource)
  return treeBuilder
}
/**
 * Creates and configures the {@link AdjacencyGraphBuilder}.
 */
function createAdjacencyGraphBuilder(graph, builderType) {
  const adjacencyGraphBuilder = new AdjacencyGraphBuilder(graph)
  if (builderType === TYPE_ADJACENT_NODES_BUILDER) {
    // update the data view with the current data
    updateDataView(TreeBuilderDataArray.nodesSource)
    // stores the nodes of the graph
    const adjacencyNodesSource = adjacencyGraphBuilder.createNodesSource(
      TreeBuilderDataArray.nodesSource,
      null
    )
    // configure the successor nodes
    adjacencyNodesSource.addSuccessorsSource(
      (data) => data.children,
      adjacencyNodesSource,
      new EdgeCreator({ defaults: graph.edgeDefaults })
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
    adjacencyNodesSource.addSuccessorIds(
      (data) => data.children,
      new EdgeCreator({ defaults: graph.edgeDefaults })
    )
  }
  return adjacencyGraphBuilder
}
/**
 * Builds the graph using the selected builder type.
 */
function buildGraph(graph, builderType) {
  // Clear the current graph
  graph.clear()
  // Create the builder
  let builder
  if (builderType === TYPE_GRAPH_BUILDER) {
    builder = createGraphBuilder(graph)
  } else if (builderType === TYPE_GRAPH_BUILDER_PARENTS_AND_CHILDREN) {
    builder = createGraphBuilderWithImplicitGrouping(graph)
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
 */
async function arrangeGraph(graphComponent) {
  // make sure the graph is centered in the view before arranging it
  // (this is the initial state of the layout animation)
  graphComponent.fitGraphBounds()
  const algorithm = new HierarchicalLayout()
  algorithm.layoutOrientation = 'left-to-right'
  selectBox.disabled = true
  // Ensure that the LayoutExecutor class is not removed by build optimizers
  // It is needed for the 'applyLayoutAnimated' method in this demo.
  LayoutExecutor.ensure()
  // arrange the graph with the chosen layout algorithm
  await graphComponent.applyLayoutAnimated(algorithm, '1s')
  selectBox.disabled = false
}
/**
 * Registers the actions for the toolbar buttons during the creation of this application.
 */
function initializeUI(graphComponent) {
  selectBox.addEventListener('change', async (e) => {
    // build graph from new data
    selectBox.disabled = true
    buildGraph(graphComponent.graph, e.target.value)
    await arrangeGraph(graphComponent)
    selectBox.disabled = false
  })
  addNavigationButtons(selectBox)
}
run().then(finishLoading)
