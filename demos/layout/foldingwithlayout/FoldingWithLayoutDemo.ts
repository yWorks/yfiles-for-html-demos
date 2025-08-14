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
  FolderNodeConverter,
  FoldingManager,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicalLayout,
  IGraph,
  License,
  Point,
  Size
} from '@yfiles/yfiles'

import GraphData from './resources/SampleData'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { ExpandCollapseNavigationHelper } from './ExpandCollapseNavigationHandler'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'

let graphComponent: GraphComponent = null!

/**
 * A demo that demonstrates how to automatically trigger a layout that clears or fills the space
 * when opening or closing groups.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  graphComponent = new GraphComponent('graphComponent')
  initializeGraph()
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
  new ExpandCollapseNavigationHelper(navigationInputMode)

  // Assign the default demo styles
  initDemoStyles(graphComponent.graph, { foldingEnabled: true })

  // managing the appearance of folder nodes
  foldingManager.folderNodeConverter = new FolderNodeConverter({
    folderNodeDefaults: { copyLabels: true, size: new Size(110, 60) }
  })

  // read sample graph
  buildGraph(graphComponent.graph)

  void graphComponent.fitGraphBounds()
}

/**
 * Creates and configures the {@link GraphBuilder}.
 * @param masterGraph The master graph of the {@link GraphComponent}
 */
function createGraphBuilder(masterGraph: IGraph): GraphBuilder {
  const graphBuilder = new GraphBuilder(masterGraph)
  graphBuilder.createNodesSource({
    data: GraphData.nodesSource,
    id: 'id',
    parentId: 'group',
    layout: (data) => data.layout
  })
  graphBuilder.createGroupNodesSource({
    data: GraphData.groupsSource,
    id: 'id',
    layout: (data) => data.layout,
    labels: ['label'],
    parentId: 'parentGroup'
  })
  graphBuilder.createEdgesSource(GraphData.edgesSource, 'from', 'to')

  return graphBuilder
}

/**
 * Builds the graph using the JSON Data
 * After building the graph, a hierarchical layout is applied.
 */
function buildGraph(graph: IGraph): void {
  // Create the builder on the master graph
  const builder = createGraphBuilder(graph.foldingView!.manager.masterGraph)

  // Build the master graph from the data
  builder.buildGraph()

  // Iterate the edge data and create the according bends and Ports
  graph.edges.forEach((edge) => {
    if (edge.tag.bends) {
      edge.tag.bends.forEach((bend: Point) => {
        graph.addBend(edge, bend)
      })
    }
    graph.setPortLocation(edge.sourcePort, Point.from(edge.tag.sourcePort))
    graph.setPortLocation(edge.targetPort, Point.from(edge.tag.targetPort))
  })

  // collapsing the groups whose tags are collapsed
  graph.foldingView!.manager.masterGraph.nodes.toArray().forEach((node) => {
    if (node.tag.collapsed) {
      graph.foldingView!.collapse(node)
    }
  })

  // applying  hierarchical layout with recursive edges
  const hierarchicalLayout = new HierarchicalLayout({
    fromSketchMode: true,
    defaultEdgeDescriptor: { recursiveEdgePolicy: 'directed' }
  })

  // apply a layout and move it to the top of the graph component
  graph.applyLayout(hierarchicalLayout)
}

run().then(finishLoading)
