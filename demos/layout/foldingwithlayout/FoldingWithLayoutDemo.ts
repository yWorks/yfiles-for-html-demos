/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
  DefaultFolderNodeConverter,
  FoldingManager,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicLayout,
  HierarchicLayoutEdgeRoutingStyle,
  HierarchicLayoutRoutingStyle,
  ICommand,
  IGraph,
  LayoutMode,
  License,
  Point,
  Rect,
  RecursiveEdgeStyle,
  Size
} from 'yfiles'

import GraphData from './resources/SampleData'
import loadJson from '../../resources/load-json'
import { initDemoStyles } from '../../resources/demo-styles'
import { bindCommand, checkLicense, showApp } from '../../resources/demo-app'
import { ExpandCollapseNavigationHelper } from './ExpandCollapseNavigationHandler'

// @ts-ignore
let graphComponent: GraphComponent = null

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let helper: ExpandCollapseNavigationHelper = null

/**
 * A demo that demonstrates how to automatically trigger a layout that clears or fills the space
 * when opening or closing groups.
 */
function run(licenseData: object): void {
  License.value = licenseData

  graphComponent = new GraphComponent('graphComponent')

  initializeGraph()

  registerCommands()

  showApp(graphComponent)
}

/**
 * Initializes input modes, folding and loads a sample graph.
 */
function initializeGraph(): void {
  const inputMode = new GraphEditorInputMode()
  graphComponent.inputMode = inputMode

  // enable folding
  const foldingManager = new FoldingManager()
  const foldingView = foldingManager.createFoldingView()
  graphComponent.graph = foldingView.graph

  const navigationInputMode = inputMode.navigationInputMode
  helper = new ExpandCollapseNavigationHelper(navigationInputMode)

  // Assign the default demo styles
  initDemoStyles(graphComponent.graph)

  // managing the appearance of folder nodes
  const defaultFolderNodeConverter = new DefaultFolderNodeConverter()
  defaultFolderNodeConverter.copyFirstLabel = true
  defaultFolderNodeConverter.folderNodeSize = new Size(110, 60)
  foldingManager.folderNodeConverter = defaultFolderNodeConverter

  // read sample graph
  buildGraph(graphComponent.graph)

  graphComponent.fitGraphBounds()
}

function registerCommands(): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
}

/**
 * Creates and configures the {@link GraphBuilder}.
 * @param {IGraph} masterGraph The master graph of the {@link GraphComponent}
 * @return {GraphBuilder}
 */
function createGraphBuilder(masterGraph: IGraph): GraphBuilder {
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
 * Builds the graph using the JSON Data
 * After building the graph, a hierarchic layout is applied.
 */
function buildGraph(graph: IGraph): void {
  // Create the builder on the master graph
  const builder = createGraphBuilder(graph.foldingView!.manager.masterGraph)

  // Build the master graph from the data
  builder.buildGraph()

  // Iterate the edge data and create the according bends and Ports
  graph.edges.forEach(edge => {
    if (edge.tag.bends) {
      edge.tag.bends.forEach((bend: Point) => {
        graph.addBend(edge, Point.from(bend))
      })
    }
    graph.setPortLocation(edge.sourcePort!, Point.from(edge.tag.sourcePort))
    graph.setPortLocation(edge.targetPort!, Point.from(edge.tag.targetPort))
  })

  // collapsing the groups whose tags are collapsed
  graph.foldingView!.manager.masterGraph.nodes.toArray().forEach(node => {
    if (node.tag.collapsed) {
      graph.foldingView!.collapse(node)
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

// run the demo
loadJson().then(checkLicense).then(run)
