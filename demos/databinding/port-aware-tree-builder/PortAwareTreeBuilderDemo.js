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
  DefaultNodePlacer,
  GraphBuilderItemEventArgs,
  GraphComponent,
  GraphViewerInputMode,
  ICommand,
  IGraph,
  INode,
  InsideOutsidePortLabelModel,
  LayoutExecutor,
  License,
  PolylineEdgeStyle,
  Size,
  TreeBuilder,
  TreeLayout
} from 'yfiles'

import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import { createPortAwareTreeBuilder, setBuilderData } from './TreeBuilder.js'
import TreeData from './tree-builder-data.js'
import { fetchLicense } from '../../resources/fetch-license.js'
import { hideNodesAndRelatedItems, showNodesAndRelatedItems } from './GraphItemsHider.js'

/**
 * This demo shows how to automatically build a graph from business data using
 * a customized TreeBuilder which creates node ports based on the node data and
 * connects the edges to those ports.
 *
 * It also uses TreeBuilder's updateGraph method to modify the existing graph
 * to reflect changes in the business data.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  // Initialize graph component
  const graphComponent = new GraphComponent('graphComponent')
  setGraphDefaults(graphComponent.graph)

  // Use the viewer input mode since this demo should not allow interactive graph editing
  graphComponent.inputMode = new GraphViewerInputMode()

  // Build the graph from data
  builder = createPortAwareTreeBuilder(graphComponent.graph, TreeData.nodesSource)
  builder.buildGraph()

  // center graph in the visible area
  graphComponent.fitGraphBounds()

  // Arrange the graph using a tree layout algorithm
  await arrangeGraph(graphComponent)

  // Register toolbar commands
  registerCommands(graphComponent)

  showApp(graphComponent)
}

/** @type {TreeBuilder} */
let builder

/**
 * Updates the graph. This reflects changes in the business data while keeping the unchanged items.
 * This function uses TreeBuilder's updateGraph method to modify the existing graph
 * instead of building it anew.
 * @param {!GraphComponent} graphComponent
 * @param {!Array.<*>} nodesSource
 * @returns {!Promise}
 */
async function updateGraph(graphComponent, nodesSource) {
  const graph = graphComponent.graph

  // determine which nodes were added while updating the graph
  const newNodes = []
  const nodeCreatedListener = (sender, evt) => newNodes.push(evt.item)
  builder.addNodeCreatedListener(nodeCreatedListener)

  // update the graph according the new (but related) data
  // this will remove nodes whose IDs are not in the new data set
  // this will add nodes whose IDs are in the new data set, but not in the old one
  setBuilderData(nodesSource)
  builder.updateGraph()

  builder.removeNodeCreatedListener(nodeCreatedListener)

  // hide the new items (i.e. the new nodes, the edges connected to the new nodes, their labels
  // and their ports) during the animated layout calculation
  hideNodesAndRelatedItems(graph, newNodes)

  await arrangeGraph(graphComponent)

  // after the layout animation has finished, show the previously hidden items
  // this way new items do not seem to be affected by the layout calculation
  // otherwise, new items would appear at the default location (0,0) and then move to their
  // final location during the layout animation
  showNodesAndRelatedItems(graph, newNodes)
}

/**
 * Arranges the graph of the given graph component and applies the new layout in an animated
 * fashion.
 * @param {!GraphComponent} graphComponent
 * @returns {!Promise}
 */
async function arrangeGraph(graphComponent) {
  const algorithm = new TreeLayout({
    defaultNodePlacer: new DefaultNodePlacer({
      minimumFirstSegmentLength: 20,
      minimumLastSegmentLength: 20
    })
  })

  // arrange the graph with the chosen layout algorithm
  await new LayoutExecutor({
    graphComponent: graphComponent,
    graph: graphComponent.graph,
    layout: algorithm,
    fixPorts: true,
    animateViewport: true,
    duration: '0.5s'
  }).start()
}

/**
 * Initializes style defaults for the graph items.
 * @param {!IGraph} graph
 */
function setGraphDefaults(graph) {
  graph.nodeDefaults.size = new Size(160, 120)

  // we want to keep the ports
  graph.nodeDefaults.ports.autoCleanUp = false

  graph.nodeDefaults.ports.labels.layoutParameter = new InsideOutsidePortLabelModel({
    distance: 5
  }).createInsideParameter()

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px #662b00'
  })
}

/**
 * Registers the commands for the toolbar buttons during the creation of this application.
 * @param {!GraphComponent} graphComponent
 */
function registerCommands(graphComponent) {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)

  let index = 0
  bindAction("button[data-command='UpdateBuilder']", async () => {
    // build graph from new data
    const data = ++index % 2 === 1 ? TreeData.updateNodesSource : TreeData.nodesSource
    await updateGraph(graphComponent, data)
  })
}

// noinspection JSIgnoredPromiseFromCall
run()
