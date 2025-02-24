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
  BaseClass,
  EdgePathLabelModel,
  EdgeSides,
  ExteriorNodeLabelModel,
  FilteredGraphWrapper,
  FoldingManager,
  Graph,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GroupNodeLabelModel,
  GroupNodeStyle,
  HierarchicalLayout,
  IEdge,
  IFoldingView,
  IGraph,
  INode,
  IUndoUnit,
  LabelStyle,
  LayoutExecutor,
  License,
  Size
} from '@yfiles/yfiles'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import graphData from './graph-data.json'
let graphComponent
/**
 * Bootstraps the demo.
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')
  graphComponent.inputMode = new GraphEditorInputMode({
    selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE
  })
  // enable filtering and folding for the graph
  const foldingView = enableFilteringAndFolding()
  // assign the folded graph to the graph component
  graphComponent.graph = foldingView.graph
  const fullGraph = foldingView.manager.masterGraph.wrappedGraph
  // make sure state tags are on all created items
  fullGraph.addEventListener('node-created', (evt) => (evt.item.tag = { filtered: false }))
  fullGraph.addEventListener('edge-created', (evt) => (evt.item.tag = { filtered: false }))
  // configures default styles for newly created graph elements
  initializeGraph(fullGraph)
  // then build the graph with the given data set
  buildGraph(graphComponent.graph, graphData)
  // layout and center the graph
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(new HierarchicalLayout({ minimumLayerDistance: 35 }))
  await graphComponent.fitGraphBounds()
  // enable undo after the initial graph was populated since we don't want to allow undoing that
  fullGraph.undoEngineEnabled = true
  // update the reset filter button depending on the current graph state
  fullGraph.undoEngine.addEventListener('unit-undone', updateResetButtonState)
  fullGraph.undoEngine.addEventListener('unit-redone', updateResetButtonState)
  // bind the buttons to their functionality
  initializeUI()
}
/**
 * Iterates through the given data set and creates nodes and edges according to the given data.
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)
  graphBuilder.createNodesSource({
    data: graphData.nodeList.filter((item) => !item.isGroup),
    id: (item) => item.id,
    parentId: (item) => item.parentId
  })
  graphBuilder
    .createGroupNodesSource({
      data: graphData.nodeList.filter((item) => item.isGroup),
      id: (item) => item.id
    })
    .nodeCreator.createLabelBinding((item) => item.label)
  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })
  graphBuilder.buildGraph()
}
/**
 * Enables filtering and folding.
 * When utilizing both features on the same graph, it is important to apply filtering before folding. Therefore,
 * use {@link FilteredGraphWrapper} to create a filtered view of the graph and after that, use
 * {@link FoldingManager} to create a folding view of the filtered graph.
 *
 * @returns The folding view that manages the folded graph.
 */
function enableFilteringAndFolding() {
  // the unfiltered, unfolded master graph
  const fullGraph = new Graph()
  // set default styles for newly created graph elements
  initializeGraph(fullGraph)
  // we want to hide items whose tag contains the string 'filtered'
  const nodePredicate = (node) => !node.tag || !node.tag.filtered
  const edgePredicate = (edge) => !edge.tag || !edge.tag.filtered
  // create a filtered graph
  const filteredGraph = new FilteredGraphWrapper(fullGraph, nodePredicate, edgePredicate)
  // create a folding manager
  const manager = new FoldingManager(filteredGraph)
  // create a folding view that manages the folded graph
  return manager.createFoldingView()
}
/**
 * Changes the filtered state of the tag of an edge or node while also adding an undo unit for it.
 */
function filterItemWithUndoUnit(item, state) {
  const filteredGraph = graphComponent.graph.foldingView.manager.masterGraph
  const fullGraph = filteredGraph.wrappedGraph
  fullGraph.undoEngine.addUnit(new ChangeFilterStateUndoUnit(item.tag))
  fullGraph.undoEngine.addUnit(new ChangeFilterStateUndoUnit(item.tag))
  item.tag.filtered = state
}
/**
 * Initializes the defaults for the styling in this demo.
 *
 * @param graph The graph.
 */
