/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { demoApp, graphComponent } from '@yfiles/demo-app/init'
import {
  FilteredGraphWrapper,
  GraphItemTypes,
  GraphViewerInputMode,
  HierarchicalLayout,
  INode,
  Neighborhood,
  NodeStyleIndicatorRenderer,
  ShapeNodeStyle,
  TraversalDirection
} from '@yfiles/yfiles'
import graphData from './graph-data.json'
import { getTag, setTag } from './graph-data'

// Define the default flow direction
let traversalDirection = TraversalDirection.SUCCESSOR

// Use the neighborhood algorithm to obtain neighbors of a given node
function getNeighbors(node, graph) {
  const neighborhoodAlgorithm = new Neighborhood({
    startNodes: [node],
    traversalDirection: traversalDirection
  })
  return neighborhoodAlgorithm.run(graph)
}

// --- Flow Filtering ---

// Predicate to determine which items to hide
const nodePredicate = (node) => !getTag(node)?.filtered

// Create a filtered Graph which wraps the original graph and applies the predicates
const filteredGraph = new FilteredGraphWrapper(graphComponent.graph, nodePredicate)

// Assign the filtered graph to the graph component for display
graphComponent.graph = filteredGraph

/**
 * Toggles the visibility of items within the connecting flow of the given node.
 */
function toggleNeighboursVisibility(node, visible) {
  // Get the neighbors of the clicked node
  const neighbors = getNeighbors(node, filteredGraph.wrappedGraph)
  // Toggle the visibility of each neighbor
  for (const node of neighbors.neighbors) {
    setTag(node, { filtered: !visible })
  }
  // Notify the filtered graph to re-evaluate its predicates and update the view
  filteredGraph.nodePredicateChanged()
}

// Hide flow items on node selection
graphComponent.selection.addEventListener('item-added', (evt) => {
  if (evt.item instanceof INode) {
    toggleNeighboursVisibility(evt.item, false)
  }
})

// Show flow items again when unselected
graphComponent.selection.addEventListener('item-removed', (evt) => {
  if (evt.item instanceof INode) {
    toggleNeighboursVisibility(evt.item, true)
  }
})

// --- Flow Highlighting ---

// Configure the input mode for this graph
const graphViewerInputMode = new GraphViewerInputMode()
graphComponent.inputMode = graphViewerInputMode

// Enable hover effects on nodes
graphViewerInputMode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE

// Specify hover effect: add the hovered node and its flow items to the graph's highlight collection
graphViewerInputMode.itemHoverInputMode.addEventListener('hovered-item-changed', (evt) => {
  graphComponent.highlights.clear()
  if (evt.item instanceof INode) {
    // Highlight the hovered node
    graphComponent.highlights.add(evt.item)
    // Highlight the neighbors of the hovered node
    for (const node of getNeighbors(evt.item, filteredGraph).neighbors) {
      graphComponent.highlights.add(node)
    }
  }
})

// Define the visual style for highlighted nodes
graphComponent.graph.decorator.nodes.highlightRenderer.addConstant(
  new NodeStyleIndicatorRenderer({
    nodeStyle: new ShapeNodeStyle({ shape: 'round-rectangle', fill: '#ff6c00', stroke: 'none' })
  })
)

// --- Graph Initialization ---

// Populate the graph with data from the JSON dataset and apply layout
demoApp.buildGraphFromJson(graphData)
await graphComponent.applyLayoutAnimated(new HierarchicalLayout(), 0)

// Add dropdown menu
demoApp.toolbar.addSelect(
  'Flow Direction: ',
  [
    { value: TraversalDirection.PREDECESSOR, label: 'Upstream' },
    { value: TraversalDirection.SUCCESSOR, label: 'Downstream' },
    { value: TraversalDirection.BOTH, label: 'Both Directions' },
    { value: TraversalDirection.UNDIRECTED, label: 'All Connected' }
  ],
  setFlowDirection,
  TraversalDirection.SUCCESSOR
)

demoApp.toolbar.addButton('Reset Graph', resetGraph)

function setFlowDirection(direction) {
  traversalDirection = direction
  resetGraph()
  if (graphComponent.selection.nodes.size > 0) {
    toggleNeighboursVisibility(graphComponent.selection.nodes.first(), false)
  }
}

function resetGraph() {
  // Unfilter all nodes
  for (const node of filteredGraph.wrappedGraph.nodes) {
    setTag(node, { filtered: false })
  }
  // Notify the filtered graph to re-evaluate its predicates and update the view
  filteredGraph.nodePredicateChanged()
}
