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
import { demoApp, graphComponent } from '@yfiles/demo-app/init'
import {
  FilteredGraphWrapper,
  GraphEditorInputMode,
  GraphItemTypes,
  HierarchicalLayout
} from '@yfiles/yfiles'
import graphData from './graph-data.json'

// Predicates to determine which items to hide
const nodePredicate = (node) => !node.tag || !node.tag.filtered
const edgePredicate = (edge) => !edge.tag || !edge.tag.filtered

// A filtered Graph which wraps the original graph and applies the predicates
const filteredGraph = new FilteredGraphWrapper(graphComponent.graph, nodePredicate, edgePredicate)
// fullGraph is a reference to the original, unfiltered graph wrapped by filteredGraph
const fullGraph = filteredGraph.wrappedGraph

// Assign the filtered graph to the graph component for display
graphComponent.graph = filteredGraph

// --- UI Button Setup ---

// Add a button to filter selected items
const filterItemsButton = demoApp.toolbar.addButton('Filter Items', () => {
  // Mark the selected items such that the predicates will filter them
  for (const item of [...graphComponent.selection.nodes, ...graphComponent.selection.edges]) {
    item.tag.filtered = true
  }
  // Notify the filtered graph to re-evaluate its predicates and update the view
  filteredGraph.nodePredicateChanged()
  filteredGraph.edgePredicateChanged()
  resetFilterButton.disabled = false
})

// Add a button to reset all filters and show all items
const resetFilterButton = demoApp.toolbar.addButton('Reset Filter', () => {
  // Access the unfiltered graph to remove the filter mark from all items
  for (const item of [...fullGraph.nodes, ...fullGraph.edges]) {
    item.tag.filtered = false
  }
  // Notify the filtered graph to re-evaluate its predicates and update the view
  filteredGraph.nodePredicateChanged()
  filteredGraph.edgePredicateChanged()
  resetFilterButton.disabled = true
})
resetFilterButton.disabled = true

// Enable / Disable filter button based on the current selection
const updateFilterButtonState = () =>
  (filterItemsButton.disabled = graphComponent.selection.size === 0)
updateFilterButtonState()
// Add listeners for the current selection to enable / disable the filter button
graphComponent.selection.addEventListener('item-added', () => {
  updateFilterButtonState()
})
graphComponent.selection.addEventListener('item-removed', () => {
  updateFilterButtonState()
})

// --- Graph Initialization ---

demoApp.buildGraphFromJson(graphData)
graphComponent.inputMode = new GraphEditorInputMode({
  selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE
})
await graphComponent.applyLayoutAnimated(new HierarchicalLayout({ minimumLayerDistance: 35 }), 0)

// Make sure state tags are on all newly created items
fullGraph.addEventListener('node-created', (evt) => (evt.item.tag = { filtered: false }))
fullGraph.addEventListener('edge-created', (evt) => (evt.item.tag = { filtered: false }))