function initializeGraph(graph) {
  // set styles for this demo
  initDemoStyles(graph, { foldingEnabled: true })
  graph.groupNodeDefaults.style = new GroupNodeStyle({
    groupIcon: 'minus',
    iconBackgroundShape: 'circle',
    iconForegroundFill: 'white',
    iconPosition: 'trailing',
    tabFill: '#242265',
    tabPosition: 'top-trailing',
    stroke: '2px solid #242265',
    cornerRadius: 8,
    tabWidth: 70,
    contentAreaPadding: 8
  })
  graph.groupNodeDefaults.labels.style = new LabelStyle({
    horizontalTextAlignment: 'right',
    textFill: '#FFF'
  })
  graph.groupNodeDefaults.labels.layoutParameter = new GroupNodeLabelModel().createTabParameter()
  // set sizes and locations specific for this demo
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.layoutParameter = new ExteriorNodeLabelModel({
    margins: 5
  }).createParameter('bottom')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}
/**
 * Binds the buttons in the toolbar to their functionality.
 */
function initializeUI() {
  const filterItemsButton = document.querySelector('#filter-items')
  const resetFilterButton = document.querySelector('#reset-filter')
  filterItemsButton.addEventListener('click', () => {
    // mark the selected items such that the nodePredicate or edgePredicate will filter them
    graphComponent.selection.nodes.forEach((node) => {
      filterItemWithUndoUnit(node, true)
    })
    graphComponent.selection.edges.forEach((edge) => {
      filterItemWithUndoUnit(edge, true)
    })
    // re-evaluate the filter predicates to actually hide the items
    const filteredGraph = graphComponent.graph.foldingView.manager.masterGraph
    filteredGraph.nodePredicateChanged()
    filteredGraph.edgePredicateChanged()
    // enable the reset button
    resetFilterButton.disabled = false
  })
  resetFilterButton.addEventListener('click', () => {
    // access the unfiltered, unfolded graph to remove the filter mark from all items
    const filteredGraph = graphComponent.graph.foldingView.manager.masterGraph
    const fullGraph = filteredGraph.wrappedGraph
    fullGraph.nodes.forEach((node) => {
      filterItemWithUndoUnit(node, false)
    })
    fullGraph.edges.forEach((edge) => {
      filterItemWithUndoUnit(edge, false)
    })
    // re-evaluate the filter predicates to actually show the items again
    filteredGraph.nodePredicateChanged()
    filteredGraph.edgePredicateChanged()
    // disable the reset button
    resetFilterButton.disabled = true
  })
  // adds a listener for the current selection to enable/disable the filter button
  graphComponent.selection.addEventListener('item-added', () => {
    filterItemsButton.disabled = graphComponent.selection.size === 0
  })
  graphComponent.selection.addEventListener('item-removed', () => {
    filterItemsButton.disabled = graphComponent.selection.size === 0
  })
}
/**
 * Updates the 'Reset Filter' button state based on the current graph state.
 */
function updateResetButtonState() {
  const filteredGraph = graphComponent.graph.foldingView.manager.masterGraph
  const fullGraph = filteredGraph.wrappedGraph
  const hasFilteredItems =
    fullGraph.nodes.some((node) => node.tag && node.tag.filtered) ||
    fullGraph.edges.some((edge) => edge.tag && edge.tag.filtered)
  // set the reset button
  document.querySelector('#reset-filter').disabled = !hasFilteredItems
}
/**
 * An undo unit to keep track of the filtered state changes on the graph items.
 */
class ChangeFilterStateUndoUnit extends BaseClass(IUndoUnit) {
  tag
  oldState
  newState = false
  constructor(tag) {
    super()
    // remember the changed object
    this.tag = tag
    // remember the old value
    this.oldState = this.tag.filtered
  }
  get redoName() {
    return 'Change Filter State'
  }
  get undoName() {
    return 'Change Filter State'
  }
  undo() {
    // remember the new value for redo
    this.newState = this.tag.filtered
    // set the old value
    this.tag.filtered = this.oldState
    const filteredGraph = graphComponent.graph.foldingView.manager.masterGraph
    filteredGraph.nodePredicateChanged()
    filteredGraph.edgePredicateChanged()
  }
  redo() {
    // set the new value
    this.tag.filtered = this.newState
    const filteredGraph = graphComponent.graph.foldingView.manager.masterGraph
    filteredGraph.nodePredicateChanged()
    filteredGraph.edgePredicateChanged()
  }
  tryMergeUnit(_unit) {
    return false
  }
  tryReplaceUnit(_unit) {
    return false
  }
  dispose() {}
}
run().then(finishLoading)
