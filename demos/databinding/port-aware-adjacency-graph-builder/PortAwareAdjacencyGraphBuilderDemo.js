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
  GraphComponent,
  GraphViewerInputMode,
  HierarchicalLayout,
  HierarchicalLayoutData,
  InsideOutsidePortLabelModel,
  InteriorNodeLabelModel,
  LayoutExecutor,
  License,
  PolylineEdgeStyle,
  PortPlacementPolicy,
  Size
} from '@yfiles/yfiles'

import { createPortAwareAdjacencyGraphBuilder, setBuilderData } from './AdjacencyGraphBuilder'
import GraphData from './graph-builder-data'
import licenseData from '../../../lib/license.json'
import { hideNodesAndRelatedItems, showNodesAndRelatedItems } from './GraphItemsHider'
import { finishLoading } from '@yfiles/demo-app/demo-page'

/**
 * This demo shows how to automatically build a graph from business data using
 * a customized AdjacencyGraphBuilder which creates node ports based on the node data and
 * connects the edges to those ports.
 *
 * It also uses AdjacencyGraphBuilder's updateGraph method to modify the existing graph
 * to reflect changes in the business data. Also, an incremental layout is applied to arrange
 * new elements while keeping the location of the unchanged items as stable as possible.
 */
async function run() {
  License.value = licenseData

  // initialize graph component
  const graphComponent = new GraphComponent('graphComponent')
  setGraphDefaults(graphComponent.graph)

  // use the viewer input mode since this demo should not allow interactive graph editing
  graphComponent.inputMode = new GraphViewerInputMode()

  // build the graph from data
  builder = createPortAwareAdjacencyGraphBuilder(graphComponent.graph, GraphData.nodesSource)
  builder.buildGraph()

  // center graph in the visible area
  void graphComponent.fitGraphBounds()

  // arrange the graph using a hierarchical layout algorithm
  await arrangeGraph(graphComponent, graphComponent.graph.nodes.toArray())

  // register toolbar actions
  initializeUI(graphComponent)
}

let builder

/**
 * Updates the graph. This reflects changes in the business data while keeping the unchanged items.
 * This function uses AdjacencyGraphBuilder's updateGraph method to modify the existing graph
 * instead of building it anew. After that, it arranges the item in incremental mode
 * which keeps the unchanged items as stable as possible.
 */
async function updateGraph(graphComponent, nodesSource) {
  const graph = graphComponent.graph

  // determine which nodes were added while updating the graph
  const newNodes = []
  const nodeCreatedListener = (evt) => newNodes.push(evt.item)
  builder.addEventListener('node-created', nodeCreatedListener)

  // update the graph according the new (but related) data
  // this will remove nodes whose IDs are not in the new data set
  // this will add nodes whose IDs are in the new data set, but not in the old one
  setBuilderData(nodesSource)
  builder.updateGraph()

  builder.removeEventListener('node-created', nodeCreatedListener)

  // hide the new items (i.e. the new nodes, the edges connected to the new nodes, their labels
  // and their ports) during the animated layout calculation
  hideNodesAndRelatedItems(graph, newNodes)

  // arrange the graph: arrange the new nodes while keeping the other nodes as stable as possible
  await arrangeGraph(graphComponent, newNodes)

  // after the layout animation has finished, show the previously hidden items
  // this way new items do not seem to be affected by the layout calculation
  // otherwise, new items would appear at the default location (0,0) and then move to their
  // final location during the layout animation
  showNodesAndRelatedItems(graph, newNodes)
}

/**
 * Arranges the graph of the given graph component and applies the new layout in an animated
 * fashion.
 */
function arrangeGraph(graphComponent, newNodes) {
  document.querySelector('#update-builder').disabled = true

  const graph = graphComponent.graph
  // if there are less new nodes than there are nodes in total, calculate an incremental layout
  // i.e., try to keep the positions of the "old" nodes while finding good positions for new nodes
  const arrangeIncrementally = newNodes.length < graph.nodes.size

  const algorithm = new HierarchicalLayout({
    layoutOrientation: 'left-to-right',
    minimumLayerDistance: 50,
    fromSketchMode: arrangeIncrementally
  })
  const eld = algorithm.defaultEdgeDescriptor
  eld.minimumFirstSegmentLength = 30
  eld.minimumLastSegmentLength = 30

  const hierarchicalLayoutData = new HierarchicalLayoutData()
  // specify which nodes are the "new" nodes in the case of an incremental layout calculation
  // i.e. for which nodes the algorithm needs to calculate layer assignment and sequence order
  // for "old" nodes, the algorithm will determine layer and sequence from their current positions
  if (arrangeIncrementally) {
    hierarchicalLayoutData.incrementalNodes = newNodes
  }

  // arrange the graph with the chosen layout algorithm
  return new LayoutExecutor({
    graphComponent: graphComponent,
    graph: graph,
    layout: algorithm,
    layoutData: hierarchicalLayoutData,
    portPlacementPolicies: PortPlacementPolicy.KEEP_PARAMETER,
    animateViewport: true,
    animationDuration: '0.5s'
  })
    .start()
    .finally(() => {
      document.querySelector('#update-builder').disabled = false
    })
}

/**
 * Initializes style defaults for the graph items.
 */
function setGraphDefaults(graph) {
  graph.nodeDefaults.size = new Size(100, 160)
  graph.nodeDefaults.labels.layoutParameter = new InteriorNodeLabelModel({
    padding: 5
  }).createParameter('bottom')
  graph.nodeDefaults.labels.shareLayoutParameterInstance = true

  // we want to keep the ports
  graph.nodeDefaults.ports.autoCleanUp = false

  graph.nodeDefaults.ports.labels.layoutParameter = new InsideOutsidePortLabelModel({
    distance: 5
  }).createInsideParameter()

  graph.edgeDefaults.style = new PolylineEdgeStyle({ stroke: '2px #662b00' })
}

/**
 * Binds the toolbar buttons to their functionality.
 */
function initializeUI(graphComponent) {
  let index = 0
  document.querySelector('#update-builder').addEventListener('click', async () => {
    // build graph from new data
    const data = ++index % 2 === 1 ? GraphData.updateNodesSource : GraphData.nodesSource
    await updateGraph(graphComponent, data)
  })
}

run().then(finishLoading)
