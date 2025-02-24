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
  Graph,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GroupNodeLabelModel,
  GroupNodeStyle,
  HierarchicalLayout,
  IEdge,
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
import type { JSONGraph } from '@yfiles/demo-utils/json-model'
import graphData from './graph-data.json'

/**
 * Application Features - Filtering
 *
 * This demo shows how to enable filtering on an {@link IGraph}.
 * Filtering temporarily removes nodes or edges from the graph.
 */
let graphComponent: GraphComponent

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  // Initialize the GraphComponent
  graphComponent = new GraphComponent('#graphComponent')
  // Creates a new GraphEditorInputMode instance and registers it as the main
  // input mode for the graphComponent
  graphComponent.inputMode = new GraphEditorInputMode({
    selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE
  })

  // create the filtered Graph
  const filteredGraph = createFilterGraph()

  // assign the filtered graph to the graph component
  graphComponent.graph = filteredGraph

  // fullGraph is the Original graph wrapped by the filtered Graph
  const fullGraph = filteredGraph.wrappedGraph!

  // make sure state tags are on all created items
  fullGraph.addEventListener('node-created', (evt) => (evt.item.tag = { filtered: false }))
  fullGraph.addEventListener('edge-created', (evt) => (evt.item.tag = { filtered: false }))

  // configures default styles for newly created graph elements
  initializeGraph(fullGraph)

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData as unknown as JSONGraph)

  // layout and center the graph
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(new HierarchicalLayout({ minimumLayerDistance: 35 }))
  await graphComponent.fitGraphBounds()

  // enable now the undo engine to prevent undoing of the graph creation
  graphComponent.graph.undoEngineEnabled = true

  // update the reset filter button depending on the current graph state
  graphComponent.graph.undoEngine!.addEventListener('unit-undone', updateResetButtonState)
  graphComponent.graph.undoEngine!.addEventListener('unit-redone', updateResetButtonState)

  // bind the buttons to their functionality
  initializeUI()
}

/**
 * Iterates through the given data set and creates nodes and edges according to the given data.
 */
function buildGraph(graph: IGraph, graphData: JSONGraph): void {
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
 * Creates a filtered graph which wraps the full graph.
 *
 * @returns The filtered graph.
 */
function createFilterGraph(): FilteredGraphWrapper {
  // the unfiltered, unfolded master graph
  const fullGraph = new Graph()

  // set default styles for newly created graph elements
  initializeGraph(fullGraph)

  // we want to hide items whose tag contains the string 'filtered'
  const nodePredicate = (node: INode): boolean => !node.tag || !node.tag.filtered
  const edgePredicate = (edge: IEdge): boolean => !edge.tag || !edge.tag.filtered

  // create a filtered graph
  return new FilteredGraphWrapper(fullGraph, nodePredicate, edgePredicate)
}

/**
 * Hides the selected items.
 */
function filterItems(): void {
  // mark the selected items such that the nodePredicate or edgePredicate will filter them
  filterItemWithUndoUnit(
    graphComponent.selection.nodes.concat(graphComponent.selection.edges).toArray(),
    true
  )
  // re-evaluate the filter predicates to actually hide the items
  const filteredGraph = graphComponent.graph as FilteredGraphWrapper
  filteredGraph.nodePredicateChanged()
  filteredGraph.edgePredicateChanged()
}

/**
 * Restores the filtered items.
 */
function restoreItems(): void {
  // access the unfiltered, unfolded graph to remove the filter mark from all items
  const filteredGraph = graphComponent.graph as FilteredGraphWrapper
  const fullGraph = filteredGraph.wrappedGraph!
  filterItemWithUndoUnit(fullGraph.nodes.concat(fullGraph.edges).toArray(), false)

  // re-evaluate the filter predicates to actually show the items again
  filteredGraph.nodePredicateChanged()
  filteredGraph.edgePredicateChanged()
}

/**
 * Changes the filtered state of the tag of an edge or node while also adding an undo unit for it.
 */
function filterItemWithUndoUnit(items: (INode | IEdge)[], state: boolean): void {
  graphComponent.graph.undoEngine!.addUnit(new ChangeFilterStateUndoUnit(items))
  for (const item of items) {
    item.tag.filtered = state
  }
}

/**
 * Initializes the defaults for the styling in this demo.
 *
 * @param graph The graph.
 */
function initializeGraph(graph: IGraph): void {
  // set styles for this demo
  initDemoStyles(graph)

  // set the style, label and label parameter for group nodes
  graph.groupNodeDefaults.style = new GroupNodeStyle({
    tabFill: '#242265',
    tabPosition: 'top-trailing',
    stroke: '2px solid #242265',
    cornerRadius: 8,
    tabWidth: 70,
    contentAreaPadding: 8
  })
  graph.groupNodeDefaults.labels.style = new LabelStyle({
    horizontalTextAlignment: 'right',
    textFill: '#FFF',
    padding: [0, 10, 0, 0]
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
function initializeUI(): void {
  const filterItemsButton = document.querySelector<HTMLButtonElement>('#filter-items')!
  filterItemsButton.addEventListener('click', (): void => {
    // filtering items
    filterItems()
    // enable the reset button
    resetFilterButton.disabled = false
  })

  const resetFilterButton = document.querySelector<HTMLButtonElement>('#reset-filter')!
  resetFilterButton.addEventListener('click', () => {
    // restoring items
    restoreItems()
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
function updateResetButtonState(): void {
  const fullGraph = (graphComponent.graph as FilteredGraphWrapper).wrappedGraph!
  const hasFilteredItems =
    fullGraph.nodes.some((node) => node.tag && node.tag.filtered) ||
    fullGraph.edges.some((edge) => edge.tag && edge.tag.filtered)
  // set the reset button
  document.querySelector<HTMLButtonElement>('#reset-filter')!.disabled = !hasFilteredItems
}

/**
 * An undo unit to keep track of the filtered state changes on the graph items.
 */
class ChangeFilterStateUndoUnit extends BaseClass(IUndoUnit) {
  private oldStates = new Map<INode | IEdge, boolean>()
  private newStates = new Map<INode | IEdge, boolean>()
  constructor(private readonly items: (INode | IEdge)[]) {
    super()
    // remember the old values
    for (const item of this.items) {
      this.oldStates.set(item, item.tag.filtered)
    }
  }

  get redoName(): string {
    return 'Change Filter State'
  }

  get undoName(): string {
    return 'Change Filter State'
  }

  undo(): void {
    this.newStates = new Map<INode | IEdge, boolean>()
    for (const item of this.items) {
      // remember the new value for redo
      this.newStates.set(item, item.tag.filtered)
      // set the old value
      item.tag.filtered = this.oldStates.get(item)
    }
    const filteredGraph = graphComponent.graph as FilteredGraphWrapper
    filteredGraph.nodePredicateChanged()
    filteredGraph.edgePredicateChanged()
  }

  redo(): void {
    for (const item of this.items) {
      // set the new value
      item.tag.filtered = this.newStates.get(item)
    }
    const filteredGraph = graphComponent.graph as FilteredGraphWrapper
    filteredGraph.nodePredicateChanged()
    filteredGraph.edgePredicateChanged()
  }

  tryMergeUnit(_unit: IUndoUnit): boolean {
    return false
  }

  tryReplaceUnit(_unit: IUndoUnit): boolean {
    return false
  }

  dispose(): void {}
}

run().then(finishLoading)
