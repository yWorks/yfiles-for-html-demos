/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  type IGraph,
  LayoutMode,
  License,
  RecursiveEdgeStyle,
  Size
} from 'yfiles'

import { graphData, type GroupData } from './sample-graph'
import { initializeInteractiveHierarchicNestingLayout } from './interactive-hierarchic-nesting-layout'
import {
  applyDemoTheme,
  DemoStyleOverviewPaintable,
  initDemoStyles
} from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

let graphComponent: GraphComponent = null!

/**
 * This demo shows how to nicely expand and collapse sub-graphs organized in groups.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  // initialize the GraphComponent
  graphComponent = new GraphComponent('graphComponent')
  graphComponent.inputMode = new GraphViewerInputMode({
    focusableItems: 'none',
    selectableItems: 'none'
  })
  applyDemoTheme(graphComponent)

  // initialize Overview
  initializeOverviewComponent(graphComponent)

  // set up folding for this graph component
  initializeFolding(graphComponent)

  // set up the layout which is automatically applied when a group node is collapsed/expanded
  initializeInteractiveHierarchicNestingLayout(graphComponent)

  // import the sample
  loadSampleGraph()
}

/**
 * Initializes folding for the graph in the given graph component and configures the corresponding
 * folder node converter.
 * @param graphComponent the current graph component
 */
function initializeFolding(graphComponent: GraphComponent): void {
  const foldingManager = new FoldingManager()
  const foldingView = foldingManager.createFoldingView()
  graphComponent.graph = foldingView.graph

  // managing the appearance of folder nodes
  const defaultFolderNodeConverter = new DefaultFolderNodeConverter()
  defaultFolderNodeConverter.copyFirstLabel = true
  defaultFolderNodeConverter.folderNodeSize = new Size(110, 60)
  foldingManager.folderNodeConverter = defaultFolderNodeConverter
}

/**
 * Creates an overview component that is configured to show group nodes more prominently than usual.
 * @param graphComponent the current graph component
 */
function initializeOverviewComponent(graphComponent: GraphComponent): void {
  const overviewComponent = new GraphOverviewComponent('overviewComponent', graphComponent)
  // style the overviewComponent to make the group nodes stand out
  overviewComponent.graphVisualCreator = new DemoStyleOverviewPaintable(graphComponent.graph)
}

/**
 * Create the hierarchic layout that we will be using initially.
 * @param layoutMode whether this is for the first run or the incremental run
 */
function createHierarchicLayout(
  layoutMode: LayoutMode = LayoutMode.FROM_SCRATCH
): HierarchicLayout {
  const hierarchicLayout = new HierarchicLayout({
    recursiveGroupLayering: true,
    layoutMode: layoutMode
  })
  hierarchicLayout.edgeLayoutDescriptor.routingStyle = new HierarchicLayoutRoutingStyle(
    HierarchicLayoutEdgeRoutingStyle.ORTHOGONAL
  )
  hierarchicLayout.edgeLayoutDescriptor.recursiveEdgeStyle = RecursiveEdgeStyle.DIRECTED
  return hierarchicLayout
}

/**
 * Loads the sample graph from JSON data and applies an initial layout.
 */
function loadSampleGraph(): void {
  // use the default demo styles for the sample graph items
  initDemoStyles(graphComponent.graph, { foldingEnabled: true })

  // build the graph from the JSON data
  buildGraph(graphComponent.graph)

  // Apply an initial layout with a configuration that fits the interactive layout when
  // expanding/collapsing group nodes.
  const hierarchicLayout = createHierarchicLayout(LayoutMode.INCREMENTAL)
  graphComponent.graph.applyLayout(hierarchicLayout)

  // center the arranged graph in the visible area
  graphComponent.fitGraphBounds()
}

/**
 * Builds the graph using the JSON Data
 * After building the graph a hierarchic layout is applied.
 * @param graph the folding view
 */
function buildGraph(graph: IGraph): void {
  // use the main graph to build the unfolded graph from the data
  const foldingView = graph.foldingView!
  const mainGraph = foldingView.manager.masterGraph

  const builder = new GraphBuilder(mainGraph)
  builder.createNodesSource({
    data: graphData.nodesSource,
    id: 'id',
    parentId: 'group'
  })
  builder.createGroupNodesSource({
    data: graphData.groupsSource,
    id: 'id',
    labels: ['label'],
    parentId: 'parentGroup'
  })
  builder.createEdgesSource({
    data: graphData.edgesSource,
    sourceId: 'from',
    targetId: 'to'
  })

  builder.buildGraph()

  // no layout information available, yet
  // so we come up with an initial layout for the complete, expanded graph.
  mainGraph.applyLayout(createHierarchicLayout(LayoutMode.FROM_SCRATCH))

  // collapsing the groups whose tags are collapsed
  graph.nodes
    .filter((node) => graph.isGroupNode(node))
    .toArray()
    .forEach((node) => {
      const tag = node.tag as GroupData
      if (tag.collapsed ?? false) {
        foldingView.collapse(node)
      }
    })
}

void run().then(finishLoading)
