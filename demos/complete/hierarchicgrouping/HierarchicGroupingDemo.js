/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  DefaultFolderNodeConverter,
  FoldingManager,
  GraphBuilder,
  GraphComponent,
  GraphOverviewComponent,
  GraphViewerInputMode,
  HierarchicLayout,
  HierarchicLayoutEdgeRoutingStyle,
  HierarchicLayoutRoutingStyle,
  ICommand,
  IGraph,
  IPoint,
  LayoutMode,
  License,
  Point,
  Rect,
  RecursiveEdgeStyle,
  Size
} from 'yfiles'

import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'

import GraphData from './sample-graph.js'
import HierarchicGrouping from './HierarchicGrouping.js'
import {
  applyDemoTheme,
  DemoStyleOverviewPaintable,
  initDemoStyles
} from '../../resources/demo-styles.js'
import { fetchLicense } from '../../resources/fetch-license.js'

/** @type {GraphComponent} */
let graphComponent = null

/**
 * This demo shows how to nicely expand and collapse sub-graphs organized in groups.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  // initialize the GraphComponent and GraphOverviewComponent
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  const overviewComponent = new GraphOverviewComponent('overviewComponent')
  overviewComponent.graphComponent = graphComponent

  // initialize input mode
  graphComponent.inputMode = new GraphViewerInputMode()

  // set up the HierarchicGrouping
  new HierarchicGrouping(graphComponent)

  // enable folding
  const foldingManager = new FoldingManager()
  const foldingView = foldingManager.createFoldingView()
  graphComponent.graph = foldingView.graph

  // styling the overviewComponent
  overviewComponent.graphVisualCreator = new DemoStyleOverviewPaintable(graphComponent.graph)

  // Assign the default demo styles
  initDemoStyles(graphComponent.graph, { foldingEnabled: true })

  // managing the appearance of folder nodes
  const defaultFolderNodeConverter = new DefaultFolderNodeConverter()
  defaultFolderNodeConverter.copyFirstLabel = true
  defaultFolderNodeConverter.folderNodeSize = new Size(110, 60)
  foldingManager.folderNodeConverter = defaultFolderNodeConverter

  // build the graph from the JSON data and display it at the top
  buildGraph(graphComponent.graph)
  centerAtTop()

  // register toolbar commands
  registerCommands()

  // initialize the demo
  showApp(graphComponent, overviewComponent)
}

/**
 * Builds the graph using the JSON Data
 * After building the graph, a hierarchic layout is applied.
 * @param {!IGraph} graph The folding view
 */
function buildGraph(graph) {
  // Create the builder on the master graph
  const foldingView = graph.foldingView
  const builder = createGraphBuilder(foldingView.manager.masterGraph)

  // Build the master graph from the data
  builder.buildGraph()

  // Iterate the edge data and create the according bends and Ports
  graph.edges.forEach(edge => {
    if (edge.tag.bends) {
      edge.tag.bends.forEach(bend => {
        graph.addBend(edge, Point.from(bend))
      })
    }
    graph.setPortLocation(edge.sourcePort, Point.from(edge.tag.sourcePort))
    graph.setPortLocation(edge.targetPort, Point.from(edge.tag.targetPort))
  })

  // set the location of the groups
  graph.nodes.forEach(node => {
    if (graph.isGroupNode(node)) {
      graph.setNodeLayout(node, Rect.from(node.tag.layout))
    }
  })

  // collapsing the groups whose tags are collapsed
  graph.nodes.toArray().forEach(node => {
    if (node.tag.collapsed) {
      foldingView.collapse(node)
    }
  })

  // applying  hierarchic layout with recursive edges
  const hierarchicLayout = new HierarchicLayout({
    recursiveGroupLayering: true,
    layoutMode: LayoutMode.INCREMENTAL
  })
  hierarchicLayout.edgeLayoutDescriptor.routingStyle = new HierarchicLayoutRoutingStyle(
    HierarchicLayoutEdgeRoutingStyle.ORTHOGONAL
  )
  hierarchicLayout.edgeLayoutDescriptor.recursiveEdgeStyle = RecursiveEdgeStyle.DIRECTED

  // apply a layout and move it to the top of the graph component
  graph.applyLayout(hierarchicLayout)
}

/**
 * Creates and configures the {@link GraphBuilder}.
 * @param {!IGraph} masterGraph The master graph of the {@link GraphComponent}
 * @returns {!GraphBuilder}
 */
function createGraphBuilder(masterGraph) {
  const graphBuilder = new GraphBuilder(masterGraph)
  graphBuilder.createNodesSource({
    data: GraphData.nodesSource,
    id: 'id',
    parentId: 'group',
    layout: data => Rect.from(data.layout)
  })
  graphBuilder.createGroupNodesSource({
    data: GraphData.groupsSource,
    id: 'id',
    layout: data => Rect.from(data.layout),
    labels: ['label'],
    parentId: 'parentGroup'
  })
  graphBuilder.createEdgesSource(GraphData.edgesSource, 'from', 'to')

  return graphBuilder
}

/**
 * Fits the graph into the component and moves it to the top.
 */
function centerAtTop() {
  // first fit the graph bounds
  graphComponent.fitGraphBounds()

  // then move the graph upwards
  const viewport = graphComponent.viewport
  const contentRect = graphComponent.contentRect
  graphComponent.viewPoint = new Point(viewport.x, contentRect.y - 20)
  graphComponent.invalidate()
}

/**
 * Binds the toolbar elements to commands and listeners to be able to react to interactive changes.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindAction("button[data-command='FitContent']", centerAtTop)
}

// noinspection JSIgnoredPromiseFromCall
run()
